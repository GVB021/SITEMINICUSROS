import { useState, useCallback, useEffect } from 'react';
import type { ConciergeResponse, TripConfig, ItineraryItem, PlaceDetail, ItineraryItemType } from '../types';
import { extractPlaceDetails, fetchBudgetPlan, searchPlacePhoto, type ApiKeys, type BudgetPlan } from '../api';
import { getDestinationPhoto } from '../constants/destinations';
import { computeNights } from '../utils/dates';
import ErrorBoundary from './ErrorBoundary';
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


export default function ConciergePanel({
  data, config, itinerary, onAddItem, onRemoveItem, onBack, onReoptimize, apiKeys,
}: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('hospedagem');

  const [budgetPlan, setBudgetPlan] = useState<BudgetPlan | null>(null);
  const [loadingBudget, setLoadingBudget] = useState(false);
  const [budgetError, setBudgetError] = useState<string | null>(null);

  const [photoMap, setPhotoMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!data || !apiKeys.tavily) return;
    type PhotoItem = { id: string; nome: string; foto_url?: string | null };
    const allItems: PhotoItem[] = [
      ...(data.hospedagem  ?? []).map(h => ({ id: `hosp-${h.nome}`,              nome: h.nome, foto_url: h.foto_url })),
      ...(data.restaurantes ?? []).map(r => ({ id: `rest-${r.nome}`,             nome: r.nome, foto_url: r.foto_url })),
      ...(data.atracoes     ?? []).map(a => ({ id: `atr-${a.nome}`,              nome: a.nome, foto_url: a.foto_url })),
      ...(data.eventos      ?? []).map(e => ({ id: `evt-${e.nome}`,              nome: e.nome, foto_url: e.foto_url })),
      ...(data.experiencias ?? []).map(x => ({ id: `exp-${x.nome}`,             nome: x.nome, foto_url: x.foto_url })),
      ...(data.transporte   ?? []).map(t => ({ id: `transp-${t.nome ?? t.tipo}`, nome: t.nome ?? t.tipo, foto_url: null })),
    ];
    const needsPhoto = allItems.filter(i => !i.foto_url);
    if (needsPhoto.length === 0) return;
    let cancelled = false;
    Promise.allSettled(
      needsPhoto.map(item =>
        searchPlacePhoto(item.nome, config.destination, apiKeys.tavily)
          .then(url => ({ id: item.id, url }))
      )
    ).then(results => {
      if (cancelled) return;
      const map: Record<string, string> = {};
      for (const r of results) {
        if (r.status === 'fulfilled' && r.value.url) {
          map[r.value.id] = r.value.url;
        }
      }
      if (Object.keys(map).length > 0) setPhotoMap(prev => ({ ...prev, ...map }));
    });
    return () => { cancelled = true; };
  }, [data, config.destination, apiKeys.tavily]);

  useEffect(() => {
    if (!config.budget || !apiKeys.gemini) return;
    if (!data?.hospedagem?.length && !data?.restaurantes?.length) return;
    let cancelled = false;
    setBudgetPlan(null);
    setBudgetError(null);
    setLoadingBudget(true);
    fetchBudgetPlan(config, data, apiKeys)
      .then((plan) => { if (!cancelled) setBudgetPlan(plan); })
      .catch((err: unknown) => {
        if (!cancelled) {
          setBudgetError(err instanceof Error ? err.message : 'Erro ao gerar o plano de orçamento.');
        }
      })
      .finally(() => { if (!cancelled) setLoadingBudget(false); });
    return () => { cancelled = true; };
  }, [data, config, apiKeys]);

  const handleViewDetails = useCallback(async (item: {
    nome: string; type: ItineraryItemType; site_oficial?: string | null;
  }): Promise<PlaceDetail | null> => {
    const siteUrl = item.site_oficial && item.site_oficial !== 'null' && item.site_oficial.startsWith('http')
      ? item.site_oficial
      : null;
    return extractPlaceDetails(item.nome, item.type, siteUrl, apiKeys, config.destination);
  }, [apiKeys, config.destination]);

  const nights = computeNights(config.checkIn, config.checkOut);

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
        padding: '12px var(--layout-px)',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-surface)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="btn-ghost" onClick={onBack} aria-label="Voltar ao formulário" style={{ padding: '6px 12px', fontSize: 13 }}>
            ← Voltar
          </button>
          <span className="font-display hide-mobile" style={{ fontSize: 16, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
            Concierge Virtual
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir roteiro"
            style={{
              background: itinerary.length > 0 ? 'var(--gold-dim)' : 'var(--bg-card)',
              border: `1px solid ${itinerary.length > 0 ? 'var(--gold-border)' : 'var(--border)'}`,
              color: itinerary.length > 0 ? 'var(--gold-light)' : 'var(--text-secondary)',
              borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
              fontSize: 13, fontFamily: 'var(--font-body)',
              transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            📋 <span className="hide-mobile">Meu Roteiro</span>
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
      <div style={{ position: 'relative', height: 'clamp(160px, 22vw, 260px)', overflow: 'hidden' }}>
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
          position: 'absolute', bottom: 16, left: 'var(--layout-px)', right: 'var(--layout-px)',
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: 12, padding: '16px var(--layout-px) 0',
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
        padding: '0 var(--layout-px)',
        marginTop: 20,
        display: 'flex', gap: 0, overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
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
      <div style={{ padding: '20px var(--layout-px)', flex: 1 }}>

        {activeTab === 'hospedagem' && (
          <CategorySection
            photoMap={photoMap}
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
            photoMap={photoMap}
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
            photoMap={photoMap}
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
            photoMap={photoMap}
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
            photoMap={photoMap}
            items={data.transporte?.map((t) => ({
              id: `transp-${t.nome ?? t.tipo}`,
              type: 'transporte' as const,
              nome: t.nome ?? t.tipo,
              preco: t.valor,
              descricao: t.descricao,
              meta: t.tipo,
              badge: t.valor === 0 ? 'Gratuito' : `R$ ${t.valor.toLocaleString('pt-BR')}`,
              site_oficial: t.site_oficial,
              telefone: t.telefone,
            })) ?? []}
            onAdd={handleAdd}
            onViewDetails={handleViewDetails}
            addedIds={itinerary.map(i => i.id)}
          />
        )}

        {activeTab === 'experiencias' && (
          <CategorySection
            photoMap={photoMap}
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
          <ErrorBoundary>
            {budgetError ? (
              <div style={{
                background: 'rgba(239,68,68,0.08)', border: '1px solid var(--danger-border)',
                borderRadius: 12, padding: '20px 24px', maxWidth: 600, margin: '0 auto',
              }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--danger)', marginBottom: 8 }}>
                  ⚠️ Erro ao gerar o plano de orçamento
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
                  {budgetError}
                </p>
                <button className="btn-ghost" onClick={onReoptimize} style={{ fontSize: 13 }}>
                  🔄 Tentar novamente
                </button>
              </div>
            ) : (
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
          </ErrorBoundary>
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
