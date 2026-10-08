"""
Routes for Inter-Hospital Medicine Requests.
Enables administrators to request essential medicines from nearby hospitals via interactive map.
Supports full manual requisition approval with inventory transfer and audit logging.
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

from state import state

router = APIRouter()


@router.post("/api/request-medicine")
def request_medicine(payload: dict):
    """
    Handle manual medicine requisition from one hospital to another.
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
    req_message = f"Urgent Emergency Requisition: {from_hospital} requests {quantity} units of {medicine} from {to_hospital}."
    try:
        from llm_client import ask_gemini
        gemini_prompt = (
            f"You are the hospital coordinator at {from_hospital}. "
            f"Write a 1-sentence urgent, courteous inter-hospital requisition to {to_hospital} "
            f"for {quantity} units of {medicine} for emergency patient care."
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
        "id": len(state.medicine_requests) + 1,
        "from": from_hospital,
        "to": to_hospital,
        "medicine": medicine,
        "quantity": quantity,
        "timestamp": timestamp,
        "status": "PENDING",
        "message": req_message
    }

    # Append to state request log
    state.medicine_requests.append(entry)

    # Also log to server event stream
    state.events.append({
        "step": len(state.events) + 1,
        "timestamp": datetime.now().strftime("%H:%M:%S"),
        "agent": from_hospital,
        "type": "requisition",
        "message": f"🗺️ Emergency Requisition dispatched to {to_hospital}: {quantity} units of {medicine}",
        "reasoning": req_message,
        "target": to_hospital
    })

    return {
        "success": True, 
        "message": f"Requisition sent successfully to {to_hospital}",
        "request": entry
    }


@router.get("/api/medicine-requests")
def get_medicine_requests():
    """
    Retrieve all logged inter-hospital medicine requests.
    """
    requests = state.medicine_requests
    return {
        "requests": list(reversed(requests)),
        "total": len(requests),
        "pending_count": sum(1 for r in requests if r.get("status") == "PENDING")
    }


@router.post("/api/medicine-requests/{request_id}/status")
def update_request_status(request_id: int, payload: dict):
    """
    Update request status (ACCEPTED, REJECTED, PENDING).
    If ACCEPTED, execute the inventory transfer and log to audit history.
    """
    new_status = payload.get("status", "PENDING").upper()
    if new_status not in ["PENDING", "ACCEPTED", "REJECTED"]:
        raise HTTPException(status_code=400, detail="Invalid status. Must be PENDING, ACCEPTED, or REJECTED.")

    target_req = None
    for req in state.medicine_requests:
        if req.get("id") == request_id:
            target_req = req
            break

    if not target_req:
        raise HTTPException(status_code=404, detail=f"Request #{request_id} not found.")

    target_req["status"] = new_status

    # If ACCEPTED, transfer inventory and record in immutable audit ledger
    if new_status == "ACCEPTED":
        from_name = target_req.get("from")
        to_name = target_req.get("to")
        med = target_req.get("medicine")
        qty = target_req.get("quantity", 0)

        donor = next((h for h in state.hospitals if h.name == to_name), None)
        receiver = next((h for h in state.hospitals if h.name == from_name), None)

        actual_qty = qty
        if donor and receiver and med:
            avail = donor.inventory.get(med, 0)
            actual_qty = min(qty, avail) if avail > 0 else qty

            # Mutate inventories
            donor.inventory[med] = max(0, donor.inventory.get(med, 0) - actual_qty)
            receiver.inventory[med] = receiver.inventory.get(med, 0) + actual_qty

        # Log to trade history
        trade_record = {
            "trade_id": len(state.trade_history) + 1,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "donor": to_name,
            "receiver": from_name,
            "medicines": {med: actual_qty},
            "counter_medicines": {},
            "explanation": f"Manual Emergency Override via Map: Approved requisition for {actual_qty} units of {med}. {target_req.get('message', '')}",
            "status": "APPROVED",
            "type": "MANUAL_REQUISITION"
        }
        state.trade_history.append(trade_record)

        # Log event
        state.events.append({
            "step": len(state.events) + 1,
            "timestamp": datetime.now().strftime("%H:%M:%S"),
            "agent": "Administrator",
            "type": "approval",
            "message": f"✅ Emergency Map Requisition APPROVED: {actual_qty} units of {med} transferred from {to_name} to {from_name}.",
            "reasoning": f"Manual verification confirmed emergency supply requisition #{request_id}.",
            "target": "Network"
        })

    elif new_status == "REJECTED":
        trade_record = {
            "trade_id": len(state.trade_history) + 1,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "donor": target_req.get("to"),
            "receiver": target_req.get("from"),
            "medicines": {target_req.get("medicine"): target_req.get("quantity", 0)},
            "counter_medicines": {},
            "explanation": f"Manual Emergency Requisition #{request_id} REJECTED by administrator.",
            "status": "REJECTED",
            "type": "MANUAL_REQUISITION"
        }
        state.trade_history.append(trade_record)

        state.events.append({
            "step": len(state.events) + 1,
            "timestamp": datetime.now().strftime("%H:%M:%S"),
            "agent": "Administrator",
            "type": "rejection",
            "message": f"❌ Emergency Map Requisition #{request_id} REJECTED by administrator.",
            "reasoning": "Requisition denied; hospital inventories remain unchanged.",
            "target": "Network"
        })

    return {
        "success": True, 
        "message": f"Requisition status updated to {new_status}.",
        "request": target_req
    }
