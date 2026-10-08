import React, { useState } from 'react';
import { Brain, Cpu, Zap, Timer, CheckCircle, AlertOctagon, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

export default function ReasoningDrawer({ reasoningData, onClearLog }) {
  const [expandedCalls, setExpandedCalls] = useState({});

  const logs = reasoningData?.logs || [];
  const stats = reasoningData?.stats || {
    total_calls: 0,
    successful_calls: 0,
    failed_calls: 0,
    success_rate: 0,
    avg_latency_ms: 0,
    total_latency_ms: 0,
    calls_with_json_schema: 0
  };

  const toggleCall = (idx) => {
    setExpandedCalls(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header & Latency KPI Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(168, 85, 247, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(168, 85, 247, 0.3)'
          }}>
            <Brain size={18} color="#a855f7" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>AI Reasoning & API Latency Log</h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Full audit of prompts, schema compliance, and latencies across all Gemini 2.5 calls
            </p>
          </div>
        </div>

        {/* Clear Button */}
        {logs.length > 0 && (
          <button 
            className="btn btn-secondary"
            onClick={onClearLog}
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem' }}
          >
            <Trash2 size={13} />
            <span>Clear Log</span>
          </button>
        )}
      </div>

      {/* Latency / API Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '0.85rem'
      }}>
        <div style={{
          padding: '0.85rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
            <Cpu size={14} color="#06b6d4" /> Total API Invocations
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: '700', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            {stats.total_calls}
          </div>
        </div>

        <div style={{
          padding: '0.85rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
            <CheckCircle size={14} color="#10b981" /> Success Rate
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: '700', fontFamily: 'var(--font-mono)', color: '#34d399' }}>
            {stats.success_rate.toFixed(1)}%
          </div>
        </div>

        <div style={{
          padding: '0.85rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
            <Timer size={14} color="#f59e0b" /> Avg Call Latency
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: '700', fontFamily: 'var(--font-mono)', color: '#fbbf24' }}>
            {stats.avg_latency_ms} ms
          </div>
        </div>

        <div style={{
          padding: '0.85rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
            <Zap size={14} color="#a855f7" /> Structured JSON Calls
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: '700', fontFamily: 'var(--font-mono)', color: '#c084fc' }}>
            {stats.calls_with_json_schema}
          </div>
        </div>
      </div>

      {/* Log Feed */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
        maxHeight: '400px',
        overflowY: 'auto',
        paddingRight: '0.4rem'
      }}>
        {logs.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '2.5rem 1rem',
            color: 'var(--text-muted)',
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-subtle)',
            fontSize: '0.85rem'
          }}>
            No Gemini API calls recorded in this session. Start a negotiation to view live telemetry.
          </div>
        ) : (
          logs.map((log, idx) => {
            const isSuccess = log.status === 'SUCCESS';
            const isExpanded = expandedCalls[idx];

            return (
              <div 
                key={idx}
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.45rem'
                }}
              >
                {/* Log Header Row */}
                <div 
                  onClick={() => toggleCall(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.82rem' }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: isSuccess ? '#10b981' : '#ef4444',
                      boxShadow: isSuccess ? '0 0 8px #10b981' : '0 0 8px #ef4444'
                    }} />
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '0.74rem' }}>
                      {log.timestamp}
                    </span>
                    <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                      Call #{logs.length - idx}
                    </span>
                    <span style={{
                      padding: '0.1rem 0.45rem',
                      borderRadius: '4px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#94a3b8',
                      fontSize: '0.72rem',
                      fontFamily: 'var(--font-mono)'
                    }}>
                      {log.model}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: log.latency_ms > 2000 ? '#f59e0b' : '#34d399',
                      fontWeight: '600'
                    }}>
                      ⚡ {log.latency_ms}ms
                    </span>
                    {isExpanded ? <ChevronUp size={16} color="#94a3b8" /> : <ChevronDown size={16} color="#94a3b8" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div style={{
                    marginTop: '0.5rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}>
                    {/* System Prompt */}
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                        System Instruction:
                      </div>
                      <pre style={{
                        background: 'rgba(0, 0, 0, 0.35)',
                        padding: '0.65rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        color: '#94a3b8',
                        fontFamily: 'var(--font-mono)',
                        whiteSpace: 'pre-wrap',
                        maxHeight: '140px',
                        overflowY: 'auto'
                      }}>
                        {log.system_prompt || "None"}
                      </pre>
                    </div>

                    {/* User Prompt */}
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#a855f7', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                        User Query:
                      </div>
                      <pre style={{
                        background: 'rgba(0, 0, 0, 0.35)',
                        padding: '0.65rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        color: '#cbd5e1',
                        fontFamily: 'var(--font-mono)',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {log.user_prompt || "None"}
                      </pre>
                    </div>

                    {/* Response Payload */}
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                        Gemini Response Payload:
                      </div>
                      <pre style={{
                        background: 'rgba(0, 0, 0, 0.45)',
                        padding: '0.65rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        color: '#6ee7b7',
                        fontFamily: 'var(--font-mono)',
                        whiteSpace: 'pre-wrap',
                        maxHeight: '180px',
                        overflowY: 'auto',
                        border: '1px solid rgba(52, 211, 153, 0.15)'
                      }}>
                        {log.response || "No response data"}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
