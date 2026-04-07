import { useState, useEffect } from 'react';
import TripForm from './components/TripForm';
import ConciergePanel from './components/ConciergePanel';
import ErrorBoundary from './components/ErrorBoundary';
import type { TripConfig, ConciergeResponse, ItineraryItem } from './types';
import { fetchConciergeData, type ApiKeys } from './api';

type Screen = 'form' | 'loading' | 'panel' | 'error';

// API keys from environment variables
const API_KEYS: ApiKeys = {
  gemini: import.meta.env.VITE_GEMINI_KEY || '',
  tavily: import.meta.env.VITE_TAVILY_KEY || '',
};

export default function App() {
  const [screen, setScreen] = useState<Screen>('form');
  const [tripConfig, setTripConfig] = useState<TripConfig | null>(null);
  const [conciergeData, setConciergeData] = useState<ConciergeResponse | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleFormSubmit(config: TripConfig) {
    if (!API_KEYS.gemini) {
      setErrorMsg('Chave do Gemini não configurada no arquivo .env');
      setScreen('error');
      return;
    }
    setTripConfig(config);
    setItinerary([]);
    setScreen('loading');
    try {
      const data = await fetchConciergeData(config, API_KEYS);
      setConciergeData(data);
      setScreen('panel');
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Erro desconhecido');
      setScreen('error');
    }
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

  function handleReoptimize() {
    if (tripConfig) void handleFormSubmit(tripConfig);
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
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
        <ErrorBoundary>
          <ConciergePanel
            data={conciergeData}
            config={tripConfig}
            itinerary={itinerary}
            onAddItem={handleAddToItinerary}
            onRemoveItem={handleRemoveFromItinerary}
            onBack={() => setScreen('form')}
            onReoptimize={handleReoptimize}
            apiKeys={API_KEYS}
          />
        </ErrorBoundary>
      )}
    </div>
  );
}

/* ─── Loading Screen ────────────────────────────────────────────────────── */
function LoadingScreen({ destination }: { destination: string }) {
  const messages = [
    'Consultando o concierge local…',
    'Descobrindo os melhores restaurantes…',
    'Selecionando hospedagens exclusivas…',
    'Mapeando experiências únicas…',
    'Verificando eventos no período…',
    'Montando seu roteiro personalizado…',
  ];
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setMsgIdx(i => (i + 1) % messages.length), 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '40px 20px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Atmospheric layers */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
          width: 700, height: 700,
          background: 'radial-gradient(ellipse, rgba(201,169,110,0.07) 0%, transparent 65%)',
          animation: 'float 6s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '15%',
          width: 400, height: 400,
          background: 'radial-gradient(ellipse, rgba(78,205,196,0.04) 0%, transparent 60%)',
          animation: 'float 9s ease-in-out 1s infinite',
        }} />
      </div>

      {/* Logo mark */}
      <div className="animate-fadeInUp" style={{ marginBottom: 48, position: 'relative' }}>
        {/* Outer rotating ring */}
        <div style={{
          width: 100, height: 100, borderRadius: '50%',
          border: '1px solid var(--gold-border)',
          borderTop: '2px solid var(--gold)',
          animation: 'spin-slow 2s linear infinite',
          position: 'absolute', inset: 0,
        }} />
        {/* Inner counter-rotating ring */}
        <div style={{
          width: 100, height: 100, borderRadius: '50%',
          border: '1px solid rgba(78,205,196,0.2)',
          borderBottom: '1px solid var(--teal)',
          animation: 'spin-slow 3s linear infinite reverse',
          position: 'absolute', inset: 0,
        }} />
        {/* Center icon */}
        <div style={{
          width: 100, height: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, position: 'relative',
        }}>
          ✦
        </div>
      </div>

      {/* Destination text */}
      <div className="animate-fadeInUp stagger-1" style={{ textAlign: 'center', marginBottom: 20 }}>
        <p style={{
          fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
          color: 'var(--text-muted)', fontWeight: 600, marginBottom: 12,
        }}>
          Preparando sua viagem para
        </p>
        <h2 className="font-display text-gold-gradient" style={{
          fontSize: 'clamp(36px, 6vw, 56px)',
          fontWeight: 300, lineHeight: 1.1,
          letterSpacing: '-0.01em',
        }}>
          {destination}
        </h2>
      </div>

      {/* Rotating message */}
      <p className="animate-fadeInUp stagger-2" style={{
        color: 'var(--text-secondary)', fontSize: 14,
        textAlign: 'center', marginBottom: 40,
        minHeight: 22, transition: 'opacity 0.4s',
        fontStyle: 'italic',
      }}>
        {messages[msgIdx]}
      </p>

      {/* Progress bar */}
      <div className="animate-fadeInUp stagger-3" style={{
        width: 180, height: 2,
        background: 'var(--border)',
        borderRadius: 2, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(90deg, var(--gold) 0%, var(--teal) 100%)',
          borderRadius: 2,
          animation: 'shimmer 1.8s ease-in-out infinite',
          backgroundSize: '200% 100%',
        }} />
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
