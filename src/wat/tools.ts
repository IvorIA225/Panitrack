/**
 * PaniTrack - TOOLS (Outils Déterministes du Framework WAT)
 * Ces fonctions pures et certifiées garantissent des calculs infaillibles,
 * l'audit des sacs et la réconciliation mathématique du shift.
 */

import {
  ShiftState,
  DialloInspection,
  ShiftReconciliation,
  AuditLogEntry,
  ShiftPhase,
  ProductionTargetPlan
} from './types';

/**
 * OUTIL DE CALCUL DE PRODUCTION AUTOMATIQUE DU SHIFT
 * Déduit l'ensemble du plan de production à partir du seul nombre de sacs de farine saisis :
 * - Chariots attendus (2 par sac)
 * - Pains physiques bruts (400 par sac)
 * - Pains vendables nets (180 par chariot)
 * - Marge de casse tolérée (+20 par chariot)
 * - Réserve boutique du matin (2 chariots obligatoires)
 * - Chariots et pains alloués aux livreurs
 * - Avancement en direct : sacs et chariots restants à faire
 */
export function computeProductionPlan(state: ShiftState): ProductionTargetPlan {
  const targetFlourBags = Math.max(1, state.targetFlourBags || 9);
  const expectedCartsTotal = targetFlourBags * 2;
  const expectedGrossLoaves = targetFlourBags * 400;
  const expectedNetLoaves = expectedCartsTotal * 180;
  const lossToleranceLoaves = expectedCartsTotal * 20;

  const morningStoreReservedCarts = 2;
  const morningStoreReservedLoaves = 2 * 180; // 360 pains
  const maxDriverAllowedCarts = Math.max(0, expectedCartsTotal - morningStoreReservedCarts);
  const maxDriverAllowedLoaves = maxDriverAllowedCarts * 180;

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
 * OUTIL 2 : Auditeur d'échantillonnage de sac (Spécial Diallo & Sécurité anti-fraude)
 * Traite la règle critique de la note vocale :
 * "Ils vont dire 25 parce que nous on sait que c'est 25 qu'on doit mettre...
 *  Mais s'ils mettent 27, toi tu vas penser que c'est 25 !
 *  Donc tu comptes les pains qui sont dans le sac."
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
 * OUTIL 3 : Validateur d'enregistrement du groupe Souridji
 * Règle note vocale :
 * "Lui il a beaucoup de personnes dans son groupe, donc chaque personne qui arrive tu demandes c'est qui,
 *  la personne dit son nom, tu notes !"
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
 * OUTIL 1 : Calculateur arithmétique certifié pour livraisons
 * Gère à la fois les sacs entiers de 25 pains et les pains au détail / vrac hors quota de sac.
 */
export function calculateBreadTotalWithLoose(bagsCount: number, loavesPerBag: number = 25, looseLoaves: number = 0): number {
  const safeBags = Math.max(0, bagsCount || 0);
  const safePerBag = Math.max(0, loavesPerBag || 25);
  const safeLoose = Math.max(0, looseLoaves || 0);
  return (safeBags * safePerBag) + safeLoose;
}

export function calculateBreadTotal(bagsCount: number, loavesPerBag: number): number {
  return calculateBreadTotalWithLoose(bagsCount, loavesPerBag, 0);
}

/**
 * OUTIL 4 : Moteur de Réconciliation et de Balance Matière
 * Compare la production (sacs de farine x pains sortis, chariots cuits et versés)
 * avec le total des pains remis aux livreurs (sacs + vrac).
 */
export function computeShiftReconciliation(state: ShiftState): ShiftReconciliation {
  // 1. Total pains sortis du fournil
  const totalFlourBagsUsed = (state?.flourBags || []).length;
  const totalLoavesBaked = (state?.flourBags || []).reduce((acc, bag) => acc + (bag.actualLoaves || 0), 0);
  const totalCartsRecorded = (state?.carts || []).length;
  const totalCartsDumpedToCarton = (state?.cartonDumps || []).length;

  // 2. Total livraisons (Unifié : sacs + vrac)
  let totalLoavesDelivered = 0;
  let totalDeliveriesCount = 0;
  let anomaliesCount = 0;

  if (state.deliveries && state.deliveries.length > 0) {
    state.deliveries.forEach(d => {
      totalDeliveriesCount++;
      totalLoavesDelivered += d.totalLoaves;
      if (d.isAnomaly) anomaliesCount++;
    });
  } else {
    // Rétrocompatibilité
    if (state.dialloInspections) {
      state.dialloInspections.forEach(d => {
        totalDeliveriesCount++;
        totalLoavesDelivered += d.totalBreadsCalculated;
        if (d.isAnomalyDetected) anomaliesCount++;
      });
    }
    if (state.souridjiMembers) {
      state.souridjiMembers.forEach(s => {
        totalDeliveriesCount++;
        totalLoavesDelivered += s.loavesCount > 0 ? s.loavesCount : (s.bagsCount * 25);
      });
    }
    if (state.genericDeliveries) {
      state.genericDeliveries.forEach(g => {
        totalDeliveriesCount++;
        totalLoavesDelivered += g.totalLoaves || g.totalCalculatedLoaves || 0;
      });
    }
  }

  // Balance
  const loavesRemainingInBakery = totalLoavesBaked - totalLoavesDelivered;
  const delta = totalLoavesBaked - totalLoavesDelivered;

  // Le shift est prêt pour remise si au moins la production et les livreurs sont consignés
  const handoverReady = totalFlourBagsUsed > 0 && totalDeliveriesCount > 0;

  return {
    totalFlourBagsUsed,
    totalLoavesBaked,
    totalCartsRecorded,
    totalCartsDumpedToCarton,
    totalDeliveriesCount,
    totalLoavesDelivered,
    loavesRemainingInBakery,
    productionVsDeliveryDelta: delta,
    totalAnomaliesDetected: anomaliesCount,
    handoverReady
  };
}

/**
 * OUTIL 5 : Générateur d'entrée d'audit horodatée
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
 * OUTIL 6 : Générateur de rapport de passation de consignes pour le patron
 */
export function generateHandoverMarkdown(state: ShiftState): string {
  const recon = computeShiftReconciliation(state);
  const now = new Date().toLocaleString('fr-FR');

  let md = `# RAPPORT OFFICIEL DE SHIFT BOULANGERIE - PANITRACK\n`;
  md += `**Date & Heure :** ${now}\n`;
  md += `**Contrôleur en poste :** ${state.operatorName || 'Opérateur'}\n`;
  md += `**Shift ID :** ${state.shiftId}\n\n`;

  md += `## 1. PRODUCTION FOURNIL\n`;
  md += `- **Sacs de farine travaillés :** ${recon.totalFlourBagsUsed} sac(s)\n`;
  md += `- **Pains sortis du four :** ${recon.totalLoavesBaked} pains (Moyenne : ${recon.totalFlourBagsUsed ? Math.round(recon.totalLoavesBaked / recon.totalFlourBagsUsed) : 0} pains/sac)\n`;
  md += `- **Chariots cuits enregistrés :** ${recon.totalCartsRecorded}\n`;
  md += `- **Chariots versés en cartons (Minuit) :** ${recon.totalCartsDumpedToCarton}\n\n`;

  md += `## 2. DISPATCH & LIVRAISONS (03H30+)\n`;
  md += `- **Total livraisons consignées :** ${recon.totalDeliveriesCount}\n`;
  md += `- **Total pains emportés par les livreurs :** ${recon.totalLoavesDelivered} pains\n\n`;

  if (state.deliveries && state.deliveries.length > 0) {
    md += `### Détail de l'émargement des livreurs :\n`;
    state.deliveries.forEach((d) => {
      const parts = [];
      if (d.bagsCount > 0) parts.push(`${d.bagsCount} sac(s) (${d.bagsCount * d.loavesPerBag} pains)`);
      if (d.looseLoavesCount > 0) parts.push(`${d.looseLoavesCount} pain(s) au détail / vrac`);
      const details = parts.length > 0 ? parts.join(' + ') : `${d.totalLoaves} pains`;

      let pickupHistory = '';
      if (d.pickups && d.pickups.length > 1) {
        pickupHistory = ` [${d.pickups.length} prises : ` + d.pickups.map(p => `+${p.batchTotalLoaves}p (${p.timestamp})`).join(' ') + `]`;
      }

      const statusTag = d.status === 'cloture' ? ` (🏁 Départ confirmé)` : ` (⏳ Chargement en cours)`;
      md += `- ${d.timestamp} | **${d.driverName}** : **${d.totalLoaves} pains** (${details})${pickupHistory}${statusTag}\n`;
      if (d.isAnomaly) {
        md += `  ⚠️ *Alerte sur-remplissage ou écart relevé.*\n`;
      }
    });
    md += `\n`;
  } else {
    if (state.dialloInspections && state.dialloInspections.length > 0) {
      md += `### Contrôles Spécifiques - Diallo :\n`;
      state.dialloInspections.forEach((d, idx) => {
        md += `- Contrôle #${idx + 1} (${d.timestamp}) : ${d.totalBagsTaken} sacs pris. Échantillon vérifié : **${d.sampledBagLoavesCount} pains/sac** (standard = 25). Total calculé = **${d.totalBreadsCalculated} pains**.\n`;
        if (d.isAnomalyDetected) {
          md += `  ⚠️ **ALERTE ANOMALIE :** Écart de ${d.leakagePerBag > 0 ? '+' : ''}${d.leakagePerBag} pains/sac. Perte/sur-distribution totale : ${d.totalFinancialLeakageLoaves} pains !\n`;
        }
      });
      md += `\n`;
    }

    if (state.souridjiMembers && state.souridjiMembers.length > 0) {
      md += `### Groupe Souridji (Enregistrements individuels) :\n`;
      state.souridjiMembers.forEach((s) => {
        const loaves = s.loavesCount > 0 ? s.loavesCount : (s.bagsCount * 25);
        md += `- ${s.timestamp} | **${s.individualName}** : ${s.bagsCount} sacs (${loaves} pains)\n`;
      });
      md += `\n`;
    }

    if (state.genericDeliveries && state.genericDeliveries.length > 0) {
      md += `### Autres Livreurs :\n`;
      state.genericDeliveries.forEach((g) => {
        md += `- ${g.timestamp} | **${g.driverName}** : ${g.bagsCount} sacs (${g.totalLoaves || g.totalCalculatedLoaves || 0} pains)\n`;
      });
      md += `\n`;
    }
  }

  md += `## 3. BALANCE MATIÈRE & RÉCONCILIATION\n`;
  md += `- **Pains produits :** ${recon.totalLoavesBaked}\n`;
  md += `- **Pains livrés :** ${recon.totalLoavesDelivered}\n`;
  md += `- **Solde restant théorique au fournil :** ${recon.loavesRemainingInBakery} pains\n`;
  md += `- **Anomalies / Écarts détectés :** ${recon.totalAnomaliesDetected}\n\n`;

  md += `## 4. SIGNATURE DE PASSATION\n`;
  md += `Signature Contrôleur Sortant : __________________\n`;
  md += `Signature Responsable Entrant : __________________\n`;

  return md;
}
