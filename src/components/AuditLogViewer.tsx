import React from 'react';
import { AuditLogEntry } from '../wat/types';
import { ShieldCheck } from 'lucide-react';

interface AuditLogViewerProps {
  logs: AuditLogEntry[];
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ logs }) => {
  const getSeverityBadge = (severity: AuditLogEntry['severity']) => {
    switch (severity) {
      case 'danger':
        return <span className="badge badge-danger">Alerte Critique</span>;
      case 'warning':
        return <span className="badge badge-amber">Vigilance</span>;
      case 'success':
        return <span className="badge badge-success">Validé</span>;
      default:
        return <span className="badge badge-info">Information</span>;
    }
  };

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={20} color="var(--amber-light)" />
          <h3 style={{ fontSize: '16px', color: '#fff' }}>Journal d'Audit Immuable (Traçabilité Shift)</h3>
        </div>
        <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
          {logs.length} événement(s) consigné(s)
        </span>
      </div>

      <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {logs.slice().reverse().map((log) => (
          <div
            key={log.id}
            style={{
              background: 'rgba(15, 23, 42, 0.65)',
              border: log.severity === 'danger' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-subtle)',
              borderRadius: '10px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--amber-light)', whiteSpace: 'nowrap' }}>
                {log.timestamp}
              </div>
              <div style={{ fontSize: '13px', color: log.severity === 'danger' ? '#fca5a5' : 'var(--flour-white)' }}>
                {log.message}
              </div>
            </div>

            <div>{getSeverityBadge(log.severity)}</div>
          </div>
        ))}

        {logs.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px', fontSize: '13px' }}>
            Aucun événement d'audit consigné pour le moment.
          </div>
        )}
      </div>
    </div>
  );
};
