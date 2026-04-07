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

const PROFILES: { id: TripProfile; label: string; icon: string; desc: string }[] = [
  { id: 'solo',    label: 'Solo',    icon: '🧍', desc: 'Aventura própria' },
  { id: 'casal',   label: 'Casal',   icon: '👫', desc: 'A dois'           },
  { id: 'familia', label: 'Família', icon: '👨‍👩‍👧', desc: 'Com crianças'   },
  { id: 'grupo',   label: 'Grupo',   icon: '👥', desc: 'Com amigos'       },
];

interface Props { onSubmit: (config: TripConfig) => void; }

export default function TripForm({ onSubmit }: Props) {
  const today    = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [destination, setDestination] = useState('');
  const [checkIn,  setCheckIn]  = useState(tomorrow);
  const [checkOut, setCheckOut] = useState(new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]);
  const [people,   setPeople]   = useState(2);
  const [profile,  setProfile]  = useState<TripProfile>('casal');
  const [types,    setTypes]    = useState<TripType[]>(['ferias']);
  const [budget,   setBudget]   = useState('');

  function toggleType(t: TripType) {
    setTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!destination.trim() || types.length === 0) return;
    onSubmit({
      destination: destination.trim(), checkIn, checkOut, people, profile, types,
      budget: budget ? Number(budget.replace(/\D/g, '')) : undefined,
    });
  }

  const nights = Math.max(0, Math.ceil(
    (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000
  ));

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

      {/* ── Atmospheric background layers ─────────────────────────── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '-20%', left: '30%',
          width: 800, height: 800,
          background: 'radial-gradient(ellipse, rgba(201,169,110,0.06) 0%, transparent 65%)',
          animation: 'float 8s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', right: '20%',
          width: 600, height: 600,
          background: 'radial-gradient(ellipse, rgba(78,205,196,0.04) 0%, transparent 60%)',
          animation: 'float 10s ease-in-out 2s infinite',
        }} />
        <div style={{
          position: 'absolute', top: '40%', left: '-5%',
          width: 400, height: 400,
          background: 'radial-gradient(ellipse, rgba(201,169,110,0.03) 0%, transparent 60%)',
        }} />
      </div>

      {/* ── Header ────────────────────────────────────────────────── */}
      <header style={{
        position: 'relative', zIndex: 10,
        padding: '16px var(--layout-px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32,
            background: 'var(--gradient-gold)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, boxShadow: '0 2px 12px rgba(201,169,110,0.3)',
          }}>✦</div>
          <span className="font-display" style={{ fontSize: 22, fontWeight: 400, color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
            Concierge
          </span>
        </div>
        <span style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 500 }}>
          Viagens Personalizadas
        </span>
      </header>

      {/* ── Hero section ──────────────────────────────────────────── */}
      <div style={{
        position: 'relative', zIndex: 10,
        textAlign: 'center',
        padding: 'clamp(40px, 8vw, 72px) var(--layout-px) clamp(32px, 6vw, 56px)',
      }}>
        <div className="animate-fadeInUp" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '5px 16px',
          background: 'var(--gold-dim)',
          border: '1px solid var(--gold-border)',
          borderRadius: 100,
          marginBottom: 28,
        }}>
          <span style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600 }}>
            ✦ Seu concierge de viagem inteligente
          </span>
        </div>

        <h1 className="font-display animate-fadeInUp stagger-1" style={{
          fontSize: 'clamp(44px, 8vw, 84px)',
          fontWeight: 300, lineHeight: 1.1,
          color: 'var(--text-primary)',
          marginBottom: 24, letterSpacing: '-0.02em',
        }}>
          Para onde você quer<br />
          <em style={{ fontStyle: 'italic' }} className="text-gold-gradient">se perder?</em>
        </h1>

        <p className="animate-fadeInUp stagger-2" style={{
          color: 'var(--text-secondary)', fontSize: 16,
          maxWidth: 520, margin: '0 auto',
          lineHeight: 1.8,
        }}>
          Informe o destino e preferências. O concierge cuida do resto —
          hotéis exclusivos, restaurantes, passeios e muito mais.
        </p>
      </div>

      {/* ── Main Form ─────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '0 var(--layout-px) 60px', position: 'relative', zIndex: 10 }}>
        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 720 }}>

          {/* ── Destination hero input ─────────────────────────── */}
          <div className="animate-fadeInUp stagger-3" style={{
            position: 'relative', marginBottom: 16,
          }}>
            <div style={{
              position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)',
              fontSize: 20, pointerEvents: 'none',
            }}>🗺️</div>
            <input
              type="text"
              placeholder="Destino — Monte Verde, Gramado, Florianópolis…"
              value={destination}
              onChange={e => setDestination(e.target.value)}
              required
              style={{
                width: '100%',
                background: 'rgba(22,24,32,0.9)',
                border: destination ? '1px solid var(--gold-border)' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: 14,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(18px, 2.5vw, 24px)',
                fontWeight: 300,
                letterSpacing: '0.01em',
                padding: '22px 24px 22px 56px',
                outline: 'none',
                transition: 'border-color 0.25s, box-shadow 0.25s',
                boxShadow: destination
                  ? '0 0 0 3px rgba(201,169,110,0.1), 0 8px 32px rgba(0,0,0,0.3)'
                  : '0 8px 32px rgba(0,0,0,0.25)',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--gold-border)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,169,110,0.1), 0 8px 32px rgba(0,0,0,0.3)'; }}
              onBlur={e => { if (!destination) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.25)'; } }}
            />
          </div>

          {/* ── Booking bar: dates + people ────────────────────── */}
          <div className="card-elevated animate-fadeInUp stagger-4" style={{ marginBottom: 16, padding: '16px 20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: 14, alignItems: 'end' }}>
              <div>
                <label style={labelStyle}>Check-in</label>
                <input className="input-base" type="date" value={checkIn} min={today}
                  onChange={e => setCheckIn(e.target.value)} required
                  style={{ background: 'var(--bg-hover)' }}
                />
              </div>
              <div>
                <label style={labelStyle}>Check-out</label>
                <input className="input-base" type="date" value={checkOut} min={checkIn}
                  onChange={e => setCheckOut(e.target.value)} required
                  style={{ background: 'var(--bg-hover)' }}
                />
              </div>
              <div style={{ textAlign: 'center', minWidth: 100 }}>
                <label style={labelStyle}>Pessoas</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                  <button type="button" onClick={() => setPeople(Math.max(1, people - 1))} style={counterBtn}>−</button>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--gold-light)', fontWeight: 400, minWidth: 28, textAlign: 'center' }}>
                    {people}
                  </span>
                  <button type="button" onClick={() => setPeople(Math.min(20, people + 1))} style={counterBtn}>+</button>
                </div>
              </div>
            </div>
            {nights > 0 && (
              <p style={{ color: 'var(--gold)', fontSize: 12, marginTop: 14, letterSpacing: '0.06em', fontWeight: 500 }}>
                ✦ {nights} noite{nights !== 1 ? 's' : ''} · {people} pessoa{people !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* ── Profile + Trip type + Budget ──────────────────── */}
          <div className="card-elevated animate-fadeInUp stagger-5" style={{ padding: '24px', marginBottom: 16 }}>

            {/* Profile */}
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Perfil da viagem</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 110px), 1fr))', gap: 8 }}>
                {PROFILES.map(p => (
                  <button key={p.id} type="button" onClick={() => setProfile(p.id)}
                    style={{ ...profileChip, ...(profile === p.id ? profileChipActive : {}) }}
                  >
                    <span style={{ fontSize: 22 }}>{p.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, marginTop: 5 }}>{p.label}</span>
                    <span style={{ fontSize: 10.5, color: profile === p.id ? 'rgba(228,201,138,0.7)' : 'var(--text-muted)', marginTop: 2 }}>{p.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Trip type */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ ...labelStyle, marginBottom: 12 }}>
                Tipo de viagem
                <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8, letterSpacing: 0, textTransform: 'none', fontSize: 11 }}>
                  (um ou mais)
                </span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
                {TRIP_TYPES.map(t => (
                  <button key={t.id} type="button" onClick={() => toggleType(t.id)}
                    style={{ ...typeChip, ...(types.includes(t.id) ? typeChipActive : {}) }}
                  >
                    <span style={{ fontSize: 17 }}>{t.icon}</span>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div>
              <label style={labelStyle}>
                Orçamento total
                <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8, letterSpacing: 0, textTransform: 'none', fontSize: 11 }}>
                  opcional — ativa roteiro dentro do orçamento
                </span>
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                  fontFamily: 'var(--font-display)', color: 'var(--gold)', fontSize: 16, fontWeight: 500,
                }}>R$</span>
                <input
                  className="input-base"
                  type="text"
                  placeholder="Ex: 3.000"
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                  style={{ paddingLeft: 44, background: 'var(--bg-hover)', fontSize: 15 }}
                />
              </div>
              {budget && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  marginTop: 8, color: 'var(--teal)', fontSize: 12,
                }}>
                  <span style={{ fontSize: 14 }}>✓</span>
                  Modo Orçamento ativado — roteiro dia a dia dentro do limite
                </div>
              )}
            </div>
          </div>

          {/* ── CTA ───────────────────────────────────────────────── */}
          <div className="animate-fadeInUp stagger-6">
            <button
              className="btn-gold"
              type="submit"
              disabled={!destination.trim() || types.length === 0}
              style={{
                width: '100%', padding: '17px',
                fontSize: 15.5, letterSpacing: '0.06em',
                borderRadius: 12,
                boxShadow: '0 8px 32px rgba(201,169,110,0.2)',
              }}
            >
              Descobrir minha viagem →
            </button>
            {types.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center', marginTop: 8 }}>
                Selecione pelo menos um tipo de viagem
              </p>
            )}
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 11.5, marginTop: 16, letterSpacing: '0.04em' }}>
              Powered by Gemini · Dados reais e verificados
            </p>
          </div>

        </form>
      </div>
    </div>
  );
}

/* ─── Styles ────────────────────────────────────────────────────────────── */
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 10.5, fontWeight: 600,
  color: 'var(--text-muted)', letterSpacing: '0.14em',
  textTransform: 'uppercase', marginBottom: 10,
};

const counterBtn: React.CSSProperties = {
  width: 34, height: 34, borderRadius: 8,
  background: 'var(--bg-hover)',
  border: '1px solid var(--border)',
  color: 'var(--text-secondary)',
  cursor: 'pointer', fontSize: 18,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'background 0.15s, border-color 0.15s, color 0.15s',
};

const profileChip: React.CSSProperties = {
  display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center',
  padding: '14px 8px 12px',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  transition: 'all 0.2s',
  gap: 0,
};

const profileChipActive: React.CSSProperties = {
  background: 'var(--gold-dim)',
  borderColor: 'var(--gold-border)',
  color: 'var(--gold-light)',
  boxShadow: '0 0 20px rgba(201,169,110,0.1)',
};

const typeChip: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8,
  padding: '11px 14px',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  color: 'var(--text-secondary)',
  cursor: 'pointer', fontSize: 12.5,
  fontWeight: 500,
  transition: 'all 0.2s',
  textAlign: 'left' as const,
};

const typeChipActive: React.CSSProperties = {
  background: 'var(--gold-dim)',
  borderColor: 'var(--gold-border)',
  color: 'var(--gold-light)',
  boxShadow: '0 0 16px rgba(201,169,110,0.12)',
};
