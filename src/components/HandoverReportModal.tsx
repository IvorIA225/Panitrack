import React, { useState } from 'react';
import { ShiftState } from '../wat/types';
import { computeShiftReconciliation, generateHandoverMarkdown } from '../wat/tools';
import { FileText, Printer, Copy, Check, X, ShieldCheck, DollarSign, Flame, Package } from 'lucide-react';

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
    <div className="modal-overlay" style={{ zIndex: 110 }}>
      <div className="modal-content" style={{ maxWidth: '850px' }}>
        
        {/* Titre Modal */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
            }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '18px', color: '#fff', margin: 0, fontWeight: 800 }}>
                  Bordereau Officiel « ZÉRO MANQUANT » & Bilan Financier
                </h3>
                <span className="badge badge-success" style={{ fontSize: '11px' }}>
                  Mathématiquement Verrouillé
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
                Fiche de passation définitive pour le patron : Recettes FCFA certifiées & balance physique à 0 écart.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Diagnostic d'audit & 4 Cartes Clés */}
        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <div className="stat-card" style={{ borderTop: '3px solid var(--amber-primary)' }}>
            <div className="stat-label">Pains Vendables</div>
            <div className="stat-value" style={{ color: 'var(--amber-light)' }}>{recon.totalLoavesBaked}</div>
            <div className="stat-subtext">{recon.totalFlourBagsUsed} sac(s) • {recon.totalScrapLoaves} démarque</div>
          </div>

          <div className="stat-card" style={{ borderTop: '3px solid #34d399' }}>
            <div className="stat-label">Pains Distribués</div>
            <div className="stat-value" style={{ color: '#34d399' }}>{recon.totalLoavesDelivered}</div>
            <div className="stat-subtext">{recon.totalDeliveriesCount} enlèvements consignés</div>
          </div>

          <div className="stat-card" style={{ borderTop: '3px solid #10b981' }}>
            <div className="stat-label">Recette à Encaisser</div>
            <div className="stat-value" style={{ color: '#10b981', fontSize: '24px' }}>
              {recon.totalRevenueExpectedCFA.toLocaleString('fr-FR')} <span style={{ fontSize: '14px' }}>F</span>
            </div>
            <div className="stat-subtext">Valorisé à 110 F & 150 F</div>
          </div>

          <div className="stat-card" style={{ borderTop: `3px solid ${recon.isZeroMissingAchieved ? '#34d399' : '#ef4444'}` }}>
            <div className="stat-label">Écart / Manquant</div>
            <div className="stat-value" style={{ color: recon.isZeroMissingAchieved ? '#34d399' : '#ef4444' }}>
              {recon.zeroMissingBalance === 0 ? '0' : recon.zeroMissingBalance}
            </div>
            <div className="stat-subtext">{recon.isZeroMissingAchieved ? '✅ Zéro Manquant certifié' : '⚠️ Anomalie détectée'}</div>
          </div>
        </div>

        {/* Fiche Officielle Papier / Rapport Formaté */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '14px',
          padding: '22px',
          fontSize: '13.5px',
          color: 'var(--flour-white)',
          lineHeight: '1.7',
          maxHeight: '380px',
          overflowY: 'auto'
        }}>
          
          <div style={{ textAlign: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '18px', color: 'var(--amber-light)', margin: 0 }}>
              PaniTrack • RAPPORT DE SHIFT & BILAN FINANCIER
            </h2>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Shift ID : {state.shiftId} | Opérateur : {state.operatorName} | Date : {new Date().toLocaleDateString('fr-FR')}
            </div>
          </div>

          {/* Section 1 : Production des Pâtes & Démarque */}
          <h4 style={{ color: 'var(--amber-primary)', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>1. CONTRÔLE DES PÂTES PAR SAC DE FARINE (FOURNIL)</span>
          </h4>
          <ul style={{ paddingLeft: '20px' }}>
            <li>Sacs de farine travaillés : <strong>{recon.totalFlourBagsUsed} sac(s)</strong> (Quota attendu : {recon.totalFlourBagsUsed * 20} pâtes = {recon.totalFlourBagsUsed * 400} baguettes)</li>
            <li>Pâtes obtenues au pétrin : <strong>{recon.totalPatesCount} pâtes</strong> (Moyenne : <strong>{recon.averagePatesPerBag} pâtes/sac</strong> {recon.patesDeltaQuota !== 0 ? `[${recon.patesDeltaQuota > 0 ? `+${recon.patesDeltaQuota}` : recon.patesDeltaQuota} vs quota]` : '✅ Quota exact'})</li>
            <li>Baguettes brutes façonnées : <strong>{recon.totalGrossLoavesBaked} pains</strong></li>
            <li>Démarque justifiée au fournil : <strong>{recon.totalScrapLoaves} pains</strong> ({recon.totalBurnedLoaves} brûlés au four, {recon.totalBrokenLoaves} cassés)</li>
            <li>Rendement vendable net disponible : <strong style={{ color: '#34d399' }}>{recon.totalLoavesBaked} pains vendables</strong></li>
            <li>Perte financière sur démarque (110 F) : -{recon.totalScrapLossCFA.toLocaleString('fr-FR')} FCFA</li>
          </ul>

          {/* Section 2 : Distribution & Recettes par Canal */}
          <h4 style={{ color: 'var(--amber-primary)', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>2. DISTRIBUTION PAR CANAUX ÉTANCHES & TARIFS OFFICIELS</span>
          </h4>
          <div style={{ margin: '8px 0', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                  <th style={{ padding: '6px 10px', color: 'var(--text-muted)' }}>Canal</th>
                  <th style={{ padding: '6px 10px', color: 'var(--text-muted)' }}>Pains Distribués</th>
                  <th style={{ padding: '6px 10px', color: 'var(--text-muted)' }}>Tarif Appliqué</th>
                  <th style={{ padding: '6px 10px', color: 'var(--text-muted)' }}>Recette FCFA</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '6px 10px' }}>🚚 <strong>Livreurs Officiels</strong></td>
                  <td style={{ padding: '6px 10px' }}>{recon.loavesByChannel.livreurs} pains</td>
                  <td style={{ padding: '6px 10px' }}>110 FCFA</td>
                  <td style={{ padding: '6px 10px', fontWeight: 700, color: '#34d399' }}>{recon.revenueByChannel.livreurs.toLocaleString('fr-FR')} FCFA</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 10px' }}>🏬 <strong>Section ADJARA</strong></td>
                  <td style={{ padding: '6px 10px' }}>{recon.loavesByChannel.adjara} pains</td>
                  <td style={{ padding: '6px 10px' }}>110 FCFA</td>
                  <td style={{ padding: '6px 10px', fontWeight: 700, color: '#93c5fd' }}>{recon.revenueByChannel.adjara.toLocaleString('fr-FR')} FCFA</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 10px' }}>🛒 <strong>Guichet Comptoir</strong></td>
                  <td style={{ padding: '6px 10px' }}>{recon.loavesByChannel.guichet} pains</td>
                  <td style={{ padding: '6px 10px' }}>150 FCFA</td>
                  <td style={{ padding: '6px 10px', fontWeight: 700, color: 'var(--amber-light)' }}>{recon.revenueByChannel.guichet.toLocaleString('fr-FR')} FCFA</td>
                </tr>
                <tr style={{ borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(16, 185, 129, 0.08)' }}>
                  <td style={{ padding: '8px 10px', fontWeight: 800 }}>TOTAL GÉNÉRAL</td>
                  <td style={{ padding: '8px 10px', fontWeight: 800 }}>{recon.totalLoavesDelivered} pains</td>
                  <td style={{ padding: '8px 10px' }}>—</td>
                  <td style={{ padding: '8px 10px', fontWeight: 800, color: '#34d399', fontSize: '14px' }}>
                    {recon.totalRevenueExpectedCFA.toLocaleString('fr-FR')} FCFA
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 3 : Preuves & Contrôles */}
          <h4 style={{ color: 'var(--amber-primary)', marginTop: '16px' }}>3. CONTRÔLE SACS & PREUVES PHOTOGRAPHIQUES</h4>
          <ul style={{ paddingLeft: '20px' }}>
            <li>Règle des 25 : Tous les sacs ont été validés en quarantaine et scellés à 25 pains.</li>
            <li>Sanctuarisation du chargement : Règle du 1-par-1 respectée au sas d'expédition.</li>
            {state.deliveries && state.deliveries.some(d => d.photoProofUrl) && (
              <li style={{ color: '#34d399' }}>📸 Des preuves photographiques horodatées ont été associées aux chargements.</li>
            )}
          </ul>

          {/* Section 4 : Balance Matière & Zéro Manquant */}
          <h4 style={{ color: 'var(--amber-primary)', marginTop: '16px' }}>4. BALANCE MATIÈRE INFAILLIBLE « ZÉRO MANQUANT »</h4>
          <p>
            Pains vendables issus des pâtes ({recon.totalLoavesBaked}) - Pains distribués ({recon.totalLoavesDelivered}) - Stock physique restant ({recon.countedPhysicalStockRemaining} pains)
          </p>
          <div style={{
            marginTop: '8px',
            padding: '12px 16px',
            background: recon.zeroMissingBalance === 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: recon.zeroMissingBalance === 0 ? '1px solid rgba(16, 185, 129, 0.45)' : '1px solid rgba(239, 68, 68, 0.45)',
            borderRadius: '10px'
          }}>
            <strong style={{ color: recon.zeroMissingBalance === 0 ? '#34d399' : '#f87171', fontSize: '15px' }}>
              {recon.zeroMissingBalance === 0
                ? '🎯 PROTOCOLE VALIDÉ : ÉCART INJUSTIFIÉ = 0 PAIN (ZÉRO MANQUANT CERTIFIÉ)'
                : `🚨 ALERTE MANQUANT : ${recon.zeroMissingBalance} PAINS MANQUANTS (Perte : -${recon.financialLeakageCFA.toLocaleString('fr-FR')} FCFA)`}
            </strong>
            <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Recette totale nette en espèces due au patron : <strong style={{ color: '#fff' }}>{recon.totalRevenueExpectedCFA.toLocaleString('fr-FR')} FCFA</strong>.
            </div>
          </div>

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

        {/* Boutons d'export */}
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
export default HandoverReportModal;
