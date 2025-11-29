import React, { useState, useEffect } from 'react';
import { X, Download, Share } from 'lucide-react';
import Button from './ui/Button';

const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if already installed
        const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
            || window.navigator.standalone
            || document.referrer.includes('android-app://');

        setIsStandalone(isInStandaloneMode);

        // Check if iOS
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        setIsIOS(iOS);

        // Check if already dismissed
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        const dismissedTime = dismissed ? parseInt(dismissed) : 0;
        const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

        // Show prompt if not installed, not dismissed recently (7 days), and not iOS (iOS has different flow)
        if (!isInStandaloneMode && (!dismissed || daysSinceDismissed > 7) && !iOS) {
            // Listen for the beforeinstallprompt event
            const handleBeforeInstallPrompt = (e) => {
                e.preventDefault();
                setDeferredPrompt(e);
                setShowPrompt(true);
            };

            window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

            return () => {
                window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            };
        }

        // For iOS, show instructions after a delay if not installed
        if (iOS && !isInStandaloneMode && (!dismissed || daysSinceDismissed > 7)) {
            const timer = setTimeout(() => {
                setShowPrompt(true);
            }, 3000); // Show after 3 seconds

            return () => clearTimeout(timer);
        }
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        }

        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
        setShowPrompt(false);
    };

    // Don't show if already installed
    if (isStandalone || !showPrompt) {
        return null;
    }

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-green-500 rounded-xl flex items-center justify-center">
                                <Download className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    Install FB Studio
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Quick access from your home screen
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleDismiss}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {isIOS ? (
                        <div className="space-y-3">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                To install this app on your iPhone/iPad:
                            </p>
                            <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-2 pl-4">
                                <li className="flex items-start gap-2">
                                    <span className="font-semibold text-primary">1.</span>
                                    <span>
                                        Tap the <Share className="w-4 h-4 inline mx-1" /> Share button
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="font-semibold text-primary">2.</span>
                                    <span>Scroll down and tap "Add to Home Screen"</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="font-semibold text-primary">3.</span>
                                    <span>Tap "Add" in the top right corner</span>
                                </li>
                            </ol>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDismiss}
                                className="w-full mt-2"
                            >
                                Got it
                            </Button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={handleInstallClick}
                                className="flex-1"
                            >
                                Install App
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDismiss}
                            >
                                Not now
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InstallPrompt;
