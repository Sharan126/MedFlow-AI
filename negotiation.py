"""
MedFlow-AI Negotiation Orchestrator
Coordinates multi-agent negotiations between hospitals.
Produces a pending trade for human verification - NEVER auto-executes.
"""

from datetime import datetime
from typing import Optional
from agents import HospitalAgent


def run_negotiation(agents: list[HospitalAgent], max_rounds: int = 2) -> dict:
    """
    Orchestrate multi-round negotiation between hospital agents.

    Args:
        agents: List of HospitalAgent objects
        max_rounds: Maximum negotiation rounds (default: 2)

    Returns:
        {
            "events": [
                {
                    "step": int,
                    "timestamp": "HH:MM:SS",
                    "agent": "Hospital Name",
                    "type": "request"|"response"|"accept"|"counter"|"reject",
                    "message": str,
                    "reasoning": str,
                    "target": str
                }
            ],
            "pending_trade": {
                "donor": str,
                "donor_location": str,
                "receiver": str,
                "receiver_location": str,
                "medicines": dict,
                "counter_medicines": dict,
                "explanation": str,
                "status": "AWAITING_HUMAN_APPROVAL"
            } or None
        }
    """

    events = []
    step_counter = 0

    def log_event(agent_name: str, event_type: str, message: str,
                  reasoning: str = "", target: str = "Network") -> None:
        """Helper to log negotiation events with timestamps."""
        nonlocal step_counter
        step_counter += 1

        events.append({
            "step": step_counter,
            "timestamp": datetime.now().strftime("%H:%M:%S"),
            "agent": agent_name,
            "type": event_type,
            "message": message,
            "reasoning": reasoning,
            "target": target
        })

    # === ROUND 1: IDENTIFY CRISIS & GENERATE REQUEST ===

    log_event("System", "system", "🔍 Analyzing hospital network for critical shortages...")

    # Find the most critical shortage across all hospitals
    worst_shortage = None
    requester_agent = None

    for agent in agents:
        shortages = agent.detect_shortages()
        for shortage in shortages:
            if shortage["severity"] == "critical":
                # Pick the most severe (lowest percentage of threshold)
                if worst_shortage is None or shortage["percentage"] < worst_shortage["percentage"]:
                    worst_shortage = shortage
                    requester_agent = agent

    # Fallback: if no critical, take any warning
    if worst_shortage is None:
        for agent in agents:
            shortages = agent.detect_shortages()
            if shortages:
                worst_shortage = shortages[0]
                requester_agent = agent
                break

    # If still nothing, no negotiation needed
    if worst_shortage is None or requester_agent is None:
        log_event("System", "system", "✅ All hospitals have adequate supplies. No negotiation needed.")
        return {"events": events, "pending_trade": None}

    log_event(
        "System",
        "system",
        f"🚨 Critical shortage detected: {requester_agent.name} needs {worst_shortage['deficit']} units of {worst_shortage['medicine']}"
    )

    # Generate LLM-powered request
    log_event(requester_agent.name, "generating", f"Generating negotiation request for {worst_shortage['medicine']}...")

    request_data = requester_agent.generate_request(worst_shortage)

    log_event(
        requester_agent.name,
        "request",
        request_data["message"],
        reasoning=request_data["reasoning"],
        target="All Hospitals"
    )

    # === ROUND 2: COLLECT RESPONSES ===

    responses = []
    responder_agents = [agent for agent in agents if agent != requester_agent]

    for responder in responder_agents:
        log_event(
            responder.name,
            "evaluating",
            f"Evaluating request from {requester_agent.name}..."
        )

        # LLM-powered evaluation
        response_data = responder.evaluate_request(
            request_data,
            requester_agent.name,
            requester_agent.location
        )

        log_event(
            responder.name,
            response_data["decision"],
            response_data["message"],
            reasoning=response_data["reasoning"],
            target=requester_agent.name
        )

        responses.append({
            "agent": responder,
            "decision": response_data["decision"],
            "message": response_data["message"],
            "reasoning": response_data["reasoning"],
            "counter_offer": response_data.get("counter_offer")
        })

    # === ROUND 3: FIND BEST ACCEPTOR OR COUNTER ===

    acceptors = [r for r in responses if r["decision"] == "accept"]
    counter_offers = [r for r in responses if r["decision"] == "counter"]
    rejections = [r for r in responses if r["decision"] == "reject"]

    log_event(
        "System",
        "system",
        f"📊 Results: {len(acceptors)} accept, {len(counter_offers)} counter, {len(rejections)} reject"
    )

    # Priority: accept > counter > no trade
    chosen_response = None

    if acceptors:
        # Pick the acceptor with the most surplus of the needed medicine
        best_acceptor = max(
            acceptors,
            key=lambda r: r["agent"].compute_surplus(worst_shortage["medicine"])
        )
        chosen_response = best_acceptor
        log_event("System", "system", f"✅ Best match: {chosen_response['agent'].name} accepted")

    elif counter_offers:
        # Pick first counter offer (in real system, requester would evaluate)
        chosen_response = counter_offers[0]
        log_event("System", "system", f"🔄 Processing counter-offer from {chosen_response['agent'].name}")

    else:
        log_event("System", "system", "❌ No hospitals able to help. Trade failed.")
        return {"events": events, "pending_trade": None}

    # === BUILD PENDING TRADE ===

    donor = chosen_response["agent"]
    receiver = requester_agent

    # Determine trade quantities
    needed_qty = worst_shortage["deficit"]
    donor_surplus = donor.compute_surplus(worst_shortage["medicine"])

    # Trade the minimum of what's needed and what's safely available
    trade_qty = min(needed_qty, donor_surplus)

    if trade_qty <= 0:
        log_event("System", "system", "❌ Donor has insufficient surplus. Trade failed.")
        return {"events": events, "pending_trade": None}

    medicines_to_transfer = {worst_shortage["medicine"]: trade_qty}

    # Determine counter-medicines (what receiver gives back)
    counter_medicines = {}

    if chosen_response["counter_offer"]:
        counter_medicines = chosen_response["counter_offer"]
    elif request_data["offers"]:
        # Use original offers from requester
        counter_medicines = request_data["offers"]

    # === SIMULATE TRADE FOR EXPLANATION ===
    # (Don't actually mutate inventories - that's for human approval)

    donor_inv_before = donor.inventory.copy()
    receiver_inv_before = receiver.inventory.copy()

    donor_inv_after = donor.inventory.copy()
    receiver_inv_after = receiver.inventory.copy()

    # Simulate donor giving medicines
    for med, qty in medicines_to_transfer.items():
        donor_inv_after[med] -= qty
        receiver_inv_after[med] += qty

    # Simulate receiver giving counter-medicines
    for med, qty in counter_medicines.items():
        if med in donor_inv_after and med in receiver_inv_after:
            receiver_inv_after[med] -= qty
            donor_inv_after[med] += qty

    # === GENERATE LLM EXPLANATION ===

    log_event("System", "generating", "Generating human-readable trade explanation...")

    explanation = donor.generate_explanation(
        trade={
            "donor": donor.name,
            "donor_location": donor.location,
            "receiver": receiver.name,
            "receiver_location": receiver.location,
            "medicines": medicines_to_transfer,
            "counter_medicines": counter_medicines
        },
        donor_inv_before=donor_inv_before,
        donor_inv_after=donor_inv_after,
        donor_thresholds=donor.thresholds,
        receiver_inv_before=receiver_inv_before,
        receiver_inv_after=receiver_inv_after,
        receiver_thresholds=receiver.thresholds
    )

    log_event("System", "system", "✅ Trade proposal ready for human verification")

    # === BUILD PENDING TRADE OBJECT ===

    pending_trade = {
        "donor": donor.name,
        "donor_location": donor.location,
        "receiver": receiver.name,
        "receiver_location": receiver.location,
        "medicines": medicines_to_transfer,
        "counter_medicines": counter_medicines,
        "explanation": explanation,
        "status": "AWAITING_HUMAN_APPROVAL",
        "donor_inv_before": donor_inv_before,
        "donor_inv_after": donor_inv_after,
        "receiver_inv_before": receiver_inv_before,
        "receiver_inv_after": receiver_inv_after,
        "crisis_resolved": worst_shortage["medicine"],
        "deficit_closed": trade_qty
    }

    return {
        "events": events,
        "pending_trade": pending_trade
    }


def execute_trade(pending_trade: dict, agents: list[HospitalAgent]) -> dict:
    """
    Execute a human-approved trade by mutating agent inventories.

    Args:
        pending_trade: Trade object from run_negotiation()
        agents: List of HospitalAgent objects to mutate

    Returns:
        Execution report with before/after snapshots

    Raises:
        ValueError: If trade would violate safety constraints
    """

    # Find donor and receiver agents
    donor = next((a for a in agents if a.name == pending_trade["donor"]), None)
    receiver = next((a for a in agents if a.name == pending_trade["receiver"]), None)

    if not donor or not receiver:
        raise ValueError("Donor or receiver agent not found")

    # Validate trade safety BEFORE executing
    for medicine, qty in pending_trade["medicines"].items():
        if not donor.can_safely_transfer(medicine, qty):
            raise ValueError(
                f"SAFETY VIOLATION: {donor.name} cannot transfer {qty} {medicine} "
                f"without dropping below threshold"
            )

    for medicine, qty in pending_trade["counter_medicines"].items():
        if not receiver.can_safely_transfer(medicine, qty):
            raise ValueError(
                f"SAFETY VIOLATION: {receiver.name} cannot transfer {qty} {medicine} "
                f"without dropping below threshold"
            )

    # Take before snapshots
    donor_before = donor.inventory.copy()
    receiver_before = receiver.inventory.copy()

    # Execute transfers
    for medicine, qty in pending_trade["medicines"].items():
        donor.apply_transfer(medicine, qty, "out")
        receiver.apply_transfer(medicine, qty, "in")

    for medicine, qty in pending_trade["counter_medicines"].items():
        receiver.apply_transfer(medicine, qty, "out")
        donor.apply_transfer(medicine, qty, "in")

    # Take after snapshots
    donor_after = donor.inventory.copy()
    receiver_after = receiver.inventory.copy()

    return {
        "status": "EXECUTED",
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "donor": donor.name,
        "receiver": receiver.name,
        "donor_before": donor_before,
        "donor_after": donor_after,
        "receiver_before": receiver_before,
        "receiver_after": receiver_after
    }


def reject_trade(pending_trade: dict) -> dict:
    """
    Record a trade rejection without mutating any inventories.

    Args:
        pending_trade: Trade object from run_negotiation()

    Returns:
        Rejection record for trade history
    """

    return {
        "status": "REJECTED",
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "donor": pending_trade["donor"],
        "receiver": pending_trade["receiver"],
        "medicines": pending_trade["medicines"],
        "counter_medicines": pending_trade["counter_medicines"],
        "reason": "Administrator rejected trade"
    }


# === MODULE-LEVEL TEST ===
if __name__ == "__main__":
    print("=== MedFlow-AI Negotiation Test ===\n")

    from data import generate_test_scenario

    # Generate test scenario
    agents = generate_test_scenario()

    print("Test Scenario Loaded:")
    for agent in agents:
        shortages = agent.detect_shortages()
        print(f"  {agent.name}: {len(shortages)} shortage(s)")

    print("\n" + "="*60)
    print("Running Negotiation...")
    print("="*60 + "\n")

    # This would normally require actual Gemini API calls
    # For testing without API: comment out or mock

    try:
        result = run_negotiation(agents)

        print(f"\nTotal Events: {len(result['events'])}")

        for event in result['events']:
            print(f"[{event['timestamp']}] {event['agent']}: {event['message'][:60]}...")

        if result['pending_trade']:
            print("\n" + "="*60)
            print("PENDING TRADE:")
            print("="*60)
            trade = result['pending_trade']
            print(f"From: {trade['donor']}")
            print(f"To: {trade['receiver']}")
            print(f"Medicines: {trade['medicines']}")
            print(f"Return: {trade['counter_medicines']}")
            print(f"\nExplanation: {trade['explanation']}")
        else:
            print("\nNo trade generated")

    except Exception as e:
        print(f"⚠️  Test requires Gemini API key: {e}")
        print("This is expected if .env is not configured yet")
