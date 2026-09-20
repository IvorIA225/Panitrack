/**
 * PaniTrack - AGENT COPILOTE (Intelligence & Décision du Framework WAT)
 * Analyse en continu l'état du shift, détecte les risques opérationnels et les fraudes,
 * fournit des conseils diplomatiques et répond aux questions de l'opérateur.
 */

import { ShiftState, ShiftPhase, AgentChatMessage } from './types';
import { auditDialloBagSample, computeShiftReconciliation } from './tools';

export class ShiftAgent {
  /**
   * Analyse automatique de l'état du shift et génération de recommandations proactives
   */
  public static analyzeShiftState(state: ShiftState): AgentChatMessage[] {
    const messages: AgentChatMessage[] = [];
    const now = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    // 1. Analyse Phase 0
    if (state.currentPhase === ShiftPhase.PHASE_0_ONBOARDING) {
      if (!state.onboardingChecklist.politeApproachDone) {
        messages.push({
          id: 'agent_onb_' + Date.now(),
          timestamp: now,
          sender: 'agent',
          category: 'conseil',
          content: `🤝 **Conseil d'intégration de nuit :** Ne commence pas en inspecteur. Approche-toi des boulangers calmement : *"Pardonnez-moi, je suis nouveau, montrez-moi un peu comment vous travaillez ici..."*. Un ouvrier respecté sera un allié précieux cette nuit.`
        });
      }
    }

    // 2. Analyse Phase 1
    if (state.currentPhase === ShiftPhase.PHASE_1_BAKING) {
      const bagsCount = state.flourBags.length;
      if (bagsCount === 0) {
        messages.push({
          id: 'agent_bak_' + Date.now(),
          timestamp: now,
          sender: 'agent',
          category: 'conseil',
          content: `🥖 **Rappel Fournil :** Dès que les ouvriers ouvrent et pétrissent un sac de farine, clique sur "+1 Sac de Farine". Note le nombre de pains à la sortie (la norme est d'environ 400 pains par sac) et pointe chaque chariot rempli.`
        });
      }
    }

    // 3. Analyse Phase 2 (Minuit)
    if (state.currentPhase === ShiftPhase.PHASE_2_CARTONING) {
      messages.push({
        id: 'agent_cart_' + Date.now(),
        timestamp: now,
        sender: 'agent',
        category: 'rappel_heure',
        content: `📦 **Minuit sonne : Cartonnage actif !** Les boulangers vont vider les chariots pour libérer la place. Note chaque chariot versé dans les cartons : Chariot 1, puis Chariot 2... Ne rate aucun dépotage.`
      });
    }

    // 4. Analyse Phase 3 (Dispatch Livreurs)
    if (state.currentPhase === ShiftPhase.PHASE_3_DISPATCH) {
      // Vérifier si Diallo a été inspecté
      const dialloAnomalies = state.dialloInspections.filter(d => d.isAnomalyDetected);
      if (dialloAnomalies.length > 0) {
        const lastAnomaly = dialloAnomalies[dialloAnomalies.length - 1];
        messages.push({
          id: 'agent_alert_diallo_' + Date.now(),
          timestamp: now,
          sender: 'agent',
          category: 'alerte',
          content: `🚨 **ALERTE SÉCURITÉ DIALLO :** Un sac a été vérifié à **${lastAnomaly.sampledBagLoavesCount} pains** au lieu de 25 ! Écart de ${lastAnomaly.leakagePerBag > 0 ? '+' : ''}${lastAnomaly.leakagePerBag} pains/sac. Sur ${lastAnomaly.totalBagsTaken} sacs, cela ferait une perte de ${lastAnomaly.totalFinancialLeakageLoaves} pains offerts sans paiement ! Merci d'avoir contrôlé le sac physiquement comme demandé.`
        });
      } else if (state.dialloInspections.length === 0) {
        messages.push({
          id: 'agent_diallo_guide_' + Date.now(),
          timestamp: now,
          sender: 'agent',
          category: 'conseil',
          content: `🚚 **Vigilance Diallo (3h30) :** Diallo prend par sacs de 25 pains théoriques. **Ne présume jamais qu'il y a 25 !** Ouvre un sac au hasard et compte les pains un à un devant lui. S'il y a 27, note 27 pour calculer le vrai total et protéger la boulangerie.`
        });
      }

      // Rappel Souridji
      if (state.souridjiMembers.length === 0) {
        messages.push({
          id: 'agent_souridji_guide_' + Date.now(),
          timestamp: now,
          sender: 'agent',
          category: 'conseil',
          content: `👥 **Consigne Groupe Souridji :** Souridji a une grande équipe. Ne note jamais simplement "Souridji". Demande à chaque coursier : *"C'est qui ?"* et note son prénom/nom propre ainsi que son chargement exact.`
        });
      }
    }

    // 5. Analyse Phase 4 (Clôture)
    if (state.currentPhase === ShiftPhase.PHASE_4_HANDOVER) {
      const recon = computeShiftReconciliation(state);
      messages.push({
        id: 'agent_close_' + Date.now(),
        timestamp: now,
        sender: 'agent',
        category: 'verification',
        content: `📋 **Bilan Prêt pour le Patron :** ${recon.totalLoavesBaked} pains produits, ${recon.totalLoavesDelivered} distribués, ${recon.totalAnomaliesDetected} anomalie(s) détectée(s). Le rapport complet est généré et prêt pour la signature de passation.`
      });
    }

    return messages;
  }

  /**
   * Analyse immédiate d'un échantillonnage de sac Diallo (évaluation de risque)
   */
  public static evaluateDialloCheck(totalBags: number, actualSample: number): {
    inspection: ReturnType<typeof auditDialloBagSample>;
    agentVerdict: string;
    severity: 'success' | 'warning' | 'danger';
  } {
    const inspection = auditDialloBagSample(totalBags, actualSample, 25);
    let agentVerdict = '';
    let severity: 'success' | 'warning' | 'danger' = 'success';

    if (actualSample === 25) {
      agentVerdict = `✅ Échantillon conforme (25 pains). Calcul validé : ${totalBags} sacs × 25 = ${inspection.totalBreadsCalculated} pains.`;
      severity = 'success';
    } else if (actualSample > 25) {
      agentVerdict = `🚨 PIÈGE CONFIRMÉ ! Le sac contient ${actualSample} pains (+${inspection.leakagePerBag}). Si tu avais appliqué la règle aveugle des 25, la boulangerie aurait offert ${inspection.totalFinancialLeakageLoaves} pains gratuits à Diallo ! Le système enregistre ${inspection.totalBreadsCalculated} pains réels.`;
      severity = 'danger';
    } else {
      agentVerdict = `⚠️ Attention : sac sous-dosé (${actualSample} pains au lieu de 25). Vérifie avec l'équipe de mise en sachet.`;
      severity = 'warning';
    }

    return { inspection, agentVerdict, severity };
  }

  /**
   * Moteur conversationnel : Réponse en langage naturel de l'Agent Copilote
   */
  public static respondToUserQuery(query: string, state: ShiftState): string {
    const q = query.toLowerCase();

    if (q.includes('9 sac') || q.includes('3240') || q.includes('3600') || (q.includes('combien') && q.includes('sac'))) {
      return `🎯 **Calcul de Rendement Parfait (9 sacs de farine) :**
Votre calcul est **absolument exact** !
- **Production brute physique** : 9 sacs × 400 pains = **3 600 pains** (soit 18 chariots de 200).
- **Minimum net à vendre / facturer** : 9 sacs × 360 pains = **3 240 pains vendables** (18 chariots × 180).
- **Marge tampon de casse autorisée** : 18 chariots × 20 pains = **360 pains de tolérance** (fournil + livreurs).
👉 Si vos livreurs rapportent moins de 3 240 pains en recette ou si vous avez plus de 360 pains d'écart, il y a un coulage anormal à signaler au patron !`;
    }

    if (q.includes('180') || q.includes('200') || q.includes('perte') || q.includes('compensation') || (q.includes('chariot') && (q.includes('pain') || q.includes('combien')))) {
      return `🥖 **Règle Métier Chariot (180 vs 200 pains) :**
Votre intuition est **100% exacte** !
1. **Capacité physique brute (200 pains)** : Le chariot métallique comporte généralement 18 à 20 étages pouvant accueillir jusqu'à 200 baguettes.
2. **Base de facturation & de compte (180 pains nets vendables)** : Sur le terrain, on se base sur **180 pains** car les **+20 pains** constituent une **marge tampon** pour absorber :
   - La **casse technique au fournil** (pains brûlés, déformés, tombés lors de l'enfournement/dépotage).
   - La **casse transport livreurs** (pains écrasés sur les motos ou refusés par les boutiques).
3. **⚠️ VIGILANCE CONTRÔLEUR :** Ces 20 pains doivent être connus et surveillés ! S'il y a 0 casse cette nuit-là, les 20 pains ne doivent pas "disparaître" dans la nature (risque de coulage ou dons non tracés). PaniTrack enregistre la base nette de 180 pains tout en traçant le tampon de 20 pains.`;
    }

    if (q.includes('diallo') || q.includes('25') || q.includes('27')) {
      return `🥖 **Règle d'or pour Diallo :** Diallo commande par sacs supposés contenir 25 pains. La consigne vocale est formelle : **compte physiquement les pains dans le sac** ! Parfois, les ouvriers en mettent 27. Si tu ne vérifies pas et que tu notes 25, la boulangerie perd 2 pains par sac (soit 60 pains pour 30 sacs !). Utilise l'outil "Contrôle Diallo" pour calculer automatiquement sur le réel.`;
    }

    if (q.includes('souridji') || q.includes('groupe') || q.includes('equipe') || q.includes('équipe')) {
      return `👥 **Consigne pour le groupe Souridji :** Souridji ne vient pas seul, il a beaucoup de personnes sous sa responsabilité. Dès qu'un livreur arrive pour Souridji, tu lui demandes poliment : *"C'est qui ?"*. Tu notes son propre prénom/nom et la quantité qu'il charge. Ne note jamais "Groupe Souridji en bloc".`;
    }

    if (q.includes('minuit') || q.includes('carton') || q.includes('chariot')) {
      return `📦 **Consigne Cartonnage (à partir de Minuit) :** Les ouvriers ont besoin de libérer les chariots métalliques pour de nouvelles fournées. Dès minuit, ils versent le pain des chariots dans les cartons. Tu dois noter chaque chariot versé : Chariot 1, Chariot 2, Chariot 3... jusqu'à la fin.`;
    }

    if (q.includes('patron') || q.includes('responsable') || q.includes('rapport') || q.includes('cloture') || q.includes('clôture')) {
      const recon = computeShiftReconciliation(state);
      return `👨‍💼 **Passation avec le responsable ("Jusqu'à ce que moi j'arrive") :** À son arrivée, montre-lui le rapport PaniTrack. Tu as produit ${recon.totalLoavesBaked} pains (${recon.totalFlourBagsUsed} sacs), distribué ${recon.totalLoavesDelivered} pains aux livreurs. Tout est horodaté et sécurisé.`;
    }

    if (q.includes('bonjour') || q.includes('bonsoir') || q.includes('commencer') || q.includes('nouveau')) {
      return `👋 Bonsoir camarade ! Rappelle-toi le premier conseil de la note vocale : reste humble et bienveillant avec les boulangers. Ne viens pas comme un "inspecteur". Dis-leur que tu es nouveau et demande-leur gentiment de t'expliquer leur rythme. Je reste à tes côtés pour tout calculer et surveiller les chiffres !`;
    }

    // Réponse de synthèse globale
    const recon = computeShiftReconciliation(state);
    return `ℹ️ **État actuel du shift :**\n- Phase en cours : ${state.currentPhase}\n- Sacs de farine : ${recon.totalFlourBagsUsed}\n- Pains produits : ${recon.totalLoavesBaked}\n- Chariots versés en cartons : ${recon.totalCartsDumpedToCarton}\n- Pains distribués aux livreurs : ${recon.totalLoavesDelivered}\n- Anomalies signalées : ${recon.totalAnomaliesDetected}\n\nPose-moi une question sur Diallo, Souridji, les chariots ou la balance matière !`;
  }
}
