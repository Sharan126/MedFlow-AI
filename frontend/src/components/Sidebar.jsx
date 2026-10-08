import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Clock, 
  Users, 
  Building2, 
  Package, 
  CreditCard, 
  Settings, 
  HelpCircle, 
  ChevronDown, 
  Activity, 
  HeartPulse,
  MapPin,
  ShieldCheck,
  Stethoscope,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ 
  activeTab = 'dashboard', 
  onSelectTab, 
  pendingCount = 0,
  onOpenDirectory,
  onOpenKeyModal,
  onOpenFindMedicine,
  onStartNegotiation,
  isNegotiating = false
}) {
  return (
    <aside className="hcare-sidebar">
      {/* Brand Logo Header */}
      <div className="sidebar-brand">
        <div className="brand-icon-box">
          <HeartPulse size={20} color="#ffffff" />
        </div>
        <div className="brand-text">
          <span className="brand-name">HCare</span>
          <span className="brand-sub">MedFlow AI</span>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="sidebar-nav-container">
        {/* Section: MAIN */}
        <div className="nav-group">
          <div className="nav-group-title">MAIN</div>
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => onSelectTab && onSelectTab('dashboard')}
          >
            <LayoutDashboard size={18} className="nav-icon" />
            <span>Dashboard</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'directory' ? 'active' : ''}`}
            onClick={() => {
              if (onOpenDirectory) onOpenDirectory();
              if (onSelectTab) onSelectTab('directory');
            }}
          >
            <Building2 size={18} className="nav-icon" />
            <span>Patients & Clinics</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'map' ? 'active' : ''}`}
            onClick={() => {
              if (onOpenFindMedicine) onOpenFindMedicine();
              if (onSelectTab) onSelectTab('map');
            }}
          >
            <MapPin size={18} className="nav-icon" />
            <span>Emergency Map</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => onSelectTab && onSelectTab('requests')}
          >
            <Clock size={18} className="nav-icon" />
            <span>Appointments</span>
            {pendingCount > 0 && (
              <span className="nav-badge-pill">{pendingCount}</span>
            )}
          </button>
        </div>

        {/* Section: MANAGEMENT */}
        <div className="nav-group">
          <div className="nav-group-title">MANAGEMENT</div>
          <button 
            className={`nav-item ${activeTab === 'negotiate' ? 'active' : ''}`}
            onClick={() => {
              if (onStartNegotiation) onStartNegotiation();
              if (onSelectTab) onSelectTab('negotiate');
            }}
          >
            <Sparkles size={18} className={`nav-icon ${isNegotiating ? 'spin' : ''}`} />
            <span>AI Negotiation</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => onSelectTab && onSelectTab('inventory')}
          >
            <Package size={18} className="nav-icon" />
            <span>Stock Inventory</span>
          </button>
        </div>

        {/* Section: FINANCE & AUDIT */}
        <div className="nav-group">
          <div className="nav-group-title">FINANCE</div>
          <button 
            className={`nav-item ${activeTab === 'trades' ? 'active' : ''}`}
            onClick={() => onSelectTab && onSelectTab('trades')}
          >
            <CreditCard size={18} className="nav-icon" />
            <span>Trade Ledgers</span>
          </button>
        </div>

        {/* Section: PERFORMANCE */}
        <div className="nav-group">
          <div className="nav-group-title">PERFORMANCE</div>
          <button 
            className="nav-item"
            onClick={onOpenKeyModal}
          >
            <Settings size={18} className="nav-icon" />
            <span>Settings / API</span>
          </button>

          <button 
            className="nav-item"
            onClick={() => {
              const el = document.getElementById('trade-audit-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <HelpCircle size={18} className="nav-icon" />
            <span>Audit & Help</span>
          </button>
        </div>
      </div>

      {/* User Doctor Profile at Bottom */}
      <div className="sidebar-user-card">
        <div className="user-avatar-wrapper">
          <div className="user-avatar">
            <Stethoscope size={18} color="#2563eb" />
          </div>
          <span className="online-indicator" />
        </div>
        <div className="user-info">
          <div className="user-name">Dr. James Wilson</div>
          <div className="user-role">Dakshina Kannada CMO</div>
        </div>
        <ChevronDown size={14} className="user-chevron" />
      </div>
    </aside>
  );
}
