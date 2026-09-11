from typing import Tuple

class RiskEngine:
    """
    Computes composite hazard risk score (0-100) and discrete risk level.
    Strictly distinct from classification probability.
    """
    @classmethod
    def calculate_risk(
        cls,
        frp: float,
        confidence: float,
        distance_to_facility_m: float = None,
        is_persistent: bool = False,
        persistence_days: int = 0,
        daynight: str = 'N'
    ) -> Tuple[float, str]:
        score = 0.0

        # 1. Fire Radiative Power contribution (0-35 pts)
        frp_val = max(0.0, frp)
        if frp_val >= 100:
            score += 35.0
        elif frp_val >= 50:
            score += 25.0 + ((frp_val - 50) / 50.0) * 10.0
        elif frp_val >= 20:
            score += 15.0 + ((frp_val - 20) / 30.0) * 10.0
        else:
            score += (frp_val / 20.0) * 15.0

        # 2. Industrial proximity contribution (0-30 pts)
        if distance_to_facility_m is not None:
            if distance_to_facility_m <= 300:
                score += 30.0
            elif distance_to_facility_m <= 1000:
                score += 20.0 + (1.0 - (distance_to_facility_m - 300) / 700.0) * 10.0
            elif distance_to_facility_m <= 3000:
                score += 10.0 + (1.0 - (distance_to_facility_m - 1000) / 2000.0) * 10.0
            else:
                score += 2.0
        else:
            score += 5.0

        # 3. Persistence contribution (0-20 pts)
        if is_persistent or persistence_days >= 3:
            score += min(20.0, 12.0 + (persistence_days * 2.0))
        elif persistence_days == 2:
            score += 8.0
        else:
            score += 2.0

        # 4. Sensor confidence contribution (0-10 pts)
        conf_val = max(0.0, min(100.0, confidence))
        score += (conf_val / 100.0) * 10.0

        # 5. Night anomaly bonus (0-5 pts - unmitigated nocturnal combustion)
        if daynight == 'N':
            score += 5.0

        score = max(0.0, min(100.0, round(score, 1)))

        # Categorize
        if score >= 75.0:
            level = 'CRITICAL'
        elif score >= 50.0:
            level = 'HIGH'
        elif score >= 25.0:
            level = 'MODERATE'
        else:
            level = 'LOW'

        return score, level
