import React, { useState } from 'react';
import { auditDialloBagSample } from '../wat/tools';
import { DialloInspection } from '../wat/types';
import { AlertTriangle, CheckCircle, Calculator, X, ShieldAlert } from 'lucide-react';

interface DialloInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveInspection: (inspection: DialloInspection) => void;
}

export const DialloInspectorModal: React.FC<DialloInspectorModalProps> = ({
  isOpen,
  onClose,
  onSaveInspection
}) => {
  const [totalBags, setTotalBags] = useState<number>(30); // 30 sacs comme dans l'exemple de l'audio
  const [sampledLoaves, setSampledLoaves] = useState<number>(27); // 27 comme le piège cité dans l'audio

  if (!isOpen) return null;

  const audit = auditDialloBagSample(totalBags, sampledLoaves, 25);

  const handleSave = () => {
    const inspection: DialloInspection = {
      id: 'diallo_' + Date.now(),
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      totalBagsTaken: audit.totalBagsTaken,
      theoreticalLoavesPerBag: audit.theoreticalLoavesPerBag,
      sampledBagLoavesCount: audit.sampledBagLoavesCount,
      isAnomalyDetected: audit.isAnomalyDetected,
      leakagePerBag: audit.leakagePerBag,
      totalFinancialLeakageLoaves: audit.totalFinancialLeakageLoaves,
      totalBreadsCalculated: audit.totalBreadsCalculated,
      notes: audit.notes,
      verified: true
    };
    onSaveInspection(inspection);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        
        {/* Titre Modal */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldAlert size={22} color="#ef4444" />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', color: '#fff' }}>Module de Contrôle Critique : DIALLO</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Vérification du contenu réel des sacs de pain (Anti-surdistribution)
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Rappel consigne note vocale */}
        <div style={{
          background: 'rgba(245, 158, 11, 0.08)',
          border: '1px dashed rgba(245, 158, 11, 0.35)',
          borderRadius: '12px',
          padding: '12px',
          fontSize: '13px',
          color: '#fef3c7',
          lineHeight: '1.5'
        }}>
          « Si Diallo vient, lui il prend par sac. Maintenant dans chaque sac, il doit avoir 25 pains.
          <strong>Tu comptes les pains qui sont dans le sac</strong> parce que là, ils vont dire 25...
          <strong>Mais s'ils mettent 27, toi tu vas penser que c'est 25 !</strong>
          Donc tu comptes les pains dans le sac. Quand tu as fini, tu comptes le nombre de sacs (ex: 30 sacs x 25 ou réel). »
        </div>

        {/* Formulaire de saisie & test d'échantillon */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="form-group">
            <label className="form-label">1. Nombre total de sacs chargés par Diallo</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="number"
                className="form-input"
                value={totalBags}
                onChange={(e) => setTotalBags(parseInt(e.target.value) || 0)}
                style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}
              />
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>sacs de pain</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              2. Nombre physique de pains comptés dans le sac vérifié (Standard = 25)
            </label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="number"
                className="form-input"
                value={sampledLoaves}
                onChange={(e) => setSampledLoaves(parseInt(e.target.value) || 0)}
                style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  color: sampledLoaves !== 25 ? '#ef4444' : 'var(--success)'
                }}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSampledLoaves(25)}
              >
                25 (Standard)
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => setSampledLoaves(27)}
                title="Tester le piège mentionné dans la note vocale"
              >
                27 (Piège Audio)
              </button>
            </div>
          </div>

          {/* Diagnostic Arithmétique Déterministe en direct */}
          <div style={{
            background: audit.isAnomalyDetected ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.12)',
            border: `1px solid ${audit.isAnomalyDetected ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.35)'}`,
            borderRadius: '14px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {audit.isAnomalyDetected ? (
                <AlertTriangle size={20} color="#ef4444" />
              ) : (
                <CheckCircle size={20} color="var(--success)" />
              )}
              <h4 style={{ fontSize: '15px', color: audit.isAnomalyDetected ? '#fca5a5' : '#a7f3d0' }}>
                {audit.isAnomalyDetected ? 'Anomalie Détectée par PaniTrack !' : 'Échantillon Conforme'}
              </h4>
            </div>

            <div style={{ fontSize: '13.5px', color: '#fff', lineHeight: '1.6' }}>
              <div>• Calcul théorique aveugle : <strong>{totalBags} sacs × 25 = {totalBags * 25} pains</strong></div>
              <div>• <strong>Calcul réel PaniTrack :</strong> {totalBags} sacs × {sampledLoaves} = <strong style={{ color: 'var(--amber-light)', fontSize: '15px' }}>{audit.totalBreadsCalculated} pains</strong></div>
              
              {audit.isAnomalyDetected && (
                <div style={{ marginTop: '8px', padding: '8px 12px', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '8px', color: '#fca5a5' }}>
                  ⚠️ <strong>Alerte Perte Sèche :</strong> Vous donnez <strong>+{audit.leakagePerBag} pains en trop par sac</strong>.
                  Sur la commande de {totalBags} sacs, cela représente <strong>{audit.totalFinancialLeakageLoaves} pains supplémentaires</strong> non facturés si non relevés !
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Boutons d'action */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Annuler
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            <Calculator size={16} />
            <span>Enregistrer la livraison Diallo ({audit.totalBreadsCalculated} pains)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
