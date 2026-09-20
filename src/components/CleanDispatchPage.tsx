import React, { useState } from 'react';
import { DeliveryEntry, ShiftState } from '../wat/types';
import { calculateBreadTotalWithLoose } from '../wat/tools';
import { Truck, Plus, Trash2, CheckCircle2, Package, Hash, Clock, Check, RefreshCw } from 'lucide-react';

interface CleanDispatchPageProps {
  state: ShiftState;
  onAddDelivery: (delivery: DeliveryEntry) => void;
  onUpdateDelivery: (delivery: DeliveryEntry) => void;
  onDeleteDelivery: (id: string) => void;
}

export const CleanDispatchPage: React.FC<CleanDispatchPageProps> = ({
  state,
  onAddDelivery,
  onUpdateDelivery,
  onDeleteDelivery
}) => {
  // Sélection ou saisie du livreur
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [driverName, setDriverName] = useState<string>('');
  const [driverCategory, setDriverCategory] = useState<'diallo' | 'souridji' | 'autre'>('autre');

  // Prise en cours (lot actuel)
  const [batchBags, setBatchBags] = useState<number>(0);
  const [batchLoose, setBatchLoose] = useState<number>(15); // Exemple exact audio : 15 baguettes
  const [loavesPerBag, setLoavesPerBag] = useState<number>(25);
  const [isDialloCheck, setIsDialloCheck] = useState<boolean>(false);

  // Suggestions rapides
  const quickDrivers = [
    { name: 'Diallo (Tournée Principale)', category: 'diallo' as const },
    { name: 'Moussa (Équipe Souridji)', category: 'souridji' as const },
    { name: 'Ibrahim (Équipe Souridji)', category: 'souridji' as const },
    { name: 'Ousmane (Équipe Souridji)', category: 'souridji' as const },
    { name: 'Amadou (Livreur Vélo)', category: 'autre' as const }
  ];

  const deliveriesList = state.deliveries || [];

  // Trouver si le livreur sélectionné a déjà un ticket en cours
  const selectedDelivery = selectedDriverId
    ? deliveriesList.find((d) => d.id === selectedDriverId)
    : deliveriesList.find(
        (d) => d.status === 'en_cours' && d.driverName.toLowerCase() === driverName.trim().toLowerCase()
      );

  // Calcul du lot actuel
  const effectiveLoavesPerBag = (driverCategory === 'diallo' && isDialloCheck) ? 27 : loavesPerBag;
  const currentBatchTotal = calculateBreadTotalWithLoose(batchBags, effectiveLoavesPerBag, batchLoose);

  // Cumul déjà pris par ce livreur s'il a un ticket ouvert
  const alreadyTakenLoaves = selectedDelivery ? selectedDelivery.totalLoaves : 0;
  const newProjectedTotal = alreadyTakenLoaves + currentBatchTotal;

  // Sélection rapide d'un nom
  const handleSelectQuickDriver = (item: typeof quickDrivers[0]) => {
    setDriverName(item.name);
    setDriverCategory(item.category);
    if (item.category === 'diallo') {
      setIsDialloCheck(true);
    } else {
      setIsDialloCheck(false);
      setLoavesPerBag(25);
    }

    // Si ce livreur a déjà un ticket en cours, on s'y rattache
    const existing = deliveriesList.find(
      (d) => d.status === 'en_cours' && d.driverName.toLowerCase() === item.name.toLowerCase()
    );
    if (existing) {
      setSelectedDriverId(existing.id);
    } else {
      setSelectedDriverId(null);
    }
  };

  // Sélection d'un ticket en cours dans la liste
  const handlePickActiveTicket = (delivery: DeliveryEntry) => {
    setSelectedDriverId(delivery.id);
    setDriverName(delivery.driverName);
    setDriverCategory(delivery.driverCategory);
    if (delivery.driverCategory === 'diallo' && delivery.isAnomaly) {
      setIsDialloCheck(true);
    }
    setBatchBags(0);
    setBatchLoose(20); // Prêt pour le passage suivant (+20 par ex)
  };

  // 1. Enregistrer / Ajouter cette prise au ticket du livreur
  const handleAddBatch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const nameToUse = (selectedDelivery ? selectedDelivery.driverName : driverName).trim();
    if (!nameToUse) {
      alert('Veuillez indiquer le nom du livreur.');
      return;
    }

    if (currentBatchTotal <= 0) {
      alert('Veuillez indiquer au moins 1 sac ou des pains au détail.');
      return;
    }

    const nowTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const isAnomaly = driverCategory === 'diallo' && isDialloCheck;

    const newPickup = {
      id: 'pick_' + Date.now(),
      timestamp: nowTime,
      bagsCount: batchBags,
      looseLoavesCount: batchLoose,
      loavesPerBag: effectiveLoavesPerBag,
      batchTotalLoaves: currentBatchTotal,
      notes: `${batchBags > 0 ? `${batchBags} sacs + ` : ''}${batchLoose} pains vrac`
    };

    if (selectedDelivery) {
      // Ajout au ticket existant
      const existingPickups = selectedDelivery.pickups || [
        {
          id: 'p_init_' + selectedDelivery.id,
          timestamp: selectedDelivery.timestamp,
          bagsCount: selectedDelivery.bagsCount,
          looseLoavesCount: selectedDelivery.looseLoavesCount,
          loavesPerBag: selectedDelivery.loavesPerBag,
          batchTotalLoaves: selectedDelivery.totalLoaves,
          notes: 'Passage initial'
        }
      ];

      const updatedPickups = [...existingPickups, newPickup];
      const updatedTotalBags = selectedDelivery.bagsCount + batchBags;
      const updatedTotalLoose = selectedDelivery.looseLoavesCount + batchLoose;
      const updatedTotalLoaves = selectedDelivery.totalLoaves + currentBatchTotal;

      const updatedDelivery: DeliveryEntry = {
        ...selectedDelivery,
        pickups: updatedPickups,
        bagsCount: updatedTotalBags,
        looseLoavesCount: updatedTotalLoose,
        totalLoaves: updatedTotalLoaves,
        totalCalculatedLoaves: updatedTotalLoaves,
        notes: `${updatedPickups.length} prises au total (${updatedTotalLoaves} pains)`
      };

      onUpdateDelivery(updatedDelivery);
    } else {
      // Création d'un nouveau ticket ouvert (en cours)
      const newDelivery: DeliveryEntry = {
        id: 'del_' + Date.now(),
        timestamp: nowTime,
        driverName: nameToUse,
        driverCategory,
        status: 'en_cours', // En cours de chargement
        pickups: [newPickup],
        bagsCount: batchBags,
        loavesPerBag: effectiveLoavesPerBag,
        looseLoavesCount: batchLoose,
        totalLoaves: currentBatchTotal,
        totalCalculatedLoaves: currentBatchTotal,
        notes: `1ère prise : +${currentBatchTotal} pains`,
        isAnomaly
      };

      onAddDelivery(newDelivery);
      setSelectedDriverId(newDelivery.id);
    }

    // Réinitialisation du lot pour le prochain passage
    setBatchBags(0);
    setBatchLoose(0);
  };

  // 2. Clôturer définitivement le départ du livreur (quand on est sûr qu'il ne revient plus)
  const handleFinalizeDeparture = (deliveryId: string) => {
    const target = deliveriesList.find((d) => d.id === deliveryId);
    if (!target) return;

    const nowTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const updated: DeliveryEntry = {
      ...target,
      status: 'cloture',
      closedAt: nowTime,
      notes: target.notes ? `${target.notes} (🏁 Départ à ${nowTime})` : `🏁 Départ définitif à ${nowTime}`
    };

    onUpdateDelivery(updated);
    if (selectedDriverId === deliveryId) {
      setSelectedDriverId(null);
      setDriverName('');
      setBatchBags(0);
      setBatchLoose(15);
    }
  };

  // Réouvrir un ticket si le livreur revient finalement
  const handleReopenTicket = (deliveryId: string) => {
    const target = deliveriesList.find((d) => d.id === deliveryId);
    if (!target) return;

    const updated: DeliveryEntry = {
      ...target,
      status: 'en_cours'
    };
    onUpdateDelivery(updated);
    handlePickActiveTicket(updated);
  };

  // Séparation livreurs en cours vs clôturés
  const activeDeliveries = deliveriesList.filter((d) => d.status !== 'cloture');
  const closedDeliveries = deliveriesList.filter((d) => d.status === 'cloture');

  const totalPainsDispatched = deliveriesList.reduce((acc, d) => acc + d.totalLoaves, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* Panneau Principal de Saisie Multi-Passages */}
      <div
        className="glass-card"
        style={{
          border: '1px solid rgba(245, 158, 11, 0.45)',
          background: 'linear-gradient(145deg, rgba(17, 24, 39, 0.95) 0%, rgba(13, 18, 30, 0.98) 100%)',
          boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.7), 0 0 25px rgba(245, 158, 11, 0.15)'
        }}
      >
        {/* En-tête avec indicateur de cumul */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)'
            }}>
              <Truck size={22} color="#000" />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', color: '#fff', fontWeight: 800 }}>
                Émargement Livreurs : Chargement en Plusieurs Fois (Multi-Lots & Vrac)
              </h2>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                Enregistrez chaque prise successive (ex: 15, puis +20, puis +30 pains) avec cumul en direct !
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-amber" style={{ fontSize: '12px', padding: '6px 12px' }}>
              Cumul Global Sorti : <strong>{totalPainsDispatched} pains</strong>
            </span>
          </div>
        </div>

        {/* 1. Boutons Livreurs Récurrents */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '8px', fontWeight: 600 }}>
            CHOISIR OU TAPER UN LIVREUR :
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {quickDrivers.map((item, idx) => {
              const isOpen = deliveriesList.some(
                (d) => d.status === 'en_cours' && d.driverName.toLowerCase() === item.name.toLowerCase()
              );
              const isCurrent = (selectedDelivery && selectedDelivery.driverName === item.name) || driverName === item.name;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectQuickDriver(item)}
                  style={{
                    background: isCurrent ? 'var(--amber-primary)' : isOpen ? 'rgba(245, 158, 11, 0.15)' : 'rgba(30, 41, 59, 0.7)',
                    color: isCurrent ? '#000' : isOpen ? 'var(--amber-light)' : 'var(--flour-white)',
                    border: isCurrent ? '1px solid var(--amber-light)' : isOpen ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    padding: '8px 14px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{item.name}</span>
                  {isOpen && (
                    <span style={{ fontSize: '10px', background: '#f59e0b', color: '#000', padding: '1px 5px', borderRadius: '999px', fontWeight: 700 }}>
                      En cours
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Nom du livreur + Alerte si ticket en cours */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" style={{ color: '#fff', fontSize: '13.5px' }}>
                Livreur concerné :
              </label>
              {selectedDelivery && (
                <span className="badge badge-amber" style={{ fontSize: '11px' }}>
                  ⏳ Ticket actif : déjà {selectedDelivery.totalLoaves} pains pris ({selectedDelivery.pickups?.length || 1} passage(s))
                </span>
              )}
            </div>
            <input
              type="text"
              className="form-input"
              placeholder="Nom du livreur (ex: Diallo, Moussa, Amadou...)"
              value={selectedDelivery ? selectedDelivery.driverName : driverName}
              onChange={(e) => {
                setDriverName(e.target.value);
                setSelectedDriverId(null);
              }}
              style={{ fontSize: '15px', padding: '10px 14px', borderRadius: '10px' }}
            />
          </div>

          {/* Si ticket actif sélectionné : Afficher l'historique des prises précédentes */}
          {selectedDelivery && selectedDelivery.pickups && selectedDelivery.pickups.length > 0 && (
            <div style={{
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px dashed rgba(245, 158, 11, 0.35)',
              borderRadius: '12px',
              padding: '12px 16px'
            }}>
              <div style={{ fontSize: '12px', color: 'var(--amber-light)', fontWeight: 700, marginBottom: '6px' }}>
                Historique des passages de {selectedDelivery.driverName} :
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {selectedDelivery.pickups.map((p, idx) => (
                  <span
                    key={p.id || idx}
                    style={{
                      background: 'rgba(15, 23, 42, 0.8)',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    Passage #{idx + 1} ({p.timestamp}) : <strong style={{ color: 'var(--amber-light)' }}>+{p.batchTotalLoaves} pains</strong>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. Saisie du NOUVEAU LOT (La prise actuelle : ex. 15, 20, 30 pains) */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          marginBottom: '18px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h4 style={{ fontSize: '14px', color: '#fff', fontWeight: 700 }}>
              Saisir le nouveau lot apporté à ce passage :
            </h4>
            <span style={{ fontSize: '13px', color: 'var(--amber-light)' }}>
              Lot actuel = <strong>+{currentBatchTotal} pains</strong>
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
            
            {/* Pains au détail / Vrac (Cas le plus fréquent : 15, 20, 30 baguettes) */}
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(96, 165, 250, 0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="form-label" style={{ color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Hash size={16} />
                  <span>Pains au Détail / Vrac (Ce passage)</span>
                </label>
              </div>

              <input
                type="number"
                min="0"
                className="form-input"
                value={batchLoose}
                onChange={(e) => setBatchLoose(Math.max(0, parseInt(e.target.value) || 0))}
                style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'var(--font-mono)', textAlign: 'center', color: '#93c5fd', marginBottom: '10px' }}
              />

              {/* Boutons rapides exacts de l'audio : +15, +20, +30 ! */}
              <div style={{ display: 'flex', gap: '6px' }}>
                {[0, 15, 20, 30, 50].map((num) => (
                  <button
                    key={num}
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setBatchLoose(num)}
                    style={{ flex: 1, padding: '6px 4px', fontSize: '12px', background: batchLoose === num ? 'rgba(59, 130, 246, 0.3)' : undefined }}
                  >
                    {num === 0 ? '0' : `+${num}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Sacs entiers de 25 */}
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="form-label" style={{ color: 'var(--amber-light)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Package size={16} />
                  <span>Sacs Entiers de Pain</span>
                </label>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                  ({effectiveLoavesPerBag} pains/sac)
                </span>
              </div>

              <input
                type="number"
                min="0"
                className="form-input"
                value={batchBags}
                onChange={(e) => setBatchBags(Math.max(0, parseInt(e.target.value) || 0))}
                style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'var(--font-mono)', textAlign: 'center', marginBottom: '10px' }}
              />

              <div style={{ display: 'flex', gap: '6px' }}>
                {[0, 1, 2, 5, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setBatchBags(num)}
                    style={{ flex: 1, padding: '6px 4px', fontSize: '12px', background: batchBags === num ? 'rgba(245, 158, 11, 0.3)' : undefined }}
                  >
                    {num === 0 ? '0' : `${num}`}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* 4. Affichage du Total en Direct & Boutons d'Action Clairs */}
        <div style={{
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          borderRadius: '16px',
          padding: '18px 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Calcul & Cumul en Temps Réel :
            </div>
            <div style={{ fontSize: '15px', color: '#fff', marginTop: '4px' }}>
              {selectedDelivery ? (
                <>
                  Déjà pris ({alreadyTakenLoaves} p.) + Nouveau lot (+{currentBatchTotal} p.) ={' '}
                  <strong style={{ fontSize: '26px', color: 'var(--amber-light)', fontFamily: 'var(--font-heading)' }}>
                    {newProjectedTotal} PAINS
                  </strong>
                </>
              ) : (
                <>
                  Ce passage ={' '}
                  <strong style={{ fontSize: '26px', color: 'var(--amber-light)', fontFamily: 'var(--font-heading)' }}>
                    {currentBatchTotal} PAINS
                  </strong>
                </>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {/* Bouton Ajouter cette prise */}
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleAddBatch()}
              style={{
                fontSize: '14.5px',
                padding: '12px 24px',
                borderRadius: '12px',
                boxShadow: '0 6px 18px rgba(245, 158, 11, 0.35)'
              }}
            >
              <Plus size={18} />
              <span>
                {selectedDelivery
                  ? `Ajouter +${currentBatchTotal} pains au chargement de ${selectedDelivery.driverName}`
                  : `Enregistrer la prise (+${currentBatchTotal} pains)`}
              </span>
            </button>

            {/* Bouton Clôturer le départ définitif */}
            {selectedDelivery && (
              <button
                type="button"
                className="btn btn-success"
                onClick={() => handleFinalizeDeparture(selectedDelivery.id)}
                style={{
                  fontSize: '14.5px',
                  padding: '12px 20px',
                  borderRadius: '12px'
                }}
                title="À faire quand le livreur a fini de tout prendre et qu'on est sûr qu'il ne reviendra pas"
              >
                <CheckCircle2 size={18} />
                <span>🏁 Confirmer le Départ ({selectedDelivery.totalLoaves} pains)</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* 5. Section : Livreurs EN COURS de Chargement (Tickets Ouverts) */}
      {activeDeliveries.length > 0 && (
        <div className="glass-card" style={{ border: '1px solid rgba(245, 158, 11, 0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '16px', color: 'var(--amber-light)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} />
              <span>Livreurs Actuellement en Cours de Chargement ({activeDeliveries.length})</span>
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Tickets ouverts pouvant recevoir de nouveaux passages
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '14px' }}>
            {activeDeliveries.map((del) => {
              const isSelected = selectedDriverId === del.id;

              return (
                <div
                  key={del.id}
                  style={{
                    background: isSelected ? 'rgba(245, 158, 11, 0.15)' : 'rgba(15, 23, 42, 0.8)',
                    border: isSelected ? '2px solid var(--amber-primary)' : '1px solid var(--border-subtle)',
                    borderRadius: '14px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    boxShadow: isSelected ? '0 0 20px rgba(245, 158, 11, 0.25)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>
                        {del.driverName}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-dim)' }}>
                        Début chargement : {del.timestamp} • {del.pickups?.length || 1} passage(s)
                      </div>
                    </div>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--amber-light)', fontFamily: 'var(--font-heading)' }}>
                      {del.totalLoaves} p.
                    </div>
                  </div>

                  {/* Historique des prises */}
                  {del.pickups && del.pickups.length > 0 && (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      {del.pickups.map((p, pIdx) => (
                        <div key={pIdx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>• Passage {pIdx + 1} ({p.timestamp})</span>
                          <strong style={{ color: '#fff' }}>+{p.batchTotalLoaves} pains</strong>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions rapides sur la carte */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => handlePickActiveTicket(del)}
                      style={{ flex: 1, fontSize: '12px', padding: '6px 10px' }}
                    >
                      <Plus size={14} />
                      <span>Ajouter un lot</span>
                    </button>

                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={() => handleFinalizeDeparture(del.id)}
                      style={{ flex: 1, fontSize: '12px', padding: '6px 10px' }}
                      title="Le livreur part pour de bon"
                    >
                      <CheckCircle2 size={14} />
                      <span>Départ confirmé</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Feuille d'Émargement Globale (Tous les Livreurs) */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '16px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Feuille d’Émargement Officielle ({deliveriesList.length} livreurs)</span>
          </h3>
          <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
            <strong>{activeDeliveries.length}</strong> en cours • <strong>{closedDeliveries.length}</strong> partis
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Heure</th>
                <th>Nom du Livreur</th>
                <th>Prises / Passages</th>
                <th>Sacs Entiers</th>
                <th>Vrac / Détail</th>
                <th>Total Définitif</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {deliveriesList.map((d) => (
                <tr key={d.id} style={{ background: d.status === 'en_cours' ? 'rgba(245, 158, 11, 0.05)' : undefined }}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                    {d.timestamp}
                    {d.closedAt && <span style={{ color: 'var(--text-dim)', fontSize: '11px' }}> ➔ {d.closedAt}</span>}
                  </td>
                  <td style={{ fontWeight: 700, color: '#fff' }}>
                    {d.driverName}
                  </td>
                  <td>
                    {d.pickups && d.pickups.length > 1 ? (
                      <span className="badge badge-amber" style={{ fontSize: '11px' }}>
                        {d.pickups.length} prises ({d.pickups.map(p => `+${p.batchTotalLoaves}`).join(', ')})
                      </span>
                    ) : (
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>1 prise unique</span>
                    )}
                  </td>
                  <td>{d.bagsCount > 0 ? `${d.bagsCount} sacs` : '-'}</td>
                  <td>{d.looseLoavesCount > 0 ? `+${d.looseLoavesCount} vrac` : '-'}</td>
                  <td style={{ fontWeight: 800, color: 'var(--amber-light)', fontSize: '16px' }}>
                    {d.totalLoaves} pains
                  </td>
                  <td>
                    {d.status === 'cloture' ? (
                      <span className="badge badge-success">
                        🏁 Parti ({d.closedAt || 'Confirmé'})
                      </span>
                    ) : (
                      <span className="badge badge-amber">
                        ⏳ En cours de chargement
                      </span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {d.status === 'cloture' && (
                        <button
                          onClick={() => handleReopenTicket(d.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--amber-light)' }}
                          title="Réouvrir le ticket si le livreur revient"
                        >
                          <RefreshCw size={15} />
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteDelivery(d.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                        title="Supprimer cette ligne"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {deliveriesList.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    Aucun livreur enregistré pour le moment.
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
