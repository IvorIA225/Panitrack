import React, { useState } from 'react';
import { ShiftState } from '../wat/types';
import { ShoppingBag, Plus, Trash2, CheckCircle2, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';

interface SimplePatesFarinePageProps {
  state: ShiftState;
  onAddFlourBag: (loaves: number, notes?: string) => void;
  onDeleteFlourBag: (id: string) => void;
  onNavigateToDrivers: () => void;
}

export const SimplePatesFarinePage: React.FC<SimplePatesFarinePageProps> = ({
  state,
  onAddFlourBag,
  onDeleteFlourBag,
  onNavigateToDrivers
}) => {
  const [patesInput, setPatesInput] = useState<number>(400); // 400 standard
  const [notesInput, setNotesInput] = useState<string>('');
  const [justAddedMsg, setJustAddedMsg] = useState<string | null>(null);

  const bagsList = state.flourBags || [];
  const totalBags = bagsList.length;
  const totalPates = bagsList.reduce((acc, b) => acc + (b.actualLoaves || 0), 0);
  const avgPates = totalBags > 0 ? Math.round(totalPates / totalBags) : 0;

  const quickPresets = [385, 390, 395, 400, 405, 410];

  const handleAddBag = () => {
    const bagNum = totalBags + 1;
    const note = notesInput.trim() || `${patesInput} pâtes sorties`;
    onAddFlourBag(patesInput, note);
    setJustAddedMsg(`✅ Sac #${bagNum} enregistré avec ${patesInput} pâtes !`);
    setNotesInput('');
    setTimeout(() => setJustAddedMsg(null), 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* En-tête de la Mission 1 */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(15, 23, 42, 0.9) 100%)',
        borderLeft: '5px solid var(--amber-primary)',
        padding: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--amber-primary) 0%, #b45309 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000',
              boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)'
            }}>
              <ShoppingBag size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '19px', color: '#fff', margin: 0, fontWeight: 800 }}>
                Mission 1 : Compter les Pâtes par Sac de Farine
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                À chaque sac de farine pétri par les ouvriers, notez le nombre exact de pâtes (pains) qui sortent.
              </p>
            </div>
          </div>

          <button
            className="btn btn-secondary"
            onClick={onNavigateToDrivers}
            style={{ fontSize: '13px', padding: '10px 16px' }}
          >
            <span>Passer à l'Énumération des Livreurs 👉</span>
          </button>
        </div>
      </div>

      {/* 3 Cartes Simples de Synthèse pour Répondre au Patron */}
      <div className="stat-grid">
        <div className="stat-card" style={{ borderTop: '3px solid var(--amber-primary)' }}>
          <div className="stat-label">
            <ShoppingBag size={15} color="var(--amber-light)" />
            <span>Sacs de Farine Travaillés</span>
          </div>
          <div className="stat-value" style={{ color: '#fff' }}>{totalBags}</div>
          <div className="stat-subtext">sacs ouverts & pétris cette nuit</div>
        </div>

        <div className="stat-card" style={{ borderTop: '3px solid #34d399' }}>
          <div className="stat-label">
            <CheckCircle2 size={15} color="#34d399" />
            <span>Total Pâtes Obtenues</span>
          </div>
          <div className="stat-value" style={{ color: '#34d399' }}>
            {totalPates.toLocaleString()}
          </div>
          <div className="stat-subtext">pains physiques réels produits</div>
        </div>

        <div className="stat-card" style={{ borderTop: '3px solid #60a5fa' }}>
          <div className="stat-label">
            <TrendingUp size={15} color="#60a5fa" />
            <span>Rendement Moyen</span>
          </div>
          <div className="stat-value" style={{ color: '#60a5fa' }}>
            {avgPates} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/ sac</span>
          </div>
          <div className="stat-subtext">
            {avgPates >= 400 ? '⭐ Conforme au standard (400)' : totalBags === 0 ? 'En attente du 1er sac' : '⚠️ Sous le standard 400'}
          </div>
        </div>
      </div>

      {/* Formulaire Tactile Géant pour Pointer le Sac Actuel */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)',
        border: '2px solid rgba(245, 158, 11, 0.4)',
        padding: '26px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <span style={{
              background: 'var(--amber-primary)',
              color: '#000',
              padding: '4px 12px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 800
            }}>
              POINTAGE EN COURS
            </span>
            <h3 style={{ fontSize: '20px', color: '#fff', margin: '8px 0 0 0', fontWeight: 800 }}>
              Pointer le Sac #{totalBags + 1}
            </h3>
          </div>

          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Standard usuel : <strong>400 pâtes</strong>
          </span>
        </div>

        {/* Message de succès après saisie */}
        {justAddedMsg && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '10px',
            padding: '12px 16px',
            fontSize: '14px',
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

        {/* Saisie principale du nombre de pâtes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{
            background: 'rgba(0,0,0,0.35)',
            padding: '16px',
            borderRadius: '14px',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <label style={{ fontSize: '13.5px', color: 'var(--flour-white)', fontWeight: 600, display: 'block', marginBottom: '10px' }}>
              Combien de pâtes sont sorties pour ce sac #{totalBags + 1} ?
            </label>

            {/* Sélecteur Stepper direct */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setPatesInput((prev) => Math.max(1, prev - 5))}
                  style={{ width: '42px', height: '42px', padding: 0, fontWeight: 800, fontSize: '14px' }}
                  title="Moins 5"
                >
                  -5
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setPatesInput((prev) => Math.max(1, prev - 1))}
                  style={{ width: '42px', height: '42px', padding: 0, fontWeight: 800, fontSize: '18px' }}
                  title="Moins 1"
                >
                  -1
                </button>
                <input
                  type="number"
                  min={1}
                  value={patesInput}
                  onChange={(e) => setPatesInput(parseInt(e.target.value) || 0)}
                  style={{
                    width: '100px',
                    textAlign: 'center',
                    fontSize: '22px',
                    fontWeight: 800,
                    color: 'var(--amber-light)',
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: '2px solid var(--amber-primary)',
                    borderRadius: '10px',
                    padding: '8px'
                  }}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setPatesInput((prev) => prev + 1)}
                  style={{ width: '42px', height: '42px', padding: 0, fontWeight: 800, fontSize: '18px' }}
                  title="Plus 1"
                >
                  +1
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setPatesInput((prev) => prev + 5)}
                  style={{ width: '42px', height: '42px', padding: 0, fontWeight: 800, fontSize: '14px' }}
                  title="Plus 5"
                >
                  +5
                </button>
              </div>

              {/* Boutons préréglages rapides */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginLeft: 'auto' }}>
                {quickPresets.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setPatesInput(val)}
                    style={{
                      background: patesInput === val ? 'var(--amber-primary)' : 'rgba(255,255,255,0.06)',
                      color: patesInput === val ? '#000' : 'var(--flour-white)',
                      border: patesInput === val ? 'none' : '1px solid rgba(255,255,255,0.1)',
                      fontWeight: patesInput === val ? 800 : 500,
                      fontSize: '12.5px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    {val === 400 ? '⭐ 400 standard' : `${val} pâtes`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bouton Géant de Validation */}
          <button
            type="button"
            className="btn btn-primary btn-large"
            onClick={handleAddBag}
            style={{
              padding: '18px 24px',
              fontSize: '17px',
              fontWeight: 800,
              boxShadow: '0 8px 25px rgba(245, 158, 11, 0.4)',
              width: '100%'
            }}
          >
            <Plus size={22} />
            <span>Valider Sac #{totalBags + 1} (+{patesInput} pâtes)</span>
          </button>
        </div>
      </div>

      {/* Tableau des Sacs Déjà Travaillés */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '16px', color: '#fff', margin: 0, fontWeight: 700 }}>
            Registre des Sacs Travaillés ({totalBags} sac{totalBags > 1 ? 's' : ''})
          </h3>
          <span style={{ fontSize: '13px', color: 'var(--amber-light)', fontWeight: 700 }}>
            Total : {totalPates} pâtes
          </span>
        </div>

        {bagsList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-muted)', fontSize: '14px' }}>
            Aucun sac n'a encore été enregistré ce soir. Pointez le premier sac ci-dessus dès qu'il sort du pétrin !
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>N° Sac</th>
                  <th>Heure de Sortie</th>
                  <th>Nombre de Pâtes</th>
                  <th>Écart vs 400</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bagsList.map((bag) => {
                  const delta = bag.actualLoaves - 400;
                  return (
                    <tr key={bag.id}>
                      <td style={{ fontWeight: 800, color: '#fff' }}>
                        Sac #{bag.bagIndex}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{bag.timestamp}</td>
                      <td style={{ fontSize: '16px', fontWeight: 800, color: 'var(--amber-light)' }}>
                        {bag.actualLoaves} pâtes
                      </td>
                      <td>
                        {delta === 0 ? (
                          <span style={{ color: '#34d399', fontWeight: 600, fontSize: '12px' }}>
                            ✓ Conforme (400)
                          </span>
                        ) : delta > 0 ? (
                          <span style={{ color: '#60a5fa', fontWeight: 600, fontSize: '12px' }}>
                            +{delta} pâtes
                          </span>
                        ) : (
                          <span style={{ color: '#f87171', fontWeight: 600, fontSize: '12px' }}>
                            {delta} pâtes (attention)
                          </span>
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() => onDeleteFlourBag(bag.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#ef4444',
                            padding: '4px'
                          }}
                          title="Supprimer cette ligne"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
