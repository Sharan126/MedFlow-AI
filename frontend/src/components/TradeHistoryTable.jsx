import React, { useState } from 'react';
import { History, CheckCircle2, XCircle, ChevronDown, ChevronUp, Package, ArrowRight, ShieldCheck } from 'lucide-react';

export default function TradeHistoryTable({ historyData }) {
  const [expandedId, setExpandedId] = useState(null);

  const trades = historyData?.trades || [];
  const stats = historyData?.stats || { approved: 0, rejected: 0, total_transferred: 0 };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Title & Summary Metrics */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <History size={18} color="#10b981" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Immutable Trade Audit History</h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Complete audit ledger recording human approval and rejection decisions
            </p>
          </div>
        </div>

        {/* KPI Counter Chips */}
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <div style={{
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.82rem',
            color: '#34d399',
            fontWeight: '600'
          }}>
            <CheckCircle2 size={15} />
            <span>{stats.approved} Approved</span>
          </div>

          <div style={{
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.82rem',
            color: '#f87171',
            fontWeight: '600'
          }}>
            <XCircle size={15} />
            <span>{stats.rejected} Rejected</span>
          </div>

          <div style={{
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(6, 182, 212, 0.12)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.82rem',
            color: '#67e8f9',
            fontWeight: '600'
          }}>
            <Package size={15} />
            <span>{stats.total_transferred} Units Reallocated</span>
          </div>
        </div>
      </div>

      {/* Table */}
      {trades.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '2.5rem 1rem',
          color: 'var(--text-muted)',
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: 'var(--radius-md)',
          border: '1px dashed var(--border-subtle)',
          fontSize: '0.88rem'
        }}>
          No executed or rejected trades on record. Run a negotiation to propose transfers.
        </div>
      ) : (
        <div style={{
          overflowX: 'auto',
          background: 'rgba(0, 0, 0, 0.25)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.03)', color: 'var(--text-muted)', textAlign: 'left', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '0.65rem 0.85rem', fontWeight: '600', width: '80px' }}>Trade #</th>
                <th style={{ padding: '0.65rem 0.85rem', fontWeight: '600', width: '160px' }}>Timestamp</th>
                <th style={{ padding: '0.65rem 0.85rem', fontWeight: '600' }}>Routing Corridor</th>
                <th style={{ padding: '0.65rem 0.85rem', fontWeight: '600' }}>Medicines Transferred</th>
                <th style={{ padding: '0.65rem 0.85rem', fontWeight: '600', textAlign: 'center', width: '120px' }}>Status</th>
                <th style={{ padding: '0.65rem 0.85rem', fontWeight: '600', textAlign: 'right', width: '70px' }}>Audit</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((t) => {
                const isApproved = t.status === 'APPROVED';
                const isExpanded = expandedId === t.trade_id;

                return (
                  <React.Fragment key={t.trade_id}>
                    <tr 
                      onClick={() => toggleExpand(t.trade_id)}
                      style={{ 
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        cursor: 'pointer',
                        background: isExpanded ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <td style={{ padding: '0.75rem 0.85rem', fontFamily: 'var(--font-mono)', fontWeight: '700', color: '#94a3b8' }}>
                        #{t.trade_id}
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                        {t.timestamp}
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600' }}>
                          <span style={{ color: '#ffffff' }}>{t.donor}</span>
                          <ArrowRight size={13} style={{ color: '#06b6d4' }} />
                          <span style={{ color: '#38bdf8' }}>{t.receiver}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {Object.entries(t.medicines || {}).map(([med, qty]) => (
                            <span 
                              key={med}
                              style={{
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                background: 'rgba(6, 182, 212, 0.1)',
                                color: '#67e8f9',
                                border: '1px solid rgba(6, 182, 212, 0.25)',
                                fontSize: '0.75rem',
                                fontFamily: 'var(--font-mono)'
                              }}
                            >
                              {qty} {med}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem', textAlign: 'center' }}>
                        {isApproved ? (
                          <span className="badge badge-optimal" style={{ fontSize: '0.68rem', padding: '0.2rem 0.55rem' }}>
                            <CheckCircle2 size={12} /> Approved
                          </span>
                        ) : (
                          <span className="badge badge-critical" style={{ fontSize: '0.68rem', padding: '0.2rem 0.55rem' }}>
                            <XCircle size={12} /> Rejected
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem', textAlign: 'right', color: 'var(--text-muted)' }}>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </td>
                    </tr>

                    {/* Expandable Explanation Details */}
                    {isExpanded && (
                      <tr style={{ background: 'rgba(0, 0, 0, 0.35)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <td colSpan={6} style={{ padding: '1rem 1.25rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#38bdf8' }}>
                              <ShieldCheck size={14} />
                              <span>Gemini Audit Record & Administrator Explanation:</span>
                            </div>
                            <div style={{ fontSize: '0.86rem', color: '#e2e8f0', lineHeight: 1.6, background: 'rgba(15, 23, 42, 0.6)', padding: '0.85rem', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                              {t.explanation || "No explanation logged."}
                            </div>
                            {t.counter_medicines && Object.keys(t.counter_medicines).length > 0 && (
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                Reciprocal return transfer: {Object.entries(t.counter_medicines).map(([m, q]) => `${q} ${m}`).join(', ')}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
