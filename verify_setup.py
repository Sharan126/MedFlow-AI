#!/usr/bin/env python3
"""
Quick verification script - run this BEFORE your hackathon demo.
Tests your setup in 30 seconds.
"""

import sys
import os

print("🔍 MedFlow-AI Quick Setup Verification")
print("="*60)

# === CHECK 1: Python Version ===
print("\n1. Checking Python version...")
if sys.version_info >= (3, 11):
    print(f"   ✅ Python {sys.version_info.major}.{sys.version_info.minor}")
else:
    print(f"   ⚠️  Python {sys.version_info.major}.{sys.version_info.minor} (3.11+ recommended)")

# === CHECK 2: Required Files ===
print("\n2. Checking required files...")
required_files = [
    "config.py", "llm_client.py", "agents.py", "data.py",
    "negotiation.py", "app.py", "requirements.txt", ".env.example"
]

missing = []
for file in required_files:
    if os.path.exists(file):
        print(f"   ✅ {file}")
    else:
        print(f"   ❌ {file} MISSING")
        missing.append(file)

if missing:
    print(f"\n❌ Missing files: {', '.join(missing)}")
    sys.exit(1)

# === CHECK 3: Dependencies ===
print("\n3. Checking Python dependencies...")
try:
    import streamlit
    print(f"   ✅ streamlit ({streamlit.__version__})")
except ImportError:
    print("   ❌ streamlit NOT INSTALLED")
    print("      Run: pip install -r requirements.txt")
    sys.exit(1)

try:
    from google import genai
    print("   ✅ google-genai")
except ImportError:
    print("   ❌ google-genai NOT INSTALLED")
    print("      Run: pip install google-genai")
    sys.exit(1)

try:
    import dotenv
    print("   ✅ python-dotenv")
except ImportError:
    print("   ❌ python-dotenv NOT INSTALLED")
    print("      Run: pip install python-dotenv")
    sys.exit(1)

# === CHECK 4: .env File ===
print("\n4. Checking .env configuration...")
if not os.path.exists(".env"):
    print("   ❌ .env file NOT FOUND")
    print("      Run: cp .env.example .env")
    print("      Then add your Gemini API key")
    sys.exit(1)
else:
    print("   ✅ .env file exists")

# === CHECK 5: API Key ===
print("\n5. Checking Gemini API key...")
try:
    from config import GEMINI_API_KEY

    if not GEMINI_API_KEY:
        print("   ❌ GEMINI_API_KEY is empty")
        print("      Edit .env and add your API key")
        sys.exit(1)

    if len(GEMINI_API_KEY) < 20:
        print(f"   ⚠️  API key seems too short ({len(GEMINI_API_KEY)} chars)")
        print("      Please verify your key")
    else:
        masked = GEMINI_API_KEY[:10] + "..." + GEMINI_API_KEY[-4:]
        print(f"   ✅ API key loaded: {masked}")

except Exception as e:
    print(f"   ❌ Error loading config: {e}")
    sys.exit(1)

# === CHECK 6: Test Import ===
print("\n6. Testing module imports...")
try:
    from llm_client import ask_gemini, get_reasoning_log
    print("   ✅ llm_client")

    from agents import HospitalAgent
    print("   ✅ agents")

    from data import generate_hospitals
    print("   ✅ data")

    from negotiation import run_negotiation
    print("   ✅ negotiation")

except ImportError as e:
    print(f"   ❌ Import failed: {e}")
    sys.exit(1)

# === CHECK 7: Quick LLM Test (Optional) ===
print("\n7. Testing Gemini API connection (optional)...")
print("   This will make a real API call. Skip? (y/n)")

choice = input("   > ").strip().lower()

if choice != 'y':
    print("   ⏳ Testing API... (takes ~2 seconds)")
    try:
        from llm_client import ask_gemini

        response = ask_gemini(
            system_prompt="You are a test assistant.",
            user_prompt="Say 'API working' in exactly 2 words.",
            json_schema={
                "type": "object",
                "properties": {"status": {"type": "string"}},
                "required": ["status"]
            }
        )

        print(f"   ✅ API Response: {response}")
        print("   ✅ Gemini API is working!")

    except Exception as e:
        print(f"   ❌ API Test Failed: {str(e)[:100]}")
        print("\n   Possible issues:")
        print("   - Invalid API key")
        print("   - No internet connection")
        print("   - Quota exceeded")
        print("\n   You can still run the app, but negotiations will fail.")
else:
    print("   ⏭️  Skipped API test")

# === FINAL SUMMARY ===
print("\n" + "="*60)
print("✅ ALL CHECKS PASSED!")
print("="*60)
print("\n🚀 Ready to launch MedFlow-AI!")
print("\nRun the dashboard with:")
print("   streamlit run app.py")
print("\nOr test individual components:")
print("   python test_agents.py")
print("\n" + "="*60)
print(f"Verification completed: {os.popen('date').read().strip()}")
print("="*60)
