import math
from pydantic import BaseModel

class RouteRequest(BaseModel):
    start_lat: float
    start_lng: float
    end_lat: float
    end_lng: float

def calculate_distance(lat1, lon1, lat2, lon2):
    """Haversine formula for distance in kilometers."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def compute_rescue_route(req: RouteRequest) -> dict:
    distance_km = calculate_distance(req.start_lat, req.start_lng, req.end_lat, req.end_lng)
    
    # Recommend transport mode based on distance
    if distance_km > 5.0:
        transport_mode = "Air Evac (Helicopter)"
        eta_minutes = round((distance_km / 120.0) * 60 + 3, 1) # ~120 km/h + 3 min prep
    elif distance_km > 1.5:
        transport_mode = "Rescue Boat"
        eta_minutes = round((distance_km / 25.0) * 60 + 2, 1) # ~25 km/h
    else:
        transport_mode = "Foot Patrol / Amphibious"
        eta_minutes = round((distance_km / 5.0) * 60 + 1, 1) # ~5 km/h

    return {
        "distance_km": round(distance_km, 2),
        "recommended_mode": transport_mode,
        "estimated_eta_min": eta_minutes,
        "waypoints": [
            {"lat": req.start_lat, "lng": req.start_lng},
            {"lat": (req.start_lat + req.end_lat) / 2, "lng": (req.start_lng + req.end_lng) / 2},
            {"lat": req.end_lat, "lng": req.end_lng}
        ]
    }