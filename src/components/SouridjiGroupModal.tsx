import React, { useState } from 'react';
import { SouridjiMemberEntry } from '../wat/types';
import { validateSouridjiMember } from '../wat/tools';
import { Users, Plus, X, AlertCircle } from 'lucide-react';

interface SouridjiGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveMember: (member: SouridjiMemberEntry) => void;
}

export const SouridjiGroupModal: React.FC<SouridjiGroupModalProps> = ({
  isOpen,
  onClose,
  onSaveMember
}) => {
  const [individualName, setIndividualName] = useState<string>('');
  const [bagsCount, setBagsCount] = useState<number>(5);
  const [loavesCount, setLoavesCount] = useState<number>(125); // 5 x 25
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleBagsChange = (val: number) => {
    setBagsCount(val);
    setLoavesCount(val * 25);
  };

  const handleSave = () => {
    const validation = validateSouridjiMember(individualName, bagsCount, loavesCount);
    if (!validation.isValid) {
      setErrorMessage(validation.error || 'Données invalides');
      return;
    }

    const member: SouridjiMemberEntry = {
      id: 'souridji_mem_' + Date.now(),
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      individualName: individualName.trim(),
      bagsCount,
      loavesCount,
      notes: 'Membre équipe Souridji'
    };

    onSaveMember(member);
    setIndividualName('');
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        
        {/* En-tête */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(59, 130, 246, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Users size={22} color="var(--info)" />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', color: '#fff' }}>Enregistrement Équipe SOURIDJI</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Pointage nominatif individuel ("Demande c'est qui !")
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Rappel Note Vocale */}
        <div style={{
          background: 'rgba(59, 130, 246, 0.08)',
          border: '1px dashed rgba(59, 130, 246, 0.35)',
          borderRadius: '12px',
          padding: '12px',
          fontSize: '13px',
          color: '#bfdbfe',
          lineHeight: '1.5'
        }}>
          « Si Souridji aussi arrive, lui il a beaucoup de personnes dans son groupe.
          Donc <strong>chaque personne qui arrive tu demandes c'est qui</strong>, la personne dit son nom, tu notes.
          Tu demandes c'est qui, la personne dit son nom, tu notes. <strong>Jusqu'à ce que moi j'arrive.</strong> »
        </div>

        {/* Message d'erreur éventuel */}
        {errorMessage && (
          <div className="alert-box alert-box-danger" style={{ margin: 0 }}>
            <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
            <div>{errorMessage}</div>
          </div>
        )}

        {/* Formulaire */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          <div className="form-group">
            <label className="form-label">
              Prénom & Nom du livreur individuel présent (Question : "C'est qui ?") *
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: Moussa, Ousmane, Ibrahim..."
              value={individualName}
              onChange={(e) => {
                setIndividualName(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              autoFocus
              style={{ fontSize: '15px' }}
            />
            <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
              Ne notez pas "Souridji" globalement : chaque coursier doit être identifié individuellement.
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Nombre de sacs chargés</label>
              <input
                type="number"
                className="form-input"
                value={bagsCount}
                onChange={(e) => handleBagsChange(parseInt(e.target.value) || 0)}
                style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Total pains (à 25/sac)</label>
              <input
                type="number"
                className="form-input"
                value={loavesCount}
                onChange={(e) => setLoavesCount(parseInt(e.target.value) || 0)}
                style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--amber-light)' }}
              />
            </div>
          </div>

        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Annuler
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            <Plus size={16} />
            <span>Valider ce coursier ({individualName || 'Inconnu'} : {loavesCount} pains)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
