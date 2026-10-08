"""
MedFlow-AI LLM Client Module
Wraps Google Gemini API with retry logic, structured output, and comprehensive logging.
Every call is audited for transparency and debugging.
"""

import os
import time
import json
import requests
from datetime import datetime
from typing import Optional, Union, Any

try:
    from google import genai  # type: ignore
    from google.genai import types  # type: ignore
except ImportError:
    genai: Any = None
    types: Any = None

from config import (
    GEMINI_API_KEY,
    GROK_API_KEY,
    LLM_PROVIDER,
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
    client: Any = genai.Client(api_key=GEMINI_API_KEY) if (genai is not None and GEMINI_API_KEY) else None
    if ENABLE_DEBUG_LOGGING and client:
        print(f"Gemini client initialized successfully with model: {MODEL_NAME}")
except Exception:
    client = None


def ask_gemini(
    system_prompt: str,
    user_prompt: str,
    json_schema: Optional[dict] = None,
    temperature: float = 0.7,
    max_tokens: int = 2048
) -> Any:
    """
    Send a request to Gemini or Grok with automatic retries and structured output support.
    """
    start_time = time.time()
    attempt = 0
    last_error = None

    # Check if using Grok API
    if LLM_PROVIDER == 'grok':
        if not GROK_API_KEY:
            raise RuntimeError("GROK_API_KEY is not configured in .env")

        headers = {
            "Authorization": f"Bearer {GROK_API_KEY}",
            "Content-Type": "application/json"
        }
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": user_prompt})

        payload: dict[str, Any] = {
            "model": MODEL_NAME,
            "messages": messages,
            "temperature": temperature
        }
        if json_schema:
            payload["response_format"] = {"type": "json_object"}

        while attempt < MAX_RETRIES:
            try:
                attempt += 1
                if ENABLE_DEBUG_LOGGING:
                    print(f"Grok API Call (Attempt {attempt}/{MAX_RETRIES})")
                    print(f"   Model: {MODEL_NAME}")

                resp = requests.post(
                    "https://api.x.ai/v1/chat/completions",
                    headers=headers,
                    json=payload,
                    timeout=REQUEST_TIMEOUT
                )

                if resp.status_code != 200:
                    raise ValueError(f"Grok API Error {resp.status_code}: {resp.text}")

                res_json = resp.json()
                response_text = res_json["choices"][0]["message"]["content"]

                latency_ms = int((time.time() - start_time) * 1000)

                if json_schema:
                    try:
                        parsed_response = json.loads(response_text)
                    except json.JSONDecodeError as e:
                        raise ValueError(f"Grok returned invalid JSON: {str(e)}\nResponse: {response_text}")
                else:
                    parsed_response = response_text

                formatted_response_str = (
                    json.dumps(parsed_response, indent=2)
                    if isinstance(parsed_response, (dict, list))
                    else str(parsed_response)
                )

                log_entry = {
                    "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3],
                    "model": f"grok ({MODEL_NAME})",
                    "system_prompt": system_prompt,
                    "user_prompt": user_prompt,
                    "response": formatted_response_str,
                    "full_response": parsed_response,
                    "latency_ms": latency_ms,
                    "attempt": attempt,
                    "json_schema_used": json_schema is not None,
                    "temperature": temperature,
                    "status": "SUCCESS"
                }
                REASONING_LOG.append(log_entry)
                return parsed_response

            except Exception as e:
                last_error = e
                error_msg = str(e)
                log_entry = {
                    "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3],
                    "model": f"grok ({MODEL_NAME})",
                    "system_prompt": system_prompt,
                    "user_prompt": user_prompt,
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
                    retry_delay = INITIAL_RETRY_DELAY * (2 ** (attempt - 1))
                    time.sleep(retry_delay)
                else:
                    total_time = time.time() - start_time
                    raise RuntimeError(f"GROK API FAILURE - ALL RETRIES EXHAUSTED: {error_msg}")

    # Fallback to Gemini API
    if types is None or genai is None:
        raise RuntimeError("Google GenAI SDK is not installed. Please run: pip install google-genai")

    generation_config: Any = types.GenerateContentConfig(
        temperature=temperature,
        max_output_tokens=max_tokens,
        system_instruction=system_prompt if system_prompt else None
    )

    if json_schema:
        generation_config.response_mime_type = "application/json"
        generation_config.response_schema = json_schema

    prompt_content = user_prompt

    global client
    if client is None:
        try:
            client = genai.Client(api_key=GEMINI_API_KEY)
        except Exception as e:
            raise RuntimeError(f"Failed to initialize Gemini client: {str(e)}")

    while attempt < MAX_RETRIES:
        try:
            attempt += 1

            if ENABLE_DEBUG_LOGGING:
                print(f"Gemini API Call (Attempt {attempt}/{MAX_RETRIES})")
                print(f"   Model: {MODEL_NAME}")
                print(f"   JSON Schema: {'Yes' if json_schema else 'No'}")

            # Make the API call
            active_model = os.getenv("MODEL_NAME", MODEL_NAME)
            try:
                response = client.models.generate_content(
                    model=active_model,
                    contents=prompt_content,
                    config=generation_config
                )
            except Exception as call_err:
                err_str = str(call_err)
                if "no longer available" in err_str or "NOT_FOUND" in err_str or "404" in err_str:
                    # Cloud deprecation fallback to working flash model
                    active_model = "gemini-3.5-flash"
                    response = client.models.generate_content(
                        model=active_model,
                        contents=prompt_content,
                        config=generation_config
                    )
                else:
                    raise call_err

            # Extract response text safely
            response_text = response.text if hasattr(response, "text") and response.text else None
            if not response_text and hasattr(response, "candidates") and response.candidates:
                first_cand = response.candidates[0]
                content = getattr(first_cand, "content", None)
                parts = getattr(content, "parts", None) if content else None
                if parts and len(parts) > 0:
                    response_text = getattr(parts[0], "text", None)
            if not response_text:
                raise ValueError("Empty response received from Gemini")

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

            formatted_response_str = (
                json.dumps(parsed_response, indent=2)
                if isinstance(parsed_response, (dict, list))
                else str(parsed_response)
            )

            # Log successful call
            log_entry = {
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3],
                "model": MODEL_NAME,
                "system_prompt": system_prompt,
                "user_prompt": user_prompt,
                "response": formatted_response_str,
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
                "system_prompt": system_prompt,
                "user_prompt": user_prompt,
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
