import React, { useState, useEffect } from 'react';
import {
  Clock,
  ShieldCheck,
  Sparkles,
  FileText,
  RotateCcw,
  AlertTriangle,
  MoreVertical,
  Layers,
  Bot,
  X
} from 'lucide-react';
import { ShiftState } from '../wat/types';
import { computeShiftReconciliation } from '../wat/tools';
import { NetworkStatusPill } from './NetworkStatusPill';

interface HeaderBarProps {
  state: ShiftState;
  onOpenReport: () => void;
  onOpenAgent: () => void;
  onLoadDemo: () => void;
  onResetShift: () => void;
  onOpenProtocol: () => void;
  unreadAlertsCount: number;
  isHeroVisible?: boolean;
  onToggleHero?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  state,
  onOpenReport,
  onOpenAgent,
  onLoadDemo,
  onResetShift,
  onOpenProtocol,
  unreadAlertsCount,
  isHeroVisible = true,
  onToggleHero
}) => {
  const [time, setTime] = useState<string>(new Date().toLocaleTimeString('fr-FR'));
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const recon = computeShiftReconciliation(state);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('fr-FR'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="glass-card header-bar" style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
        
        {/* Logo & Identité */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px rgba(245, 158, 11, 0.4)',
            flexShrink: 0
          }}>
            <span style={{ fontSize: '20px' }}>🥖</span>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
                PaniTrack
              </h1>
              <span className="badge badge-amber header-desktop-only" style={{ fontSize: '9.5px', padding: '2px 7px' }}>
                Zéro Manquant
              </span>
            </div>
            <p className="header-desktop-only" style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '1px 0 0 0' }}>
              Shift Boulangerie & Distribution Sécurisée
            </p>
          </div>
        </div>

        {/* Centre : Horloge + Recette Live (adaptatif) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <NetworkStatusPill />
          
          <div className="header-time-pill" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(15, 23, 42, 0.8)',
            padding: '6px 10px',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)'
          }}>
            <Clock size={14} color="var(--amber-light)" />
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '13px', color: 'var(--amber-light)' }}>
              {time}
            </span>
          </div>

          {/* Badge Recette Financière */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(16, 185, 129, 0.12)',
            padding: '6px 10px',
            borderRadius: '8px',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <ShieldCheck size={14} color="var(--success)" />
            <span style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 700 }}>
              {recon.totalRevenueExpectedCFA.toLocaleString('fr-FR')} <span style={{ fontSize: '10px' }}>FCFA</span>
            </span>
          </div>
        </div>

        {/* Boutons d'actions rapides Desktop */}
        <div className="header-desktop-actions" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Ligne Directive */}
          <button
            className="btn btn-secondary"
            onClick={onOpenProtocol}
            title="Consulter le protocole d'exécution rigoureux et la checklist"
            style={{ fontSize: '12.5px', padding: '7px 12px', color: 'var(--amber-light)' }}
          >
            <ShieldCheck size={14} />
            <span>Directive</span>
          </button>

          {/* Démo Scénario Note Vocale */}
          <button 
            className="btn btn-secondary" 
            onClick={onLoadDemo}
            title="Charger les données du cas réel décrit dans la note vocale WhatsApp"
            style={{ fontSize: '12.5px', padding: '7px 11px' }}
          >
            <Sparkles size={14} color="var(--amber-light)" />
            <span>Démo Note Vocale</span>
          </button>

          {/* Toggle Bannière 3D */}
          {onToggleHero && (
            <button
              className="btn btn-secondary"
              onClick={onToggleHero}
              title={isHeroVisible ? "Masquer la bannière 3D pour alléger l'écran" : "Afficher la bannière 3D"}
              style={{ fontSize: '12.5px', padding: '7px 11px' }}
            >
              <Layers size={14} />
              <span>{isHeroVisible ? 'Mode Épuré' : 'Bannière 3D'}</span>
            </button>
          )}

          {/* Copilote IA */}
          <button 
            className="btn btn-secondary" 
            onClick={onOpenAgent}
            style={{ fontSize: '12.5px', padding: '7px 12px', position: 'relative' }}
          >
            <Bot size={14} />
            <span>Copilote IA</span>
            {unreadAlertsCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#ef4444',
                color: '#fff',
                borderRadius: '999px',
                fontSize: '9px',
                fontWeight: 700,
                width: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {/* Rapport de Fin / Clôture */}
          <button 
            className="btn btn-primary" 
            onClick={onOpenReport}
            style={{ fontSize: '12.5px', padding: '7px 13px' }}
          >
            <FileText size={14} />
            <span>Bordereau Patron</span>
          </button>

          {/* Reset */}
          <button 
            className="btn btn-secondary" 
            onClick={onResetShift}
            title="Réinitialiser pour un nouveau shift vierge"
            style={{ padding: '7px 9px' }}
          >
            <RotateCcw size={14} color="var(--text-muted)" />
          </button>
        </div>

        {/* Bouton Menu Mobile (3 points) */}
        <div className="header-mobile-toggle">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{ padding: '7px 10px', borderRadius: '10px' }}
            aria-label="Options et raccourcis"
          >
            {isMobileMenuOpen ? <X size={18} /> : <MoreVertical size={18} />}
          </button>
        </div>
      </div>

      {/* Menu dépliant Mobile pour les actions secondaires */}
      {isMobileMenuOpen && (
        <div className="header-mobile-dropdown glass-card" style={{
          padding: '12px',
          background: 'rgba(15, 23, 42, 0.98)',
          border: '1px solid var(--border-active)',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <button
            className="btn btn-secondary"
            onClick={() => { onOpenProtocol(); setIsMobileMenuOpen(false); }}
            style={{ justifyContent: 'flex-start', fontSize: '13px', padding: '9px 12px' }}
          >
            <ShieldCheck size={16} color="var(--amber-light)" />
            <span>🛡️ Ligne Directive Zéro Manquant</span>
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => { onLoadDemo(); setIsMobileMenuOpen(false); }}
            style={{ justifyContent: 'flex-start', fontSize: '13px', padding: '9px 12px' }}
          >
            <Sparkles size={16} color="var(--amber-light)" />
            <span>✨ Charger Scénario Note Vocale</span>
          </button>

          {onToggleHero && (
            <button
              className="btn btn-secondary"
              onClick={() => { onToggleHero(); setIsMobileMenuOpen(false); }}
              style={{ justifyContent: 'flex-start', fontSize: '13px', padding: '9px 12px' }}
            >
              <Layers size={16} />
              <span>{isHeroVisible ? '👁️ Masquer la Bannière 3D' : '👁️ Afficher la Bannière 3D'}</span>
            </button>
          )}

          <button
            className="btn btn-secondary"
            onClick={() => { onResetShift(); setIsMobileMenuOpen(false); }}
            style={{ justifyContent: 'flex-start', fontSize: '13px', padding: '9px 12px', color: '#f87171' }}
          >
            <RotateCcw size={16} />
            <span>🔄 Réinitialiser le Shift (Nouveau)</span>
          </button>
        </div>
      )}

      {/* Mini barre d'alerte en cas d'anomalie critique */}
      {recon.totalAnomaliesDetected > 0 && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '8px',
          padding: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: '#fca5a5'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={14} color="#ef4444" />
            <span>
              <strong>Vigilance :</strong> {recon.totalAnomaliesDetected} anomalie(s) détectée(s) (Sac Diallo tracé).
            </span>
          </div>
          <button 
            className="btn btn-danger" 
            style={{ padding: '3px 8px', fontSize: '10.5px' }}
            onClick={onOpenReport}
          >
            Détails
          </button>
        </div>
      )}
    </header>
  );
};
export default HeaderBar;
