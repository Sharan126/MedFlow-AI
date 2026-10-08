"""
MedFlow-AI LLM Client Module
Wraps Google Gemini API with retry logic, structured output, and comprehensive logging.
Every call is audited for transparency and debugging.
"""

import time
import json
from datetime import datetime
from typing import Optional, Union, Any
from google import genai
from google.genai import types

from config import (
    GEMINI_API_KEY,
    MODEL_NAME,
    MAX_RETRIES,
    INITIAL_RETRY_DELAY,
    REQUEST_TIMEOUT,
    ENABLE_DEBUG_LOGGING
)

# === GLOBAL REASONING LOG ===
# Records every LLM interaction for full transparency and audit trails
REASONING_LOG: list[dict] = []

# === GEMINI CLIENT INITIALIZATION ===
try:
    client = genai.Client(api_key=GEMINI_API_KEY)
    if ENABLE_DEBUG_LOGGING:
        print(f"✅ Gemini client initialized successfully with model: {MODEL_NAME}")
except Exception as e:
    raise RuntimeError(f"Failed to initialize Gemini client: {str(e)}")


def ask_gemini(
    system_prompt: str,
    user_prompt: str,
    json_schema: Optional[dict] = None,
    temperature: float = 0.7,
    max_tokens: int = 2048
) -> Union[str, dict]:
    """
    Send a request to Gemini with automatic retries and structured output support.

    Args:
        system_prompt: Instructions for the AI agent's role and behavior
        user_prompt: The actual query or task for the agent
        json_schema: Optional JSON schema to enforce structured output
        temperature: Creativity level (0.0 = deterministic, 1.0 = creative)
        max_tokens: Maximum response length

    Returns:
        - dict: Parsed JSON if json_schema provided
        - str: Raw text response if no schema

    Raises:
        RuntimeError: If all retry attempts fail
    """

    start_time = time.time()
    attempt = 0
    last_error = None

    # Build generation config
    generation_config = types.GenerateContentConfig(
        temperature=temperature,
        max_output_tokens=max_tokens,
        response_modalities=["TEXT"]
    )

    # If JSON schema provided, enforce structured output
    if json_schema:
        generation_config.response_mime_type = "application/json"
        generation_config.response_schema = json_schema

    # Combine system and user prompts (Gemini uses single prompt)
    full_prompt = f"{system_prompt}\n\n{user_prompt}"

    while attempt < MAX_RETRIES:
        try:
            attempt += 1

            if ENABLE_DEBUG_LOGGING:
                print(f"🔄 Gemini API Call (Attempt {attempt}/{MAX_RETRIES})")
                print(f"   Model: {MODEL_NAME}")
                print(f"   JSON Schema: {'Yes' if json_schema else 'No'}")

            # Make the API call
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=full_prompt,
                config=generation_config
            )

            # Extract response text
            if not response.candidates or not response.candidates[0].content.parts:
                raise ValueError("Empty response received from Gemini")

            response_text = response.candidates[0].content.parts[0].text

            # Calculate latency
            latency_ms = int((time.time() - start_time) * 1000)

            # Parse JSON if schema was provided
            if json_schema:
                try:
                    parsed_response = json.loads(response_text)
                except json.JSONDecodeError as e:
                    raise ValueError(f"Gemini returned invalid JSON: {str(e)}\nResponse: {response_text}")
            else:
                parsed_response = response_text

            # Log successful call
            log_entry = {
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3],
                "model": MODEL_NAME,
                "system_prompt": system_prompt[:200] + "..." if len(system_prompt) > 200 else system_prompt,
                "user_prompt": user_prompt[:200] + "..." if len(user_prompt) > 200 else user_prompt,
                "response": str(parsed_response)[:300] + "..." if len(str(parsed_response)) > 300 else str(parsed_response),
                "full_response": parsed_response,  # Store complete response
                "latency_ms": latency_ms,
                "attempt": attempt,
                "json_schema_used": json_schema is not None,
                "temperature": temperature,
                "status": "SUCCESS"
            }

            REASONING_LOG.append(log_entry)

            if ENABLE_DEBUG_LOGGING:
                print(f"✅ Success! Latency: {latency_ms}ms")

            return parsed_response

        except Exception as e:
            last_error = e
            error_msg = str(e)

            # Log failed attempt
            log_entry = {
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3],
                "model": MODEL_NAME,
                "system_prompt": system_prompt[:200] + "..." if len(system_prompt) > 200 else system_prompt,
                "user_prompt": user_prompt[:200] + "..." if len(user_prompt) > 200 else user_prompt,
                "response": None,
                "full_response": None,
                "latency_ms": int((time.time() - start_time) * 1000),
                "attempt": attempt,
                "json_schema_used": json_schema is not None,
                "temperature": temperature,
                "status": "FAILED",
                "error": error_msg
            }

            REASONING_LOG.append(log_entry)

            if attempt < MAX_RETRIES:
                # Exponential backoff: 1s, 2s, 4s
                retry_delay = INITIAL_RETRY_DELAY * (2 ** (attempt - 1))

                if ENABLE_DEBUG_LOGGING:
                    print(f"⚠️  Attempt {attempt} failed: {error_msg}")
                    print(f"   Retrying in {retry_delay}s...")

                time.sleep(retry_delay)
            else:
                # Final failure - raise exception
                total_time = time.time() - start_time

                error_report = f"""
╔═══════════════════════════════════════════════════════════════╗
║  ❌ GEMINI API FAILURE - ALL RETRIES EXHAUSTED               ║
╠═══════════════════════════════════════════════════════════════╣
║  Attempts: {attempt}/{MAX_RETRIES}
║  Total Time: {total_time:.2f}s
║  Model: {MODEL_NAME}
║
║  Last Error: {error_msg}
║
║  This is a REAL API failure, not a fallback response.
║  Check your API key, quota, and network connection.
╚═══════════════════════════════════════════════════════════════╝
                """

                raise RuntimeError(error_report.strip())

    # Should never reach here, but safety net
    raise RuntimeError(f"Unexpected error in ask_gemini: {last_error}")


def get_reasoning_log() -> list[dict]:
    """
    Returns the complete reasoning log with all LLM interactions.

    Returns:
        List of log entries with timestamps, prompts, responses, and latencies
    """
    return REASONING_LOG.copy()


def clear_reasoning_log() -> None:
    """
    Clears the reasoning log. Useful when starting a new scenario.
    """
    global REASONING_LOG
    REASONING_LOG.clear()

    if ENABLE_DEBUG_LOGGING:
        print("🗑️  Reasoning log cleared")


def get_reasoning_stats() -> dict:
    """
    Returns aggregated statistics from the reasoning log.
    Useful for dashboards and performance monitoring.

    Returns:
        Dictionary with total calls, success rate, average latency, etc.
    """
    if not REASONING_LOG:
        return {
            "total_calls": 0,
            "successful_calls": 0,
            "failed_calls": 0,
            "success_rate": 0.0,
            "avg_latency_ms": 0,
            "total_latency_ms": 0,
            "calls_with_json_schema": 0
        }

    successful = [log for log in REASONING_LOG if log["status"] == "SUCCESS"]
    failed = [log for log in REASONING_LOG if log["status"] == "FAILED"]
    json_calls = [log for log in REASONING_LOG if log["json_schema_used"]]

    total_latency = sum(log["latency_ms"] for log in REASONING_LOG)
    avg_latency = total_latency / len(REASONING_LOG) if REASONING_LOG else 0

    return {
        "total_calls": len(REASONING_LOG),
        "successful_calls": len(successful),
        "failed_calls": len(failed),
        "success_rate": len(successful) / len(REASONING_LOG) * 100 if REASONING_LOG else 0,
        "avg_latency_ms": int(avg_latency),
        "total_latency_ms": total_latency,
        "calls_with_json_schema": len(json_calls)
    }


def export_reasoning_log(filepath: str = "reasoning_log.json") -> None:
    """
    Exports the reasoning log to a JSON file for post-demo analysis.

    Args:
        filepath: Path where the log should be saved
    """
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(REASONING_LOG, f, indent=2, ensure_ascii=False)

        print(f"✅ Reasoning log exported to: {filepath}")
    except Exception as e:
        print(f"❌ Failed to export reasoning log: {str(e)}")


# === INITIALIZATION MESSAGE ===
if ENABLE_DEBUG_LOGGING:
    print(f"✅ LLM Client ready | Model: {MODEL_NAME} | Max Retries: {MAX_RETRIES}")
