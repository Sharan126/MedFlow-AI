import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HospitalCard from './components/HospitalCard';
import NegotiationFeed from './components/NegotiationFeed';
import PendingTradePanel from './components/PendingTradePanel';
import TradeHistoryTable from './components/TradeHistoryTable';
import ReasoningDrawer from './components/ReasoningDrawer';
import ApiKeyModal from './components/ApiKeyModal';
import SupplyChainChatbot from './components/SupplyChainChatbot';
import FindMedicineButton from './components/FindMedicineButton';
import FindMedicineModal from './components/FindMedicineModal';
import { Play, Sparkles, Brain, CheckCircle2, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';

export default function App() {
  const [status, setStatus] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [scenarioCount, setScenarioCount] = useState(1);
  const [events, setEvents] = useState([]);
  const [pendingTrade, setPendingTrade] = useState(null);
  const [tradeHistory, setTradeHistory] = useState({ trades: [], stats: { approved: 0, rejected: 0, total_transferred: 0 } });
  const [reasoningData, setReasoningData] = useState({ logs: [], stats: {} });
  const [medicineRequests, setMedicineRequests] = useState([]);

  const [loading, setLoading] = useState(false);
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [processingTrade, setProcessingTrade] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showFindMedicineModal, setShowFindMedicineModal] = useState(false);
  const [errorBanner, setErrorBanner] = useState(null);

  // Fetch initial system state and medicine requests
  const fetchAllData = async () => {
    try {
      const [statusRes, hospRes, eventsRes, historyRes, reasoningRes, requestsRes] = await Promise.all([
        fetch('/api/status').then(r => r.json()),
        fetch('/api/hospitals').then(r => r.json()),
        fetch('/api/events').then(r => r.json()),
        fetch('/api/history').then(r => r.json()),
        fetch('/api/reasoning').then(r => r.json()),
        fetch('/api/medicine-requests').then(r => r.json()).catch(() => ({ requests: [] }))
      ]);

      setStatus(statusRes);
      setHospitals(hospRes.hospitals || []);
      setScenarioCount(hospRes.scenario_count || 1);
      setEvents(eventsRes.events || []);
      setPendingTrade(eventsRes.pending_trade);
      setTradeHistory(historyRes);
      setReasoningData(reasoningRes);
      setMedicineRequests(requestsRes.requests || []);
    } catch (err) {
      console.error("Failed to connect to MedFlow-AI backend:", err);
    }
  };

  const fetchMedicineRequests = async () => {
    try {
      const res = await fetch('/api/medicine-requests').then(r => r.json());
      setMedicineRequests(res.requests || []);
    } catch (err) {
      console.error("Failed to fetch medicine requests:", err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Handler: Generate New Scenario
  const handleNewScenario = async () => {
    setLoading(true);
    setErrorBanner(null);
    try {
      const res = await fetch('/api/scenario/new', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to generate scenario');

      setHospitals(data.hospitals || []);
      setScenarioCount(data.scenario_count);
      setEvents(data.events || []);
      setPendingTrade(data.pending_trade);
    } catch (err) {
      setErrorBanner(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handler: Start AI Negotiation
  const handleStartNegotiation = async () => {
    if (!status?.api_key_configured) {
      setShowKeyModal(true);
      return;
    }

    setIsNegotiating(true);
    setErrorBanner(null);
    try {
      const res = await fetch('/api/negotiate', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Negotiation failed');

      setEvents(data.events || []);
      setPendingTrade(data.pending_trade);
      if (data.hospitals) setHospitals(data.hospitals);

      // Refresh reasoning and status
      const [reasoningRes, statusRes] = await Promise.all([
        fetch('/api/reasoning').then(r => r.json()),
        fetch('/api/status').then(r => r.json())
      ]);
      setReasoningData(reasoningRes);
      setStatus(statusRes);

      // Smoothly scroll to the verification panel for human verification
      if (data.pending_trade) {
        setTimeout(() => {
          document.getElementById('verification-panel')?.scrollIntoView({ behavior: 'smooth' });
        }, 250);
      }
    } catch (err) {
      setErrorBanner(err.message);
    } finally {
      setIsNegotiating(false);
    }
  };

  // Handler: Approve Trade
  const handleApproveTrade = async () => {
    setProcessingTrade(true);
    setErrorBanner(null);
    try {
      const res = await fetch('/api/trade/approve', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to approve trade');

      setHospitals(data.hospitals || []);
      setEvents(data.events || []);
      setPendingTrade(null);

      // Refresh trade history and reasoning
      const [histRes, reasoningRes] = await Promise.all([
        fetch('/api/history').then(r => r.json()),
        fetch('/api/reasoning').then(r => r.json())
      ]);
      setTradeHistory(histRes);
      setReasoningData(reasoningRes);
    } catch (err) {
      setErrorBanner(err.message);
    } finally {
      setProcessingTrade(false);
    }
  };

  // Handler: Reject Trade
  const handleRejectTrade = async () => {
    setProcessingTrade(true);
    setErrorBanner(null);
    try {
      const res = await fetch('/api/trade/reject', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to reject trade');

      setEvents(data.events || []);
      setPendingTrade(null);

      // Refresh trade history
      const histRes = await fetch('/api/history').then(r => r.json());
      setTradeHistory(histRes);
    } catch (err) {
      setErrorBanner(err.message);
    } finally {
      setProcessingTrade(false);
    }
  };

  // Handler: Save API Key
  const handleSaveKey = async (newKey) => {
    const res = await fetch('/api/save-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: newKey })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to save key');

    // Refresh status
    const statusRes = await fetch('/api/status').then(r => r.json());
    setStatus(statusRes);
    setErrorBanner(null);
  };

  // Handler: Clear Reasoning Log
  const handleClearReasoning = async () => {
    await fetch('/api/reasoning/clear', { method: 'POST' });
    const reasoningRes = await fetch('/api/reasoning').then(r => r.json());
    setReasoningData(reasoningRes);
  };

  // Compute crisis metrics for summary bar
  const totalCritical = hospitals.reduce((acc, h) => acc + (h.status_counts?.critical || 0), 0);
  const totalWarning = hospitals.reduce((acc, h) => acc + (h.status_counts?.warning || 0), 0);

  return (
    <div className="dashboard-shell" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation */}
      <Navbar 
        status={status}
        scenarioCount={scenarioCount}
        onNewScenario={handleNewScenario}
        onOpenKeyModal={() => setShowKeyModal(true)}
        onOpenFindMedicine={() => setShowFindMedicineModal(true)}
        loading={loading}
      />

      {/* Main Container */}
      <main className="dashboard-main" style={{ maxWidth: '1440px', width: '100%', margin: '0 auto', padding: '0 1.5rem 3rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        
        {/* Error Alert Banner */}
        {/* Error Alert Banner with Emergency Map Fallback Trigger */}
        {errorBanner && (
          <div style={{
            padding: '1.15rem 1.5rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.45)',
            color: '#fca5a5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            animation: 'fadeIn 0.2s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <AlertTriangle size={22} color="#ef4444" />
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.92rem', color: '#fca5a5' }}>
                  AI Negotiation / Server Interruption
                </div>
                <div style={{ fontSize: '0.82rem', color: '#fecaca', marginTop: '0.15rem' }}>
                  {errorBanner}. Manual Emergency Override activated: use the Interactive Map to filter stock and request medicines.
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                className="btn btn-warning"
                onClick={() => {
                  setErrorBanner(null);
                  setShowFindMedicineModal(true);
                }}
                style={{ padding: '0.5rem 1rem', fontSize: '0.82rem', fontWeight: '700' }}
              >
                🗺️ Open Emergency Map Requisition
              </button>
              <button 
                onClick={() => setErrorBanner(null)}
                style={{ background: 'transparent', border: 'none', color: '#fca5a5', cursor: 'pointer', fontWeight: '700', fontSize: '1.1rem' }}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Global Control & Telemetry Bar */}
        <section className="glass-card" style={{
          padding: '1.25rem 1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem',
          borderRadius: 'var(--radius-xl)'
        }}>
          {/* Left: Action triggers */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              onClick={pendingTrade ? () => document.getElementById('verification-panel')?.scrollIntoView({ behavior: 'smooth' }) : handleStartNegotiation}
              disabled={isNegotiating}
              id="btn-start-negotiation"
              style={{ padding: '0.8rem 1.6rem', fontSize: '0.95rem' }}
              title={pendingTrade ? "Review pending trade proposal below" : "Run autonomous multi-agent AI negotiation"}
            >
              <Sparkles size={18} className={isNegotiating ? "spin" : ""} />
              <span>
                {isNegotiating 
                  ? 'AI Agents Negotiating...' 
                  : pendingTrade 
                    ? '⚠️ Trade Pending Approval (Review Below)' 
                    : '🚀 Start AI Negotiation'}
              </span>
            </button>

            {pendingTrade && (
              <span className="badge badge-warning" style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>
                ⚠️ 1% Human Verification Required
              </span>
            )}
          </div>

          {/* Right: Quick Telemetry Chips & Reasoning Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            {/* Shortage Counter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: totalCritical > 0 ? '#f87171' : '#34d399', fontWeight: '600' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: totalCritical > 0 ? '#ef4444' : '#10b981' }} />
                <span>{totalCritical} Critical Deficits</span>
              </div>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <div style={{ color: '#fbbf24', fontWeight: '500' }}>
                {totalWarning} Warnings
              </div>
            </div>

            {/* Toggle AI Reasoning Drawer */}
            <button
              className={`btn ${showReasoning ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setShowReasoning(!showReasoning)}
              style={{ padding: '0.55rem 1rem', fontSize: '0.82rem' }}
              id="toggle-reasoning-log"
            >
              <Brain size={16} />
              <span>{showReasoning ? 'Hide AI Reasoning' : '🧠 AI Reasoning Log'}</span>
            </button>
          </div>
        </section>

        {/* ROW 1: Hospital Cards (3 Columns) */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              Network Hospital Inventory Nodes
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Karnataka Healthcare Corridor • Mysuru District
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '1.25rem'
          }}>
            {hospitals.map((hospital, idx) => (
              <HospitalCard 
                key={hospital.name || idx} 
                hospital={hospital}
                isRequester={pendingTrade?.receiver === hospital.name}
                isDonor={pendingTrade?.donor === hospital.name}
              />
            ))}
          </div>
        </section>

        {/* ROW 2: Human-in-the-Loop Verification Panel (Only if Pending Trade exists) */}
        {pendingTrade && (
          <section id="verification-panel">
            <PendingTradePanel 
              pendingTrade={pendingTrade}
              onApprove={handleApproveTrade}
              onReject={handleRejectTrade}
              processing={processingTrade}
            />
          </section>
        )}

        {/* ROW 3: Live Multi-Agent Negotiation Feed */}
        <section>
          <NegotiationFeed 
            events={events}
            isNegotiating={isNegotiating}
          />
        </section>

        {/* ROW 4: AI Reasoning Telemetry (Toggled) */}
        {showReasoning && (
          <section id="reasoning-telemetry">
            <ReasoningDrawer 
              reasoningData={reasoningData}
              onClearLog={handleClearReasoning}
            />
          </section>
        )}

        {/* ROW 5: Immutable Trade History Audit Log & Requisition Requests */}
        <section>
          <TradeHistoryTable 
            historyData={tradeHistory}
            medicineRequests={medicineRequests}
            onRefreshRequests={async () => {
              await fetchMedicineRequests();
              await fetchAllData();
            }}
            onOpenFindMedicine={() => setShowFindMedicineModal(true)}
          />
        </section>

      </main>

      {/* Interactive Find Medicine Nearby Modal */}
      <FindMedicineModal 
        isOpen={showFindMedicineModal}
        onClose={() => setShowFindMedicineModal(false)}
        onRequestSuccess={() => {
          fetchMedicineRequests();
          fetchAllData();
        }}
      />

      {/* API Key Modal */}
      <ApiKeyModal 
        isOpen={showKeyModal}
        onClose={() => setShowKeyModal(false)}
        onSaveKey={handleSaveKey}
        currentStatus={status}
      />

      <SupplyChainChatbot />
    </div>
  );
}
