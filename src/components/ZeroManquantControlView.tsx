import React, { useState } from 'react';
import { ShiftState } from '../wat/types';
import { computeShiftReconciliation, generateHandoverMarkdown } from '../wat/tools';
import {
  ShieldCheck,
  AlertTriangle,
  FileText,
  Copy,
  Check,
  Printer,
  ShoppingBag,
  Truck,
  Package,
  Layers,
  DollarSign,
  TrendingDown,
  Sparkles
} from 'lucide-react';

interface ZeroManquantControlViewProps {
  state: ShiftState;
  onUpdatePhysicalStock: (count: number) => void;
  onOpenReportModal: () => void;
  onNavigateToPates: () => void;
  onNavigateToDispatch: () => void;
}

export const ZeroManquantControlView: React.FC<ZeroManquantControlViewProps> = ({
  state,
  onUpdatePhysicalStock,
  onOpenReportModal,
  onNavigateToPates,
  onNavigateToDispatch
}) => {
  const recon = computeShiftReconciliation(state);
  const [stockInput, setStockInput] = useState<number>(recon.countedPhysicalStockRemaining);
  const [copied, setCopied] = useState<boolean>(false);

  const handleApplyStock = () => {
    onUpdatePhysicalStock(Math.max(0, stockInput));
  };

  const handleCopyBordereau = () => {
    const text = generateHandoverMarkdown(state);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const isPerfect = recon.isZeroMissingAchieved && recon.zeroMissingBalance === 0;
  const isMissing = recon.hasMissingLoaves;
  const isSurplus = recon.hasSurplusLoaves;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

      {/* GRAND PANNEAU THERMOMÈTRE ZÉRO MANQUANT */}
      <div
        className="glass-card"
        style={{
          border: isPerfect
            ? '2px solid #10b981'
            : isMissing
            ? '2px solid #ef4444'
            : '2px solid #f59e0b',
          background: isPerfect
            ? 'linear-gradient(145deg, rgba(16, 185, 129, 0.16) 0%, rgba(11, 15, 25, 0.98) 100%)'
            : isMissing
            ? 'linear-gradient(145deg, rgba(239, 68, 68, 0.18) 0%, rgba(11, 15, 25, 0.98) 100%)'
            : 'linear-gradient(145deg, rgba(245, 158, 11, 0.16) 0%, rgba(11, 15, 25, 0.98) 100%)',
          padding: '24px',
          boxShadow: isPerfect
            ? '0 0 35px rgba(16, 185, 129, 0.25)'
            : isMissing
            ? '0 0 35px rgba(239, 68, 68, 0.35)'
            : '0 0 30px rgba(245, 158, 11, 0.2)',
          borderRadius: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                background: isPerfect
                  ? 'linear-gradient(135deg, #10b981 0%, #047857 100%)'
                  : isMissing
                  ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)'
                  : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: isPerfect
                  ? '0 0 20px rgba(16, 185, 129, 0.5)'
                  : isMissing
                  ? '0 0 20px rgba(239, 68, 68, 0.6)'
                  : '0 0 20px rgba(245, 158, 11, 0.5)',
                flexShrink: 0
              }}
            >
              {isPerfect ? <ShieldCheck size={32} /> : isMissing ? <AlertTriangle size={32} /> : <Sparkles size={32} />}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', margin: 0 }}>
                  {isPerfect
                    ? '🛡️ ZÉRO MANQUANT CERTIFIÉ : ÉQUILIBRE PARFAIT'
                    : isMissing
                    ? `🚨 ALERTE MANQUANT : ${recon.zeroMissingBalance} PAINS PERDUS`
                    : `⚠️ SURPLUS CONSTATÉ : +${Math.abs(recon.zeroMissingBalance)} PAINS`}
                </h2>
                <span
                  className={`badge ${isPerfect ? 'badge-success' : isMissing ? 'badge-danger' : 'badge-amber'}`}
                  style={{ fontSize: '11px', padding: '3px 8px' }}
                >
                  {isPerfect ? '100% Infaillible' : isMissing ? 'Perte Financière' : 'Surplus Fournil'}
                </span>
              </div>

              <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: '4px 0 0 0', maxWidth: '650px' }}>
                {isPerfect
                  ? 'Chaque pâte de farine pétrie est rigoureusement justifiée : les pains vendables correspondent exactement aux tournées livrées et au stock restant au fournil.'
                  : isMissing
                  ? `Manque inexpliqué de ${recon.zeroMissingBalance} pains, représentant une perte sèche de ${recon.financialLeakageCFA.toLocaleString('fr-FR')} FCFA. Vérifiez les pâtes au pétrin ou les sorties des livreurs.`
                  : `Plus de pains distribués que de vendables déclarés (+${Math.abs(recon.zeroMissingBalance)} pains). Vérifiez si un sac de farine n'a pas été enregistré ou si le nombre de pâtes est sous-évalué.`}
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              RECETTE DUE AU PATRON
            </div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-heading)' }}>
              {recon.totalRevenueExpectedCFA.toLocaleString('fr-FR')} <span style={{ fontSize: '16px' }}>FCFA</span>
            </div>
          </div>
        </div>
      </div>

      {/* LES 3 PILIERS DE LA BALANCE (ÉQUATION INFAILLIBLE A - B - C = 0) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
        
        {/* Pilier 1 : Vendables Fournil */}
        <div className="glass-card" style={{ borderTop: '4px solid var(--amber-primary)', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--amber-light)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShoppingBag size={16} />
              <span>A. Vendables Fournil</span>
            </span>
            <button
              type="button"
              onClick={onNavigateToPates}
              style={{ background: 'none', border: 'none', color: 'var(--amber-light)', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Modifier
            </button>
          </div>

          <div style={{ fontSize: '28px', fontWeight: 800, color: '#fff' }}>
            {recon.totalLoavesBaked.toLocaleString('fr-FR')} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>pains</span>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px', lineHeight: 1.5 }}>
            • <strong>{recon.totalPatesCount} pâtes</strong> sur {recon.totalFlourBagsUsed} sac(s) ({recon.averagePatesPerBag} p./sac)<br />
            • <strong>{recon.totalGrossLoavesBaked}</strong> baguettes brutes façonnées<br />
            • <strong style={{ color: '#f87171' }}>-{recon.totalScrapLoaves}</strong> démarque ({recon.totalBurnedLoaves} brûlés, {recon.totalBrokenLoaves} cassés)
          </div>
        </div>

        {/* Pilier 2 : Pains Distribués */}
        <div className="glass-card" style={{ borderTop: '4px solid #3b82f6', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#93c5fd', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Truck size={16} />
              <span>B. Pains Expédiés</span>
            </span>
            <button
              type="button"
              onClick={onNavigateToDispatch}
              style={{ background: 'none', border: 'none', color: '#93c5fd', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Émarger
            </button>
          </div>

          <div style={{ fontSize: '28px', fontWeight: 800, color: '#60a5fa' }}>
            {recon.totalLoavesDelivered.toLocaleString('fr-FR')} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>pains</span>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px', lineHeight: 1.5 }}>
            • <strong>{recon.loavesByChannel.livreurs} pains</strong> ➔ Livreurs ({recon.revenueByChannel.livreurs.toLocaleString('fr-FR')} F)<br />
            • <strong>{recon.loavesByChannel.adjara} pains</strong> ➔ Section ADJARA ({recon.revenueByChannel.adjara.toLocaleString('fr-FR')} F)<br />
            • <strong>{recon.loavesByChannel.guichet} pains</strong> ➔ Guichet Comptoir ({recon.revenueByChannel.guichet.toLocaleString('fr-FR')} F)
          </div>
        </div>

        {/* Pilier 3 : Stock Restant Physique au Fournil */}
        <div className="glass-card" style={{ borderTop: '4px solid #10b981', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Package size={16} />
              <span>C. Stock Restant Fournil</span>
            </span>
            <span className="badge badge-success" style={{ fontSize: '9.5px' }}>
              {recon.hasPhysicalStockCounted ? 'Compté Réel' : 'Calculé'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <input
              type="number"
              min="0"
              className="form-input"
              value={stockInput}
              onChange={(e) => setStockInput(Math.max(0, parseInt(e.target.value) || 0))}
              style={{
                width: '100px',
                fontSize: '22px',
                fontWeight: 800,
                color: '#34d399',
                textAlign: 'center',
                padding: '6px'
              }}
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleApplyStock}
              style={{ fontSize: '12px', padding: '8px 12px' }}
            >
              Valider Stock
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setStockInput(recon.theoreticalStockRemaining);
                onUpdatePhysicalStock(recon.theoreticalStockRemaining);
              }}
              style={{ fontSize: '11px', padding: '8px 8px' }}
              title="Copier le calcul théorique"
            >
              Théorique ({recon.theoreticalStockRemaining})
            </button>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-dim)', lineHeight: 1.5 }}>
            Pains réservés sur chariots pour l'ouverture de la boutique du matin.
          </div>
        </div>

      </div>

      {/* TABLEAU RÉCAPITULATIF OFFICIEL POUR LE PATRON */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '17px', color: '#fff', margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} color="var(--amber-light)" />
              <span>Bordereau Récapitulatif de Clôture</span>
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              À remettre ou transmettre au propriétaire pour contrôle des encaissements
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCopyBordereau}
              style={{ fontSize: '12.5px', padding: '8px 14px' }}
            >
              {copied ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
              <span>{copied ? 'Copié pour WhatsApp !' : 'Copier pour WhatsApp'}</span>
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={onOpenReportModal}
              style={{ fontSize: '12.5px', padding: '8px 16px' }}
            >
              <Printer size={14} />
              <span>Imprimer Bordereau Complet</span>
            </button>
          </div>
        </div>

        {/* Lignes d'Audit Rapprochement */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', fontSize: '13.5px' }}>
            <span style={{ color: 'var(--flour-white)' }}>🥖 Pâtes pétries (Farine fournil) :</span>
            <strong style={{ color: 'var(--amber-light)' }}>
              {recon.totalPatesCount} pâtes = {recon.totalGrossLoavesBaked} pains bruts
              {recon.patesDeltaQuota !== 0 && (
                <span style={{ fontSize: '12px', color: recon.patesDeltaQuota > 0 ? '#60a5fa' : '#f87171', marginLeft: '6px' }}>
                  ({recon.patesDeltaQuota > 0 ? `+${recon.patesDeltaQuota}` : recon.patesDeltaQuota} vs quota)
                </span>
              )}
            </strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', fontSize: '13.5px' }}>
            <span style={{ color: 'var(--flour-white)' }}>🔥 Démarque justifiée (Brûlés & Cassés) :</span>
            <strong style={{ color: '#f87171' }}>
              -{recon.totalScrapLoaves} pains (-{recon.totalScrapLossCFA.toLocaleString('fr-FR')} FCFA)
            </strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', fontSize: '13.5px' }}>
            <span style={{ color: 'var(--flour-white)' }}>🚚 Total pains expédiés aux livreurs & guichet :</span>
            <strong style={{ color: '#60a5fa' }}>
              {recon.totalLoavesDelivered} pains
            </strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', fontSize: '13.5px' }}>
            <span style={{ color: 'var(--flour-white)' }}>🏬 Stock physique restant au fournil (Boutique matin) :</span>
            <strong style={{ color: '#34d399' }}>
              {recon.countedPhysicalStockRemaining} pains
            </strong>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 14px',
            background: isPerfect ? 'rgba(16, 185, 129, 0.15)' : isMissing ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            border: isPerfect ? '1px solid #10b981' : isMissing ? '1px solid #ef4444' : '1px solid #f59e0b',
            borderRadius: '12px',
            fontSize: '15px'
          }}>
            <span style={{ fontWeight: 700, color: '#fff' }}>
              ⚖️ Écart Final de Clôture (Manquant) :
            </span>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: '20px',
                fontWeight: 800,
                color: isPerfect ? '#34d399' : isMissing ? '#f87171' : 'var(--amber-light)',
                fontFamily: 'var(--font-heading)'
              }}>
                {isPerfect ? '0 PAIN (ZÉRO MANQUANT)' : `${recon.zeroMissingBalance} PAINS`}
              </div>
              {isMissing && (
                <div style={{ fontSize: '12px', color: '#f87171', fontWeight: 700 }}>
                  Perte : -{recon.financialLeakageCFA.toLocaleString('fr-FR')} FCFA
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
export default ZeroManquantControlView;
