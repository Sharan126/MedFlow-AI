"""
MedFlow-AI Data Generation Module
Generates realistic hospital scenarios with guaranteed critical shortages.
Loads real hospitals directly from dakshina_kannada_hospitals.csv.
"""

import os
import csv
import random
from pathlib import Path
from typing import Optional, List, Dict, Any
from agents import HospitalAgent

# === DAKSHINA KANNADA HOSPITAL NETWORK ===
CSV_PATH = Path(__file__).parent / "dakshina_kannada_hospitals.csv"

def load_dakshina_kannada_hospitals() -> List[Dict[str, Any]]:
    """Loads all real hospitals directly from dakshina_kannada_hospitals.csv."""
    if not CSV_PATH.exists():
        # Fallback if CSV is not found
        return [
            {
                "name": "Wenlock District Hospital",
                "location": "Mangalore, Dakshina Kannada",
                "short_location": "Mangalore, Dakshina Kannada",
                "taluk": "Mangalore",
                "district": "Dakshina Kannada",
                "type": "Government",
                "latitude": 12.864892,
                "longitude": 74.835974,
                "hfr_id": "IN2910000001"
            },
            {
                "name": "Bantwal Taluka Hospital",
                "location": "Bantwal, Dakshina Kannada",
                "short_location": "Bantwal, Dakshina Kannada",
                "taluk": "Bantwal",
                "district": "Dakshina Kannada",
                "type": "Government",
                "latitude": 12.893750,
                "longitude": 75.041410,
                "hfr_id": "IN2910000015"
            },
            {
                "name": "SDM Hospital",
                "location": "Ujire, Belthangady",
                "short_location": "Ujire, Belthangady",
                "taluk": "Belthangady",
                "district": "Dakshina Kannada",
                "type": "Private",
                "latitude": 12.994560,
                "longitude": 75.332100,
                "hfr_id": "IN2910000022"
            }
        ]

    hospitals = []
    with open(CSV_PATH, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            lat_str = row.get("latitude", "").strip()
            lon_str = row.get("longitude", "").strip()
            lat = float(lat_str) if lat_str else None
            lon = float(lon_str) if lon_str else None
            taluk = row.get("taluk", "Dakshina Kannada").strip()
            loc_str = row.get("location", f"{taluk}, Dakshina Kannada").strip()
            
            hospitals.append({
                "name": row["name"].strip(),
                "location": loc_str,
                "short_location": loc_str,
                "taluk": taluk,
                "district": row.get("district", "Dakshina Kannada").strip(),
                "type": row.get("type", "Government").strip(),
                "latitude": lat,
                "longitude": lon,
                "hfr_id": row.get("hfr_id", "").strip()
            })

    return hospitals

ALL_DK_HOSPITALS = load_dakshina_kannada_hospitals()

def get_all_taluks() -> List[str]:
    """Returns unique sorted taluks in Dakshina Kannada."""
    dk_hospitals = load_dakshina_kannada_hospitals()
    taluks = sorted(list({h["taluk"] for h in dk_hospitals if h.get("taluk")}))
    return taluks

def get_hospitals_by_taluk(taluk: Optional[str] = None) -> List[Dict[str, Any]]:
    """Returns hospitals optionally filtered by taluk."""
    all_h = load_dakshina_kannada_hospitals()
    if not taluk or taluk.lower() in ("all", "all dakshina kannada", "all taluks"):
        return all_h
    return [h for h in all_h if h.get("taluk", "").lower() == taluk.lower()]

# Anchor 3 prominent hospitals for default reproducible setup
DEFAULT_HOSPITALS_CONFIG = [
    {
        "name": "Wenlock District Hospital",
        "location": "Mangalore, Dakshina Kannada",
        "short_location": "Mangalore, Dakshina Kannada",
        "taluk": "Mangalore",
        "district": "Dakshina Kannada",
        "type": "Government",
        "latitude": 12.864892,
        "longitude": 74.835974,
        "hfr_id": "IN2910000001"
    },
    {
        "name": "Bantwal Taluka Hospital",
        "location": "Bantwal, Dakshina Kannada",
        "short_location": "Bantwal, Dakshina Kannada",
        "taluk": "Bantwal",
        "district": "Dakshina Kannada",
        "type": "Government",
        "latitude": 12.893750,
        "longitude": 75.041410,
        "hfr_id": "IN2910000015"
    },
    {
        "name": "SDM Hospital",
        "location": "Ujire, Belthangady",
        "short_location": "Ujire, Belthangady",
        "taluk": "Belthangady",
        "district": "Dakshina Kannada",
        "type": "Private",
        "latitude": 12.994560,
        "longitude": 75.332100,
        "hfr_id": "IN2910000022"
    }
]

# === ESSENTIAL MEDICINES IN INDIAN HEALTHCARE ===
MEDICINES = [
    "Paracetamol",      # Pain relief, fever
    "Amoxicillin",      # Antibiotic
    "Ibuprofen",        # Anti-inflammatory
    "Insulin",          # Diabetes management
    "ORS",              # Oral rehydration salts
    "Metformin",        # Type 2 diabetes
    "Ciprofloxacin",    # Broad-spectrum antibiotic
    "Omeprazole"        # Acid reducer
]


def generate_hospitals(
    seed: Optional[int] = None,
    taluk: Optional[str] = None,
    count: int = 3,
    hospital_names: Optional[List[str]] = None
) -> list[HospitalAgent]:
    """
    Generate a network of hospitals from dakshina_kannada_hospitals.csv with realistic inventories and guaranteed shortages.

    Args:
        seed: Random seed for reproducibility. If None, generates dynamic scenario.
        taluk: Optional taluk name to filter hospitals within Dakshina Kannada (e.g. 'Mangalore', 'Bantwal').
        count: Number of hospitals to include in scenario (default: 3).
        hospital_names: Optional list of explicit hospital names to select.

    Returns:
        List of HospitalAgent objects with:
        - Real hospital names and locations from Dakshina Kannada
        - Randomized inventories
        - At least 1 critical shortage
        - Complementary surpluses
    """
    if seed is not None:
        random.seed(seed)

    dk_hospitals = load_dakshina_kannada_hospitals()

    selected_configs = []

    # Priority 1: User specified explicit hospital names
    if hospital_names:
        selected_configs = [h for h in dk_hospitals if h["name"] in hospital_names]

    # Priority 2: Filter by specific Taluk
    if not selected_configs and taluk and taluk.lower() not in ("all", "all dakshina kannada", "all taluks"):
        taluk_hospitals = [h for h in dk_hospitals if h.get("taluk", "").lower() == taluk.lower()]
        if len(taluk_hospitals) >= count:
            selected_configs = random.sample(taluk_hospitals, count)
        elif taluk_hospitals:
            # Take all in this taluk, fill remainder from general DK network
            remaining_needed = count - len(taluk_hospitals)
            other_hospitals = [h for h in dk_hospitals if h not in taluk_hospitals]
            supplement = random.sample(other_hospitals, min(remaining_needed, len(other_hospitals)))
            selected_configs = taluk_hospitals + supplement

    # Priority 3: Default or cross-district selection
    if not selected_configs:
        is_all_corridor = not taluk or taluk.lower() in ("all", "all dakshina kannada", "all taluks")
        if (is_all_corridor and count == 3) or seed == 1 or len(dk_hospitals) < 3:
            selected_configs = [dict(h) for h in DEFAULT_HOSPITALS_CONFIG[:count]]
        else:
            # Choose geographically diverse nodes across different taluks if possible
            k = min(count, len(dk_hospitals))
            taluk_groups = {}
            for h in dk_hospitals:
                taluk_groups.setdefault(h["taluk"], []).append(h)

            diverse_sample = []
            shuffled_taluks = list(taluk_groups.keys())
            random.shuffle(shuffled_taluks)

            # Pick 1 from each distinct taluk first
            for t in shuffled_taluks:
                if len(diverse_sample) < k:
                    diverse_sample.append(random.choice(taluk_groups[t]))

            # Fill up if needed
            while len(diverse_sample) < k:
                candidate = random.choice(dk_hospitals)
                if candidate not in diverse_sample:
                    diverse_sample.append(candidate)

            selected_configs = diverse_sample

    agents = []

    # === STEP 1: Generate base inventories and thresholds ===
    for hospital_config in selected_configs:
        inventory = {}
        thresholds = {}

        for medicine in MEDICINES:
            # Inventory: 150-1500 units
            inventory[medicine] = random.randint(150, 1500)
            # Threshold: 300-600 units (safety stock buffer)
            thresholds[medicine] = random.randint(300, 600)

        agent = HospitalAgent(
            name=hospital_config["name"],
            location=hospital_config.get("short_location") or hospital_config.get("location", ""),
            inventory=inventory,
            thresholds=thresholds,
            taluk=hospital_config.get("taluk", "Dakshina Kannada"),
            hospital_type=hospital_config.get("type", "Government"),
            latitude=hospital_config.get("latitude"),
            longitude=hospital_config.get("longitude"),
            hfr_id=hospital_config.get("hfr_id", "")
        )
        agents.append(agent)

    # === STEP 2: Guarantee at least 1 critical shortage ===
    crisis_hospital_idx = random.randint(0, len(agents) - 1)
    crisis_medicine = random.choice(MEDICINES)
    crisis_agent = agents[crisis_hospital_idx]

    # Create critical shortage: set inventory to 20-38% of threshold
    crisis_threshold = crisis_agent.thresholds[crisis_medicine]
    crisis_inventory = int(crisis_threshold * random.uniform(0.20, 0.38))
    crisis_agent.inventory[crisis_medicine] = crisis_inventory

    # === STEP 3: Ensure other hospital can help ===
    helper_indices = [i for i in range(len(agents)) if i != crisis_hospital_idx]
    if helper_indices:
        helper_idx = random.choice(helper_indices)
        helper_agent = agents[helper_idx]
        helper_threshold = helper_agent.thresholds[crisis_medicine]

        # Give helper a healthy surplus: 160-240% of threshold
        helper_inventory = int(helper_threshold * random.uniform(1.6, 2.4))
        helper_agent.inventory[crisis_medicine] = helper_inventory

    # === STEP 4: Add secondary shortage variety ===
    if random.random() < 0.6:
        secondary_hospital_idx = random.randint(0, len(agents) - 1)
        secondary_medicine = random.choice([m for m in MEDICINES if m != crisis_medicine])
        secondary_agent = agents[secondary_hospital_idx]
        secondary_threshold = secondary_agent.thresholds[secondary_medicine]
        secondary_inventory = int(secondary_threshold * random.uniform(0.60, 0.80))
        secondary_agent.inventory[secondary_medicine] = secondary_inventory

    # === STEP 5: Validation ===
    total_critical_shortages = sum(
        1 for agent in agents
        for shortage in agent.detect_shortages()
        if shortage["severity"] == "critical"
    )

    if total_critical_shortages == 0 and len(agents) > 0:
        fallback_agent = agents[0]
        fallback_medicine = MEDICINES[0]
        fallback_agent.inventory[fallback_medicine] = int(
            fallback_agent.thresholds[fallback_medicine] * 0.3
        )

    return agents


def get_scenario_summary(agents: list[HospitalAgent]) -> dict:
    """Generate a summary of the current scenario for dashboard display."""
    all_shortages = []
    hospitals_with_surplus = 0
    crisis_hospital = None
    crisis_medicine = None
    max_deficit = 0

    for agent in agents:
        shortages = agent.detect_shortages()
        all_shortages.extend(shortages)

        if agent.get_surpluses():
            hospitals_with_surplus += 1

        for shortage in shortages:
            if shortage["severity"] == "critical" and shortage["deficit"] > max_deficit:
                max_deficit = shortage["deficit"]
                crisis_hospital = agent.name
                crisis_medicine = shortage["medicine"]

    critical_count = sum(1 for s in all_shortages if s["severity"] == "critical")
    warning_count = sum(1 for s in all_shortages if s["severity"] == "warning")

    return {
        "total_hospitals": len(agents),
        "total_medicines": len(MEDICINES),
        "critical_shortages": critical_count,
        "warning_shortages": warning_count,
        "hospitals_with_surpluses": hospitals_with_surplus,
        "crisis_hospital": crisis_hospital,
        "crisis_medicine": crisis_medicine,
        "max_deficit": max_deficit
    }


def generate_test_scenario() -> list[HospitalAgent]:
    """Generate fixed predictable test scenario in Dakshina Kannada."""
    agent_a = HospitalAgent(
        name="Wenlock District Hospital",
        location="Mangalore, Dakshina Kannada",
        taluk="Mangalore",
        hospital_type="Government",
        latitude=12.864892,
        longitude=74.835974,
        hfr_id="IN2910000001",
        inventory={
            "Paracetamol": 1200,
            "Amoxicillin": 800,
            "Ibuprofen": 600,
            "Insulin": 150,        # CRITICAL
            "ORS": 1000,
            "Metformin": 500,
            "Ciprofloxacin": 450,
            "Omeprazole": 700
        },
        thresholds={
            "Paracetamol": 500,
            "Amoxicillin": 400,
            "Ibuprofen": 400,
            "Insulin": 500,
            "ORS": 600,
            "Metformin": 400,
            "Ciprofloxacin": 400,
            "Omeprazole": 500
        }
    )

    agent_b = HospitalAgent(
        name="Bantwal Taluka Hospital",
        location="Bantwal, Dakshina Kannada",
        taluk="Bantwal",
        hospital_type="Government",
        latitude=12.893750,
        longitude=75.041410,
        hfr_id="IN2910000015",
        inventory={
            "Paracetamol": 900,
            "Amoxicillin": 350,
            "Ibuprofen": 1100,
            "Insulin": 1400,       # SURPLUS
            "ORS": 800,
            "Metformin": 950,
            "Ciprofloxacin": 1200,
            "Omeprazole": 600
        },
        thresholds={
            "Paracetamol": 400,
            "Amoxicillin": 400,
            "Ibuprofen": 500,
            "Insulin": 500,
            "ORS": 500,
            "Metformin": 400,
            "Ciprofloxacin": 500,
            "Omeprazole": 400
        }
    )

    agent_c = HospitalAgent(
        name="SDM Hospital",
        location="Ujire, Belthangady",
        taluk="Belthangady",
        hospital_type="Private",
        latitude=12.994560,
        longitude=75.332100,
        hfr_id="IN2910000022",
        inventory={
            "Paracetamol": 600,
            "Amoxicillin": 900,
            "Ibuprofen": 700,
            "Insulin": 600,
            "ORS": 700,
            "Metformin": 600,
            "Ciprofloxacin": 500,
            "Omeprazole": 800
        },
        thresholds={
            "Paracetamol": 500,
            "Amoxicillin": 500,
            "Ibuprofen": 400,
            "Insulin": 400,
            "ORS": 400,
            "Metformin": 400,
            "Ciprofloxacin": 400,
            "Omeprazole": 400
        }
    )

    return [agent_a, agent_b, agent_c]


if __name__ == "__main__":
    print("=== MedFlow-AI: Dakshina Kannada Hospital Network Test ===")
    all_h = load_dakshina_kannada_hospitals()
    print(f"Loaded {len(all_h)} hospitals across taluks: {get_all_taluks()}")
    sample_agents = generate_hospitals()
    for a in sample_agents:
        print(f"- {a.name} ({a.taluk}, {a.hospital_type}): {len(a.detect_shortages())} shortages, {len(a.get_surpluses())} surpluses")
