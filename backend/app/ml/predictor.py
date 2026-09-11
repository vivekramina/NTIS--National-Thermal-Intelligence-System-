import os
import json
import logging
import numpy as np
from pathlib import Path
from typing import Dict, Any, Tuple, List
from .feature_engineering import extract_features_from_detection
from .explainability import generate_classification_explanation

logger = logging.getLogger('thermal_watch.ml')

CLASSES = [
    'POTENTIAL_INDUSTRIAL_FIRE',
    'PERSISTENT_INDUSTRIAL_THERMAL_SOURCE',
    'POSSIBLE_VEGETATION_FIRE',
    'MINING_THERMAL_SOURCE',
    'GAS_FLARE_OR_STATIC_INDUSTRIAL_SOURCE',
    'OTHER_THERMAL_ANOMALY',
    'UNCLASSIFIED'
]

class AnomalyClassifier:
    """
    Classifies thermal anomalies into industrial, persistent, or vegetation categories.
    Implements trained scikit-learn model loading with transparent fallback to contextual screening.
    """
    _model = None
    _metadata = None

    @classmethod
    def get_model_status(cls) -> Dict[str, Any]:
        cls._load_model_if_available()
        if cls._model is not None and cls._metadata is not None:
            return {
                'status': 'trained_model_active',
                'modelType': 'RandomForestClassifier',
                'metadata': cls._metadata,
                'mode': 'Machine Learning Production Model'
            }
        return {
            'status': 'prototype_screening',
            'modelType': 'Contextual Rule-Based Screening Engine',
            'mode': 'Prototype screening / Awaiting validated training dataset',
            'notice': 'Classification driven by geospatial proximity, persistence window, FRP, and day/night parameters.'
        }

    @classmethod
    def load_model(cls):
        cls._load_model_if_available()

    @classmethod
    def is_model_loaded(cls) -> bool:
        cls._load_model_if_available()
        return cls._model is not None

    @classmethod
    def _load_model_if_available(cls):
        if cls._model is not None:
            return
        model_path = Path(__file__).resolve().parent / 'trained_model.joblib'
        meta_path = Path(__file__).resolve().parent / 'model_metadata.json'

        if model_path.exists() and meta_path.exists():
            try:
                import joblib
                cls._model = joblib.load(model_path)
                with open(meta_path, 'r') as f:
                    cls._metadata = json.load(f)
                logger.info('Loaded trained Random Forest model successfully.')
            except Exception as e:
                logger.warning(f'Could not load ML model file: {e}')

    @classmethod
    def _rule_based_screen(cls, detection_dict: Dict[str, Any]) -> Tuple[str, float, List[str]]:
        dist = detection_dict.get('distanceToFacilityM')
        frp = float(detection_dict.get('frp', 0.0))
        persistence_days = int(detection_dict.get('persistenceDays', 0))
        is_persistent = bool(detection_dict.get('isPersistent'))
        confidence = float(detection_dict.get('confidence', 70.0))
        daynight = detection_dict.get('daynight', 'N')
        lc_class = detection_dict.get('landCoverClass', '')

        if is_persistent or persistence_days >= 3:
            if dist is not None and dist <= 1500:
                label = 'FLARE_STACK_PERSISTENT'
                prob = min(96.0, 80.0 + (persistence_days * 3))
            else:
                label = 'FLARE_STACK_PERSISTENT' if frp > 50 else 'OTHER_THERMAL_ANOMALY'
                prob = 78.0
        elif dist is not None and dist <= 500:
            if frp >= 40.0:
                label = 'HIGH_CONFIDENCE_INDUSTRIAL_FIRE'
                prob = 88.0
            else:
                label = 'FLARE_STACK_PERSISTENT' if daynight == 'N' else 'HIGH_CONFIDENCE_INDUSTRIAL_FIRE'
                prob = 75.0
        elif dist is not None and dist <= 1500:
            if frp >= 50.0:
                label = 'HIGH_CONFIDENCE_INDUSTRIAL_FIRE'
                prob = 76.0
            else:
                label = 'OTHER_THERMAL_ANOMALY'
                prob = 68.0
        elif (dist is not None and dist > 3500) or 'TREE' in lc_class.upper() or 'VEGETATION' in lc_class.upper():
            label = 'NATURAL_WILDFIRE_VEGETATION'
            prob = 82.0 if frp < 60 else 70.0
        else:
            label = 'UNVERIFIED_THERMAL_ANOMALY'
            prob = 65.0

        reasons = generate_classification_explanation(label, prob, detection_dict)
        return label, prob, reasons

    @classmethod
    def classify(cls, detection_dict: Dict[str, Any]) -> Tuple[str, float, List[str]]:
        """
        Classify detection.
        Returns: (classification_label, confidence_percentage, list_of_evidence_reasons)
        """
        cls._load_model_if_available()

        # If trained model exists, use feature vector prediction
        if cls._model is not None:
            try:
                vec = extract_features_from_detection(detection_dict).reshape(1, -1)
                pred = cls._model.predict(vec)[0]
                proba = float(np.max(cls._model.predict_proba(vec)[0])) * 100.0
                if isinstance(pred, str):
                    label = pred
                elif isinstance(pred, (int, np.integer)):
                    label = CLASSES[pred] if pred < len(CLASSES) else 'OTHER_THERMAL_ANOMALY'
                else:
                    label = str(pred)
                reasons = generate_classification_explanation(label, proba, detection_dict)
                return label, proba, reasons
            except Exception as e:
                logger.warning(f'Model prediction error, falling back to contextual screening: {e}')

        return cls._rule_based_screen(detection_dict)
