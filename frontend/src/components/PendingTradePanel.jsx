import React from 'react';
import { ShieldAlert, CheckCircle, XCircle, ArrowRight, ShieldCheck, HeartPulse, Scale, RefreshCw } from 'lucide-react';

export default function PendingTradePanel({ pendingTrade, onApprove, onReject, processing }) {
  if (!pendingTrade) return null;

  const donor = pendingTrade.donor;
  const receiver = pendingTrade.receiver;
  const medicines = pendingTrade.medicines || {};
  const counterMedicines = pendingTrade.counter_medicines || {};
  const explanation = pendingTrade.explanation || "No explanation provided.";

  return (
    <div 
      className="glass-card" 
      style={{
        padding: '1.75rem',
        border: '2px solid rgba(245, 158, 11, 0.65)',
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(15, 23, 42, 0.95))',
        boxShadow: '0 8px 32px rgba(245, 158, 11, 0.2)',
        borderRadius: 'var(--radius-xl)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        animation: 'slideDown 0.3s ease-out'
      }}
    >
      {/* Header Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'rgba(245, 158, 11, 0.2)',
            border: '1px solid rgba(245, 158, 11, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldAlert size={24} color="#f59e0b" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fef3c7' }}>
                Human-in-the-Loop Verification Required
              </h2>
              <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
                Awaiting Authorization
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
              Agents have converged on an emergency reallocation proposal. Executive review is mandatory prior to physical dispatch.
            </p>
          </div>
        </div>
      </div>

      {/* Trade Flow Card */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1rem',
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        {/* Outbound Dispatch (Donor -> Receiver) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#38bdf8', letterSpacing: '0.05em' }}>
            Primary Emergency Transfer
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.95rem' }}>
            <span style={{ fontWeight: '700', color: '#ffffff' }}>{donor}</span>
            <ArrowRight size={16} color="#06b6d4" />
            <span style={{ fontWeight: '700', color: '#f87171' }}>{receiver}</span>
          </div>
          <div style={{ marginTop: '0.25rem' }}>
            {Object.entries(medicines).map(([med, qty]) => (
              <div 
                key={med}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  border: '1px solid rgba(6, 182, 212, 0.4)',
                  color: '#67e8f9',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.88rem',
                  fontWeight: '600'
                }}
              >
                <span>📦 {qty} units of {med}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Counter Exchange (Receiver -> Donor) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#34d399', letterSpacing: '0.05em' }}>
            Reciprocal Exchange / Return
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.95rem' }}>
            <span style={{ fontWeight: '700', color: '#f87171' }}>{receiver}</span>
            <ArrowRight size={16} color="#10b981" />
            <span style={{ fontWeight: '700', color: '#ffffff' }}>{donor}</span>
          </div>
          <div style={{ marginTop: '0.25rem' }}>
            {Object.keys(counterMedicines).length > 0 ? (
              Object.entries(counterMedicines).map(([med, qty]) => (
                <div 
                  key={med}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    color: '#6ee7b7',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.88rem',
                    fontWeight: '600'
                  }}
                >
                  <span>🔄 {qty} units of {med}</span>
                </div>
              ))
            ) : (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                Emergency unilateral transfer (Zero counter-units required)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Gemini Administrator Plain English Explanation */}
      <div style={{
        padding: '1.15rem 1.35rem',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(15, 23, 42, 0.75)',
        borderLeft: '4px solid #06b6d4',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderLeftWidth: '4px',
        borderLeftColor: '#06b6d4'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#38bdf8', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.45rem' }}>
          <HeartPulse size={15} />
          <span>Gemini Explainer — Clinical & Safety Impact</span>
        </div>
        <p style={{ color: '#f1f5f9', fontSize: '0.92rem', lineHeight: 1.65 }}>
          {explanation}
        </p>
      </div>

      {/* Human Actions Call to Action */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        paddingTop: '1rem'
      }}>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Scale size={16} color="#f59e0b" />
          <span>Approval permanently logs transaction to immutable audit ledger.</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Reject Button */}
          <button
            className="btn btn-danger"
            onClick={onReject}
            disabled={processing}
            id="btn-reject-trade"
            style={{ padding: '0.75rem 1.35rem' }}
          >
            <XCircle size={18} />
            <span>Reject Proposal</span>
          </button>

          {/* Approve Button */}
          <button
            className="btn btn-success"
            onClick={onApprove}
            disabled={processing}
            id="btn-approve-trade"
            style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}
          >
            <CheckCircle size={18} />
            <span>Approve & Execute Trade</span>
          </button>
        </div>
      </div>
    </div>
  );
}
