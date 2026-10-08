import React, { useState } from 'react';
import { 
  History, 
  CheckCircle2, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  Package, 
  ArrowRight, 
  ShieldCheck, 
  Inbox, 
  Clock, 
  Check, 
  X 
} from 'lucide-react';
import { updateMedicineRequestStatus } from '../api/medicineRequest';

export default function TradeHistoryTable({ 
  historyData, 
  medicineRequests = [], 
  onRefreshRequests, 
  onOpenFindMedicine 
}) {
  const [activeTab, setActiveTab] = useState('trades'); // 'trades' | 'requests'
  const [expandedId, setExpandedId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const trades = historyData?.trades || [];
  const stats = historyData?.stats || { approved: 0, rejected: 0, total_transferred: 0 };

  const pendingRequestsCount = medicineRequests.filter(r => r.status === 'PENDING').length;

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleUpdateStatus = async (requestId, newStatus) => {
    setUpdatingId(requestId);
    try {
      await updateMedicineRequestStatus(requestId, newStatus);
      if (onRefreshRequests) {
        await onRefreshRequests();
      }
    } catch (err) {
      console.error("Failed to update request status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="med-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Title & Navigation Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: activeTab === 'trades' ? 'var(--emerald-100, rgba(16, 185, 129, 0.15))' : 'rgba(6, 182, 212, 0.15)',
            color: activeTab === 'trades' ? 'var(--emerald-700, #10b981)' : '#06b6d4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {activeTab === 'trades' ? <History size={19} /> : <Inbox size={19} />}
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              {activeTab === 'trades' ? 'Emergency Delivery & Compliance Audit Trail' : 'Inter-Hospital Requisition Requests'}
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {activeTab === 'trades' 
                ? 'Permanent hospital regulatory log of authorized and declined medication transfers'
                : 'Direct hospital medicine requests dispatched via interactive Dakshina Kannada map search'}
            </p>
          </div>
        </div>

        {/* Tab Buttons & Filter Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{
            display: 'inline-flex',
            background: 'var(--bg-surface)',
            padding: '0.25rem',
            borderRadius: 'var(--radius-md, 8px)',
            border: '1px solid var(--border-subtle)'
          }}>
            <button
              onClick={() => setActiveTab('trades')}
              style={{
                background: activeTab === 'trades' ? 'var(--teal-600, #0d9488)' : 'transparent',
                color: activeTab === 'trades' ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                padding: '0.45rem 0.95rem',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                transition: 'all 0.2s ease'
              }}
            >
              <History size={14} />
              <span>Audit History ({trades.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              style={{
                background: activeTab === 'requests' ? 'var(--blue-600, #2563eb)' : 'transparent',
                color: activeTab === 'requests' ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                padding: '0.45rem 0.95rem',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                transition: 'all 0.2s ease'
              }}
            >
              <Inbox size={14} />
              <span>Map Requisitions</span>
              {pendingRequestsCount > 0 && (
                <span style={{
                  background: '#f59e0b',
                  color: '#000000',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '9999px',
                  fontSize: '0.7rem',
                  fontWeight: '800'
                }}>
                  {pendingRequestsCount}
                </span>
              )}
            </button>
          </div>

          {/* Action button when on requests tab */}
          {activeTab === 'requests' && onOpenFindMedicine && (
            <button
              onClick={onOpenFindMedicine}
              className="btn btn-outline"
              style={{
                padding: '0.45rem 0.95rem',
                fontSize: '0.82rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                borderColor: 'var(--teal-500)',
                color: 'var(--teal-700)'
              }}
              title="Open map to search nearby hospitals and dispatch an emergency requisition"
            >
              <span>🗺️ New Map Requisition</span>
            </button>
          )}

          {/* Clinical KPI Metric Cards (on trades tab) */}
          {activeTab === 'trades' && (
            <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
              <div style={{
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--emerald-50)',
                border: '1px solid var(--emerald-100)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.82rem',
                color: 'var(--emerald-700)',
                fontWeight: '700'
              }}>
                <CheckCircle2 size={15} />
                <span>{stats.approved} Dispatched</span>
              </div>

              <div style={{
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--rose-50)',
                border: '1px solid var(--rose-100)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.82rem',
                color: 'var(--rose-700)',
                fontWeight: '700'
              }}>
                <XCircle size={15} />
                <span>{stats.rejected} Declined</span>
              </div>

              <div style={{
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--teal-50)',
                border: '1px solid var(--teal-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.82rem',
                color: 'var(--teal-700)',
                fontWeight: '700'
              }}>
                <Package size={15} />
                <span>{stats.total_transferred} Units Reallocated</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TAB 1: Executed Trades */}
      {activeTab === 'trades' && (
        trades.length === 0 ? (
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
        )
      )}

      {/* TAB 2: Incoming Medicine Requests */}
      {activeTab === 'requests' && (
        medicineRequests.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '2.5rem 1rem',
            color: 'var(--text-muted)',
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-subtle)',
            fontSize: '0.88rem'
          }}>
            No manual requisitions logged yet. When emergency requests are submitted via the <strong>🗺️ Emergency Map</strong>, they appear here for verification and one-click transfer execution.
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
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '700', width: '70px' }}>Req #</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '700', width: '160px' }}>Timestamp</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '700' }}>Requisition Routing</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '700' }}>Medicine Requested</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '700' }}>Gemini Message / Justification</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '700', textAlign: 'center', width: '110px' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '700', textAlign: 'right', width: '180px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {medicineRequests.map((req) => {
                  const isPending = req.status === 'PENDING';
                  const isAccepted = req.status === 'ACCEPTED';
                  const isRejected = req.status === 'REJECTED';

                  return (
                    <tr 
                      key={req.id || `${req.to}_${req.timestamp}`}
                      style={{ 
                        borderBottom: '1px solid var(--border-subtle)',
                        background: 'transparent'
                      }}
                    >
                      <td style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--text-muted)' }}>
                        #{req.id || 1}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                        {req.timestamp ? new Date(req.timestamp).toLocaleTimeString() : 'Recent'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700' }}>
                          <span style={{ color: 'var(--teal-700, #0d9488)' }}>{req.from}</span>
                          <ArrowRight size={13} color="var(--text-muted)" />
                          <span style={{ color: 'var(--blue-700, #2563eb)' }}>{req.to}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{
                          padding: '0.2rem 0.55rem',
                          borderRadius: '6px',
                          background: 'var(--emerald-50)',
                          color: 'var(--emerald-700)',
                          border: '1px solid var(--emerald-100)',
                          fontSize: '0.78rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: '700'
                        }}>
                          📦 {req.quantity} {req.medicine}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontSize: '0.82rem', maxWidth: '320px' }}>
                        {req.message || "Urgent medicine requisition"}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        {isPending && (
                          <span className="badge badge-warning" style={{ fontSize: '0.68rem', padding: '0.2rem 0.55rem' }}>
                            <Clock size={12} /> PENDING
                          </span>
                        )}
                        {isAccepted && (
                          <span className="badge badge-optimal" style={{ fontSize: '0.68rem', padding: '0.2rem 0.55rem' }}>
                            <CheckCircle2 size={12} /> APPROVED
                          </span>
                        )}
                        {isRejected && (
                          <span className="badge badge-critical" style={{ fontSize: '0.68rem', padding: '0.2rem 0.55rem' }}>
                            <XCircle size={12} /> REJECTED
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                        {isPending ? (
                          <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                            <button
                              onClick={() => handleUpdateStatus(req.id, 'ACCEPTED')}
                              disabled={updatingId === req.id}
                              style={{
                                background: 'var(--emerald-50, rgba(16, 185, 129, 0.2))',
                                border: '1px solid var(--emerald-500, rgba(16, 185, 129, 0.4))',
                                color: 'var(--emerald-700, #047857)',
                                padding: '0.3rem 0.65rem',
                                borderRadius: '6px',
                                fontSize: '0.76rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}
                              title="Approve requisition and execute medicine transfer"
                            >
                              <Check size={12} />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                              disabled={updatingId === req.id}
                              style={{
                                background: 'var(--rose-50, rgba(239, 68, 68, 0.2))',
                                border: '1px solid var(--rose-300, rgba(239, 68, 68, 0.4))',
                                color: 'var(--rose-700, #b91c1c)',
                                padding: '0.3rem 0.55rem',
                                borderRadius: '6px',
                                fontSize: '0.76rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}
                              title="Reject requisition request"
                            >
                              <X size={12} />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Archived
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
