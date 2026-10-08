import React, { useState } from 'react';
import { MessageSquare, ChevronDown, ChevronUp, Bot, BrainCircuit, Check, X, ArrowRight, ShieldAlert } from 'lucide-react';

export default function NegotiationFeed({ events, isNegotiating }) {
  const [expandedReasoning, setExpandedReasoning] = useState({});

  const toggleReasoning = (idx) => {
    setExpandedReasoning((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  // Helper to color-code event types
  const getEventBadge = (type) => {
    switch (type) {
      case 'request':
        return { label: 'CRITICAL REQUEST', bg: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: 'rgba(239, 68, 68, 0.4)' };
      case 'accept':
        return { label: 'ACCEPT OFFER', bg: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: 'rgba(16, 185, 129, 0.4)' };
      case 'counter':
        return { label: 'COUNTER PROPOSAL', bg: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.4)' };
      case 'reject':
        return { label: 'REJECT OFFER', bg: 'rgba(100, 116, 139, 0.25)', color: '#94a3b8', border: 'rgba(100, 116, 139, 0.4)' };
      case 'approval':
        return { label: 'HUMAN APPROVED', bg: 'rgba(16, 185, 129, 0.25)', color: '#6ee7b7', border: 'rgba(16, 185, 129, 0.5)' };
      case 'rejection':
        return { label: 'HUMAN REJECTED', bg: 'rgba(239, 68, 68, 0.25)', color: '#fca5a5', border: 'rgba(239, 68, 68, 0.5)' };
      default:
        return { label: 'NETWORK EVENT', bg: 'rgba(6, 182, 212, 0.15)', color: '#38bdf8', border: 'rgba(6, 182, 212, 0.3)' };
    }
  };

  return (
    <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(6, 182, 212, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(6, 182, 212, 0.3)'
          }}>
            <Bot size={18} color="#06b6d4" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Live Autonomous Negotiation Feed</h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Real-time multi-agent communications powered strictly by Gemini 2.5 Flash
            </p>
          </div>
        </div>

        {events && events.length > 0 && (
          <span className="badge badge-surplus" style={{ fontFamily: 'var(--font-mono)' }}>
            {events.length} Transmissions
          </span>
        )}
      </div>

      {/* Events List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        maxHeight: '440px',
        overflowY: 'auto',
        paddingRight: '0.4rem'
      }}>
        {(!events || events.length === 0) && !isNegotiating && (
          <div style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            color: 'var(--text-muted)',
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-subtle)'
          }}>
            <BrainCircuit size={36} style={{ margin: '0 auto 0.75rem auto', opacity: 0.4, color: '#06b6d4' }} />
            <p style={{ fontSize: '0.95rem', fontWeight: '500', color: 'var(--text-secondary)' }}>
              No active negotiation in progress.
            </p>
            <p style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>
              Click <strong>"Start AI Negotiation"</strong> above to trigger autonomous agent triage.
            </p>
          </div>
        )}

        {isNegotiating && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1.25rem',
            background: 'rgba(6, 182, 212, 0.1)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(6, 182, 212, 0.3)'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: '2px solid #06b6d4',
              borderTopColor: 'transparent',
              animation: 'thinkingSpin 1s infinite linear'
            }} />
            <div>
              <div style={{ fontWeight: '600', color: '#67e8f9', fontSize: '0.9rem' }}>
                Gemini 2.5 Multi-Agent Negotiation Active...
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Evaluating peer inventories, generating strategic requests, and auditing counter-offers.
              </div>
            </div>
          </div>
        )}

        {events && events.map((ev, idx) => {
          const badge = getEventBadge(ev.type);
          const hasReasoning = Boolean(ev.reasoning && ev.reasoning.trim().length > 0);
          const isExpanded = expandedReasoning[idx];

          return (
            <div 
              key={idx}
              style={{
                background: 'rgba(15, 23, 42, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                borderRadius: 'var(--radius-md)',
                padding: '0.95rem 1.15rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                borderLeft: `4px solid ${badge.color}`,
                transition: 'all 0.2s ease'
              }}
            >
              {/* Event Metadata Line */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    [{ev.timestamp || '00:00:00'}]
                  </span>
                  <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                    {ev.agent}
                  </span>
                  <ArrowRight size={13} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ color: '#38bdf8', fontWeight: '500' }}>
                    {ev.target || 'Network'}
                  </span>
                </div>

                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: '700',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '4px',
                  background: badge.bg,
                  color: badge.color,
                  border: `1px solid ${badge.border}`,
                  letterSpacing: '0.04em'
                }}>
                  {badge.label}
                </span>
              </div>

              {/* Message Content */}
              <div style={{ fontSize: '0.88rem', color: '#e2e8f0', lineHeight: 1.55 }}>
                {ev.message}
              </div>

              {/* Expandable AI Reasoning Section */}
              {hasReasoning && (
                <div style={{ marginTop: '0.35rem' }}>
                  <button
                    onClick={() => toggleReasoning(idx)}
                    style={{
                      background: 'rgba(0, 0, 0, 0.25)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '4px',
                      padding: '0.25rem 0.65rem',
                      color: '#94a3b8',
                      fontSize: '0.74rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    <BrainCircuit size={13} color="#a855f7" />
                    <span>{isExpanded ? 'Hide AI Reasoning' : '🧠 AI Internal Reasoning'}</span>
                    {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>

                  {isExpanded && (
                    <div style={{
                      marginTop: '0.45rem',
                      padding: '0.65rem 0.85rem',
                      background: 'rgba(168, 85, 247, 0.08)',
                      borderLeft: '2px solid #a855f7',
                      borderRadius: '0 4px 4px 0',
                      fontSize: '0.8rem',
                      color: '#d8b4fe',
                      fontFamily: 'var(--font-mono)',
                      lineHeight: 1.5
                    }}>
                      <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#c084fc', marginBottom: '0.25rem', fontWeight: '700' }}>
                        Private Agent Deliberation:
                      </div>
                      "{ev.reasoning}"
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
