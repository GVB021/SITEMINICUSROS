import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Loader2, Upload, Link2, Download, RefreshCw, ArrowLeft } from "lucide-react";
import { decodeAudioFile, estimateSyncOffset } from "@/lib/hubalign/audio-sync-engine";

type SyncItem = {
  id: string;
  file: File;
  hintMs: number;
  offsetMs: number;
  confidence: number;
  durationMs: number;
  status: "pending" | "done" | "error";
  message?: string;
};

type Mode = "operacional" | "hubalign_iframe" | "alinhador_legacy";

function toCsv(rows: SyncItem[]) {
  const header = "arquivo,offset_ms,confianca,duracao_ms,status,mensagem";
  const lines = rows.map((r) => {
    const safeName = `"${r.file.name.replace(/"/g, '""')}"`;
    const safeMessage = `"${(r.message || "").replace(/"/g, '""')}"`;
    return [safeName, r.offsetMs.toFixed(2), r.confidence.toFixed(4), r.durationMs.toFixed(2), r.status, safeMessage].join(",");
  });
  return [header, ...lines].join("\n");
}

export default function HubAlign() {
  const [, navigate] = useLocation();
  const externalUrl = useMemo(() => import.meta.env.VITE_HUBALIGN_URL || "http://localhost:5004/", []);
  const [mode, setMode] = useState<Mode>("operacional");
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [referenceStatus, setReferenceStatus] = useState<string>("");
  const [takes, setTakes] = useState<SyncItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [iframeOnline, setIframeOnline] = useState<"unknown" | "ok" | "offline">("unknown");

  const handleTakeFiles = (files: FileList | null) => {
    if (!files) return;
    const accepted = Array.from(files).filter((f) => /audio\/(wav|x-wav|mpeg|mp3|mp4|aac|m4a)|\.wav$|\.mp3$|\.m4a$/i.test(`${f.type} ${f.name}`));
    const items = accepted.map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
      file,
      hintMs: 0,
      offsetMs: 0,
      confidence: 0,
      durationMs: 0,
      status: "pending" as const,
    }));
    setTakes((prev) => [...prev, ...items]);
  };

  const runAutoSync = async () => {
    setError("");
    if (!referenceFile) {
      setError("Envie o arquivo de referência (vídeo com áudio ou trilha de referência).");
      return;
    }
    if (!takes.length) {
      setError("Envie pelo menos um take para sincronizar.");
      return;
    }

    setIsSyncing(true);
    setProgress(0);
    try {
      const refDecoded = await decodeAudioFile(referenceFile);
      if (refDecoded.rms < 0.001) {
        throw new Error("Áudio de referência com nível muito baixo.");
      }
      setReferenceStatus(`Referência decodificada: ${referenceFile.name} (${Math.round(refDecoded.samples.length / refDecoded.sampleRate)}s)`);

      const next = [...takes];
      for (let i = 0; i < next.length; i++) {
        const item = next[i];
        try {
          const decoded = await decodeAudioFile(item.file);
          const estimation = estimateSyncOffset({
            reference: refDecoded.samples,
            take: decoded.samples,
            sampleRate: decoded.sampleRate,
            hintMs: item.hintMs,
            searchWindowMs: 10000,
          });
          next[i] = {
            ...item,
            ...estimation,
            status: "done",
            message: estimation.confidence < 0.55 ? "Confiança baixa. Ajuste hint e sincronize novamente." : "Sincronização aplicada automaticamente.",
          };
        } catch (e: any) {
          next[i] = {
            ...item,
            status: "error",
            message: e?.message || "Falha ao processar take.",
          };
        }
        setTakes([...next]);
        setProgress(Math.round(((i + 1) / next.length) * 100));
      }
    } catch (e: any) {
      setError(e?.message || "Falha no processamento.");
    } finally {
      setIsSyncing(false);
    }
  };

  const exportJson = () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      referenceFile: referenceFile?.name || null,
      results: takes.map((t) => ({
        fileName: t.file.name,
        offsetMs: t.offsetMs,
        confidence: t.confidence,
        durationMs: t.durationMs,
        hintMs: t.hintMs,
        status: t.status,
        message: t.message || "",
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hubalign-sync-results.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCsv = () => {
    const blob = new Blob([toCsv(takes)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hubalign-sync-results.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const checkExternal = async () => {
    setIframeOnline("unknown");
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 2500);
      await fetch(externalUrl, { mode: "no-cors", signal: ctrl.signal });
      clearTimeout(timer);
      setIframeOnline("ok");
    } catch {
      setIframeOnline("offline");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-full border border-border/60 bg-background/95 backdrop-blur px-4 h-10 text-sm font-medium hover:bg-muted/30 transition-colors inline-flex items-center gap-2"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
            <h1 className="text-lg md:text-2xl font-semibold">HUB ALIGN — Sincronização Labial Operacional</h1>
          </div>
          <div className="text-xs md:text-sm text-muted-foreground">Modo one-click para alinhamento automático</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <button onClick={() => setMode("operacional")} className={`h-11 rounded-xl border ${mode === "operacional" ? "bg-primary/15 border-primary text-primary" : "bg-card border-border text-muted-foreground"}`}>Sincronização Operacional</button>
          <button onClick={() => setMode("hubalign_iframe")} className={`h-11 rounded-xl border ${mode === "hubalign_iframe" ? "bg-primary/15 border-primary text-primary" : "bg-card border-border text-muted-foreground"}`}>HUB ALIGN via iframe</button>
          <button onClick={() => setMode("alinhador_legacy")} className={`h-11 rounded-xl border ${mode === "alinhador_legacy" ? "bg-primary/15 border-primary text-primary" : "bg-card border-border text-muted-foreground"}`}>Alinhador legado estático</button>
        </div>

        {mode === "operacional" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
                <div className="font-medium">1) Arquivo de referência</div>
                <label className="h-28 rounded-xl border border-dashed border-border flex items-center justify-center text-sm text-muted-foreground cursor-pointer hover:bg-muted/30">
                  <input
                    type="file"
                    accept=".wav,.mp3,.m4a,audio/*,video/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setReferenceFile(f);
                      setReferenceStatus(f ? `Arquivo selecionado: ${f.name}` : "");
                    }}
                  />
                  <span className="inline-flex items-center gap-2"><Upload className="w-4 h-4" /> Arraste ou selecione referência (WAV/MP3/M4A/Vídeo)</span>
                </label>
                {referenceStatus && <div className="text-xs text-muted-foreground">{referenceStatus}</div>}
              </div>

              <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
                <div className="font-medium">2) Takes para sincronizar</div>
                <label className="h-28 rounded-xl border border-dashed border-border flex items-center justify-center text-sm text-muted-foreground cursor-pointer hover:bg-muted/30">
                  <input
                    type="file"
                    accept=".wav,.mp3,.m4a,audio/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleTakeFiles(e.target.files)}
                  />
                  <span className="inline-flex items-center gap-2"><Upload className="w-4 h-4" /> Upload múltiplo (WAV/MP3/M4A)</span>
                </label>
                <div className="text-xs text-muted-foreground">{takes.length} take(s) carregado(s)</div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={runAutoSync}
                  disabled={isSyncing}
                  className="h-11 px-4 rounded-xl bg-primary text-primary-foreground font-medium inline-flex items-center gap-2 disabled:opacity-60"
                >
                  {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Sincronizar Automaticamente
                </button>
                <button onClick={exportJson} className="h-11 px-4 rounded-xl border border-border bg-background inline-flex items-center gap-2">
                  <Download className="w-4 h-4" /> Exportar JSON
                </button>
                <button onClick={exportCsv} className="h-11 px-4 rounded-xl border border-border bg-background inline-flex items-center gap-2">
                  <Download className="w-4 h-4" /> Exportar CSV
                </button>
              </div>

              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
              <div className="text-xs text-muted-foreground">Progresso: {progress}%</div>
              {error && <div className="text-sm text-red-500">{error}</div>}
            </div>

            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border font-medium">3) Timeline visual editável</div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr>
                      <th className="text-left px-3 py-2">Arquivo</th>
                      <th className="text-left px-3 py-2">Hint (ms)</th>
                      <th className="text-left px-3 py-2">Offset (ms)</th>
                      <th className="text-left px-3 py-2">Confiança</th>
                      <th className="text-left px-3 py-2">Status</th>
                      <th className="text-left px-3 py-2">Mensagem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {takes.map((item, idx) => (
                      <tr key={item.id} className="border-t border-border">
                        <td className="px-3 py-2">{item.file.name}</td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={item.hintMs}
                            onChange={(e) => {
                              const value = Number(e.target.value || 0);
                              setTakes((prev) => prev.map((x, i) => (i === idx ? { ...x, hintMs: value } : x)));
                            }}
                            className="w-28 h-9 rounded border border-border bg-background px-2"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={Number(item.offsetMs.toFixed(2))}
                            onChange={(e) => {
                              const value = Number(e.target.value || 0);
                              setTakes((prev) => prev.map((x, i) => (i === idx ? { ...x, offsetMs: value } : x)));
                            }}
                            className="w-28 h-9 rounded border border-border bg-background px-2"
                          />
                        </td>
                        <td className="px-3 py-2">{(item.confidence * 100).toFixed(1)}%</td>
                        <td className="px-3 py-2">{item.status}</td>
                        <td className="px-3 py-2 text-muted-foreground">{item.message || "-"}</td>
                      </tr>
                    ))}
                    {takes.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">Nenhum take carregado.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {mode === "hubalign_iframe" && (
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div className="font-medium inline-flex items-center gap-2"><Link2 className="w-4 h-4" /> HUB ALIGN externo</div>
              <div className="flex items-center gap-2">
                <button onClick={checkExternal} className="h-9 px-3 rounded-lg border border-border bg-background text-sm">Verificar disponibilidade</button>
                <span className={`text-xs ${iframeOnline === "ok" ? "text-emerald-500" : iframeOnline === "offline" ? "text-red-500" : "text-muted-foreground"}`}>
                  {iframeOnline === "ok" ? "online" : iframeOnline === "offline" ? "offline" : "não verificado"}
                </span>
              </div>
            </div>
            <div className="h-[75vh]">
              <iframe
                title="HUB ALIGN"
                src={externalUrl}
                className="w-full h-full border-0"
                allow="microphone; autoplay; clipboard-read; clipboard-write"
              />
            </div>
          </div>
        )}

        {mode === "alinhador_legacy" && (
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border font-medium">Alinhador legado (estático)</div>
            <div className="h-[75vh]">
              <iframe
                title="Alinhador Legado"
                src="/alinhador/"
                className="w-full h-full border-0"
                allow="microphone; autoplay; clipboard-read; clipboard-write"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
