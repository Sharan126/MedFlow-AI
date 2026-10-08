import React, { useState } from 'react';
import { MessageSquare, ChevronDown, ChevronUp, Bot, Sparkles, Building2, ArrowRight } from 'lucide-react';

export default function NegotiationFeed({ events, isNegotiating }) {
  const [expandedReasoning, setExpandedReasoning] = useState({});

  const toggleReasoning = (idx) => {
    setExpandedReasoning((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  // Plain-English, healthcare-friendly badge labeling
  const getEventBadge = (type) => {
    switch (type) {
      case 'request':
        return { label: 'URGENT SHORTAGE ALERT', bg: 'var(--rose-50)', color: 'var(--rose-700)', border: 'var(--rose-100)' };
      case 'accept':
        return { label: 'PROPOSAL ACCEPTED', bg: 'var(--emerald-50)', color: 'var(--emerald-700)', border: 'var(--emerald-100)' };
      case 'counter':
        return { label: 'SAFE SURPLUS OFFER', bg: 'var(--amber-50)', color: 'var(--amber-700)', border: 'var(--amber-100)' };
      case 'reject':
        return { label: 'PROPOSAL DECLINED', bg: 'var(--bg-surface)', color: 'var(--text-muted)', border: 'var(--border-subtle)' };
      case 'approval':
        return { label: 'PHYSICIAN AUTHORIZED', bg: 'var(--emerald-50)', color: 'var(--emerald-700)', border: 'var(--emerald-100)' };
      case 'rejection':
        return { label: 'DECLINED BY ADMIN', bg: 'var(--rose-50)', color: 'var(--rose-700)', border: 'var(--rose-100)' };
      default:
        return { label: 'NETWORK DISPATCH', bg: 'var(--teal-50)', color: 'var(--teal-700)', border: 'var(--teal-border)' };
    }
  };

  return (
    <div className="med-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Title & Transmission Count */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'var(--teal-100)',
            color: 'var(--teal-700)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <MessageSquare size={19} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              Hospital AI Coordination & Dispatch Log
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Autonomous peer-to-peer communication between hospital inventory agents
            </p>
          </div>
        </div>

        {events && events.length > 0 && (
          <span className="badge badge-surplus" style={{ fontWeight: '600' }}>
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
            padding: '2.75rem 1rem',
            color: 'var(--text-muted)',
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-subtle)'
          }}>
            <Bot size={36} style={{ margin: '0 auto 0.75rem auto', opacity: 0.5, color: 'var(--teal-600)' }} />
            <p style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)' }}>
              No active inter-hospital coordination in progress.
            </p>
            <p style={{ fontSize: '0.82rem', marginTop: '0.25rem', color: 'var(--text-secondary)' }}>
              Click <strong>"Auto-Resolve Medication Shortages"</strong> above to trigger peer hospital coordination.
            </p>
          </div>
        )}

        {/* Loading Spinner for Negotiation */}
        {isNegotiating && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1.25rem',
            background: 'var(--teal-50)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--teal-border)'
          }}>
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              border: '3px solid var(--teal-600)',
              borderTopColor: 'transparent',
              animation: 'spinSlow 1s infinite linear'
            }} />
            <div>
              <div style={{ fontWeight: '700', color: 'var(--teal-700)', fontSize: '0.92rem' }}>
                Gemini Medical AI Coordinating Regional Hospitals...
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Auditing peer inventories, verifying patient safety buffers, and crafting reciprocal transfer options.
              </div>
            </div>
          </div>
        )}

        {/* Events Rendered as Chat Cards */}
        {events && events.map((ev, idx) => {
          const badge = getEventBadge(ev.type);
          const hasReasoning = Boolean(ev.reasoning && ev.reasoning.trim().length > 0);
          const isExpanded = expandedReasoning[idx];

          return (
            <div 
              key={idx}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                boxShadow: 'var(--shadow-sm)',
                borderLeft: `4px solid ${badge.color}`,
                transition: 'all 0.15s ease'
              }}
            >
              {/* Event Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem' }}>
                  <span style={{ 
                    background: 'var(--bg-surface)', 
                    color: 'var(--text-muted)', 
                    padding: '0.15rem 0.45rem', 
                    borderRadius: '4px',
                    fontFamily: 'var(--font-mono)', 
                    fontSize: '0.74rem' 
                  }}>
                    {ev.timestamp || '00:00:00'}
                  </span>
                  
                  <span style={{ fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Building2 size={14} color="var(--teal-600)" />
                    {ev.agent}
                  </span>

                  <ArrowRight size={13} style={{ color: 'var(--text-muted)' }} />

                  <span style={{ color: 'var(--blue-700)', fontWeight: '600' }}>
                    {ev.target || 'Regional Network'}
                  </span>
                </div>

                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '9999px',
                  background: badge.bg,
                  color: badge.color,
                  border: `1px solid ${badge.border}`,
                  letterSpacing: '0.03em'
                }}>
                  {badge.label}
                </span>
              </div>

              {/* Message Bubble Text */}
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                {ev.message}
              </div>

              {/* Expandable Technical Reasoning (Hidden by default for non-tech judges) */}
              {hasReasoning && (
                <div style={{ marginTop: '0.25rem' }}>
                  <button
                    onClick={() => toggleReasoning(idx)}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      padding: '0.25rem 0.65rem',
                      color: 'var(--text-secondary)',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    <Sparkles size={13} color="var(--teal-600)" />
                    <span>{isExpanded ? 'Hide AI Clinical Rationale' : '🔍 View AI Clinical Rationale'}</span>
                    {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>

                  {isExpanded && (
                    <div style={{
                      marginTop: '0.5rem',
                      padding: '0.75rem 0.95rem',
                      background: 'var(--teal-50)',
                      borderLeft: '3px solid var(--teal-600)',
                      borderRadius: '0 6px 6px 0',
                      fontSize: '0.82rem',
                      color: 'var(--teal-700)',
                      lineHeight: 1.5
                    }}>
                      <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--teal-700)', marginBottom: '0.25rem', fontWeight: '800' }}>
                        Autonomous Agent Deliberation:
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
