import pytest
from app.ml.feature_engineering import extract_features
from app.ml.predictor import AnomalyClassifier
from app.services.risk_engine import RiskEngine

def test_feature_extraction():
    sample_det = {
        'id': 'TEST-01',
        'frp': 65.0,
        'confidence': 90.0,
        'brightness': 340.0,
        'daynight': 'N',
        'source': 'VIIRS_NOAA21_NRT',
        'distanceToFacilityM': 350.0,
        'persistenceDays': 4,
        'isPersistent': True,
        'landCoverClass': 'INDUSTRIAL_BUILTUP'
    }
    feats = extract_features(sample_det)
    assert len(feats) == 9
    assert feats[0] == 65.0  # frp
    assert feats[1] == 90.0  # confidence
    assert feats[2] == 340.0 # brightness
    assert feats[3] == 1.0   # is_night
    assert feats[4] == 350.0 # distance
    assert feats[5] == 4.0   # persistence_days
    assert feats[6] == 1.0   # is_persistent

def test_rule_based_fallback_classification():
    # Flare stack case: persistent, close to facility, high confidence
    flare_det = {
        'frp': 75.0,
        'confidence': 92.0,
        'brightness': 345.0,
        'daynight': 'N',
        'source': 'VIIRS_NOAA21_NRT',
        'distanceToFacilityM': 250.0,
        'persistenceDays': 4,
        'isPersistent': True,
        'landCoverClass': 'INDUSTRIAL_BUILTUP'
    }
    cls_name, conf, reasons = AnomalyClassifier._rule_based_screen(flare_det)
    assert cls_name == 'FLARE_STACK_PERSISTENT'
    assert conf >= 0.85
    assert len(reasons) > 0

    # Wildfire case: far from facility, tree cover
    wildfire_det = {
        'frp': 40.0,
        'confidence': 85.0,
        'brightness': 330.0,
        'daynight': 'D',
        'source': 'VIIRS_NOAA21_NRT',
        'distanceToFacilityM': 8500.0,
        'persistenceDays': 1,
        'isPersistent': False,
        'landCoverClass': 'TREE_COVER'
    }
    cls_name2, conf2, reasons2 = AnomalyClassifier._rule_based_screen(wildfire_det)
    assert cls_name2 == 'NATURAL_WILDFIRE_VEGETATION'
    assert conf2 >= 0.80

def test_risk_engine_bounds():
    score, lvl = RiskEngine.calculate_risk(
        frp=120.0,
        confidence=95.0,
        distance_to_facility_m=150.0,
        is_persistent=True,
        persistence_days=5,
        daynight='N'
    )
    assert 0 <= score <= 100
    assert lvl in ['CRITICAL', 'HIGH', 'MODERATE', 'LOW']
    assert score >= 70  # Extreme proximity + high FRP + persistence should yield high/critical risk
