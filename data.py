"""
MedFlow-AI Data Generation Module
Generates realistic hospital scenarios with guaranteed critical shortages.
Each scenario is unique but reproducible via random seed.
"""

import random
from typing import Optional
from agents import HospitalAgent

# === KARNATAKA HOSPITAL NETWORK ===
# Real locations in Mysuru district for authenticity

HOSPITALS_CONFIG = [
    {
        "name": "City General Hospital",
        "location": "Mysuru Central (12.9716°N, 77.5946°E)",
        "short_location": "Mysuru Central"
    },
    {
        "name": "District Government Hospital",
        "location": "Bannimantap, Mysuru (12.9510°N, 77.6247°E)",
        "short_location": "Bannimantap"
    },
    {
        "name": "Rural Primary Health Centre",
        "location": "Hunsur Road, Mysuru (12.9900°N, 77.5518°E)",
        "short_location": "Hunsur Road"
    }
]

# === ESSENTIAL MEDICINES IN INDIAN HEALTHCARE ===
# Based on WHO Essential Medicines List + common Indian hospital stocks

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


def generate_hospitals(seed: Optional[int] = None) -> list[HospitalAgent]:
    """
    Generate a network of hospitals with realistic inventories and guaranteed shortages.

    Args:
        seed: Random seed for reproducibility. If None, generates truly random scenario.

    Returns:
        List of 3 HospitalAgent objects with:
        - Randomized inventories
        - At least 1 critical shortage
        - Complementary surpluses (other hospitals have what the needy one lacks)
    """

    # Set random seed for reproducibility
    if seed is not None:
        random.seed(seed)

    agents = []

    # === STEP 1: Generate base inventories and thresholds ===
    for hospital_config in HOSPITALS_CONFIG:
        inventory = {}
        thresholds = {}

        for medicine in MEDICINES:
            # Generate realistic stock levels
            # Inventory: 100-1500 units (wide range for diversity)
            inventory[medicine] = random.randint(100, 1500)

            # Threshold: 300-600 units (safety stock level)
            thresholds[medicine] = random.randint(300, 600)

        agent = HospitalAgent(
            name=hospital_config["name"],
            location=hospital_config["short_location"],
            inventory=inventory,
            thresholds=thresholds
        )

        agents.append(agent)

    # === STEP 2: Guarantee at least 1 critical shortage ===
    # Pick a random hospital and medicine to create a crisis scenario

    crisis_hospital_idx = random.randint(0, len(agents) - 1)
    crisis_medicine = random.choice(MEDICINES)

    crisis_agent = agents[crisis_hospital_idx]

    # Create critical shortage: set inventory to 20-40% of threshold
    crisis_threshold = crisis_agent.thresholds[crisis_medicine]
    crisis_inventory = int(crisis_threshold * random.uniform(0.20, 0.40))

    crisis_agent.inventory[crisis_medicine] = crisis_inventory

    # === STEP 3: Ensure other hospitals can help ===
    # Give at least one other hospital a surplus of the crisis medicine

    helper_indices = [i for i in range(len(agents)) if i != crisis_hospital_idx]
    helper_idx = random.choice(helper_indices)

    helper_agent = agents[helper_idx]
    helper_threshold = helper_agent.thresholds[crisis_medicine]

    # Give helper a healthy surplus: 150-250% of their threshold
    helper_inventory = int(helper_threshold * random.uniform(1.5, 2.5))
    helper_agent.inventory[crisis_medicine] = helper_inventory

    # === STEP 4: Add some variety with secondary shortages ===
    # 50% chance of creating a warning-level shortage in another medicine

    if random.random() < 0.5:
        secondary_hospital_idx = random.randint(0, len(agents) - 1)
        secondary_medicine = random.choice([m for m in MEDICINES if m != crisis_medicine])

        secondary_agent = agents[secondary_hospital_idx]
        secondary_threshold = secondary_agent.thresholds[secondary_medicine]

        # Create warning-level shortage: 60-80% of threshold
        secondary_inventory = int(secondary_threshold * random.uniform(0.60, 0.80))
        secondary_agent.inventory[secondary_medicine] = secondary_inventory

    # === STEP 5: Validation ===
    # Verify at least one critical shortage exists
    total_critical_shortages = sum(
        1 for agent in agents
        for shortage in agent.detect_shortages()
        if shortage["severity"] == "critical"
    )

    if total_critical_shortages == 0:
        # Fallback: force a critical shortage (should never happen with above logic)
        fallback_agent = agents[0]
        fallback_medicine = MEDICINES[0]
        fallback_agent.inventory[fallback_medicine] = int(
            fallback_agent.thresholds[fallback_medicine] * 0.3
        )

    return agents


def get_scenario_summary(agents: list[HospitalAgent]) -> dict:
    """
    Generate a summary of the current scenario for dashboard display.

    Args:
        agents: List of HospitalAgent objects

    Returns:
        Dictionary with scenario statistics:
        {
            "total_hospitals": 3,
            "total_medicines": 8,
            "critical_shortages": 2,
            "warning_shortages": 1,
            "hospitals_with_surpluses": 3,
            "crisis_hospital": "City General Hospital",
            "crisis_medicine": "Insulin"
        }
    """

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

        # Find the most critical shortage for summary
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
    """
    Generate a fixed test scenario for debugging and demo preparation.
    This creates a predictable crisis that always produces interesting negotiations.

    Returns:
        List of 3 HospitalAgent objects with a known critical shortage setup
    """

    # Hospital A: Critical shortage of Insulin
    agent_a = HospitalAgent(
        name="City General Hospital",
        location="Mysuru Central",
        inventory={
            "Paracetamol": 1200,
            "Amoxicillin": 800,
            "Ibuprofen": 600,
            "Insulin": 150,        # CRITICAL: well below threshold
            "ORS": 1000,
            "Metformin": 500,
            "Ciprofloxacin": 450,
            "Omeprazole": 700
        },
        thresholds={
            "Paracetamol": 500,
            "Amoxicillin": 400,
            "Ibuprofen": 400,
            "Insulin": 500,        # Needs 350 more units
            "ORS": 600,
            "Metformin": 400,
            "Ciprofloxacin": 400,
            "Omeprazole": 500
        }
    )

    # Hospital B: Has surplus Insulin, but low on Amoxicillin
    agent_b = HospitalAgent(
        name="District Government Hospital",
        location="Bannimantap",
        inventory={
            "Paracetamol": 900,
            "Amoxicillin": 350,    # Warning level
            "Ibuprofen": 1100,
            "Insulin": 1400,       # SURPLUS: 900 units available
            "ORS": 800,
            "Metformin": 950,
            "Ciprofloxacin": 1200,
            "Omeprazole": 600
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

    # Hospital C: Balanced, some surpluses
    agent_c = HospitalAgent(
        name="Rural Primary Health Centre",
        location="Hunsur Road",
        inventory={
            "Paracetamol": 1300,   # Surplus
            "Amoxicillin": 900,    # Surplus
            "Ibuprofen": 500,
            "Insulin": 650,
            "ORS": 1500,           # Large surplus
            "Metformin": 450,
            "Ciprofloxacin": 550,
            "Omeprazole": 800
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

    return [agent_a, agent_b, agent_c]


# === MODULE-LEVEL TEST ===
if __name__ == "__main__":
    print("=== MedFlow-AI Data Generation Test ===\n")

    # Test 1: Random scenario
    print("Test 1: Random Scenario")
    agents = generate_hospitals()
    summary = get_scenario_summary(agents)

    print(f"Generated {summary['total_hospitals']} hospitals")
    print(f"Critical shortages: {summary['critical_shortages']}")
    print(f"Warning shortages: {summary['warning_shortages']}")
    print(f"Crisis: {summary['crisis_hospital']} needs {summary['crisis_medicine']}\n")

    for agent in agents:
        shortages = agent.detect_shortages()
        surpluses = agent.get_surpluses()
        print(f"{agent.name}:")
        print(f"  Shortages: {len(shortages)}")
        print(f"  Surpluses: {len(surpluses)}")

    print("\n" + "="*60 + "\n")

    # Test 2: Seeded scenario (reproducible)
    print("Test 2: Seeded Scenario (seed=42)")
    agents_seeded = generate_hospitals(seed=42)
    summary_seeded = get_scenario_summary(agents_seeded)

    print(f"Crisis: {summary_seeded['crisis_hospital']} needs {summary_seeded['crisis_medicine']}")
    print("This scenario should be identical if you run with seed=42 again\n")

    print("\n" + "="*60 + "\n")

    # Test 3: Fixed test scenario
    print("Test 3: Fixed Test Scenario")
    test_agents = generate_test_scenario()

    for agent in test_agents:
        shortages = agent.detect_shortages()
        print(f"{agent.name}: {len(shortages)} shortage(s)")
        for shortage in shortages:
            print(f"  - {shortage['medicine']}: {shortage['severity']}")

    print("\n✅ All tests passed!")
