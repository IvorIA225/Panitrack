import React, { useState, useEffect, useRef } from 'react';
import {
  ShiftState,
  ShiftPhase,
  FlourBagEntry,
  CartEntry,
  CartonDumpEntry,
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
import { CleanDispatchPage } from './components/CleanDispatchPage';
import { PhaseBaking } from './components/PhaseBaking';
import { PhaseCartoning } from './components/PhaseCartoning';
import { PhaseOnboarding } from './components/PhaseOnboarding';
import { HandoverReportModal } from './components/HandoverReportModal';
import { AgentDrawer } from './components/AgentDrawer';
import { AuditLogViewer } from './components/AuditLogViewer';
import { Truck, Flame, Box, UserCheck, FileCheck, Layers } from 'lucide-react';

export const App: React.FC = () => {
  const [state, setState] = useState<ShiftState>(() => loadShiftState());
  const [activeTab, setActiveTab] = useState<'dispatch' | 'baking' | 'cartoning' | 'onboarding' | 'handover'>('dispatch');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isAgentOpen, setIsAgentOpen] = useState(false);

  const dispatchSectionRef = useRef<HTMLDivElement>(null);
  const bakingSectionRef = useRef<HTMLDivElement>(null);

  // Sauvegarde automatique dans le LocalStorage
  useEffect(() => {
    saveShiftState(state);
  }, [state]);

  const recon = computeShiftReconciliation(state);

  // ==========================================
  // HANDLERS LIVRAISONS ÉPURÉES (SACS + VRAC)
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
  // HANDLERS PRODUCTION & FOURNIL
  // ==========================================
  const handleUpdateTargetFlourBags = (count: number) => {
    const safeCount = Math.max(1, count || 1);
    setState((prev) => ({
      ...prev,
      targetFlourBags: safeCount,
      auditLogs: [
        ...prev.auditLogs,
        createAuditLog(
          ShiftPhase.PHASE_1_BAKING,
          'production',
          `Cible de production mise à jour : ${safeCount} sacs de farine (${safeCount * 2} chariots, ${safeCount * 360} pains vendables).`,
          'info'
        )
      ]
    }));
  };

  const handleAddFlourBag = (loaves: number, notes?: string) => {
    const newBag: FlourBagEntry = {
      id: 'bag_' + Date.now(),
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      bagIndex: state.flourBags.length + 1,
      expectedLoaves: 400,
      actualLoaves: loaves,
      notes
    };

    setState((prev) => ({
      ...prev,
      flourBags: [...prev.flourBags, newBag],
      auditLogs: [
        ...prev.auditLogs,
        createAuditLog(
          ShiftPhase.PHASE_1_BAKING,
          'production',
          `Sac de farine #${newBag.bagIndex} ouvert. ${loaves} pains sortis.`,
          'success'
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

  const handleAddCart = (loavesCount: number, physicalCapacity: number = 200) => {
    const buffer = physicalCapacity > loavesCount ? physicalCapacity - loavesCount : 0;
    const newCart: CartEntry = {
      id: 'cart_' + Date.now(),
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      cartNumber: state.carts.length + 1,
      loavesCount,
      physicalCapacity,
      lossCompensationBuffer: buffer,
      status: 'sorti_chariot'
    };

    setState((prev) => ({
      ...prev,
      carts: [...prev.carts, newCart],
      auditLogs: [
        ...prev.auditLogs,
        createAuditLog(
          ShiftPhase.PHASE_1_BAKING,
          'production',
          `Chariot #${newCart.cartNumber} enregistré : ${loavesCount} pains vendables + ${buffer} tampon casse (Total : ${physicalCapacity}).`,
          'info'
        )
      ]
    }));
  };

  const handleDeleteCart = (id: string) => {
    setState((prev) => ({
      ...prev,
      carts: prev.carts.filter((c) => c.id !== id),
      auditLogs: [
        ...prev.auditLogs,
        createAuditLog(ShiftPhase.PHASE_1_BAKING, 'production', `Suppression chariot id ${id}`, 'warning')
      ]
    }));
  };

  // ==========================================
  // HANDLERS CARTONNAGE MINUIT
  // ==========================================
  const handleAddCartonDump = (cartonCount: number, notes?: string) => {
    const newDump: CartonDumpEntry = {
      id: 'cdump_' + Date.now(),
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      cartSequenceNumber: state.cartonDumps.length + 1,
      cartonCount,
      estimatedLoaves: cartonCount * 50,
      notes
    };

    setState((prev) => ({
      ...prev,
      cartonDumps: [...prev.cartonDumps, newDump],
      auditLogs: [
        ...prev.auditLogs,
        createAuditLog(
          ShiftPhase.PHASE_2_CARTONING,
          'cartonnage',
          `Chariot #${newDump.cartSequenceNumber} versé dans les cartons (${cartonCount} cartons).`,
          'info'
        )
      ]
    }));
  };

  const handleDeleteCartonDump = (id: string) => {
    setState((prev) => ({
      ...prev,
      cartonDumps: prev.cartonDumps.filter((c) => c.id !== id),
      auditLogs: [
        ...prev.auditLogs,
        createAuditLog(ShiftPhase.PHASE_2_CARTONING, 'cartonnage', `Suppression dépotage id ${id}`, 'warning')
      ]
    }));
  };

  const handleUpdateChecklist = (key: keyof ShiftState['onboardingChecklist'], val: boolean) => {
    setState((prev) => ({
      ...prev,
      onboardingChecklist: { ...prev.onboardingChecklist, [key]: val }
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
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  return (
    <div className="app-container">
      {/* Barre d'en-tête */}
      <HeaderBar
        state={state}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenAgent={() => setIsAgentOpen(true)}
        onLoadDemo={handleLoadDemo}
        onResetShift={handleResetShift}
        unreadAlertsCount={recon.totalAnomaliesDetected}
      />

      {/* Hero 3D Interactif (Scroll-Craft Standard) */}
      <ThreeDimensionalBreadHero
        state={state}
        onScrollToDispatch={() => scrollToSection('dispatch')}
        onScrollToBaking={() => scrollToSection('baking')}
      />

      {/* Barre de navigation ultra-fluide / Onglets épurés */}
      <div className="scroll-rail-nav" style={{ padding: '8px 12px' }}>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
          
          <button
            onClick={() => setActiveTab('dispatch')}
            className="btn"
            style={{
              background: activeTab === 'dispatch' ? 'linear-gradient(135deg, var(--amber-primary) 0%, var(--gold-glow) 100%)' : 'transparent',
              color: activeTab === 'dispatch' ? '#000' : 'var(--flour-white)',
              padding: '10px 18px',
              borderRadius: '12px',
              fontSize: '13.5px',
              fontWeight: 700,
              whiteSpace: 'nowrap'
            }}
          >
            <Truck size={17} />
            <span>🚚 Émargement Livreurs (Sacs & Vrac)</span>
            {(state.deliveries?.length || 0) > 0 && (
              <span style={{
                background: activeTab === 'dispatch' ? 'rgba(0,0,0,0.25)' : 'rgba(245,158,11,0.2)',
                color: activeTab === 'dispatch' ? '#000' : 'var(--amber-light)',
                borderRadius: '999px',
                padding: '2px 8px',
                fontSize: '11px'
              }}>
                {state.deliveries?.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('baking')}
            className="btn"
            style={{
              background: activeTab === 'baking' ? 'linear-gradient(135deg, var(--amber-primary) 0%, var(--gold-glow) 100%)' : 'transparent',
              color: activeTab === 'baking' ? '#000' : 'var(--flour-white)',
              padding: '10px 16px',
              borderRadius: '12px',
              fontSize: '13.5px',
              fontWeight: 600,
              whiteSpace: 'nowrap'
            }}
          >
            <Flame size={17} />
            <span>🥖 Fournil & Chariots (180+20)</span>
          </button>

          <button
            onClick={() => setActiveTab('cartoning')}
            className="btn"
            style={{
              background: activeTab === 'cartoning' ? 'linear-gradient(135deg, var(--amber-primary) 0%, var(--gold-glow) 100%)' : 'transparent',
              color: activeTab === 'cartoning' ? '#000' : 'var(--flour-white)',
              padding: '10px 16px',
              borderRadius: '12px',
              fontSize: '13.5px',
              fontWeight: 600,
              whiteSpace: 'nowrap'
            }}
          >
            <Box size={17} />
            <span>📦 Cartonnage (Minuit)</span>
          </button>

          <button
            onClick={() => setActiveTab('onboarding')}
            className="btn"
            style={{
              background: activeTab === 'onboarding' ? 'linear-gradient(135deg, var(--amber-primary) 0%, var(--gold-glow) 100%)' : 'transparent',
              color: activeTab === 'onboarding' ? '#000' : 'var(--flour-white)',
              padding: '10px 16px',
              borderRadius: '12px',
              fontSize: '13.5px',
              fontWeight: 600,
              whiteSpace: 'nowrap'
            }}
          >
            <UserCheck size={17} />
            <span>🤝 Posture & Arrivée</span>
          </button>

          <button
            onClick={() => setIsReportOpen(true)}
            className="btn"
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              padding: '10px 16px',
              borderRadius: '12px',
              fontSize: '13.5px',
              fontWeight: 700,
              marginLeft: 'auto',
              whiteSpace: 'nowrap'
            }}
          >
            <FileCheck size={17} />
            <span>Bordereau Patron (Clôture)</span>
          </button>

        </div>
      </div>

      {/* Vue active épurée */}
      <main className="perspective-stage">
        {activeTab === 'dispatch' && (
          <div ref={dispatchSectionRef}>
            <CleanDispatchPage
              state={state}
              onAddDelivery={handleAddDelivery}
              onUpdateDelivery={handleUpdateDelivery}
              onDeleteDelivery={handleDeleteDelivery}
            />
          </div>
        )}

        {activeTab === 'baking' && (
          <div ref={bakingSectionRef}>
            <PhaseBaking
              state={state}
              onUpdateTargetFlourBags={handleUpdateTargetFlourBags}
              onAddFlourBag={handleAddFlourBag}
              onDeleteFlourBag={handleDeleteFlourBag}
              onAddCart={handleAddCart}
              onDeleteCart={handleDeleteCart}
              onAdvanceToPhase2={() => setActiveTab('cartoning')}
            />
          </div>
        )}

        {activeTab === 'cartoning' && (
          <PhaseCartoning
            state={state}
            onAddCartonDump={handleAddCartonDump}
            onDeleteCartonDump={handleDeleteCartonDump}
            onAdvanceToPhase3={() => setActiveTab('dispatch')}
          />
        )}

        {activeTab === 'onboarding' && (
          <PhaseOnboarding
            state={state}
            onUpdateChecklist={handleUpdateChecklist}
            onAdvanceToPhase1={() => setActiveTab('baking')}
          />
        )}
      </main>

      {/* Journal d'Audit Immuable */}
      <AuditLogViewer logs={state.auditLogs} />

      {/* Modals & Tiroir Copilote */}
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
    </div>
  );
};
export default App;
