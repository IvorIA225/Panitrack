/**
 * PaniTrack - Définition des types pour le Framework WAT (Workflow, Agent, Outils)
 */

export enum ShiftPhase {
  PHASE_0_ONBOARDING = 'PHASE_0_ONBOARDING',   // Arrivée & Posture diplomatique
  PHASE_1_BAKING = 'PHASE_1_BAKING',           // Suivi sacs farine, cuisson & chariots
  PHASE_2_CARTONING = 'PHASE_2_CARTONING',     // Dépotage minuit chariots -> cartons
  PHASE_3_DISPATCH = 'PHASE_3_DISPATCH',       // 03h30 : Livreurs (Diallo, Souridji...)
  PHASE_4_HANDOVER = 'PHASE_4_HANDOVER'        // Arrivée responsable, balance & clôture
}

export interface FlourBagEntry {
  id: string;
  timestamp: string;
  bagIndex: number;
  expectedLoaves: number; // e.g. 400
  actualLoaves: number;
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
  driverCategory: 'diallo' | 'souridji' | 'autre';
  driverType?: 'diallo' | 'souridji_member' | 'autre';
  status?: 'en_cours' | 'cloture'; // 'en_cours' (chargement multi-lots) ou 'cloture' (départ confirmé)
  pickups?: DeliveryPickupBatch[]; // Historique de tous les passages (ex: 15, puis +20, puis +30)
  bagsCount: number; // Cumul des sacs
  loavesPerBag: number; // Par défaut 25 (ou 27 si sac Diallo)
  looseLoavesCount: number; // Cumul des pains au détail
  totalLoaves: number; // Cumul total de tous les passages
  totalCalculatedLoaves?: number; // Alias
  notes?: string;
  isAnomaly?: boolean;
}

export type GenericDeliveryEntry = DeliveryEntry;

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  phase: ShiftPhase;
  category: 'workflow' | 'production' | 'cartonnage' | 'livraison' | 'securite' | 'alerte';
  message: string;
  severity: 'info' | 'success' | 'warning' | 'danger';
  dataPayload?: any;
}

export interface ShiftReconciliation {
  totalFlourBagsUsed: number;
  totalLoavesBaked: number;
  totalCartsRecorded: number;
  totalCartsDumpedToCarton: number;
  totalDeliveriesCount: number;
  totalLoavesDelivered: number;
  loavesRemainingInBakery: number;
  productionVsDeliveryDelta: number;
  totalAnomaliesDetected: number;
  handoverReady: boolean;
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
  expectedCartsTotal: number; // targetFlourBags * 2 (ex: 18)
  expectedGrossLoaves: number; // targetFlourBags * 400 (ex: 3600)
  expectedNetLoaves: number; // expectedCartsTotal * 180 (ex: 3240)
  lossToleranceLoaves: number; // expectedCartsTotal * 20 (ex: 360)
  morningStoreReservedCarts: number; // 2 chariots
  morningStoreReservedLoaves: number; // 2 * 180 = 360 pains
  maxDriverAllowedCarts: number; // expectedCartsTotal - 2 (ex: 16)
  maxDriverAllowedLoaves: number; // 16 * 180 = 2880 pains
  // Progression en direct
  actualBagsUsed: number;
  remainingBagsToKnead: number;
  actualCartsBaked: number;
  remainingCartsToBake: number;
  actualCartsCartoned: number;
  remainingCartsToCarton: number;
  physicalCartsInBakeryWaiting: number; // Chariots cuits qui n'ont pas encore été versés en carton
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
  onboardingChecklist: {
    politeApproachDone: boolean;
    explainedNewStatus: boolean;
    workerContactEstablished: boolean;
    registerPaperReady: boolean;
  };
}
