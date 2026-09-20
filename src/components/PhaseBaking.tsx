import React, { useState } from 'react';
import { ShiftState, ShiftPhase } from '../wat/types';
import { WORKFLOW_PHASES_CONFIG } from '../wat/workflow';
import { computeProductionPlan } from '../wat/tools';
import {
  Flame,
  Plus,
  Trash2,
  ArrowRight,
  ShoppingBag,
  Layers,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Store,
  Truck,
  TrendingUp
} from 'lucide-react';

interface PhaseBakingProps {
  state: ShiftState;
  onUpdateTargetFlourBags: (count: number) => void;
  onAddFlourBag: (loaves: number, notes?: string) => void;
  onDeleteFlourBag: (id: string) => void;
  onAddCart: (loavesCount: number, physicalCapacity?: number) => void;
  onDeleteCart: (id: string) => void;
  onAdvanceToPhase2: () => void;
}

export const PhaseBaking: React.FC<PhaseBakingProps> = ({
  state,
  onUpdateTargetFlourBags,
  onAddFlourBag,
  onDeleteFlourBag,
  onAddCart,
  onDeleteCart,
  onAdvanceToPhase2
}) => {
  const config = WORKFLOW_PHASES_CONFIG[ShiftPhase.PHASE_1_BAKING];
  
  // Calcul automatique complet déduit de la cible de sacs
  const plan = computeProductionPlan(state);

  const [loavesInput, setLoavesInput] = useState<number>(400); // 400 pains par sac selon note vocale
  const [cartLoavesInput, setCartLoavesInput] = useState<number>(180); // 180 pains vendables standard terrain
  const [cartPhysicalCapacity, setCartPhysicalCapacity] = useState<number>(200); // 200 physique brut

  const totalBags = (state?.flourBags || []).length;
  const totalLoaves = (state?.flourBags || []).reduce((acc, b) => acc + (b.actualLoaves || 0), 0);
  const totalCarts = (state?.carts || []).length;
  const avgYield = totalBags > 0 ? Math.round(totalLoaves / totalBags) : 0;

  const quickBagOptions = [6, 8, 9, 10, 12, 15];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* En-tête de Phase */}
      <div className="glass-card" style={{ borderLeft: '4px solid var(--amber-primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Flame size={24} color="var(--amber-light)" />
            <div>
              <h2 style={{ fontSize: '18px', color: '#fff', margin: 0 }}>{config.title}</h2>
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Suivi mathématique automatisé de la farine et des chariots
              </div>
            </div>
            <span className="badge badge-amber">{config.timeTarget}</span>
          </div>

          <button
            className="btn btn-primary"
            onClick={onAdvanceToPhase2}
            style={{ fontSize: '13px' }}
          >
            <span>Passer à la Phase 2 : Cartonnage (Minuit)</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Citation de la note vocale */}
        <div style={{
          background: 'rgba(245, 158, 11, 0.08)',
          border: '1px dashed rgba(245, 158, 11, 0.35)',
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '13px',
          fontStyle: 'italic',
          color: '#fef3c7',
          marginTop: '14px',
          lineHeight: '1.5'
        }}>
          « À chaque fois qu'ils vont faire un sac là, tu notes, tu notes. Et puis les pains. Maintenant s'ils ont fait un sac là,
          si les pains sont sortis là, <strong>si ça sort 400, tu notes</strong>. Tu notes le nombre de chariots qu'ils ont fait. »
        </div>
      </div>

      {/* ========================================================
          1. CONFIGURATION CENTRALE DU JOUR : NOMBRE DE SACS DE FARINE
          ======================================================== */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(15, 23, 42, 0.95) 100%)',
        border: '2px solid rgba(245, 158, 11, 0.4)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--amber-primary) 0%, #b45309 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000'
            }}>
              <Calculator size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', color: '#fff', margin: 0, fontWeight: 700 }}>
                Objectif de Farine pour ce Shift
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Indiquez simplement le nombre de sacs : PaniTrack calcule automatiquement tous les quotas et les restants.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Cible active :</span>
            <span style={{
              background: 'var(--amber-primary)',
              color: '#000',
              fontWeight: 800,
              fontSize: '15px',
              padding: '4px 12px',
              borderRadius: '20px'
            }}>
              {plan.targetFlourBags} SACS
            </span>
          </div>
        </div>

        {/* Sélecteur tactile & boutons rapides */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          background: 'rgba(0,0,0,0.35)',
          padding: '12px 16px',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.06)'
        }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--flour-white)', minWidth: '150px' }}>
            Sacs prévus aujourd'hui :
          </label>

          {/* Stepper direct */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              className="btn btn-secondary"
              onClick={() => onUpdateTargetFlourBags(Math.max(1, plan.targetFlourBags - 1))}
              style={{ width: '36px', height: '36px', padding: 0, fontSize: '18px', fontWeight: 800 }}
              title="Diminuer d'un sac"
            >
              -
            </button>
            <input
              type="number"
              min={1}
              max={50}
              value={plan.targetFlourBags}
              onChange={(e) => onUpdateTargetFlourBags(parseInt(e.target.value) || 1)}
              style={{
                width: '75px',
                textAlign: 'center',
                fontSize: '17px',
                fontWeight: 800,
                color: 'var(--amber-light)',
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid var(--amber-primary)',
                borderRadius: '8px',
                padding: '6px'
              }}
            />
            <button
              className="btn btn-secondary"
              onClick={() => onUpdateTargetFlourBags(plan.targetFlourBags + 1)}
              style={{ width: '36px', height: '36px', padding: 0, fontSize: '18px', fontWeight: 800 }}
              title="Ajouter un sac"
            >
              +
            </button>
          </div>

          {/* Boutons d'accès rapide */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginLeft: 'auto' }}>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Préréglages rapides :</span>
            {quickBagOptions.map((n) => (
              <button
                key={n}
                onClick={() => onUpdateTargetFlourBags(n)}
                style={{
                  background: plan.targetFlourBags === n ? 'var(--amber-primary)' : 'rgba(255,255,255,0.06)',
                  color: plan.targetFlourBags === n ? '#000' : 'var(--flour-white)',
                  border: plan.targetFlourBags === n ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  fontWeight: plan.targetFlourBags === n ? 700 : 500,
                  fontSize: '12px',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {n === 9 ? '⭐ 9 sacs (Standard)' : `${n} sacs`}
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================
            2. GRILLE DES VALEURS CALCULÉES AUTOMATIQUEMENT
            ======================================================== */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginTop: '16px'
        }}>
          {/* Card 1 : Chariots Attendus */}
          <div style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '10px',
            padding: '12px'
          }}>
            <div style={{ fontSize: '11.5px', color: 'var(--amber-light)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={14} />
              <span>CHARIOTS ATTENDUS</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
              {plan.expectedCartsTotal} <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>chariots</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {plan.targetFlourBags} sacs × 2 chariots
            </div>
          </div>

          {/* Card 2 : Pains Vendables Minimum */}
          <div style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: '10px',
            padding: '12px'
          }}>
            <div style={{ fontSize: '11.5px', color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={14} />
              <span>NET À VENDRE (180/CH.)</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>
              {plan.expectedNetLoaves.toLocaleString()} <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>pains</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Au moins {plan.expectedNetLoaves} pains facturés
            </div>
          </div>

          {/* Card 3 : Pains Bruts Physiques */}
          <div style={{
            background: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            borderRadius: '10px',
            padding: '12px'
          }}>
            <div style={{ fontSize: '11.5px', color: '#60a5fa', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Flame size={14} />
              <span>PAINS BRUTS (400/SAC)</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
              {plan.expectedGrossLoaves.toLocaleString()} <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>pains</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {plan.expectedCartsTotal} ch. × 200 capacité brute
            </div>
          </div>

          {/* Card 4 : Marge Casse Tampon (+20) */}
          <div style={{
            background: 'rgba(168, 85, 247, 0.08)',
            border: '1px solid rgba(168, 85, 247, 0.25)',
            borderRadius: '10px',
            padding: '12px'
          }}>
            <div style={{ fontSize: '11.5px', color: '#c084fc', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} />
              <span>TAMPON CASSE (+20)</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#c084fc', marginTop: '4px' }}>
              +{plan.lossToleranceLoaves} <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>pains</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Équivaut à 2 chariots de sécurité
            </div>
          </div>

          {/* Card 5 : Réserve Boutique Matin */}
          <div style={{
            background: 'rgba(236, 72, 153, 0.08)',
            border: '1px solid rgba(236, 72, 153, 0.25)',
            borderRadius: '10px',
            padding: '12px'
          }}>
            <div style={{ fontSize: '11.5px', color: '#f472b6', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Store size={14} />
              <span>RÉSERVE BOUTIQUE MATIN</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
              {plan.morningStoreReservedCarts} <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>chariots</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Soit {plan.morningStoreReservedLoaves} pains réservés comptoir
            </div>
          </div>

          {/* Card 6 : Quota Livreurs Max */}
          <div style={{
            background: 'rgba(249, 115, 22, 0.08)',
            border: '1px solid rgba(249, 115, 22, 0.25)',
            borderRadius: '10px',
            padding: '12px'
          }}>
            <div style={{ fontSize: '11.5px', color: '#fb923c', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Truck size={14} />
              <span>ALLOUÉ LIVREURS MAX</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#fb923c', marginTop: '4px' }}>
              {plan.maxDriverAllowedCarts} <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>chariots</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Max {plan.maxDriverAllowedLoaves.toLocaleString()} pains vendables
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. TABLEAU DE BORD DE SUIVI DE PRODUCTION EN DIRECT
          ======================================================== */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <TrendingUp size={20} color="var(--amber-light)" />
            <h3 style={{ fontSize: '16px', color: '#fff', margin: 0, fontWeight: 700 }}>
              Suivi à la Lettre : Réalisé vs Restant
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Avancement Cuisson :</span>
            <span style={{
              fontSize: '13px',
              fontWeight: 800,
              color: plan.bakingProgressPercentage >= 100 ? '#34d399' : 'var(--amber-light)',
              background: 'rgba(0,0,0,0.4)',
              padding: '3px 10px',
              borderRadius: '8px'
            }}>
              {plan.bakingProgressPercentage}%
            </span>
          </div>
        </div>

        {/* Barre de progression visuelle */}
        <div style={{
          width: '100%',
          height: '10px',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '999px',
          overflow: 'hidden',
          marginBottom: '18px'
        }}>
          <div style={{
            height: '100%',
            width: `${plan.bakingProgressPercentage}%`,
            background: plan.bakingProgressPercentage >= 100
              ? 'linear-gradient(90deg, #10b981 0%, #34d399 100%)'
              : 'linear-gradient(90deg, var(--amber-primary) 0%, #f97316 100%)',
            transition: 'width 0.4s ease'
          }} />
        </div>

        {/* Cartes métriques de suivi "Restants" */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '14px'
        }}>
          {/* Suivi Chariots Cuits vs Restants */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            padding: '14px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Chariots de Cuisson :</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
              <span style={{ fontSize: '26px', fontWeight: 800, color: 'var(--amber-light)' }}>
                {plan.actualCartsBaked}
              </span>
              <span style={{ fontSize: '15px', color: 'var(--text-muted)' }}>
                / {plan.expectedCartsTotal} prévus
              </span>
            </div>
            <div style={{
              marginTop: '8px',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '11.5px',
              fontWeight: 600,
              background: plan.remainingCartsToBake === 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              color: plan.remainingCartsToBake === 0 ? '#34d399' : 'var(--amber-light)',
              display: 'inline-block'
            }}>
              {plan.remainingCartsToBake === 0
                ? '✅ Tous les chariots sont cuits !'
                : `⏳ Reste ${plan.remainingCartsToBake} chariot${plan.remainingCartsToBake > 1 ? 's' : ''} à cuire`}
            </div>
          </div>

          {/* Suivi Sacs Pétris vs Restants */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            padding: '14px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Sacs de Farine Pétris :</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
              <span style={{ fontSize: '26px', fontWeight: 800, color: '#60a5fa' }}>
                {plan.actualBagsUsed}
              </span>
              <span style={{ fontSize: '15px', color: 'var(--text-muted)' }}>
                / {plan.targetFlourBags} prévus
              </span>
            </div>
            <div style={{
              marginTop: '8px',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '11.5px',
              fontWeight: 600,
              background: plan.remainingBagsToKnead === 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
              color: plan.remainingBagsToKnead === 0 ? '#34d399' : '#60a5fa',
              display: 'inline-block'
            }}>
              {plan.remainingBagsToKnead === 0
                ? '✅ Tous les sacs sont pétris !'
                : `⏳ Reste ${plan.remainingBagsToKnead} sac${plan.remainingBagsToKnead > 1 ? 's' : ''} à pétrir`}
            </div>
          </div>

          {/* Chariots Physiques en Attente au Fournil */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            padding: '14px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Chariots Présents au Fournil :</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
              <span style={{ fontSize: '26px', fontWeight: 800, color: '#c084fc' }}>
                {plan.physicalCartsInBakeryWaiting}
              </span>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                chariot{plan.physicalCartsInBakeryWaiting > 1 ? 's' : ''} pleins
              </span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
              {plan.actualCartsBaked} sortis - {plan.actualCartsCartoned} versés cartons
            </div>
          </div>

          {/* Dépotage Minuit Cartons */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            padding: '14px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Versés en Cartons (Minuit) :</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
              <span style={{ fontSize: '26px', fontWeight: 800, color: '#34d399' }}>
                {plan.actualCartsCartoned}
              </span>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                chariots dépotés
              </span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
              {plan.remainingCartsToCarton > 0 ? `${plan.remainingCartsToCarton} à verser en cartons` : 'À jour'}
            </div>
          </div>
        </div>

        {/* Message d'aide en temps réel */}
        <div style={{
          marginTop: '16px',
          background: 'rgba(245, 158, 11, 0.07)',
          borderLeft: '3px solid var(--amber-primary)',
          padding: '10px 14px',
          borderRadius: '0 8px 8px 0',
          fontSize: '12.5px',
          color: '#fef3c7',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>
            💡 <strong>Règle du matin :</strong> Sur les {plan.expectedCartsTotal} chariots prévus,
            gardez toujours au moins <strong>2 chariots intacts ({plan.morningStoreReservedLoaves} pains)</strong> pour le comptoir de vente du matin.
            Les livreurs ne peuvent pas dépasser <strong>{plan.maxDriverAllowedCarts} chariots ({plan.maxDriverAllowedLoaves.toLocaleString()} pains)</strong>.
          </span>
        </div>
      </div>

      {/* ========================================================
          4. MODULES DE SAISIE TERRAIN : SACS & CHARIOTS
          ======================================================== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* Module Saisie Sac de Farine */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '16px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <ShoppingBag size={18} color="var(--amber-light)" />
              <span>Pointer un Sac de Farine</span>
            </h3>
            <span className="badge badge-amber">Sac #{totalBags + 1} sur {plan.targetFlourBags}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Nombre de pains sortis pour ce sac (standard = 400)</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="number"
                  className="form-input"
                  value={loavesInput}
                  onChange={(e) => setLoavesInput(parseInt(e.target.value) || 0)}
                  style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 700 }}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setLoavesInput(400)}
                  title="Réinitialiser au standard 400 pains"
                >
                  400 standard
                </button>
              </div>
            </div>

            <button
              className="btn btn-primary btn-large"
              onClick={() => {
                onAddFlourBag(loavesInput, `Sortie conforme (${loavesInput} pains)`);
              }}
              style={{ width: '100%' }}
            >
              <Plus size={20} />
              <span>Valider Sac #{totalBags + 1} (+{loavesInput} pains)</span>
            </button>
          </div>

          {/* Liste des sacs de farine enregistrés */}
          {state.flourBags.length > 0 && (
            <div style={{ marginTop: '16px', maxHeight: '180px', overflowY: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th># Sac</th>
                    <th>Heure</th>
                    <th>Pains</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {state.flourBags.map((bag) => (
                    <tr key={bag.id}>
                      <td style={{ fontWeight: 600 }}>Sac #{bag.bagIndex}</td>
                      <td>{bag.timestamp}</td>
                      <td style={{ color: 'var(--amber-light)', fontWeight: 700 }}>{bag.actualLoaves}</td>
                      <td>
                        <button
                          onClick={() => onDeleteFlourBag(bag.id)}
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
          )}
        </div>

        {/* Module Saisie Chariots de Cuisson */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '16px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Layers size={18} color="var(--purple)" />
              <span>Pointer un Chariot Sorti du Four</span>
            </h3>
            <span className="badge badge-purple">Chariot #{totalCarts + 1} sur {plan.expectedCartsTotal}</span>
          </div>

          {/* Bannière explicative 180 vs 200 */}
          <div style={{
            background: 'rgba(139, 92, 246, 0.12)',
            border: '1px solid rgba(139, 92, 246, 0.35)',
            borderRadius: '10px',
            padding: '10px 12px',
            fontSize: '12.5px',
            color: '#ede9fe',
            marginBottom: '14px',
            lineHeight: '1.4'
          }}>
            💡 <strong>Règle Validée :</strong> <strong>180 pains nets vendables</strong> par chariot.
            Les <strong>+20 pains</strong> restants (sur les 200 physiques) constituent la marge pour absorber la casse au fournil et lors des livraisons.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Base de comptabilisation du chariot :</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className={cartLoavesInput === 180 ? "btn btn-primary" : "btn btn-secondary"}
                  onClick={() => {
                    setCartLoavesInput(180);
                    setCartPhysicalCapacity(200);
                  }}
                  style={{ flex: 1, fontSize: '13px' }}
                >
                  ⭐ 180 Vendables (+20 Casse)
                </button>
                <button
                  type="button"
                  className={cartLoavesInput === 200 ? "btn btn-primary" : "btn btn-secondary"}
                  onClick={() => {
                    setCartLoavesInput(200);
                    setCartPhysicalCapacity(200);
                  }}
                  style={{ flex: 1, fontSize: '13px' }}
                >
                  200 Pains Bruts
                </button>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(15, 23, 42, 0.7)',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '12.5px'
            }}>
              <span>Compté vendable : <strong style={{ color: 'var(--amber-light)' }}>{cartLoavesInput}</strong></span>
              <span>Tampon casse : <strong style={{ color: '#c4b5fd' }}>+{cartPhysicalCapacity > cartLoavesInput ? cartPhysicalCapacity - cartLoavesInput : 0}</strong></span>
              <span>Total physique : <strong>{cartPhysicalCapacity}</strong></span>
            </div>

            <button
              className="btn btn-secondary btn-large"
              onClick={() => onAddCart(cartLoavesInput, cartPhysicalCapacity)}
              style={{ width: '100%', borderColor: 'rgba(139, 92, 246, 0.4)', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(109, 40, 217, 0.2) 100%)' }}
            >
              <Plus size={20} color="var(--purple)" />
              <span>Enregistrer Chariot #{totalCarts + 1} ({cartLoavesInput} vendables)</span>
            </button>
          </div>

          {/* Liste des Chariots enregistrés */}
          {state.carts.length > 0 && (
            <div style={{ marginTop: '16px', maxHeight: '180px', overflowY: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th># Chariot</th>
                    <th>Heure</th>
                    <th>Vendables</th>
                    <th>Tampon Casse</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {state.carts.map((cart) => (
                    <tr key={cart.id}>
                      <td style={{ fontWeight: 600 }}>Chariot #{cart.cartNumber}</td>
                      <td>{cart.timestamp}</td>
                      <td style={{ color: 'var(--amber-light)', fontWeight: 700 }}>{cart.loavesCount} pains</td>
                      <td style={{ color: '#c4b5fd' }}>+{cart.lossCompensationBuffer || 20}</td>
                      <td>
                        <button
                          onClick={() => onDeleteCart(cart.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                          title="Supprimer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
