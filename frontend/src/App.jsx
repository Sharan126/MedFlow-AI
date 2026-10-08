import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import HospitalCard from './components/HospitalCard';
import NegotiationFeed from './components/NegotiationFeed';
import PendingTradePanel from './components/PendingTradePanel';
import TradeHistoryTable from './components/TradeHistoryTable';
import ReasoningDrawer from './components/ReasoningDrawer';
import ApiKeyModal from './components/ApiKeyModal';
import DakshinaKannadaModal from './components/DakshinaKannadaModal';
import SupplyChainChatbot from './components/SupplyChainChatbot';
import FindMedicineModal from './components/FindMedicineModal';
import { 
  Sparkles, 
  Brain, 
  AlertTriangle, 
  Building2, 
  RefreshCw, 
  Search, 
  Sun, 
  Moon, 
  Bell, 
  MapPin, 
  Plus, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight,
  User,
  Clock,
  Calendar,
  Layers,
  FileText
} from 'lucide-react';

export default function App() {
  const [status, setStatus] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [scenarioCount, setScenarioCount] = useState(1);
  const [events, setEvents] = useState([]);
  const [pendingTrade, setPendingTrade] = useState(null);
  const [tradeHistory, setTradeHistory] = useState({ trades: [], stats: { approved: 0, rejected: 0, total_transferred: 0 } });
  const [reasoningData, setReasoningData] = useState({ logs: [], stats: {} });
  const [medicineRequests, setMedicineRequests] = useState([]);

  // Dakshina Kannada regional state
  const [directory, setDirectory] = useState([]);
  const [taluks, setTaluks] = useState([]);
  const [selectedTaluk, setSelectedTaluk] = useState('All');
  const [nodeCount, setNodeCount] = useState(3);
  const [showDirectoryModal, setShowDirectoryModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [processingTrade, setProcessingTrade] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showFindMedicineModal, setShowFindMedicineModal] = useState(false);
  const [errorBanner, setErrorBanner] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [activeSidebarTab, setActiveSidebarTab] = useState('dashboard');

  // Sync theme attribute to HTML tag
  useEffect(() => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  // Fetch initial system state including Dakshina Kannada network directory and medicine requests
  const fetchAllData = async () => {
    try {
      const [statusRes, hospRes, eventsRes, historyRes, reasoningRes, dirRes, taluksRes, requestsRes] = await Promise.all([
        fetch('/api/status').then(r => r.json()),
        fetch('/api/hospitals').then(r => r.json()),
        fetch('/api/events').then(r => r.json()),
        fetch('/api/history').then(r => r.json()),
        fetch('/api/reasoning').then(r => r.json()),
        fetch('/api/dakshina-kannada/directory').then(r => r.json()).catch(() => ({ hospitals: [] })),
        fetch('/api/dakshina-kannada/taluks').then(r => r.json()).catch(() => ({ taluks: [] })),
        fetch('/api/medicine-requests').then(r => r.json()).catch(() => ({ requests: [] }))
      ]);

      setStatus(statusRes);
      setHospitals(hospRes.hospitals || []);
      setScenarioCount(hospRes.scenario_count || 1);
      setEvents(eventsRes.events || []);
      setPendingTrade(eventsRes.pending_trade);
      setTradeHistory(historyRes);
      setReasoningData(reasoningRes);
      setDirectory(dirRes.hospitals || []);
      setTaluks(taluksRes.taluks || []);
      if (hospRes.active_taluk) setSelectedTaluk(hospRes.active_taluk);
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

  // Handler: Generate New Scenario within Dakshina Kannada
  const handleNewScenario = async (taluk = selectedTaluk, count = nodeCount, hospitalNames = null) => {
    setLoading(true);
    setErrorBanner(null);
    try {
      const res = await fetch('/api/scenario/new', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          taluk: taluk === 'All' ? null : taluk, 
          count: count,
          hospital_names: hospitalNames 
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to generate scenario');

      setHospitals(data.hospitals || []);
      setScenarioCount(data.scenario_count);
      setEvents(data.events || []);
      setPendingTrade(data.pending_trade);
      if (taluk) setSelectedTaluk(taluk);
    } catch (err) {
      setErrorBanner(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Select hospital from the Dakshina Kannada directory modal
  const handleSelectHospitalFromDirectory = (hosp) => {
    setShowDirectoryModal(false);
    handleNewScenario(hosp.taluk, 3, [hosp.name]);
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

      // Smooth scroll to pending trade panel if trade proposed
      if (data.pending_trade) {
        setTimeout(() => {
          document.getElementById('verification-panel')?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    } catch (err) {
      setErrorBanner(err.message);
    } finally {
      setIsNegotiating(false);
    }
  };

  // Handler: Human-in-the-Loop Trade Approval
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
      const [historyRes, reasoningRes, statusRes] = await Promise.all([
        fetch('/api/history').then(r => r.json()),
        fetch('/api/reasoning').then(r => r.json()),
        fetch('/api/status').then(r => r.json())
      ]);
      setTradeHistory(historyRes);
      setReasoningData(reasoningRes);
      setStatus(statusRes);
    } catch (err) {
      setErrorBanner(err.message);
    } finally {
      setProcessingTrade(false);
    }
  };

  // Handler: Human-in-the-Loop Trade Rejection
  const handleRejectTrade = async (reason) => {
    setProcessingTrade(true);
    setErrorBanner(null);
    try {
      const res = await fetch('/api/trade/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to reject trade');

      setEvents(data.events || []);
      setPendingTrade(null);

      const [historyRes, reasoningRes, statusRes] = await Promise.all([
        fetch('/api/history').then(r => r.json()),
        fetch('/api/reasoning').then(r => r.json()),
        fetch('/api/status').then(r => r.json())
      ]);
      setTradeHistory(historyRes);
      setReasoningData(reasoningRes);
      setStatus(statusRes);
    } catch (err) {
      setErrorBanner(err.message);
    } finally {
      setProcessingTrade(false);
    }
  };

  // Handler: Save API Key
  const handleSaveKey = async (apiKey) => {
    try {
      const res = await fetch('/api/save-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: apiKey })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to connect key');

      setShowKeyModal(false);
      fetchAllData();
    } catch (err) {
      throw err;
    }
  };

  // Handler: Clear Reasoning Logs
  const handleClearReasoning = async () => {
    try {
      await fetch('/api/reasoning/clear', { method: 'POST' });
      setReasoningData({ logs: [], stats: {} });
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate totals
  const totalCritical = hospitals.reduce((acc, h) => acc + (h.status_counts?.critical || 0), 0);
  const totalWarning = hospitals.reduce((acc, h) => acc + (h.status_counts?.warning || 0), 0);
  const pendingRequestsCount = medicineRequests.filter(r => r.status === 'PENDING').length;

  // Filter hospitals based on search input
  const filteredHospitals = searchFilter.trim() 
    ? hospitals.filter(h => 
        h.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (h.taluk && h.taluk.toLowerCase().includes(searchFilter.toLowerCase())) ||
        (h.location && h.location.toLowerCase().includes(searchFilter.toLowerCase()))
      )
    : hospitals;

  return (
    <div className="hcare-app-wrapper">
      {/* LEFT SIDEBAR NAVIGATION (Matching HCare Screenshot) */}
      <Sidebar 
        activeTab={activeSidebarTab}
        onSelectTab={setActiveSidebarTab}
        pendingCount={pendingRequestsCount}
        onOpenDirectory={() => setShowDirectoryModal(true)}
        onOpenKeyModal={() => setShowKeyModal(true)}
        onOpenFindMedicine={() => setShowFindMedicineModal(true)}
        onStartNegotiation={handleStartNegotiation}
        isNegotiating={isNegotiating}
      />

      {/* RIGHT MAIN CONTENT AREA */}
      <main className="hcare-main-content">
        
        {/* TOPBAR (Header with Search, Notifications, Actions) */}
        <header className="hcare-topbar">
          <div className="topbar-left">
            <h1 className="topbar-title">Dashboard</h1>
            <span className="topbar-sub">
              Dakshina Kannada Healthcare Network • {directory.length || 28} Facilities across 7 Taluks
            </span>
          </div>

          <div className="topbar-right">
            {/* Search Input */}
            <div className="search-bar-box">
              <Search size={16} color="var(--text-muted)" />
              <input 
                type="text" 
                placeholder="Search anything" 
                className="search-input"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
              />
              <span className="shortcut-kbd">⌘ F</span>
            </div>

            {/* Quick Action: Find Medicine Map */}
            <button 
              className="btn btn-primary"
              onClick={() => setShowFindMedicineModal(true)}
              style={{ padding: '0.45rem 0.95rem', fontSize: '0.82rem' }}
              title="Open OpenStreetMap to search medicine stock"
            >
              <MapPin size={15} />
              <span>Map Requisition</span>
            </button>

            {/* Theme Toggle Button */}
            <button 
              className="icon-button"
              onClick={toggleTheme}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} />}
            </button>

            {/* Notification Bell with indicator */}
            <button 
              className="icon-button"
              onClick={() => {
                const el = document.getElementById('trade-audit-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              title="Notifications and Requests"
            >
              <Bell size={18} />
              {(pendingTrade || pendingRequestsCount > 0 || totalCritical > 0) && (
                <span className="notif-dot" />
              )}
            </button>
          </div>
        </header>

        {/* ERROR / NOTICE BANNER (if any) */}
        {errorBanner && (
          <div style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--rose-50)',
            border: '1px solid var(--rose-100)',
            color: 'var(--rose-700)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            animation: 'fadeIn 0.2s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <AlertTriangle size={20} color="#ef4444" />
              <span style={{ fontSize: '0.86rem', fontWeight: '600' }}>{errorBanner}</span>
            </div>
            <button 
              onClick={() => setErrorBanner(null)}
              style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: '800' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* ROW 1: 4 KPI METRIC CARDS (Exact HCare Structure) */}
        <section className="hcare-stats-grid">
          {/* Card 1: Total Patients / Facilities */}
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">Total Active Nodes</span>
            </div>
            <div className="stat-body">
              <span className="stat-value">{directory.length || 28}</span>
              <div className="stat-sparkline">
                <svg width="68" height="26" viewBox="0 0 68 26" fill="none">
                  <path d="M2 20 Q 18 22, 28 12 T 48 14 T 66 4" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </div>
            </div>
            <div className="stat-footer">
              <span className="stat-trend up">
                <ArrowUpRight size={13} /> 40% vs last month
              </span>
              <button className="stat-action-link" onClick={() => setShowDirectoryModal(true)}>
                View Report
              </button>
            </div>
          </div>

          {/* Card 2: Consultation / Critical Deficits */}
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">Critical Deficits</span>
            </div>
            <div className="stat-body">
              <span className="stat-value" style={{ color: totalCritical > 0 ? '#ef4444' : 'var(--text-primary)' }}>
                {totalCritical}
              </span>
              <div className="stat-sparkline">
                <svg width="68" height="26" viewBox="0 0 68 26" fill="none">
                  <path d="M2 10 Q 18 8, 32 20 T 48 10 T 66 18" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </div>
            </div>
            <div className="stat-footer">
              <span className="stat-trend down">
                <ArrowDownRight size={13} /> 10% vs last month
              </span>
              <button className="stat-action-link" onClick={() => {
                document.getElementById('inventory-grid')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                View Report
              </button>
            </div>
          </div>

          {/* Card 3: Procedure / Transfers Dispatched */}
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">Transfers Dispatched</span>
            </div>
            <div className="stat-body">
              <span className="stat-value">{tradeHistory.stats.approved || 63}</span>
              <div className="stat-sparkline">
                <svg width="68" height="26" viewBox="0 0 68 26" fill="none">
                  <path d="M2 18 Q 18 20, 32 14 T 50 12 T 66 6" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </div>
            </div>
            <div className="stat-footer">
              <span className="stat-trend amber">
                <ArrowUpRight size={13} /> 20% vs last month
              </span>
              <button className="stat-action-link" onClick={() => {
                document.getElementById('trade-audit-section')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                View Report
              </button>
            </div>
          </div>

          {/* Card 4: Payment / Reallocated Units */}
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">Reallocated Value</span>
            </div>
            <div className="stat-body">
              <span className="stat-value">
                {tradeHistory.stats.total_transferred ? `${tradeHistory.stats.total_transferred}u` : '$ 20k'}
              </span>
              <div className="stat-sparkline">
                <svg width="68" height="26" viewBox="0 0 68 26" fill="none">
                  <path d="M2 19 Q 18 21, 34 11 T 50 13 T 66 4" stroke="#0d9488" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </div>
            </div>
            <div className="stat-footer">
              <span className="stat-trend teal">
                <ArrowUpRight size={13} /> 20% vs last month
              </span>
              <button className="stat-action-link" onClick={() => {
                document.getElementById('trade-audit-section')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                View Report
              </button>
            </div>
          </div>
        </section>

        {/* ROW 2: MAIN ANALYTICS & REQUISITIONS SPLIT (2fr 1fr Grid) */}
        <section className="hcare-analytics-split" id="inventory-grid">
          {/* Left Card: Inventory Nodes & Corridor Management */}
          <div className="analytics-main-card">
            <div className="analytics-header">
              <div className="analytics-title-group">
                <h2>Hospital Inventory Nodes</h2>
                <p>Oct 01, 2026 - Oct 07, 2026 • Real-time Multi-Agent Network</p>
              </div>

              {/* Action Buttons & Node Filters */}
              <div className="analytics-actions">
                {/* Node count selector */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.2rem',
                  border: '1px solid var(--border-subtle)'
                }}>
                  {[3, 4, 6].map(n => (
                    <button
                      key={n}
                      onClick={() => {
                        setNodeCount(n);
                        handleNewScenario(selectedTaluk, n);
                      }}
                      style={{
                        padding: '0.25rem 0.65rem',
                        fontSize: '0.74rem',
                        fontWeight: '700',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        border: 'none',
                        background: nodeCount === n ? '#2563eb' : 'transparent',
                        color: nodeCount === n ? '#ffffff' : 'var(--text-secondary)'
                      }}
                    >
                      {n} Nodes
                    </button>
                  ))}
                </div>

                {/* Start AI Negotiation button */}
                <button
                  className="btn btn-primary"
                  onClick={pendingTrade ? () => document.getElementById('verification-panel')?.scrollIntoView({ behavior: 'smooth' }) : handleStartNegotiation}
                  disabled={isNegotiating || processingTrade}
                  id="start-negotiation-btn"
                  style={{ padding: '0.45rem 1rem', fontSize: '0.82rem' }}
                  title="Run autonomous multi-agent AI negotiation"
                >
                  <Sparkles size={14} className={isNegotiating ? "spin" : ""} />
                  <span>{isNegotiating ? 'Negotiating...' : '🚀 Start AI Negotiation'}</span>
                </button>

                {/* Regenerate scenario */}
                <button
                  className="btn btn-secondary"
                  onClick={() => handleNewScenario(selectedTaluk, nodeCount)}
                  disabled={loading}
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
                  title="Generate new scenario in current corridor"
                >
                  <RefreshCw size={13} className={loading ? "spin" : ""} />
                  <span>New Scenario</span>
                </button>
              </div>
            </div>

            {/* Taluk Corridor Switcher Tabs */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              overflowX: 'auto',
              paddingBottom: '0.35rem',
              borderBottom: '1px solid var(--border-subtle)'
            }}>
              {(taluks.length > 0 ? taluks : [
                { name: 'All', label: 'All', count: 28 },
                { name: 'Mangalore', label: 'Mangalore', count: 14 },
                { name: 'Bantwal', label: 'Bantwal', count: 3 },
                { name: 'Puttur', label: 'Puttur', count: 3 },
                { name: 'Belthangady', label: 'Belthangady', count: 3 },
                { name: 'Sullia', label: 'Sullia', count: 2 },
                { name: 'Moodbidri', label: 'Moodbidri', count: 2 },
                { name: 'Kadaba', label: 'Kadaba', count: 1 },
              ]).map(t => {
                const isActive = selectedTaluk === t.name;
                return (
                  <button
                    key={t.name}
                    onClick={() => {
                      setSelectedTaluk(t.name);
                      handleNewScenario(t.name, nodeCount);
                    }}
                    disabled={loading}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      border: isActive ? '1px solid #2563eb' : '1px solid transparent',
                      background: isActive ? '#eff6ff' : 'transparent',
                      color: isActive ? '#2563eb' : 'var(--text-secondary)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {t.name} ({t.count})
                  </button>
                );
              })}
            </div>

            {/* Hospital Cards Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem'
            }}>
              {filteredHospitals.map((hospital, idx) => (
                <HospitalCard 
                  key={hospital.name || idx} 
                  hospital={hospital}
                  isRequester={pendingTrade?.receiver === hospital.name}
                  isDonor={pendingTrade?.donor === hospital.name}
                />
              ))}
            </div>
          </div>

          {/* Right Card: Upcoming Appointments & Requisitions List */}
          <div className="requisitions-card">
            <div className="requisitions-header">
              <span className="requisitions-title">Upcoming Appointments</span>
              <button 
                className="btn btn-primary"
                onClick={() => setShowFindMedicineModal(true)}
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderRadius: '8px' }}
              >
                <Plus size={13} />
                <span>Add New</span>
              </button>
            </div>

            {/* List of Requisitions & Patient Visits */}
            <div className="requisitions-list">
              {/* Actual Map Requisitions from state */}
              {medicineRequests.map((req) => (
                <div key={req.id || `${req.to}_${req.timestamp}`} className="requisition-item">
                  <div className="req-patient-info">
                    <div className="req-avatar">
                      {req.from ? req.from.substring(0, 2).toUpperCase() : 'RQ'}
                    </div>
                    <div>
                      <div className="req-name">{req.from}</div>
                      <div className="req-time">
                        {req.timestamp ? new Date(req.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:00 AM'} • {req.quantity} {req.medicine}
                      </div>
                    </div>
                  </div>
                  <span className={`req-tag ${req.status === 'ACCEPTED' ? 'req-tag-green' : req.status === 'REJECTED' ? 'req-tag-orange' : 'req-tag-blue'}`}>
                    {req.status || 'PENDING'}
                  </span>
                </div>
              ))}

              {/* Patient appointments matching the screenshot */}
              <div className="requisition-item">
                <div className="req-patient-info">
                  <div className="req-avatar" style={{ background: '#fef3c7', color: '#b45309' }}>SJ</div>
                  <div>
                    <div className="req-name">Sarah Johnson</div>
                    <div className="req-time">10:00 AM • Routine Checkup</div>
                  </div>
                </div>
                <span className="req-tag req-tag-orange">Check-up</span>
              </div>

              <div className="requisition-item">
                <div className="req-patient-info">
                  <div className="req-avatar" style={{ background: '#fee2e2', color: '#b91c1c' }}>MB</div>
                  <div>
                    <div className="req-name">Michael Brown</div>
                    <div className="req-time">10:00 AM • Cardiology Follow-up</div>
                  </div>
                </div>
                <span className="req-tag req-tag-yellow">Follow-up</span>
              </div>

              <div className="requisition-item">
                <div className="req-patient-info">
                  <div className="req-avatar" style={{ background: '#ecfdf5', color: '#047857' }}>EW</div>
                  <div>
                    <div className="req-name">Emily Wilson</div>
                    <div className="req-time">10:00 AM • Medical Consultation</div>
                  </div>
                </div>
                <span className="req-tag req-tag-green">Consultation</span>
              </div>

              <div className="requisition-item">
                <div className="req-patient-info">
                  <div className="req-avatar" style={{ background: '#f3e8ff', color: '#7e22ce' }}>SL</div>
                  <div>
                    <div className="req-name">Sophia Lee</div>
                    <div className="req-time">11:00 AM • Prescription Refill</div>
                  </div>
                </div>
                <span className="req-tag req-tag-yellow">Follow-up</span>
              </div>

              <div className="requisition-item">
                <div className="req-patient-info">
                  <div className="req-avatar" style={{ background: '#e0f2fe', color: '#0369a1' }}>DR</div>
                  <div>
                    <div className="req-name">David Robinson</div>
                    <div className="req-time">11:00 AM • Vitals Check-up</div>
                  </div>
                </div>
                <span className="req-tag req-tag-orange">Check-up</span>
              </div>

              <div className="requisition-item">
                <div className="req-patient-info">
                  <div className="req-avatar" style={{ background: '#f1f5f9', color: '#334155' }}>TC</div>
                  <div>
                    <div className="req-name">Thomas Clark</div>
                    <div className="req-time">11:00 AM • Post-Operative Review</div>
                  </div>
                </div>
                <span className="req-tag req-tag-yellow">Follow-up</span>
              </div>
            </div>
          </div>
        </section>

        {/* ROW 3: TASKS / NEGOTIATION FEED & PATIENT / CLINICAL SIGN-OFF (2fr 1fr Grid) */}
        <section className="hcare-bottom-split">
          {/* Left Card: Tasks / Live AI Negotiation Events Feed */}
          <div className="analytics-main-card">
            <div className="analytics-header">
              <div className="analytics-title-group">
                <h2>Autonomous AI Negotiation Tasks</h2>
                <p>Real-time peer-to-peer inter-hospital negotiation messages</p>
              </div>
              <button 
                className="btn btn-primary"
                onClick={handleStartNegotiation}
                disabled={isNegotiating}
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderRadius: '8px' }}
              >
                <Plus size={13} />
                <span>New Task</span>
              </button>
            </div>

            {/* Negotiation Feed Component */}
            <NegotiationFeed 
              events={events}
              isNegotiating={isNegotiating}
            />
          </div>

          {/* Right Card: Patient / Clinical Verification Profile */}
          <div className="patient-details-card" id="verification-panel">
            {pendingTrade ? (
              /* When an AI Trade is pending: Human-in-the-Loop Sign-off */
              <PendingTradePanel 
                pendingTrade={pendingTrade}
                onApprove={handleApproveTrade}
                onReject={handleRejectTrade}
                processing={processingTrade}
              />
            ) : (
              /* When no pending trade: Next Patient / Focal Hospital Details (Matches Screenshot) */
              <>
                <div className="requisitions-header">
                  <span className="requisitions-title">Next Patient Details</span>
                  <span className="badge badge-optimal">Active Profile</span>
                </div>

                <div className="patient-profile-header">
                  <div className="patient-profile-avatar">
                    <User size={24} color="#2563eb" />
                  </div>
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                      James Brown
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      11:00 AM • Emergency Admission
                    </div>
                    <span className="req-tag req-tag-green" style={{ display: 'inline-block', marginTop: '0.2rem' }}>
                      Consultation
                    </span>
                  </div>
                </div>

                <div className="patient-meta-grid">
                  <div className="meta-field">
                    <span className="meta-label">Patient ID</span>
                    <span className="meta-value">HT5242</span>
                  </div>
                  <div className="meta-field">
                    <span className="meta-label">Gender</span>
                    <span className="meta-value">Male</span>
                  </div>
                  <div className="meta-field">
                    <span className="meta-label">Age</span>
                    <span className="meta-value">21</span>
                  </div>
                  <div className="meta-field">
                    <span className="meta-label">Last Visit</span>
                    <span className="meta-value">01/12/2026</span>
                  </div>
                  <div className="meta-field">
                    <span className="meta-label">Height</span>
                    <span className="meta-value">156 cm</span>
                  </div>
                  <div className="meta-field">
                    <span className="meta-label">Weight</span>
                    <span className="meta-value">60 kg</span>
                  </div>
                </div>

                <div style={{
                  padding: '0.75rem',
                  borderRadius: '10px',
                  background: 'var(--bg-surface)',
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <CheckCircle2 size={16} color="#10b981" />
                  <span>Assigned Hospital: <strong>Wenlock District Hospital (Mangaluru)</strong></span>
                </div>
              </>
            )}
          </div>
        </section>

        {/* ROW 4: IMMUTABLE AUDIT TRAIL & REQUISITION LEDGERS */}
        <section id="trade-audit-section">
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

        {/* AI REASONING TELEMETRY (Toggled Drawer) */}
        {showReasoning && (
          <section id="reasoning-telemetry">
            <ReasoningDrawer 
              reasoningData={reasoningData}
              onClearLog={handleClearReasoning}
            />
          </section>
        )}

      </main>

      {/* MODALS & OVERLAYS */}
      {/* 1. Dakshina Kannada Hospital Directory Modal */}
      <DakshinaKannadaModal
        isOpen={showDirectoryModal}
        onClose={() => setShowDirectoryModal(false)}
        directory={directory}
        onSelectHospital={handleSelectHospitalFromDirectory}
        currentActiveNames={hospitals.map(h => h.name)}
      />

      {/* 2. Interactive Find Medicine OpenStreetMap Modal */}
      <FindMedicineModal 
        isOpen={showFindMedicineModal}
        onClose={() => setShowFindMedicineModal(false)}
        onRequestSuccess={() => {
          fetchMedicineRequests();
          fetchAllData();
        }}
      />

      {/* 3. API Key Modal */}
      <ApiKeyModal 
        isOpen={showKeyModal}
        onClose={() => setShowKeyModal(false)}
        onSaveKey={handleSaveKey}
        currentStatus={status}
      />

      {/* 4. Assistant Chatbot */}
      <SupplyChainChatbot />
    </div>
  );
}
