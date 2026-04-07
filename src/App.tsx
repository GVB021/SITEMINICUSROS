import { useState } from 'react';
import TripForm from './components/TripForm';
import ConciergePanel from './components/ConciergePanel';
import type { TripConfig, ConciergeResponse, ItineraryItem } from './types';
import { fetchConciergeData, type ApiKeys } from './api';

type Screen = 'form' | 'loading' | 'panel' | 'error';

function loadKeys(): ApiKeys {
  return {
    gemini:      localStorage.getItem('gemini_key') ?? '',
    foursquare:  localStorage.getItem('foursquare_key') ?? '',
    tavily:      localStorage.getItem('tavily_key') ?? '',
  };
}

function saveKeys(keys: ApiKeys) {
  localStorage.setItem('gemini_key',     keys.gemini);
  localStorage.setItem('foursquare_key', keys.foursquare);
  localStorage.setItem('tavily_key',     keys.tavily);
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('form');
  const [tripConfig, setTripConfig] = useState<TripConfig | null>(null);
  const [conciergeData, setConciergeData] = useState<ConciergeResponse | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [apiKeys, setApiKeys] = useState<ApiKeys>(loadKeys);
  const [showKeyPrompt, setShowKeyPrompt] = useState(false);
  const [pendingConfig, setPendingConfig] = useState<TripConfig | null>(null);

  async function handleSearch(config: TripConfig, keys: ApiKeys) {
    setTripConfig(config);
    setItinerary([]);
    setScreen('loading');
    try {
      const data = await fetchConciergeData(config, keys);
      setConciergeData(data);
      setScreen('panel');
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Erro desconhecido');
      setScreen('error');
    }
  }

  function handleFormSubmit(config: TripConfig) {
    if (!apiKeys.gemini) {
      setPendingConfig(config);
      setShowKeyPrompt(true);
      return;
    }
    handleSearch(config, apiKeys);
  }

  function handleKeysConfirm(keys: ApiKeys) {
    saveKeys(keys);
    setApiKeys(keys);
    setShowKeyPrompt(false);
    if (pendingConfig) handleSearch(pendingConfig, keys);
    setPendingConfig(null);
  }

  function handleAddToItinerary(item: ItineraryItem) {
    setItinerary((prev) => {
      if (prev.find((i) => i.id === item.id)) return prev;
      return [...prev, item];
    });
  }

  function handleRemoveFromItinerary(id: string) {
    setItinerary((prev) => prev.filter((i) => i.id !== id));
  }

  async function handleReoptimize() {
    if (!tripConfig || !apiKeys.gemini) return;
    setScreen('loading');
    try {
      const data = await fetchConciergeData(tripConfig, apiKeys);
      setConciergeData(data);
      setScreen('panel');
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Erro desconhecido');
      setScreen('error');
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {showKeyPrompt && (
        <ApiKeyModal
          initialKeys={apiKeys}
          onConfirm={handleKeysConfirm}
          onClose={() => setShowKeyPrompt(false)}
        />
      )}

      {screen === 'form' && (
        <TripForm onSubmit={handleFormSubmit} />
      )}

      {screen === 'loading' && (
        <LoadingScreen destination={tripConfig?.destination ?? ''} />
      )}

      {screen === 'error' && (
        <ErrorScreen message={errorMsg} onBack={() => setScreen('form')} />
      )}

      {screen === 'panel' && conciergeData && tripConfig && (
        <ConciergePanel
          data={conciergeData}
          config={tripConfig}
          itinerary={itinerary}
          onAddItem={handleAddToItinerary}
          onRemoveItem={handleRemoveFromItinerary}
          onBack={() => setScreen('form')}
          onReoptimize={handleReoptimize}
          onChangeKey={() => setShowKeyPrompt(true)}
        />
      )}
    </div>
  );
}

/* ─── API Key Modal ─────────────────────────────────────────────────────── */
function ApiKeyModal({
  initialKeys,
  onConfirm,
  onClose,
}: {
  initialKeys: ApiKeys;
  onConfirm: (keys: ApiKeys) => void;
  onClose: () => void;
}) {
  const [gemini,     setGemini]     = useState(initialKeys.gemini);
  const [foursquare, setFoursquare] = useState(initialKeys.foursquare);
  const [tavily,     setTavily]     = useState(initialKeys.tavily);

  const canConfirm = gemini.trim().length > 0;

  function handleConfirm() {
    if (!canConfirm) return;
    onConfirm({ gemini: gemini.trim(), foursquare: foursquare.trim(), tavily: tavily.trim() });
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '20px',
    }}>
      <div className="glass-card animate-fadeInUp" style={{ maxWidth: 480, width: '100%', padding: '32px' }}>
        <div style={{ marginBottom: 8 }}><span style={{ fontSize: 32 }}>🔑</span></div>
        <h2 className="font-display" style={{ fontSize: 24, fontWeight: 400, marginBottom: 6, color: 'var(--text-primary)' }}>
          Chaves de API
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
          <strong>Gemini é obrigatório.</strong> Foursquare e Tavily são opcionais, mas enriquecem os resultados com locais reais, fotos de estabelecimentos e preços verificados da web.
        </p>

        <label style={labelStyle}>Google AI Studio (obrigatório)</label>
        <input className="input-base" type="password" placeholder="AIzaSy..."
          value={gemini} onChange={(e) => setGemini(e.target.value)}
          style={{ marginBottom: 4 }}
        />
        <p style={hintStyle}>
          <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)' }}>
            aistudio.google.com/apikey
          </a>
        </p>

        <label style={{ ...labelStyle, marginTop: 16 }}>Foursquare Places API (opcional)</label>
        <input className="input-base" type="password" placeholder="fsq3..."
          value={foursquare} onChange={(e) => setFoursquare(e.target.value)}
          style={{ marginBottom: 4 }}
        />
        <p style={hintStyle}>
          <a href="https://foursquare.com/developers/signup" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)' }}>
            foursquare.com/developers
          </a>{' '}— locais reais + fotos
        </p>

        <label style={{ ...labelStyle, marginTop: 16 }}>Tavily Search API (opcional)</label>
        <input className="input-base" type="password" placeholder="tvly-..."
          value={tavily} onChange={(e) => setTavily(e.target.value)}
          style={{ marginBottom: 4 }}
        />
        <p style={hintStyle}>
          <a href="https://tavily.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)' }}>
            tavily.com
          </a>{' '}— preços reais da web
        </p>

        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button className="btn-ghost" onClick={onClose} style={{ flex: 1 }}>Cancelar</button>
          <button className="btn-gold" onClick={handleConfirm} disabled={!canConfirm} style={{ flex: 2 }}>
            Salvar e continuar →
          </button>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 12, textAlign: 'center' }}>
          As chaves ficam salvas apenas no seu navegador (localStorage).
        </p>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600,
  color: 'var(--text-muted)', letterSpacing: '0.06em',
  textTransform: 'uppercase', marginBottom: 6,
};

const hintStyle: React.CSSProperties = {
  fontSize: 11, color: 'var(--text-muted)', marginBottom: 0, lineHeight: 1.5,
};

/* ─── Loading Screen ────────────────────────────────────────────────────── */
function LoadingScreen({ destination }: { destination: string }) {
  const messages = [
    'Consultando o concierge local...',
    'Descobrindo os melhores restaurantes...',
    'Selecionando hospedagens exclusivas...',
    'Mapeando experiências únicas...',
    'Verificando eventos no período...',
    'Montando seu roteiro personalizado...',
  ];
  const [msgIdx] = useState(() => Math.floor(Math.random() * messages.length));

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '40px 20px',
    }}>
      {/* Animated compass */}
      <div style={{ position: 'relative', marginBottom: 40 }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          border: '2px solid var(--border-light)',
          borderTop: '2px solid var(--gold)',
          animation: 'spin-slow 1.5s linear infinite',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28,
        }}>
          🧭
        </div>
      </div>

      <h2 className="font-display" style={{
        fontSize: 32, fontWeight: 300, color: 'var(--text-primary)',
        marginBottom: 12, textAlign: 'center',
      }}>
        Preparando sua viagem para<br />
        <span className="text-gold-gradient">{destination}</span>
      </h2>

      <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 32, textAlign: 'center' }}>
        {messages[msgIdx]}
      </p>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--gold)',
            opacity: 0.3,
            animation: `pulse-gold 1.2s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}

/* ─── Error Screen ──────────────────────────────────────────────────────── */
function ErrorScreen({ message, onBack }: { message: string; onBack: () => void }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '40px 20px',
    }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
      <h2 className="font-display" style={{ fontSize: 28, fontWeight: 400, marginBottom: 12, color: 'var(--text-primary)' }}>
        Algo deu errado
      </h2>
      <p style={{
        color: 'var(--text-secondary)', fontSize: 14, marginBottom: 8,
        maxWidth: 480, textAlign: 'center', lineHeight: 1.6,
      }}>
        {message}
      </p>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 28, textAlign: 'center' }}>
        Verifique sua chave do Google AI Studio e tente novamente.
      </p>
      <button className="btn-gold" onClick={onBack}>← Voltar ao formulário</button>
    </div>
  );
}
