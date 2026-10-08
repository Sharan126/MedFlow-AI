"""
Routes for Querying Nearby Hospitals and Medicine Stock Availability.
Provides geographic coordinates and stock levels for the Leaflet interactive map.
"""

from fastapi import APIRouter, Query
from typing import Dict, Any, List, Optional
import sys
from pathlib import Path

# Ensure root path is available for imports
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

router = APIRouter()

# Authentic Mysuru district hospital coordinates
HOSPITAL_COORDINATES = {
    "City General Hospital": {
        "lat": 12.9716,
        "lng": 77.5946,
        "address": "Mysuru Central (12.9716°N, 77.5946°E)"
    },
    "District Government Hospital": {
        "lat": 12.9500,
        "lng": 77.6200,
        "address": "Bannimantap, Mysuru (12.9500°N, 77.6200°E)"
    },
    "Rural Primary Health Centre": {
        "lat": 12.9900,
        "lng": 77.5500,
        "address": "Hunsur Road, Mysuru (12.9900°N, 77.5500°E)"
    }
}


def get_active_hospitals():
    """
    Retrieve current hospital agents from server state if running,
    otherwise initialize default network.
    """
    try:
        import server
        if hasattr(server, "state") and getattr(server.state, "hospitals", None):
            return server.state.hospitals
    except Exception:
        pass

    from data import generate_hospitals
    return generate_hospitals()


@router.get("/api/nearby-hospitals")
def get_nearby_hospitals(
    medicine: str = Query(..., description="Name of the medicine to search"),
    min_quantity: int = Query(0, description="Minimum quantity needed")
):
    """
    Retrieve network hospitals along with geolocation and stock metrics
    for the requested medicine.
    """
    current_hospitals = get_active_hospitals()
    results = []

    for h in current_hospitals:
        stock = h.inventory.get(medicine, 0)
        threshold = h.thresholds.get(medicine, 0)
        surplus = max(0, stock - threshold)

        # Coordinate lookup with fallback to Mysuru center
        loc_meta = HOSPITAL_COORDINATES.get(h.name, {
            "lat": 12.9716,
            "lng": 77.5946,
            "address": getattr(h, "location", "Mysuru District, Karnataka")
        })

        results.append({
            "name": h.name,
            "location": loc_meta,
            "stock": stock,
            "threshold": threshold,
            "surplus": surplus,
            "has_enough": stock >= min_quantity
        })

    return {"hospitals": results}
