import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Settings as SettingsIcon, Bell, Moon, Volume2, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface NotificationPreferences {
  enabled: boolean;
  severity_levels: string[];
  quiet_hours_enabled: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  sound_enabled: boolean;
}

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enabled: true,
    severity_levels: ['critical', 'high'],
    quiet_hours_enabled: false,
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00',
    sound_enabled: true,
  });

  const severityOptions = [
    { value: 'critical', label: 'Critical', description: 'Immediate threats requiring action' },
    { value: 'high', label: 'High', description: 'Significant security events' },
    { value: 'medium', label: 'Medium', description: 'Moderate threats' },
    { value: 'low', label: 'Low', description: 'Minor security events' },
  ];

  useEffect(() => {
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPreferences({
          enabled: data.enabled,
          severity_levels: data.severity_levels as string[],
          quiet_hours_enabled: data.quiet_hours_enabled,
          quiet_hours_start: data.quiet_hours_start,
          quiet_hours_end: data.quiet_hours_end,
          sound_enabled: data.sound_enabled,
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notification preferences',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!user) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          enabled: preferences.enabled,
          severity_levels: preferences.severity_levels,
          quiet_hours_enabled: preferences.quiet_hours_enabled,
          quiet_hours_start: preferences.quiet_hours_start,
          quiet_hours_end: preferences.quiet_hours_end,
          sound_enabled: preferences.sound_enabled,
        }, {
          onConflict: 'user_id',
        });

      if (error) throw error;

      toast({
        title: 'Settings Saved',
        description: 'Your notification preferences have been updated',
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to save notification preferences',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleSeverityLevel = (level: string) => {
    setPreferences(prev => ({
      ...prev,
      severity_levels: prev.severity_levels.includes(level)
        ? prev.severity_levels.filter(l => l !== level)
        : [...prev.severity_levels, level],
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-muted-foreground">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <SettingsIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Customize your notification preferences and alerts
            </p>
          </div>
        </div>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notifications
            </CardTitle>
            <CardDescription>
              Control when and how you receive security alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Master Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications-enabled" className="text-base font-medium">
                  Enable Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive push notifications for security threats
                </p>
              </div>
              <Switch
                id="notifications-enabled"
                checked={preferences.enabled}
                onCheckedChange={(checked) =>
                  setPreferences(prev => ({ ...prev, enabled: checked }))
                }
              />
            </div>

            {/* Severity Levels */}
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Severity Levels</Label>
                <p className="text-sm text-muted-foreground">
                  Select which threat levels trigger notifications
                </p>
              </div>
              <div className="grid gap-4">
                {severityOptions.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      id={`severity-${option.value}`}
                      checked={preferences.severity_levels.includes(option.value)}
                      onCheckedChange={() => toggleSeverityLevel(option.value)}
                      disabled={!preferences.enabled}
                    />
                    <div className="flex-1 space-y-1">
                      <Label
                        htmlFor={`severity-${option.value}`}
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {option.label}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quiet Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5 text-primary" />
              Quiet Hours
            </CardTitle>
            <CardDescription>
              Set a time range when notifications are muted
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="quiet-hours-enabled" className="text-base font-medium">
                  Enable Quiet Hours
                </Label>
                <p className="text-sm text-muted-foreground">
                  Mute notifications during specific hours
                </p>
              </div>
              <Switch
                id="quiet-hours-enabled"
                checked={preferences.quiet_hours_enabled}
                onCheckedChange={(checked) =>
                  setPreferences(prev => ({ ...prev, quiet_hours_enabled: checked }))
                }
                disabled={!preferences.enabled}
              />
            </div>

            {preferences.quiet_hours_enabled && (
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="quiet-start">Start Time</Label>
                  <input
                    id="quiet-start"
                    type="time"
                    value={preferences.quiet_hours_start || '22:00'}
                    onChange={(e) =>
                      setPreferences(prev => ({ ...prev, quiet_hours_start: e.target.value }))
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quiet-end">End Time</Label>
                  <input
                    id="quiet-end"
                    type="time"
                    value={preferences.quiet_hours_end || '08:00'}
                    onChange={(e) =>
                      setPreferences(prev => ({ ...prev, quiet_hours_end: e.target.value }))
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sound Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-primary" />
              Sound
            </CardTitle>
            <CardDescription>
              Control notification sound alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sound-enabled" className="text-base font-medium">
                  Play Sound
                </Label>
                <p className="text-sm text-muted-foreground">
                  Play an alert sound with notifications
                </p>
              </div>
              <Switch
                id="sound-enabled"
                checked={preferences.sound_enabled}
                onCheckedChange={(checked) =>
                  setPreferences(prev => ({ ...prev, sound_enabled: checked }))
                }
                disabled={!preferences.enabled}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={savePreferences} disabled={saving} size="lg">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;