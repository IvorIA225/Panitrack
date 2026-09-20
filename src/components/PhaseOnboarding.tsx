import React from 'react';
import { ShiftState, ShiftPhase } from '../wat/types';
import { WORKFLOW_PHASES_CONFIG } from '../wat/workflow';
import { HeartHandshake, CheckSquare, MessageCircle, ArrowRight, Lightbulb } from 'lucide-react';

interface PhaseOnboardingProps {
  state: ShiftState;
  onUpdateChecklist: (key: keyof ShiftState['onboardingChecklist'], val: boolean) => void;
  onAdvanceToPhase1: () => void;
}

export const PhaseOnboarding: React.FC<PhaseOnboardingProps> = ({
  state,
  onUpdateChecklist,
  onAdvanceToPhase1
}) => {
  const config = WORKFLOW_PHASES_CONFIG[ShiftPhase.PHASE_0_ONBOARDING];
  const checklist = state.onboardingChecklist;
  const allChecked = checklist.politeApproachDone && checklist.explainedNewStatus && checklist.workerContactEstablished && checklist.registerPaperReady;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Bannière d'instructions clé de la note vocale */}
      <div className="glass-card" style={{ borderLeft: '4px solid var(--amber-primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <HeartHandshake size={24} color="var(--amber-light)" />
          <h2 style={{ fontSize: '18px', color: '#fff' }}>{config.title}</h2>
          <span className="badge badge-amber">{config.timeTarget}</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '14.5px', marginBottom: '16px' }}>
          {config.description}
        </p>

        {/* Citation exacte de la note vocale */}
        <div style={{
          background: 'rgba(245, 158, 11, 0.08)',
          border: '1px dashed rgba(245, 158, 11, 0.35)',
          borderRadius: '12px',
          padding: '14px 18px',
          fontSize: '14px',
          fontStyle: 'italic',
          color: '#fef3c7',
          lineHeight: '1.6',
          marginBottom: '16px'
        }}>
          « D'abord si tu t'en vas là, <strong>faut pas partir en tant que quelqu'un qui s'y connait</strong>.
          Genre si tu arrives, tu t'approches des travailleurs là, tu essaies de causer bien bien avec eux quoi :
          <em>"Ah pardon, comment ceci se passe ? Comme je suis nouveau là... j'aimerais que vous m'expliquiez un peu..."</em>
          Un truc comme ça, tu les approches un peu un peu. »
        </div>

        <div className="alert-box alert-box-info" style={{ margin: 0 }}>
          <Lightbulb size={20} color="#60a5fa" style={{ flexShrink: 0 }} />
          <div>
            <strong>Conseil Stratégique de l'Agent :</strong> La chaleur du fournil et la nuit rendent le travail physique exigeant.
            Si tu te positionnes en allié respectueux plutôt qu'en contrôleur froid, les ouvriers t'aideront spontanément à ne rater aucun sac et aucun chariot !
          </div>
        </div>
      </div>

      {/* Checklist interactive d'intégration */}
      <div className="glass-card">
        <h3 style={{ fontSize: '16px', color: 'var(--flour-white)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckSquare size={18} color="var(--amber-light)" />
          <span>Checklist d'Arrivée & d'Humilité (Obligatoire avant les comptages)</span>
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          <label style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '14px',
            borderRadius: '12px',
            cursor: 'pointer',
            border: checklist.politeApproachDone ? '1px solid var(--success)' : '1px solid var(--border-subtle)'
          }}>
            <input 
              type="checkbox" 
              checked={checklist.politeApproachDone} 
              onChange={(e) => onUpdateChecklist('politeApproachDone', e.target.checked)}
              style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: 'var(--amber-primary)' }}
            />
            <div>
              <div style={{ fontWeight: 600, color: '#fff' }}>1. Approche polie et amicale sans faire le "connaisseur"</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Saluer l'équipe du fournil avec chaleur et respect du travail manuel de nuit.
              </div>
            </div>
          </label>

          <label style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '14px',
            borderRadius: '12px',
            cursor: 'pointer',
            border: checklist.explainedNewStatus ? '1px solid var(--success)' : '1px solid var(--border-subtle)'
          }}>
            <input 
              type="checkbox" 
              checked={checklist.explainedNewStatus} 
              onChange={(e) => onUpdateChecklist('explainedNewStatus', e.target.checked)}
              style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: 'var(--amber-primary)' }}
            />
            <div>
              <div style={{ fontWeight: 600, color: '#fff' }}>2. Explication de mon statut de nouvel arrivant</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Leur dire que j'apprends le fonctionnement et solliciter leurs explications de manière valorisante.
              </div>
            </div>
          </label>

          <label style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '14px',
            borderRadius: '12px',
            cursor: 'pointer',
            border: checklist.workerContactEstablished ? '1px solid var(--success)' : '1px solid var(--border-subtle)'
          }}>
            <input 
              type="checkbox" 
              checked={checklist.workerContactEstablished} 
              onChange={(e) => onUpdateChecklist('workerContactEstablished', e.target.checked)}
              style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: 'var(--amber-primary)' }}
            />
            <div>
              <div style={{ fontWeight: 600, color: '#fff' }}>3. Contact établi avec le chef pétrin & les cuiseurs</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Identifier l'artisan qui ouvre les sacs de farine et les ouvriers qui sortent les chariots du four.
              </div>
            </div>
          </label>

          <label style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '14px',
            borderRadius: '12px',
            cursor: 'pointer',
            border: checklist.registerPaperReady ? '1px solid var(--success)' : '1px solid var(--border-subtle)'
          }}>
            <input 
              type="checkbox" 
              checked={checklist.registerPaperReady} 
              onChange={(e) => onUpdateChecklist('registerPaperReady', e.target.checked)}
              style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: 'var(--amber-primary)' }}
            />
            <div>
              <div style={{ fontWeight: 600, color: '#fff' }}>4. Registre PaniTrack & bloc-notes prêts pour la saisie</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Dispositif prêt pour pointer chaque sac de farine et chaque sortie de chariot.
              </div>
            </div>
          </label>
        </div>

        {/* Bouton de passage à la phase suivante */}
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="btn btn-primary btn-large"
            disabled={!allChecked}
            onClick={onAdvanceToPhase1}
            style={{
              opacity: allChecked ? 1 : 0.45,
              cursor: allChecked ? 'pointer' : 'not-allowed'
            }}
          >
            <span>Passer à la Phase 1 : Fournil & Production</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Guide des phrases types diplomatiques */}
      <div className="glass-card">
        <h4 style={{ fontSize: '14px', color: 'var(--amber-light)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MessageCircle size={16} />
          <span>Phrases recommandées pour aborder les ouvriers :</span>
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '12px', borderRadius: '10px', fontSize: '13px' }}>
            💬 <em>"Bonsoir les maîtres ! Je débute aujourd'hui, vous faites un travail magnifique. Montrez-moi votre rythme pour que je ne vous dérange pas."</em>
          </div>
          <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '12px', borderRadius: '10px', fontSize: '13px' }}>
            💬 <em>"À chaque fois qu'un sac de farine est versé, faites-moi un petit signe pour que je le note bien au propre."</em>
          </div>
        </div>
      </div>
    </div>
  );
};
