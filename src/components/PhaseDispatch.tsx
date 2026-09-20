import React, { useState } from 'react';
import { ShiftState, ShiftPhase, DialloInspection, SouridjiMemberEntry, GenericDeliveryEntry } from '../wat/types';
import { WORKFLOW_PHASES_CONFIG } from '../wat/workflow';
import { DialloInspectorModal } from './DialloInspectorModal';
import { SouridjiGroupModal } from './SouridjiGroupModal';
import { Truck, AlertTriangle, Users, Plus, Trash2, ArrowRight } from 'lucide-react';

interface PhaseDispatchProps {
  state: ShiftState;
  onSaveDialloInspection: (inspection: DialloInspection) => void;
  onDeleteDialloInspection: (id: string) => void;
  onSaveSouridjiMember: (member: SouridjiMemberEntry) => void;
  onDeleteSouridjiMember: (id: string) => void;
  onAddGenericDelivery: (delivery: GenericDeliveryEntry) => void;
  onDeleteGenericDelivery: (id: string) => void;
  onAdvanceToPhase4: () => void;
}

export const PhaseDispatch: React.FC<PhaseDispatchProps> = ({
  state,
  onSaveDialloInspection,
  onDeleteDialloInspection,
  onSaveSouridjiMember,
  onDeleteSouridjiMember,
  onAddGenericDelivery,
  onDeleteGenericDelivery,
  onAdvanceToPhase4
}) => {
  const config = WORKFLOW_PHASES_CONFIG[ShiftPhase.PHASE_3_DISPATCH];
  const [isDialloModalOpen, setIsDialloModalOpen] = useState<boolean>(false);
  const [isSouridjiModalOpen, setIsSouridjiModalOpen] = useState<boolean>(false);

  // Formulaire pour autre livreur
  const [genericName, setGenericName] = useState<string>('');
  const [genericBags, setGenericBags] = useState<number>(10);
  const [genericLoavesPerBag, setGenericLoavesPerBag] = useState<number>(25);

  const totalDialloLoaves = state.dialloInspections.reduce((acc, d) => acc + d.totalBreadsCalculated, 0);
  const totalSouridjiLoaves = state.souridjiMembers.reduce((acc, s) => acc + (s.loavesCount > 0 ? s.loavesCount : s.bagsCount * 25), 0);
  const totalGenericLoaves = state.genericDeliveries.reduce((acc, g) => acc + (g.totalLoaves || g.totalCalculatedLoaves || 0), 0);
  const grandTotalDelivered = totalDialloLoaves + totalSouridjiLoaves + totalGenericLoaves;

  const handleAddGeneric = () => {
    if (!genericName.trim()) return;
    const total = genericBags * genericLoavesPerBag;
    const entry: GenericDeliveryEntry = {
      id: 'gen_del_' + Date.now(),
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      driverName: genericName.trim(),
      driverCategory: 'autre',
      driverType: 'autre',
      bagsCount: genericBags,
      loavesPerBag: genericLoavesPerBag,
      looseLoavesCount: 0,
      totalLoaves: total,
      totalCalculatedLoaves: total,
      notes: 'Livreur standard'
    };
    onAddGenericDelivery(entry);
    setGenericName('');
    setGenericBags(10);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* En-tête de Phase */}
      <div className="glass-card" style={{ borderLeft: '4px solid var(--danger)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Truck size={24} color="#ef4444" />
            <h2 style={{ fontSize: '18px', color: '#fff' }}>{config.title}</h2>
            <span className="badge badge-danger">{config.timeTarget}</span>
          </div>

          <button
            className="btn btn-success"
            onClick={onAdvanceToPhase4}
            style={{ fontSize: '13px' }}
          >
            <span>Passer à la Phase 4 : Clôture & Relève Patron</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Citation de la note vocale */}
        <div style={{
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px dashed rgba(239, 68, 68, 0.35)',
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '13.5px',
          fontStyle: 'italic',
          color: '#fecaca',
          marginTop: '14px',
          lineHeight: '1.5'
        }}>
          « Maintenant <strong>à partir de 3h30 là</strong>, il y a les livreurs qui vont venir, ils vont commencer à compter.
          Là, tu peux retourner ta feuille sur l'autre page là, tu écris le nom de tous les livreurs.
          <strong>Si Diallo vient</strong>, lui il prend par sac. Dans chaque sac, il doit avoir 25 pains. <strong>Tu comptes les pains dans le sac</strong>...
          <strong>Si Souridji aussi arrive</strong>, lui il a beaucoup de personnes dans son groupe, donc chaque personne qui arrive tu demandes c'est qui, la personne dit son nom, tu notes ! »
        </div>
      </div>

      {/* KPI Livraisons en direct */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">
            <Truck size={14} color="var(--amber-light)" />
            <span>Total Pains Livrés</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--amber-light)' }}>{grandTotalDelivered}</div>
          <div className="stat-subtext">Pains emportés par l'ensemble des tournées</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <AlertTriangle size={14} color="#ef4444" />
            <span>Livraisons Diallo</span>
          </div>
          <div className="stat-value">{totalDialloLoaves} pains</div>
          <div className="stat-subtext">
            {state.dialloInspections.some(d => d.isAnomalyDetected) 
              ? '⚠️ Anomalie 27 pains détectée !' 
              : 'Conforme ou en attente'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <Users size={14} color="var(--info)" />
            <span>Équipe Souridji</span>
          </div>
          <div className="stat-value">{totalSouridjiLoaves} pains</div>
          <div className="stat-subtext">{state.souridjiMembers.length} coursier(s) identifié(s)</div>
        </div>
      </div>

      {/* Boutons d'Action Rapide Spécialisés */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        
        {/* Déclencheur Diallo */}
        <div className="glass-card" style={{ border: '1px solid rgba(239, 68, 68, 0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={18} color="#ef4444" />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', color: '#fff' }}>1. Contrôleur Spécial DIALLO</h3>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Vérification physique sac 25 vs 27 pains</p>
            </div>
          </div>
          <p style={{ fontSize: '12.5px', color: '#fca5a5', marginBottom: '14px' }}>
            Ne te fie pas au livreur : ouvre un sac, compte les pains physiquement et calcule le montant exact.
          </p>
          <button
            className="btn btn-danger"
            onClick={() => setIsDialloModalOpen(true)}
            style={{ width: '100%', fontSize: '13.5px' }}
          >
            <span>Ouvrir le Contrôleur Diallo</span>
          </button>
        </div>

        {/* Déclencheur Souridji */}
        <div className="glass-card" style={{ border: '1px solid rgba(59, 130, 246, 0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} color="var(--info)" />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', color: '#fff' }}>2. Groupe SOURIDJI</h3>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Pointage nominatif ("C'est qui ?")</p>
            </div>
          </div>
          <p style={{ fontSize: '12.5px', color: '#bfdbfe', marginBottom: '14px' }}>
            Chaque membre de son équipe doit déclarer son propre prénom/nom et son nombre de sacs.
          </p>
          <button
            className="btn btn-secondary"
            onClick={() => setIsSouridjiModalOpen(true)}
            style={{ width: '100%', fontSize: '13.5px', borderColor: 'rgba(59, 130, 246, 0.5)', color: '#93c5fd' }}
          >
            <span>+ Ajouter un Coursier Souridji</span>
          </button>
        </div>

        {/* Saisie Autre Livreur */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={18} color="var(--amber-light)" />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', color: '#fff' }}>3. Autre Livreur Standard</h3>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Nom, sacs et pains unitaires</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Nom du livreur (ex: Amadou...)"
              value={genericName}
              onChange={(e) => setGenericName(e.target.value)}
              style={{ fontSize: '13px', padding: '6px 10px' }}
            />
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type="number"
                className="form-input"
                placeholder="Sacs"
                value={genericBags}
                onChange={(e) => setGenericBags(parseInt(e.target.value) || 0)}
                style={{ width: '70px', fontSize: '13px', padding: '6px 8px' }}
              />
              <button
                className="btn btn-primary"
                onClick={handleAddGeneric}
                disabled={!genericName.trim()}
                style={{ flex: 1, fontSize: '12.5px', padding: '6px 12px' }}
              >
                Valider ({genericBags * genericLoavesPerBag} pains)
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Registre Exhaustif des Livraisons */}
      <div className="glass-card">
        <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Truck size={18} color="var(--amber-light)" />
          <span>Feuille de Pointage Livreurs (03h30+)</span>
        </h3>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Livreur / Groupe</th>
                <th>Heure</th>
                <th>Conditionnement</th>
                <th>Pains Vérifiés</th>
                <th>Statut / Anomalie</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {/* Diallo */}
              {state.dialloInspections.map((d) => (
                <tr key={d.id} style={{ background: d.isAnomalyDetected ? 'rgba(239, 68, 68, 0.08)' : undefined }}>
                  <td style={{ fontWeight: 700, color: '#f87171' }}>
                    🚚 DIALLO (Principal)
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{d.timestamp}</td>
                  <td>{d.totalBagsTaken} sacs ({d.sampledBagLoavesCount} pains/sac)</td>
                  <td style={{ fontWeight: 800, color: 'var(--amber-light)', fontSize: '15px' }}>
                    {d.totalBreadsCalculated} pains
                  </td>
                  <td>
                    {d.isAnomalyDetected ? (
                      <span className="badge badge-danger">
                        ⚠️ +{d.leakagePerBag} pains/sac ({d.totalFinancialLeakageLoaves} pains écart)
                      </span>
                    ) : (
                      <span className="badge badge-success">Conforme (25 pains/sac)</span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => onDeleteDialloInspection(d.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                      title="Supprimer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}

              {/* Souridji */}
              {state.souridjiMembers.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600, color: '#93c5fd' }}>
                    👥 {s.individualName}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{s.timestamp}</td>
                  <td>{s.bagsCount} sacs</td>
                  <td style={{ fontWeight: 700, color: 'var(--flour-white)' }}>
                    {s.loavesCount > 0 ? s.loavesCount : s.bagsCount * 25} pains
                  </td>
                  <td>
                    <span className="badge badge-info">Équipe Souridji</span>
                  </td>
                  <td>
                    <button
                      onClick={() => onDeleteSouridjiMember(s.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                      title="Supprimer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}

              {/* Génériques */}
              {state.genericDeliveries.map((g) => (
                <tr key={g.id}>
                  <td style={{ fontWeight: 600 }}>
                    {g.driverName}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{g.timestamp}</td>
                  <td>{g.bagsCount} sacs</td>
                  <td style={{ fontWeight: 700 }}>{g.totalLoaves || g.totalCalculatedLoaves || 0} pains</td>
                  <td>
                    <span className="badge badge-amber">Standard</span>
                  </td>
                  <td>
                    <button
                      onClick={() => onDeleteGenericDelivery(g.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                      title="Supprimer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}

              {grandTotalDelivered === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    Aucun livreur consigné pour l'instant. Utilisez les boutons ci-dessus pour pointer Diallo, Souridji ou les autres.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <DialloInspectorModal
        isOpen={isDialloModalOpen}
        onClose={() => setIsDialloModalOpen(false)}
        onSaveInspection={onSaveDialloInspection}
      />

      <SouridjiGroupModal
        isOpen={isSouridjiModalOpen}
        onClose={() => setIsSouridjiModalOpen(false)}
        onSaveMember={onSaveSouridjiMember}
      />

    </div>
  );
};
