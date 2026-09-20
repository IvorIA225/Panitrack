import React from 'react';
import { ShiftPhase, ShiftState } from '../wat/types';
import { WORKFLOW_PHASES_CONFIG } from '../wat/workflow';
import { CheckCircle2, ChevronRight, UserCheck, Flame, Box, Truck, FileCheck } from 'lucide-react';

interface WorkflowNavigationProps {
  currentPhase: ShiftPhase;
  onSelectPhase: (phase: ShiftPhase) => void;
  state: ShiftState;
}

export const WorkflowNavigation: React.FC<WorkflowNavigationProps> = ({
  currentPhase,
  onSelectPhase,
  state
}) => {
  const phases = [
    ShiftPhase.PHASE_0_ONBOARDING,
    ShiftPhase.PHASE_1_BAKING,
    ShiftPhase.PHASE_2_CARTONING,
    ShiftPhase.PHASE_3_DISPATCH,
    ShiftPhase.PHASE_4_HANDOVER
  ];

  const getIcon = (phase: ShiftPhase, isSelected: boolean) => {
    const size = 18;
    const color = isSelected ? '#fff' : 'var(--text-muted)';
    switch (phase) {
      case ShiftPhase.PHASE_0_ONBOARDING:
        return <UserCheck size={size} color={color} />;
      case ShiftPhase.PHASE_1_BAKING:
        return <Flame size={size} color={color} />;
      case ShiftPhase.PHASE_2_CARTONING:
        return <Box size={size} color={color} />;
      case ShiftPhase.PHASE_3_DISPATCH:
        return <Truck size={size} color={color} />;
      case ShiftPhase.PHASE_4_HANDOVER:
        return <FileCheck size={size} color={color} />;
    }
  };

  const isPhaseCompleted = (phase: ShiftPhase): boolean => {
    switch (phase) {
      case ShiftPhase.PHASE_0_ONBOARDING:
        return state.onboardingChecklist.politeApproachDone;
      case ShiftPhase.PHASE_1_BAKING:
        return state.flourBags.length > 0;
      case ShiftPhase.PHASE_2_CARTONING:
        return state.cartonDumps.length > 0;
      case ShiftPhase.PHASE_3_DISPATCH:
        return (state.dialloInspections.length + state.souridjiMembers.length + state.genericDeliveries.length) > 0;
      case ShiftPhase.PHASE_4_HANDOVER:
        return false;
    }
  };

  return (
    <nav className="glass-card" style={{ padding: '12px 16px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '4px'
      }}>
        {phases.map((phaseKey, index) => {
          const config = WORKFLOW_PHASES_CONFIG[phaseKey];
          const isSelected = currentPhase === phaseKey;
          const completed = isPhaseCompleted(phaseKey);

          return (
            <React.Fragment key={phaseKey}>
              <button
                onClick={() => onSelectPhase(phaseKey)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: isSelected 
                    ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(180, 83, 9, 0.2) 100%)' 
                    : 'rgba(15, 23, 42, 0.5)',
                  border: isSelected 
                    ? '1px solid var(--amber-primary)' 
                    : '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  color: isSelected ? '#fff' : 'var(--text-muted)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 0 14px rgba(245, 158, 11, 0.3)' : 'none'
                }}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: isSelected ? 'var(--amber-primary)' : 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {completed ? (
                    <CheckCircle2 size={16} color={isSelected ? '#000' : 'var(--success)'} />
                  ) : (
                    getIcon(phaseKey, isSelected)
                  )}
                </div>

                <div style={{ textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      color: isSelected ? 'var(--amber-light)' : 'var(--text-dim)',
                      fontWeight: 700
                    }}>
                      Étape {config.stepNumber}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>• {config.timeTarget}</span>
                  </div>
                  <div style={{
                    fontSize: '13.5px',
                    fontWeight: isSelected ? 700 : 600,
                    color: isSelected ? '#fff' : 'var(--flour-white)'
                  }}>
                    {config.shortName}
                  </div>
                </div>
              </button>

              {index < phases.length - 1 && (
                <ChevronRight size={16} color="var(--border-subtle)" style={{ flexShrink: 0 }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
};
