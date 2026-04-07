import { useState, useCallback, useEffect } from 'react';
import type { ConciergeResponse, TripConfig, ItineraryItem, PlaceDetail, ItineraryItemType } from '../types';
import { extractPlaceDetails, fetchBudgetPlan, type ApiKeys, type BudgetPlan } from '../api';
// PlaceDetailModal removed — details now expand inline in CategorySection
import ItinerarySidebar from './ItinerarySidebar';
import CategorySection from './CategorySection';
import BudgetPanel from './BudgetPanel';

interface Props {
  data: ConciergeResponse;
  config: TripConfig;
  itinerary: ItineraryItem[];
  onAddItem: (item: ItineraryItem) => void;
  onRemoveItem: (id: string) => void;
  onBack: () => void;
  onReoptimize: () => void;
  apiKeys: ApiKeys;
}

const DESTINATION_PHOTOS: Record<string, string> = {
  // Brasil — Sul
  'gramado':         'https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=1600&h=600&fit=crop',
  'canela':          'https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=1600&h=600&fit=crop',
  'florianopolis':   'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=600&fit=crop',
  'florianópolis':   'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=600&fit=crop',
  'bombinhas':       'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=600&fit=crop',
  'balneario camboriu': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=600&fit=crop',
  'balneário camboriú': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=600&fit=crop',
  'curitiba':        'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=1600&h=600&fit=crop',
  'foz do iguacu':   'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1600&h=600&fit=crop',
  'foz do iguaçu':   'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1600&h=600&fit=crop',
  // Brasil — Sudeste
  'rio de janeiro':  'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1600&h=600&fit=crop',
  'sao paulo':       'https://images.unsplash.com/photo-1578002171197-8d4d1d9a3bb2?w=1600&h=600&fit=crop',
  'são paulo':       'https://images.unsplash.com/photo-1578002171197-8d4d1d9a3bb2?w=1600&h=600&fit=crop',
  'monte verde':     'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&h=600&fit=crop',
  'campos do jordao':'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&h=600&fit=crop',
  'campos do jordão':'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&h=600&fit=crop',
  'paraty':          'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1600&h=600&fit=crop',
  'parati':          'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1600&h=600&fit=crop',
  'angra dos reis':  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=600&fit=crop',
  'petropolis':      'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&h=600&fit=crop',
  'petrópolis':      'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&h=600&fit=crop',
  'buzios':          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=600&fit=crop',
  'búzios':          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=600&fit=crop',
  // Brasil — Nordeste
  'salvador':        'https://images.unsplash.com/photo-1548366086-7f1b76106622?w=1600&h=600&fit=crop',
  'porto seguro':    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=600&fit=crop',
  'trancoso':        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=600&fit=crop',
  'morro de sao paulo': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=600&fit=crop',
  'morro de são paulo': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=600&fit=crop',
  'fortaleza':       'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=600&fit=crop',
  'jericoacoara':    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=600&fit=crop',
  'natal':           'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=600&fit=crop',
  'recife':          'https://images.unsplash.com/photo-1548366086-7f1b76106622?w=1600&h=600&fit=crop',
  'olinda':          'https://images.unsplash.com/photo-1548366086-7f1b76106622?w=1600&h=600&fit=crop',
  'maceio':          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=600&fit=crop',
  'maceió':          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=600&fit=crop',
  'lencois maranhenses': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&h=600&fit=crop',
  'lençóis maranhenses': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&h=600&fit=crop',
  // Brasil — Norte / Centro-Oeste
  'manaus':          'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=1600&h=600&fit=crop',
  'pantanal':        'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=1600&h=600&fit=crop',
  'bonito':          'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1600&h=600&fit=crop',
  'chapada diamantina': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&h=600&fit=crop',
  'chapada dos veadeiros': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&h=600&fit=crop',
  'brasilia':        'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=1600&h=600&fit=crop',
  'brasília':        'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=1600&h=600&fit=crop',
  // Internacional
  'paris':           'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600&h=600&fit=crop',
  'roma':            'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1600&h=600&fit=crop',
  'rome':            'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1600&h=600&fit=crop',
  'lisboa':          'https://images.unsplash.com/photo-1588392382834-a891154bca4d?w=1600&h=600&fit=crop',
  'lisbon':          'https://images.unsplash.com/photo-1588392382834-a891154bca4d?w=1600&h=600&fit=crop',
  'barcelona':       'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1600&h=600&fit=crop',
  'madrid':          'https://images.unsplash.com/photo-1543785734-4b6e564642f8?w=1600&h=600&fit=crop',
  'amsterdam':       'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=1600&h=600&fit=crop',
  'londres':         'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1600&h=600&fit=crop',
  'london':          'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1600&h=600&fit=crop',
  'nova york':       'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=1600&h=600&fit=crop',
  'new york':        'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=1600&h=600&fit=crop',
  'miami':           'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=600&fit=crop',
  'cancun':          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=600&fit=crop',
  'cancún':          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=600&fit=crop',
  'buenos aires':    'https://images.unsplash.com/photo-1612294037637-ec328d0e075e?w=1600&h=600&fit=crop',
  'santiago':        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&h=600&fit=crop',
  'tokyo':           'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1600&h=600&fit=crop',
  'tóquio':          'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1600&h=600&fit=crop',
  'dubai':           'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600&h=600&fit=crop',
  'bali':            'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1600&h=600&fit=crop',
  'maldivas':        'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1600&h=600&fit=crop',
  'maldives':        'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1600&h=600&fit=crop',
};

function getDestinationPhoto(destination: string): string {
  const key = destination.toLowerCase().trim();
  // Exact match
  if (DESTINATION_PHOTOS[key]) return DESTINATION_PHOTOS[key];
  // Partial match — check if any known key is contained in the destination string
  for (const [mapKey, url] of Object.entries(DESTINATION_PHOTOS)) {
    if (key.includes(mapKey) || mapKey.includes(key)) return url;
  }
  // Stable Picsum fallback — seed from destination string for consistency
  const seed = [...destination].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 1000;
  return `https://picsum.photos/seed/${seed}/1600/600`;
}

export default function ConciergePanel({
  data, config, itinerary, onAddItem, onRemoveItem, onBack, onReoptimize, apiKeys,
}: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('hospedagem');

  const [budgetPlan, setBudgetPlan] = useState<BudgetPlan | null>(null);
  const [loadingBudget, setLoadingBudget] = useState(false);

  useEffect(() => {
    if (!config.budget || !apiKeys.gemini) return;
    if (!data?.hospedagem?.length && !data?.restaurantes?.length) return;
    let cancelled = false;
    setBudgetPlan(null);
    setLoadingBudget(true);
    fetchBudgetPlan(config, data, apiKeys)
      .then((plan) => { if (!cancelled) setBudgetPlan(plan); })
      .catch(console.error)
      .finally(() => { if (!cancelled) setLoadingBudget(false); });
    return () => { cancelled = true; };
  }, [data, config, apiKeys]);

  const handleViewDetails = useCallback(async (item: {
    nome: string; type: ItineraryItemType; site_oficial?: string | null;
  }): Promise<PlaceDetail | null> => {
    const siteUrl = item.site_oficial && item.site_oficial !== 'null' && item.site_oficial.startsWith('http')
      ? item.site_oficial
      : null;
    if (!siteUrl) return null;
    return extractPlaceDetails(item.nome, item.type, siteUrl, apiKeys, config.destination);
  }, [apiKeys, config.destination]);

  const nights = Math.max(1,
    Math.ceil((new Date(config.checkOut).getTime() - new Date(config.checkIn).getTime()) / 86400000)
  );

  const profileLabels: Record<string, string> = {
    solo: 'Viajante Solo', casal: 'Casal', familia: 'Família', grupo: 'Grupo',
  };

  const typeLabels: Record<string, string> = {
    ferias: 'Férias', aventura: 'Aventura', gastronomico: 'Gastronômico',
    romantico: 'Romântico', cultural: 'Cultural', show: 'Show/Evento', negocios: 'Negócios',
  };

  const formatDate = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short',
  });

  const unsplashUrl = getDestinationPhoto(config.destination);

  const tabs = [
    { id: 'hospedagem',   label: '🏨 Hospedagem',      count: data.hospedagem?.length ?? 0 },
    { id: 'restaurantes', label: '🍽️ Restaurantes',     count: data.restaurantes?.length ?? 0 },
    { id: 'atracoes',     label: '🗺️ Atrações',          count: data.atracoes?.length ?? 0 },
    { id: 'eventos',      label: '🎵 Eventos',           count: data.eventos?.length ?? 0 },
    { id: 'transporte',   label: '🚗 Transporte',        count: data.transporte?.length ?? 0 },
    { id: 'experiencias', label: '✨ Experiências',      count: data.experiencias?.length ?? 0 },
    ...(config.budget ? [{ id: 'orcamento', label: '💰 Orçamento', count: 0 }] : []),
  ];

  const handleAdd = useCallback((item: ItineraryItem) => onAddItem(item), [onAddItem]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── Top Nav ─────────────────────────────────────────────────────── */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 24px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-surface)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="btn-ghost" onClick={onBack} style={{ padding: '6px 12px', fontSize: 13 }}>
            ← Voltar
          </button>
          <span className="font-display" style={{ fontSize: 16, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
            Concierge Virtual
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              background: itinerary.length > 0 ? 'var(--gold-dim)' : 'var(--bg-card)',
              border: `1px solid ${itinerary.length > 0 ? 'var(--gold-border)' : 'var(--border)'}`,
              color: itinerary.length > 0 ? 'var(--gold-light)' : 'var(--text-secondary)',
              borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
              fontSize: 13, fontFamily: 'var(--font-body)',
              transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            📋 Meu Roteiro
            {itinerary.length > 0 && (
              <span style={{
                background: 'var(--gold)', color: '#0a0b0e',
                borderRadius: '50%', width: 18, height: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 600,
              }}>
                {itinerary.length}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* ── Hero Banner ─────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', height: 260, overflow: 'hidden' }}>
        <img
          src={unsplashUrl}
          alt={config.destination}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(10,11,14,0.3) 0%, rgba(10,11,14,0.85) 100%)',
        }} />
        <div style={{
          position: 'absolute', bottom: 24, left: 32, right: 32,
        }}>
          <p style={{ color: 'var(--gold)', fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
            {profileLabels[config.profile]} · {config.types.map(t => typeLabels[t]).join(' · ')}
          </p>
          <h1 className="font-display" style={{
            fontSize: 'clamp(28px, 5vw, 48px)',
            fontWeight: 400, color: 'var(--text-primary)',
            lineHeight: 1.15, marginBottom: 10,
          }}>
            {data.destino}
          </h1>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <span style={metaPill}>📅 {formatDate(config.checkIn)} → {formatDate(config.checkOut)} · {nights} noite{nights !== 1 ? 's' : ''}</span>
            <span style={metaPill}>👤 {config.people} pessoa{config.people !== 1 ? 's' : ''}</span>
            {data.clima_estimado && <span style={metaPill}>🌤️ {data.clima_estimado}</span>}
            {config.budget && <span style={{ ...metaPill, borderColor: 'var(--gold-border)', color: 'var(--gold-light)' }}>💰 R$ {config.budget.toLocaleString('pt-BR')}</span>}
          </div>
        </div>
      </div>

      {/* ── Destination blurb + concierge tip ───────────────────────────── */}
      {(data.descricao_destino || data.dica_concierge) && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: data.descricao_destino && data.dica_concierge ? '1fr 1fr' : '1fr',
          gap: 16, padding: '24px 24px 0',
        }}>
          {data.descricao_destino && (
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 10, padding: '16px 20px',
            }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>
                {data.descricao_destino}
              </p>
            </div>
          )}
          {data.dica_concierge && (
            <div style={{
              background: 'var(--gold-dim)',
              border: '1px solid var(--gold-border)',
              borderRadius: 10, padding: '16px 20px',
            }}>
              <p style={{ color: 'var(--gold)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6, fontWeight: 500 }}>
                💡 Dica do Concierge
              </p>
              <p style={{ color: 'var(--gold-light)', fontSize: 14, lineHeight: 1.7 }}>
                {data.dica_concierge}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <div style={{
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        marginTop: 24,
        display: 'flex', gap: 0, overflowX: 'auto',
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--gold)' : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
              padding: '12px 16px',
              cursor: 'pointer',
              fontSize: 13,
              fontFamily: 'var(--font-body)',
              fontWeight: activeTab === tab.id ? 500 : 400,
              whiteSpace: 'nowrap',
              transition: 'color 0.15s, border-color 0.15s',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {tab.label}
            {tab.count > 0 && (
              <span style={{
                background: activeTab === tab.id ? 'var(--gold-dim)' : 'var(--bg-hover)',
                color: activeTab === tab.id ? 'var(--gold)' : 'var(--text-muted)',
                border: `1px solid ${activeTab === tab.id ? 'var(--gold-border)' : 'transparent'}`,
                borderRadius: 100,
                fontSize: 11, padding: '1px 7px', fontWeight: 500,
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab Content ─────────────────────────────────────────────────── */}
      <div style={{ padding: '24px', flex: 1 }}>

        {activeTab === 'hospedagem' && (
          <CategorySection
            items={data.hospedagem?.map((h) => ({
              id: `hosp-${h.nome}`,
              type: 'hospedagem' as const,
              nome: h.nome,
              preco: h.diaria,
              descricao: h.descricao,
              meta: `${h.tipo} · ${h.perfil_ideal}`,
              badge: `R$ ${h.diaria.toLocaleString('pt-BR')}/noite`,
              destaque: h.destaque,
              foto_url: h.foto_url,
              website: h.website,
              site_oficial: h.site_oficial,
              telefone: h.telefone,
              rating: h.rating,
              fonte_preco: h.fonte_preco,
            })) ?? []}
            onAdd={handleAdd}
            onViewDetails={handleViewDetails}
            addedIds={itinerary.map(i => i.id)}
          />
        )}

        {activeTab === 'restaurantes' && (
          <CategorySection
            items={data.restaurantes?.map((r) => ({
              id: `rest-${r.nome}`,
              type: 'restaurante' as const,
              nome: r.nome,
              preco: r.preco_por_pessoa,
              descricao: r.descricao,
              meta: `${r.cozinha} · ${r.horario}`,
              badge: `R$ ${r.preco_por_pessoa.toLocaleString('pt-BR')}/pessoa`,
              destaque: r.prato_estrela ? `⭐ ${r.prato_estrela}` : undefined,
              foto_url: r.foto_url,
              website: r.website,
              site_oficial: r.site_oficial,
              telefone: r.telefone,
              rating: r.rating,
              fonte_preco: r.fonte_preco,
            })) ?? []}
            onAdd={handleAdd}
            onViewDetails={handleViewDetails}
            addedIds={itinerary.map(i => i.id)}
          />
        )}

        {activeTab === 'atracoes' && (
          <CategorySection
            items={data.atracoes?.map((a) => ({
              id: `atr-${a.nome}`,
              type: 'atracao' as const,
              nome: a.nome,
              preco: a.preco,
              descricao: a.descricao,
              meta: `${a.duracao} · ${a.perfil_ideal}`,
              badge: a.preco === 0 ? 'Gratuito' : `R$ ${a.preco.toLocaleString('pt-BR')}`,
              foto_url: a.foto_url,
              website: a.website,
              site_oficial: a.site_oficial,
              telefone: a.telefone,
              rating: a.rating,
              fonte_preco: a.fonte_preco,
            })) ?? []}
            onAdd={handleAdd}
            onViewDetails={handleViewDetails}
            addedIds={itinerary.map(i => i.id)}
          />
        )}

        {activeTab === 'eventos' && (
          <CategorySection
            items={data.eventos?.map((e) => ({
              id: `evt-${e.nome}`,
              type: 'evento' as const,
              nome: e.nome,
              preco: e.preco,
              descricao: e.descricao,
              meta: `${e.data} · ${e.local}`,
              badge: e.preco === 0 ? 'Gratuito' : `R$ ${e.preco.toLocaleString('pt-BR')}`,
              foto_url: e.foto_url,
              site_oficial: e.site_oficial,
              telefone: e.telefone,
              fonte_preco: e.fonte_preco,
            })) ?? []}
            onAdd={handleAdd}
            onViewDetails={handleViewDetails}
            addedIds={itinerary.map(i => i.id)}
            emptyMessage="Nenhum evento especial encontrado para o período informado."
          />
        )}

        {activeTab === 'transporte' && (
          <CategorySection
            items={data.transporte?.map((t) => ({
              id: `transp-${t.tipo}`,
              type: 'transporte' as const,
              nome: t.tipo,
              preco: t.valor,
              descricao: t.descricao,
              meta: '',
              badge: `R$ ${t.valor.toLocaleString('pt-BR')}`,
            })) ?? []}
            onAdd={handleAdd}
            onViewDetails={handleViewDetails}
            addedIds={itinerary.map(i => i.id)}
          />
        )}

        {activeTab === 'experiencias' && (
          <CategorySection
            items={data.experiencias?.map((x) => ({
              id: `exp-${x.nome}`,
              type: 'experiencia' as const,
              nome: x.nome,
              preco: x.preco_por_pessoa,
              descricao: x.descricao,
              meta: x.duracao,
              badge: `R$ ${x.preco_por_pessoa.toLocaleString('pt-BR')}/pessoa`,
              foto_url: x.foto_url,
              website: x.website,
              site_oficial: x.site_oficial,
              telefone: x.telefone,
              rating: x.rating,
              fonte_preco: x.fonte_preco,
            })) ?? []}
            onAdd={handleAdd}
            onViewDetails={handleViewDetails}
            addedIds={itinerary.map(i => i.id)}
          />
        )}

        {activeTab === 'orcamento' && config.budget && (
          <BudgetPanel
            data={data}
            config={config}
            budgetPlan={budgetPlan}
            loadingBudget={loadingBudget}
            onAddItem={onAddItem}
            addedIds={itinerary.map(i => i.id)}
            onReoptimize={onReoptimize}
          />
        )}
      </div>

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <ItinerarySidebar
        open={sidebarOpen}
        items={itinerary}
        config={config}
        onClose={() => setSidebarOpen(false)}
        onRemove={onRemoveItem}
      />

    </div>
  );
}

const metaPill: React.CSSProperties = {
  background: 'rgba(0,0,0,0.4)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 100,
  padding: '4px 12px',
  fontSize: 12,
  color: 'rgba(255,255,255,0.8)',
};
