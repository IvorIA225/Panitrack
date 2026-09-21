import React, { useState, useEffect, useRef } from 'react';
import { ShiftState } from '../wat/types';
import { computeShiftReconciliation } from '../wat/tools';
import { Sparkles, ArrowDown, ShieldCheck, Flame, ShoppingBag, Truck } from 'lucide-react';

interface ThreeDimensionalBreadHeroProps {
  state: ShiftState;
  onScrollToDispatch: () => void;
  onScrollToBaking: () => void;
}

export const ThreeDimensionalBreadHero: React.FC<ThreeDimensionalBreadHeroProps> = ({
  state,
  onScrollToDispatch,
  onScrollToBaking
}) => {
  const recon = computeShiftReconciliation(state);
  const heroRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);

  // Écoute du tilt souris & du scroll pour la profondeur 3D
  useEffect(() => {
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
  }, []);

  // Calcul des matrices 3D
  const rotX = mousePos.y * -14 + Math.min(scrollY * 0.04, 15);
  const rotY = mousePos.x * 18;

  return (
    <section
      ref={heroRef}
      style={{
        position: 'relative',
        minHeight: '340px',
        borderRadius: '24px',
        overflow: 'hidden',
        perspective: '1200px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '36px 32px',
        background: 'linear-gradient(145deg, rgba(17, 24, 39, 0.95) 0%, rgba(11, 15, 25, 0.98) 100%)',
        border: '1px solid rgba(245, 158, 11, 0.25)',
        boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(245, 158, 11, 0.3)'
      }}
    >
      {/* Plan de fond (Background Depth Plane) : Lueur dorée atmosphérique */}
      <div
        style={{
          position: 'absolute',
          top: '-30%',
          right: '-10%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.18) 0%, rgba(217, 119, 6, 0.05) 50%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
          transform: `translate3d(${mousePos.x * -30}px, ${mousePos.y * -30}px, -100px)`,
          transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      />

      {/* Plan Médian (3D Sculpture & HUD) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          alignItems: 'center',
          gap: '30px',
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(20px)`,
          transition: 'transform 0.15s ease-out',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Contenu textuel & signature */}
        <div style={{ transformStyle: 'preserve-3d' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '999px',
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              marginBottom: '14px',
              fontSize: '12px',
              color: 'var(--amber-light)',
              fontWeight: 600,
              transform: 'translateZ(30px)'
            }}
          >
            <Sparkles size={14} color="var(--amber-light)" />
            <span>PaniTrack 3D • Shift en Temps Réel</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(26px, 4vw, 38px)',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.15,
              marginBottom: '12px',
              transform: 'translateZ(45px)',
              letterSpacing: '-0.03em'
            }}
          >
            Vos 2 Seules Missions : <br />
            <span style={{
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Pâtes par Sac & Livreurs
            </span>
          </h1>

          <p
            style={{
              fontSize: '14.5px',
              color: 'var(--text-muted)',
              lineHeight: '1.6',
              maxWidth: '520px',
              marginBottom: '22px',
              transform: 'translateZ(25px)'
            }}
          >
            Plus de calculs compliqués : <strong>1.</strong> Vous comptez le nombre de pâtes qui sortent pour chaque sac de farine. 
            <strong> 2.</strong> Vous énumérez chaque livreur qui vient chercher du pain.
          </p>

          {/* Boutons d'accès directs épurés */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', transform: 'translateZ(35px)' }}>
            <button
              className="btn btn-primary"
              onClick={onScrollToBaking}
              style={{
                fontSize: '14px',
                padding: '12px 22px',
                boxShadow: '0 8px 25px rgba(245, 158, 11, 0.4)'
              }}
            >
              <ShoppingBag size={17} />
              <span>🥖 1. Pâtes par Sac de Farine</span>
            </button>

            <button
              className="btn btn-secondary"
              onClick={onScrollToDispatch}
              style={{ fontSize: '14px', padding: '12px 20px' }}
            >
              <Truck size={17} color="var(--amber-light)" />
              <span>🚚 2. Énumérer les Livreurs</span>
            </button>
          </div>
        </div>

        {/* Sculpture 3D Interactive : Carte Holographique du Shift */}
        <div
          style={{
            transform: 'translateZ(50px)',
            transformStyle: 'preserve-3d',
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '360px',
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: '20px',
              padding: '22px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(245, 158, 11, 0.2)',
              backdropFilter: 'blur(16px)',
              position: 'relative'
            }}
          >
            {/* Lueur bord 3D */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '24px' }}>🥖</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>Balance en Direct</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Base 180 vendables / chariot</div>
                </div>
              </div>
              <span className="badge badge-success" style={{ fontSize: '10px' }}>
                Sécurisé
              </span>
            </div>

            {/* Mini-dashboard 3D */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '10px', borderRadius: '12px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Pains Produits</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--amber-light)' }}>
                  {recon.totalLoavesBaked}
                </div>
                <div style={{ fontSize: '10.5px', color: 'var(--text-dim)' }}>
                  {recon.totalFlourBagsUsed} sacs de farine
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '10px', borderRadius: '12px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Pains Emportés</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--success)' }}>
                  {recon.totalLoavesDelivered}
                </div>
                <div style={{ fontSize: '10.5px', color: 'var(--text-dim)' }}>
                  {recon.totalDeliveriesCount} tournées validées
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '10px', borderRadius: '12px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Stock Restant</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#60a5fa' }}>
                  {recon.loavesRemainingInBakery}
                </div>
                <div style={{ fontSize: '10.5px', color: 'var(--text-dim)' }}>Pour boutique du matin</div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '10px', borderRadius: '12px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tolérance Casse</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#c4b5fd' }}>
                  +{recon.totalCartsRecorded * 20}
                </div>
                <div style={{ fontSize: '10.5px', color: 'var(--text-dim)' }}>20 pains / chariot</div>
              </div>
            </div>

            {/* Jauge visuelle de distribution */}
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                <span>Taux de distribution tournées</span>
                <span>{recon.totalLoavesBaked > 0 ? Math.round((recon.totalLoavesDelivered / recon.totalLoavesBaked) * 100) : 0}%</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', overflow: 'hidden' }}>
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
