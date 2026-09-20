/**
 * PaniTrack - GESTIONNAIRE D'ÉTAT & PERSISTANCE SÉCURISÉE
 * Sauvegarde automatique dans le LocalStorage avec journalisation d'audit.
 */

import { ShiftState, ShiftPhase, AuditLogEntry } from './types';
import { createAuditLog } from './tools';

const STORAGE_KEY = 'panitrack_shift_state_v1';

export const INITIAL_SHIFT_STATE: ShiftState = {
  shiftId: 'SHIFT-' + new Date().toISOString().slice(0, 10) + '-01',
  operatorName: 'Contrôleur de Shift',
  startedAt: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
  currentPhase: ShiftPhase.PHASE_0_ONBOARDING,
  targetFlourBags: 9, // Objectif standard 9 sacs par shift
  flourBags: [],
  carts: [],
  cartonDumps: [],
  deliveries: [],
  dialloInspections: [],
  souridjiMembers: [],
  genericDeliveries: [],
  auditLogs: [
    createAuditLog(
      ShiftPhase.PHASE_0_ONBOARDING,
      'workflow',
      'Initialisation du shift PaniTrack. Mode sécurisé activé.',
      'info'
    )
  ],
  agentMessages: [
    {
      id: 'welcome_1',
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      sender: 'agent',
      category: 'conseil',
      content: `👋 **Bienvenue sur PaniTrack !** Je suis ton Copilote IA pour ce shift de nuit en boulangerie.
Je vais t'accompagner étape par étape selon les consignes exactes de la note vocale :
1. Posture diplomatique avec les ouvriers
2. Suivi de la farine & des 400 pains par sac
3. Cartonnage de minuit
4. Contrôle critique des livreurs à 03h30 (Diallo & équipe Souridji)
5. Bilan réconcilié pour l'arrivée du patron.`
    }
  ],
  onboardingChecklist: {
    politeApproachDone: false,
    explainedNewStatus: false,
    workerContactEstablished: false,
    registerPaperReady: false
  }
};

export function loadShiftState(): ShiftState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...INITIAL_SHIFT_STATE,
        ...parsed,
        targetFlourBags: typeof parsed.targetFlourBags === 'number' && parsed.targetFlourBags > 0 ? parsed.targetFlourBags : 9,
        flourBags: Array.isArray(parsed.flourBags) ? parsed.flourBags : [],
        carts: Array.isArray(parsed.carts) ? parsed.carts : [],
        cartonDumps: Array.isArray(parsed.cartonDumps) ? parsed.cartonDumps : [],
        deliveries: Array.isArray(parsed.deliveries) ? parsed.deliveries : [],
        dialloInspections: Array.isArray(parsed.dialloInspections) ? parsed.dialloInspections : [],
        souridjiMembers: Array.isArray(parsed.souridjiMembers) ? parsed.souridjiMembers : [],
        genericDeliveries: Array.isArray(parsed.genericDeliveries) ? parsed.genericDeliveries : [],
        auditLogs: Array.isArray(parsed.auditLogs) && parsed.auditLogs.length > 0 ? parsed.auditLogs : INITIAL_SHIFT_STATE.auditLogs,
        agentMessages: Array.isArray(parsed.agentMessages) && parsed.agentMessages.length > 0 ? parsed.agentMessages : INITIAL_SHIFT_STATE.agentMessages,
        onboardingChecklist: {
          ...INITIAL_SHIFT_STATE.onboardingChecklist,
          ...(parsed.onboardingChecklist || {})
        }
      };
    }
  } catch (e) {
    console.error('Erreur chargement LocalStorage:', e);
  }
  return INITIAL_SHIFT_STATE;
}

export function saveShiftState(state: ShiftState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Erreur sauvegarde LocalStorage:', e);
  }
}

export function resetShiftState(): ShiftState {
  localStorage.removeItem(STORAGE_KEY);
  return { ...INITIAL_SHIFT_STATE, shiftId: 'SHIFT-' + new Date().toISOString().slice(0, 10) + '-' + Math.floor(Math.random() * 100) };
}

/**
 * Charge le scénario typique complet de la note vocale pour démonstration instantanée
 */
export function loadVoiceNoteDemoScenario(): ShiftState {
  const demoLogs: AuditLogEntry[] = [
    createAuditLog(ShiftPhase.PHASE_0_ONBOARDING, 'workflow', 'Prise de poste avec courtoisie auprès des boulangers de nuit.', 'success'),
    createAuditLog(ShiftPhase.PHASE_1_BAKING, 'production', '2 sacs de farine travaillés. 800 pains sortis (400 par sac).', 'info'),
    createAuditLog(ShiftPhase.PHASE_2_CARTONING, 'cartonnage', 'Minuit : 4 chariots vidés et versés dans les cartons.', 'info'),
    createAuditLog(ShiftPhase.PHASE_3_DISPATCH, 'securite', 'ALERTE DIALLO : Contrôle physique d’un sac = 27 pains au lieu de 25 (+2 pains par sac). Prise de 30 sacs = 810 pains réels au lieu de 750 théoriques.', 'danger'),
    createAuditLog(ShiftPhase.PHASE_3_DISPATCH, 'livraison', 'Équipe Souridji : 3 livreurs individuels enregistrés nominativement (Moussa, Ibrahim, Ousmane).', 'success')
  ];

  return {
    shiftId: 'DEMO-VOCAL-NOTE',
    operatorName: 'Apprenti Contrôleur',
    startedAt: '21:00',
    currentPhase: ShiftPhase.PHASE_3_DISPATCH,
    targetFlourBags: 9,
    flourBags: [
      { id: 'fb_1', timestamp: '22:15', bagIndex: 1, expectedLoaves: 400, actualLoaves: 400, notes: 'Première fournée normale' },
      { id: 'fb_2', timestamp: '23:30', bagIndex: 2, expectedLoaves: 400, actualLoaves: 400, notes: 'Deuxième pétrin parfait' }
    ],
    carts: [
      { id: 'c_1', timestamp: '22:45', cartNumber: 1, loavesCount: 180, physicalCapacity: 200, lossCompensationBuffer: 20, status: 'verse_carton' },
      { id: 'c_2', timestamp: '23:10', cartNumber: 2, loavesCount: 180, physicalCapacity: 200, lossCompensationBuffer: 20, status: 'verse_carton' },
      { id: 'c_3', timestamp: '23:45', cartNumber: 3, loavesCount: 180, physicalCapacity: 200, lossCompensationBuffer: 20, status: 'verse_carton' },
      { id: 'c_4', timestamp: '00:10', cartNumber: 4, loavesCount: 180, physicalCapacity: 200, lossCompensationBuffer: 20, status: 'verse_carton' }
    ],
    cartonDumps: [
      { id: 'cd_1', timestamp: '00:05', cartSequenceNumber: 1, cartonCount: 4, estimatedLoaves: 200, notes: 'Versé dans 4 cartons' },
      { id: 'cd_2', timestamp: '00:20', cartSequenceNumber: 2, cartonCount: 4, estimatedLoaves: 200, notes: 'Versé dans 4 cartons' },
      { id: 'cd_3', timestamp: '00:45', cartSequenceNumber: 3, cartonCount: 4, estimatedLoaves: 200, notes: 'Versé dans 4 cartons' },
      { id: 'cd_4', timestamp: '01:10', cartSequenceNumber: 4, cartonCount: 4, estimatedLoaves: 200, notes: 'Versé dans 4 cartons' }
    ],
    deliveries: [
      {
        id: 'del_diallo_1',
        timestamp: '03:40',
        driverName: 'Diallo (Tournée Principale)',
        driverCategory: 'diallo',
        bagsCount: 30,
        loavesPerBag: 27, // Piège audio
        looseLoavesCount: 0,
        totalLoaves: 810,
        notes: '⚠️ Sac vérifié à 27 pains (+2/sac). 60 pains supplémentaires détectés !',
        isAnomaly: true
      },
      {
        id: 'del_moussa_1',
        timestamp: '03:50',
        driverName: 'Moussa (Groupe Souridji)',
        driverCategory: 'souridji',
        bagsCount: 10,
        loavesPerBag: 25,
        looseLoavesCount: 0,
        totalLoaves: 250,
        notes: '10 sacs complets'
      },
      {
        id: 'del_ibrahim_1',
        timestamp: '04:10',
        driverName: 'Ibrahim (Groupe Souridji)',
        driverCategory: 'souridji',
        bagsCount: 8,
        loavesPerBag: 25,
        looseLoavesCount: 0,
        totalLoaves: 200,
        notes: '8 sacs complets'
      },
      {
        id: 'del_ousmane_1',
        timestamp: '04:25',
        driverName: 'Ousmane (Groupe Souridji)',
        driverCategory: 'souridji',
        bagsCount: 5,
        loavesPerBag: 25,
        looseLoavesCount: 14, // 5 sacs + 14 pains en vrac hors quota !
        totalLoaves: 139,
        notes: '5 sacs de 25 + 14 pains au détail hors sac'
      },
      {
        id: 'del_amadou_1',
        timestamp: '04:40',
        driverName: 'Amadou (Livreur Vélo)',
        driverCategory: 'autre',
        bagsCount: 0, // Moins d'un sac complet !
        loavesPerBag: 25,
        looseLoavesCount: 18, // 18 pains en vrac
        totalLoaves: 18,
        notes: '18 pains au détail (pas de sac complet)'
      }
    ],
    dialloInspections: [
      {
        id: 'diallo_sample_1',
        timestamp: '03:40',
        totalBagsTaken: 30,
        theoreticalLoavesPerBag: 25,
        sampledBagLoavesCount: 27, // LE PIÈGE RELEVÉ DANS L'AUDIO !
        isAnomalyDetected: true,
        leakagePerBag: 2,
        totalFinancialLeakageLoaves: 60,
        totalBreadsCalculated: 810, // 30 x 27
        notes: 'ATTENTION : Sur-remplissage constaté (+2 pains par sac). 60 pains supplémentaires détectés grâce au comptage physique !',
        verified: true
      }
    ],
    souridjiMembers: [
      { id: 'sm_1', timestamp: '03:50', individualName: 'Moussa (Groupe Souridji)', bagsCount: 10, loavesCount: 250, notes: 'Vérifié' },
      { id: 'sm_2', timestamp: '04:10', individualName: 'Ibrahim (Groupe Souridji)', bagsCount: 8, loavesCount: 200, notes: 'Vérifié' },
      { id: 'sm_3', timestamp: '04:25', individualName: 'Ousmane (Groupe Souridji)', bagsCount: 6, loavesCount: 150, notes: 'Vérifié' }
    ],
    genericDeliveries: [
      {
        id: 'gd_1',
        timestamp: '04:00',
        driverName: 'Amadou (Livreur Centre-Ville)',
        driverCategory: 'autre',
        driverType: 'autre',
        bagsCount: 4,
        loavesPerBag: 25,
        looseLoavesCount: 0,
        totalLoaves: 100,
        totalCalculatedLoaves: 100,
        notes: 'Conforme'
      }
    ],
    auditLogs: demoLogs,
    agentMessages: [
      {
        id: 'msg_demo_1',
        timestamp: '03:41',
        sender: 'agent',
        category: 'alerte',
        content: `🚨 **ALERTE ANOMALIE DIALLO DÉTECTÉE !**
Vous avez ouvert un sac de Diallo et compté **27 pains** au lieu des 25 prévus.
Comme Diallo charge **30 sacs**, si vous n’aviez pas recompté comme le demandait la note vocale, **60 pains** auraient quitté la boulangerie sans traçabilité !
Le système a enregistré le total exact de **810 pains**.`
      }
    ],
    onboardingChecklist: {
      politeApproachDone: true,
      explainedNewStatus: true,
      workerContactEstablished: true,
      registerPaperReady: true
    }
  };
}
