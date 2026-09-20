import React, { useState } from 'react';
import { ShiftState } from '../wat/types';
import { computeShiftReconciliation, generateHandoverMarkdown } from '../wat/tools';
import { FileText, Printer, Copy, Check, X } from 'lucide-react';

interface HandoverReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: ShiftState;
}

export const HandoverReportModal: React.FC<HandoverReportModalProps> = ({
  isOpen,
  onClose,
  state
}) => {
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;

  const recon = computeShiftReconciliation(state);
  const markdownText = generateHandoverMarkdown(state);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '800px' }}>
        
        {/* Titre Modal */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText size={22} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', color: '#fff' }}>Bordereau Officiel de Passation de Consignes</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Rapport de clôture pour le responsable ("Jusqu'à ce que moi j'arrive")
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

        {/* Diagnostic d'audit & balance matière */}
        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
          <div className="stat-card">
            <div className="stat-label">Pains Produits</div>
            <div className="stat-value" style={{ color: 'var(--amber-light)' }}>{recon.totalLoavesBaked}</div>
            <div className="stat-subtext">{recon.totalFlourBagsUsed} sac(s) de farine</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Pains Livrés</div>
            <div className="stat-value" style={{ color: 'var(--success)' }}>{recon.totalLoavesDelivered}</div>
            <div className="stat-subtext">{recon.totalDeliveriesCount} livraison(s)</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Solde Restant</div>
            <div className="stat-value" style={{ color: recon.loavesRemainingInBakery >= 0 ? '#60a5fa' : '#ef4444' }}>
              {recon.loavesRemainingInBakery}
            </div>
            <div className="stat-subtext">Pains théoriques au fournil</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Anomalies Auditées</div>
            <div className="stat-value" style={{ color: recon.totalAnomaliesDetected > 0 ? '#ef4444' : 'var(--success)' }}>
              {recon.totalAnomaliesDetected}
            </div>
            <div className="stat-subtext">Alertes Diallo / Sacs</div>
          </div>
        </div>

        {/* Document Format Papier / Rapport officiel */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '14px',
          padding: '20px',
          fontSize: '13.5px',
          color: 'var(--flour-white)',
          lineHeight: '1.7',
          maxHeight: '380px',
          overflowY: 'auto'
        }}>
          
          <div style={{ textAlign: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '18px', color: 'var(--amber-light)' }}>PaniTrack • RAPPORT DE SHIFT DE BOULANGERIE</h2>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Shift ID : {state.shiftId} | Opérateur : {state.operatorName} | Date : {new Date().toLocaleDateString('fr-FR')}
            </div>
          </div>

          {/* Section 1 */}
          <h4 style={{ color: 'var(--amber-primary)', marginTop: '10px' }}>1. PRODUCTION DU FOURNIL</h4>
          <ul style={{ paddingLeft: '20px' }}>
            <li>Sacs de farine travaillés : <strong>{recon.totalFlourBagsUsed} sac(s)</strong></li>
            <li>Total pains sortis du four : <strong>{recon.totalLoavesBaked} pains</strong></li>
            <li>Chariots de cuisson enregistrés : <strong>{recon.totalCartsRecorded}</strong></li>
            <li>Chariots versés en cartons (Minuit) : <strong>{recon.totalCartsDumpedToCarton}</strong></li>
          </ul>

          {/* Section 2 */}
          <h4 style={{ color: 'var(--amber-primary)', marginTop: '14px' }}>2. CONTRÔLE LIVREURS & AUDIT DES SACS</h4>
          <ul style={{ paddingLeft: '20px' }}>
            <li>Total pains pris par les livreurs : <strong>{recon.totalLoavesDelivered} pains</strong></li>
          </ul>

          {state.dialloInspections.length > 0 && (
            <div style={{ marginTop: '8px', padding: '10px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
              <strong>Contrôle Spécial Diallo :</strong>
              {state.dialloInspections.map((d, i) => (
                <div key={i} style={{ fontSize: '12.5px', marginTop: '4px' }}>
                  • {d.totalBagsTaken} sacs pris. <strong>Comptage physique du sac = {d.sampledBagLoavesCount} pains</strong> (standard = 25).
                  Total comptabilisé = <strong>{d.totalBreadsCalculated} pains</strong>.
                  {d.isAnomalyDetected && (
                    <span style={{ color: '#f87171', fontWeight: 600 }}> (Écart de {d.leakagePerBag > 0 ? '+' : ''}{d.leakagePerBag} pains/sac soit {d.totalFinancialLeakageLoaves} pains de décalage évités)</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {state.souridjiMembers.length > 0 && (
            <div style={{ marginTop: '8px', padding: '10px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px' }}>
              <strong>Membres du Groupe Souridji consignés individuellement :</strong>
              {state.souridjiMembers.map((s, i) => (
                <div key={i} style={{ fontSize: '12.5px', marginTop: '2px' }}>
                  • {s.individualName} : {s.bagsCount} sacs ({s.loavesCount > 0 ? s.loavesCount : s.bagsCount * 25} pains) à {s.timestamp}
                </div>
              ))}
            </div>
          )}

          {/* Section 3 */}
          <h4 style={{ color: 'var(--amber-primary)', marginTop: '14px' }}>3. BALANCE MATIÈRE</h4>
          <p>
            Pains cuits ({recon.totalLoavesBaked}) - Pains livrés ({recon.totalLoavesDelivered}) = <strong>{recon.loavesRemainingInBakery} pains en stock restant</strong>.
          </p>

          {/* Signatures */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', paddingTop: '14px', borderTop: '1px dashed var(--border-subtle)' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Signature Contrôleur de Nuit :</div>
              <div style={{ height: '35px', borderBottom: '1px solid #64748b', width: '180px', marginTop: '5px' }}></div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Signature Responsable / Patron :</div>
              <div style={{ height: '35px', borderBottom: '1px solid #64748b', width: '180px', marginTop: '5px' }}></div>
            </div>
          </div>

        </div>

        {/* Boutons d'export & d'action */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginTop: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={handleCopy}>
              {copied ? <Check size={16} color="var(--success)" /> : <Copy size={16} />}
              <span>{copied ? 'Copié dans le presse-papier !' : 'Copier Résumé WhatsApp'}</span>
            </button>
            <button className="btn btn-secondary" onClick={handlePrint}>
              <Printer size={16} />
              <span>Imprimer / Exporter PDF</span>
            </button>
          </div>

          <button className="btn btn-primary" onClick={onClose}>
            Fermer le Rapport
          </button>
        </div>

      </div>
    </div>
  );
};
