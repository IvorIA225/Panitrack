/**
 * PaniTrack - Définition des types pour le Framework WAT (Workflow, Agent, Outils)
 * Système & Protocole « Zéro Manquant » pour la distribution de pain cuit.
 */

export enum ShiftPhase {
  PHASE_0_ONBOARDING = 'PHASE_0_ONBOARDING',   // Arrivée & Posture diplomatique
  PHASE_1_BAKING = 'PHASE_1_BAKING',           // Suivi sacs farine (400 pâtons), cuisson & démarque
  PHASE_2_CARTONING = 'PHASE_2_CARTONING',     // Dépotage minuit chariots -> cartons
  PHASE_3_DISPATCH = 'PHASE_3_DISPATCH',       // 03h30 : Livreurs, ADJARA & Guichet
  PHASE_4_HANDOVER = 'PHASE_4_HANDOVER'        // Arrivée responsable, balance & clôture
}

/**
 * Canaux de distribution strictement séparés (Pilier 3 du protocole)
 */
export type DistributionChannel = 'livreur_officiel' | 'adjara_grossiste' | 'guichet_comptoir';

/**
 * Grille tarifaire officielle arrêtée avec le patron :
 * - Guichet / Clients Lambda : 150 FCFA
 * - Livreurs Officiels : 110 FCFA
 * - Section ADJARA (Grossistes Particuliers) : 110 FCFA
 */
export const OFFICIAL_UNIT_PRICES: Record<DistributionChannel, number> = {
  guichet_comptoir: 150,
  livreur_officiel: 110,
  adjara_grossiste: 110
};

export interface FlourBagEntry {
  id: string;
  timestamp: string;
  bagIndex: number;
  patesCount: number;     // NOMBRE DE PÂTES DE CE SAC (Standard d'or : 20 pâtes)
  loavesPerPate?: number; // Standard : 20 baguettes par pâte
  expectedLoaves: number; // Quota strict : 400 baguettes (20 pâtes x 20 divisions)
  actualLoaves: number;   // Pains bruts sortis = patesCount * (loavesPerPate || 20)
  cart1Loaves?: number;   // Chariot 1 (optionnel)
  cart2Loaves?: number;   // Chariot 2 (optionnel)
  cart3Loaves?: number;   // Chariot 3 (optionnel)
  burnedLoaves?: number;  // Démarque : Pains brûlés
  brokenLoaves?: number;  // Démarque : Pains cassés / déformés
  netVendableLoaves?: number; // actualLoaves - (burned + broken)
  deltaQuotaLoaves?: number;  // actualLoaves - expectedLoaves (ex: -20 si 19 pâtes)
  notes?: string;
}

export interface CartEntry {
  id: string;
  timestamp: string;
  cartNumber: number;
  loavesCount: number; // Pains nets comptabilisés (180 par défaut terrain)
  physicalCapacity: number; // Capacité brute (200)
  lossCompensationBuffer: number; // Tampon perte (+20)
  status: 'en_four' | 'sorti_chariot' | 'verse_carton';
}

export interface CartonDumpEntry {
  id: string;
  timestamp: string;
  cartSequenceNumber: number; // Numéro séquentiel (1er chariot versé, 2e...)
  cartonCount: number;        // Nombre de cartons remplis par ce chariot
  estimatedLoaves: number;
  notes?: string;
}

export interface DialloInspection {
  id: string;
  timestamp: string;
  totalBagsTaken: number;             // ex: 30 sacs
  theoreticalLoavesPerBag: number;    // Convention : 25 pains / sac
  sampledBagLoavesCount: number;      // Comptage physique réel (ex: 27)
  isAnomalyDetected: boolean;         // Vrai si != 25 (ex: 27 pains!)
  leakagePerBag: number;              // (sampled - 25)
  totalFinancialLeakageLoaves: number;// Si 2 pains en trop x 30 sacs = +60 pains perdus!
  totalBreadsCalculated: number;      // totalBagsTaken * sampledBagLoavesCount
  notes: string;
  verified: boolean;
}

export interface SouridjiMemberEntry {
  id: string;
  timestamp: string;
  individualName: string; // Nom exact de l'équipier interrogé ("C'est qui ?")
  bagsCount: number;
  loavesCount: number;
  notes?: string;
}

export interface DeliveryPickupBatch {
  id: string;
  timestamp: string;
  bagsCount: number;
  looseLoavesCount: number;
  loavesPerBag: number;
  batchTotalLoaves: number; // (bagsCount * loavesPerBag) + looseLoavesCount
  notes?: string;
}

export interface DeliveryEntry {
  id: string;
  timestamp: string; // Heure d'ouverture du ticket / 1er passage
  closedAt?: string; // Heure de clôture définitive
  driverName: string;
  channel: DistributionChannel; // 'livreur_officiel' | 'adjara_grossiste' | 'guichet_comptoir'
  driverCategory?: 'diallo' | 'souridji' | 'adjara' | 'guichet' | 'autre';
  driverType?: 'diallo' | 'souridji_member' | 'adjara_grossiste' | 'guichet' | 'autre';
  status?: 'en_cours' | 'cloture'; // 'en_cours' (chargement multi-lots) ou 'cloture' (départ confirmé)
  pickups?: DeliveryPickupBatch[]; // Historique de tous les passages
  bagsCount: number; // Cumul des sacs
  sealedBagsCount?: number; // Sacs scellés contrôlés à 25
  loavesPerBag: number; // Par défaut 25 (ou 27 si sac Diallo piégé)
  looseLoavesCount: number; // Cumul des pains au détail / vrac
  totalLoaves: number; // Cumul total de tous les passages
  totalCalculatedLoaves?: number; // Alias
  unitPriceCFA: number; // 150 F (Guichet) ou 110 F (Livreurs & ADJARA)
  totalPriceCFA: number; // totalLoaves * unitPriceCFA
  photoProofUrl?: string; // Preuve photographique
  photoProofTimestamp?: string;
  photoAiCountEstimated?: number;
  loadingBayStatus?: 'in_bay' | 'queued' | 'completed'; // Règle du 1-par-1
  notes?: string;
  isAnomaly?: boolean;
}

export type GenericDeliveryEntry = DeliveryEntry;

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  phase: ShiftPhase;
  category: 'workflow' | 'production' | 'cartonnage' | 'livraison' | 'securite' | 'alerte' | 'finance';
  message: string;
  severity: 'info' | 'success' | 'warning' | 'danger';
  dataPayload?: any;
}

export interface ShiftReconciliation {
  totalFlourBagsUsed: number;
  totalPatesCount: number;              // Cumul exact de toutes les PÂTES obtenues (ex: 20 + 20 = 40)
  expectedPatesCount: number;           // totalFlourBagsUsed * 20 pâtes quota
  patesDeltaQuota: number;              // totalPatesCount - expectedPatesCount
  averagePatesPerBag: number;           // Moyenne de pâtes par sac de farine
  totalGrossLoavesBaked: number;        // Pains bruts sortis = totalPatesCount * 20
  totalBurnedLoaves: number;
  totalBrokenLoaves: number;
  totalScrapLoaves: number;
  totalScrapLossCFA: number;
  totalLoavesBaked: number;             // Net vendable = Gross - Scrap
  totalCartsRecorded: number;
  totalCartsDumpedToCarton: number;
  totalDeliveriesCount: number;
  totalLoavesDelivered: number;
  theoreticalStockRemaining: number;   // totalLoavesBaked - totalLoavesDelivered
  loavesRemainingInBakery: number;     // Alias rétrocompatible
  countedPhysicalStockRemaining: number; // Inventaire physique certifié au fournil
  hasPhysicalStockCounted: boolean;     // True si l'inventaire physique a été pointé
  zeroMissingBalance: number;           // Écart physique strict : Vendables - (Livrés + Stock restant)
  financialLeakageCFA: number;          // Perte financière exacte en FCFA due au manquant
  isZeroMissingAchieved: boolean;       // Mathématiquement scellé à 0 manquant
  hasMissingLoaves: boolean;            // True si manquant > 0 (Vol / perte)
  hasSurplusLoaves: boolean;            // True si surplus inexpliqué
  totalAnomaliesDetected: number;
  handoverReady: boolean;
  // Bilan Financier Automatisé
  totalRevenueExpectedCFA: number;
  revenueByChannel: {
    livreurs: number; // 110 FCFA
    adjara: number;   // 110 FCFA
    guichet: number;  // 150 FCFA
  };
  loavesByChannel: {
    livreurs: number;
    adjara: number;
    guichet: number;
  };
}

export interface AgentChatMessage {
  id: string;
  timestamp: string;
  sender: 'agent' | 'user' | 'system';
  content: string;
  category?: 'conseil' | 'alerte' | 'rappel_heure' | 'verification';
  actionPrompt?: string;
}

export interface ProductionTargetPlan {
  targetFlourBags: number;
  expectedCartsTotal: number; // targetFlourBags * 3 (3 chariots par sac : 2 de 180 + 1 de 40)
  expectedGrossLoaves: number; // targetFlourBags * 400 (ex: 3600)
  expectedNetLoaves: number; // targetFlourBags * 400 (base théorique brute vendable)
  lossToleranceLoaves: number; // Marge tolérée de casse
  morningStoreReservedCarts: number; // 2 chariots
  morningStoreReservedLoaves: number; // 2 * 180 = 360 pains
  maxDriverAllowedCarts: number; // expectedCartsTotal - 2
  maxDriverAllowedLoaves: number; // Pains alloués aux livreurs après réserve boutique
  actualBagsUsed: number;
  remainingBagsToKnead: number;
  actualCartsBaked: number;
  remainingCartsToBake: number;
  actualCartsCartoned: number;
  remainingCartsToCarton: number;
  physicalCartsInBakeryWaiting: number;
  bakingProgressPercentage: number;
}

export interface ShiftState {
  shiftId: string;
  operatorName: string;
  startedAt: string;
  currentPhase: ShiftPhase;
  targetFlourBags: number; // Cible de la nuit (ex: 9 sacs par défaut)
  flourBags: FlourBagEntry[];
  carts: CartEntry[];
  cartonDumps: CartonDumpEntry[];
  deliveries: DeliveryEntry[];
  dialloInspections: DialloInspection[];
  souridjiMembers: SouridjiMemberEntry[];
  genericDeliveries: DeliveryEntry[];
  auditLogs: AuditLogEntry[];
  agentMessages: AgentChatMessage[];
  quarantineStockBags: number; // Stock de sacs scellés de 25 pains en quarantaine
  activeDockDeliveryId: string | null; // ID du livreur actuellement dans le sas de chargement
  countedPhysicalStockRemaining?: number; // Inventaire physique certifié des pains restants au fournil pour la boutique
  unitPrices: {
    guichet_comptoir: number;
    livreur_officiel: number;
    adjara_grossiste: number;
  };
  protocolChecklist: {
    quarantineEnforced: boolean;   // Zone de quarantaine délimitée
    antiSecheDisplayed: boolean;   // Tableau 1s=25 visible
    oneByOneSanctified: boolean;   // Règle du 1-par-1 appliquée
    bagsSealed25: boolean;         // Sacs scellés dès validation
    channelsSeparated: boolean;    // Canaux Livreurs/ADJARA/Guichet scindés
    photoProofRequired: boolean;   // Photo de preuve systématique
  };
  onboardingChecklist: {
    politeApproachDone: boolean;
    explainedNewStatus: boolean;
    workerContactEstablished: boolean;
    registerPaperReady: boolean;
  };
}
