import React from 'react';
import { ShiftState } from '../wat/types';
import {
  ShieldCheck,
  Package,
  Layers,
  Camera,
  CheckCircle2,
  Lock,
  Scale,
  DollarSign,
  X,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

interface ProtocolZeroManquantModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: ShiftState;
  onToggleChecklist?: (key: keyof ShiftState['protocolChecklist']) => void;
  onNavigateToDispatch?: () => void;
  onNavigateToFlour?: () => void;
}

export const ProtocolZeroManquantModal: React.FC<ProtocolZeroManquantModalProps> = ({
  isOpen,
  onClose,
  state,
  onToggleChecklist,
  onNavigateToDispatch,
  onNavigateToFlour
}) => {
  if (!isOpen) return null;

  const checklist = state.protocolChecklist || {
    quarantineEnforced: true,
    antiSecheDisplayed: true,
    oneByOneSanctified: true,
    bagsSealed25: true,
    channelsSeparated: true,
    photoProofRequired: true
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 120 }}>
      <div
        className="modal-content"
        style={{
          maxWidth: '900px',
          maxHeight: '92vh',
          background: 'linear-gradient(160deg, #0d1322 0%, #080c14 100%)',
          border: '1px solid rgba(245, 158, 11, 0.45)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(245, 158, 11, 0.2)'
        }}
      >
        {/* En-tête */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 18px rgba(245, 158, 11, 0.45)',
                color: '#000'
              }}
            >
              <ShieldCheck size={26} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '20px', color: '#fff', fontWeight: 800, margin: 0 }}>
                  Protocole & Ligne Directive « ZÉRO MANQUANT »
                </h3>
                <span className="badge badge-amber" style={{ fontSize: '11px' }}>
                  Exécution Mécanique
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                Aucune improvisation permise. Séparation stricte du terrain et délégation totale des calculs au système.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Rappel Règle d'or */}
        <div
          style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '12px',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '13.5px'
          }}
        >
          <span style={{ fontSize: '22px' }}>🎯</span>
          <div>
            <strong style={{ color: 'var(--amber-light)' }}>Objectif Mathématique :</strong> Pour atteindre le zéro manquant, il faut éliminer toute incertitude humaine. Un sac scellé = 25 pains vérifiés. Un seul livreur dans le sas à la fois. Les calculs financiers sont calculés à 100% par l'application.
          </div>
        </div>

        {/* Grille des 4 Piliers Opérationnels */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '16px' }}>

          {/* Pilier 1 : Organisation Physique */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: '14px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--amber-light)' }}>
                <Lock size={18} />
              </div>
              <h4 style={{ fontSize: '15px', color: '#fff', margin: 0, fontWeight: 700 }}>
                1. L'Organisation Physique (Le Terrain)
              </h4>
            </div>

            <div style={{ fontSize: '12.5px', color: 'var(--flour-white)', display: 'flex', flexDirection: 'column', gap: '8px', lineHeight: 1.5 }}>
              <div>
                <strong style={{ color: 'var(--amber-light)' }}>• La zone de quarantaine :</strong> Délimite un espace exclusif pour les sacs validés et scellés. Personne d'autre que toi ne doit y avoir accès.
              </div>
              <div>
                <strong style={{ color: 'var(--amber-light)' }}>• L'anti-sèche visuelle :</strong> Utilise le tableau de conversion direct (1 sac = 25 pains, 6 = 150) sur ton écran pour annuler toute charge mentale lors des pics de rush.
              </div>
              <div>
                <strong style={{ color: 'var(--amber-light)' }}>• Sanctuarisation du chargement :</strong> Règle du « Un par Un ». Aucun autre livreur ne pénètre dans le sas tant que le précédent n'a pas validé sa transaction.
              </div>
            </div>
          </div>

          {/* Pilier 2 : Contrôle de la Production */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              borderRadius: '14px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
                <Scale size={18} />
              </div>
              <h4 style={{ fontSize: '15px', color: '#fff', margin: 0, fontWeight: 700 }}>
                2. Le Contrôle de la Production (Les Intrants)
              </h4>
            </div>

            <div style={{ fontSize: '12.5px', color: 'var(--flour-white)', display: 'flex', flexDirection: 'column', gap: '8px', lineHeight: 1.5 }}>
              <div>
                <strong style={{ color: '#93c5fd' }}>• Traçabilité de la farine :</strong> Note chaque sac de farine utilisé dès son ouverture au fournil.
              </div>
              <div>
                <strong style={{ color: '#93c5fd' }}>• Quota strict 400 pâtons :</strong> Chaque sac de 50 kg produit exactement 20 pâtes divisées en 20 = 400 pâtons théoriques.
              </div>
              <div>
                <strong style={{ color: '#93c5fd' }}>• Comptabilité de la démarque :</strong> Compte immédiatement les pains brûlés ou cassés à la sortie du four. C'est la seule justification valable de l'écart avec les 400 vendables.
              </div>
            </div>
          </div>

          {/* Pilier 3 : Verrouillage de la Distribution */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '14px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
                <Package size={18} />
              </div>
              <h4 style={{ fontSize: '15px', color: '#fff', margin: 0, fontWeight: 700 }}>
                3. Le Verrouillage de la Distribution (Sorties)
              </h4>
            </div>

            <div style={{ fontSize: '12.5px', color: 'var(--flour-white)', display: 'flex', flexDirection: 'column', gap: '8px', lineHeight: 1.5 }}>
              <div>
                <strong style={{ color: '#34d399' }}>• La règle des 25 :</strong> Ne te fie jamais aux estimations. Chaque sac d'expédition doit être scellé avec très exactement 25 pains cuits.
              </div>
              <div>
                <strong style={{ color: '#34d399' }}>• Le scellement immédiat :</strong> Ferme physiquement chaque sac dès que le compte est bon pour rendre impossible tout siphonnage discret.
              </div>
              <div>
                <strong style={{ color: '#34d399' }}>• Séparation stricte des canaux :</strong>
                <ul style={{ paddingLeft: '16px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <li>🚚 <strong>Livreurs Officiels :</strong> 110 FCFA / pain</li>
                  <li>🏬 <strong>Section ADJARA (Grossistes) :</strong> 110 FCFA / pain</li>
                  <li>🛒 <strong>Guichet Comptoir :</strong> 150 FCFA / pain</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Pilier 4 : Le Filet Numérique */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              borderRadius: '14px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c4b5fd' }}>
                <Camera size={18} />
              </div>
              <h4 style={{ fontSize: '15px', color: '#fff', margin: 0, fontWeight: 700 }}>
                4. Le Filet Numérique (Automatisation)
              </h4>
            </div>

            <div style={{ fontSize: '12.5px', color: 'var(--flour-white)', display: 'flex', flexDirection: 'column', gap: '8px', lineHeight: 1.5 }}>
              <div>
                <strong style={{ color: '#c4b5fd' }}>• Saisie minimaliste :</strong> N'entre jamais le total de tête. Tape uniquement le nombre de sacs scellés (+ éventuel vrac).
              </div>
              <div>
                <strong style={{ color: '#c4b5fd' }}>• Preuve photographique :</strong> Capture une photo globale du chargement pour créer une preuve horodatée et infalsifiable.
              </div>
              <div>
                <strong style={{ color: '#c4b5fd' }}>• Calcul automatisé FCFA :</strong> Le système multiplie immédiatement les pains par 110 F ou 150 F pour donner la recette exacte à l'encaissement.
              </div>
            </div>
          </div>

        </div>

        {/* Checklist Opérationnelle Interactive de Poste */}
        <div
          style={{
            background: 'rgba(11, 15, 25, 0.95)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '14px',
            padding: '16px 20px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h4 style={{ fontSize: '14px', color: 'var(--amber-light)', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} />
              <span>Checklist de Contrôle du Poste (À cocher physiquement) :</span>
            </h4>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
              Validation des 6 verrous de sécurité
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px' }}>
            {[
              { key: 'quarantineEnforced', label: 'Zone de quarantaine délimitée & protégée' },
              { key: 'antiSecheDisplayed', label: 'Anti-sèche 1 sac = 25 pains activée' },
              { key: 'oneByOneSanctified', label: 'Sas de chargement « Un par Un » sanctuarisé' },
              { key: 'bagsSealed25', label: 'Chaque sac vérifié à 25 pains et scellé' },
              { key: 'channelsSeparated', label: 'Canaux Livreurs (110 F) / ADJARA (110 F) / Guichet (150 F) scindés' },
              { key: 'photoProofRequired', label: 'Preuve photo du chargement exigée' }
            ].map((item) => {
              const k = item.key as keyof ShiftState['protocolChecklist'];
              const isChecked = checklist[k] ?? false;

              return (
                <div
                  key={item.key}
                  onClick={() => onToggleChecklist && onToggleChecklist(k)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    background: isChecked ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    border: isChecked ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    cursor: onToggleChecklist ? 'pointer' : 'default',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '5px',
                      background: isChecked ? '#10b981' : 'transparent',
                      border: isChecked ? 'none' : '1px solid #64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#000',
                      flexShrink: 0
                    }}
                  >
                    {isChecked && <CheckCircle2 size={13} color="#fff" />}
                  </div>
                  <span style={{ fontSize: '12px', color: isChecked ? '#fff' : 'var(--text-muted)', fontWeight: isChecked ? 600 : 400 }}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Boutons d'accès direct */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', paddingTop: '6px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {onNavigateToFlour && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  onNavigateToFlour();
                  onClose();
                }}
                style={{ fontSize: '13px' }}
              >
                <span>🌾 Suivi Farine & Démarque</span>
              </button>
            )}
            {onNavigateToDispatch && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  onNavigateToDispatch();
                  onClose();
                }}
                style={{ fontSize: '13px' }}
              >
                <span>🚚 Aller à l'Émargement Sécurisé</span>
                <ArrowRight size={15} />
              </button>
            )}
          </div>

          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Fermer le Protocole
          </button>
        </div>

      </div>
    </div>
  );
};
