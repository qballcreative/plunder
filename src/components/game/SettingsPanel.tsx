import { Settings, Volume2, VolumeX, Music, Clock } from 'lucide-react';
import { useSettingsStore } from '@/store/settingsStore';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export const SettingsPanel = () => {
  const {
    soundEnabled,
    musicEnabled,
    soundVolume,
    musicVolume,
    actionNotificationDuration,
    setSoundEnabled,
    setMusicEnabled,
    setSoundVolume,
    setMusicVolume,
    setActionNotificationDuration,
  } = useSettingsStore();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Settings className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-card border-primary/20">
        <SheetHeader>
          <SheetTitle className="font-pirate text-primary">Settings</SheetTitle>
          <SheetDescription>Customize your game experience</SheetDescription>
        </SheetHeader>
        
        <div className="space-y-6 mt-6">
          {/* Sound Effects */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-primary" />
                ) : (
                  <VolumeX className="w-5 h-5 text-muted-foreground" />
                )}
                <Label htmlFor="sound-enabled">Sound Effects</Label>
              </div>
              <Switch
                id="sound-enabled"
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
            </div>
            
            {soundEnabled && (
              <div className="pl-7 space-y-2">
                <Label className="text-xs text-muted-foreground">Volume</Label>
                <Slider
                  value={[soundVolume * 100]}
                  onValueChange={([value]) => setSoundVolume(value / 100)}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Background Music */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music className={`w-5 h-5 ${musicEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
                <Label htmlFor="music-enabled">Background Music</Label>
              </div>
              <Switch
                id="music-enabled"
                checked={musicEnabled}
                onCheckedChange={setMusicEnabled}
              />
            </div>
            
            {musicEnabled && (
              <div className="pl-7 space-y-2">
                <Label className="text-xs text-muted-foreground">Volume</Label>
                <Slider
                  value={[musicVolume * 100]}
                  onValueChange={([value]) => setMusicVolume(value / 100)}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Action Notification Duration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <Label>Action Notification Duration</Label>
            </div>
            <div className="pl-7 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">
                  {actionNotificationDuration} second{actionNotificationDuration !== 1 ? 's' : ''}
                </Label>
              </div>
              <Slider
                value={[actionNotificationDuration]}
                onValueChange={([value]) => setActionNotificationDuration(value)}
                min={1}
                max={10}
                step={0.5}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
