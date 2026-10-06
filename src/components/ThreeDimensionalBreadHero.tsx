import React, { useState, useEffect, useRef } from 'react';
import { ShiftState } from '../wat/types';
import { computeShiftReconciliation } from '../wat/tools';
import { Sparkles, ShoppingBag, Truck, ChevronDown, ChevronUp } from 'lucide-react';

interface ThreeDimensionalBreadHeroProps {
  state: ShiftState;
  onScrollToDispatch: () => void;
  onScrollToBaking: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const ThreeDimensionalBreadHero: React.FC<ThreeDimensionalBreadHeroProps> = ({
  state,
  onScrollToDispatch,
  onScrollToBaking,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const recon = computeShiftReconciliation(state);
  const heroRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);

  // Écoute du tilt souris & du scroll pour la profondeur 3D
  useEffect(() => {
    if (isCollapsed) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setMousePos({ x, y });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isCollapsed]);

  // Si replié (Mode Épuré / Compact Mobile)
  if (isCollapsed) {
    return (
      <div
        className="glass-card"
        style={{
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.9) 0%, rgba(11, 15, 25, 0.95) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          borderRadius: '14px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
          <span style={{ fontSize: '18px' }}>🥖</span>
          <span style={{ color: 'var(--amber-light)', fontWeight: 700 }}>
            {recon.totalLoavesBaked} pains produits
          </span>
          <span style={{ color: 'var(--text-dim)' }}>•</span>
          <span style={{ color: 'var(--success)', fontWeight: 700 }}>
            {recon.totalLoavesDelivered} emportés
          </span>
          <span style={{ color: 'var(--text-dim)' }}>•</span>
          <span style={{ color: '#60a5fa', fontWeight: 600 }}>
            Stock : {recon.loavesRemainingInBakery} pains
          </span>
        </div>

        {onToggleCollapse && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onToggleCollapse}
            style={{ fontSize: '11.5px', padding: '4px 10px', borderRadius: '8px' }}
          >
            <ChevronDown size={14} />
            <span>Vue 3D Complète</span>
          </button>
        )}
      </div>
    );
  }

  // Calcul des matrices 3D
  const rotX = mousePos.y * -12 + Math.min(scrollY * 0.03, 12);
  const rotY = mousePos.x * 15;

  return (
    <section
      ref={heroRef}
      className="hero-section"
      style={{
        position: 'relative',
        minHeight: '280px',
        borderRadius: '20px',
        overflow: 'hidden',
        perspective: '1200px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '24px 26px',
        background: 'linear-gradient(145deg, rgba(17, 24, 39, 0.95) 0%, rgba(11, 15, 25, 0.98) 100%)',
        border: '1px solid rgba(245, 158, 11, 0.25)',
        boxShadow: '0 16px 40px -10px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(245, 158, 11, 0.3)'
      }}
    >
      {/* Bouton de réduction en haut à droite */}
      {onToggleCollapse && (
        <button
          type="button"
          onClick={onToggleCollapse}
          className="btn btn-secondary hero-collapse-btn"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            padding: '4px 8px',
            fontSize: '11px',
            zIndex: 10,
            background: 'rgba(15, 23, 42, 0.7)'
          }}
          title="Réduire pour libérer l'écran"
        >
          <ChevronUp size={13} />
          <span>Réduire</span>
        </button>
      )}

      {/* Lueur dorée atmosphérique */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '420px',
          height: '420px',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.16) 0%, rgba(217, 119, 6, 0.04) 50%, transparent 70%)',
          filter: 'blur(45px)',
          pointerEvents: 'none',
          transform: `translate3d(${mousePos.x * -20}px, ${mousePos.y * -20}px, -100px)`,
          transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      />

      {/* Plan Médian (3D Sculpture & HUD) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          alignItems: 'center',
          gap: '24px',
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(15px)`,
          transition: 'transform 0.15s ease-out',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Contenu textuel */}
        <div style={{ transformStyle: 'preserve-3d' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '999px',
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              marginBottom: '10px',
              fontSize: '11.5px',
              color: 'var(--amber-light)',
              fontWeight: 600,
              transform: 'translateZ(25px)'
            }}
          >
            <Sparkles size={13} color="var(--amber-light)" />
            <span>PaniTrack 3D • Copilote Shift Terrain</span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(22px, 3.5vw, 32px)',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.2,
              marginBottom: '8px',
              transform: 'translateZ(35px)',
              letterSpacing: '-0.02em'
            }}
          >
            Vos 2 Missions Essentielles : <br />
            <span style={{
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              1. Pâtes de Farine & 2. Expéditions
            </span>
          </h2>

          <p
            style={{
              fontSize: '13.5px',
              color: 'var(--text-muted)',
              lineHeight: '1.5',
              maxWidth: '480px',
              marginBottom: '16px',
              transform: 'translateZ(20px)'
            }}
          >
            Zéro calcul de tête : enregistrez chaque sac pétri et énumérez les sorties des livreurs. Tout le reste est calculé automatiquement.
          </p>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', transform: 'translateZ(30px)' }}>
            <button
              className="btn btn-primary"
              onClick={onScrollToBaking}
              style={{ fontSize: '13px', padding: '10px 18px' }}
            >
              <ShoppingBag size={16} />
              <span>1. Pâtes & Fournil</span>
            </button>

            <button
              className="btn btn-secondary"
              onClick={onScrollToDispatch}
              style={{ fontSize: '13px', padding: '10px 16px' }}
            >
              <Truck size={16} color="var(--amber-light)" />
              <span>2. Sorties Livreurs</span>
            </button>
          </div>
        </div>

        {/* Sculpture 3D Dashboard HUD */}
        <div
          style={{
            transform: 'translateZ(40px)',
            transformStyle: 'preserve-3d',
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '340px',
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: '16px',
              padding: '16px',
              boxShadow: '0 15px 35px rgba(0, 0, 0, 0.6), 0 0 25px rgba(245, 158, 11, 0.15)',
              backdropFilter: 'blur(14px)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '20px' }}>🥖</span>
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#fff' }}>Bilan Réel du Shift</div>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-dim)' }}>Base 400 baguettes / sac</div>
                </div>
              </div>
              <span className="badge badge-success" style={{ fontSize: '9.5px', padding: '2px 7px' }}>
                Équilibré
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '8px 10px', borderRadius: '10px' }}>
                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Pains Produits</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--amber-light)' }}>
                  {recon.totalLoavesBaked}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                  {recon.totalFlourBagsUsed} sac{recon.totalFlourBagsUsed > 1 ? 's' : ''}
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '8px 10px', borderRadius: '10px' }}>
                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Pains Emportés</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--success)' }}>
                  {recon.totalLoavesDelivered}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                  {recon.totalDeliveriesCount} livraison{recon.totalDeliveriesCount > 1 ? 's' : ''}
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '8px 10px', borderRadius: '10px' }}>
                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Stock Restant</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#60a5fa' }}>
                  {recon.loavesRemainingInBakery}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Pour boutique matin</div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '8px 10px', borderRadius: '10px' }}>
                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Démarque Totale</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#f87171' }}>
                  {recon.totalBurnedLoaves + recon.totalBrokenLoaves}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Brûlés / cassés</div>
              </div>
            </div>

            <div style={{ marginTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--text-muted)', marginBottom: '3px' }}>
                <span>Progression distribution</span>
                <span>{recon.totalLoavesBaked > 0 ? Math.round((recon.totalLoavesDelivered / recon.totalLoavesBaked) * 100) : 0}%</span>
              </div>
              <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${recon.totalLoavesBaked > 0 ? Math.min(100, Math.round((recon.totalLoavesDelivered / recon.totalLoavesBaked) * 100)) : 0}%`,
                    background: 'linear-gradient(90deg, #f59e0b 0%, #10b981 100%)',
                    borderRadius: '999px',
                    transition: 'width 0.4s ease'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default ThreeDimensionalBreadHero;
