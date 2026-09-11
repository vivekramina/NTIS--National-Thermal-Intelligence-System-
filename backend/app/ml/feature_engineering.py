import numpy as np
from typing import Dict, Any, List

FEATURE_NAMES = [
    'frp',
    'confidence',
    'brightness',
    'is_night',
    'distance_to_industrial_m',
    'persistence_days',
    'is_persistent',
    'land_cover_industrial_weight',
    'land_cover_vegetation_weight'
]

def extract_features_from_detection(detection_dict: Dict[str, Any]) -> np.ndarray:
    """
    Transform a normalized detection record into a standardized ML feature vector.
    """
    frp = float(detection_dict.get('frp', 15.0))
    conf = float(detection_dict.get('confidence', 70.0))
    brightness = float(detection_dict.get('brightness', 320.0))
    is_night = 1.0 if detection_dict.get('daynight', 'N') == 'N' else 0.0

    dist = detection_dict.get('distanceToFacilityM')
    if dist is None:
        dist = 5000.0
    dist = float(dist)

    persistence_days = float(detection_dict.get('persistenceDays', 0))
    is_persistent = 1.0 if detection_dict.get('isPersistent') else 0.0

    # Land cover context weights
    lc_class = detection_dict.get('landCoverClass', 'unknown')
    lc_ind = 1.0 if lc_class == 'industrial_area' else (0.4 if dist < 1500 else 0.0)
    lc_veg = 1.0 if 'vegetation' in lc_class or 'forest' in lc_class else (0.1 if dist > 3000 else 0.0)

    vector = [
        frp,
        conf,
        brightness,
        is_night,
        dist,
        persistence_days,
        is_persistent,
        lc_ind,
        lc_veg
    ]

    return np.array(vector, dtype=float)

# Alias for backward compatibility
extract_features = extract_features_from_detection
