import math
from typing import Tuple, List, Optional

def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate geodesic distance between two points on the Earth (specified in decimal degrees)
    using the Haversine formula. Returns distance in meters.
    """
    # Earth radius in meters
    R = 6371000.0

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2)
    
    # Numerical stability safeguard
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(max(0.0, 1.0 - a)))
    return R * c

def find_nearest_facility(lat: float, lon: float, facilities: list, max_radius_m: float = 5000.0) -> Tuple[Optional[object], Optional[float]]:
    """
    Find the closest facility within max_radius_m.
    Returns (facility_object, distance_meters).
    """
    if not facilities:
        return None, None

    nearest_facility = None
    min_dist = float('inf')

    for fac in facilities:
        dist = haversine_distance_meters(lat, lon, fac.latitude, fac.longitude)
        if dist < min_dist:
            min_dist = dist
            nearest_facility = fac

    if nearest_facility and min_dist <= max_radius_m:
        return nearest_facility, min_dist
    return None, None
