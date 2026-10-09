import React, { useState, useMemo } from 'react';
import { Building2, MapPin, Search, X, Zap } from 'lucide-react';

export default function DakshinaKannadaModal({ 
  isOpen, 
  onClose, 
  directory = [], 
  onSelectHospital,
  currentActiveNames = [] 
}) {
  const [search, setSearch] = useState('');
  const [selectedTaluk, setSelectedTaluk] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  const talukList = useMemo(() => {
    const set = new Set();
    directory.forEach(h => {
      if (h.taluk) set.add(h.taluk);
    });
    return ['All', ...Array.from(set).sort()];
  }, [directory]);

  const filteredHospitals = useMemo(() => {
    return directory.filter(h => {
      const matchTaluk = selectedTaluk === 'All' || h.taluk === selectedTaluk;
      const matchType = selectedType === 'All' || h.type === selectedType;
      const matchSearch = !search || 
        h.name.toLowerCase().includes(search.toLowerCase()) ||
        (h.location && h.location.toLowerCase().includes(search.toLowerCase())) ||
        (h.hfr_id && h.hfr_id.toLowerCase().includes(search.toLowerCase()));
      return matchTaluk && matchType && matchSearch;
    });
  }, [directory, selectedTaluk, selectedType, search]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(5, 10, 24, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1.5rem',
      animation: 'fadeIn 0.2s ease'
    }}>
      <div 
        className="med-card"
        style={{
          width: '100%',
          maxWidth: '960px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          border: '1px solid var(--border-card)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Building2 size={22} color="#06b6d4" />
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                Dakshina Kannada Hospital Directory
              </h2>
              <span className="badge badge-surplus" style={{ fontSize: '0.75rem' }}>
                {directory.length} Verified Facilities
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Official medical infrastructure across 7 taluks in Dakshina Kannada (Mangalore, Bantwal, Puttur, Belthangady, Sullia, Moodbidri, Kadaba)
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '0.45rem', borderRadius: '50%', minWidth: 'auto' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Filters Bar */}
        <div style={{
          padding: '1rem 1.75rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
          background: 'rgba(0, 0, 0, 0.15)'
        }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search Input */}
            <div style={{
              position: 'relative',
              flex: '1',
              minWidth: '240px'
            }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search hospital name, location, or HFR ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem 0.6rem 2.4rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.86rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Type Filter */}
            <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Type:</span>
              {['All', 'Government', 'Private'].map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    border: selectedType === t ? '1px solid var(--teal-600)' : '1px solid var(--border-subtle)',
                    background: selectedType === t ? 'var(--teal-50)' : 'transparent',
                    color: selectedType === t ? '#67e8f9' : 'var(--text-secondary)'
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Taluk Tabs */}
          <div style={{ display: 'flex', gap: '0.45rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', alignSelf: 'center', marginRight: '0.25rem' }}>
              Taluks:
            </span>
            {talukList.map(t => {
              const count = t === 'All' ? directory.length : directory.filter(h => h.taluk === t).length;
              const isActive = selectedTaluk === t;
              return (
                <button
                  key={t}
                  onClick={() => setSelectedTaluk(t)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    border: isActive ? '1px solid #06b6d4' : '1px solid var(--border-subtle)',
                    background: isActive ? 'rgba(6, 182, 212, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                    color: isActive ? '#67e8f9' : 'var(--text-secondary)'
                  }}
                >
                  {t} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* List of Hospitals */}
        <div style={{
          flex: '1',
          overflowY: 'auto',
          padding: '1.25rem 1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          {filteredHospitals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              No hospitals match your filter criteria in Dakshina Kannada.
            </div>
          ) : (
            filteredHospitals.map(h => {
              const isActive = currentActiveNames.includes(h.name);
              return (
                <div
                  key={h.name}
                  style={{
                    padding: '1rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    background: isActive ? 'rgba(6, 182, 212, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${isActive ? 'rgba(6, 182, 212, 0.4)' : 'var(--border-subtle)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ flex: '1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                        {h.name}
                      </span>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: '700',
                        padding: '0.12rem 0.5rem',
                        borderRadius: '4px',
                        background: h.type === 'Government' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(168, 85, 247, 0.15)',
                        color: h.type === 'Government' ? '#67e8f9' : '#d8b4fe',
                        border: `1px solid ${h.type === 'Government' ? 'rgba(6, 182, 212, 0.3)' : 'rgba(168, 85, 247, 0.3)'}`
                      }}>
                        {h.type}
                      </span>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: '700',
                        padding: '0.12rem 0.5rem',
                        borderRadius: '4px',
                        background: 'rgba(59, 130, 246, 0.12)',
                        color: '#93c5fd',
                        border: '1px solid rgba(59, 130, 246, 0.25)'
                      }}>
                        {h.taluk} Taluk
                      </span>
                      {isActive && (
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: '800',
                          padding: '0.12rem 0.5rem',
                          borderRadius: '4px',
                          background: 'rgba(16, 185, 129, 0.2)',
                          color: '#6ee7b7',
                          border: '1px solid rgba(16, 185, 129, 0.4)'
                        }}>
                          Active Node
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.35rem', flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MapPin size={12} color="#06b6d4" /> {h.location}
                      </span>
                      {h.latitude && h.longitude && (
                        <span style={{ fontFamily: 'var(--font-mono)' }}>
                          GPS: {typeof h.latitude === 'number' ? h.latitude.toFixed(4) : h.latitude}°N, {typeof h.longitude === 'number' ? h.longitude.toFixed(4) : h.longitude}°E
                        </span>
                      )}
                      {h.hfr_id && (
                        <span style={{ fontFamily: 'var(--font-mono)' }}>
                          HFR: {h.hfr_id}
                        </span>
                      )}
                    </div>
                  </div>

                  {onSelectHospital && (
                    <button
                      onClick={() => onSelectHospital(h)}
                      className={`btn ${isActive ? 'btn-secondary' : 'btn-primary'}`}
                      style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
                    >
                      <Zap size={14} />
                      <span>{isActive ? 'Active Node' : 'Simulate Crisis'}</span>
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '0.9rem 1.75rem',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.02)',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}>
          <span>Showing {filteredHospitals.length} of {directory.length} hospitals in Dakshina Kannada</span>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
          >
            Close Directory
          </button>
        </div>
      </div>
    </div>
  );
}
