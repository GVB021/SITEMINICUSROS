import { useState } from 'react';
import type { TripConfig, TripProfile, TripType } from '../types';

const TRIP_TYPES: { id: TripType; label: string; icon: string }[] = [
  { id: 'ferias',       label: 'Férias & Relaxamento', icon: '🌴' },
  { id: 'aventura',     label: 'Aventura & Natureza',  icon: '🧗' },
  { id: 'gastronomico', label: 'Gastronômico',          icon: '🍷' },
  { id: 'romantico',    label: 'Romântico',              icon: '💑' },
  { id: 'cultural',     label: 'Cultural',               icon: '🏛️' },
  { id: 'show',         label: 'Show / Evento',          icon: '🎵' },
  { id: 'negocios',     label: 'Negócios',               icon: '💼' },
];

const PROFILES: { id: TripProfile; label: string; icon: string }[] = [
  { id: 'solo',    label: 'Solo',    icon: '🧍' },
  { id: 'casal',   label: 'Casal',   icon: '👫' },
  { id: 'familia', label: 'Família', icon: '👨‍👩‍👧' },
  { id: 'grupo',   label: 'Grupo',   icon: '👥' },
];

interface Props { onSubmit: (config: TripConfig) => void; }

export default function TripForm({ onSubmit }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState(tomorrow);
  const [checkOut, setCheckOut] = useState(
    new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
  );
  const [people, setPeople] = useState(2);
  const [profile, setProfile] = useState<TripProfile>('casal');
  const [types, setTypes] = useState<TripType[]>(['ferias']);
  const [budget, setBudget] = useState('');

  function toggleType(t: TripType) {
    setTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!destination.trim() || types.length === 0) return;
    onSubmit({
      destination: destination.trim(),
      checkIn,
      checkOut,
      people,
      profile,
      types,
      budget: budget ? Number(budget.replace(/\D/g, '')) : undefined,
    });
  }

  const nights = Math.max(
    0,
    Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        padding: '24px 40px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <span style={{ fontSize: 24 }}>🧳</span>
        <span className="font-display" style={{ fontSize: 20, fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
          Concierge Virtual
        </span>
      </header>

      {/* Hero */}
      <div style={{
        textAlign: 'center',
        padding: '64px 20px 48px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Ambient glow */}
        <div style={{
          position: 'absolute',
          top: -100, left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 400,
          background: 'radial-gradient(ellipse, rgba(201,169,110,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <p className="animate-fadeInUp" style={{
          fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'var(--gold)', marginBottom: 16, fontWeight: 500,
        }}>
          Seu assistente de viagem inteligente
        </p>

        <h1 className="font-display animate-fadeInUp stagger-1" style={{
          fontSize: 'clamp(40px, 7vw, 72px)',
          fontWeight: 300,
          lineHeight: 1.15,
          color: 'var(--text-primary)',
          marginBottom: 20,
          letterSpacing: '-0.02em',
        }}>
          Para onde você quer<br />
          <em style={{ fontStyle: 'italic', color: 'var(--gold-light)' }}>se perder?</em>
        </h1>

        <p className="animate-fadeInUp stagger-2" style={{
          color: 'var(--text-secondary)',
          fontSize: 16,
          maxWidth: 480,
          margin: '0 auto',
          lineHeight: 1.7,
        }}>
          Diga o destino e suas preferências. O concierge cuida do resto —
          hotéis, restaurantes, passeios e muito mais.
        </p>
      </div>

      {/* Form */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '0 20px 60px' }}>
        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 680 }}>
          <div className="glass-card animate-fadeInUp stagger-3" style={{ padding: '32px' }}>

            {/* Destination */}
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>🗺️ Destino</label>
              <input
                className="input-base"
                type="text"
                placeholder="Ex: Monte Verde, MG · Gramado, RS · Florianópolis, SC"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
                style={{ fontSize: 15 }}
              />
            </div>

            {/* Dates + People */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: 12, marginBottom: 24 }}>
              <div>
                <label style={labelStyle}>📅 Check-in</label>
                <input
                  className="input-base"
                  type="date"
                  value={checkIn}
                  min={today}
                  onChange={(e) => setCheckIn(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>📅 Check-out</label>
                <input
                  className="input-base"
                  type="date"
                  value={checkOut}
                  min={checkIn}
                  onChange={(e) => setCheckOut(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>👤 Pessoas</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 4 }}>
                  <button type="button" onClick={() => setPeople(Math.max(1, people - 1))}
                    style={counterBtn}>−</button>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500, minWidth: 24, textAlign: 'center' }}>
                    {people}
                  </span>
                  <button type="button" onClick={() => setPeople(Math.min(20, people + 1))}
                    style={counterBtn}>+</button>
                </div>
              </div>
            </div>

            {nights > 0 && (
              <p style={{ color: 'var(--gold)', fontSize: 12, marginTop: -16, marginBottom: 20 }}>
                {nights} noite{nights !== 1 ? 's' : ''} · {people} pessoa{people !== 1 ? 's' : ''}
              </p>
            )}

            {/* Profile */}
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>✈️ Perfil da viagem</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {PROFILES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setProfile(p.id)}
                    style={{
                      ...chipStyle,
                      ...(profile === p.id ? chipActiveStyle : {}),
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{p.icon}</span>
                    <span style={{ fontSize: 12, marginTop: 4 }}>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Trip type */}
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>🎯 Tipo de viagem <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(escolha um ou mais)</span></label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
                {TRIP_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleType(t.id)}
                    style={{
                      ...tripChipStyle,
                      ...(types.includes(t.id) ? tripChipActiveStyle : {}),
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{t.icon}</span>
                    <span style={{ fontSize: 12.5 }}>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Budget (optional) */}
            <div style={{ marginBottom: 28 }}>
              <label style={labelStyle}>
                💰 Orçamento total <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(opcional — ativa o Modo Orçamento)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--gold)', fontSize: 14, fontWeight: 500,
                }}>R$</span>
                <input
                  className="input-base"
                  type="text"
                  placeholder="Ex: 3.000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  style={{ paddingLeft: 36 }}
                />
              </div>
              {budget && (
                <p style={{ color: 'var(--teal)', fontSize: 12, marginTop: 6 }}>
                  ✓ Modo Orçamento ativado — receberá roteiro dia a dia dentro do orçamento
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              className="btn-gold"
              type="submit"
              disabled={!destination.trim() || types.length === 0}
              style={{ width: '100%', padding: '14px', fontSize: 15, letterSpacing: '0.04em' }}
            >
              Descobrir minha viagem →
            </button>

            {types.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center', marginTop: 8 }}>
                Selecione pelo menos um tipo de viagem
              </p>
            )}
          </div>

          {/* Footer note */}
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, marginTop: 16 }}>
            Powered by Claude (Anthropic) · Informações reais e verificadas
          </p>
        </form>
      </div>
    </div>
  );
}

/* ─── Styles ────────────────────────────────────────────────────────────── */
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 500,
  color: 'var(--text-secondary)',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  marginBottom: 8,
};

const counterBtn: React.CSSProperties = {
  width: 32, height: 32,
  borderRadius: 6,
  background: 'var(--bg-surface)',
  border: '1px solid var(--border)',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  fontSize: 16,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'background 0.15s, border-color 0.15s',
};

const chipStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '12px 8px',
  background: 'var(--bg-surface)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  transition: 'background 0.15s, border-color 0.15s, color 0.15s',
  gap: 2,
};

const chipActiveStyle: React.CSSProperties = {
  background: 'var(--gold-dim)',
  borderColor: 'var(--gold-border)',
  color: 'var(--gold-light)',
};

const tripChipStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '10px 14px',
  background: 'var(--bg-surface)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  fontSize: 13,
  transition: 'background 0.15s, border-color 0.15s, color 0.15s',
  textAlign: 'left' as const,
};

const tripChipActiveStyle: React.CSSProperties = {
  background: 'var(--gold-dim)',
  borderColor: 'var(--gold-border)',
  color: 'var(--gold-light)',
};
