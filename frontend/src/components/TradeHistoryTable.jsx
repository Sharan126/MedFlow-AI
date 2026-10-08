import React, { useState } from 'react';
import { History, CheckCircle2, XCircle, ChevronDown, ChevronUp, Package, ArrowRight, ShieldCheck, FileText } from 'lucide-react';

export default function TradeHistoryTable({ historyData }) {
  const [expandedId, setExpandedId] = useState(null);

  const trades = historyData?.trades || [];
  const stats = historyData?.stats || { approved: 0, rejected: 0, total_transferred: 0 };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="med-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Title & Summary Metrics */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'var(--emerald-100)',
            color: 'var(--emerald-700)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <History size={19} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              Emergency Delivery & Compliance Audit Trail
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Permanent hospital regulatory log of authorized and declined medication transfers
            </p>
          </div>
        </div>

        {/* Clinical KPI Metric Cards */}
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <div style={{
            padding: '0.45rem 0.95rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--emerald-50)',
            border: '1px solid var(--emerald-100)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.84rem',
            color: 'var(--emerald-700)',
            fontWeight: '700'
          }}>
            <CheckCircle2 size={16} />
            <span>{stats.approved} Dispatched</span>
          </div>

          <div style={{
            padding: '0.45rem 0.95rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--rose-50)',
            border: '1px solid var(--rose-100)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.84rem',
            color: 'var(--rose-700)',
            fontWeight: '700'
          }}>
            <XCircle size={16} />
            <span>{stats.rejected} Declined</span>
          </div>

          <div style={{
            padding: '0.45rem 0.95rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--teal-50)',
            border: '1px solid var(--teal-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.84rem',
            color: 'var(--teal-700)',
            fontWeight: '700'
          }}>
            <Package size={16} />
            <span>{stats.total_transferred} Units Reallocated</span>
          </div>
        </div>
      </div>

      {/* Table Content */}
      {trades.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '2.5rem 1rem',
          color: 'var(--text-muted)',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px dashed var(--border-subtle)',
          fontSize: '0.88rem'
        }}>
          No completed or declined transfers in this session yet. Run an AI negotiation to propose emergency transfers.
        </div>
      ) : (
        <div style={{
          overflowX: 'auto',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-card)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', textAlign: 'left', borderBottom: '1px solid var(--border-card)' }}>
                <th style={{ padding: '0.75rem 1rem', fontWeight: '700', width: '80px' }}>Record #</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: '700', width: '160px' }}>Timestamp</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: '700' }}>Hospital Route</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: '700' }}>Medications Transferred</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: '700', textAlign: 'center', width: '130px' }}>Sign-off Status</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: '700', textAlign: 'right', width: '80px' }}>Details</th>
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
                        borderBottom: '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        background: isExpanded ? 'var(--bg-surface)' : 'transparent',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <td style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--text-muted)' }}>
                        #{t.trade_id}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        {t.timestamp}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700' }}>
                          <span style={{ color: 'var(--text-primary)' }}>{t.donor}</span>
                          <ArrowRight size={14} color="var(--teal-600)" />
                          <span style={{ color: 'var(--blue-700)' }}>{t.receiver}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {Object.entries(t.medicines || {}).map(([med, qty]) => (
                            <span 
                              key={med}
                              style={{
                                padding: '0.2rem 0.55rem',
                                borderRadius: '6px',
                                background: 'var(--teal-50)',
                                color: 'var(--teal-700)',
                                border: '1px solid var(--teal-border)',
                                fontSize: '0.78rem',
                                fontWeight: '700'
                              }}
                            >
                              📦 {qty} {med}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        {isApproved ? (
                          <span className="badge badge-optimal" style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem' }}>
                            <CheckCircle2 size={13} /> Authorized
                          </span>
                        ) : (
                          <span className="badge badge-critical" style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem' }}>
                            <XCircle size={13} /> Declined
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: 'var(--text-muted)' }}>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </td>
                    </tr>

                    {/* Expandable Clinical Record Details */}
                    {isExpanded && (
                      <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-card)' }}>
                        <td colSpan={6} style={{ padding: '1.1rem 1.35rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--teal-700)' }}>
                              <ShieldCheck size={15} />
                              <span>Clinical Authorization Note & Decision Justification:</span>
                            </div>
                            <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.6, background: 'var(--bg-card)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border-card)' }}>
                              "{t.explanation || "No explanation logged for this transfer."}"
                            </div>
                            {t.counter_medicines && Object.keys(t.counter_medicines).length > 0 && (
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Reciprocal return items: {Object.entries(t.counter_medicines).map(([m, q]) => `${q} ${m}`).join(', ')}
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
