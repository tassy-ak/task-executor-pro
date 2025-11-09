import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Download, Smartphone, Monitor, CheckCircle, Tablet, Globe, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/hooks/useNotifications';

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deviceType, setDeviceType] = useState<string>('');
  const [browserType, setBrowserType] = useState<string>('');
  const navigate = useNavigate();
  const { isSupported, permission, requestPermission } = useNotifications();

  const detectDevice = () => {
    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua)) return 'iOS';
    if (/android/i.test(ua)) return 'Android';
    if (/Windows Phone/i.test(ua)) return 'Windows Phone';
    if (/Tablet|iPad/i.test(ua)) return 'Tablet';
    if (/Mobile/i.test(ua)) return 'Mobile';
    return 'Desktop';
  };

  const detectBrowser = () => {
    const ua = navigator.userAgent;
    if (/Chrome/.test(ua) && !/Edge/.test(ua)) return 'Chrome';
    if (/Safari/.test(ua) && !/Chrome/.test(ua)) return 'Safari';
    if (/Firefox/.test(ua)) return 'Firefox';
    if (/Edge/.test(ua)) return 'Edge';
    if (/Opera/.test(ua)) return 'Opera';
    return 'Browser';
  };

  useEffect(() => {
    setDeviceType(detectDevice());
    setBrowserType(detectBrowser());

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
          {deviceType && (
            <Badge variant="outline" className="text-sm gap-2">
              {deviceType === 'iOS' && <Smartphone className="h-4 w-4" />}
              {deviceType === 'Android' && <Smartphone className="h-4 w-4" />}
              {deviceType === 'Desktop' && <Monitor className="h-4 w-4" />}
              {(deviceType === 'Tablet' || deviceType === 'Mobile') && <Tablet className="h-4 w-4" />}
              Detected: {deviceType} • {browserType}
            </Badge>
          )}
        </div>

        {/* Installation Status */}
        {isInstalled && (
          <Card className="border-success/30 bg-success/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-success" />
                <div>
                  <p className="font-semibold">✓ App is installed and working!</p>
                  <p className="text-sm text-muted-foreground">
                    Running in standalone mode on {deviceType}. You can access it from your home screen/desktop anytime.
                  </p>
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
              <CardTitle>Installation Instructions for {deviceType}</CardTitle>
              <CardDescription>
                Follow these steps to install the app on your {deviceType} device
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(deviceType === 'iOS' || browserType === 'Safari') && (
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    On iPhone/iPad (Safari):
                  </h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-2">
                    <li>Tap the Share button (square with arrow) at the bottom</li>
                    <li>Scroll down and tap "Add to Home Screen"</li>
                    <li>Tap "Add" to confirm</li>
                    <li>The app icon will appear on your home screen</li>
                  </ol>
                </div>
              )}
              {(deviceType === 'Android' || (browserType === 'Chrome' && deviceType !== 'iOS')) && (
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    On Android (Chrome):
                  </h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-2">
                    <li>Tap the menu (three dots) in the top right</li>
                    <li>Tap "Install app" or "Add to Home screen"</li>
                    <li>Tap "Install" to confirm</li>
                    <li>The app will be added to your app drawer and home screen</li>
                  </ol>
                </div>
              )}
              {deviceType === 'Desktop' && (
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    On Desktop ({browserType}):
                  </h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-2">
                    <li>Look for the install icon (⊕) in the address bar</li>
                    <li>Or open the browser menu → "Install IDS/IPS Security Monitor"</li>
                    <li>Click "Install" to confirm</li>
                    <li>The app will open in its own window and be added to your applications</li>
                  </ol>
                </div>
              )}
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground flex items-start gap-2">
                  <Globe className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Works on all devices:</strong> This Progressive Web App (PWA) works on Windows, Mac, Linux, iOS, Android, and any device with a modern web browser. Once installed, it works offline and receives automatic updates.
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notification Settings */}
        {isSupported && (
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Security Alerts
              </CardTitle>
              <CardDescription>
                Enable push notifications to receive real-time security alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {permission === 'granted' ? (
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="text-muted-foreground">
                    Push notifications are enabled. You'll receive alerts about security threats.
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Get instant alerts when new threats are detected on your network.
                  </p>
                  <Button onClick={requestPermission} className="w-full sm:w-auto">
                    <Bell className="h-4 w-4 mr-2" />
                    Enable Notifications
                  </Button>
                </div>
              )}
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
