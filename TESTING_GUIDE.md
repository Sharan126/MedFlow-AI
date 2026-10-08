# 🧪 MedFlow-AI Testing & Verification Guide

**Last Updated:** October 8, 2026 at 13:27 UTC

This document explains how to test and verify every component of MedFlow-AI before your hackathon demo.

---

## 🎯 Pre-Demo Checklist (5 Minutes)

### Step 1: Run Quick Verification
```bash
python verify_setup.py
```

**This checks:**
- ✅ Python version (3.11+)
- ✅ All required files exist
- ✅ Dependencies installed
- ✅ .env file configured
- ✅ API key loaded
- ✅ Gemini API connection working

**Expected output:**
```
✅ ALL CHECKS PASSED!
🚀 Ready to launch MedFlow-AI!
```

**If verification fails:** Follow the error messages. Common issues:
- Missing .env file → `cp .env.example .env`
- Missing dependencies → `pip install -r requirements.txt`
- Invalid API key → Check https://aistudio.google.com/app/apikey

---

### Step 2: Test Individual Agent Methods
```bash
python test_agents.py
```

**This tests each method standalone:**

#### Pure Python Methods (No API calls):
1. ✅ `detect_shortages()` - Finds medicines below thresholds
2. ✅ `get_surpluses()` - Finds medicines above thresholds
3. ✅ `compute_surplus()` - Calculates available surplus

#### Gemini LLM Methods (Real API calls):
4. ✅ `generate_request()` - Creates negotiation request
5. ✅ `evaluate_request()` - Evaluates and responds to request
6. ✅ `generate_explanation()` - Creates human-readable explanation

**Expected output:**
```
🎉 ALL TESTS PASSED!

✅ Pure Python methods:
   - detect_shortages() ✓
   - get_surpluses() ✓
   - compute_surplus() ✓

✅ Gemini LLM methods:
   - generate_request() ✓
   - evaluate_request() ✓
   - generate_explanation() ✓

🚀 Your agents are ready for the hackathon!
```

**Timing:** Each LLM method takes 2-5 seconds. Total test time: ~15-20 seconds.

---

### Step 3: Launch Full Dashboard
```bash
streamlit run app.py
```

**Browser opens at:** http://localhost:8501

**Quick Demo Test:**
1. Click "🔄 Generate New Scenario" (should take <1 second)
2. Click "🚀 Start Negotiation" (should take 10-20 seconds)
3. Review the trade proposal
4. Click "✅ APPROVE TRADE"
5. Verify hospital inventories updated
6. Check "Trade History Log" has 1 entry

**If successful:** You're ready to demo! 🎉

---

## 🔬 Detailed Component Testing

### Testing config.py
```bash
python -c "from config import GEMINI_API_KEY, MODEL_NAME; print(f'Model: {MODEL_NAME}'); print(f'Key: {GEMINI_API_KEY[:10]}...')"
```

**Expected:**
```
Model: gemini-2.0-flash-exp
Key: AIzaSyABC1...
```

---

### Testing llm_client.py

#### Test 1: Plain Text Response
```bash
python -c "from llm_client import ask_gemini; print(ask_gemini('You are helpful', 'Say hello in 2 words'))"
```

**Expected:** A 2-word greeting (e.g., "Hello there", "Hi friend")

#### Test 2: JSON Response
```bash
python -c "from llm_client import ask_gemini; import json; schema={'type':'object','properties':{'greeting':{'type':'string'}},'required':['greeting']}; print(json.dumps(ask_gemini('You are helpful', 'Say hello', json_schema=schema), indent=2))"
```

**Expected:**
```json
{
  "greeting": "Hello! How can I help you?"
}
```

#### Test 3: Reasoning Log
```bash
python -c "from llm_client import ask_gemini, get_reasoning_stats; ask_gemini('test', 'test'); print(get_reasoning_stats())"
```

**Expected:** Stats with at least 1 successful call

---

### Testing agents.py

**Full test suite:** Run `python test_agents.py` (detailed above)

**Quick test of HospitalAgent:**
```python
from agents import HospitalAgent

agent = HospitalAgent(
    name="Test Hospital",
    location="Test City",
    inventory={"Insulin": 200},
    thresholds={"Insulin": 500}
)

shortages = agent.detect_shortages()
print(f"Shortages: {shortages}")
```

**Expected:** One critical shortage for Insulin (deficit: 300)

---

### Testing data.py

```bash
python -c "from data import generate_hospitals, get_scenario_summary; agents=generate_hospitals(seed=42); summary=get_scenario_summary(agents); print(f'Crisis: {summary[\"crisis_hospital\"]} needs {summary[\"crisis_medicine\"]}')"
```

**Expected:** Same crisis every time with seed=42 (reproducible)

---

### Testing negotiation.py

**This requires real API calls, so run the full test:**
```bash
python negotiation.py
```

**Expected:** Negotiation events logged, pending trade generated

---

## 🏆 Demo Day Testing Protocol

### 30 Minutes Before Your Slot:

1. **Run verify_setup.py**
   ```bash
   python verify_setup.py
   ```
   Confirm all checks pass.

2. **Run test_agents.py**
   ```bash
   python test_agents.py
   ```
   Confirm all 6 methods work.

3. **Launch dashboard in background**
   ```bash
   streamlit run app.py &
   ```

4. **Generate 3 test scenarios**
   - Click "Generate New Scenario" 3 times
   - Pick the most dramatic one (highest deficit)
   - Remember which scenario you picked

5. **Practice your pitch** (2 minutes)
   - Show the crisis
   - Start negotiation
   - Point to reasoning log
   - Approve trade
   - Show updated inventories

### During Your Demo:

If judges ask you to prove it's real AI:
1. Toggle "🧠 Show AI Reasoning Log"
2. Expand any API call
3. Show them the actual prompts and responses
4. Point out the timestamps and latency

---

## 🐛 Troubleshooting Common Issues

### Issue: "GEMINI_API_KEY NOT FOUND"

**Diagnosis:**
```bash
ls -la .env
cat .env
```

**Fix:**
```bash
cp .env.example .env
nano .env  # or your editor
# Add: GEMINI_API_KEY=your_actual_key
```

---

### Issue: "All retries exhausted"

**Diagnosis:**
```bash
python -c "from config import GEMINI_API_KEY; print(f'Key length: {len(GEMINI_API_KEY)}')"
```

**Possible causes:**
1. Invalid API key → Verify at https://aistudio.google.com/app/apikey
2. Quota exceeded → Check usage in AI Studio
3. Network issues → Test: `curl https://generativelanguage.googleapis.com`

**Fix:**
1. Get fresh API key from AI Studio
2. Update .env
3. Restart Python/Streamlit

---

### Issue: "ModuleNotFoundError: No module named 'google.genai'"

**Fix:**
```bash
pip uninstall google-generativeai  # Remove old package
pip install google-genai           # Install new SDK
```

---

### Issue: Slow API responses (>10 seconds)

**Diagnosis:**
```bash
python -c "from llm_client import ask_gemini; import time; start=time.time(); ask_gemini('test','test'); print(f'Time: {time.time()-start:.1f}s')"
```

**Expected:** 1-3 seconds for gemini-2.0-flash

**If slower:**
- Check network speed
- Try different model in .env: `MODEL_NAME=gemini-1.5-flash`
- Reduce temperature: Edit llm_client.py line 47

---

### Issue: Streamlit page blank/crashes

**Fix:**
```bash
streamlit cache clear
rm -rf ~/.streamlit/
streamlit run app.py
```

---

### Issue: JSON parsing errors

**Diagnosis:** Check reasoning log in Streamlit app

**Common cause:** Gemini returned text instead of JSON

**Fix:** The code already uses `response_mime_type="application/json"` which forces JSON. If still happening, it's a Gemini API issue. Retry will usually fix it.

---

## 📊 Performance Benchmarks

Expected timings on stable internet:

| Operation | Time | API Calls | Notes |
|-----------|------|-----------|-------|
| Generate Scenario | <0.5s | 0 | Pure Python |
| Detect Shortages | <0.01s | 0 | Pure Python |
| Generate Request | 2-4s | 1 | Gemini call |
| Evaluate Request | 2-4s | 1 | Gemini call |
| Full Negotiation | 10-20s | 4-6 | Multiple agents |
| Generate Explanation | 2-4s | 1 | Gemini call |
| Approve Trade | <0.5s | 0 | Pure Python |

**Total demo cycle:** ~30 seconds from scenario to approved trade

---

## 🎯 Success Criteria

Before your demo, verify:

- [ ] `verify_setup.py` shows all checks passed
- [ ] `test_agents.py` shows all 6 methods working
- [ ] Dashboard loads at http://localhost:8501
- [ ] Can generate different scenarios (click 3+ times)
- [ ] Negotiation completes in 10-20 seconds
- [ ] Trade proposal shows AI explanation
- [ ] Approving trade updates inventories
- [ ] Trade history records approved trade
- [ ] Reasoning log shows real API calls
- [ ] Can repeat cycle without errors

---

## 📝 Test Results Log

Use this template to document your testing:

```
=== MedFlow-AI Pre-Demo Test Results ===
Date: October 8, 2026
Tester: [Your Name]

verify_setup.py:        [ ] PASS  [ ] FAIL
test_agents.py:         [ ] PASS  [ ] FAIL
Dashboard Launch:       [ ] PASS  [ ] FAIL
Generate Scenario:      [ ] PASS  [ ] FAIL
Start Negotiation:      [ ] PASS  [ ] FAIL
Approve Trade:          [ ] PASS  [ ] FAIL
Reasoning Log Visible:  [ ] PASS  [ ] FAIL

Average Negotiation Time: _____ seconds
API Success Rate: _____% 

Notes:
_________________________________________________
_________________________________________________

Ready for Demo: [ ] YES  [ ] NO
```

---

## 🔍 Advanced Testing (Optional)

### Test with Different Seeds
```bash
python -c "from data import generate_hospitals; [print(f'Seed {i}: {generate_hospitals(seed=i)[0].detect_shortages()[0][\"medicine\"]}') for i in range(5)]"
```

**Expected:** Different medicines in shortage each time

### Test Concurrent Negotiations
```python
from data import generate_hospitals
from negotiation import run_negotiation

for i in range(3):
    print(f"\n=== Negotiation {i+1} ===")
    agents = generate_hospitals()
    result = run_negotiation(agents)
    print(f"Events: {len(result['events'])}")
    print(f"Trade: {result['pending_trade'] is not None}")
```

**Expected:** All 3 negotiations succeed

### Export Reasoning Log
```python
from llm_client import export_reasoning_log
export_reasoning_log("demo_reasoning.json")
```

**Expected:** JSON file with all API calls

---

## 🎓 Understanding Test Outputs

### What "✅ API Response: {...}" means
This is a real Gemini API response parsed as JSON. The structure proves:
1. API key is valid
2. Network connection works
3. JSON schema enforcement works
4. Response parsing works

### What "⏳ Calling Gemini API..." means
A real HTTP request is being made to Gemini's servers. The 2-5 second delay is:
- Network latency (~100-500ms)
- Gemini processing time (~1-3s)
- Response parsing (~100ms)

This is NOT a fake delay or sleep statement.

### What "Latency: XXXms" means
Actual round-trip time from Python to Gemini and back, measured in milliseconds.

---

## 💡 Pro Tips

1. **Test with fixed seed during practice:**
   ```python
   # In app.py, line 59:
   st.session_state.hospitals = generate_hospitals(seed=123)
   ```

2. **Enable debug logging for troubleshooting:**
   ```bash
   echo "ENABLE_DEBUG_LOGGING=true" >> .env
   ```

3. **Reduce latency by decreasing temperature:**
   Lower temperature = faster responses
   Edit `llm_client.py` line 47: `temperature=0.3`

4. **Export reasoning log before demo:**
   Keep a backup in case internet fails during demo

5. **Have mobile hotspot ready:**
   If venue WiFi is slow, use your phone

---

## ✅ Final Sign-Off

Before leaving for the hackathon venue:

```
I have verified:
[ ] All Python files exist and import correctly
[ ] .env file has valid Gemini API key
[ ] verify_setup.py passes all checks
[ ] test_agents.py shows 6/6 methods working
[ ] Dashboard loads and works end-to-end
[ ] Practiced 2-minute pitch
[ ] Have backup API key ready
[ ] Exported reasoning log as proof
[ ] Tested on venue WiFi (if possible)

Signed: ________________  Date: Oct 8, 2026
```

---

**🏆 You're ready to win this hackathon!**

Good luck! 🚀
