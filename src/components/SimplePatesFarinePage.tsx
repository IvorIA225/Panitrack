import React, { useState } from 'react';
import { ShiftState } from '../wat/types';
import {
  ShoppingBag,
  Plus,
  Trash2,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Flame,
  Zap,
  Layers,
  ChevronDown,
  ChevronUp,
  Scale
} from 'lucide-react';

interface SimplePatesFarinePageProps {
  state: ShiftState;
  onAddFlourBag: (
    loaves: number,
    notes?: string,
    burned?: number,
    broken?: number,
    cart1?: number,
    cart2?: number,
    cart3?: number,
    patesCount?: number
  ) => void;
  onDeleteFlourBag: (id: string) => void;
  onNavigateToDrivers: () => void;
  onOpenProtocolModal?: () => void;
}

export const SimplePatesFarinePage: React.FC<SimplePatesFarinePageProps> = ({
  state,
  onAddFlourBag,
  onDeleteFlourBag,
  onNavigateToDrivers,
  onOpenProtocolModal
}) => {
  // SAISIE PRINCIPALE : LE NOMBRE DE PÂTES PAR SAC (Standard d'or : 20 pâtes = 400 baguettes)
  const [patesInput, setPatesInput] = useState<number>(20);
  const [burnedInput, setBurnedInput] = useState<number>(0);
  const [brokenInput, setBrokenInput] = useState<number>(0);
  const [notesInput, setNotesInput] = useState<string>('');
  const [showDetailedCarts, setShowDetailedCarts] = useState<boolean>(false);
  const [cart1Input, setCart1Input] = useState<number>(180);
  const [cart2Input, setCart2Input] = useState<number>(180);
  const [cart3Input, setCart3Input] = useState<number>(40);
  const [justAddedMsg, setJustAddedMsg] = useState<string | null>(null);

  const bagsList = state.flourBags || [];
  const totalBags = bagsList.length;

  // Calculs cumulés du fournil
  const totalPates = bagsList.reduce((acc, b) => acc + (b.patesCount !== undefined ? b.patesCount : Math.round(b.actualLoaves / 20)), 0);
  const totalGrossLoaves = bagsList.reduce((acc, b) => acc + (b.actualLoaves || 0), 0);
  const totalBurned = bagsList.reduce((acc, b) => acc + (b.burnedLoaves || 0), 0);
  const totalBroken = bagsList.reduce((acc, b) => acc + (b.brokenLoaves || 0), 0);
  const totalScrap = totalBurned + totalBroken;
  const totalNetVendable = Math.max(0, totalGrossLoaves - totalScrap);
  const avgPatesPerBag = totalBags > 0 ? Number((totalPates / totalBags).toFixed(1)) : 0;

  // Calculs pour le sac en cours de saisie
  const currentGrossLoaves = patesInput * 20; // 20 baguettes par pâte (diviseuse 20 alvéoles)
  const currentScrap = burnedInput + brokenInput;
  const currentNetVendable = Math.max(0, currentGrossLoaves - currentScrap);
  const currentDeltaQuota = patesInput - 20; // Écart vs quota strict de 20 pâtes

  // 1-CLIC VALIDATION EXPRESS STANDARD (20 PÂTES = 400 BAGUETTES)
  const handleAddStandardBag = () => {
    const bagNum = totalBags + 1;
    onAddFlourBag(
      400,
      `Sac #${bagNum} : Standard 20 pâtes (400 baguettes) sans perte`,
      0,
      0,
      180,
      180,
      40,
      20
    );
    setJustAddedMsg(`⚡ Sac #${bagNum} enregistré en 1 clic : 20 Pâtes = 400 Baguettes parfaites !`);
    setPatesInput(20);
    setBurnedInput(0);
    setBrokenInput(0);
    setCart1Input(180);
    setCart2Input(180);
    setCart3Input(40);
    setNotesInput('');
    setTimeout(() => setJustAddedMsg(null), 3500);
  };

  // VALIDATION PERSONNALISÉE (Si écart de pâtes ou démarque)
  const handleAddCustomBag = () => {
    const bagNum = totalBags + 1;
    const deltaText = currentDeltaQuota === 0
      ? 'Quota 20 pâtes respecté'
      : currentDeltaQuota > 0
      ? `+${currentDeltaQuota} pâte(s) (${currentDeltaQuota * 20} b.)`
      : `${currentDeltaQuota} pâte(s) (${currentDeltaQuota * 20} b.)`;

    const note = notesInput.trim() || `Sac #${bagNum} : ${patesInput} pâtes (${currentGrossLoaves} brutes) - Démarque: ${currentScrap} = ${currentNetVendable} vendables [${deltaText}]`;

    // Répartition indicative sur 3 chariots
    let c1 = 180;
    let c2 = 180;
    let c3 = Math.max(0, currentGrossLoaves - 360);
    if (showDetailedCarts) {
      c1 = cart1Input;
      c2 = cart2Input;
      c3 = cart3Input;
    }

    onAddFlourBag(
      currentGrossLoaves,
      note,
      burnedInput,
      brokenInput,
      c1,
      c2,
      c3,
      patesInput
    );

    setJustAddedMsg(`✅ Sac #${bagNum} validé : ${patesInput} Pâtes ➔ ${currentNetVendable} pains vendables (${currentScrap} démarque).`);
    setPatesInput(20);
    setBurnedInput(0);
    setBrokenInput(0);
    setNotesInput('');
    setTimeout(() => setJustAddedMsg(null), 4000);
  };

  const handleSelectPatesQuick = (count: number) => {
    setPatesInput(count);
    const gross = count * 20;
    if (gross >= 360) {
      setCart1Input(180);
      setCart2Input(180);
      setCart3Input(gross - 360);
    } else {
      setCart1Input(Math.min(180, gross));
      setCart2Input(Math.max(0, gross - 180));
      setCart3Input(0);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* EN-TÊTE ÉPURÉ DE LA MISSION 1 */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(15, 23, 42, 0.95) 100%)',
        borderLeft: '4px solid var(--amber-primary)',
        padding: '16px 20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--amber-primary) 0%, #b45309 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
              flexShrink: 0
            }}>
              <ShoppingBag size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '18px', color: '#fff', margin: 0, fontWeight: 800 }}>
                  Mission Fournil : Comptage des Pâtes par Sac de Farine
                </h2>
                <span className="badge badge-amber" style={{ fontSize: '10px', padding: '2px 8px' }}>
                  Règle d'or : 1 Sac = 20 Pâtes
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
                Chaque sac pétri doit produire <strong>20 pâtes</strong> (20 divisions = 400 baguettes brutes). Contrôlez rigoureusement ce ratio pour empêcher les manquants à la source.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {onOpenProtocolModal && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={onOpenProtocolModal}
                style={{ fontSize: '12px', padding: '7px 12px', color: 'var(--amber-light)' }}
              >
                <span>🛡️ Ligne Directive</span>
              </button>
            )}
            <button
              type="button"
              className="btn btn-primary"
              onClick={onNavigateToDrivers}
              style={{ fontSize: '12.5px', padding: '7px 14px' }}
            >
              <span>Aller aux Sorties Livreurs 👉</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 COMPTEURS CLÉS DU FOURNIL */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
        
        {/* Sacs travaillés */}
        <div className="stat-card" style={{ borderTop: '3px solid var(--amber-primary)', padding: '12px 14px' }}>
          <div className="stat-label" style={{ fontSize: '11px' }}>
            <ShoppingBag size={13} color="var(--amber-light)" />
            <span>Sacs Traités</span>
          </div>
          <div className="stat-value" style={{ fontSize: '24px', color: '#fff' }}>{totalBags}</div>
          <div className="stat-subtext" style={{ fontSize: '11px' }}>sacs de farine pétris</div>
        </div>

        {/* Pâtes sorties & Moyenne */}
        <div className="stat-card" style={{ borderTop: '3px solid #fbbf24', padding: '12px 14px' }}>
          <div className="stat-label" style={{ fontSize: '11px' }}>
            <Scale size={13} color="#fbbf24" />
            <span>Pâtes Obtenues</span>
          </div>
          <div className="stat-value" style={{ fontSize: '24px', color: '#fbbf24' }}>
            {totalPates} <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>pâtes</span>
          </div>
          <div className="stat-subtext" style={{ fontSize: '11px' }}>
            Moyenne : <strong>{avgPatesPerBag}</strong> / sac (Quota : 20.0)
          </div>
        </div>

        {/* Démarque Fournil */}
        <div className="stat-card" style={{ borderTop: '3px solid #ef4444', padding: '12px 14px' }}>
          <div className="stat-label" style={{ fontSize: '11px' }}>
            <Flame size={13} color="#ef4444" />
            <span>Démarque Justifiée</span>
          </div>
          <div className="stat-value" style={{ fontSize: '24px', color: '#f87171' }}>
            {totalScrap} <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>pains</span>
          </div>
          <div className="stat-subtext" style={{ fontSize: '11px' }}>
            {totalBurned} brûlés au four + {totalBroken} cassés
          </div>
        </div>

        {/* Pains vendables réels */}
        <div className="stat-card" style={{ borderTop: '3px solid #10b981', padding: '12px 14px' }}>
          <div className="stat-label" style={{ fontSize: '11px' }}>
            <CheckCircle2 size={13} color="#34d399" />
            <span>Pains Vendables</span>
          </div>
          <div className="stat-value" style={{ fontSize: '24px', color: '#34d399' }}>
            {totalNetVendable.toLocaleString('fr-FR')}
          </div>
          <div className="stat-subtext" style={{ fontSize: '11px' }}>
            disponibles pour distribution
          </div>
        </div>

      </div>

      {/* CARTE CENTRALE : COMPTAGE DES PÂTES PAR SAC */}
      <div
        className="glass-card"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.98) 100%)',
          border: '1.5px solid rgba(245, 158, 11, 0.45)',
          padding: '20px',
          boxShadow: '0 12px 35px rgba(0,0,0,0.55)',
          borderRadius: '18px'
        }}
      >
        {/* Titre de la carte de saisie */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <span style={{
              background: 'var(--amber-primary)',
              color: '#000',
              padding: '2px 9px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: 800
            }}>
              POINTAGE SAC EN COURS
            </span>
            <h3 style={{ fontSize: '19px', color: '#fff', margin: '4px 0 0 0', fontWeight: 800 }}>
              Pointer le Sac de Farine #{totalBags + 1}
            </h3>
          </div>

          <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
            Quota attendu : <strong>20 pâtes</strong> = <strong>400 baguettes</strong>
          </div>
        </div>

        {/* Message de confirmation */}
        {justAddedMsg && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '10px',
            padding: '10px 14px',
            fontSize: '13.5px',
            color: '#34d399',
            fontWeight: 700,
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={18} />
            <span>{justAddedMsg}</span>
          </div>
        )}

        {/* 1. BOUTON EXPRESS 1-CLIC (90% DES CAS TERRAIN) */}
        <div style={{
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1.5px dashed rgba(245, 158, 11, 0.55)',
          borderRadius: '14px',
          padding: '14px',
          marginBottom: '16px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '11.5px', color: 'var(--amber-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
            ⚡ SAC NORMAL CONFORME AU QUOTA DU PATRON
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleAddStandardBag}
            style={{
              width: '100%',
              padding: '13px 18px',
              fontSize: '15.5px',
              fontWeight: 800,
              borderRadius: '12px',
              boxShadow: '0 6px 20px rgba(245, 158, 11, 0.4)'
            }}
          >
            <Zap size={20} />
            <span>Valider Sac #{totalBags + 1} Standard (20 Pâtes = 400 Baguettes) en 1 Clic</span>
          </button>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
            Enregistre instantanément 20 pâtes, 400 baguettes vendables et 0 perte.
          </div>
        </div>

        {/* 2. LE COMPTEUR PRÉCIS DE PÂTES (EN GRAND & TACTILE) */}
        <div style={{
          background: 'rgba(0,0,0,0.35)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '16px',
          marginBottom: '14px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
            <label style={{ fontSize: '13.5px', color: '#fff', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Scale size={16} color="var(--amber-light)" />
              <span>Nombre de Pâtes obtenues pour le Sac #{totalBags + 1} :</span>
            </label>

            {currentDeltaQuota === 0 ? (
              <span className="badge badge-success" style={{ fontSize: '11px' }}>
                ⭐ Quota Strict 20 Pâtes (400 b.)
              </span>
            ) : currentDeltaQuota < 0 ? (
              <span className="badge badge-danger" style={{ fontSize: '11px' }}>
                ⚠️ {currentDeltaQuota} Pâte(s) manquante(s) ({currentDeltaQuota * 20} b.)
              </span>
            ) : (
              <span className="badge badge-info" style={{ fontSize: '11px' }}>
                📈 +{currentDeltaQuota} Pâte(s) en surplus (+{currentDeltaQuota * 20} b.)
              </span>
            )}
          </div>

          {/* Stepper tactile Pâtes */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', margin: '8px 0' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setPatesInput(prev => Math.max(1, prev - 1))}
              style={{ width: '48px', height: '48px', fontSize: '20px', fontWeight: 800, borderRadius: '12px' }}
              title="Moins 1 pâte"
            >
              -1
            </button>

            <div style={{
              minWidth: '120px',
              textAlign: 'center',
              fontSize: '34px',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              color: 'var(--amber-light)',
              background: 'rgba(15, 23, 42, 0.95)',
              border: '2px solid var(--amber-primary)',
              borderRadius: '12px',
              padding: '4px 14px'
            }}>
              {patesInput} <span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>pâtes</span>
            </div>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setPatesInput(prev => prev + 1)}
              style={{ width: '48px', height: '48px', fontSize: '20px', fontWeight: 800, borderRadius: '12px' }}
              title="Plus 1 pâte"
            >
              +1
            </button>
          </div>

          {/* Pastilles directes rapides */}
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '10px' }}>
            {[18, 19, 20, 21, 22].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleSelectPatesQuick(num)}
                style={{
                  background: patesInput === num ? 'var(--amber-primary)' : 'rgba(255,255,255,0.06)',
                  color: patesInput === num ? '#000' : 'var(--flour-white)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '5px 14px',
                  fontSize: '12.5px',
                  fontWeight: patesInput === num ? 800 : 500,
                  cursor: 'pointer'
                }}
              >
                {num === 20 ? '⭐ 20 Pâtes (Standard)' : `${num} pâtes (${num * 20} b.)`}
              </button>
            ))}
          </div>

          {/* Équivalence en baguettes brutes */}
          <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>
            Équivalence diviseuse : <strong>{patesInput} pâtes</strong> × 20 = <strong style={{ color: '#fff', fontSize: '15px' }}>{currentGrossLoaves} baguettes brutes</strong>
          </div>
        </div>

        {/* 3. DÉMARQUE FOURNIL (BRÛLÉS & CASSÉS) */}
        <div style={{
          background: 'rgba(239, 68, 68, 0.06)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: '14px',
          padding: '14px',
          marginBottom: '14px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
            <div style={{ fontSize: '13px', color: '#fca5a5', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Flame size={15} />
              <span>Démarque Justifiée (Rebuts sortis du four) :</span>
            </div>
            <span className="badge badge-danger" style={{ fontSize: '11px' }}>
              -{currentScrap} pains au rebut
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {/* Brûlés */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>🔥 Pains Brûlés au four</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setBurnedInput(prev => Math.max(0, prev - 1))}
                  style={{ width: '36px', height: '36px', padding: 0, fontWeight: 800 }}
                >
                  -
                </button>
                <span style={{ fontSize: '20px', fontWeight: 800, color: '#f87171', width: '42px' }}>
                  {burnedInput}
                </span>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setBurnedInput(prev => prev + 1)}
                  style={{ width: '36px', height: '36px', padding: 0, fontWeight: 800 }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Cassés */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>💔 Pains Cassés / Déformés</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setBrokenInput(prev => Math.max(0, prev - 1))}
                  style={{ width: '36px', height: '36px', padding: 0, fontWeight: 800 }}
                >
                  -
                </button>
                <span style={{ fontSize: '20px', fontWeight: 800, color: '#fca5a5', width: '42px' }}>
                  {brokenInput}
                </span>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setBrokenInput(prev => prev + 1)}
                  style={{ width: '36px', height: '36px', padding: 0, fontWeight: 800 }}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4. TOTAL NET VENDABLE ET ENREGISTREMENT AVEC ÉCART */}
        <div style={{
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: '14px',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Pains Vendables Nets pour le Sac #{totalBags + 1} :
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-heading)' }}>
              {currentNetVendable} pains vendables
              {currentScrap > 0 && (
                <span style={{ fontSize: '12.5px', color: '#f87171', marginLeft: '6px', fontWeight: 600 }}>
                  (-{currentScrap} démarque)
                </span>
              )}
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginTop: '2px' }}>
              Base : {patesInput} pâtes ({currentGrossLoaves} baguettes) - {currentScrap} au rebut
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleAddCustomBag}
            style={{ fontSize: '14px', padding: '11px 20px', borderRadius: '10px' }}
          >
            <Plus size={16} />
            <span>Valider avec cet écart ({patesInput} Pâtes / {currentNetVendable} Vendables)</span>
          </button>
        </div>

      </div>

      {/* HISTORIQUE TRANSPARENT DES SACS DE FARINE */}
      <div className="glass-card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '16px', color: '#fff', margin: 0, fontWeight: 700 }}>
              Sacs de Farine Pointés ({bagsList.length})
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Total : {totalPates} pâtes enregistrées ({totalNetVendable} pains vendables nets)
            </p>
          </div>
          <span className="badge badge-success" style={{ fontSize: '11px' }}>
            Moyenne : {avgPatesPerBag} pâtes/sac
          </span>
        </div>

        {/* Vue Cartes Mobile */}
        <div className="mobile-cards-list" style={{ display: 'none' }}>
          {bagsList.map((bag) => {
            const pates = bag.patesCount !== undefined ? bag.patesCount : Math.round(bag.actualLoaves / 20);
            const scrap = (bag.burnedLoaves || 0) + (bag.brokenLoaves || 0);
            const vendable = bag.netVendableLoaves ?? (bag.actualLoaves - scrap);
            const isQuota = pates === 20;

            return (
              <div
                key={bag.id}
                style={{
                  background: 'rgba(30, 41, 59, 0.65)',
                  border: isQuota ? '1px solid rgba(245, 158, 11, 0.25)' : '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: '12px',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 800, color: 'var(--amber-light)', fontSize: '14px' }}>
                      Sac #{bag.bagIndex}
                    </span>
                    <span style={{ fontSize: '12px', color: isQuota ? '#34d399' : '#f87171', fontWeight: 700 }}>
                      {pates} pâtes {isQuota ? '⭐' : `(${pates - 20} vs 20)`}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                      {bag.timestamp}
                    </span>
                  </div>

                  <div style={{ fontSize: '13px', color: '#fff', marginTop: '2px' }}>
                    <strong>{vendable}</strong> pains vendables
                    {scrap > 0 && (
                      <span style={{ color: '#f87171', fontSize: '11px', marginLeft: '6px' }}>
                        (-{scrap} démarque)
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onDeleteFlourBag(bag.id)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444',
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  title="Supprimer ce sac"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}

          {bagsList.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '13px' }}>
              Aucun sac enregistré. Cliquez sur le bouton express ci-dessus pour pointer votre 1er sac.
            </div>
          )}
        </div>

        {/* Vue Tableau Desktop */}
        <div className="desktop-table-view table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Sac #</th>
                <th>Heure</th>
                <th>Pâtes Obtenues</th>
                <th>Baguettes Brutes</th>
                <th>Démarque (Brûlés / Cassés)</th>
                <th>Pains Vendables</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bagsList.map((bag) => {
                const pates = bag.patesCount !== undefined ? bag.patesCount : Math.round(bag.actualLoaves / 20);
                const scrap = (bag.burnedLoaves || 0) + (bag.brokenLoaves || 0);
                const vendables = bag.netVendableLoaves ?? (bag.actualLoaves - scrap);
                const isQuota = pates === 20;

                return (
                  <tr key={bag.id}>
                    <td>
                      <strong style={{ color: 'var(--amber-light)' }}>Sac #{bag.bagIndex}</strong>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{bag.timestamp}</td>
                    <td>
                      <strong style={{ color: isQuota ? '#34d399' : '#f87171', fontSize: '14px' }}>
                        {pates} pâtes
                      </strong>{' '}
                      {isQuota ? (
                        <span style={{ fontSize: '11px', color: '#34d399' }}>✅ Quota parfait</span>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#f87171' }}>
                          ({pates - 20 > 0 ? `+${pates - 20}` : pates - 20} vs 20)
                        </span>
                      )}
                    </td>
                    <td style={{ fontWeight: 700, color: '#fff' }}>{bag.actualLoaves} b.</td>
                    <td>
                      {scrap > 0 ? (
                        <span style={{ color: '#f87171', fontSize: '12px', fontWeight: 600 }}>
                          -{scrap} ({bag.burnedLoaves || 0} brûlés, {bag.brokenLoaves || 0} cassés)
                        </span>
                      ) : (
                        <span style={{ color: '#34d399', fontSize: '12px' }}>0 perte (Impeccable)</span>
                      )}
                    </td>
                    <td style={{ fontWeight: 800, color: '#34d399', fontSize: '15px' }}>
                      {vendables} baguettes
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => onDeleteFlourBag(bag.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                        title="Supprimer ce sac"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {bagsList.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    Aucun sac pointé pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
export default SimplePatesFarinePage;
