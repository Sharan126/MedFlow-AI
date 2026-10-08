"""
MedFlow-AI Streamlit Dashboard
Interactive demo of self-healing medical supply chain with LLM-powered negotiation.
"""

import streamlit as st
from datetime import datetime
import time

from data import generate_hospitals, get_scenario_summary
from negotiation import run_negotiation, execute_trade, reject_trade
from llm_client import get_reasoning_log, get_reasoning_stats, clear_reasoning_log

# === PAGE CONFIG ===
st.set_page_config(
    page_title="MedFlow-AI",
    page_icon="🏥",
    layout="wide",
    initial_sidebar_state="expanded"
)

# === CUSTOM CSS ===
st.markdown("""
<style>
    .main-title {
        font-size: 3rem;
        font-weight: bold;
        text-align: center;
        margin-bottom: 0;
    }
    .subtitle {
        font-size: 1.2rem;
        text-align: center;
        color: #666;
        margin-bottom: 2rem;
    }
    .hospital-card {
        border: 2px solid #ddd;
        border-radius: 10px;
        padding: 1rem;
        margin-bottom: 1rem;
    }
    .critical-badge {
        background-color: #ff4b4b;
        color: white;
        padding: 0.2rem 0.5rem;
        border-radius: 5px;
        font-weight: bold;
    }
    .warning-badge {
        background-color: #ffa500;
        color: white;
        padding: 0.2rem 0.5rem;
        border-radius: 5px;
        font-weight: bold;
    }
    .ok-badge {
        background-color: #00c851;
        color: white;
        padding: 0.2rem 0.5rem;
        border-radius: 5px;
        font-weight: bold;
    }
    .event-message {
        padding: 0.8rem;
        margin: 0.5rem 0;
        border-left: 4px solid #4CAF50;
        background-color: #f9f9f9;
        border-radius: 5px;
    }
    .trade-panel {
        background-color: #fff3cd;
        border: 3px solid #ffc107;
        border-radius: 10px;
        padding: 1.5rem;
        margin: 1rem 0;
    }
</style>
""", unsafe_allow_html=True)

# === SESSION STATE INITIALIZATION ===
if 'hospitals' not in st.session_state:
    st.session_state.hospitals = generate_hospitals()
    st.session_state.events = []
    st.session_state.pending_trade = None
    st.session_state.trade_history = []
    st.session_state.scenario_count = 1

# === SIDEBAR ===
with st.sidebar:
    st.title("🏥 Control Panel")

    st.markdown("---")

    # Generate New Scenario
    if st.button("🔄 Generate New Scenario", use_container_width=True):
        # Generate new random hospitals
        st.session_state.hospitals = generate_hospitals()
        st.session_state.events = []
        st.session_state.pending_trade = None
        st.session_state.scenario_count += 1
        clear_reasoning_log()
        st.success(f"✅ Scenario #{st.session_state.scenario_count} generated!")
        st.rerun()

    st.markdown("---")

    # Start Negotiation
    negotiation_disabled = st.session_state.pending_trade is not None

    if st.button(
        "🚀 Start Negotiation",
        disabled=negotiation_disabled,
        use_container_width=True,
        type="primary"
    ):
        with st.spinner("🤖 AI agents are negotiating..."):
            try:
                result = run_negotiation(st.session_state.hospitals)
                st.session_state.events = result['events']
                st.session_state.pending_trade = result['pending_trade']
                st.success("✅ Negotiation complete!")
                st.rerun()
            except Exception as e:
                st.error(f"❌ Negotiation failed: {str(e)}")

    if negotiation_disabled:
        st.info("⚠️ Approve or reject the pending trade first")

    st.markdown("---")

    # AI Reasoning Toggle
    show_reasoning = st.toggle("🧠 Show AI Reasoning Log", value=False)

    if show_reasoning:
        st.markdown("### 📊 API Statistics")
        stats = get_reasoning_stats()

        col1, col2 = st.columns(2)
        with col1:
            st.metric("Total Calls", stats['total_calls'])
            st.metric("Success Rate", f"{stats['success_rate']:.1f}%")
        with col2:
            st.metric("Avg Latency", f"{stats['avg_latency_ms']}ms")
            st.metric("Total Time", f"{stats['total_latency_ms']}ms")

        st.markdown("### 🔍 Reasoning Log")

        reasoning_log = get_reasoning_log()

        if reasoning_log:
            for idx, log in enumerate(reasoning_log):
                with st.expander(
                    f"Call #{idx+1} - {log['status']} - {log['latency_ms']}ms",
                    expanded=False
                ):
                    st.write(f"**Timestamp:** {log['timestamp']}")
                    st.write(f"**Model:** {log['model']}")
                    st.write(f"**Latency:** {log['latency_ms']}ms")
                    st.write(f"**JSON Schema:** {'Yes' if log['json_schema_used'] else 'No'}")

                    st.markdown("**System Prompt:**")
                    st.code(log['system_prompt'], language="text")

                    st.markdown("**User Prompt:**")
                    st.code(log['user_prompt'], language="text")

                    if log['status'] == 'SUCCESS':
                        st.markdown("**Response:**")
                        st.code(log['response'], language="json" if log['json_schema_used'] else "text")
                    else:
                        st.error(f"**Error:** {log.get('error', 'Unknown error')}")
        else:
            st.info("No API calls yet. Start a negotiation to see reasoning logs.")

    st.markdown("---")
    st.caption(f"Scenario #{st.session_state.scenario_count} | MedFlow-AI v1.0")

# === MAIN AREA ===

# Title
st.markdown('<div class="main-title">🏥 MedFlow-AI</div>', unsafe_allow_html=True)
st.markdown('<div class="subtitle">Self-Healing Medical Supply Chain with Multi-Agent LLM Negotiation</div>', unsafe_allow_html=True)

# Scenario Summary
summary = get_scenario_summary(st.session_state.hospitals)
col1, col2, col3, col4 = st.columns(4)

with col1:
    st.metric("🏥 Hospitals", summary['total_hospitals'])
with col2:
    st.metric("💊 Medicines", summary['total_medicines'])
with col3:
    st.metric("🔴 Critical", summary['critical_shortages'])
with col4:
    st.metric("🟡 Warnings", summary['warning_shortages'])

if summary['crisis_hospital']:
    st.warning(
        f"🚨 **Crisis Alert:** {summary['crisis_hospital']} has a critical shortage of "
        f"{summary['crisis_medicine']} (needs {summary['max_deficit']} units)"
    )

st.markdown("---")

# === HOSPITAL CARDS ===
st.subheader("🏥 Hospital Network Status")

cols = st.columns(3)

for idx, agent in enumerate(st.session_state.hospitals):
    with cols[idx]:
        # Hospital header
        st.markdown(f"### {agent.name}")
        st.caption(f"📍 {agent.location}")

        # Inventory table
        shortages = agent.detect_shortages()
        shortage_meds = {s['medicine'] for s in shortages}

        inventory_data = []

        for medicine, quantity in agent.inventory.items():
            threshold = agent.thresholds[medicine]
            surplus = agent.compute_surplus(medicine)

            # Determine status
            if quantity < threshold * 0.5:
                status = "🔴 CRITICAL"
                status_class = "critical"
            elif quantity < threshold:
                status = "🟡 WARNING"
                status_class = "warning"
            else:
                status = "🟢 OK"
                status_class = "ok"

            inventory_data.append({
                "Medicine": medicine,
                "Stock": quantity,
                "Threshold": threshold,
                "Status": status
            })

        st.dataframe(
            inventory_data,
            hide_index=True,
            use_container_width=True
        )

        # Surplus badge
        surpluses = agent.get_surpluses()
        if surpluses:
            surplus_text = ", ".join([f"{med} (+{qty})" for med, qty in surpluses.items()])
            st.success(f"📦 Surplus: {surplus_text}")

st.markdown("---")

# === NEGOTIATION FEED ===
st.subheader("💬 Live Negotiation Feed")

if st.session_state.events:
    for event in st.session_state.events:
        # Icon based on event type
        icon_map = {
            "system": "🔔",
            "generating": "⏳",
            "request": "📨",
            "evaluating": "🤔",
            "accept": "✅",
            "counter": "🔄",
            "reject": "❌"
        }
        icon = icon_map.get(event['type'], "💬")

        # Create expandable event
        with st.expander(
            f"[{event['timestamp']}] {icon} **{event['agent']}** → {event['target']}",
            expanded=(event['type'] in ['request', 'accept', 'reject', 'counter'])
        ):
            st.write(event['message'])

            if event.get('reasoning'):
                st.markdown("**🧠 AI Reasoning:**")
                st.info(event['reasoning'])
else:
    st.info("👆 Click **Start Negotiation** in the sidebar to begin multi-agent negotiation")

st.markdown("---")

# === PENDING TRADE PANEL ===
if st.session_state.pending_trade:
    st.markdown("## ⚠️ Trade Awaiting Human Verification")

    trade = st.session_state.pending_trade

    # Trade summary box
    st.markdown('<div class="trade-panel">', unsafe_allow_html=True)

    st.markdown(f"### 🔄 Trade Proposal")

    col1, col2 = st.columns(2)

    with col1:
        st.markdown(f"**From:** {trade['donor']} ({trade['donor_location']})")
        st.markdown("**Giving:**")
        for med, qty in trade['medicines'].items():
            st.write(f"  • {qty} units of {med}")

    with col2:
        st.markdown(f"**To:** {trade['receiver']} ({trade['receiver_location']})")
        st.markdown("**Receiving back:**")
        if trade['counter_medicines']:
            for med, qty in trade['counter_medicines'].items():
                st.write(f"  • {qty} units of {med}")
        else:
            st.write("  • Nothing (emergency donation)")

    st.markdown("---")

    st.markdown("### 🤖 AI Explanation")
    st.write(trade['explanation'])

    st.markdown("---")

    # Inventory impact preview
    with st.expander("📊 View Inventory Impact", expanded=False):
        col1, col2 = st.columns(2)

        with col1:
            st.markdown(f"**{trade['donor']} Inventory:**")
            st.write("BEFORE:")
            st.json(trade['donor_inv_before'])
            st.write("AFTER:")
            st.json(trade['donor_inv_after'])

        with col2:
            st.markdown(f"**{trade['receiver']} Inventory:**")
            st.write("BEFORE:")
            st.json(trade['receiver_inv_before'])
            st.write("AFTER:")
            st.json(trade['receiver_inv_after'])

    st.markdown('</div>', unsafe_allow_html=True)

    # Approval buttons
    col1, col2, col3 = st.columns([1, 1, 2])

    with col1:
        if st.button("✅ APPROVE TRADE", type="primary", use_container_width=True):
            try:
                # Execute the trade
                execution_report = execute_trade(
                    st.session_state.pending_trade,
                    st.session_state.hospitals
                )

                # Record in trade history
                trade_record = {
                    "trade_id": len(st.session_state.trade_history) + 1,
                    "timestamp": execution_report['timestamp'],
                    "donor": trade['donor'],
                    "receiver": trade['receiver'],
                    "medicines": trade['medicines'],
                    "counter_medicines": trade['counter_medicines'],
                    "explanation": trade['explanation'],
                    "status": "APPROVED"
                }

                st.session_state.trade_history.append(trade_record)

                # Add success event
                st.session_state.events.append({
                    "step": len(st.session_state.events) + 1,
                    "timestamp": datetime.now().strftime("%H:%M:%S"),
                    "agent": "Administrator",
                    "type": "approval",
                    "message": f"✅ Trade approved and executed successfully",
                    "reasoning": "",
                    "target": "System"
                })

                # Clear pending trade
                st.session_state.pending_trade = None

                st.success("✅ Trade executed successfully! Inventories updated.")
                time.sleep(1)
                st.rerun()

            except Exception as e:
                st.error(f"❌ Trade execution failed: {str(e)}")

    with col2:
        if st.button("❌ REJECT TRADE", use_container_width=True):
            # Record rejection in trade history
            rejection_record = reject_trade(trade)

            trade_record = {
                "trade_id": len(st.session_state.trade_history) + 1,
                "timestamp": rejection_record['timestamp'],
                "donor": trade['donor'],
                "receiver": trade['receiver'],
                "medicines": trade['medicines'],
                "counter_medicines": trade['counter_medicines'],
                "explanation": trade['explanation'],
                "status": "REJECTED"
            }

            st.session_state.trade_history.append(trade_record)

            # Add rejection event
            st.session_state.events.append({
                "step": len(st.session_state.events) + 1,
                "timestamp": datetime.now().strftime("%H:%M:%S"),
                "agent": "Administrator",
                "type": "rejection",
                "message": "❌ Trade rejected by administrator. No inventory changes made.",
                "reasoning": "",
                "target": "System"
            })

            # Clear pending trade
            st.session_state.pending_trade = None

            st.warning("❌ Trade rejected. No changes made to hospital inventories.")
            time.sleep(1)
            st.rerun()

st.markdown("---")

# === TRADE HISTORY LOG ===
st.subheader("📜 Trade History Log")

if st.session_state.trade_history:
    # Summary stats
    approved_count = sum(1 for t in st.session_state.trade_history if t['status'] == 'APPROVED')
    rejected_count = sum(1 for t in st.session_state.trade_history if t['status'] == 'REJECTED')

    total_value = sum(
        sum(t['medicines'].values())
        for t in st.session_state.trade_history
        if t['status'] == 'APPROVED'
    )

    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("✅ Approved", approved_count)
    with col2:
        st.metric("❌ Rejected", rejected_count)
    with col3:
        st.metric("📦 Total Units Transferred", total_value)

    st.markdown("---")

    # Trade history table
    for trade in reversed(st.session_state.trade_history):  # Most recent first
        status_emoji = "✅" if trade['status'] == 'APPROVED' else "❌"

        with st.expander(
            f"{status_emoji} Trade #{trade['trade_id']} - {trade['timestamp']} - "
            f"{trade['donor']} → {trade['receiver']}",
            expanded=False
        ):
            col1, col2 = st.columns(2)

            with col1:
                st.markdown("**Medicines Transferred:**")
                for med, qty in trade['medicines'].items():
                    st.write(f"  • {qty} units of {med}")

            with col2:
                st.markdown("**Counter-Medicines:**")
                if trade['counter_medicines']:
                    for med, qty in trade['counter_medicines'].items():
                        st.write(f"  • {qty} units of {med}")
                else:
                    st.write("  • None (emergency donation)")

            st.markdown("**AI Explanation:**")
            st.info(trade['explanation'])

            if trade['status'] == 'APPROVED':
                st.success("✅ This trade was executed")
            else:
                st.error("❌ This trade was rejected")
else:
    st.info("No trades recorded yet. Complete a negotiation to see trade history.")

# === FOOTER ===
st.markdown("---")
st.markdown(
    """
    <div style="text-align: center; color: #666; padding: 1rem;">
        <p><strong>MedFlow-AI</strong> - Autonomous Medical Supply Chain</p>
        <p>Powered by Google Gemini 2.0 | Built for AJ Hackathon 2026</p>
        <p>🏆 Real LLM agents. Human verification. Full audit trail. No fallbacks.</p>
    </div>
    """,
    unsafe_allow_html=True
)
