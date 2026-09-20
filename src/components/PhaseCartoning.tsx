import React, { useState } from 'react';
import { ShiftState, ShiftPhase } from '../wat/types';
import { WORKFLOW_PHASES_CONFIG } from '../wat/workflow';
import { computeProductionPlan } from '../wat/tools';
import {
  Box,
  Trash2,
  ArrowRight,
  Clock,
  Layers,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Store,
  Sparkles,
  Flame
} from 'lucide-react';

interface PhaseCartoningProps {
  state: ShiftState;
  onAddCartonDump: (cartonsCount: number, notes?: string) => void;
  onDeleteCartonDump: (id: string) => void;
  onAdvanceToPhase3: () => void;
}

export const PhaseCartoning: React.FC<PhaseCartoningProps> = ({
  state,
  onAddCartonDump,
  onDeleteCartonDump,
  onAdvanceToPhase3
}) => {
  const config = WORKFLOW_PHASES_CONFIG[ShiftPhase.PHASE_2_CARTONING];
  const [cartonsPerCart, setCartonsPerCart] = useState<number>(4); // ~4 cartons par chariot
  const [lastAddedFeedback, setLastAddedFeedback] = useState<string | null>(null);

  // Calcul du plan global de la journée
  const plan = computeProductionPlan(state);
  const totalDumps = (state?.cartonDumps || []).length;
  const targetDriverCarts = plan.maxDriverAllowedCarts; // ex: 16 chariots pour 9 sacs
  const totalDayCarts = plan.expectedCartsTotal; // ex: 18 chariots pour 9 sacs
  const totalCartons = (state?.cartonDumps || []).reduce((acc, c) => acc + (c.cartonCount || 0), 0);
  const loavesCartoned = totalDumps * 180;

  // Calculs de progression
  const cartoningPct = Math.min(100, Math.round((totalDumps / (targetDriverCarts || 1)) * 100));
  const totalDayPct = Math.min(100, Math.round((totalDumps / (totalDayCarts || 1)) * 100));
  const remainingForDrivers = Math.max(0, targetDriverCarts - totalDumps);

  const handleAddDumpWithFeedback = () => {
    onAddCartonDump(cartonsPerCart, `Versé dans ~${cartonsPerCart} cartons`);
    const nextDumpNum = totalDumps + 1;
    const nextRemaining = Math.max(0, targetDriverCarts - nextDumpNum);
    const feedbackMsg = nextDumpNum >= targetDriverCarts
      ? `🎯 Chariot #${nextDumpNum} versé ! Quota livreurs atteint (16/16) ! Laissez les 2 derniers chariots pour la boutique.`
      : `✅ Chariot #${nextDumpNum} versé ! Reste ${nextRemaining} chariot${nextRemaining > 1 ? 's' : ''} à cartonner pour les livreurs.`;
    
    setLastAddedFeedback(feedbackMsg);
    setTimeout(() => {
      setLastAddedFeedback(null);
    }, 4500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* En-tête de Phase */}
      <div className="glass-card" style={{ borderLeft: '4px solid var(--purple)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Box size={24} color="var(--purple)" />
            <div>
              <h2 style={{ fontSize: '18px', color: '#fff', margin: 0 }}>{config.title}</h2>
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Objectif Journée : <strong>{plan.targetFlourBags} sacs de farine</strong> ({totalDayCarts} chariots totaux, dont {targetDriverCarts} pour les livreurs)
              </div>
            </div>
            <span className="badge badge-purple">{config.timeTarget}</span>
          </div>

          <button
            className="btn btn-primary"
            onClick={onAdvanceToPhase3}
            style={{ fontSize: '13px' }}
          >
            <span>Passer à la Phase 3 : Dispatch Livreurs (03h30)</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Citation de la note vocale */}
        <div style={{
          background: 'rgba(139, 92, 246, 0.08)',
          border: '1px dashed rgba(139, 92, 246, 0.35)',
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '13px',
          fontStyle: 'italic',
          color: '#ede9fe',
          marginTop: '14px',
          lineHeight: '1.5'
        }}>
          « Arrivé à un moment donné <strong>à partir de minuit là</strong>, ils vont commencer à mettre le pain dans le carton.
          Parce qu'ils auront besoin de leurs chariots pour y mettre d'autres trucs encore dedans.
          Donc s'ils versent un chariot, <strong>tu notes 1</strong>. Quand ils vont verser deuxième chariot, <strong>tu notes 2</strong>...
          Genre chaque chariot qui va sortir là, tu notes, tu notes. »
        </div>
      </div>

      {/* ========================================================
          1. JAUGES DE PROGRESSION VERS LA PRODUCTION TOTALE DU JOUR
          ======================================================== */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(15, 23, 42, 0.95) 100%)',
        border: '2px solid rgba(139, 92, 246, 0.45)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <TrendingUp size={22} color="#c084fc" />
            <div>
              <h3 style={{ fontSize: '17px', color: '#fff', margin: 0, fontWeight: 700 }}>
                Progression du Cartonnage vs Production du Jour
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Suivez en direct l'approche du quota de distribution (16 chariots) et de la production totale (18 chariots).
              </p>
            </div>
          </div>

          {/* Badge d'état intelligent */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {totalDumps < 8 && (
              <span style={{
                background: 'rgba(59, 130, 246, 0.2)',
                color: '#60a5fa',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                borderRadius: '20px',
                padding: '4px 12px',
                fontSize: '12.5px',
                fontWeight: 700
              }}>
                ⏳ Début du cartonnage ({totalDumps} / {targetDriverCarts})
              </span>
            )}
            {totalDumps >= 8 && totalDumps < 14 && (
              <span style={{
                background: 'rgba(245, 158, 11, 0.2)',
                color: 'var(--amber-light)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                borderRadius: '20px',
                padding: '4px 12px',
                fontSize: '12.5px',
                fontWeight: 700
              }}>
                ⚡ En bonne voie ({cartoningPct}%) : {remainingForDrivers} restants
              </span>
            )}
            {totalDumps >= 14 && totalDumps < targetDriverCarts && (
              <span style={{
                background: 'rgba(249, 115, 22, 0.25)',
                color: '#fb923c',
                border: '1px solid rgba(249, 115, 22, 0.5)',
                borderRadius: '20px',
                padding: '4px 12px',
                fontSize: '12.5px',
                fontWeight: 800,
                animation: 'pulse 1.5s infinite'
              }}>
                🔥 PROCHE DU QUOTA TOTAL : Plus que {remainingForDrivers} chariot{remainingForDrivers > 1 ? 's' : ''} !
              </span>
            )}
            {totalDumps === targetDriverCarts && (
              <span style={{
                background: 'rgba(16, 185, 129, 0.25)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.5)',
                borderRadius: '20px',
                padding: '4px 12px',
                fontSize: '12.5px',
                fontWeight: 800
              }}>
                🎯 QUOTA LIVREURS ATTEINT (16/16)
              </span>
            )}
            {totalDumps > targetDriverCarts && (
              <span style={{
                background: 'rgba(239, 68, 68, 0.25)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.5)',
                borderRadius: '20px',
                padding: '4px 12px',
                fontSize: '12.5px',
                fontWeight: 800
              }}>
                🚨 ALERTE : Dépassement réserve boutique !
              </span>
            )}
          </div>
        </div>

        {/* Barre de progression avec marqueur de réserve boutique */}
        <div style={{ marginTop: '10px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
            <span>Conditionné : <strong>{totalDumps} chariots</strong> ({loavesCartoned.toLocaleString()} pains)</span>
            <span>
              Cible Livreurs : <strong style={{ color: '#c084fc' }}>{targetDriverCarts} ch.</strong> | Total Jour : <strong style={{ color: '#fff' }}>{totalDayCarts} ch.</strong>
            </span>
          </div>

          <div style={{
            position: 'relative',
            width: '100%',
            height: '18px',
            background: 'rgba(0,0,0,0.45)',
            borderRadius: '999px',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            {/* Zone de progression active */}
            <div style={{
              height: '100%',
              width: `${Math.min(100, (totalDumps / totalDayCarts) * 100)}%`,
              background: totalDumps >= targetDriverCarts
                ? 'linear-gradient(90deg, #8b5cf6 0%, #10b981 100%)'
                : 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 70%, #d946ef 100%)',
              transition: 'width 0.35s ease',
              borderRadius: '999px'
            }} />

            {/* Ligne repère pour la limite livreurs (ex: 16/18 = 88.8%) */}
            <div style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: `${(targetDriverCarts / totalDayCarts) * 100}%`,
              width: '3px',
              background: '#fbbf24',
              boxShadow: '0 0 6px #fbbf24',
              zIndex: 2
            }} title={`Limite des livreurs (${targetDriverCarts} chariots)`} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '6px' }}>
            <span style={{ color: '#c084fc', fontWeight: 600 }}>
              {cartoningPct}% du quota de distribution conditionné
            </span>
            <span style={{ color: 'var(--amber-light)', fontWeight: 600 }}>
              📍 Marqueur doré = Limite 16 chariots (les 2 derniers restent pour la boutique)
            </span>
          </div>
        </div>

        {/* Feedback interactif après clic */}
        {lastAddedFeedback && (
          <div style={{
            marginTop: '14px',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '10px',
            padding: '10px 14px',
            fontSize: '13px',
            color: '#34d399',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'fadeIn 0.25s ease'
          }}>
            <CheckCircle2 size={16} />
            <span>{lastAddedFeedback}</span>
          </div>
        )}

        {/* Grille des 4 métriques de progression */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginTop: '16px'
        }}>
          {/* Métrique 1 : Chariots Versés vs Cible */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.75)',
            padding: '12px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Chariots Versés en Cartons :</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
              <span style={{ fontSize: '26px', fontWeight: 800, color: '#c084fc' }}>
                {totalDumps}
              </span>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                / {targetDriverCarts} livreurs
              </span>
            </div>
            <div style={{ fontSize: '11px', color: remainingForDrivers === 0 ? '#34d399' : 'var(--amber-light)', marginTop: '4px', fontWeight: 600 }}>
              {remainingForDrivers === 0
                ? '✅ Quota livreurs complet'
                : `⏳ Plus que ${remainingForDrivers} chariot${remainingForDrivers > 1 ? 's' : ''} à verser`}
            </div>
          </div>

          {/* Métrique 2 : Pains Conditionnés */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.75)',
            padding: '12px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Pains Vendables en Cartons :</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
              <span style={{ fontSize: '26px', fontWeight: 800, color: '#34d399' }}>
                {loavesCartoned.toLocaleString()}
              </span>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                / {plan.maxDriverAllowedLoaves.toLocaleString()} pains
              </span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Base 180 vendables par chariot
            </div>
          </div>

          {/* Métrique 3 : Cartons Physiques Remplis */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.75)',
            padding: '12px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Cartons de Pain Prêts :</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
              <span style={{ fontSize: '26px', fontWeight: 800, color: 'var(--amber-light)' }}>
                {totalCartons}
              </span>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                cartons
              </span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Moyenne ~4 cartons par chariot
            </div>
          </div>

          {/* Métrique 4 : Réserve Boutique Protégée */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.75)',
            padding: '12px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={13} color="#f472b6" />
              <span>Réserve Boutique (06h) :</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
              <span style={{ fontSize: '26px', fontWeight: 800, color: '#f472b6' }}>
                {plan.morningStoreReservedCarts}
              </span>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                chariots ({plan.morningStoreReservedLoaves} pains)
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#f472b6', marginTop: '4px', fontWeight: 600 }}>
              🔒 Réservés comptoir du matin
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. BOUTON D'ACTION PRINCIPAL : +1 CHARIOT VERSÉ
          ======================================================== */}
      <div className="glass-card" style={{
        textAlign: 'center',
        padding: '28px 20px',
        border: '1px solid rgba(139, 92, 246, 0.3)'
      }}>
        <div style={{ maxWidth: '520px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div>
            <span style={{
              background: 'rgba(139, 92, 246, 0.2)',
              color: '#c084fc',
              padding: '4px 12px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 700
            }}>
              POINTAGE MINUIT EN 1 CLIC
            </span>
            <h3 style={{ fontSize: '20px', color: '#fff', margin: '8px 0 4px 0', fontWeight: 800 }}>
              Verser Chariot #{totalDumps + 1}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
              Dès qu'un chariot est dépoté dans les cartons, appuyez sur le bouton ci-dessous pour incrémenter la progression en direct.
            </p>
          </div>

          <button
            className="btn btn-primary btn-large pulse-highlight"
            onClick={handleAddDumpWithFeedback}
            style={{
              padding: '20px 28px',
              fontSize: '17px',
              fontWeight: 800,
              background: totalDumps >= targetDriverCarts
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
              color: '#fff',
              border: 'none',
              boxShadow: '0 8px 30px rgba(139, 92, 246, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            <Box size={24} />
            <span>+1 Chariot Versé dans les Cartons (Chariot #{totalDumps + 1})</span>
          </button>

          {/* Nombre de cartons générés */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            background: 'rgba(0,0,0,0.3)',
            padding: '8px 14px',
            borderRadius: '8px',
            width: 'fit-content',
            margin: '0 auto'
          }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Cartons remplis par ce chariot :</span>
            <input
              type="number"
              min={1}
              max={10}
              className="form-input"
              value={cartonsPerCart}
              onChange={(e) => setCartonsPerCart(parseInt(e.target.value) || 1)}
              style={{ width: '65px', textAlign: 'center', fontFamily: 'var(--font-mono)', padding: '4px', fontWeight: 700 }}
            />
          </div>

          {/* Règle d'arrêt des 16 chariots */}
          {totalDumps >= targetDriverCarts - 2 && (
            <div style={{
              background: totalDumps >= targetDriverCarts ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              border: `1px solid ${totalDumps >= targetDriverCarts ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '12.5px',
              color: totalDumps >= targetDriverCarts ? '#34d399' : '#fef3c7',
              textAlign: 'left'
            }}>
              {totalDumps >= targetDriverCarts ? (
                <span>
                  🛑 <strong>Cartonnage Terminé :</strong> Les 16 chariots nécessaires pour les livreurs ont été versés ({loavesCartoned} pains).
                  <strong> Ne versez plus de chariots en cartons</strong> : les 2 chariots restants sont réservés pour la vente en boutique au matin !
                </span>
              ) : (
                <span>
                  ⚠️ <strong>Proximité du Quota :</strong> Il ne reste plus que <strong>{remainingForDrivers} chariot(s)</strong> à verser pour atteindre les 16 chariots de distribution.
                </span>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ========================================================
          3. TABLEAU HISTORIQUE DU DÉPOTAGE
          ======================================================== */}
      {state.cartonDumps.length > 0 && (
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h4 style={{ fontSize: '15px', color: '#fff', margin: 0 }}>
              Journal des Chariots Dépotés (Minuit) :
            </h4>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {totalDumps} chariot{totalDumps > 1 ? 's' : ''} dépoté{totalDumps > 1 ? 's' : ''} • {totalCartons} cartons remplis
            </span>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Séquence</th>
                  <th>Heure de Versement</th>
                  <th>Cartons Produits</th>
                  <th>Pains Équivalents</th>
                  <th>Notes</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {state.cartonDumps.map((dump) => (
                  <tr key={dump.id}>
                    <td style={{ fontWeight: 700, color: 'var(--purple)' }}>
                      Chariot #{dump.cartSequenceNumber}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{dump.timestamp}</td>
                    <td style={{ fontWeight: 600 }}>{dump.cartonCount} cartons</td>
                    <td style={{ color: 'var(--amber-light)', fontWeight: 600 }}>~180 pains</td>
                    <td style={{ color: 'var(--text-muted)' }}>{dump.notes || 'Versé conforme'}</td>
                    <td>
                      <button
                        onClick={() => onDeleteCartonDump(dump.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                        title="Supprimer cette saisie"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
