import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../src/contexts/AuthContext'
import { WalletProvider } from '../src/contexts/WalletContext'
import { PWAProvider } from '../src/contexts/PWAContext'
import { WebSocketProvider } from '../src/contexts/WebSocketContext'
import { PWAInstallPrompt, PWAInstallBanner } from '../src/components/PWA/PWAInstallPrompt'
import { OfflineIndicator } from '../src/components/PWA/OfflineIndicator'
import GlobalErrorBoundary from '../src/components/ErrorBoundary/GlobalErrorBoundary'
import '../src/styles/globals.css'
import '../src/styles/realtime.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
  },
})

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }

    // Prevent zoom on double tap for iOS
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function (event) {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, false);

    // Handle viewport height on mobile
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);

    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
    };
  }, []);

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover"
        />
        <meta name="description" content="Transform academic achievements into dynamic NFTs. Unlock exclusive opportunities with AI-powered verification and multi-chain support." />
        <meta name="keywords" content="academic,nft,achievements,university,blockchain,careers,opportunities" />
        <title>Academic NFT Marketplace - Cross-University Achievement Platform</title>

        <link rel="manifest" href="/manifest.json" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-72x72.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />

        <meta name="theme-color" content="#6366F1" />
        <meta name="background-color" content="#0F172A" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AcademicNFT" />
        <meta name="application-name" content="AcademicNFT" />
        <meta name="msapplication-TileColor" content="#6366F1" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Academic NFT Marketplace" />
        <meta property="og:description" content="Transform academic achievements into dynamic NFTs" />
        <meta property="og:site_name" content="Academic NFT Marketplace" />
        <meta property="og:url" content="https://academic-nft.com" />
        <meta property="og:image" content="/icons/icon-512x512.png" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Academic NFT Marketplace" />
        <meta name="twitter:description" content="Transform academic achievements into dynamic NFTs" />
        <meta name="twitter:image" content="/icons/icon-512x512.png" />

        {/* Disable automatic detection and formatting of possible phone numbers */}
        <meta name="format-detection" content="telephone=no" />
        
        {/* Prevent text size adjust after orientation change in iOS */}
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </Head>

      <GlobalErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <PWAProvider>
            <AuthProvider>
              <WebSocketProvider>
                <WalletProvider>
                  <PWAInstallBanner />
                  <OfflineIndicator />
                  <Component {...pageProps} />
                  <PWAInstallPrompt />
                </WalletProvider>
              </WebSocketProvider>
            </AuthProvider>
          </PWAProvider>
        </QueryClientProvider>
      </GlobalErrorBoundary>
    </>
  )
}