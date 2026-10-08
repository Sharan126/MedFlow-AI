import React, { useState } from 'react';
import { Brain, Cpu, Zap, Timer, CheckCircle, AlertOctagon, ChevronDown, ChevronUp, Trash2, ShieldCheck } from 'lucide-react';

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
    <div className="med-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header & Latency KPI Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'var(--blue-100)',
            color: 'var(--blue-700)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Brain size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              AI Clinical Reasoning & Telemetry Log
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Evaluation metrics, prompt transparency, and response times for technical and clinical auditors
            </p>
          </div>
        </div>

        {/* Clear Button */}
        {logs.length > 0 && (
          <button 
            className="btn btn-secondary"
            onClick={onClearLog}
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
          >
            <Trash2 size={14} />
            <span>Clear Log</span>
          </button>
        )}
      </div>

      {/* Latency / API Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: '0.85rem'
      }}>
        <div style={{
          padding: '0.95rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '0.25rem' }}>
            <Cpu size={15} color="var(--blue-600)" /> Total AI Invocations
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            {stats.total_calls}
          </div>
        </div>

        <div style={{
          padding: '0.95rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '0.25rem' }}>
            <ShieldCheck size={15} color="var(--emerald-600)" /> Safety Compliance
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--emerald-700)' }}>
            {stats.success_rate.toFixed(1)}%
          </div>
        </div>

        <div style={{
          padding: '0.95rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '0.25rem' }}>
            <Timer size={15} color="var(--amber-600)" /> Avg AI Latency
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--amber-700)' }}>
            {stats.avg_latency_ms} ms
          </div>
        </div>

        <div style={{
          padding: '0.95rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '0.25rem' }}>
            <Zap size={15} color="var(--teal-600)" /> Structured Schema Calls
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--teal-700)' }}>
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
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-subtle)',
            fontSize: '0.85rem'
          }}>
            No Gemini API calls recorded in this session. Start an AI negotiation to see live model telemetry.
          </div>
        ) : (
          logs.map((log, idx) => {
            const isSuccess = log.status === 'SUCCESS';
            const isExpanded = expandedCalls[idx];

            return (
              <div 
                key={idx}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.9rem 1.1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.45rem',
                  boxShadow: 'var(--shadow-sm)'
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.84rem' }}>
                    <span style={{
                      width: '9px',
                      height: '9px',
                      borderRadius: '50%',
                      background: isSuccess ? 'var(--emerald-600)' : 'var(--rose-600)'
                    }} />
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '0.76rem' }}>
                      {log.timestamp}
                    </span>
                    <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                      Decision #{logs.length - idx}
                    </span>
                    <span style={{
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      background: 'var(--bg-surface)',
                      color: 'var(--text-secondary)',
                      fontSize: '0.74rem',
                      fontWeight: '600'
                    }}>
                      {log.model}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.76rem',
                      color: log.latency_ms > 2000 ? 'var(--amber-700)' : 'var(--emerald-700)',
                      fontWeight: '700'
                    }}>
                      ⚡ {log.latency_ms}ms
                    </span>
                    {isExpanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                  </div>
                </div>

                {/* Expanded Technical Inspection */}
                {isExpanded && (
                  <div style={{
                    marginTop: '0.5rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}>
                    {/* System Instruction */}
                    <div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--blue-700)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                        Clinical System Instruction:
                      </div>
                      <pre style={{
                        background: 'var(--bg-surface)',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.76rem',
                        color: 'var(--text-secondary)',
                        fontFamily: 'var(--font-mono)',
                        whiteSpace: 'pre-wrap',
                        maxHeight: '140px',
                        overflowY: 'auto',
                        border: '1px solid var(--border-subtle)'
                      }}>
                        {log.system_prompt || "None"}
                      </pre>
                    </div>

                    {/* User Prompt */}
                    <div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--teal-700)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                        Inventory State Query:
                      </div>
                      <pre style={{
                        background: 'var(--bg-surface)',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.76rem',
                        color: 'var(--text-secondary)',
                        fontFamily: 'var(--font-mono)',
                        whiteSpace: 'pre-wrap',
                        border: '1px solid var(--border-subtle)'
                      }}>
                        {log.user_prompt || "None"}
                      </pre>
                    </div>

                    {/* Response Payload */}
                    <div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--emerald-700)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                        Validated JSON Structured Decision:
                      </div>
                      <pre style={{
                        background: 'var(--emerald-50)',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.76rem',
                        color: 'var(--emerald-700)',
                        fontFamily: 'var(--font-mono)',
                        whiteSpace: 'pre-wrap',
                        maxHeight: '180px',
                        overflowY: 'auto',
                        border: '1px solid var(--emerald-100)'
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
