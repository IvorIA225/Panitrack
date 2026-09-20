/**
 * PaniTrack - WORKFLOW ENGINE (Moteur de Processus du Framework WAT)
 * Gère la machine à états finis, les phases chronologiques du shift,
 * les fenêtres horaires (00h00, 03h30), les validations et les rappels.
 */

import { ShiftPhase, ShiftState } from './types';

export interface WorkflowPhaseConfig {
  phase: ShiftPhase;
  stepNumber: number;
  title: string;
  shortName: string;
  timeTarget: string;
  badgeColor: string;
  description: string;
  keyInstructions: string[];
  securityWarning?: string;
  diplomaticAdvice?: string;
}

export const WORKFLOW_PHASES_CONFIG: Record<ShiftPhase, WorkflowPhaseConfig> = {
  [ShiftPhase.PHASE_0_ONBOARDING]: {
    phase: ShiftPhase.PHASE_0_ONBOARDING,
    stepNumber: 1,
    title: 'Phase 0 : Arrivée & Posture d’Observation',
    shortName: 'Arrivée',
    timeTarget: 'Début de nuit (20h - 22h)',
    badgeColor: '#3b82f6',
    description: 'Ne viens pas en "chef" ou en inspecteur. Sois humble, courtois et observe le fonctionnement.',
    keyInstructions: [
      'Approche-toi des boulangers et ouvriers avec humilité et politesse.',
      'Dis : "Pardonnez-moi, je suis nouveau, j’aimerais comprendre comment cela se passe ici, vous pouvez m’expliquer un peu ?"',
      'Prépare ton registre (papier ou numérique PaniTrack) avec les colonnes de production.',
      'Gagne la sympathie et la confiance de l’équipe de nuit.'
    ],
    diplomaticAdvice: 'Ne montre jamais de signe d’arrogance ou de suspicion. Les boulangers de nuit travaillent dur dans la chaleur : le respect mutuel est la clé absolue de ton succès.'
  },
  [ShiftPhase.PHASE_1_BAKING]: {
    phase: ShiftPhase.PHASE_1_BAKING,
    stepNumber: 2,
    title: 'Phase 1 : Suivi Production & Fournil',
    shortName: 'Fournil',
    timeTarget: '22h00 - 00h00',
    badgeColor: '#f59e0b',
    description: 'Suivi de chaque sac de farine pétri, comptage des pains sortis des fours et suivi des chariots cuits.',
    keyInstructions: [
      'Chaque fois qu’un sac de farine est ouvert et pétri : note 1 sac.',
      'Lorsque les pains sortent du four : note le nombre de pains (standard : ex. 400 pains par sac).',
      'Note chaque chariot plein qui sort de la cuisson.',
      'Surveille les écarts de rendement farine/pain.'
    ],
    securityWarning: 'Ne saute aucune fournée. Si 400 pains sont prévus par sac et qu’il n’en sort que 350, consigne la remarque sans accuser.'
  },
  [ShiftPhase.PHASE_2_CARTONING]: {
    phase: ShiftPhase.PHASE_2_CARTONING,
    stepNumber: 3,
    title: 'Phase 2 : Mise en Cartons (Dépotage Chariots)',
    shortName: 'Cartons (00h00)',
    timeTarget: 'À partir de 00h00 (Minuit)',
    badgeColor: '#8b5cf6',
    description: 'Les ouvriers libèrent les chariots pour d’autres préparations en transvasant les pains dans les cartons.',
    keyInstructions: [
      'À partir de minuit, les chariots doivent être vidés pour d’autres tâches.',
      'Chaque fois qu’ils versent un chariot dans les cartons : note chariot 1.',
      'Quand ils versent le 2e chariot : note chariot 2.',
      'Note chaque chariot versé successivement jusqu’au dernier.'
    ],
    securityWarning: 'Traçabilité stricte : un chariot versé non consigné crée un trou dans l’inventaire avant l’arrivée des livreurs.'
  },
  [ShiftPhase.PHASE_3_DISPATCH]: {
    phase: ShiftPhase.PHASE_3_DISPATCH,
    stepNumber: 4,
    title: 'Phase 3 : Dispatch & Contrôle des Livreurs',
    shortName: 'Livreurs (03h30)',
    timeTarget: 'À partir de 03h30 du matin',
    badgeColor: '#ef4444',
    description: 'Arrivée des livreurs pour les tournées. Contrôle méticuleux de Diallo, de l’équipe Souridji et des autres.',
    keyInstructions: [
      'Prends une nouvelle page de registre dédiée aux livreurs.',
      'DIALLO : Il prend par sac de 25 pains théoriques. PIÈGE : Ne présume jamais qu’il y a 25 ! Compte physiquement le contenu du sac. S’il y a 27, calcule sur le réel pour éviter la perte financière !',
      'Calcul arithmétique : Nombre de sacs × Pains par sac (ex: 30 sacs × 25 = 750).',
      'SOURIDJI : Il a toute une équipe ! Demande à chaque personne individuelle : "C’est qui ?", note son nom propre et son chargement.',
      'Pour tous les autres livreurs : note le nom, les sacs et la conformité.'
    ],
    securityWarning: 'Vigilance maximale sur le piège des sacs à 27 pains au lieu de 25 (perte de marge nette pour la boulangerie) !'
  },
  [ShiftPhase.PHASE_4_HANDOVER]: {
    phase: ShiftPhase.PHASE_4_HANDOVER,
    stepNumber: 5,
    title: 'Phase 4 : Clôture & Relève avec le Responsable',
    shortName: 'Clôture & Relève',
    timeTarget: 'Au petit matin (Arrivée du responsable)',
    badgeColor: '#10b981',
    description: 'Bilan matière réconcilié, vérification des écarts et remise du rapport officiel en main propre.',
    keyInstructions: [
      'Maintiens le registre à jour jusqu’à ce que le patron ou responsable arrive ("jusqu’à ce que moi j’arrive").',
      'Vérifie la balance matière : Pains cuits - Pains livrés = Solde restant.',
      'Génère et imprime/partage le rapport complet d’audit.',
      'Présente les anomalies constatées avec calme, professionnalisme et preuves chiffrées.'
    ],
    diplomaticAdvice: 'Un rapport propre, horodaté et mathématiquement irréprochable prouvera ta compétence et sécurisera ta place dans la boulangerie.'
  }
};

/**
 * Vérifie si le shift peut transiter vers la phase suivante
 */
export function canTransitionToNextPhase(state: ShiftState, targetPhase: ShiftPhase): { allowed: boolean; reason?: string } {
  switch (targetPhase) {
    case ShiftPhase.PHASE_1_BAKING:
      if (!state.onboardingChecklist.politeApproachDone) {
        return {
          allowed: false,
          reason: 'Veuillez valider la checklist d’approche polie et d’humilité avant de débuter les contrôles de fournil.'
        };
      }
      return { allowed: true };

    case ShiftPhase.PHASE_2_CARTONING:
      if (state.flourBags.length === 0) {
        return {
          allowed: false,
          reason: 'Aucun sac de farine ni production n’a été enregistré en Phase 1. Êtes-vous sûr de passer au cartonnage de minuit ?'
        };
      }
      return { allowed: true };

    case ShiftPhase.PHASE_3_DISPATCH:
      if (state.cartonDumps.length === 0) {
        return {
          allowed: false,
          reason: 'Aucun dépotage de chariot en carton n’a été noté pour le cartonnage de minuit.'
        };
      }
      return { allowed: true };

    case ShiftPhase.PHASE_4_HANDOVER:
      const totalDeliveries = state.dialloInspections.length + state.souridjiMembers.length + state.genericDeliveries.length;
      if (totalDeliveries === 0) {
        return {
          allowed: false,
          reason: 'Aucune livraison consignée en Phase 3. Attendez la fin des tournées avant la clôture finale.'
        };
      }
      return { allowed: true };

    default:
      return { allowed: true };
  }
}
