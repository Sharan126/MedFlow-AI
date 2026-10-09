import React, { useState } from 'react';
import { AlertCircle, Bot, ShieldCheck, HeartPulse, Sparkles, ArrowRight, HelpCircle, X, CheckCircle2 } from 'lucide-react';

export default function WorkflowGuide({ onStartNegotiation, isNegotiating, hasPendingTrade, totalCritical }) {
  const [isDismissed, setIsDismissed] = useState(false);

  return (
    <div className="med-card" style={{
      padding: '1.25rem 1.5rem',
      background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.05), rgba(2, 132, 199, 0.05))',
      border: '1px solid var(--teal-border)',
      position: 'relative'
    }}>
      {/* Top Banner Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
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
            <HeartPulse size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                How MedFlow-AI Works (Clinical Quick Guide)
              </h2>
              <span className="badge badge-surplus" style={{ fontSize: '0.7rem' }}>
                Non-Technical Guide
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Autonomous regional hospital coordination to protect patient lives during medication shortages.
            </p>
          </div>
        </div>

        {/* Action Button for non-tech judges */}
        <button
          className="btn btn-primary"
          onClick={onStartNegotiation}
          disabled={isNegotiating || hasPendingTrade}
          style={{ padding: '0.65rem 1.4rem', fontSize: '0.92rem' }}
          id="btn-guide-start-negotiation"
        >
          <Sparkles size={18} className={isNegotiating ? "spin" : ""} />
          <span>{isNegotiating ? 'AI Coordinating Supply Network...' : '⚡ Auto-Resolve Medication Shortages'}</span>
        </button>
      </div>

      {/* 3 Visual Steps */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1rem',
        marginTop: '0.5rem'
      }}>
        {/* Step 1 */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          border: '1px solid var(--border-card)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <span style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'var(--rose-100)',
              color: 'var(--rose-700)',
              fontSize: '0.78rem',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>1</span>
            <span style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--rose-700)' }}>
              1. Monitor Shortages
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            Hospitals below safety threshold are flagged in <strong style={{ color: 'var(--rose-600)' }}>Red</strong>. 
            {totalCritical > 0 ? ` Currently, ${totalCritical} critical shortages need supplies.` : ' All inventories monitored 24/7.'}
          </p>
        </div>

        {/* Step 2 */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          border: '1px solid var(--border-card)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <span style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'var(--teal-100)',
              color: 'var(--teal-700)',
              fontSize: '0.78rem',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>2</span>
            <span style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--teal-700)' }}>
              2. AI Dispatches Relief
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            Gemini AI contacts peer hospitals with surplus stock. AI guarantees the donor keeps 100% of their required safety stock.
          </p>
        </div>

        {/* Step 3 */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          border: '1px solid var(--border-card)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <span style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'var(--emerald-100)',
              color: 'var(--emerald-700)',
              fontSize: '0.78rem',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>3</span>
            <span style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--emerald-700)' }}>
              3. Clinical Sign-Off
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            Doctor or Hospital Admin reviews the plain-English clinical explanation and authorizes the transfer with 1 click.
          </p>
        </div>
      </div>
    </div>
  );
}
