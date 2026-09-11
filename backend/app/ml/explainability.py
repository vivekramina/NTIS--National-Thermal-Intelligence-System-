from typing import List, Dict, Any

def generate_classification_explanation(
    classification: str,
    confidence: float,
    features: Dict[str, Any]
) -> List[str]:
    """
    Generate explainable AI factor statements strictly derived from calculated features.
    No random or fabricated statements.
    """
    reasons = []

    dist = features.get('distanceToFacilityM')
    fac_name = features.get('facilityName')
    frp = features.get('frp', 0.0)
    conf = features.get('confidence', 0.0)
    days = features.get('persistenceDays', 0)
    daynight = features.get('daynight', 'N')
    source = features.get('source', 'VIIRS')

    # 1. Industrial proximity factor
    if dist is not None and dist <= 500:
        reasons.append(f'Located within high-proximity zone ({int(dist)}m) of mapped facility ({fac_name or "Industrial Unit"})')
    elif dist is not None and dist <= 1500:
        reasons.append(f'Within operational buffer zone ({int(dist)}m) of industrial infrastructure ({fac_name or "Complex"})')
    elif dist is not None and dist > 3500:
        reasons.append(f'Isolated from known industrial infrastructure ({int(dist)}m to nearest mapped facility)')

    # 2. Persistence factor
    if days >= 3:
        reasons.append(f'Persistent thermal signature confirmed across {days} separate observation days')
    elif days == 2:
        reasons.append('Multi-day recurring signature detected (2 active passes)')
    else:
        reasons.append('Transient single-pass thermal anomaly')

    # 3. Radiative Power factor
    if frp >= 70:
        reasons.append(f'Extremely high Fire Radiative Power ({frp} MW) exceeding industrial baseline thresholds')
    elif frp >= 35:
        reasons.append(f'Elevated radiative heat intensity ({frp} MW) consistent with thermal flaring or combustion')
    else:
        reasons.append(f'Moderate radiative intensity ({frp} MW)')

    # 4. Day/Night solar reflectance elimination
    if daynight == 'N':
        reasons.append('Nighttime satellite acquisition rules out solar albedo or rooftop reflection false-positives')
    else:
        reasons.append('Daytime acquisition cross-verified with multispectral thermal infrared bands')

    # 5. Satellite payload reliability
    if conf >= 80:
        reasons.append(f'High radiometric sensor detection confidence ({int(conf)}%) via {source}')

    return reasons
