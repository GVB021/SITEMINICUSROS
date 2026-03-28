import { useState, useEffect } from "react";
import { Mic, Volume2, Sliders, Headphones, Speaker, Smartphone } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@studio/components/ui/dialog";
import { Label } from "@studio/components/ui/label";
import { Slider } from "@studio/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@studio/components/ui/select";
import { useToast } from "@studio/hooks/use-toast";
import type { DeviceSettings, MicrophoneState } from "@studio/pages/room";

interface DeviceSettingsPanelProps {
  open: boolean;
  onClose: () => void;
  settings: DeviceSettings;
  onSettingsChange: (settings: DeviceSettings) => void;
  micState: MicrophoneState | null;
}

export function DeviceSettingsPanel({
  open,
  onClose,
  settings,
  onSettingsChange,
  micState,
}: DeviceSettingsPanelProps) {
  const { toast } = useToast();
  const [inputDevices, setInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [outputDevices, setOutputDevices] = useState<MediaDeviceInfo[]>([]);
  const [micPermission, setMicPermission] = useState<"granted" | "denied" | "prompt" | "unknown">("unknown");

  const syncDevices = async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      setInputDevices(allDevices.filter((d) => d.kind === "audioinput"));
      setOutputDevices(allDevices.filter((d) => d.kind === "audiooutput"));
    } catch (err) {
      console.error("Error enumerating devices:", err);
    }
  };

  const requestMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setMicPermission("granted");
      return true;
    } catch {
      setMicPermission("denied");
      return false;
    }
  };

  useEffect(() => {
    if (!open) return;
    const hydrate = async () => {
      await syncDevices();
      try {
        if (!navigator.permissions?.query) return;
        const status = await navigator.permissions.query({ name: "microphone" as PermissionName });
        setMicPermission(status.state as "granted" | "denied" | "prompt");
      } catch {
        setMicPermission("unknown");
      }
    };
    void hydrate();
    navigator.mediaDevices.addEventListener("devicechange", syncDevices);
    return () => navigator.mediaDevices.removeEventListener("devicechange", syncDevices);
  }, [open]);


  const ensurePermission = async () => {
    if (micPermission !== "granted") {
      const granted = await requestMicPermission();
      if (!granted) {
        toast({
          title: "Permissão de microfone negada",
          description: "Sem permissão para acessar o microfone.",
          variant: "destructive",
        });
        return false;
      }
    }
    return true;
  };

  const handleSafeSettingsChange = async (next: DeviceSettings) => {
    const permitted = await ensurePermission();
    if (!permitted) return;
    if (next.inputGain > 1.5) {
      toast({
        title: "Atenção: Ganho Alto",
        description: "Ganho acima de 150% pode causar distorção.",
        variant: "default",
      });
    }
    onSettingsChange(next);
  };



  const outputLabel = (device: MediaDeviceInfo) => {
    const lower = (device.label || "").toLowerCase();
    if (lower.includes("head")) return { icon: Headphones, text: device.label || "Fones de ouvido" };
    if (lower.includes("speaker") || lower.includes("alto")) return { icon: Speaker, text: device.label || "Alto-falantes" };
    if (lower.includes("bluetooth")) return { icon: Smartphone, text: device.label || "Saída Bluetooth" };
    return { icon: Volume2, text: device.label || `Saída ${device.deviceId.slice(0, 5)}` };
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="w-[min(96vw,920px)] max-h-[90vh] overflow-y-auto bg-card border-border text-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-primary" />
            Configurações de Áudio
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-2">

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="mic-select" className="text-foreground">Microfone</Label>
              <Select
                value={settings.inputDeviceId || "default"}
                onValueChange={(val) => void handleSafeSettingsChange({ ...settings, inputDeviceId: val })}
              >
                <SelectTrigger id="mic-select" className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Selecione o microfone" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-popover-foreground">
                  <SelectItem value="default">Padrão do Sistema</SelectItem>
                  {inputDevices.map((device) => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label || `Microfone ${device.deviceId.slice(0, 5)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="output-select" className="text-foreground">Alto-falante</Label>
              <Select
                value={settings.outputDeviceId || "default"}
                onValueChange={(val) => onSettingsChange({ ...settings, outputDeviceId: val === "default" ? "" : val })}
              >
                <SelectTrigger id="output-select" className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Selecione a saída" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-popover-foreground">
                  <SelectItem value="default">Saída Padrão do Sistema</SelectItem>
                  {outputDevices.map((device) => {
                    const meta = outputLabel(device);
                    return (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        <span className="flex items-center gap-2">
                          <meta.icon className="w-3.5 h-3.5" />
                          {meta.text}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

            </div>
          </div>

          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <Label className="text-foreground flex items-center gap-2">
                <Mic className="w-4 h-4" />
                Ganho do Microfone
              </Label>
              <span className="text-xs font-mono text-primary">
                {Math.round(settings.inputGain * 100)}%
              </span>
            </div>
            <Slider
              value={[settings.inputGain * 100]}
              min={0}
              max={200}
              step={1}
              onValueChange={([val]) => void handleSafeSettingsChange({ ...settings, inputGain: val / 100 })}
              className="py-2"
            />
          </div>

          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <Label className="text-foreground flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                Volume do Vídeo
              </Label>
              <span className="text-xs font-mono text-primary">
                {Math.round(settings.videoVolume * 100)}%
              </span>
            </div>
            <Slider
              value={[settings.videoVolume * 100]}
              min={0}
              max={100}
              step={1}
              onValueChange={([val]) => onSettingsChange({ ...settings, videoVolume: val / 100 })}
              className="py-2"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
