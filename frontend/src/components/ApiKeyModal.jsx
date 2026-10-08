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
      setMessage({ type: 'success', text: 'API key saved successfully and connected to Gemini 2.5!' });
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
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div 
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: '2rem',
          background: '#0c1222',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
          position: 'relative'
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
            background: 'rgba(6, 182, 212, 0.15)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Key size={22} color="#06b6d4" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Gemini API Configuration</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Active Model: <strong style={{ color: '#38bdf8' }}>{currentStatus?.model || 'gemini-2.5-flash'}</strong>
            </p>
          </div>
        </div>

        {/* Instructions */}
        <p style={{ fontSize: '0.86rem', color: '#cbd5e1', lineHeight: 1.55, marginBottom: '1.25rem' }}>
          MedFlow-AI executes autonomous multi-agent negotiations without fallback templates. Enter your real Gemini API key below to unlock live agent communications:
        </p>

        {/* Form */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              GEMINI API KEY:
            </label>
            <input 
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'border 0.2s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#06b6d4'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
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
              background: message.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
              color: message.type === 'success' ? '#34d399' : '#f87171'
            }}>
              {message.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
              <span>{message.text}</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noreferrer"
              style={{
                fontSize: '0.8rem',
                color: '#38bdf8',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                textDecoration: 'none'
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
