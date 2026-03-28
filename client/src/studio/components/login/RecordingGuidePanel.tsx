import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LogIn,
  UserRound,
  Settings2,
  FileText,
  Mic,
  PlayCircle,
  Save,
  Trash2,
  AlertTriangle,
  ChevronDown,
  Info,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@studio/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@studio/components/ui/tooltip";

type Lang = "en" | "pt";

const STORAGE_KEY_OPEN = "thehub_login_guide_open";
const STORAGE_KEY_SECTIONS = "thehub_login_guide_sections";

const COPY = {
  en: {
    title: "Quick Guide - Dubbing Recording",
    collapse: "Hide Guide",
    expand: "Show Guide",
    rules: "Important Rules",
    r1: "You must select Voice Actor + Character before record/save",
    r2: "Very short takes are blocked (prevents invalid WAV)",
    terms: {
      input: "Audio capture device used for recording.",
      gain: "Input level amplification. Avoid clipping.",
      monitor: "Real-time listening volume in your headphones.",
      drawer: "Sliding panel for script access on mobile.",
      rec: "Starts countdown and recording process.",
    },
    steps: [
      { id: "s1", title: "Enter Session", icon: LogIn, body: "Sessions → select → 'Enter Room'" },
      {
        id: "s2",
        title: "Configure Recording Profile",
        icon: UserRound,
        bullets: [
          "Select Voice Actor (when available)",
          "Select Character",
          "Confirm (profile persisted in session)",
        ],
      },
      {
        id: "s3",
        title: "Adjust Devices",
        icon: Settings2,
        checks: ["Correct input", "Gain/monitor", "Capture mode"],
      },
      {
        id: "s4",
        title: "Navigate Script",
        icon: FileText,
        rows: ["Desktop: side panel", "Mobile: Drawer (floating 'Script' button)"],
      },
      {
        id: "s5",
        title: "Recording Process",
        icon: Mic,
        body: "Press REC → Wait countdown (3..2..1..) → Perform → Press STOP",
      },
      {
        id: "s6",
        title: "Post Recording",
        icon: PlayCircle,
        actions: ["Listen (check)", "Save take (send to server)", "Discard (redo)"],
      },
    ],
  },
  pt: {
    title: "Guia Rápido - Gravação de Dublagem",
    collapse: "Recolher Guia",
    expand: "Expandir Guia",
    rules: "Regras Importantes",
    r1: "Necessário selecionar Dublador + Personagem para gravar/salvar",
    r2: "Takes muito curtos são bloqueados (evita WAV inválido)",
    terms: {
      input: "Dispositivo de captação de áudio usado na gravação.",
      gain: "Amplificação do sinal de entrada. Evite clipping.",
      monitor: "Volume de escuta em tempo real no fone.",
      drawer: "Painel deslizante para acessar roteiro no mobile.",
      rec: "Inicia contagem regressiva e gravação.",
    },
    steps: [
      { id: "s1", title: "Entrar na Sessão", icon: LogIn, body: "Sessões → selecione → 'Entrar na Sala'" },
      {
        id: "s2",
        title: "Configurar Perfil de Gravação",
        icon: UserRound,
        bullets: [
          "Selecione Dublador (quando disponível)",
          "Selecione Personagem",
          "Confirme (perfil persistido na sessão)",
        ],
      },
      {
        id: "s3",
        title: "Ajustar Dispositivos",
        icon: Settings2,
        checks: ["Input correto", "Ganho/monitor", "Modo de captura"],
      },
      {
        id: "s4",
        title: "Navegar no Roteiro",
        icon: FileText,
        rows: ["Desktop: painel lateral", "Mobile: Drawer (botão flutuante \"Roteiro\")"],
      },
      {
        id: "s5",
        title: "Processo de Gravação",
        icon: Mic,
        body: "Pressione REC → Aguarde contagem (3..2..1..) → Interprete → Pressione STOP",
      },
      {
        id: "s6",
        title: "Pós-Gravação",
        icon: PlayCircle,
        actions: ["Ouvir (checagem)", "Salvar take (enviar ao servidor)", "Descartar (refazer)"],
      },
    ],
  },
} satisfies Record<Lang, any>;

export default function RecordingGuidePanel({ lang }: { lang: Lang }) {
  const t = COPY[lang];
  const [open, setOpen] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_OPEN);
      return raw ? raw === "true" : true;
    } catch {
      return true;
    }
  });

  const defaultSections = useMemo(() => t.steps.slice(0, 2).map((s: any) => s.id), [t]);
  const [sections, setSections] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SECTIONS);
      const parsed = raw ? JSON.parse(raw) : null;
      return Array.isArray(parsed) && parsed.length ? parsed : ["s1", "s2"];
    } catch {
      return ["s1", "s2"];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_OPEN, String(open));
    } catch {}
  }, [open]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SECTIONS, JSON.stringify(sections));
    } catch {}
  }, [sections]);

  useEffect(() => {
    if (!sections.length) setSections(defaultSections);
  }, [sections.length, defaultSections]);

  return (
    <div className="rounded-[1.5rem] border border-amber-500/30 bg-amber-50/80 dark:bg-amber-950/20 backdrop-blur-xl overflow-hidden shadow-lg">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-amber-500/10 transition-colors"
      >
        <span className="font-bold text-sm md:text-base tracking-tight inline-flex items-center gap-2 text-amber-900 dark:text-amber-200">
          <Info className="w-4 h-4" />
          {t.title}
        </span>
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-amber-900/80 dark:text-amber-200/80">
          {open ? t.collapse : t.expand}
          <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="px-5 pb-5"
          >
            <TooltipProvider delayDuration={150}>
              <Accordion type="multiple" value={sections} onValueChange={setSections} className="rounded-xl border border-amber-500/20 bg-background/70">
                {t.steps.map((step: any, idx: number) => {
                  const Icon = step.icon;
                  return (
                    <AccordionItem key={step.id} value={step.id} className="border-amber-500/10">
                      <AccordionTrigger className="px-4 py-3 hover:no-underline">
                        <div className="flex items-center gap-3 text-left">
                          <span className="h-8 w-8 rounded-lg bg-primary/15 text-primary inline-flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4" />
                          </span>
                          <span className="text-sm font-semibold">{idx + 1}. {step.title}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4">
                        {!!step.body && <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>}
                        {!!step.bullets && (
                          <ul className="space-y-1.5 text-sm text-muted-foreground list-disc pl-5">
                            {step.bullets.map((b: string) => <li key={b}>{b}</li>)}
                          </ul>
                        )}
                        {!!step.checks && (
                          <div className="space-y-1.5 text-sm text-muted-foreground">
                            {step.checks.map((c: string) => (
                              <div key={c} className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                <span>{c}</span>
                              </div>
                            ))}
                            <div className="flex gap-2 mt-2 flex-wrap text-xs">
                              <Tooltip>
                                <TooltipTrigger asChild><span className="px-2 py-1 rounded bg-muted cursor-help">Input</span></TooltipTrigger>
                                <TooltipContent>{t.terms.input}</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild><span className="px-2 py-1 rounded bg-muted cursor-help">Ganho</span></TooltipTrigger>
                                <TooltipContent>{t.terms.gain}</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild><span className="px-2 py-1 rounded bg-muted cursor-help">Monitor</span></TooltipTrigger>
                                <TooltipContent>{t.terms.monitor}</TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        )}
                        {!!step.rows && (
                          <div className="space-y-1.5 text-sm text-muted-foreground">
                            {step.rows.map((r: string) => <p key={r}>{r}</p>)}
                            <Tooltip>
                              <TooltipTrigger asChild><span className="inline-block mt-1 text-xs px-2 py-1 rounded bg-muted cursor-help">Drawer</span></TooltipTrigger>
                              <TooltipContent>{t.terms.drawer}</TooltipContent>
                            </Tooltip>
                          </div>
                        )}
                        {!!step.actions && (
                          <div className="space-y-2 text-sm">
                            {step.actions.map((a: string, i: number) => (
                              <div key={a} className="flex items-center gap-2 text-muted-foreground">
                                {i === 0 && <PlayCircle className="w-4 h-4 text-primary" />}
                                {i === 1 && <Save className="w-4 h-4 text-emerald-500" />}
                                {i === 2 && <Trash2 className="w-4 h-4 text-red-500" />}
                                <span>{a}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {step.id === "s5" && (
                          <Tooltip>
                            <TooltipTrigger asChild><span className="inline-block mt-2 text-xs px-2 py-1 rounded bg-muted cursor-help">REC</span></TooltipTrigger>
                            <TooltipContent>{t.terms.rec}</TooltipContent>
                          </Tooltip>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </TooltipProvider>

            <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-100/80 dark:bg-amber-900/30 p-4">
              <p className="text-sm font-bold text-amber-900 dark:text-amber-200 inline-flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {t.rules}
              </p>
              <ul className="mt-2 space-y-1.5 text-sm text-amber-900/90 dark:text-amber-200/90">
                <li>• {t.r1}</li>
                <li>• {t.r2}</li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
