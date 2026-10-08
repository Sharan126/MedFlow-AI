import React from 'react';

/**
 * FindMedicineButton Component
 * Triggers the interactive Leaflet map modal to locate medicine inventory nearby.
 */
export default function FindMedicineButton({ onClick, style, className = '' }) {
  return (
    <button
      id="btn-find-medicine"
      type="button"
      className={`btn ${className}`}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.55rem',
        padding: '0.52rem 1.05rem',
        borderRadius: 'var(--radius-md, 8px)',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(6, 182, 212, 0.22))',
        border: '1px solid rgba(16, 185, 129, 0.45)',
        color: '#6ee7b7',
        fontSize: '0.84rem',
        fontWeight: '600',
        cursor: 'pointer',
        boxShadow: '0 2px 12px rgba(16, 185, 129, 0.15)',
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap',
        ...style
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.28), rgba(6, 182, 212, 0.35))';
        e.currentTarget.style.borderColor = 'rgba(52, 211, 153, 0.7)';
        e.currentTarget.style.boxShadow = '0 4px 18px rgba(16, 185, 129, 0.3)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(6, 182, 212, 0.22))';
        e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.45)';
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(16, 185, 129, 0.15)';
        e.currentTarget.style.transform = 'none';
      }}
      title="Open interactive map to locate nearby hospitals with stock and request transfers"
    >
      <span style={{ fontSize: '1.05rem', lineHeight: 1 }}>🗺️</span>
      <span>Find Medicine Nearby</span>
    </button>
  );
}
