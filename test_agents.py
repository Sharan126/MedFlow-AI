"""
MedFlow-AI Agent Testing Suite
Tests each HospitalAgent method standalone with real Gemini API calls.
Run this to verify everything works before your demo.
"""

import sys
from agents import HospitalAgent

print("="*70)
print("🧪 MEDFLOW-AI AGENT TESTING SUITE")
print("="*70)
print("\nThis will test each agent method with REAL Gemini API calls.")
print("Make sure your .env file has a valid GEMINI_API_KEY!\n")

input("Press ENTER to start tests...")

# === CREATE TEST AGENT ===
print("\n" + "="*70)
print("TEST 1: Creating Hospital Agent")
print("="*70)

try:
    test_agent = HospitalAgent(
        name="City General Hospital",
        location="Mysuru Central",
        inventory={
            "Paracetamol": 1200,
            "Amoxicillin": 800,
            "Ibuprofen": 600,
            "Insulin": 150,  # CRITICAL shortage
            "ORS": 1000,
        },
        thresholds={
            "Paracetamol": 500,
            "Amoxicillin": 400,
            "Ibuprofen": 400,
            "Insulin": 500,  # Needs 350 more
            "ORS": 600,
        }
    )
    print(f"✅ Agent created: {test_agent}")
    print(f"   Name: {test_agent.name}")
    print(f"   Location: {test_agent.location}")
except Exception as e:
    print(f"❌ FAILED: {e}")
    sys.exit(1)

# === TEST 2: DETECT SHORTAGES (Pure Python) ===
print("\n" + "="*70)
print("TEST 2: Detect Shortages (Pure Python - No LLM)")
print("="*70)

try:
    shortages = test_agent.detect_shortages()
    print(f"✅ Found {len(shortages)} shortage(s)")

    for shortage in shortages:
        print(f"\n   Medicine: {shortage['medicine']}")
        print(f"   Current: {shortage['current']} units")
        print(f"   Threshold: {shortage['threshold']} units")
        print(f"   Deficit: {shortage['deficit']} units")
        print(f"   Severity: {shortage['severity']} ({shortage['percentage']}%)")
except Exception as e:
    print(f"❌ FAILED: {e}")
    sys.exit(1)

# === TEST 3: GET SURPLUSES (Pure Python) ===
print("\n" + "="*70)
print("TEST 3: Get Surpluses (Pure Python - No LLM)")
print("="*70)

try:
    surpluses = test_agent.get_surpluses()
    print(f"✅ Found {len(surpluses)} surplus(es)")

    for medicine, qty in surpluses.items():
        print(f"   {medicine}: +{qty} units")
except Exception as e:
    print(f"❌ FAILED: {e}")
    sys.exit(1)

# === TEST 4: GENERATE REQUEST (Gemini LLM) ===
print("\n" + "="*70)
print("TEST 4: Generate Negotiation Request (Gemini LLM)")
print("="*70)
print("⏳ Calling Gemini API... (takes 2-5 seconds)")

try:
    critical_shortage = shortages[0]  # Use the Insulin shortage
    request = test_agent.generate_request(critical_shortage)

    print("✅ REQUEST GENERATED\n")
    print(f"   Message: \"{request['message']}\"\n")
    print(f"   Offers: {request['offers']}")
    print(f"   Reasoning: {request['reasoning']}")

    # Verify structure
    assert isinstance(request, dict), "Response must be a dict"
    assert "message" in request, "Must have 'message' field"
    assert "offers" in request, "Must have 'offers' field"
    assert "reasoning" in request, "Must have 'reasoning' field"
    assert isinstance(request['message'], str), "Message must be string"
    assert len(request['message']) > 0, "Message cannot be empty"

    print("\n✅ JSON structure validated")

except Exception as e:
    print(f"❌ FAILED: {e}")
    print("\nCheck your API key and internet connection!")
    sys.exit(1)

# === TEST 5: EVALUATE REQUEST (Gemini LLM) ===
print("\n" + "="*70)
print("TEST 5: Evaluate Request (Gemini LLM)")
print("="*70)

# Create a responder agent with surplus Insulin
responder_agent = HospitalAgent(
    name="District Hospital",
    location="Bannimantap",
    inventory={
        "Paracetamol": 900,
        "Amoxicillin": 350,
        "Ibuprofen": 1100,
        "Insulin": 1400,  # SURPLUS
        "ORS": 800,
    },
    thresholds={
        "Paracetamol": 500,
        "Amoxicillin": 400,
        "Ibuprofen": 400,
        "Insulin": 500,
        "ORS": 600,
    }
)

print(f"Responder: {responder_agent.name}")
print(f"   Insulin stock: {responder_agent.inventory['Insulin']} (threshold: {responder_agent.thresholds['Insulin']})")
print(f"   Surplus: {responder_agent.compute_surplus('Insulin')} units\n")
print("⏳ Calling Gemini API... (takes 2-5 seconds)")

try:
    response = responder_agent.evaluate_request(
        request=request,
        requester_name=test_agent.name,
        requester_location=test_agent.location
    )

    print("✅ RESPONSE GENERATED\n")
    print(f"   Decision: {response['decision']}")
    print(f"   Message: \"{response['message']}\"\n")
    print(f"   Reasoning: {response['reasoning']}")

    if response.get('counter_offer'):
        print(f"   Counter-offer: {response['counter_offer']}")

    # Verify structure
    assert isinstance(response, dict), "Response must be a dict"
    assert "decision" in response, "Must have 'decision' field"
    assert response['decision'] in ['accept', 'counter', 'reject'], "Invalid decision"
    assert "message" in response, "Must have 'message' field"
    assert "reasoning" in response, "Must have 'reasoning' field"

    print("\n✅ JSON structure validated")

except Exception as e:
    print(f"❌ FAILED: {e}")
    sys.exit(1)

# === TEST 6: GENERATE EXPLANATION (Gemini LLM) ===
print("\n" + "="*70)
print("TEST 6: Generate Trade Explanation (Gemini LLM)")
print("="*70)

# Simulate a trade
trade_details = {
    "donor": responder_agent.name,
    "donor_location": responder_agent.location,
    "receiver": test_agent.name,
    "receiver_location": test_agent.location,
    "medicines": {"Insulin": 350},
    "counter_medicines": {"Paracetamol": 200, "ORS": 100}
}

donor_inv_before = responder_agent.inventory.copy()
receiver_inv_before = test_agent.inventory.copy()

donor_inv_after = donor_inv_before.copy()
donor_inv_after["Insulin"] -= 350
donor_inv_after["Paracetamol"] += 200
donor_inv_after["ORS"] += 100

receiver_inv_after = receiver_inv_before.copy()
receiver_inv_after["Insulin"] += 350
receiver_inv_after["Paracetamol"] -= 200
receiver_inv_after["ORS"] -= 100

print("Trade scenario:")
print(f"   {responder_agent.name} gives: 350 Insulin")
print(f"   {test_agent.name} gives back: 200 Paracetamol, 100 ORS\n")
print("⏳ Calling Gemini API... (takes 2-5 seconds)")

try:
    explanation = responder_agent.generate_explanation(
        trade=trade_details,
        donor_inv_before=donor_inv_before,
        donor_inv_after=donor_inv_after,
        donor_thresholds=responder_agent.thresholds,
        receiver_inv_before=receiver_inv_before,
        receiver_inv_after=receiver_inv_after,
        receiver_thresholds=test_agent.thresholds
    )

    print("✅ EXPLANATION GENERATED\n")
    print(f"   \"{explanation}\"\n")

    # Verify it's plain text (not JSON)
    assert isinstance(explanation, str), "Explanation must be a string"
    assert len(explanation) > 50, "Explanation too short"
    assert "{" not in explanation, "Should be plain text, not JSON"

    print("✅ Plain text format validated")

except Exception as e:
    print(f"❌ FAILED: {e}")
    sys.exit(1)

# === FINAL SUMMARY ===
print("\n" + "="*70)
print("🎉 ALL TESTS PASSED!")
print("="*70)
print("\n✅ Pure Python methods:")
print("   - detect_shortages() ✓")
print("   - get_surpluses() ✓")
print("   - compute_surplus() ✓")
print("\n✅ Gemini LLM methods:")
print("   - generate_request() ✓")
print("   - evaluate_request() ✓")
print("   - generate_explanation() ✓")
print("\n🚀 Your agents are ready for the hackathon!")
print("\nNext step: Run the full dashboard with:")
print("   streamlit run app.py")
print("="*70)

# === SHOW API STATS ===
print("\n📊 API CALL STATISTICS")
print("="*70)

from llm_client import get_reasoning_stats, get_reasoning_log

stats = get_reasoning_stats()
print(f"Total API calls: {stats['total_calls']}")
print(f"Successful: {stats['successful_calls']}")
print(f"Failed: {stats['failed_calls']}")
print(f"Success rate: {stats['success_rate']:.1f}%")
print(f"Average latency: {stats['avg_latency_ms']}ms")
print(f"Total time: {stats['total_latency_ms']}ms")

print("\n💡 TIP: All API calls are logged in the reasoning log.")
print("   Enable 'Show AI Reasoning Log' in the Streamlit app to see them!")
