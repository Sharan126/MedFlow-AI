import React, { useState } from 'react';
import { Key, ShieldCheck, X, AlertTriangle, ExternalLink, Check } from 'lucide-react';

export default function ApiKeyModal({ isOpen, onClose, onSaveKey, currentStatus }) {
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setSaving(true);
    setMessage(null);
    try {
      await onSaveKey(apiKey.trim());
      setMessage({ type: 'success', text: 'API key saved and verified successfully!' });
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update API key.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div 
        className="med-card"
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: '2rem',
          position: 'relative',
          boxShadow: 'var(--shadow-xl)'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '0.25rem'
          }}
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'var(--teal-100)',
            color: 'var(--teal-700)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Key size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              Gemini AI Configuration
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Connected Model: <strong style={{ color: 'var(--teal-700)' }}>{currentStatus?.model || 'gemini-3.5-flash-lite'}</strong>
            </p>
          </div>
        </div>

        {/* Instructions */}
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '1.25rem' }}>
          MedFlow-AI coordinates real-time medical transfers using Gemini. Enter your Google AI Studio API key below if you wish to update credentials:
        </p>

        {/* Form */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
              Gemini API Key:
            </label>
            <input 
              type="password"
              placeholder="AQ.Ab8RN6Iqd8..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-card)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'border 0.2s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--teal-600)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-card)'}
            />
          </div>

          {message && (
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: message.type === 'success' ? 'var(--emerald-50)' : 'var(--rose-50)',
              border: `1px solid ${message.type === 'success' ? 'var(--emerald-100)' : 'var(--rose-100)'}`,
              color: message.type === 'success' ? 'var(--emerald-700)' : 'var(--rose-700)',
              fontWeight: '600'
            }}>
              {message.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
              <span>{message.text}</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noreferrer"
              style={{
                fontSize: '0.82rem',
                color: 'var(--blue-700)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                textDecoration: 'none',
                fontWeight: '600'
              }}
            >
              Get free Gemini API Key <ExternalLink size={12} />
            </a>

            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={saving}
                style={{ padding: '0.55rem 1rem' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving || !apiKey.trim()}
                style={{ padding: '0.55rem 1.25rem' }}
              >
                {saving ? 'Validating...' : 'Save & Connect'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
