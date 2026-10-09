# 🏥 MedFlow-AI

**Self-Healing Medical Supply Chain with Multi-Agent LLM Negotiation**

> Real AI agents. Human verification. Full audit trail. Zero fallbacks.

![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)
![Gemini](https://img.shields.io/badge/Gemini-2.0--flash-orange.svg)
![Streamlit](https://img.shields.io/badge/Streamlit-1.32+-red.svg)

---

## 🎯 What is MedFlow-AI?

MedFlow-AI is an autonomous medical supply chain system where **hospital AI agents negotiate in real-time** to solve critical medicine shortages. Each agent is powered by Google Gemini and makes its own decisions—no hardcoded logic, no fake responses.

### 🌟 Key Features

- ✅ **Real LLM Negotiation** - Every message comes from Gemini, not templates
- ✅ **Multi-Agent System** - 3 hospital agents negotiate autonomously
- ✅ **Human-in-the-Loop** - All trades require administrator approval
- ✅ **Full Transparency** - Complete audit trail of every AI decision
- ✅ **Safety First** - No hospital drops below safety thresholds
- ✅ **Supply Chain Assistant** - Read-only chat grounded in current hospital inventories and trade records
- ✅ **Zero Fallbacks** - If Gemini fails, the system fails loudly (no fake responses)

---

## 🚀 Quick Start

### Prerequisites

- Python 3.11 or higher
- Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

### Installation

```bash
# 1. Clone or navigate to the project directory
cd MedFlow-AI

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure your API key
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# 4. Run the dashboard
streamlit run app.py
```

The dashboard will open at `http://localhost:8501`

---

## 🎮 How to Use

### Step 1: Generate Scenario
Click **"Generate New Scenario"** in the sidebar. This creates:
- 3 hospitals with randomized inventories
- At least 1 critical medicine shortage
- Complementary surpluses (so trades are possible)

### Step 2: Start Negotiation
Click **"Start Negotiation"**. Watch as:
1. AI detects the most critical shortage
2. Requester agent generates a negotiation request (via Gemini)
3. Other agents evaluate and respond (each via Gemini)
4. System picks the best offer

### Step 3: Human Verification
Review the proposed trade:
- ✅ **Approve** - Execute the trade and update inventories
- ❌ **Reject** - Record rejection, no changes made

### Step 4: View Results
- Check updated hospital inventories
- Review trade history (both approved and rejected)
- Inspect AI reasoning logs to see every Gemini API call

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Streamlit Dashboard                       │
│                         (app.py)                             │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴──────────┬──────────────────┐
         │                      │                   │
         ▼                      ▼                   ▼
┌────────────────┐    ┌──────────────────┐  ┌─────────────┐
│ negotiation.py │    │    agents.py     │  │   data.py   │
│ (Orchestrator) │    │ (Hospital Agents)│  │ (Scenarios) │
└────────┬───────┘    └────────┬─────────┘  └─────────────┘
         │                     │
         │            ┌────────┴──────────┐
         │            │                   │
         ▼            ▼                   ▼
    ┌────────────────────────┐    ┌─────────────┐
    │   llm_client.py        │    │  config.py  │
    │ (Gemini API Wrapper)   │    │  (Settings) │
    └───────────┬────────────┘    └─────────────┘
                │
                ▼
        ┌──────────────────┐
        │  Google Gemini   │
        │  (gemini-2.0)    │
        └──────────────────┘
```

### Core Components

| File | Purpose |
|------|---------|
| **config.py** | Environment configuration, API key validation |
| **llm_client.py** | Gemini API wrapper with retry logic & logging |
| **agents.py** | Hospital agent class with LLM-powered negotiation |
| **data.py** | Scenario generator with guaranteed shortages |
| **negotiation.py** | Multi-round negotiation orchestrator |
| **chatbot.py** | Read-only assistant grounded in the current supply chain data |
| **chatbot_dataset.json** | Curated FAQ examples and answer guidance retrieved for relevant questions; live state remains the only source of facts |
| **server.py** | FastAPI backend for the React frontend, including `/api/chat` |
| **app.py** | Streamlit dashboard UI |

---

## 🧠 How AI Negotiation Works

### 1. Shortage Detection (Pure Python)
```python
shortages = agent.detect_shortages()
# Returns: [{"medicine": "Insulin", "deficit": 350, "severity": "critical"}]
```

### 2. Request Generation (Gemini LLM)
```python
request = agent.generate_request(shortage)
# Gemini creates: {"message": "...", "offers": {...}, "reasoning": "..."}
```

### 3. Response Evaluation (Gemini LLM)
```python
response = agent.evaluate_request(request)
# Gemini decides: {"decision": "accept"|"counter"|"reject", ...}
```

### 4. Human Explanation (Gemini LLM)
```python
explanation = agent.generate_explanation(trade, inventories)
# Gemini writes: "This trade solves... It is safe because... Without it..."
```

**Every negotiation message is generated by Gemini in real-time. Zero hardcoded responses.**

---

## 📊 AI Reasoning Transparency

Enable **"Show AI Reasoning Log"** in the sidebar to see:
- Every Gemini API call with timestamp
- System and user prompts sent to the model
- Full JSON responses from Gemini
- Latency and success/failure status

This proves to judges that **all negotiation is real LLM-powered**, not scripted.

---

## 🎯 Design Decisions (Why Judges Will Love This)

### 1. **No Fallbacks = Full Transparency**
If Gemini fails after 3 retries, the app shows a clear error. We never fake responses.

### 2. **JSON Schema Enforcement**
All LLM responses use `response_mime_type="application/json"` with strict schemas. No parsing errors, no hallucinations.

### 3. **Complete Audit Trail**
`REASONING_LOG` captures every API call with:
- Timestamp (millisecond precision)
- Full prompts and responses
- Latency tracking
- Success/failure status

### 4. **Safety-First Architecture**
- Every trade validated before execution
- Hospitals never drop below safety thresholds
- Human approval is the final gate

### 5. **Reproducible Scenarios**
`generate_hospitals(seed=42)` creates identical scenarios for testing. Perfect for debugging and demos.

---

## 🏆 Hackathon Demo Tips

### For a Flawless Demo:

1. **Test your API key first:**
   ```python
   python -c "from llm_client import ask_gemini; print(ask_gemini('Say hi', 'Hi'))"
   ```

2. **Use fixed seed for practice:**
   ```python
   # In app.py, temporarily replace:
   st.session_state.hospitals = generate_hospitals()
   # With:
   st.session_state.hospitals = generate_hospitals(seed=42)
   ```

3. **Show the reasoning log** - This proves it's real AI, not smoke and mirrors

4. **Generate multiple scenarios** - Show judges that every negotiation is unique

5. **Reject a trade** - Demonstrate that human oversight actually works

---

## 🐛 Troubleshooting

### "GEMINI_API_KEY NOT FOUND"
- Make sure `.env` file exists (copy from `.env.example`)
- Add your actual API key: `GEMINI_API_KEY=AIza...`

### "All retries exhausted"
- Check your API quota at [Google AI Studio](https://aistudio.google.com/)
- Verify your API key is valid
- Check internet connection

### "Cannot import google.genai"
- Make sure you installed the NEW SDK: `pip install google-genai`
- Not the old `google-generativeai` package

### Slow response times
- Gemini 2.0 Flash should respond in 1-3 seconds
- If slower, check your network connection
- Enable debug logging: `ENABLE_DEBUG_LOGGING=true` in .env

---

## 📈 Future Enhancements

- 🌍 **Geographic Routing** - Consider hospital distances in negotiations
- 📱 **Mobile Alerts** - Push notifications for critical shortages
- 📊 **Predictive Analytics** - Forecast shortages before they happen
- 🔗 **Blockchain Audit** - Immutable trade records (if required)
- 🌐 **Multi-Region** - Scale to district/state/national networks

---

## 📝 Technical Specifications

- **Language:** Python 3.11+
- **LLM:** Google Gemini 2.0 Flash (via google-genai SDK)
- **UI Framework:** Streamlit 1.32+
- **Architecture:** Multi-agent system with human-in-the-loop
- **Retry Logic:** 3 attempts with exponential backoff (1s, 2s, 4s)
- **Structured Output:** JSON schema enforcement on all LLM calls
- **Logging:** Millisecond-precision audit trail

---

## 🤝 Contributing

This is a hackathon project, but ideas are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m "Add feature"`
4. Push to branch: `git push origin feature-name`
5. Open a Pull Request

---

## 📄 License

MIT License - feel free to use and modify for your own projects!

---

## 👥 Team

Built for AJ Hackathon 2026 by [Your Team Name]

---

## 🙏 Acknowledgments

- **Google Gemini** for powering the AI agents
- **Streamlit** for the amazing dashboard framework
- **WHO Essential Medicines List** for realistic medicine inventory data

---

## 📞 Support

For questions or issues during the hackathon:
- Check the troubleshooting section above
- Review the AI reasoning log (toggle in sidebar)
- Inspect `reasoning_log.json` for detailed API traces

---

<div align="center">

**🏆 Built to win. Zero compromises. Real AI. Human verification.**

Made with ❤️ for better healthcare supply chains

</div>
