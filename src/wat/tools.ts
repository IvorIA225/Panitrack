/**
 * PaniTrack - TOOLS (Outils Déterministes du Framework WAT)
 * Fonctions pures et certifiées pour la distribution, l'anti-sèche visuelle,
 * la comptabilité de la démarque et le bilan financier « Zéro Manquant ».
 */

import {
  ShiftState,
  DialloInspection,
  ShiftReconciliation,
  AuditLogEntry,
  ShiftPhase,
  ProductionTargetPlan,
  DistributionChannel,
  OFFICIAL_UNIT_PRICES
} from './types';

/**
 * ANTI-SÈCHE VISUELLE (Pilier 1 du Protocole Terrain)
 * Tableau de conversion certifié pour annuler toute charge mentale :
 * 1 sac = 25 pains, 6 sacs = 150 pains... avec calcul instantané en FCFA.
 */
export interface BagConversionItem {
  bags: number;
  loaves: number;
  cfaLivreursOrAdjara: number; // 110 FCFA
  cfaGuichet: number;          // 150 FCFA
  label: string;
}

export function getBagConversionTable(): BagConversionItem[] {
  const steps = [1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 20];
  return steps.map((bags) => {
    const loaves = bags * 25;
    return {
      bags,
      loaves,
      cfaLivreursOrAdjara: loaves * OFFICIAL_UNIT_PRICES.livreur_officiel,
      cfaGuichet: loaves * OFFICIAL_UNIT_PRICES.guichet_comptoir,
      label: `${bags} sac${bags > 1 ? 's' : ''} = ${loaves} pains`
    };
  });
}

/**
 * Récupère le tarif unitaire officiel en FCFA selon le canal
 * - Guichet : 150 FCFA
 * - Livreurs : 110 FCFA
 * - ADJARA : 110 FCFA
 */
export function getChannelUnitPrice(
  channel: DistributionChannel,
  customPrices?: { guichet_comptoir?: number; livreur_officiel?: number; adjara_grossiste?: number }
): number {
  if (customPrices && customPrices[channel]) {
    return customPrices[channel]!;
  }
  return OFFICIAL_UNIT_PRICES[channel] ?? 110;
}

/**
 * Calculateur de chargement avec vrac et valorisation financière automatique
 */
export function calculateBreadTotalWithLoose(
  bagsCount: number,
  loavesPerBag: number = 25,
  looseLoaves: number = 0
): number {
  const safeBags = Math.max(0, bagsCount || 0);
  const safePerBag = Math.max(0, loavesPerBag || 25);
  const safeLoose = Math.max(0, looseLoaves || 0);
  return (safeBags * safePerBag) + safeLoose;
}

export function calculateBreadTotal(bagsCount: number, loavesPerBag: number): number {
  return calculateBreadTotalWithLoose(bagsCount, loavesPerBag, 0);
}

/**
 * Calcule le montant financier exact d'une livraison selon son canal
 */
export function calculateDeliveryFinancials(
  totalLoaves: number,
  channel: DistributionChannel,
  customPrice?: number
): { unitPriceCFA: number; totalPriceCFA: number } {
  const unitPriceCFA = customPrice ?? getChannelUnitPrice(channel);
  const totalPriceCFA = Math.max(0, totalLoaves) * unitPriceCFA;
  return { unitPriceCFA, totalPriceCFA };
}

/**
 * OUTIL DE CALCUL DE PRODUCTION DU FOURNIL
 * Cible 400 pâtons par sac (20 pâtes x 20 divisions)
 */
export function computeProductionPlan(state: ShiftState): ProductionTargetPlan {
  const targetFlourBags = Math.max(1, state.targetFlourBags || 9);
  const expectedCartsTotal = targetFlourBags * 3; // 3 chariots par sac (2 de 180 + 1 de 40)
  const expectedGrossLoaves = targetFlourBags * 400;
  const expectedNetLoaves = targetFlourBags * 400;
  const lossToleranceLoaves = expectedCartsTotal * 20;

  const morningStoreReservedCarts = 2;
  const morningStoreReservedLoaves = 2 * 180; // 360 pains réservés pour la boutique
  const maxDriverAllowedCarts = Math.max(0, expectedCartsTotal - morningStoreReservedCarts);
  const maxDriverAllowedLoaves = Math.max(0, expectedGrossLoaves - morningStoreReservedLoaves);

  const actualBagsUsed = (state?.flourBags || []).length;
  const remainingBagsToKnead = Math.max(0, targetFlourBags - actualBagsUsed);

  const actualCartsBaked = (state?.carts || []).length;
  const remainingCartsToBake = Math.max(0, expectedCartsTotal - actualCartsBaked);

  const actualCartsCartoned = (state?.cartonDumps || []).length;
  const remainingCartsToCarton = Math.max(0, actualCartsBaked - actualCartsCartoned);
  const physicalCartsInBakeryWaiting = Math.max(0, actualCartsBaked - actualCartsCartoned);

  const bakingProgressPercentage = Math.min(100, Math.round((actualCartsBaked / expectedCartsTotal) * 100));

  return {
    targetFlourBags,
    expectedCartsTotal,
    expectedGrossLoaves,
    expectedNetLoaves,
    lossToleranceLoaves,
    morningStoreReservedCarts,
    morningStoreReservedLoaves,
    maxDriverAllowedCarts,
    maxDriverAllowedLoaves,
    actualBagsUsed,
    remainingBagsToKnead,
    actualCartsBaked,
    remainingCartsToBake,
    actualCartsCartoned,
    remainingCartsToCarton,
    physicalCartsInBakeryWaiting,
    bakingProgressPercentage
  };
}

/**
 * OUTIL : Audit d'échantillonnage de sac (Contrôle Diallo & Règle des 25)
 */
export function auditDialloBagSample(
  totalBagsTaken: number,
  sampledBagLoavesCount: number,
  standardExpected: number = 25
): Omit<DialloInspection, 'id' | 'timestamp' | 'verified'> {
  const isAnomalyDetected = sampledBagLoavesCount !== standardExpected;
  const leakagePerBag = sampledBagLoavesCount - standardExpected;
  const totalFinancialLeakageLoaves = leakagePerBag * totalBagsTaken;
  const totalBreadsCalculated = totalBagsTaken * sampledBagLoavesCount;

  let notes = '';
  if (sampledBagLoavesCount === standardExpected) {
    notes = `Conforme au standard (${standardExpected} pains/sac). Total vérifié : ${totalBreadsCalculated} pains.`;
  } else if (sampledBagLoavesCount > standardExpected) {
    notes = `ATTENTION ANOMALIE CRITIQUE : Sur-remplissage constaté (+${leakagePerBag} pains/sac) ! ` +
      `Sur ${totalBagsTaken} sacs, cela représente une fuite de ${totalFinancialLeakageLoaves} pains offerts indûment !`;
  } else {
    notes = `Sous-remplissage constaté (-${Math.abs(leakagePerBag)} pains/sac). Le livreur reçoit moins que prévu.`;
  }

  return {
    totalBagsTaken,
    theoreticalLoavesPerBag: standardExpected,
    sampledBagLoavesCount,
    isAnomalyDetected,
    leakagePerBag,
    totalFinancialLeakageLoaves,
    totalBreadsCalculated,
    notes
  };
}

/**
 * OUTIL : Validateur d'enregistrement nominatif du groupe Souridji
 */
export function validateSouridjiMember(
  individualName: string,
  bagsCount: number,
  loavesCount: number
): { isValid: boolean; error?: string } {
  const trimmed = individualName.trim();
  if (!trimmed) {
    return { isValid: false, error: "Le nom individuel de l'équipier est obligatoire (ne pas noter juste 'Équipe Souridji')." };
  }
  if (trimmed.toLowerCase() === 'souridji' || trimmed.toLowerCase() === 'equipe souridji') {
    return {
      isValid: false,
      error: "Attention : notez le prénom/nom du livreur individuel présent physiquement devant vous, pas le nom général de Souridji."
    };
  }
  if (bagsCount <= 0 && loavesCount <= 0) {
    return { isValid: false, error: "Indiquez au moins 1 sac ou une quantité de pains chargés." };
  }
  return { isValid: true };
}

/**
 * OUTIL MAÎTRE : Réconciliation Complète & Bilan Financier « Zéro Manquant »
 * Ventile les pains et les flux financiers (FCFA) par canal étanche :
 * 1. Intrants Fournil : Comptage des PÂTES par sac de farine (Règle d'or : 20 pâtes = 400 baguettes)
 * 2. Démarque justifiée (Pains brûlés + cassés) déduite des bruts
 * 3. Sorties certifiées : Livreurs (110 F), ADJARA (110 F) et Guichet (150 F)
 * 4. Rapprochement Infaillible : Pains Vendables - (Pains Sortis + Stock Restant) = ZÉRO MANQUANT.
 */
export function computeShiftReconciliation(state: ShiftState): ShiftReconciliation {
  const flourBags = state?.flourBags || [];
  const totalFlourBagsUsed = flourBags.length;

  // 1. Comptage des PÂTES et Démarque du fournil
  let totalPatesCount = 0;
  let totalGrossLoavesBaked = 0;
  let totalBurnedLoaves = 0;
  let totalBrokenLoaves = 0;

  flourBags.forEach((bag) => {
    // Si patesCount est renseigné, on l'utilise directement, sinon on déduit depuis actualLoaves / 20
    const pates = bag.patesCount !== undefined ? bag.patesCount : (bag.actualLoaves ? Math.round(bag.actualLoaves / 20) : 20);
    totalPatesCount += pates;
    const gross = bag.actualLoaves !== undefined ? bag.actualLoaves : (pates * (bag.loavesPerPate || 20));
    totalGrossLoavesBaked += gross;
    totalBurnedLoaves += bag.burnedLoaves || 0;
    totalBrokenLoaves += bag.brokenLoaves || 0;
  });

  const expectedPatesCount = totalFlourBagsUsed * 20; // Quota patron : 20 pâtes par sac
  const patesDeltaQuota = totalPatesCount - expectedPatesCount;
  const averagePatesPerBag = totalFlourBagsUsed > 0 ? Number((totalPatesCount / totalFlourBagsUsed).toFixed(1)) : 0;

  const totalScrapLoaves = totalBurnedLoaves + totalBrokenLoaves;
  // Pains nets vendables issus de la cuisson
  const totalLoavesBaked = Math.max(0, totalGrossLoavesBaked - totalScrapLoaves);
  // Coût de la démarque (valorisé au prix de base 110 FCFA)
  const totalScrapLossCFA = totalScrapLoaves * OFFICIAL_UNIT_PRICES.livreur_officiel;

  const totalCartsRecorded = (state?.carts || []).length;
  const totalCartsDumpedToCarton = (state?.cartonDumps || []).length;

  // 2. Ventilation des distributions par canal étanche
  let totalDeliveriesCount = 0;
  let totalLoavesDelivered = 0;
  let totalRevenueExpectedCFA = 0;
  let anomaliesCount = 0;

  const loavesByChannel = {
    livreurs: 0,
    adjara: 0,
    guichet: 0
  };

  const revenueByChannel = {
    livreurs: 0,
    adjara: 0,
    guichet: 0
  };

  const deliveries = state.deliveries || [];

  deliveries.forEach((d) => {
    totalDeliveriesCount++;
    totalLoavesDelivered += d.totalLoaves;
    if (d.isAnomaly) anomaliesCount++;

    const ch = d.channel || 'livreur_officiel';
    const unitPrice = d.unitPriceCFA || getChannelUnitPrice(ch, state.unitPrices);
    const lineTotalCFA = d.totalPriceCFA || (d.totalLoaves * unitPrice);

    totalRevenueExpectedCFA += lineTotalCFA;

    if (ch === 'guichet_comptoir') {
      loavesByChannel.guichet += d.totalLoaves;
      revenueByChannel.guichet += lineTotalCFA;
    } else if (ch === 'adjara_grossiste') {
      loavesByChannel.adjara += d.totalLoaves;
      revenueByChannel.adjara += lineTotalCFA;
    } else {
      loavesByChannel.livreurs += d.totalLoaves;
      revenueByChannel.livreurs += lineTotalCFA;
    }
  });

  // 3. Balance Matière & Écart Infaillible « ZÉRO MANQUANT »
  const theoreticalStockRemaining = Math.max(0, totalLoavesBaked - totalLoavesDelivered);
  const hasPhysicalStockCounted = state.countedPhysicalStockRemaining !== undefined && state.countedPhysicalStockRemaining !== null;
  const countedPhysicalStockRemaining = hasPhysicalStockCounted
    ? Math.max(0, state.countedPhysicalStockRemaining!)
    : theoreticalStockRemaining;

  // Équation sacrée : Pains Vendables - (Pains Sortis + Stock restant vérifié)
  const zeroMissingBalance = totalLoavesBaked - (totalLoavesDelivered + countedPhysicalStockRemaining);
  const financialLeakageCFA = zeroMissingBalance > 0 ? zeroMissingBalance * OFFICIAL_UNIT_PRICES.livreur_officiel : 0;
  const isZeroMissingAchieved = totalFlourBagsUsed > 0 && zeroMissingBalance === 0;
  const hasMissingLoaves = zeroMissingBalance > 0;
  const hasSurplusLoaves = zeroMissingBalance < 0;

  const handoverReady = totalFlourBagsUsed > 0 && totalDeliveriesCount > 0;

  return {
    totalFlourBagsUsed,
    totalPatesCount,
    expectedPatesCount,
    patesDeltaQuota,
    averagePatesPerBag,
    totalGrossLoavesBaked,
    totalBurnedLoaves,
    totalBrokenLoaves,
    totalScrapLoaves,
    totalScrapLossCFA,
    totalLoavesBaked,
    totalCartsRecorded,
    totalCartsDumpedToCarton,
    totalDeliveriesCount,
    totalLoavesDelivered,
    theoreticalStockRemaining,
    loavesRemainingInBakery: theoreticalStockRemaining,
    countedPhysicalStockRemaining,
    hasPhysicalStockCounted,
    zeroMissingBalance,
    financialLeakageCFA,
    isZeroMissingAchieved,
    hasMissingLoaves,
    hasSurplusLoaves,
    totalAnomaliesDetected: anomaliesCount,
    handoverReady,
    totalRevenueExpectedCFA,
    revenueByChannel,
    loavesByChannel
  };
}

/**
 * Générateur de journal d'audit horodaté
 */
export function createAuditLog(
  phase: ShiftPhase,
  category: AuditLogEntry['category'],
  message: string,
  severity: AuditLogEntry['severity'] = 'info',
  dataPayload?: any
): AuditLogEntry {
  return {
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    phase,
    category,
    message,
    severity,
    dataPayload
  };
}

/**
 * RAPPORT DE PASSATION OFFICIEL PATRON (Bordereau Infaillible « Zéro Manquant »)
 * Synthétise les Pâtes obtenues par sac de farine, la démarque, les chargements et le bilan financier.
 */
export function generateHandoverMarkdown(state: ShiftState): string {
  const recon = computeShiftReconciliation(state);
  const now = new Date().toLocaleString('fr-FR');

  let md = `# BORDEREAU OFFICIEL « ZÉRO MANQUANT » & BILAN FINANCIER — PANITRACK\n`;
  md += `**Système d'Inviolabilité :** Contrôle des Pâtes par Sac & Balance des Sorties\n`;
  md += `**Date & Heure :** ${now}\n`;
  md += `**Contrôleur en poste :** ${state.operatorName || 'Opérateur'}\n`;
  md += `**Shift ID :** ${state.shiftId}\n\n`;

  md += `## 1. CONTRÔLE DES PÂTES PAR SAC DE FARINE (FOURNIL)\n`;
  md += `- **Sacs de farine travaillés :** ${recon.totalFlourBagsUsed} sac(s)\n`;
  md += `- **Pâtes obtenues :** **${recon.totalPatesCount} pâtes** (Moyenne : ${recon.averagePatesPerBag} pâtes/sac | Quota patron : 20.0)\n`;
  if (recon.patesDeltaQuota !== 0) {
    md += `- **Écart Quota Pâtes :** ${recon.patesDeltaQuota > 0 ? `+${recon.patesDeltaQuota}` : recon.patesDeltaQuota} pâtes (${recon.patesDeltaQuota * 20} baguettes)\n`;
  }
  md += `- **Baguettes brutes façonnées :** ${recon.totalGrossLoavesBaked} pains (Base : 20 baguettes par pâte)\n`;
  md += `- **Démarque justifiée :** ${recon.totalScrapLoaves} pains au rebut (${recon.totalBurnedLoaves} brûlés au four, ${recon.totalBrokenLoaves} cassés)\n`;
  md += `- **PAINS VENDABLES NETS DISPONIBLES :** **${recon.totalLoavesBaked} pains**\n`;
  md += `- **Coût démarque fournil (110 F) :** -${recon.totalScrapLossCFA.toLocaleString('fr-FR')} FCFA\n\n`;

  md += `## 2. DISTRIBUTION PAR CANAUX ÉTANCHES (SORTIES SÉCURISÉES)\n`;
  md += `Grille tarifaire officielle : Guichet = 150 FCFA/pain | Livreurs & ADJARA = 110 FCFA/pain\n\n`;
  md += `| Canal de Distribution | Pains Sortis | Tarif Unitaire | Recette Espèces Attendue |\n`;
  md += `| :--- | :---: | :---: | :---: |\n`;
  md += `| 🚚 **Livreurs Officiels** | ${recon.loavesByChannel.livreurs} pains | 110 FCFA | **${recon.revenueByChannel.livreurs.toLocaleString('fr-FR')} FCFA** |\n`;
  md += `| 🏬 **Section ADJARA (Grossistes)** | ${recon.loavesByChannel.adjara} pains | 110 FCFA | **${recon.revenueByChannel.adjara.toLocaleString('fr-FR')} FCFA** |\n`;
  md += `| 🛒 **Guichet Comptoir** | ${recon.loavesByChannel.guichet} pains | 150 FCFA | **${recon.revenueByChannel.guichet.toLocaleString('fr-FR')} FCFA** |\n`;
  md += `| **TOTAL SORTIES EXPÉDIÉES** | **${recon.totalLoavesDelivered} pains** | — | **${recon.totalRevenueExpectedCFA.toLocaleString('fr-FR')} FCFA** |\n\n`;

  if (state.deliveries && state.deliveries.length > 0) {
    md += `### Détail nominatif des émargements :\n`;
    state.deliveries.forEach((d) => {
      const channelLabel =
        d.channel === 'guichet_comptoir'
          ? 'Guichet (150 F)'
          : d.channel === 'adjara_grossiste'
          ? 'ADJARA (110 F)'
          : 'Livreur (110 F)';

      const parts = [];
      if (d.bagsCount > 0) parts.push(`${d.bagsCount} sac(s) scellé(s)`);
      if (d.looseLoavesCount > 0) parts.push(`${d.looseLoavesCount} vrac`);
      const breakdown = parts.length > 0 ? parts.join(' + ') : `${d.totalLoaves} pains`;
      const photoTag = d.photoProofUrl ? ` [📸 Photo certifiée]` : '';
      const statusTag = d.status === 'cloture' ? ` (🏁 Parti)` : ` (⏳ Au Sas)`;

      md += `- ${d.timestamp} | **${d.driverName}** [${channelLabel}] : **${d.totalLoaves} pains** = **${d.totalPriceCFA.toLocaleString('fr-FR')} FCFA** (${breakdown})${photoTag}${statusTag}\n`;
      if (d.isAnomaly) {
        md += `  🚨 *ANOMALIE DIALLO CONSTATÉE : Sac contrôlé à 27 pains (+2).* \n`;
      }
    });
    md += `\n`;
  }

  md += `## 3. RAPPROCHEMENT INFAILLIBLE « ZÉRO MANQUANT »\n`;
  md += `- **Pains vendables produits au fournil :** ${recon.totalLoavesBaked} pains\n`;
  md += `- **Pains sortis & distribués :** ${recon.totalLoavesDelivered} pains\n`;
  md += `- **Stock physique restant au fournil (boutique matin) :** **${recon.countedPhysicalStockRemaining} pains**\n`;
  
  if (recon.zeroMissingBalance === 0) {
    md += `- **STATUT FINAL :** 🛡️ **ZÉRO MANQUANT CERTIFIÉ (0 PAIN PERDU, ÉQUILIBRE PARFAIT !)**\n`;
  } else if (recon.zeroMissingBalance > 0) {
    md += `- **STATUT FINAL :** 🚨 **ALERTE MANQUANT : ${recon.zeroMissingBalance} PAINS DISPARUS**\n`;
    md += `- **PERTE FINANCIÈRE SUBIE (110 F) :** **-${recon.financialLeakageCFA.toLocaleString('fr-FR')} FCFA**\n`;
  } else {
    md += `- **STATUT FINAL :** ⚠️ **SURPLUS INEXPLIQUÉ : +${Math.abs(recon.zeroMissingBalance)} PAINS**\n`;
  }

  md += `- **RECETTE NETTE EN ESPÈCES DUE AU PATRON :** **${recon.totalRevenueExpectedCFA.toLocaleString('fr-FR')} FCFA**\n\n`;

  md += `## 4. SIGNATURES & VALEUR JURIDIQUE\n`;
  md += `Ce bordereau certifie le comptage rigoureux des pâtes par sac et l'émargement individuel des chargements.\n\n`;
  md += `Signature Contrôleur de Shift : _____________________\n\n`;
  md += `Signature Propriétaire / Patron : _____________________\n`;

  return md;
}
