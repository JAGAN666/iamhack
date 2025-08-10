import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowDownTrayIcon,
  XMarkIcon,
  DevicePhoneMobileIcon,
  WifiIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  BellIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface PWAInstallPrompt extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAManagerProps {
  enableNotifications?: boolean;
  enableOfflineMode?: boolean;
  enableAutoUpdate?: boolean;
}

const PWAManager: React.FC<PWAManagerProps> = ({
  enableNotifications = true,
  enableOfflineMode = true,
  enableAutoUpdate = true
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<PWAInstallPrompt | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [installStats, setInstallStats] = useState({
    platforms: [] as string[],
    canInstall: false,
    isStandalone: false
  });

  // Check if app is installed/standalone
  useEffect(() => {
    const checkInstallStatus = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInstalled = (window.navigator as any).standalone || isStandalone;
      
      setIsInstalled(isInstalled);
      setInstallStats(prev => ({ ...prev, isStandalone }));
    };

    checkInstallStatus();
    window.matchMedia('(display-mode: standalone)').addEventListener('change', checkInstallStatus);

    return () => {
      window.matchMedia('(display-mode: standalone)').removeEventListener('change', checkInstallStatus);
    };
  }, []);

  // Handle PWA install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const prompt = e as PWAInstallPrompt;
      setDeferredPrompt(prompt);
      setInstallStats(prev => ({
        ...prev,
        platforms: prompt.platforms,
        canInstall: true
      }));

      // Show install banner after delay if not dismissed
      setTimeout(() => {
        if (!isInstalled && !localStorage.getItem('pwa-install-dismissed')) {
          setShowInstallBanner(true);
        }
      }, 3000);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallBanner(false);
      setDeferredPrompt(null);
      toast.success('🎉 App installed successfully!');
      
      // Track installation
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'pwa_install', {
          method: 'banner'
        });
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (enableOfflineMode) {
        toast.success('🌐 Back online! Syncing data...');
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      if (enableOfflineMode) {
        toast('📡 You\'re offline. Some features may be limited.', {
          icon: '📡',
          duration: 4000
        });
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial status
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [enableOfflineMode]);

  // Service Worker and updates
  useEffect(() => {
    if (!enableAutoUpdate || typeof window === 'undefined') return;

    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          
          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true);
                }
              });
            }
          });

          console.log('✅ Service Worker registered successfully');
        } catch (error) {
          console.error('❌ Service Worker registration failed:', error);
        }
      }
    };

    registerServiceWorker();
  }, [enableAutoUpdate]);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (!enableNotifications || !('Notification' in window)) return;

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted') {
        toast.success('🔔 Notifications enabled!');
        
        // Send welcome notification
        new Notification('Academic NFT Marketplace', {
          body: 'You\'ll now receive updates about your achievements!',
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          tag: 'welcome'
        });
      } else {
        toast.error('Notifications were blocked. You can enable them in your browser settings.');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  }, [enableNotifications]);

  // Install PWA
  const handleInstallClick = useCallback(async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('✅ User accepted the install prompt');
      } else {
        console.log('❌ User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    } catch (error) {
      console.error('Error during app installation:', error);
      toast.error('Installation failed. Please try again.');
    }
  }, [deferredPrompt]);

  // Dismiss install banner
  const dismissInstallBanner = useCallback(() => {
    setShowInstallBanner(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
    localStorage.setItem('pwa-install-dismissed-date', new Date().toISOString());
  }, []);

  // Apply app update
  const applyUpdate = useCallback(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration?.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      });
    }
  }, []);

  // Send test notification
  const sendTestNotification = useCallback(() => {
    if (notificationPermission === 'granted') {
      new Notification('Achievement Unlocked! 🏆', {
        body: 'Your latest submission has been verified!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: 'achievement',
        data: { achievementId: 'demo-123' }
        // Note: actions are not supported in basic Notification API
        // For actions, use Service Worker Registration.showNotification instead
      });
    }
  }, [notificationPermission]);

  return (
    <>
      {/* Install Banner */}
      <AnimatePresence>
        {showInstallBanner && !isInstalled && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-0 left-0 right-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 shadow-lg z-50"
          >
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <DevicePhoneMobileIcon className="w-8 h-8" />
                <div>
                  <h3 className="font-bold text-lg">Install Academic NFT App</h3>
                  <p className="text-sm opacity-90">
                    Get faster access, offline support, and push notifications!
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleInstallClick}
                  className="flex items-center px-6 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                  Install
                </button>
                <button
                  onClick={dismissInstallBanner}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline Indicator */}
      <AnimatePresence>
        {!isOnline && enableOfflineMode && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 left-4 bg-yellow-500 text-yellow-900 px-4 py-2 rounded-lg shadow-lg z-40"
          >
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Offline Mode</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Update Available Banner */}
      <AnimatePresence>
        {updateAvailable && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-40 max-w-sm"
          >
            <div className="flex items-start space-x-3">
              <CheckCircleIcon className="w-6 h-6 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium">Update Available!</h4>
                <p className="text-sm opacity-90 mt-1">
                  New features and improvements are ready.
                </p>
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={applyUpdate}
                    className="px-3 py-1 bg-white text-green-600 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
                  >
                    Update Now
                  </button>
                  <button
                    onClick={() => setUpdateAvailable(false)}
                    className="px-3 py-1 border border-white text-white rounded text-sm hover:bg-white hover:bg-opacity-20 transition-colors"
                  >
                    Later
                  </button>
                </div>
              </div>
              <button
                onClick={() => setUpdateAvailable(false)}
                className="text-white hover:text-gray-200"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PWA Status Panel (Development/Debug) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-20 right-4 bg-white shadow-lg rounded-lg p-4 z-30 text-sm max-w-xs">
          <h3 className="font-bold mb-3 flex items-center">
            <CogIcon className="w-4 h-4 mr-2" />
            PWA Status
          </h3>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Installed:</span>
              <span className={isInstalled ? 'text-green-600' : 'text-red-600'}>
                {isInstalled ? '✅' : '❌'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Online:</span>
              <span className={isOnline ? 'text-green-600' : 'text-yellow-600'}>
                {isOnline ? '🌐' : '📡'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Notifications:</span>
              <span className={notificationPermission === 'granted' ? 'text-green-600' : 'text-gray-600'}>
                {notificationPermission === 'granted' ? '🔔' : '🔕'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Installable:</span>
              <span className={installStats.canInstall ? 'text-green-600' : 'text-gray-600'}>
                {installStats.canInstall ? '✅' : '❌'}
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {!isInstalled && installStats.canInstall && (
              <button
                onClick={handleInstallClick}
                className="w-full px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700"
              >
                Install App
              </button>
            )}
            
            {enableNotifications && notificationPermission !== 'granted' && (
              <button
                onClick={requestNotificationPermission}
                className="w-full px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
              >
                Enable Notifications
              </button>
            )}
            
            {notificationPermission === 'granted' && (
              <button
                onClick={sendTestNotification}
                className="w-full px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700"
              >
                Test Notification
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

// Hook for PWA utilities
export const usePWA = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    const updateInstallStatus = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      setIsInstalled((window.navigator as any).standalone || isStandalone);
    };

    updateOnlineStatus();
    updateInstallStatus();

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    window.matchMedia('(display-mode: standalone)').addEventListener('change', updateInstallStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      window.matchMedia('(display-mode: standalone)').removeEventListener('change', updateInstallStatus);
    };
  }, []);

  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      return new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        ...options
      });
    }
    return null;
  }, []);

  return {
    isOnline,
    isInstalled,
    sendNotification,
    canNotify: 'Notification' in window && Notification.permission === 'granted'
  };
};

export default PWAManager;