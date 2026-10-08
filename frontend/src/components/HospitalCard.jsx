import React from 'react';
import { MapPin, AlertTriangle, CheckCircle2, TrendingUp, Package } from 'lucide-react';

export default function HospitalCard({ hospital, isRequester, isDonor }) {
  const shortages = hospital.shortages || [];
  const surpluses = hospital.surpluses || {};
  const statusCounts = hospital.status_counts || { critical: 0, warning: 0, ok: 0 };

  const hasCritical = statusCounts.critical > 0;
  const hasWarning = statusCounts.warning > 0;

  // Determine card highlight styling
  let cardBorder = 'var(--border-subtle)';
  if (isRequester) cardBorder = 'rgba(239, 68, 68, 0.6)';
  else if (isDonor) cardBorder = 'rgba(16, 185, 129, 0.6)';

  return (
    <div 
      className="glass-card" 
      style={{
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        border: `1px solid ${cardBorder}`,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Role Accent Ribbon */}
      {isRequester && (
        <div style={{
          position: 'absolute',
          top: '0',
          right: '0',
          background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
          color: '#ffffff',
          fontSize: '0.65rem',
          fontWeight: '700',
          padding: '0.2rem 0.8rem',
          borderBottomLeftRadius: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          Crisis Requester
        </div>
      )}
      {isDonor && (
        <div style={{
          position: 'absolute',
          top: '0',
          right: '0',
          background: 'linear-gradient(135deg, #10b981, #047857)',
          color: '#ffffff',
          fontSize: '0.65rem',
          fontWeight: '700',
          padding: '0.2rem 0.8rem',
          borderBottomLeftRadius: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          Selected Donor
        </div>
      )}

      {/* Hospital Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            {hospital.name}
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
          <MapPin size={14} color="#06b6d4" />
          <span>{hospital.location}</span>
        </div>
      </div>

      {/* Triage Overview Pills */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {statusCounts.critical > 0 && (
          <span className="badge badge-critical">
            <AlertTriangle size={12} /> {statusCounts.critical} Critical Shortage
          </span>
        )}
        {statusCounts.warning > 0 && (
          <span className="badge badge-warning">
            {statusCounts.warning} Low Stock
          </span>
        )}
        {statusCounts.critical === 0 && statusCounts.warning === 0 && (
          <span className="badge badge-optimal">
            <CheckCircle2 size={12} /> All Safe
          </span>
        )}
        {Object.keys(surpluses).length > 0 && (
          <span className="badge badge-surplus">
            <TrendingUp size={12} /> {Object.keys(surpluses).length} Surplus
          </span>
        )}
      </div>

      {/* Inventory Stock Table */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.25)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.03)', color: 'var(--text-muted)', textAlign: 'left', borderBottom: '1px solid var(--border-subtle)' }}>
              <th style={{ padding: '0.5rem 0.75rem', fontWeight: '600' }}>Medicine</th>
              <th style={{ padding: '0.5rem 0.5rem', fontWeight: '600', textAlign: 'right' }}>Stock</th>
              <th style={{ padding: '0.5rem 0.5rem', fontWeight: '600', textAlign: 'right' }}>Min Safety</th>
              <th style={{ padding: '0.5rem 0.75rem', fontWeight: '600', textAlign: 'center' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(hospital.inventory).map(([med, stock]) => {
              const threshold = hospital.thresholds[med] || 0;
              const isCrit = stock < threshold * 0.5;
              const isWarn = !isCrit && stock < threshold;
              const isOk = stock >= threshold;
              const surplus = stock > threshold ? stock - threshold : 0;

              // Row background for critical items
              const rowBg = isCrit ? 'rgba(239, 68, 68, 0.08)' : 'transparent';

              return (
                <tr 
                  key={med}
                  style={{ 
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    background: rowBg,
                    transition: 'background 0.15s ease'
                  }}
                >
                  <td style={{ padding: '0.55rem 0.75rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                    {med}
                  </td>
                  <td style={{ 
                    padding: '0.55rem 0.5rem', 
                    textAlign: 'right', 
                    fontFamily: 'var(--font-mono)',
                    fontWeight: isCrit ? '700' : '500',
                    color: isCrit ? '#f87171' : isWarn ? '#fbbf24' : '#34d399'
                  }}>
                    {stock}
                  </td>
                  <td style={{ padding: '0.55rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {threshold}
                  </td>
                  <td style={{ padding: '0.55rem 0.75rem', textAlign: 'center' }}>
                    {isCrit && (
                      <span className="badge badge-critical" style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}>
                        Critical
                      </span>
                    )}
                    {isWarn && (
                      <span className="badge badge-warning" style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}>
                        Warning
                      </span>
                    )}
                    {isOk && surplus > 0 && (
                      <span className="badge badge-surplus" style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}>
                        +{surplus}
                      </span>
                    )}
                    {isOk && surplus === 0 && (
                      <span className="badge badge-optimal" style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}>
                        OK
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Available Surpluses Preview */}
      {Object.keys(surpluses).length > 0 ? (
        <div style={{ marginTop: 'auto' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Package size={12} color="#06b6d4" />
            <span>Available for peer hospital transfer:</span>
          </div>
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {Object.entries(surpluses).map(([med, qty]) => (
              <span 
                key={med} 
                style={{
                  fontSize: '0.72rem',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  background: 'rgba(6, 182, 212, 0.1)',
                  color: '#67e8f9',
                  border: '1px solid rgba(6, 182, 212, 0.25)',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                {med}: +{qty}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 'auto' }}>
          No surplus units available for trade.
        </div>
      )}
    </div>
  );
}
