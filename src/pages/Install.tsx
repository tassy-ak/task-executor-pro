import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Download, Smartphone, Monitor, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for the beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsInstallable(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background p-6 flex items-center justify-center">
      <div className="max-w-4xl w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
              <Shield className="h-16 w-16 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Install IDS/IPS Security Monitor
          </h1>
          <p className="text-muted-foreground text-lg">
            Get instant access to real-time network security monitoring
          </p>
        </div>

        {/* Installation Status */}
        {isInstalled && (
          <Card className="border-success/30 bg-success/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-success" />
                <div>
                  <p className="font-semibold">App is installed!</p>
                  <p className="text-sm text-muted-foreground">You can now use the app from your home screen</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Install Button */}
        {isInstallable && !isInstalled && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Download className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-semibold">Ready to install</p>
                    <p className="text-sm text-muted-foreground">Install this app for quick access</p>
                  </div>
                </div>
                <Button onClick={handleInstall} size="lg" className="w-full sm:w-auto">
                  Install App
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-primary" />
                Mobile Access
              </CardTitle>
              <CardDescription>
                Install on your phone and monitor security from anywhere
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  Works offline
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  Home screen icon
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  Full-screen experience
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-primary" />
                Desktop Access
              </CardTitle>
              <CardDescription>
                Install on desktop for quick access and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  Fast startup
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  Native-like experience
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  Real-time alerts
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Manual Installation Instructions */}
        {!isInstallable && !isInstalled && (
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle>Manual Installation</CardTitle>
              <CardDescription>
                Follow these steps to install the app on your device
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">On iPhone/iPad (Safari):</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Tap the Share button (square with arrow)</li>
                  <li>Scroll down and tap "Add to Home Screen"</li>
                  <li>Tap "Add" to confirm</li>
                </ol>
              </div>
              <div>
                <h3 className="font-semibold mb-2">On Android (Chrome):</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Tap the menu (three dots)</li>
                  <li>Tap "Install app" or "Add to Home screen"</li>
                  <li>Tap "Install" to confirm</li>
                </ol>
              </div>
              <div>
                <h3 className="font-semibold mb-2">On Desktop (Chrome/Edge):</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Click the install icon in the address bar</li>
                  <li>Or go to menu → "Install IDS/IPS Security Monitor"</li>
                  <li>Click "Install" to confirm</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button onClick={() => navigate('/')} variant="outline">
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Install;
