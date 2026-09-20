import React, { useState, useEffect } from 'react';
import { Clock, ShieldCheck, Sparkles, FileText, RotateCcw, AlertTriangle } from 'lucide-react';
import { ShiftState } from '../wat/types';
import { computeShiftReconciliation } from '../wat/tools';
import { NetworkStatusPill } from './NetworkStatusPill';

interface HeaderBarProps {
  state: ShiftState;
  onOpenReport: () => void;
  onOpenAgent: () => void;
  onLoadDemo: () => void;
  onResetShift: () => void;
  unreadAlertsCount: number;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  state,
  onOpenReport,
  onOpenAgent,
  onLoadDemo,
  onResetShift,
  unreadAlertsCount
}) => {
  const [time, setTime] = useState<string>(new Date().toLocaleTimeString('fr-FR'));
  const recon = computeShiftReconciliation(state);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('fr-FR'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="glass-card" style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        
        {/* Logo & Identité */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(245, 158, 11, 0.4)'
          }}>
            <span style={{ fontSize: '22px' }}>🥖</span>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
                PaniTrack
              </h1>
              <span className="badge badge-amber" style={{ fontSize: '10px' }}>Framework WAT</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Système Automatisé de Contrôle & Réconciliation de Shift
            </p>
          </div>
        </div>

        {/* Statuts & Horloge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <NetworkStatusPill />
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(15, 23, 42, 0.8)',
            padding: '8px 14px',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)'
          }}>
            <Clock size={16} color="var(--amber-light)" />
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '15px', color: 'var(--amber-light)' }}>
              {time}
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(16, 185, 129, 0.12)',
            padding: '8px 12px',
            borderRadius: '10px',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <ShieldCheck size={16} color="var(--success)" />
            <span style={{ fontSize: '12.5px', color: 'var(--success)', fontWeight: 600 }}>
              Shift Sécurisé : {state.shiftId}
            </span>
          </div>
        </div>

        {/* Boutons d'actions rapides */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          
          {/* Démo Scénario Note Vocale */}
          <button 
            className="btn btn-secondary" 
            onClick={onLoadDemo}
            title="Charger les données du cas réel décrit dans la note vocale WhatsApp"
            style={{ fontSize: '13px', padding: '8px 12px' }}
          >
            <Sparkles size={15} color="var(--amber-light)" />
            <span>Scénario Note Vocale</span>
          </button>

          {/* Copilote IA WAT */}
          <button 
            className="btn btn-secondary" 
            onClick={onOpenAgent}
            style={{ fontSize: '13px', padding: '8px 14px', position: 'relative' }}
          >
            <span>🤖</span>
            <span>Copilote IA</span>
            {unreadAlertsCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                background: '#ef4444',
                color: '#fff',
                borderRadius: '999px',
                fontSize: '10px',
                fontWeight: 700,
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 8px rgba(239, 68, 68, 0.8)'
              }}>
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {/* Rapport de Fin / Clôture */}
          <button 
            className="btn btn-primary" 
            onClick={onOpenReport}
            style={{ fontSize: '13px', padding: '8px 14px' }}
          >
            <FileText size={15} />
            <span>Rapport Patron ({recon.handoverReady ? 'Prêt' : 'En cours'})</span>
          </button>

          {/* Reset */}
          <button 
            className="btn btn-secondary" 
            onClick={onResetShift}
            title="Réinitialiser pour un nouveau shift vierge"
            style={{ padding: '8px 10px' }}
          >
            <RotateCcw size={15} color="var(--text-muted)" />
          </button>
        </div>
      </div>

      {/* Mini barre d'alerte en cas d'anomalie critique */}
      {recon.totalAnomaliesDetected > 0 && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '10px',
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '13px',
          color: '#fca5a5'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} color="#ef4444" />
            <span>
              <strong>Vigilance active :</strong> {recon.totalAnomaliesDetected} anomalie(s) détectée(s) (dont sac Diallo vérifié à plus de 25 pains).
            </span>
          </div>
          <button 
            className="btn btn-danger" 
            style={{ padding: '4px 10px', fontSize: '11px' }}
            onClick={onOpenReport}
          >
            Voir les détails de l'audit
          </button>
        </div>
      )}
    </header>
  );
};
