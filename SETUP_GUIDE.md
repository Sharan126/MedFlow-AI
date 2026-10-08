# 🚀 MedFlow-AI Setup Guide

**Last Updated:** October 8, 2026

This guide will get MedFlow-AI running in under 5 minutes.

---

## ✅ Pre-Flight Checklist

Before you start, make sure you have:

- [ ] Python 3.11 or higher installed
- [ ] Internet connection
- [ ] Google Gemini API key ([Get it here](https://aistudio.google.com/app/apikey))

---

## 📦 Step 1: Install Dependencies

Open your terminal in the MedFlow-AI directory and run:

```bash
pip install -r requirements.txt
```

**Expected output:**
```
Successfully installed streamlit-1.32.0 google-genai-0.8.0 python-dotenv-1.0.0
```

**Troubleshooting:**
- If `pip` is not found, try `python -m pip install -r requirements.txt`
- If you get permission errors on Linux/Mac, use `pip install --user -r requirements.txt`

---

## 🔑 Step 2: Configure API Key

### Option A: Copy the template (Recommended)

**Windows:**
```bash
copy .env.example .env
```

**Linux/Mac:**
```bash
cp .env.example .env
```

### Option B: Create manually

Create a new file named `.env` (note the leading dot) with this content:

```bash
GEMINI_API_KEY=your_actual_api_key_here
```

### Get Your Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key (starts with `AIza...`)
4. Paste it into `.env` after `GEMINI_API_KEY=`

**Your `.env` should look like:**
```bash
GEMINI_API_KEY=AIzaSyABC123...your_real_key...XYZ789
```

⚠️ **Important:** Never commit `.env` to git! It's already in `.gitignore`.

---

## 🧪 Step 3: Test the Setup

Run this quick test to verify everything works:

```bash
python -c "from config import GEMINI_API_KEY; print('✅ Config loaded!'); print(f'API Key: {GEMINI_API_KEY[:10]}...')"
```

**Expected output:**
```
✅ Config loaded!
API Key: AIzaSyABC1...
```

**If you see an error:**
- Check that `.env` exists in the MedFlow-AI directory
- Verify your API key is on the line starting with `GEMINI_API_KEY=`
- Make sure there are no spaces around the `=` sign

---

## 🎮 Step 4: Launch the Dashboard

Start the Streamlit app:

```bash
streamlit run app.py
```

**Expected output:**
```
  You can now view your Streamlit app in your browser.

  Local URL: http://localhost:8501
  Network URL: http://192.168.x.x:8501
```

The dashboard will automatically open in your browser at `http://localhost:8501`

**If the browser doesn't open:**
- Manually navigate to `http://localhost:8501`
- Check that port 8501 is not in use by another app

---

## 🎯 Step 5: Run Your First Negotiation

### In the Streamlit Dashboard:

1. **Generate Scenario**
   - Click "🔄 Generate New Scenario" in the sidebar
   - You'll see 3 hospitals with randomized inventories
   - At least one hospital will have a critical shortage (red 🔴)

2. **Start Negotiation**
   - Click "🚀 Start Negotiation" in the sidebar
   - Watch the AI agents negotiate in real-time (takes 10-20 seconds)
   - You'll see all messages in the "Live Negotiation Feed"

3. **Review the Trade**
   - A yellow box appears: "⚠️ Trade Awaiting Human Verification"
   - Read the AI explanation
   - Check the inventory impact (expand "View Inventory Impact")

4. **Make Your Decision**
   - Click "✅ APPROVE TRADE" to execute it
   - OR click "❌ REJECT TRADE" to cancel
   - Hospital inventories update immediately on approval

5. **Inspect AI Reasoning** (Optional)
   - Toggle "🧠 Show AI Reasoning Log" in the sidebar
   - See every Gemini API call with prompts and responses
   - This proves all negotiation is real LLM-powered!

---

## 🔍 Verification Checklist

After your first negotiation, verify:

- [ ] You saw multiple events in the negotiation feed
- [ ] Each message has AI reasoning (expandable)
- [ ] The trade proposal shows before/after inventories
- [ ] After approval, hospital cards update with new stock levels
- [ ] Trade appears in "Trade History Log" at the bottom
- [ ] API statistics show successful calls (if reasoning log enabled)

---

## 🐛 Common Issues & Fixes

### Issue: "GEMINI_API_KEY NOT FOUND"

**Fix:**
```bash
# Verify .env exists
ls -la .env  # Linux/Mac
dir .env     # Windows

# If missing, create it:
echo "GEMINI_API_KEY=your_key_here" > .env
```

### Issue: "All retries exhausted"

**Possible causes:**
1. **Invalid API key** - Double-check your key at [AI Studio](https://aistudio.google.com/app/apikey)
2. **Quota exceeded** - Check your usage limits in AI Studio
3. **Network issues** - Verify internet connection

**Fix:**
```bash
# Enable debug logging to see detailed errors
echo "ENABLE_DEBUG_LOGGING=true" >> .env

# Restart the app
streamlit run app.py
```

### Issue: "ModuleNotFoundError: No module named 'google.genai'"

**Fix:**
```bash
# Make sure you install the NEW google-genai package
pip uninstall google-generativeai  # Remove old package if present
pip install google-genai           # Install new package
```

### Issue: Streamlit page is blank

**Fix:**
```bash
# Clear Streamlit cache
streamlit cache clear

# Restart the app
streamlit run app.py
```

### Issue: "Port 8501 is already in use"

**Fix:**
```bash
# Run on a different port
streamlit run app.py --server.port 8502
```

---

## 🎓 Advanced Configuration

Edit `.env` to customize behavior:

```bash
# Use different model (if available)
MODEL_NAME=gemini-2.5-flash

# Increase retries for unreliable networks
MAX_RETRIES=5

# Enable detailed logging
ENABLE_DEBUG_LOGGING=true

# Adjust timeouts
REQUEST_TIMEOUT=60
```

---

## 🏆 Demo Day Tips

### Before the Judges Arrive:

1. **Test with a fixed seed:**
   ```python
   # In app.py line 59, temporarily change:
   st.session_state.hospitals = generate_hospitals(seed=123)
   # This makes demos reproducible
   ```

2. **Practice your pitch:**
   - "This is NOT scripted - every message comes from Gemini in real-time"
   - "Watch the reasoning log to see actual API calls"
   - "Human approval prevents unsafe trades"

3. **Have backup scenarios ready:**
   - Run "Generate New Scenario" 2-3 times before your slot
   - Pick the one with the most dramatic shortage

4. **Enable reasoning log for judges:**
   - Toggle it ON to show transparency
   - Point out latency (proves real API calls)

### During the Demo:

1. **Show the crisis first** - Point to the red 🔴 critical shortage
2. **Start negotiation** - Let judges watch agents negotiate live
3. **Explain one message** - Open the reasoning to show the AI prompt
4. **Review the trade proposal** - Show the AI explanation
5. **Approve it** - Watch inventories update in real-time
6. **Generate new scenario** - Prove every run is different

### If Something Breaks:

- **Gemini API timeout?** → "This proves we're using real APIs, not fakes!"
- **Unexpected response?** → Show the reasoning log to diagnose
- **Judge questions hardcoded logic?** → Show the prompts in reasoning log

---

## 📊 Performance Benchmarks

Expected performance on stable internet:

| Operation | Time | API Calls |
|-----------|------|-----------|
| Generate Scenario | <1s | 0 |
| Full Negotiation | 10-20s | 4-6 |
| Trade Approval | <1s | 0 |
| Explanation Generation | 2-4s | 1 |

**Total demo time:** ~30 seconds for a complete cycle

---

## 🔧 Development Mode

For debugging and development:

```bash
# Run with auto-reload
streamlit run app.py --server.runOnSave true

# Show debug toolbar
streamlit run app.py --client.showErrorDetails true

# Run in headless mode (for servers)
streamlit run app.py --server.headless true
```

---

## 📝 Project Structure

```
MedFlow-AI/
├── app.py              # Streamlit dashboard (main entry point)
├── agents.py           # Hospital agent class with LLM negotiation
├── config.py           # Configuration and environment loading
├── data.py             # Scenario generator
├── llm_client.py       # Gemini API wrapper
├── negotiation.py      # Multi-round negotiation orchestrator
├── requirements.txt    # Python dependencies
├── .env.example        # Template for environment variables
├── .env                # Your actual API key (DO NOT COMMIT)
├── README.md           # Project overview and documentation
└── SETUP_GUIDE.md      # This file
```

---

## ✅ Final Checklist

Before your hackathon demo:

- [ ] `.env` file created with valid API key
- [ ] All dependencies installed (`pip install -r requirements.txt`)
- [ ] App starts successfully (`streamlit run app.py`)
- [ ] Generated at least one scenario
- [ ] Completed one full negotiation
- [ ] Approved one trade and saw inventories update
- [ ] Checked AI reasoning log to verify real API calls
- [ ] Practiced your 2-minute pitch

---

## 🎉 You're Ready!

MedFlow-AI is now fully operational. Good luck with your hackathon!

**Need help?** Check the [README.md](README.md) for architecture details and troubleshooting.

---

<div align="center">

**Built to win. Zero compromises. Real AI. Human verification.**

🏆 Let's revolutionize healthcare supply chains! 🏆

</div>
