import React, { useState, useEffect, useRef } from 'react';
import {
  ShiftState,
  ShiftPhase,
  FlourBagEntry,
  DeliveryEntry
} from './wat/types';
import {
  loadShiftState,
  saveShiftState,
  resetShiftState,
  loadVoiceNoteDemoScenario
} from './wat/state';
import {
  createAuditLog,
  computeShiftReconciliation
} from './wat/tools';
import { ShiftAgent } from './wat/agent';

import { HeaderBar } from './components/HeaderBar';
import { ThreeDimensionalBreadHero } from './components/ThreeDimensionalBreadHero';
import { SimplePatesFarinePage } from './components/SimplePatesFarinePage';
import { CleanDispatchPage } from './components/CleanDispatchPage';
import { ZeroManquantControlView } from './components/ZeroManquantControlView';
import { HandoverReportModal } from './components/HandoverReportModal';
import { ProtocolZeroManquantModal } from './components/ProtocolZeroManquantModal';
import { AgentDrawer } from './components/AgentDrawer';
import { AuditLogViewer } from './components/AuditLogViewer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Truck, ShoppingBag, ShieldCheck, FileCheck } from 'lucide-react';

export const App: React.FC = () => {
  const [state, setState] = useState<ShiftState>(() => loadShiftState());
  const [activeTab, setActiveTab] = useState<'pates' | 'dispatch' | 'reconciliation'>('pates');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isProtocolModalOpen, setIsProtocolModalOpen] = useState(false);
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [isHeroVisible, setIsHeroVisible] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth > 768;
    }
    return true;
  });

  const dispatchSectionRef = useRef<HTMLDivElement>(null);
  const bakingSectionRef = useRef<HTMLDivElement>(null);

  // Sauvegarde automatique dans le LocalStorage
  useEffect(() => {
    saveShiftState(state);
  }, [state]);

  const recon = computeShiftReconciliation(state);

  // ==========================================
  // HANDLERS EXPÉDITIONS & LIVRAISONS
  // ==========================================
  const handleAddDelivery = (delivery: DeliveryEntry) => {
    setState((prev) => {
      const updated = [delivery, ...(prev.deliveries || [])];
      const logs = [...prev.auditLogs];

      if (delivery.isAnomaly) {
        logs.push(
          createAuditLog(
            ShiftPhase.PHASE_3_DISPATCH,
            'securite',
            `ALERTE DIALLO : ${delivery.driverName} - Sac contrôlé à 27 pains (+2). Total : ${delivery.totalLoaves} pains au lieu du quota standard.`,
            'danger'
          )
        );
      } else {
        logs.push(
          createAuditLog(
            ShiftPhase.PHASE_3_DISPATCH,
            'livraison',
            `Livraison enregistrée : ${delivery.driverName} - ${delivery.totalLoaves} pains (${delivery.bagsCount} sacs + ${delivery.looseLoavesCount} vrac).`,
            'success'
          )
        );
      }

      // Message d'alerte pour l'agent si anomalie
      const newAgentMsgs = [...prev.agentMessages];
      if (delivery.isAnomaly) {
        newAgentMsgs.push({
          id: 'agent_alert_' + Date.now(),
          timestamp: delivery.timestamp,
          sender: 'agent',
          category: 'alerte',
          content: `🚨 **ANOMALIE ENREGISTRÉE POUR DIALLO :**
${delivery.bagsCount} sacs facturés sur base réelle de **27 pains** au lieu de 25.
Grâce à votre contrôle physique, **${delivery.bagsCount * 2} pains** supplémentaires ont été sauvés et tracés !`
        });
      }

      return {
        ...prev,
        deliveries: updated,
        agentMessages: newAgentMsgs,
        auditLogs: logs
      };
    });
  };

  const handleUpdateDelivery = (delivery: DeliveryEntry) => {
    setState((prev) => {
      const updated = (prev.deliveries || []).map((d) => (d.id === delivery.id ? delivery : d));
      return {
        ...prev,
        deliveries: updated,
        auditLogs: [
          ...prev.auditLogs,
          createAuditLog(
            ShiftPhase.PHASE_3_DISPATCH,
            'livraison',
            `Mise à jour livraison ${delivery.driverName} : total porté à ${delivery.totalLoaves} pains (${delivery.status === 'cloture' ? '🏁 Départ confirmé' : 'Prise ajoutée'}).`,
            'info'
          )
        ]
      };
    });
  };

  const handleDeleteDelivery = (id: string) => {
    setState((prev) => ({
      ...prev,
      deliveries: (prev.deliveries || []).filter((d) => d.id !== id),
      auditLogs: [
        ...prev.auditLogs,
        createAuditLog(ShiftPhase.PHASE_3_DISPATCH, 'livraison', `Suppression de la livraison ${id}`, 'warning')
      ]
    }));
  };

  // ==========================================
  // HANDLERS COMPTAGE PÂTES & FOURNIL
  // ==========================================
  const handleAddFlourBag = (
    loaves: number,
    notes?: string,
    burned?: number,
    broken?: number,
    cart1?: number,
    cart2?: number,
    cart3?: number,
    patesCount?: number
  ) => {
    const burnedLoaves = burned || 0;
    const brokenLoaves = broken || 0;
    const netVendable = Math.max(0, loaves - (burnedLoaves + brokenLoaves));
    const safePates = patesCount !== undefined ? patesCount : Math.round(loaves / 20);
    const deltaQuotaLoaves = (safePates * 20) - 400;

    const newBag: FlourBagEntry = {
      id: 'bag_' + Date.now(),
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      bagIndex: state.flourBags.length + 1,
      patesCount: safePates,
      loavesPerPate: 20,
      expectedLoaves: 400,
      actualLoaves: loaves,
      cart1Loaves: cart1,
      cart2Loaves: cart2,
      cart3Loaves: cart3,
      burnedLoaves,
      brokenLoaves,
      netVendableLoaves: netVendable,
      deltaQuotaLoaves,
      notes
    };

    const deltaSign = deltaQuotaLoaves === 0
      ? 'Quota parfait 20 pâtes'
      : deltaQuotaLoaves > 0
      ? `+${deltaQuotaLoaves / 20} pâte (+${deltaQuotaLoaves} b.)`
      : `${deltaQuotaLoaves / 20} pâte (${deltaQuotaLoaves} b.)`;

    setState((prev) => ({
      ...prev,
      flourBags: [...prev.flourBags, newBag],
      auditLogs: [
        ...prev.auditLogs,
        createAuditLog(
          ShiftPhase.PHASE_1_BAKING,
          'production',
          `Sac #${newBag.bagIndex} contrôlé : ${safePates} pâtes = ${loaves} baguettes brutes [${deltaSign}] (Vendables: ${netVendable}, Brûlés: ${burnedLoaves}, Cassés: ${brokenLoaves}).`,
          deltaQuotaLoaves < 0 ? 'warning' : 'success'
        )
      ]
    }));
  };

  const handleDeleteFlourBag = (id: string) => {
    setState((prev) => ({
      ...prev,
      flourBags: prev.flourBags.filter((b) => b.id !== id),
      auditLogs: [
        ...prev.auditLogs,
        createAuditLog(ShiftPhase.PHASE_1_BAKING, 'production', `Suppression sac id ${id}`, 'warning')
      ]
    }));
  };

  const handleUpdatePhysicalStock = (count: number) => {
    setState((prev) => ({
      ...prev,
      countedPhysicalStockRemaining: count,
      auditLogs: [
        ...prev.auditLogs,
        createAuditLog(
          ShiftPhase.PHASE_4_HANDOVER,
          'production',
          `Inventaire physique stock fournil vérifié : ${count} pains restants pour la boutique du matin.`,
          'info'
        )
      ]
    }));
  };

  const handleToggleProtocolChecklist = (key: keyof ShiftState['protocolChecklist']) => {
    setState((prev) => ({
      ...prev,
      protocolChecklist: {
        ...prev.protocolChecklist,
        [key]: !prev.protocolChecklist?.[key]
      }
    }));
  };

  const handleAgentSendMessage = (text: string) => {
    const userMsg = {
      id: 'user_' + Date.now(),
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      sender: 'user' as const,
      content: text
    };

    const replyText = ShiftAgent.respondToUserQuery(text, state);
    const agentMsg = {
      id: 'agent_' + Date.now(),
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      sender: 'agent' as const,
      category: 'conseil' as const,
      content: replyText
    };

    setState((prev) => ({
      ...prev,
      agentMessages: [...prev.agentMessages, userMsg, agentMsg]
    }));
  };

  const handleLoadDemo = () => {
    const demo = loadVoiceNoteDemoScenario();
    setState(demo);
  };

  const handleResetShift = () => {
    if (window.confirm('Voulez-vous vraiment réinitialiser ce shift pour en démarrer un nouveau ?')) {
      const fresh = resetShiftState();
      setState(fresh);
    }
  };

  const scrollToSection = (tab: typeof activeTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  const zeroMissingStatus = recon.zeroMissingBalance === 0
    ? 'perfect'
    : recon.zeroMissingBalance > 0
    ? 'missing'
    : 'surplus';

  return (
    <div className="app-container">
      {/* Barre d'en-tête responsive */}
      <HeaderBar
        state={state}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenAgent={() => setIsAgentOpen(true)}
        onLoadDemo={handleLoadDemo}
        onResetShift={handleResetShift}
        onOpenProtocol={() => setIsProtocolModalOpen(true)}
        unreadAlertsCount={recon.totalAnomaliesDetected}
        isHeroVisible={isHeroVisible}
        onToggleHero={() => setIsHeroVisible(!isHeroVisible)}
      />

      {/* Hero 3D Interactif (Compact ou Étendu) */}
      <ThreeDimensionalBreadHero
        state={state}
        onScrollToDispatch={() => scrollToSection('dispatch')}
        onScrollToBaking={() => scrollToSection('pates')}
        isCollapsed={!isHeroVisible}
        onToggleCollapse={() => setIsHeroVisible(!isHeroVisible)}
      />

      {/* Barre de navigation simplifiée : 3 Piliers Infaillibles */}
      <div className="scroll-rail-nav" style={{ padding: '10px 14px' }}>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px', alignItems: 'center' }}>
          
          {/* Ligne Directive */}
          <button
            onClick={() => setIsProtocolModalOpen(true)}
            className="btn"
            style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.25) 100%)',
              color: 'var(--amber-light)',
              border: '1px solid rgba(245, 158, 11, 0.5)',
              padding: '10px 16px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 800,
              whiteSpace: 'nowrap'
            }}
            title="Consulter la ligne directive et les règles d'or"
          >
            <ShieldCheck size={16} />
            <span>🛡️ Ligne Directive</span>
          </button>

          {/* Pilier 1 : Pâtes par Sac de Farine */}
          <button
            onClick={() => setActiveTab('pates')}
            className="btn"
            style={{
              background: activeTab === 'pates' ? 'linear-gradient(135deg, var(--amber-primary) 0%, var(--gold-glow) 100%)' : 'rgba(255,255,255,0.05)',
              color: activeTab === 'pates' ? '#000' : 'var(--flour-white)',
              padding: '10px 18px',
              borderRadius: '12px',
              fontSize: '13.5px',
              fontWeight: 800,
              whiteSpace: 'nowrap',
              border: activeTab === 'pates' ? 'none' : '1px solid rgba(255,255,255,0.1)',
              boxShadow: activeTab === 'pates' ? '0 4px 15px rgba(245,158,11,0.4)' : 'none'
            }}
          >
            <ShoppingBag size={17} />
            <span>🥖 1. Pâtes & Fournil</span>
            {(state.flourBags?.length || 0) > 0 && (
              <span style={{
                background: activeTab === 'pates' ? 'rgba(0,0,0,0.25)' : 'rgba(245,158,11,0.25)',
                color: activeTab === 'pates' ? '#000' : 'var(--amber-light)',
                borderRadius: '999px',
                padding: '2px 8px',
                fontSize: '11px',
                fontWeight: 800
              }}>
                {state.flourBags.length} sac{state.flourBags.length > 1 ? 's' : ''} ({recon.totalPatesCount} p.)
              </span>
            )}
          </button>

          {/* Pilier 2 : Sorties Livreurs */}
          <button
            onClick={() => setActiveTab('dispatch')}
            className="btn"
            style={{
              background: activeTab === 'dispatch' ? 'linear-gradient(135deg, var(--amber-primary) 0%, var(--gold-glow) 100%)' : 'rgba(255,255,255,0.05)',
              color: activeTab === 'dispatch' ? '#000' : 'var(--flour-white)',
              padding: '10px 18px',
              borderRadius: '12px',
              fontSize: '13.5px',
              fontWeight: 800,
              whiteSpace: 'nowrap',
              border: activeTab === 'dispatch' ? 'none' : '1px solid rgba(255,255,255,0.1)',
              boxShadow: activeTab === 'dispatch' ? '0 4px 15px rgba(245,158,11,0.4)' : 'none'
            }}
          >
            <Truck size={17} />
            <span>🚚 2. Sorties Livreurs (Sas)</span>
            {(state.deliveries?.length || 0) > 0 && (
              <span style={{
                background: activeTab === 'dispatch' ? 'rgba(0,0,0,0.25)' : 'rgba(245,158,11,0.25)',
                color: activeTab === 'dispatch' ? '#000' : 'var(--amber-light)',
                borderRadius: '999px',
                padding: '2px 8px',
                fontSize: '11px',
                fontWeight: 800
              }}>
                {state.deliveries.length} sortie{state.deliveries.length > 1 ? 's' : ''}
              </span>
            )}
          </button>

          {/* Pilier 3 : Contrôle Infaillible Zéro Manquant */}
          <button
            onClick={() => setActiveTab('reconciliation')}
            className="btn"
            style={{
              background: activeTab === 'reconciliation'
                ? 'linear-gradient(135deg, #10b981 0%, #047857 100%)'
                : recon.zeroMissingBalance > 0
                ? 'rgba(239, 68, 68, 0.2)'
                : 'rgba(255,255,255,0.05)',
              color: activeTab === 'reconciliation' ? '#fff' : recon.zeroMissingBalance > 0 ? '#fca5a5' : 'var(--flour-white)',
              padding: '10px 18px',
              borderRadius: '12px',
              fontSize: '13.5px',
              fontWeight: 800,
              whiteSpace: 'nowrap',
              border: activeTab === 'reconciliation' ? 'none' : recon.zeroMissingBalance > 0 ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
              boxShadow: activeTab === 'reconciliation' ? '0 4px 15px rgba(16, 185, 129, 0.4)' : 'none'
            }}
          >
            <ShieldCheck size={17} />
            <span>⚖️ 3. Zéro Manquant & Bilan</span>
            <span style={{
              background: activeTab === 'reconciliation' ? 'rgba(0,0,0,0.25)' : recon.zeroMissingBalance === 0 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.3)',
              color: activeTab === 'reconciliation' ? '#fff' : recon.zeroMissingBalance === 0 ? '#34d399' : '#f87171',
              borderRadius: '999px',
              padding: '2px 8px',
              fontSize: '11px',
              fontWeight: 800
            }}>
              {recon.zeroMissingBalance === 0 ? '✓ 0 Manquant' : `🚨 ${recon.zeroMissingBalance} Manquant`}
            </span>
          </button>

          {/* Fiche Patron Modal */}
          <button
            onClick={() => setIsReportOpen(true)}
            className="btn btn-secondary"
            style={{
              fontSize: '13px',
              padding: '10px 16px',
              marginLeft: 'auto',
              whiteSpace: 'nowrap',
              color: '#34d399',
              border: '1px solid rgba(16, 185, 129, 0.45)'
            }}
            title="Consulter le bordereau officiel pour le patron"
          >
            <FileCheck size={16} />
            <span>📋 Bordereau Patron</span>
          </button>

        </div>
      </div>

      {/* Vues Actives : 3 Piliers Infaillibles */}
      <main className="perspective-stage">
        {activeTab === 'pates' && (
          <div ref={bakingSectionRef}>
            <SimplePatesFarinePage
              state={state}
              onAddFlourBag={handleAddFlourBag}
              onDeleteFlourBag={handleDeleteFlourBag}
              onNavigateToDrivers={() => setActiveTab('dispatch')}
              onOpenProtocolModal={() => setIsProtocolModalOpen(true)}
            />
          </div>
        )}

        {activeTab === 'dispatch' && (
          <div ref={dispatchSectionRef}>
            <CleanDispatchPage
              state={state}
              onAddDelivery={handleAddDelivery}
              onUpdateDelivery={handleUpdateDelivery}
              onDeleteDelivery={handleDeleteDelivery}
              onOpenProtocolModal={() => setIsProtocolModalOpen(true)}
            />
          </div>
        )}

        {activeTab === 'reconciliation' && (
          <div>
            <ZeroManquantControlView
              state={state}
              onUpdatePhysicalStock={handleUpdatePhysicalStock}
              onOpenReportModal={() => setIsReportOpen(true)}
              onNavigateToPates={() => setActiveTab('pates')}
              onNavigateToDispatch={() => setActiveTab('dispatch')}
            />
          </div>
        )}
      </main>

      {/* Journal d'Audit Immuable */}
      <AuditLogViewer logs={state.auditLogs} />

      {/* Barre de navigation mobile inférieure tactile */}
      <MobileBottomNav
        activeTab={activeTab}
        onChangeTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAgent={() => setIsAgentOpen(true)}
        unreadAlertsCount={recon.totalAnomaliesDetected}
        activeSasCount={state.deliveries?.filter((d) => d.status === 'en_cours').length || 0}
        totalBagsCount={state.flourBags?.length || 0}
        zeroMissingStatus={zeroMissingStatus}
      />

      {/* Modals & Copilote IA */}
      <HandoverReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        state={state}
      />

      <AgentDrawer
        isOpen={isAgentOpen}
        onClose={() => setIsAgentOpen(false)}
        state={state}
        onSendMessage={handleAgentSendMessage}
      />

      <ProtocolZeroManquantModal
        isOpen={isProtocolModalOpen}
        onClose={() => setIsProtocolModalOpen(false)}
        state={state}
        onToggleChecklist={handleToggleProtocolChecklist}
      />
    </div>
  );
};
export default App;
