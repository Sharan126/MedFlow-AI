import React from 'react';
import { Activity, ShieldCheck, Key, RefreshCw, Moon, Sun, AlertCircle, Building2, MapPin } from 'lucide-react';

export default function Navbar({ 
  status, 
  scenarioCount, 
  onNewScenario, 
  onOpenKeyModal, 
  loading,
  isDark,
  onToggleTheme
}) {
  const isKeyConfigured = status?.api_key_configured;

  return (
    <header className="med-card" style={{ 
      margin: '1.25rem 1.5rem', 
      padding: '1rem 1.75rem',
      borderRadius: 'var(--radius-xl)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '1rem'
    }}>
      {/* Brand & Healthcare Context */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, var(--teal-600), var(--blue-600))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(13, 148, 136, 0.35)',
          color: '#ffffff'
        }}>
          <Activity size={26} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <h1 style={{ 
              fontSize: '1.45rem', 
              fontWeight: '800', 
              color: 'var(--text-primary)',
              letterSpacing: '-0.03em'
            }}>
              MedFlow-AI
            </h1>
            <span className="badge badge-surplus" style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem' }}>
              🏥 Hospital Network
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              color: 'var(--teal-700)',
              background: 'var(--teal-50)',
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              border: '1px solid var(--teal-border)',
              fontWeight: '600'
            }}>
              Powered by {status?.model || 'Gemini 3.5 Flash'}
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
            Autonomous Medical Supply Coordinator • Human-in-the-Loop Clinical Verification
          </p>
        </div>
      </div>

      {/* Action Controls & Healthcare System Stats */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        {/* District Corridor Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.45rem 0.85rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.82rem',
          color: 'var(--text-secondary)'
        }}>
          <MapPin size={15} color="#06b6d4" />
          <span style={{ fontWeight: '600' }}>Dakshina Kannada Corridor</span>
        </div>

        {/* Scenario Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.45rem 0.85rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.82rem',
          color: 'var(--text-secondary)',
          fontWeight: '600'
        }}>
          <span>Scenario #{scenarioCount}</span>
        </div>

        {/* AI Key Status Button */}
        <button 
          onClick={onOpenKeyModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.45rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            background: isKeyConfigured ? 'var(--emerald-50)' : 'var(--rose-50)',
            border: `1px solid ${isKeyConfigured ? 'var(--emerald-100)' : 'var(--rose-100)'}`,
            color: isKeyConfigured ? 'var(--emerald-700)' : 'var(--rose-700)',
            fontSize: '0.82rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          title={isKeyConfigured ? "Gemini AI is active and responding" : "Click to set API Key"}
        >
          {isKeyConfigured ? <ShieldCheck size={16} /> : <AlertCircle size={16} />}
          <span>{isKeyConfigured ? 'Gemini AI Active' : 'Configure API Key'}</span>
          <Key size={13} style={{ opacity: 0.6 }} />
        </button>

        {/* New Scenario Button */}
        <button
          className="btn btn-secondary"
          onClick={onNewScenario}
          disabled={loading}
          style={{ padding: '0.5rem 0.95rem', fontSize: '0.84rem' }}
          id="btn-generate-scenario"
          title="Simulate random emergency medication crisis"
        >
          <RefreshCw size={15} className={loading ? "spin" : ""} />
          <span>New Crisis Scenario</span>
        </button>

        {/* Theme Toggle (Light / Dark) */}
        <button
          onClick={onToggleTheme}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          title={isDark ? "Switch to Clinical Light Mode" : "Switch to Night Shift Mode"}
        >
          {isDark ? <Sun size={17} color="#f59e0b" /> : <Moon size={17} color="#64748b" />}
        </button>
      </div>
    </header>
  );
}
