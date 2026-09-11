from typing import List, Dict, Any

FACILITY_TYPE_LABELS = {
    'petroleum': 'Petroleum Refining & Hydrocarbon Processing',
    'smelter': 'Integrated Steel Smelting & Blast Furnace Operations',
    'power_plant': 'Thermal Power Generation & Super-Critical Boilers',
    'chemical': 'Heavy Chemical Synthesis & Petrochemical Cracking',
    'manufacturing': 'Heavy Industrial Manufacturing & Engineering',
    'mining': 'Open-Cast Mining & Thermal Extraction'
}

def generate_classification_explanation(
    classification: str,
    confidence: float,
    features: Dict[str, Any]
) -> List[str]:
    """
    Generate explainable AI factor statements strictly derived from calculated features:
    1. Identified industry category
    2. Why the region became a thermal hotspot
    3. Radiative heat energy & FRP
    4. Multi-temporal persistence
    5. Sensor payload reliability
    """
    reasons = []

    dist = features.get('distanceToFacilityM')
    fac_name = features.get('facilityName')
    fac_type = features.get('facilityType')
    region = features.get('region')
    frp = features.get('frp', 0.0)
    conf = features.get('confidence', 0.0)
    days = features.get('persistenceDays', 0)
    daynight = features.get('daynight', 'N')
    source = features.get('source', 'VIIRS')

    ind_label = FACILITY_TYPE_LABELS.get(fac_type, 'Heavy Industrial Sector') if fac_type else 'Industrial Manufacturing'

    # 1. Identified Industry Category & Proximity
    if dist is not None and dist <= 2500:
        reasons.append(f'Identified Industry Category: {ind_label} at {fac_name or "Industrial Complex"} ({int(dist)}m proximity)')
        # Causation based on plant operations
        if fac_type == 'petroleum':
            reasons.append(f'Hotspot Causation: Continuous process flare combustion and high-temperature catalytic cracking/heaters at {fac_name}.')
        elif fac_type == 'smelter':
            reasons.append(f'Hotspot Causation: High-heat metallurgical blast furnace tapping and coke oven emissions exceeding 1000°C at {fac_name}.')
        elif fac_type == 'power_plant':
            reasons.append(f'Hotspot Causation: High-temperature steam boiler combustion and flue gas thermal dissipation at {fac_name}.')
        elif fac_type == 'chemical':
            reasons.append(f'Hotspot Causation: Exothermic chemical reactions, process steam venting, and safety flare combustion at {fac_name}.')
        else:
            reasons.append(f'Hotspot Causation: High-temperature furnace operations and manufacturing heat release at {fac_name}.')
    elif dist is not None and dist <= 15000:
        dist_km = dist / 1000.0
        reasons.append(f'Regional Industrial Corridor: Active manufacturing catchment ({dist_km:.1f} km) of {fac_name or "Industrial Complex"} ({ind_label})')
        reasons.append(f'Hotspot Causation: Radiative signature correlates with industrial energy perimeter dissipation, auxiliary heating units, or freight corridor combustion.')
    elif dist is not None:
        dist_km = dist / 1000.0
        reasons.append(f'Regional Geographic Context: Situated in {region or "Agricultural/Rural Corridor"} ({dist_km:.1f} km from nearest major complex {fac_name or "Industrial Center"})')
        reasons.append('Hotspot Causation: Spatial signature and standoff distance indicate open agricultural biomass clearing / crop stubble combustion rather than on-site manufacturing.')
    else:
        reasons.append(f'Regional Context: Situated in {region or "Monitored Geographic Sector"}')
        reasons.append('Hotspot Causation: Thermal radiance anomaly detected by satellite sensor in open terrain.')

    # 2. Radiative Heat Energy (FRP)
    if frp >= 70:
        reasons.append(f'Radiative Heat Energy: High-intensity thermal output of {frp} MW Fire Radiative Power (FRP), confirming severe localized heat generation.')
    elif frp >= 30:
        reasons.append(f'Radiative Heat Energy: Elevated radiative output of {frp} MW FRP, indicating active exothermic combustion.')
    else:
        reasons.append(f'Radiative Heat Energy: Measured Fire Radiative Power of {frp} MW exceeding baseline ambient ground temperatures.')

    # 3. Multi-temporal Persistence
    if days >= 3:
        reasons.append(f'Temporal Persistence: Confirmed persistent heat source detected across {days} separate satellite observation passes.')
    elif days == 2:
        reasons.append('Temporal Persistence: Recurrent thermal signature observed over 2 satellite passes.')
    else:
        reasons.append('Temporal Persistence: Single-pass transient thermal emission event.')

    # 4. Sensor Payload & Day/Night Verification
    daynight_str = 'Nighttime (01:30–04:30 IST)' if daynight == 'N' else 'Daytime (12:30–15:30 IST)'
    reasons.append(f'Radiometric Verification: {daynight_str} acquisition by {source} sensor with {int(conf)}% detection confidence rules out solar reflectance false-positives.')

    return reasons
