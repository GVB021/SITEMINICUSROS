import { useState } from 'react';
import TripForm from './components/TripForm';
import ConciergePanel from './components/ConciergePanel';
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

  async function handleReoptimize() {
    if (!tripConfig || !API_KEYS.gemini) return;
    setScreen('loading');
    try {
      const data = await fetchConciergeData(tripConfig, API_KEYS);
      setConciergeData(data);
      setScreen('panel');
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Erro desconhecido');
      setScreen('error');
    }
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
      )}
    </div>
  );
}

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
