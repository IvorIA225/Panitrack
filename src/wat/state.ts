/**
 * PaniTrack - GESTIONNAIRE D'ÉTAT & PERSISTANCE SÉCURISÉE
 * Sauvegarde automatique dans le LocalStorage avec journalisation d'audit.
 * Intégration du système et protocole « Zéro Manquant ».
 */

import { ShiftState, ShiftPhase, AuditLogEntry, OFFICIAL_UNIT_PRICES } from './types';
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
  quarantineStockBags: 0,
  activeDockDeliveryId: null,
  unitPrices: {
    guichet_comptoir: OFFICIAL_UNIT_PRICES.guichet_comptoir,
    livreur_officiel: OFFICIAL_UNIT_PRICES.livreur_officiel,
    adjara_grossiste: OFFICIAL_UNIT_PRICES.adjara_grossiste
  },
  protocolChecklist: {
    quarantineEnforced: true,
    antiSecheDisplayed: true,
    oneByOneSanctified: true,
    bagsSealed25: true,
    channelsSeparated: true,
    photoProofRequired: true
  },
  auditLogs: [
    createAuditLog(
      ShiftPhase.PHASE_0_ONBOARDING,
      'workflow',
      'Initialisation du shift PaniTrack. Protocole Zéro Manquant activé.',
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
Pour garantir le **ZÉRO MANQUANT**, nous appliquons mécaniquement les 4 piliers :
1. **Terrain :** Zone de quarantaine, anti-sèche 1s=25p et sas « un par un ».
2. **Production :** 400 pâtons par sac, démarque des brûlés/cassés comptabilisée.
3. **Distribution :** Sacs scellés à 25, canaux scindés (Livreurs 110 F, ADJARA 110 F, Guichet 150 F).
4. **Automatisation :** Preuve photo horodatée, saisie simplifiée et calcul financier FCFA instantané.`
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
        countedPhysicalStockRemaining: typeof parsed.countedPhysicalStockRemaining === 'number' ? parsed.countedPhysicalStockRemaining : undefined,
        unitPrices: {
          guichet_comptoir: parsed.unitPrices?.guichet_comptoir ?? OFFICIAL_UNIT_PRICES.guichet_comptoir,
          livreur_officiel: parsed.unitPrices?.livreur_officiel ?? OFFICIAL_UNIT_PRICES.livreur_officiel,
          adjara_grossiste: parsed.unitPrices?.adjara_grossiste ?? OFFICIAL_UNIT_PRICES.adjara_grossiste
        },
        protocolChecklist: {
          ...INITIAL_SHIFT_STATE.protocolChecklist,
          ...(parsed.protocolChecklist || {})
        },
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
 * Charge le scénario typique complet de la note vocale avec les 4 piliers Zéro Manquant
 */
export function loadVoiceNoteDemoScenario(): ShiftState {
  const demoLogs: AuditLogEntry[] = [
    createAuditLog(ShiftPhase.PHASE_0_ONBOARDING, 'workflow', 'Prise de poste avec courtoisie. Protocole Zéro Manquant initialisé.', 'success'),
    createAuditLog(ShiftPhase.PHASE_1_BAKING, 'production', '2 sacs de farine travaillés. 40 pâtes (20/sac) = 800 pâtons bruts, 8 brûlés, 4 cassés = 788 vendables nets.', 'info'),
    createAuditLog(ShiftPhase.PHASE_2_CARTONING, 'cartonnage', 'Minuit : chariots vidés et emballés pour la tournée.', 'info'),
    createAuditLog(ShiftPhase.PHASE_3_DISPATCH, 'securite', 'ALERTE DIALLO : Contrôle physique d’un sac = 27 pains au lieu de 25 (+2 pains par sac). Prise de 30 sacs = 810 pains réels au lieu de 750 théoriques.', 'danger'),
    createAuditLog(ShiftPhase.PHASE_3_DISPATCH, 'livraison', 'Distribution scindée : Livreurs officiels (110 F), Section ADJARA (110 F) et Guichet (150 F).', 'success')
  ];

  return {
    shiftId: 'DEMO-ZERO-MANQUANT',
    operatorName: 'Apprenti Contrôleur',
    startedAt: '21:00',
    currentPhase: ShiftPhase.PHASE_3_DISPATCH,
    targetFlourBags: 9,
    quarantineStockBags: 12,
    activeDockDeliveryId: null,
    unitPrices: {
      guichet_comptoir: 150,
      livreur_officiel: 110,
      adjara_grossiste: 110
    },
    protocolChecklist: {
      quarantineEnforced: true,
      antiSecheDisplayed: true,
      oneByOneSanctified: true,
      bagsSealed25: true,
      channelsSeparated: true,
      photoProofRequired: true
    },
    flourBags: [
      {
        id: 'fb_1',
        timestamp: '22:15',
        bagIndex: 1,
        patesCount: 20,
        loavesPerPate: 20,
        expectedLoaves: 400,
        actualLoaves: 400,
        burnedLoaves: 5,
        brokenLoaves: 2,
        netVendableLoaves: 393,
        deltaQuotaLoaves: 0,
        notes: 'Sac #1 : 20 pâtes conformes (400 baguettes). 7 démarques (5 brûlés, 2 cassés)'
      },
      {
        id: 'fb_2',
        timestamp: '23:30',
        bagIndex: 2,
        patesCount: 20,
        loavesPerPate: 20,
        expectedLoaves: 400,
        actualLoaves: 400,
        burnedLoaves: 3,
        brokenLoaves: 2,
        netVendableLoaves: 395,
        deltaQuotaLoaves: 0,
        notes: 'Sac #2 : 20 pâtes conformes (400 baguettes). 5 démarques (3 brûlés, 2 cassés)'
      }
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
        closedAt: '03:48',
        driverName: 'Diallo (Tournée Principale)',
        channel: 'livreur_officiel',
        driverCategory: 'diallo',
        status: 'cloture',
        loadingBayStatus: 'completed',
        bagsCount: 30,
        sealedBagsCount: 30,
        loavesPerBag: 27, // Piège audio
        looseLoavesCount: 0,
        totalLoaves: 810,
        unitPriceCFA: 110,
        totalPriceCFA: 89100, // 810 x 110 F
        notes: '⚠️ Sac vérifié à 27 pains (+2/sac). 60 pains supplémentaires détectés !',
        isAnomaly: true
      },
      {
        id: 'del_moussa_1',
        timestamp: '03:50',
        closedAt: '03:55',
        driverName: 'Moussa (Groupe Souridji)',
        channel: 'livreur_officiel',
        driverCategory: 'souridji',
        status: 'cloture',
        loadingBayStatus: 'completed',
        bagsCount: 10,
        sealedBagsCount: 10,
        loavesPerBag: 25,
        looseLoavesCount: 0,
        totalLoaves: 250,
        unitPriceCFA: 110,
        totalPriceCFA: 27500, // 250 x 110 F
        notes: '10 sacs scellés à 25'
      },
      {
        id: 'del_adjara_1',
        timestamp: '04:15',
        closedAt: '04:22',
        driverName: 'Grossiste ADJARA (Dépôt Central)',
        channel: 'adjara_grossiste',
        driverCategory: 'adjara',
        status: 'cloture',
        loadingBayStatus: 'completed',
        bagsCount: 12,
        sealedBagsCount: 12,
        loavesPerBag: 25,
        looseLoavesCount: 0,
        totalLoaves: 300,
        unitPriceCFA: 110,
        totalPriceCFA: 33000, // 300 x 110 F
        notes: '12 sacs scellés section ADJARA'
      },
      {
        id: 'del_guichet_1',
        timestamp: '04:30',
        closedAt: '04:35',
        driverName: 'Vente Guichet (Comptoir Matin)',
        channel: 'guichet_comptoir',
        driverCategory: 'guichet',
        status: 'cloture',
        loadingBayStatus: 'completed',
        bagsCount: 2,
        sealedBagsCount: 2,
        loavesPerBag: 25,
        looseLoavesCount: 20,
        totalLoaves: 70, // 50 + 20
        unitPriceCFA: 150,
        totalPriceCFA: 10500, // 70 x 150 F
        notes: 'Comptant guichet : 2 sacs + 20 vrac'
      }
    ],
    dialloInspections: [
      {
        id: 'diallo_sample_1',
        timestamp: '03:40',
        totalBagsTaken: 30,
        theoreticalLoavesPerBag: 25,
        sampledBagLoavesCount: 27,
        isAnomalyDetected: true,
        leakagePerBag: 2,
        totalFinancialLeakageLoaves: 60,
        totalBreadsCalculated: 810,
        notes: 'ATTENTION : Sur-remplissage constaté (+2 pains par sac). 60 pains supplémentaires détectés grâce au comptage physique !',
        verified: true
      }
    ],
    souridjiMembers: [
      { id: 'sm_1', timestamp: '03:50', individualName: 'Moussa (Groupe Souridji)', bagsCount: 10, loavesCount: 250, notes: 'Vérifié' }
    ],
    genericDeliveries: [],
    auditLogs: demoLogs,
    agentMessages: [
      {
        id: 'msg_demo_1',
        timestamp: '03:41',
        sender: 'agent',
        category: 'alerte',
        content: `🚨 **ALERTE ANOMALIE DIALLO DÉTECTÉE !**
Vous avez ouvert un sac de Diallo et compté **27 pains** au lieu des 25 prévus.
Comme Diallo charge **30 sacs**, si vous n’aviez pas recompté comme le demandait la règle des 25, **60 pains** auraient quitté la boulangerie sans traçabilité !
Total exact tracé et facturé : **810 pains = 89 100 FCFA** (à 110 F/pain).`
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
