"""
MedFlow-AI Configuration Module
Loads environment variables and exposes critical system parameters.
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

# === GEMINI API CONFIGURATION ===
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

if not GEMINI_API_KEY:
    error_msg = """
    ╔═══════════════════════════════════════════════════════════════╗
    ║  ❌ GEMINI_API_KEY NOT FOUND                                  ║
    ╠═══════════════════════════════════════════════════════════════╣
    ║  MedFlow-AI requires a valid Gemini API key to operate.      ║
    ║                                                                ║
    ║  Setup Instructions:                                           ║
    ║  1. Copy .env.example to .env                                  ║
    ║  2. Get your API key from:                                     ║
    ║     https://aistudio.google.com/app/apikey                     ║
    ║  3. Add to .env: GEMINI_API_KEY=your_key_here                 ║
    ║                                                                ║
    ║  Current .env path: {env_path}
    ╚═══════════════════════════════════════════════════════════════╝
    """.format(env_path=env_path.absolute())

    print(error_msg, file=sys.stderr)
    sys.exit(1)

# Validate API key format (basic sanity check)
if len(GEMINI_API_KEY) < 20:
    print(f"⚠️  WARNING: API key seems unusually short ({len(GEMINI_API_KEY)} chars). Please verify.", file=sys.stderr)

# === MODEL CONFIGURATION ===
# Using gemini-2.0-flash for speed and cost-efficiency in multi-agent scenarios
MODEL_NAME = os.getenv('MODEL_NAME', 'gemini-2.0-flash-exp')

# === RETRY CONFIGURATION ===
MAX_RETRIES = int(os.getenv('MAX_RETRIES', '3'))
INITIAL_RETRY_DELAY = float(os.getenv('INITIAL_RETRY_DELAY', '1.0'))  # seconds

# === PERFORMANCE TUNING ===
REQUEST_TIMEOUT = int(os.getenv('REQUEST_TIMEOUT', '30'))  # seconds
MAX_CONCURRENT_REQUESTS = int(os.getenv('MAX_CONCURRENT_REQUESTS', '5'))

# === LOGGING CONFIGURATION ===
ENABLE_DEBUG_LOGGING = os.getenv('ENABLE_DEBUG_LOGGING', 'false').lower() == 'true'
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO').upper()

# === SYSTEM INFO (for debugging) ===
def get_config_summary() -> dict:
    """Returns a sanitized summary of current configuration."""
    return {
        'model': MODEL_NAME,
        'max_retries': MAX_RETRIES,
        'retry_delay': INITIAL_RETRY_DELAY,
        'timeout': REQUEST_TIMEOUT,
        'api_key_configured': bool(GEMINI_API_KEY),
        'api_key_length': len(GEMINI_API_KEY) if GEMINI_API_KEY else 0,
        'debug_mode': ENABLE_DEBUG_LOGGING
    }

# Startup validation message
if ENABLE_DEBUG_LOGGING:
    print("✅ MedFlow-AI Configuration Loaded Successfully")
    print(f"   Model: {MODEL_NAME}")
    print(f"   Max Retries: {MAX_RETRIES}")
    print(f"   API Key: {'*' * (len(GEMINI_API_KEY) - 4)}{GEMINI_API_KEY[-4:]}")
