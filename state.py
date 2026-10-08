"""
MedFlow-AI Central Shared System State
Provides a single source of truth for hospital inventories, negotiation events,
pending trades, immutable trade history, and map-based medicine requests.
"""

from datetime import datetime
from typing import Optional, Dict, Any, List
from data import generate_hospitals


class SystemState:
    def __init__(self):
        self.hospitals = generate_hospitals()
        self.events: List[Dict[str, Any]] = []
        self.pending_trade: Optional[Dict[str, Any]] = None
        self.trade_history: List[Dict[str, Any]] = []
        self.scenario_count: int = 1
        self.medicine_requests: List[Dict[str, Any]] = []

    def reset_scenario(self):
        self.hospitals = generate_hospitals()
        self.events = []
        self.pending_trade = None
        self.scenario_count += 1


# Global singleton instance shared across server and modular route handlers
state = SystemState()
