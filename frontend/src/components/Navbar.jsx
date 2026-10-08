import React from 'react';
import { Activity, ShieldCheck, Key, RefreshCw, Cpu, Database, AlertCircle } from 'lucide-react';

export default function Navbar({ 
  status, 
  scenarioCount, 
  onNewScenario, 
  onOpenKeyModal, 
  loading 
}) {
  const isKeyConfigured = status?.api_key_configured;

  return (
    <header className="glass-card" style={{ 
      margin: '1.25rem 1.5rem', 
      padding: '1rem 1.75rem',
      borderRadius: 'var(--radius-xl)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '1rem',
      border: '1px solid rgba(255, 255, 255, 0.08)'
    }}>
      {/* Brand & Subtitle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(6, 182, 212, 0.4)',
        }}>
          <Activity size={26} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '800', 
              background: 'linear-gradient(to right, #ffffff, #94a3b8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.03em'
            }}>
              MedFlow-AI
            </h1>
            <span className="badge badge-surplus" style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}>
              Autonomous Agents
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.72rem',
              color: '#38bdf8',
              background: 'rgba(56, 189, 248, 0.1)',
              padding: '0.2rem 0.55rem',
              borderRadius: '9999px',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              fontFamily: 'var(--font-mono)'
            }}>
              <Cpu size={12} />
              {status?.model || 'gemini-3.5-flash-lite'}
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Self-Healing Medical Supply Chain • Human-in-the-Loop Audit Trail
          </p>
        </div>
      </div>

      {/* Action Controls & Key Config */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
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
          color: 'var(--text-secondary)'
        }}>
          <Database size={15} color="#06b6d4" />
          <span>Scenario #{scenarioCount}</span>
        </div>

        {/* API Key Status Pill */}
        <button 
          onClick={onOpenKeyModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.45rem 0.95rem',
            borderRadius: 'var(--radius-md)',
            background: isKeyConfigured ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${isKeyConfigured ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.5)'}`,
            color: isKeyConfigured ? '#34d399' : '#f87171',
            fontSize: '0.82rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          title={isKeyConfigured ? "Gemini API key is active" : "Click to configure Gemini API Key"}
        >
          {isKeyConfigured ? <ShieldCheck size={16} /> : <AlertCircle size={16} />}
          <span>{isKeyConfigured ? 'Gemini API Ready' : 'API Key Required'}</span>
          <Key size={13} style={{ opacity: 0.6 }} />
        </button>

        {/* Generate New Scenario Button */}
        <button
          className="btn btn-secondary"
          onClick={onNewScenario}
          disabled={loading}
          style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
          id="btn-generate-scenario"
        >
          <RefreshCw size={15} className={loading ? "spin" : ""} />
          <span>New Scenario</span>
        </button>
      </div>
    </header>
  );
}
