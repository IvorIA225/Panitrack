import React from 'react';
import { ShoppingBag, Truck, ShieldCheck, Bot, FileText } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'pates' | 'dispatch' | 'reconciliation';
  onChangeTab: (tab: 'pates' | 'dispatch' | 'reconciliation') => void;
  onOpenAgent: () => void;
  unreadAlertsCount: number;
  activeSasCount: number;
  totalBagsCount: number;
  zeroMissingStatus: 'perfect' | 'missing' | 'surplus';
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onChangeTab,
  onOpenAgent,
  unreadAlertsCount,
  activeSasCount,
  totalBagsCount,
  zeroMissingStatus
}) => {
  return (
    <nav className="mobile-bottom-nav" aria-label="Navigation mobile principale">
      {/* 1. Fournil & Pâtes */}
      <button
        type="button"
        className={`mobile-nav-btn ${activeTab === 'pates' ? 'active' : ''}`}
        onClick={() => onChangeTab('pates')}
      >
        <div className="mobile-nav-icon-wrap">
          <ShoppingBag size={20} />
          {totalBagsCount > 0 && (
            <span className="mobile-nav-badge amber">{totalBagsCount}</span>
          )}
        </div>
        <span className="mobile-nav-label">1. Pâtes</span>
      </button>

      {/* 2. Expédition & Livreurs */}
      <button
        type="button"
        className={`mobile-nav-btn ${activeTab === 'dispatch' ? 'active' : ''}`}
        onClick={() => onChangeTab('dispatch')}
      >
        <div className="mobile-nav-icon-wrap">
          <Truck size={20} />
          {activeSasCount > 0 && (
            <span className="mobile-nav-badge warning">{activeSasCount}</span>
          )}
        </div>
        <span className="mobile-nav-label">2. Livreurs</span>
      </button>

      {/* 3. Zéro Manquant (Balance Infaillible) */}
      <button
        type="button"
        className={`mobile-nav-btn ${activeTab === 'reconciliation' ? 'active' : ''}`}
        onClick={() => onChangeTab('reconciliation')}
      >
        <div className="mobile-nav-icon-wrap">
          <ShieldCheck size={20} />
          {zeroMissingStatus === 'perfect' ? (
            <span className="mobile-nav-badge" style={{ background: '#10b981', color: '#fff' }}>✓</span>
          ) : zeroMissingStatus === 'missing' ? (
            <span className="mobile-nav-badge danger">!</span>
          ) : null}
        </div>
        <span className="mobile-nav-label">3. Zéro Manquant</span>
      </button>

      {/* 4. Copilote IA */}
      <button
        type="button"
        className="mobile-nav-btn"
        onClick={onOpenAgent}
      >
        <div className="mobile-nav-icon-wrap">
          <Bot size={20} />
          {unreadAlertsCount > 0 && (
            <span className="mobile-nav-badge danger">{unreadAlertsCount}</span>
          )}
        </div>
        <span className="mobile-nav-label">Copilote IA</span>
      </button>
    </nav>
  );
};
export default MobileBottomNav;
