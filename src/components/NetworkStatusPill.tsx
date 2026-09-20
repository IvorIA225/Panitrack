import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Download, CheckCircle2 } from 'lucide-react';

export const NetworkStatusPill: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Événement d'installation PWA (Android / Chrome / Edge)
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {/* Badge statut connexion */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '5px 12px',
          borderRadius: '999px',
          fontSize: '12px',
          fontWeight: 700,
          background: isOnline ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.2)',
          color: isOnline ? '#34d399' : 'var(--amber-light)',
          border: `1px solid ${isOnline ? 'rgba(16, 185, 129, 0.35)' : 'rgba(245, 158, 11, 0.45)'}`,
          boxShadow: isOnline ? 'none' : '0 0 12px rgba(245, 158, 11, 0.3)'
        }}
        title={isOnline ? 'Application connectée et mise en cache' : 'Mode 100% hors-ligne actif. Vos données sont enregistrées en local.'}
      >
        {isOnline ? (
          <>
            <Wifi size={13} />
            <span>En ligne (PWA)</span>
          </>
        ) : (
          <>
            <WifiOff size={13} />
            <span>⚡ Mode Hors-Ligne (100% Actif)</span>
          </>
        )}
      </div>

      {/* Bouton d'installation PWA si disponible */}
      {deferredPrompt && !isInstalled && (
        <button
          onClick={handleInstallClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(139, 92, 246, 0.4)'
          }}
          title="Installer l'application sur votre écran d'accueil pour l'ouvrir sans navigateur"
        >
          <Download size={13} />
          <span>Installer l'App</span>
        </button>
      )}
    </div>
  );
};
