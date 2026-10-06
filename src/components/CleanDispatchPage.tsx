import React, { useState, useRef } from 'react';
import { DeliveryEntry, ShiftState, DistributionChannel } from '../wat/types';
import { calculateBreadTotalWithLoose, getBagConversionTable, getChannelUnitPrice } from '../wat/tools';
import {
  Truck,
  Plus,
  Trash2,
  CheckCircle2,
  Package,
  Hash,
  RefreshCw,
  Camera,
  Store,
  Layers,
  Lock,
  Unlock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react';

interface CleanDispatchPageProps {
  state: ShiftState;
  onAddDelivery: (delivery: DeliveryEntry) => void;
  onUpdateDelivery: (delivery: DeliveryEntry) => void;
  onDeleteDelivery: (id: string) => void;
  onOpenProtocolModal?: () => void;
}

export const CleanDispatchPage: React.FC<CleanDispatchPageProps> = ({
  state,
  onAddDelivery,
  onUpdateDelivery,
  onDeleteDelivery,
  onOpenProtocolModal
}) => {
  // Sélection ou saisie du livreur
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [driverName, setDriverName] = useState<string>('');
  const [driverCategory, setDriverCategory] = useState<'diallo' | 'souridji' | 'adjara' | 'guichet' | 'autre'>('autre');
  
  // Séparation stricte des 3 canaux (Pilier 3)
  const [activeChannel, setActiveChannel] = useState<DistributionChannel>('livreur_officiel');

  // Prise en cours (lot actuel)
  const [batchBags, setBatchBags] = useState<number>(0);
  const [batchLoose, setBatchLoose] = useState<number>(15);
  const [loavesPerBag, setLoavesPerBag] = useState<number>(25);
  const [isDialloCheck, setIsDialloCheck] = useState<boolean>(false);
  const [isSealedChecked, setIsSealedChecked] = useState<boolean>(true);

  // Preuve photographique
  const [photoProof, setPhotoProof] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Affichage anti-sèche
  const [showAntiSeche, setShowAntiSeche] = useState<boolean>(false);

  // Suggestions rapides par canal
  const channelDrivers: Record<DistributionChannel, Array<{ name: string; category: typeof driverCategory }>> = {
    livreur_officiel: [
      { name: 'Diallo (Tournée Principale)', category: 'diallo' },
      { name: 'Moussa (Équipe Souridji)', category: 'souridji' },
      { name: 'Ibrahim (Équipe Souridji)', category: 'souridji' },
      { name: 'Ousmane (Équipe Souridji)', category: 'souridji' },
      { name: 'Amadou (Livreur Vélo)', category: 'autre' }
    ],
    adjara_grossiste: [
      { name: 'Grossiste ADJARA (Dépôt Central)', category: 'adjara' },
      { name: 'Grossiste ADJARA (Marché Sud)', category: 'adjara' },
      { name: 'Camionnette ADJARA Express', category: 'adjara' }
    ],
    guichet_comptoir: [
      { name: 'Vente Guichet (Comptoir Matin)', category: 'guichet' },
      { name: 'Petite Boutique Quartier (Comptant)', category: 'guichet' },
      { name: 'Passants & Particuliers', category: 'guichet' }
    ]
  };

  const deliveriesList = state.deliveries || [];

  // Trouver si le livreur sélectionné a déjà un ticket en cours
  const selectedDelivery = selectedDriverId
    ? deliveriesList.find((d) => d.id === selectedDriverId)
    : deliveriesList.find(
        (d) => d.status === 'en_cours' && d.driverName.toLowerCase() === driverName.trim().toLowerCase()
      );

  // Livreur actuellement dans le sas de chargement unique (Règle du 1-par-1)
  const activeDockDelivery = deliveriesList.find((d) => d.status === 'en_cours');

  // Tarification selon le canal (150 F guichet, 110 F livreurs & adjara)
  const currentUnitPrice = getChannelUnitPrice(activeChannel, state.unitPrices);

  // Calcul du lot actuel
  const effectiveLoavesPerBag = (driverCategory === 'diallo' && isDialloCheck) ? 27 : loavesPerBag;
  const currentBatchTotal = calculateBreadTotalWithLoose(batchBags, effectiveLoavesPerBag, batchLoose);
  const currentBatchCFA = currentBatchTotal * currentUnitPrice;

  // Cumul déjà pris par ce livreur s'il a un ticket ouvert
  const alreadyTakenLoaves = selectedDelivery ? selectedDelivery.totalLoaves : 0;
  const alreadyTakenCFA = selectedDelivery ? (selectedDelivery.totalPriceCFA || selectedDelivery.totalLoaves * currentUnitPrice) : 0;
  
  const newProjectedTotalLoaves = alreadyTakenLoaves + currentBatchTotal;
  const newProjectedTotalCFA = newProjectedTotalLoaves * currentUnitPrice;

  // Table de conversion anti-sèche
  const antiSecheTable = getBagConversionTable();

  // Changement de canal
  const handleSelectChannel = (ch: DistributionChannel) => {
    setActiveChannel(ch);
    setSelectedDriverId(null);
    setDriverName('');
    setIsDialloCheck(false);
  };

  // Sélection rapide d'un nom
  const handleSelectQuickDriver = (item: { name: string; category: typeof driverCategory }) => {
    setDriverName(item.name);
    setDriverCategory(item.category);
    if (item.category === 'diallo') {
      setIsDialloCheck(true);
    } else {
      setIsDialloCheck(false);
      setLoavesPerBag(25);
    }

    const existing = deliveriesList.find(
      (d) => d.status === 'en_cours' && d.driverName.toLowerCase() === item.name.toLowerCase()
    );
    if (existing) {
      setSelectedDriverId(existing.id);
      setActiveChannel(existing.channel || activeChannel);
      if (existing.photoProofUrl) setPhotoProof(existing.photoProofUrl);
    } else {
      setSelectedDriverId(null);
    }
  };

  // Gestion photo de chargement
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoProof(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 1. Enregistrer / Ajouter cette prise
  const handleAddBatch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const nameToUse = (selectedDelivery ? selectedDelivery.driverName : driverName).trim();
    if (!nameToUse) {
      alert('Veuillez indiquer ou sélectionner le nom du livreur / client.');
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
      notes: `${batchBags > 0 ? `${batchBags} sac(s) + ` : ''}${batchLoose} vrac`
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
      const updatedPriceCFA = updatedTotalLoaves * currentUnitPrice;

      const updatedDelivery: DeliveryEntry = {
        ...selectedDelivery,
        pickups: updatedPickups,
        bagsCount: updatedTotalBags,
        looseLoavesCount: updatedTotalLoose,
        totalLoaves: updatedTotalLoaves,
        totalCalculatedLoaves: updatedTotalLoaves,
        unitPriceCFA: currentUnitPrice,
        totalPriceCFA: updatedPriceCFA,
        channel: selectedDelivery.channel || activeChannel,
        sealedBagsCount: (selectedDelivery.sealedBagsCount || 0) + (isSealedChecked ? batchBags : 0),
        photoProofUrl: photoProof || selectedDelivery.photoProofUrl,
        photoProofTimestamp: photoProof ? nowTime : selectedDelivery.photoProofTimestamp,
        notes: `${updatedPickups.length} prises au total (${updatedTotalLoaves} pains = ${updatedPriceCFA.toLocaleString('fr-FR')} FCFA)`
      };

      onUpdateDelivery(updatedDelivery);
    } else {
      // Création d'un nouveau ticket ouvert dans le sas
      const newDelivery: DeliveryEntry = {
        id: 'del_' + Date.now(),
        timestamp: nowTime,
        driverName: nameToUse,
        channel: activeChannel,
        driverCategory,
        status: 'en_cours',
        pickups: [newPickup],
        bagsCount: batchBags,
        sealedBagsCount: isSealedChecked ? batchBags : 0,
        loavesPerBag: effectiveLoavesPerBag,
        looseLoavesCount: batchLoose,
        totalLoaves: currentBatchTotal,
        totalCalculatedLoaves: currentBatchTotal,
        unitPriceCFA: currentUnitPrice,
        totalPriceCFA: currentBatchCFA,
        photoProofUrl: photoProof || undefined,
        photoProofTimestamp: photoProof ? nowTime : undefined,
        loadingBayStatus: 'in_bay',
        notes: `1ère prise : +${currentBatchTotal} pains (${currentBatchCFA.toLocaleString('fr-FR')} FCFA)`,
        isAnomaly
      };

      onAddDelivery(newDelivery);
      setSelectedDriverId(newDelivery.id);
    }

    // Réinitialisation du lot pour le prochain passage
    setBatchBags(0);
    setBatchLoose(0);
  };

  // 2. Clôturer définitivement le départ du livreur (Libère le Sas de chargement)
  const handleFinalizeDeparture = (deliveryId: string) => {
    const target = deliveriesList.find((d) => d.id === deliveryId);
    if (!target) return;

    const nowTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const updated: DeliveryEntry = {
      ...target,
      status: 'cloture',
      closedAt: nowTime,
      loadingBayStatus: 'completed',
      photoProofUrl: photoProof || target.photoProofUrl,
      notes: target.notes ? `${target.notes} (🏁 Départ validé à ${nowTime})` : `🏁 Départ définitif à ${nowTime}`
    };

    onUpdateDelivery(updated);
    if (selectedDriverId === deliveryId) {
      setSelectedDriverId(null);
      setDriverName('');
      setBatchBags(0);
      setBatchLoose(15);
      setPhotoProof(null);
    }
  };

  // Réouvrir un ticket si besoin
  const handleReopenTicket = (deliveryId: string) => {
    const target = deliveriesList.find((d) => d.id === deliveryId);
    if (!target) return;

    const updated: DeliveryEntry = {
      ...target,
      status: 'en_cours',
      loadingBayStatus: 'in_bay'
    };
    onUpdateDelivery(updated);
    setSelectedDriverId(updated.id);
    setDriverName(updated.driverName);
    setDriverCategory(updated.driverCategory || 'autre');
    setActiveChannel(updated.channel || 'livreur_officiel');
    setBatchBags(0);
    setBatchLoose(0);
  };

  // Séparation livreurs en cours vs clôturés
  const activeDeliveries = deliveriesList.filter((d) => d.status !== 'cloture');
  const closedDeliveries = deliveriesList.filter((d) => d.status === 'cloture');

  const totalPainsDispatched = deliveriesList.reduce((acc, d) => acc + d.totalLoaves, 0);
  const totalRevenueDispatchedCFA = deliveriesList.reduce((acc, d) => acc + (d.totalPriceCFA || d.totalLoaves * (d.unitPriceCFA || 110)), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* BANNIÈRE SAS UNIQUE (Règle du 1 par 1) */}
      <div
        className="glass-card"
        style={{
          border: activeDockDelivery ? '2px solid var(--amber-primary)' : '1px solid rgba(16, 185, 129, 0.4)',
          background: activeDockDelivery
            ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.16) 0%, rgba(15, 23, 42, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(15, 23, 42, 0.95) 100%)',
          padding: '14px 18px',
          boxShadow: activeDockDelivery ? '0 0 20px rgba(245, 158, 11, 0.25)' : 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: activeDockDelivery ? 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)' : 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: activeDockDelivery ? '#000' : '#fff',
                flexShrink: 0
              }}
            >
              {activeDockDelivery ? <Lock size={20} /> : <Unlock size={20} />}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h3 style={{ fontSize: '15.5px', color: '#fff', margin: 0, fontWeight: 800 }}>
                  {activeDockDelivery
                    ? `🔒 AU SAS : ${activeDockDelivery.driverName} (${activeDockDelivery.totalLoaves} pains)`
                    : '🟢 SAS LIBRE : Prêt pour le prochain livreur'}
                </h3>
                <span className="badge badge-amber" style={{ fontSize: '9.5px', padding: '2px 6px' }}>
                  1 par 1
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                {activeDockDelivery
                  ? `Chargement en cours (${activeDockDelivery.totalPriceCFA?.toLocaleString('fr-FR')} FCFA). Aucun autre livreur ne doit s'approcher.`
                  : 'Zone d’expédition dégagée. Les livreurs passent un par un sans mélange.'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {activeDockDelivery && (
              <button
                type="button"
                className="btn btn-success"
                onClick={() => handleFinalizeDeparture(activeDockDelivery.id)}
                style={{ fontSize: '13px', padding: '8px 16px', fontWeight: 800, borderRadius: '10px' }}
              >
                <CheckCircle2 size={16} />
                <span>Valider Départ ({activeDockDelivery.totalLoaves} p.)</span>
              </button>
            )}
            {onOpenProtocolModal && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onOpenProtocolModal}
                style={{ fontSize: '12px', padding: '6px 10px' }}
              >
                <span>🛡️ Directive</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SÉLECTEUR DE CANAL SOUPLE & TARIFS */}
      <div className="glass-card" style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
            CANAL DE DISTRIBUTION :
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => handleSelectChannel('livreur_officiel')}
              style={{
                background: activeChannel === 'livreur_officiel' ? 'var(--amber-primary)' : 'rgba(30, 41, 59, 0.7)',
                color: activeChannel === 'livreur_officiel' ? '#000' : 'var(--flour-white)',
                border: activeChannel === 'livreur_officiel' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                padding: '7px 14px',
                borderRadius: '9px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Truck size={14} />
              <span>Livreurs (110 F)</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectChannel('adjara_grossiste')}
              style={{
                background: activeChannel === 'adjara_grossiste' ? '#3b82f6' : 'rgba(30, 41, 59, 0.7)',
                color: activeChannel === 'adjara_grossiste' ? '#fff' : 'var(--flour-white)',
                border: activeChannel === 'adjara_grossiste' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                padding: '7px 14px',
                borderRadius: '9px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Layers size={14} />
              <span>ADJARA (110 F)</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectChannel('guichet_comptoir')}
              style={{
                background: activeChannel === 'guichet_comptoir' ? '#10b981' : 'rgba(30, 41, 59, 0.7)',
                color: activeChannel === 'guichet_comptoir' ? '#fff' : 'var(--flour-white)',
                border: activeChannel === 'guichet_comptoir' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                padding: '7px 14px',
                borderRadius: '9px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Store size={14} />
              <span>Guichet (150 F)</span>
            </button>
          </div>
        </div>
      </div>

      {/* FORMULAIRE DE SAISIE RAPIDE DU CHARGEMENT */}
      <div
        className="glass-card"
        style={{
          border: '1.5px solid rgba(245, 158, 11, 0.45)',
          background: 'linear-gradient(145deg, rgba(17, 24, 39, 0.95) 0%, rgba(13, 18, 30, 0.98) 100%)',
          padding: '18px',
          boxShadow: '0 12px 35px rgba(0,0,0,0.6)'
        }}
      >
        {/* En-tête formulaire */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '17px', color: '#fff', fontWeight: 800, margin: 0 }}>
              Saisie de Chargement • {activeChannel === 'guichet_comptoir' ? 'Guichet (150 F)' : activeChannel === 'adjara_grossiste' ? 'ADJARA (110 F)' : 'Livreur (110 F)'}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Tarif : <strong>{currentUnitPrice} FCFA/pain</strong>. Tapez ou cliquez sur le nom du livreur.
            </p>
          </div>

          <span className="badge badge-amber" style={{ fontSize: '11px', padding: '4px 10px' }}>
            Sortie Totale : <strong>{totalPainsDispatched} pains</strong>
          </span>
        </div>

        {/* 1. Chips de Sélection Rapide du Livreur */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
            DESTINATAIRE FRÉQUENT :
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {channelDrivers[activeChannel].map((item, idx) => {
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
                    background: isCurrent ? 'var(--amber-primary)' : isOpen ? 'rgba(245, 158, 11, 0.18)' : 'rgba(30, 41, 59, 0.7)',
                    color: isCurrent ? '#000' : isOpen ? 'var(--amber-light)' : 'var(--flour-white)',
                    border: isCurrent ? '1px solid var(--amber-light)' : isOpen ? '1px solid var(--amber-primary)' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '12.5px',
                    fontWeight: isCurrent ? 800 : 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <span>{item.name}</span>
                  {isOpen && (
                    <span style={{ fontSize: '9px', background: '#f59e0b', color: '#000', padding: '1px 5px', borderRadius: '999px', fontWeight: 800 }}>
                      Au Sas
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Champ Nom */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <label style={{ color: '#fff', fontSize: '12.5px', fontWeight: 600 }}>
              Nom du livreur / client :
            </label>
            {selectedDelivery && (
              <span className="badge badge-amber" style={{ fontSize: '10.5px' }}>
                ⏳ Déjà pris : {selectedDelivery.totalLoaves} pains ({selectedDelivery.totalPriceCFA?.toLocaleString('fr-FR')} FCFA)
              </span>
            )}
          </div>
          <input
            type="text"
            className="form-input"
            placeholder="Tapez le nom si pas dans la liste..."
            value={selectedDelivery ? selectedDelivery.driverName : driverName}
            onChange={(e) => {
              setDriverName(e.target.value);
              setSelectedDriverId(null);
            }}
            style={{ fontSize: '15px', padding: '9px 12px', borderRadius: '10px' }}
          />

          {/* Alert Diallo */}
          {driverCategory === 'diallo' && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: '8px',
              padding: '8px 12px',
              marginTop: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fca5a5', fontSize: '12px' }}>
                <AlertTriangle size={15} />
                <span>Note Vocale : Sac Diallo contrôlé physique (+2 pains cachés)</span>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#fff', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isDialloCheck}
                  onChange={(e) => setIsDialloCheck(e.target.checked)}
                />
                <span>Base 27 pains/sac (+2)</span>
              </label>
            </div>
          )}
        </div>

        {/* 3. Saisie des Sacs et du Vrac avec Steppers Tactiles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', marginBottom: '14px' }}>
          
          {/* Sacs Scellés (25 pains/sac) */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.55)',
            padding: '14px',
            borderRadius: '12px',
            border: '1px solid rgba(245, 158, 11, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--amber-light)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Package size={15} />
                <span>Sacs Scellés ({effectiveLoavesPerBag} pains/sac)</span>
              </span>
              <span style={{ fontSize: '12px', color: '#fff', fontWeight: 800 }}>
                {batchBags * effectiveLoavesPerBag} pains
              </span>
            </div>

            {/* Stepper tactile Sacs */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: '8px 0' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setBatchBags(prev => Math.max(0, prev - 1))}
                style={{ width: '42px', height: '42px', fontSize: '18px', fontWeight: 800, borderRadius: '10px' }}
              >
                -
              </button>
              <div style={{
                minWidth: '80px',
                textAlign: 'center',
                fontSize: '28px',
                fontWeight: 800,
                fontFamily: 'var(--font-heading)',
                color: 'var(--amber-light)',
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid var(--amber-primary)',
                borderRadius: '10px',
                padding: '4px 10px'
              }}>
                {batchBags}
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setBatchBags(prev => prev + 1)}
                style={{ width: '42px', height: '42px', fontSize: '18px', fontWeight: 800, borderRadius: '10px' }}
              >
                +
              </button>
            </div>

            {/* Chips rapides sacs */}
            <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {[0, 1, 2, 4, 6, 8, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setBatchBags(num)}
                  style={{
                    padding: '4px 9px',
                    fontSize: '11.5px',
                    background: batchBags === num ? 'var(--amber-primary)' : undefined,
                    color: batchBags === num ? '#000' : undefined,
                    fontWeight: batchBags === num ? 800 : 500
                  }}
                >
                  {num === 0 ? '0' : `${num}s.`}
                </button>
              ))}
            </div>
          </div>

          {/* Vrac / Pains au détail */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.55)',
            padding: '14px',
            borderRadius: '12px',
            border: '1px solid rgba(96, 165, 250, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Hash size={15} />
                <span>Pains Vrac Hors Sac</span>
              </span>
              <span style={{ fontSize: '12px', color: '#fff', fontWeight: 800 }}>
                +{batchLoose} pains
              </span>
            </div>

            {/* Stepper tactile Vrac */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: '8px 0' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setBatchLoose(prev => Math.max(0, prev - 1))}
                style={{ width: '42px', height: '42px', fontSize: '18px', fontWeight: 800, borderRadius: '10px' }}
              >
                -
              </button>
              <div style={{
                minWidth: '80px',
                textAlign: 'center',
                fontSize: '28px',
                fontWeight: 800,
                fontFamily: 'var(--font-heading)',
                color: '#93c5fd',
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid #60a5fa',
                borderRadius: '10px',
                padding: '4px 10px'
              }}>
                {batchLoose}
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setBatchLoose(prev => prev + 1)}
                style={{ width: '42px', height: '42px', fontSize: '18px', fontWeight: 800, borderRadius: '10px' }}
              >
                +
              </button>
            </div>

            {/* Chips rapides vrac */}
            <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {[0, 5, 10, 15, 20, 30].map((num) => (
                <button
                  key={num}
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setBatchLoose(num)}
                  style={{
                    padding: '4px 9px',
                    fontSize: '11.5px',
                    background: batchLoose === num ? '#3b82f6' : undefined,
                    color: batchLoose === num ? '#fff' : undefined,
                    fontWeight: batchLoose === num ? 800 : 500
                  }}
                >
                  {num === 0 ? '0' : `+${num}`}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* 4. Preuve Photo & Anti-Sèche (Dépliables) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
          {/* Photo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => fileInputRef.current?.click()}
              style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '8px' }}
            >
              <Camera size={14} />
              <span>{photoProof ? '📸 Photo Enregistrée' : 'Prendre Photo Chargement'}</span>
            </button>
            {photoProof && (
              <img
                src={photoProof}
                alt="Preuve"
                style={{ width: '30px', height: '30px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--amber-primary)' }}
              />
            )}
          </div>

          {/* Toggle Anti-sèche */}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowAntiSeche(!showAntiSeche)}
            style={{ fontSize: '11.5px', padding: '5px 10px', borderRadius: '8px' }}
          >
            <span>Anti-Sèche Conversion Sacs</span>
            {showAntiSeche ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>

        {/* Anti-Sèche si dépliée */}
        {showAntiSeche && (
          <div style={{
            background: 'rgba(0,0,0,0.3)',
            padding: '10px',
            borderRadius: '10px',
            marginBottom: '14px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
            gap: '6px'
          }}>
            {antiSecheTable.slice(0, 8).map((item) => {
              const cfa = activeChannel === 'guichet_comptoir' ? item.cfaGuichet : item.cfaLivreursOrAdjara;
              return (
                <button
                  key={item.bags}
                  type="button"
                  onClick={() => setBatchBags(item.bags)}
                  style={{
                    background: batchBags === item.bags ? 'rgba(245, 158, 11, 0.3)' : 'rgba(30, 41, 59, 0.6)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    padding: '6px',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>{item.bags} sac{item.bags > 1 ? 's' : ''}</div>
                  <div style={{ fontSize: '11px', color: 'var(--amber-light)', fontWeight: 700 }}>{item.loaves} p.</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{cfa.toLocaleString('fr-FR')} F</div>
                </button>
              );
            })}
          </div>
        )}

        {/* 5. TOTAL AUTOMATISÉ ET VALIDATION GÉANTE */}
        <div style={{
          background: 'rgba(245, 158, 11, 0.12)',
          border: '1px solid rgba(245, 158, 11, 0.45)',
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
              Calcul Instantané :
            </div>
            <div style={{ fontSize: '14px', color: '#fff', marginTop: '2px' }}>
              {selectedDelivery ? (
                <>
                  Déjà au ticket ({alreadyTakenLoaves} p.) + Nouveau lot (+{currentBatchTotal} p.) ={' '}
                  <strong style={{ fontSize: '24px', color: 'var(--amber-light)', fontFamily: 'var(--font-heading)' }}>
                    {newProjectedTotalLoaves} PAINS
                  </strong>{' '}
                  <span style={{ fontSize: '17px', color: '#34d399', fontWeight: 800 }}>
                    ({newProjectedTotalCFA.toLocaleString('fr-FR')} FCFA)
                  </span>
                </>
              ) : (
                <>
                  Ce lot ={' '}
                  <strong style={{ fontSize: '24px', color: 'var(--amber-light)', fontFamily: 'var(--font-heading)' }}>
                    {currentBatchTotal} PAINS
                  </strong>{' '}
                  <span style={{ fontSize: '17px', color: '#34d399', fontWeight: 800 }}>
                    ({currentBatchCFA.toLocaleString('fr-FR')} FCFA)
                  </span>
                </>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleAddBatch()}
              style={{
                fontSize: '14.5px',
                padding: '12px 22px',
                borderRadius: '12px',
                boxShadow: '0 6px 18px rgba(245, 158, 11, 0.35)'
              }}
            >
              <Plus size={18} />
              <span>
                {selectedDelivery
                  ? `Ajouter +${currentBatchTotal} p. (${currentBatchCFA.toLocaleString('fr-FR')} F)`
                  : `Enregistrer Prise (+${currentBatchTotal} p.)`}
              </span>
            </button>

            {selectedDelivery && (
              <button
                type="button"
                className="btn btn-success"
                onClick={() => handleFinalizeDeparture(selectedDelivery.id)}
                style={{
                  fontSize: '14px',
                  padding: '12px 18px',
                  borderRadius: '12px'
                }}
              >
                <CheckCircle2 size={18} />
                <span>🏁 Valider Départ ({selectedDelivery.totalPriceCFA?.toLocaleString('fr-FR')} F)</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* FEUILLE D'ÉMARGEMENT / HISTORIQUE (Adaptatif Mobile / Desktop) */}
      <div className="glass-card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '16px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <FileText size={17} color="var(--amber-light)" />
              <span>Feuille d’Émargement ({deliveriesList.length} livraisons)</span>
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              {activeDeliveries.length} au sas • {closedDeliveries.length} partis
            </p>
          </div>
          <div style={{ fontSize: '13.5px', color: '#34d399', fontWeight: 800 }}>
            Recette totale : {totalRevenueDispatchedCFA.toLocaleString('fr-FR')} FCFA
          </div>
        </div>

        {/* Vue Cartes pour Mobile */}
        <div className="mobile-cards-list" style={{ display: 'none' }}>
          {deliveriesList.map((d) => (
            <div
              key={d.id}
              style={{
                background: d.status === 'en_cours' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(30, 41, 59, 0.6)',
                border: d.status === 'en_cours' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <strong style={{ color: '#fff', fontSize: '15px' }}>{d.driverName}</strong>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    {d.timestamp} {d.closedAt ? `➔ Départ : ${d.closedAt}` : '(Au Sas)'}
                  </div>
                </div>

                {d.status === 'cloture' ? (
                  <span className="badge badge-success" style={{ fontSize: '10.5px' }}>🏁 Parti</span>
                ) : (
                  <span className="badge badge-amber" style={{ fontSize: '10.5px' }}>⏳ Au Sas</span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px' }}>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                  {d.bagsCount > 0 && <span>{d.bagsCount} sacs </span>}
                  {d.looseLoavesCount > 0 && <span>+{d.looseLoavesCount} vrac</span>}
                  <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--amber-light)', marginTop: '2px' }}>
                    {d.totalLoaves} pains
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                    {d.unitPriceCFA || 110} F/p.
                  </div>
                  <div style={{ fontSize: '17px', fontWeight: 800, color: '#34d399' }}>
                    {(d.totalPriceCFA || d.totalLoaves * (d.unitPriceCFA || 110)).toLocaleString('fr-FR')} FCFA
                  </div>
                </div>
              </div>

              {/* Actions Mobile */}
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', marginTop: '4px' }}>
                {d.status === 'en_cours' && (
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={() => handleFinalizeDeparture(d.id)}
                    style={{ fontSize: '12px', padding: '6px 12px', flex: 1 }}
                  >
                    <CheckCircle2 size={14} />
                    <span>Valider Départ</span>
                  </button>
                )}
                {d.status === 'cloture' && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => handleReopenTicket(d.id)}
                    style={{ fontSize: '11.5px', padding: '5px 10px' }}
                    title="Réouvrir le ticket"
                  >
                    <RefreshCw size={13} />
                    <span>Réouvrir</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onDeleteDelivery(d.id)}
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
                  title="Supprimer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          {deliveriesList.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '13px' }}>
              Aucun chargement enregistré pour le moment.
            </div>
          )}
        </div>

        {/* Vue Tableau pour Desktop */}
        <div className="desktop-table-view table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Heure</th>
                <th>Canal & Destinataire</th>
                <th>Sacs</th>
                <th>Vrac</th>
                <th>Pains Nets</th>
                <th>Tarif</th>
                <th>Montant FCFA</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {deliveriesList.map((d) => {
                const channelBadge =
                  d.channel === 'guichet_comptoir' ? (
                    <span className="badge badge-success" style={{ fontSize: '9.5px', padding: '1px 6px' }}>Guichet (150 F)</span>
                  ) : d.channel === 'adjara_grossiste' ? (
                    <span className="badge badge-info" style={{ fontSize: '9.5px', padding: '1px 6px' }}>ADJARA (110 F)</span>
                  ) : (
                    <span className="badge badge-amber" style={{ fontSize: '9.5px', padding: '1px 6px' }}>Livreur (110 F)</span>
                  );

                return (
                  <tr key={d.id} style={{ background: d.status === 'en_cours' ? 'rgba(245, 158, 11, 0.05)' : undefined }}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                      {d.timestamp}
                      {d.closedAt && <span style={{ color: 'var(--text-dim)', fontSize: '11px' }}> ➔ {d.closedAt}</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <strong style={{ color: '#fff' }}>{d.driverName}</strong>
                        <div>{channelBadge}</div>
                      </div>
                    </td>
                    <td>
                      {d.bagsCount > 0 ? (
                        <span style={{ color: 'var(--amber-light)', fontWeight: 600 }}>
                          {d.bagsCount} sac{d.bagsCount > 1 ? 's' : ''}
                        </span>
                      ) : '-'}
                    </td>
                    <td>{d.looseLoavesCount > 0 ? `+${d.looseLoavesCount} vrac` : '-'}</td>
                    <td style={{ fontWeight: 800, color: '#fff', fontSize: '14.5px' }}>
                      {d.totalLoaves} p.
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {d.unitPriceCFA || (d.channel === 'guichet_comptoir' ? 150 : 110)} F
                    </td>
                    <td style={{ fontWeight: 800, color: '#34d399', fontSize: '14.5px' }}>
                      {(d.totalPriceCFA || d.totalLoaves * (d.unitPriceCFA || 110)).toLocaleString('fr-FR')} F
                    </td>
                    <td>
                      {d.status === 'cloture' ? (
                        <span className="badge badge-success" style={{ fontSize: '10.5px' }}>
                          🏁 Parti
                        </span>
                      ) : (
                        <span className="badge badge-amber" style={{ fontSize: '10.5px' }}>
                          ⏳ Au Sas
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {d.status === 'en_cours' && (
                          <button
                            type="button"
                            className="btn btn-success"
                            onClick={() => handleFinalizeDeparture(d.id)}
                            style={{ padding: '3px 8px', fontSize: '11px' }}
                          >
                            Départ
                          </button>
                        )}
                        {d.status === 'cloture' && (
                          <button
                            onClick={() => handleReopenTicket(d.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--amber-light)' }}
                            title="Réouvrir"
                          >
                            <RefreshCw size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteDelivery(d.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {deliveriesList.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    Aucun chargement enregistré pour le moment.
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
export default CleanDispatchPage;
