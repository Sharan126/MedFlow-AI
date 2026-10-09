import React from 'react';
import { Activity, ShieldCheck, ShieldAlert, Key, RefreshCw, Cpu, Database, AlertCircle, TrendingUp, Recycle, Scale } from 'lucide-react';
import FindMedicineButton from './FindMedicineButton';

export default function Navbar({ 
  status, 
  scenarioCount, 
  onNewScenario, 
  onOpenKeyModal, 
  onOpenFindMedicine,
  onOpenForecast,
  onOpenRisk,
  onOpenExpiry,
  onOpenRedistribution,
  onOpenPriority,
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
            Self-Healing Medical Supply Chain • Autonomous Multi-Agent Negotiation & Emergency Map Override
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

        {/* Demand Forecast Engine Button */}
        <button
          onClick={onOpenForecast}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.52rem 0.9rem',
            borderRadius: 'var(--radius-md, 8px)',
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.16), rgba(59, 130, 246, 0.2))',
            border: '1px solid rgba(6, 182, 212, 0.45)',
            color: '#38bdf8',
            fontSize: '0.8rem',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
          }}
          id="btn-demand-forecast"
          title="Engine 1: Open 7/14 Day Demand Forecast & Impending Stockout Engine"
        >
          <TrendingUp size={14} />
          <span>📈 Demand Forecast</span>
        </button>

        {/* Engine 2: Risk Engine Button */}
        <button
          onClick={onOpenRisk}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.52rem 0.9rem',
            borderRadius: 'var(--radius-md, 8px)',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.16), rgba(249, 115, 22, 0.2))',
            border: '1px solid rgba(239, 68, 68, 0.45)',
            color: '#f87171',
            fontSize: '0.8rem',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
          }}
          id="btn-risk-engine"
          title="Engine 2: Days of Supply vs Supplier Lead Time & Safety Buffer Risk Engine"
        >
          <ShieldAlert size={14} />
          <span>🚨 Risk Engine</span>
        </button>

        {/* Engine 3: Expiry Intelligence Button */}
        <button
          onClick={onOpenExpiry}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.52rem 0.9rem',
            borderRadius: 'var(--radius-md, 8px)',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.16), rgba(6, 182, 212, 0.2))',
            border: '1px solid rgba(16, 185, 129, 0.45)',
            color: '#34d399',
            fontSize: '0.8rem',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
          }}
          id="btn-expiry-engine"
          title="Engine 3: FEFO Batch Audit, Potential Unused Units & Waste Risk Detection"
        >
          <Recycle size={14} />
          <span>♻️ Expiry Intelligence</span>
        </button>

        {/* Engine 4: Redistribution Optimizer Button */}
        <button
          onClick={onOpenRedistribution}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.52rem 0.9rem',
            borderRadius: 'var(--radius-md, 8px)',
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.16), rgba(16, 185, 129, 0.2))',
            border: '1px solid rgba(56, 189, 248, 0.45)',
            color: '#38bdf8',
            fontSize: '0.8rem',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
          }}
          id="btn-redistribution-engine"
          title="Engine 4: Autonomous Surplus-to-Deficit Safe Inter-Hospital Barter Optimizer"
        >
          <RefreshCw size={14} />
          <span>🔄 Redistribution</span>
        </button>

        {/* Engine 5: Priority Engine Button */}
        <button
          onClick={onOpenPriority}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.52rem 0.9rem',
            borderRadius: 'var(--radius-md, 8px)',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.16), rgba(239, 68, 68, 0.2))',
            border: '1px solid rgba(245, 158, 11, 0.45)',
            color: '#fbbf24',
            fontSize: '0.8rem',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
          }}
          id="btn-priority-engine"
          title="Engine 5: Multi-Attribute Triage Ranking for Scarce Stock Contention"
        >
          <Scale size={14} />
          <span>⚖️ Priority Engine</span>
        </button>

        {/* Emergency Map Requisition Button */}
        <FindMedicineButton onClick={onOpenFindMedicine} label="🗺️ Emergency Map" />

        {/* Gemini API Key Configuration Trigger */}
        <button 
          onClick={onOpenKeyModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.48rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            background: isKeyConfigured ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${isKeyConfigured ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.5)'}`,
            color: isKeyConfigured ? '#34d399' : '#f87171',
            fontSize: '0.8rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          title={isKeyConfigured ? "Gemini API key is active (Click to change)" : "Configure Gemini API Key"}
          id="btn-navbar-key"
        >
          {isKeyConfigured ? <ShieldCheck size={15} /> : <AlertCircle size={15} />}
          <span>{isKeyConfigured ? 'Gemini Active' : 'API Key Required'}</span>
          <Key size={12} style={{ opacity: 0.7 }} />
        </button>

        {/* Generate New Scenario Button */}
        <button
          className="btn btn-secondary"
          onClick={onNewScenario}
          disabled={loading}
          style={{ padding: '0.52rem 1rem', fontSize: '0.85rem' }}
          id="btn-generate-scenario"
        >
          <RefreshCw size={15} className={loading ? "spin" : ""} />
          <span>New Scenario</span>
        </button>
      </div>
    </header>
  );
}
