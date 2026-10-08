"""
MedFlow-AI Hospital Agent Module
Each hospital is an autonomous LLM-powered agent that negotiates for patient welfare.
All negotiation logic is driven by Gemini - NO hardcoded messages.
"""

from typing import Optional
from llm_client import ask_gemini

# === SYSTEM PROMPTS FOR MULTI-AGENT NEGOTIATION ===

REQUESTER_PROMPT = """You are the AI procurement agent for {hospital_name}, located in {location}.
You negotiate on behalf of patients, not profits. Lives depend on your decisions.

**YOUR CURRENT SITUATION:**
Inventory: {inventory}
Safety Thresholds: {thresholds}

**CRITICAL SHORTAGE DETECTED:**
Medicine: {medicine}
Current Stock: {current} units
Safety Threshold: {threshold} units
Deficit: {deficit} units
Severity: {severity}

You need {deficit} units of {medicine} within 48 hours to avoid running out completely.

**WHAT YOU CAN OFFER IN RETURN:**
{surpluses}

**YOUR TASK:**
Write a SHORT, professional negotiation request (2-3 sentences) to other hospitals in the Karnataka medical network.

Be specific about:
1. How many units you need and why it's urgent
2. What you can offer in return from your surplus
3. The patient impact if you run out

Tone: Direct, empathetic, professional. No fluff or corporate jargon.

**RESPONSE FORMAT (JSON):**
{{
  "message": "Your negotiation message in 2-3 sentences",
  "offers": {{"MedicineName": quantity_you_offer}},
  "reasoning": "One sentence explaining your negotiation strategy"
}}

Remember: You're negotiating for patients who cannot wait. Be urgent but fair."""

RESPONDER_PROMPT = """You are the AI procurement agent for {hospital_name}, located in {location}.
You negotiate on behalf of patients, not profits. You must balance helping others with protecting your own patients.

**YOUR CURRENT SITUATION:**
Inventory: {inventory}
Safety Thresholds: {thresholds}

**INCOMING REQUEST:**
From: {requester_name} at {requester_location}
Message: "{request_message}"

They are offering in return:
{offers}

**YOUR DECISION RULES:**
1. NEVER drop your stock below safety thresholds - your patients come first
2. If you can help WITHOUT endangering your patients, you SHOULD help
3. If their offer is fair and you can safely transfer, ACCEPT
4. If you can help but need different terms, COUNTER-OFFER
5. If helping would endanger your patients, REJECT with empathy

**CALCULATE SAFETY:**
For each medicine they want:
- Check: (your_current_stock - requested_amount) >= your_threshold
- If NO for any medicine → you CANNOT accept (reject or counter)
- If YES for all → you CAN safely transfer

**RESPONSE FORMAT (JSON):**
{{
  "decision": "accept" OR "counter" OR "reject",
  "message": "Your reply in 1-2 sentences (be empathetic even when rejecting)",
  "reasoning": "One sentence explaining why you made this decision",
  "counter_offer": {{"MedicineName": quantity}} OR null
}}

Remember: Rejecting doesn't make you selfish - protecting your patients is your primary duty."""

EXPLAINER_PROMPT = """You are explaining a medicine trade to a hospital administrator who needs to verify this decision.

**TRADE SUMMARY:**
From: {donor_hospital} ({donor_location})
To: {receiver_hospital} ({receiver_location})

**WHAT'S BEING TRANSFERRED:**
Donor gives: {trade_details}
Donor receives back: {counter_details}

**INVENTORY IMPACT:**

{donor_hospital} Inventory:
BEFORE: {donor_before}
AFTER:  {donor_after}
Safety Thresholds: {donor_thresholds}

{receiver_hospital} Inventory:
BEFORE: {receiver_before}
AFTER:  {receiver_after}
Safety Thresholds: {receiver_thresholds}

**YOUR TASK:**
Write a clear 2-3 sentence explanation in plain English that:
1. States what critical problem this trade solves
2. PROVES both hospitals remain SAFE (above thresholds) after the trade
3. Explains the consequence of NOT making this trade

No bullet points. No jargon. Write like you're explaining to a busy doctor.
Return PLAIN TEXT only - no JSON, no markdown, just clear sentences."""


class HospitalAgent:
    """
    Autonomous hospital agent with LLM-powered negotiation capabilities.
    Each agent manages inventory, detects shortages, and negotiates with other hospitals.
    """

    def __init__(self, name: str, location: str, inventory: dict, thresholds: dict):
        """
        Initialize a hospital agent.

        Args:
            name: Hospital name (e.g., "City General Hospital")
            location: Geographic location as string (e.g., "Mysuru, Karnataka")
            inventory: Current medicine stock {medicine_name: quantity}
            thresholds: Safety thresholds {medicine_name: minimum_quantity}
        """
        self.name = name
        self.location = location
        # Coordinates (lat, lng) for geospatial mapping
        coords_map = {
            "City General Hospital": (12.9716, 77.5946),
            "District Government Hospital": (12.9500, 77.6200),
            "Rural Primary Health Centre": (12.9900, 77.5500),
        }
        self.coords = coords_map.get(name, (12.9716, 77.5946))
        self.inventory = inventory.copy()  # Avoid mutation bugs
        self.thresholds = thresholds.copy()

        # Validate that all medicines have thresholds
        for medicine in self.inventory:
            if medicine not in self.thresholds:
                raise ValueError(f"Missing threshold for {medicine} in {name}")

    def detect_shortages(self) -> list[dict]:
        """
        Detect which medicines are below or approaching safety thresholds.

        Returns:
            List of shortage dictionaries, sorted by severity (critical first):
            [
                {
                    "medicine": "Paracetamol",
                    "current": 200,
                    "threshold": 500,
                    "deficit": 300,
                    "severity": "critical"  # or "warning"
                },
                ...
            ]
        """
        shortages = []

        for medicine, current_stock in self.inventory.items():
            threshold = self.thresholds[medicine]

            if current_stock < threshold:
                deficit = threshold - current_stock

                # Critical if below 50% of threshold, otherwise warning
                if current_stock < (threshold * 0.5):
                    severity = "critical"
                else:
                    severity = "warning"

                shortages.append({
                    "medicine": medicine,
                    "current": current_stock,
                    "threshold": threshold,
                    "deficit": deficit,
                    "severity": severity,
                    "percentage": int((current_stock / threshold) * 100)
                })

        # Sort by severity (critical first) then by deficit size
        shortages.sort(key=lambda x: (0 if x["severity"] == "critical" else 1, -x["deficit"]))

        return shortages

    def compute_surplus(self, medicine: str) -> int:
        """
        Calculate surplus for a specific medicine.

        Args:
            medicine: Medicine name

        Returns:
            Surplus quantity (0 if no surplus)
        """
        if medicine not in self.inventory or medicine not in self.thresholds:
            return 0

        surplus = self.inventory[medicine] - self.thresholds[medicine]
        return max(0, surplus)

    def get_surpluses(self) -> dict:
        """
        Get all medicines with surplus stock.

        Returns:
            Dictionary {medicine: surplus_quantity} for medicines with surplus > 0
        """
        surpluses = {}

        for medicine in self.inventory:
            surplus = self.compute_surplus(medicine)
            if surplus > 0:
                surpluses[medicine] = surplus

        return surpluses

    def can_safely_transfer(self, medicine: str, quantity: int) -> bool:
        """
        Check if hospital can transfer medicine without going below threshold.
        """
        if quantity <= 0:
            return True
        if medicine not in self.inventory:
            return False

        remaining = self.inventory[medicine] - quantity
        threshold = self.thresholds.get(medicine, 0)

        return remaining >= threshold

    def apply_transfer(self, medicine: str, quantity: int, direction: str) -> None:
        """
        Apply a medicine transfer to inventory.
        """
        if quantity <= 0:
            return

        if medicine not in self.inventory:
            raise ValueError(f"{medicine} not in {self.name}'s inventory")

        if direction == "out":
            if not self.can_safely_transfer(medicine, quantity):
                raise ValueError(
                    f"Cannot transfer {quantity} units of {medicine} from {self.name} - "
                    f"would drop below threshold ({self.thresholds[medicine]})"
                )
            self.inventory[medicine] -= quantity

        elif direction == "in":
            self.inventory[medicine] += quantity

        else:
            raise ValueError(f"Invalid direction: {direction}. Use 'in' or 'out'")

    def generate_request(self, shortage: dict) -> dict:
        """
        Generate an LLM-powered negotiation request for a shortage.

        Args:
            shortage: Shortage dictionary from detect_shortages()

        Returns:
            {
                "message": "Negotiation message text",
                "offers": {"MedicineName": quantity},
                "reasoning": "AI's internal reasoning"
            }
        """
        surpluses = self.get_surpluses()

        # Format surpluses for prompt
        if surpluses:
            surplus_text = "\n".join(
                f"- {med}: {qty} units available"
                for med, qty in surpluses.items()
            )
        else:
            surplus_text = "No surplus available - requesting emergency assistance"

        # Format inventory and thresholds
        inventory_text = ", ".join(f"{med}: {qty}" for med, qty in self.inventory.items())
        threshold_text = ", ".join(f"{med}: {qty}" for med, qty in self.thresholds.items())

        system_prompt = REQUESTER_PROMPT.format(
            hospital_name=self.name,
            location=self.location,
            inventory=inventory_text,
            thresholds=threshold_text,
            medicine=shortage["medicine"],
            current=shortage["current"],
            threshold=shortage["threshold"],
            deficit=shortage["deficit"],
            severity=shortage["severity"],
            surpluses=surplus_text
        )

        user_prompt = f"Generate the negotiation request now. Be urgent but professional."

        # JSON schema for structured output
        json_schema = {
            "type": "object",
            "properties": {
                "message": {"type": "string"},
                "offers": {
                    "type": "object",
                    "properties": {
                        "Paracetamol": {"type": "integer"},
                        "Amoxicillin": {"type": "integer"},
                        "Ibuprofen": {"type": "integer"},
                        "Insulin": {"type": "integer"},
                        "ORS": {"type": "integer"},
                        "Metformin": {"type": "integer"},
                        "Ciprofloxacin": {"type": "integer"},
                        "Omeprazole": {"type": "integer"}
                    }
                },
                "reasoning": {"type": "string"}
            },
            "required": ["message", "offers", "reasoning"]
        }

        response = ask_gemini(system_prompt, user_prompt, json_schema=json_schema)
        return response

    def evaluate_request(self, request: dict, requester_name: str, requester_location: str = "Unknown") -> dict:
        """
        Evaluate an incoming negotiation request using LLM reasoning.

        Args:
            request: Request dictionary with "message" and "offers"
            requester_name: Name of requesting hospital
            requester_location: Location of requesting hospital

        Returns:
            {
                "decision": "accept" | "counter" | "reject",
                "message": "Reply message",
                "reasoning": "AI's internal reasoning",
                "counter_offer": {"MedicineName": quantity} or None
            }
        """
        inventory_text = ", ".join(f"{med}: {qty}" for med, qty in self.inventory.items())
        threshold_text = ", ".join(f"{med}: {qty}" for med, qty in self.thresholds.items())

        offers_text = ", ".join(
            f"{med}: {qty} units"
            for med, qty in request.get("offers", {}).items()
        )
        if not offers_text:
            offers_text = "Nothing specific offered"

        system_prompt = RESPONDER_PROMPT.format(
            hospital_name=self.name,
            location=self.location,
            inventory=inventory_text,
            thresholds=threshold_text,
            requester_name=requester_name,
            requester_location=requester_location,
            request_message=request.get("message", "No message provided"),
            offers=offers_text
        )

        user_prompt = "Evaluate this request now. Remember: protect your patients first, but help if you safely can."

        json_schema = {
            "type": "object",
            "properties": {
                "decision": {
                    "type": "string",
                    "enum": ["accept", "counter", "reject"]
                },
                "message": {"type": "string"},
                "reasoning": {"type": "string"},
                "counter_offer": {
                    "type": "object",
                    "nullable": True,
                    "properties": {
                        "Paracetamol": {"type": "integer"},
                        "Amoxicillin": {"type": "integer"},
                        "Ibuprofen": {"type": "integer"},
                        "Insulin": {"type": "integer"},
                        "ORS": {"type": "integer"},
                        "Metformin": {"type": "integer"},
                        "Ciprofloxacin": {"type": "integer"},
                        "Omeprazole": {"type": "integer"}
                    }
                }
            },
            "required": ["decision", "message", "reasoning"]
        }

        response = ask_gemini(system_prompt, user_prompt, json_schema=json_schema)
        return response

    def generate_explanation(
        self,
        trade: dict,
        donor_inv_before: dict,
        donor_inv_after: dict,
        donor_thresholds: dict,
        receiver_inv_before: dict,
        receiver_inv_after: dict,
        receiver_thresholds: dict
    ) -> str:
        """
        Generate human-readable explanation of a trade for verification.

        Args:
            trade: Trade dictionary with donor, receiver, medicines, counter_medicines
            donor_inv_before: Donor inventory before trade
            donor_inv_after: Donor inventory after trade
            donor_thresholds: Donor safety thresholds
            receiver_inv_before: Receiver inventory before trade
            receiver_inv_after: Receiver inventory after trade
            receiver_thresholds: Receiver safety thresholds

        Returns:
            Plain text explanation (2-3 sentences)
        """
        # Format trade details
        trade_items = ", ".join(
            f"{qty} {med}"
            for med, qty in trade.get("medicines", {}).items()
        )

        counter_items = ", ".join(
            f"{qty} {med}"
            for med, qty in trade.get("counter_medicines", {}).items()
        )
        if not counter_items:
            counter_items = "nothing (emergency donation)"

        # Format inventories
        donor_before_text = ", ".join(f"{m}: {q}" for m, q in donor_inv_before.items())
        donor_after_text = ", ".join(f"{m}: {q}" for m, q in donor_inv_after.items())
        donor_thresh_text = ", ".join(f"{m}: {q}" for m, q in donor_thresholds.items())

        receiver_before_text = ", ".join(f"{m}: {q}" for m, q in receiver_inv_before.items())
        receiver_after_text = ", ".join(f"{m}: {q}" for m, q in receiver_inv_after.items())
        receiver_thresh_text = ", ".join(f"{m}: {q}" for m, q in receiver_thresholds.items())

        system_prompt = EXPLAINER_PROMPT.format(
            donor_hospital=trade.get("donor", "Unknown"),
            donor_location=trade.get("donor_location", "Unknown"),
            receiver_hospital=trade.get("receiver", "Unknown"),
            receiver_location=trade.get("receiver_location", "Unknown"),
            trade_details=trade_items,
            counter_details=counter_items,
            donor_before=donor_before_text,
            donor_after=donor_after_text,
            donor_thresholds=donor_thresh_text,
            receiver_before=receiver_before_text,
            receiver_after=receiver_after_text,
            receiver_thresholds=receiver_thresh_text
        )

        user_prompt = "Write the explanation now. Keep it clear and concise."

        # Plain text response (no JSON schema)
        explanation = ask_gemini(system_prompt, user_prompt, json_schema=None, temperature=0.5)

        return explanation.strip()

    def __repr__(self) -> str:
        """String representation for debugging."""
        shortages = self.detect_shortages()
        surpluses = self.get_surpluses()

        return (
            f"HospitalAgent(name='{self.name}', location='{self.location}', "
            f"shortages={len(shortages)}, surpluses={len(surpluses)})"
        )
