"""
Routes for Inter-Hospital Medicine Requests.
Enables administrators to request essential medicines from nearby hospitals.
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from datetime import datetime
import sys
from pathlib import Path

# Ensure root path is available for imports
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

router = APIRouter()

# Global in-memory request log
request_log: List[Dict[str, Any]] = []


@router.post("/api/request-medicine")
def request_medicine(payload: dict):
    """
    Handle medicine requisition from one hospital to another.
    """
    from_hospital = payload.get("from_hospital", "City General Hospital")
    to_hospital = payload.get("to_hospital")
    medicine = payload.get("medicine")
    quantity = payload.get("quantity")
    timestamp = payload.get("timestamp") or datetime.now().isoformat()

    if not to_hospital or not medicine or quantity is None:
        raise HTTPException(
            status_code=400, 
            detail="Missing required fields: to_hospital, medicine, and quantity are required."
        )

    # Convert quantity to int safely
    try:
        quantity = int(quantity)
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail="Quantity must be a valid integer.")

    # Generate an intelligent message via Gemini if available
    req_message = f"Urgent Requisition: {from_hospital} requests {quantity} units of {medicine} from {to_hospital}."
    try:
        from llm_client import ask_gemini
        gemini_prompt = (
            f"You are the hospital coordinator at {from_hospital}. "
            f"Write a 1-sentence urgent, courteous inter-hospital requisition to {to_hospital} "
            f"for {quantity} units of {medicine} for patient care."
        )
        ai_resp = ask_gemini(gemini_prompt, temperature=0.3)
        if isinstance(ai_resp, dict) and "message" in ai_resp:
            req_message = ai_resp["message"]
        elif isinstance(ai_resp, str) and ai_resp.strip():
            req_message = ai_resp.strip()
    except Exception:
        # Graceful fallback without failing the core request
        pass

    entry = {
        "id": len(request_log) + 1,
        "from": from_hospital,
        "to": to_hospital,
        "medicine": medicine,
        "quantity": quantity,
        "timestamp": timestamp,
        "status": "PENDING",
        "message": req_message
    }

    # Append to in-memory request log
    request_log.append(entry)

    # Also log to server event stream if server state is available
    try:
        import server
        if hasattr(server, "state") and hasattr(server.state, "events"):
            server.state.events.append({
                "step": len(server.state.events) + 1,
                "timestamp": datetime.now().strftime("%H:%M:%S"),
                "agent": from_hospital,
                "type": "requisition",
                "message": f"🗺️ Requisition sent to {to_hospital}: {quantity} units of {medicine}",
                "reasoning": req_message,
                "target": to_hospital
            })
    except Exception:
        pass

    return {
        "success": True, 
        "message": f"Request sent successfully to {to_hospital}",
        "request": entry
    }


@router.get("/api/medicine-requests")
def get_medicine_requests():
    """
    Retrieve all logged inter-hospital medicine requests.
    """
    return {
        "requests": list(reversed(request_log)),
        "total": len(request_log),
        "pending_count": sum(1 for r in request_log if r.get("status") == "PENDING")
    }


@router.post("/api/medicine-requests/{request_id}/status")
def update_request_status(request_id: int, payload: dict):
    """
    Update request status (ACCEPTED, REJECTED, PENDING).
    """
    new_status = payload.get("status", "PENDING").upper()
    if new_status not in ["PENDING", "ACCEPTED", "REJECTED"]:
        raise HTTPException(status_code=400, detail="Invalid status. Must be PENDING, ACCEPTED, or REJECTED.")

    for req in request_log:
        if req.get("id") == request_id:
            req["status"] = new_status
            return {"success": True, "request": req}

    raise HTTPException(status_code=404, detail=f"Request #{request_id} not found.")
