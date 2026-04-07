import { useState } from 'react';
import type { ItineraryItem, ItineraryItemType, PlaceDetail } from '../types';

interface CardItem {
  id: string;
  type: ItineraryItemType;
  nome: string;
  preco: number;
  descricao: string;
  meta: string;
  badge: string;
  destaque?: string;
  foto_url?: string | null;
  website?: string | null;
  site_oficial?: string | null;
  telefone?: string | null;
  rating?: number | null;
  fonte_preco?: string | null;
}

interface Props {
  items: CardItem[];
  onAdd: (item: ItineraryItem) => void;
  onViewDetails: (item: CardItem) => Promise<PlaceDetail | null>;
  addedIds: string[];
  emptyMessage?: string;
}

const typeIcons: Record<ItineraryItemType, string> = {
  hospedagem:   '🏨',
  restaurante:  '🍽️',
  atracao:      '🗺️',
  evento:       '🎵',
  transporte:   '🚗',
  experiencia:  '✨',
};

const FALLBACK_PHOTOS: Record<ItineraryItemType, string[]> = {
  hospedagem:  ['1566073771259-6a8506099945','1551882547-ff40c599fb6e','1445019980597-93fa8acb246c','1582719508461-905c673773b6','1631049307264-da0ec9d70304'],
  restaurante: ['1414235077428-338989a2e8c0','1555396273-367ea4eb4db5','1504674900247-0877df9cc836','1559339352-11d035aa65de','1424847651672-bf20a4b0982b'],
  atracao:     ['1506905925346-21bda4d32df4','1469474968028-56623f02e42e','1476041800959-fdbf6d9dff64','1501285486083-23fa64f5e6a4','1518002054494-3a6996d73f85'],
  evento:      ['1470229722913-7c0e2dbbafd3','1429514513361-8fa32282fd5f','1493225457124-a3eb161ffa5f','1501281668745-a677a44b0042'],
  transporte:  ['1436491865332-7a61a109cc05','1544620347-c4fd4a3d5957','1474487548417-781cb6d19f3a'],
  experiencia: ['1501854140801-50d01698950b','1530866495561-507c9faab2ed','1533130061792-64b345e4a6ad','1504280390367-361c6d9f38f4'],
};

function getFallbackImage(type: ItineraryItemType, name?: string): string {
  const pool = FALLBACK_PHOTOS[type];
  const idx = name
    ? [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % pool.length
    : 0;
  return `https://images.unsplash.com/photo-${pool[idx]}?w=480&q=80&fit=crop`;
}

function hasSiteOficial(item: { site_oficial?: string | null }): boolean {
  return !!item.site_oficial && item.site_oficial !== 'null' && item.site_oficial.startsWith('http');
}

export default function CategorySection({ items, onAdd, onViewDetails, addedIds, emptyMessage }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [detailMap, setDetailMap] = useState<Record<string, PlaceDetail | null>>({});

  const handleToggleDetail = async (item: CardItem) => {
    if (!hasSiteOficial(item)) {
      const q = encodeURIComponent(`${item.nome}`);
      window.open(`https://www.google.com/search?q=${q}`, '_blank', 'noopener,noreferrer');
      return;
    }
    if (expandedId === item.id) { setExpandedId(null); return; }
    setExpandedId(item.id);
    if (item.id in detailMap) return;
    setLoadingIds(prev => new Set(prev).add(item.id));
    try {
      const detail = await onViewDetails(item);
      setDetailMap(prev => ({ ...prev, [item.id]: detail }));
    } finally {
      setLoadingIds(prev => { const n = new Set(prev); n.delete(item.id); return n; });
    }
  };

  if (items.length === 0) {
    return (
      <div style={{ padding: '48px 0', textAlign: 'center' }}>
        <p style={{ fontSize: 32, marginBottom: 12 }}>🔍</p>
        <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
          {emptyMessage ?? 'Nenhum item encontrado para esta categoria.'}
        </p>
      </div>
    );
  }

  const withSite = items.filter(hasSiteOficial).length;

  return (
    <div>
      <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
          {items.length} {items.length === 1 ? 'opção' : 'opções'}
        </span>
        {withSite > 0 && (
          <span style={{
            fontSize: 11.5, color: 'var(--teal)',
            background: 'var(--teal-dim)', borderRadius: 4,
            padding: '1px 7px', fontWeight: 500,
          }}>
            🌐 {withSite} com site oficial
          </span>
        )}
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}>
        {items.map((item, idx) => {
          const isAdded = addedIds.includes(item.id);
          return (
            <div
              key={item.id}
              className="glass-card animate-fadeInUp"
              style={{
                padding: 0,
                overflow: 'hidden',
                animationDelay: `${idx * 0.03}s`,
                opacity: 0,
                display: 'flex',
                flexDirection: 'column',
                transition: 'box-shadow 0.2s, transform 0.2s',
                cursor: 'default',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.25)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '';
                e.currentTarget.style.transform = '';
              }}
            >
              {/* Main row */}
              <div style={{ display: 'flex', flexDirection: 'row', minHeight: 180 }}>
              {/* Image column - fixed width */}
              <div style={{
                width: 240,
                minWidth: 240,
                height: 180,
                overflow: 'hidden',
                background: 'var(--bg-surface)',
                position: 'relative',
              }}>
                <img
                  src={item.foto_url || getFallbackImage(item.type, item.nome)}
                  alt={item.nome}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    if (!img.src.includes('images.unsplash.com')) {
                      img.src = getFallbackImage(item.type, item.nome);
                    }
                  }}
                />
                {/* Top left badge */}
                <div style={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  background: isAdded ? 'var(--teal)' : 'var(--gold)',
                  color: 'white',
                  padding: '3px 8px',
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}>
                  {typeIcons[item.type]}
                </div>
              </div>

              {/* Content column - flexible */}
              <div style={{ flex: 1, padding: '16px 20px', display: 'flex', flexDirection: 'column' }}>
                {/* Title row with rating */}
                <div style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
                    <h3 style={{
                      fontSize: 17,
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      lineHeight: 1.3,
                      flex: 1,
                    }}>
                      {item.nome}
                    </h3>
                    {item.rating != null && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        background: 'var(--gold-dim)',
                        borderRadius: 6,
                        padding: '4px 10px',
                        flexShrink: 0,
                      }}>
                        <span style={{ fontSize: 14, color: 'var(--gold)' }}>★</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--gold)' }}>
                          {item.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Meta info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    {item.meta && (
                      <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                        {item.meta}
                      </span>
                    )}
                    <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>·</span>
                    <span className="badge-gold" style={{ fontSize: 12, padding: '2px 8px' }}>
                      {item.badge}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p style={{
                  fontSize: 13,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.65,
                  marginBottom: 10,
                  flex: 1,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {item.descricao}
                </p>

                {/* Highlight tag */}
                {item.destaque && (
                  <div style={{
                    background: 'var(--gold-dim)',
                    border: '1px solid var(--gold-border)',
                    borderRadius: 6,
                    padding: '5px 10px',
                    marginBottom: 10,
                  }}>
                    <p style={{ fontSize: 11.5, color: 'var(--gold-light)', lineHeight: 1.4, margin: 0 }}>
                      💡 {item.destaque}
                    </p>
                  </div>
                )}

                  {/* Bottom row: phone info + buttons */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 'auto' }}>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', flex: 1, alignItems: 'center' }}>
                    {item.telefone && item.telefone !== 'null' && (
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        📞 {item.telefone}
                      </span>
                    )}
                    {hasSiteOficial(item) && (
                      <span style={{ fontSize: 12, color: 'var(--teal)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        🌐 Site oficial
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    {/* Ver detalhes button — smart: Tavily if site_oficial, else Google search */}
                    <button
                      onClick={() => handleToggleDetail(item)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 6,
                        border: hasSiteOficial(item) ? '1px solid var(--gold-border)' : '1px solid var(--border)',
                        background: expandedId === item.id ? 'var(--gold)' : hasSiteOficial(item) ? 'var(--gold-dim)' : 'var(--bg-card)',
                        color: expandedId === item.id ? '#000' : hasSiteOficial(item) ? 'var(--gold-light)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: 12.5,
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        transition: 'background 0.2s',
                      }}
                      title={hasSiteOficial(item) ? (expandedId === item.id ? 'Fechar detalhes' : 'Ver detalhes') : 'Buscar no Google'}
                    >
                      {!hasSiteOficial(item) ? '🔍 Buscar' : expandedId === item.id ? '▲ Fechar' : '▼ Ver detalhes'}
                    </button>

                    {/* Add to itinerary button */}
                    <button
                      onClick={() => !isAdded && onAdd({
                        id: item.id,
                        type: item.type,
                        nome: item.nome,
                        preco: item.preco,
                        descricao: item.meta || item.descricao,
                      })}
                      className={isAdded ? '' : 'btn-gold'}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 6,
                        border: isAdded ? '1px solid var(--teal)' : 'none',
                        background: isAdded ? 'var(--teal-dim)' : undefined,
                        color: isAdded ? 'var(--teal)' : undefined,
                        cursor: isAdded ? 'default' : 'pointer',
                        fontSize: 12.5,
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {isAdded ? '✓ Adicionado' : '+ Roteiro'}
                    </button>
                  </div>
                </div>
              </div>
              </div>{/* end main row */}

              {/* ── Inline expanded detail section ───────────────────── */}
              {expandedId === item.id && (
                <div style={{
                  borderTop: '1px solid var(--border)',
                  padding: '20px 24px',
                  background: 'var(--bg-surface)',
                  animation: 'fadeIn 0.2s ease',
                }}>
                  {loadingIds.has(item.id) ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-muted)', fontSize: 13 }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%',
                        border: '2px solid var(--border)', borderTop: '2px solid var(--gold)',
                        animation: 'spin-slow 1s linear infinite',
                        flexShrink: 0,
                      }} />
                      Carregando detalhes…
                    </div>
                  ) : (() => {
                    const d = detailMap[item.id];
                    if (!d) return <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Sem informações disponíveis.</p>;
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {d.descricao_completa && (
                          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{d.descricao_completa}</p>
                        )}

                        {/* Hotel rooms */}
                        {(d.quartos?.length ?? 0) > 0 && (
                          <div>
                            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>🛏 Tipos de Quarto</p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                              {d.quartos!.map((q, i) => (
                                <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
                                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{q.tipo}</p>
                                  {q.capacidade && <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>👥 {q.capacidade}</p>}
                                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>{q.descricao}</p>
                                  <span className="badge-gold" style={{ fontSize: 12 }}>R$ {q.preco?.toLocaleString('pt-BR')}/noite</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Amenities */}
                        {(d.comodidades?.length ?? 0) > 0 && (
                          <div>
                            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>✓ Comodidades</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                              {d.comodidades!.map((c, i) => (
                                <span key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '3px 10px', fontSize: 12, color: 'var(--text-secondary)' }}>{c}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Check-in/out */}
                        {(d.checkin || d.checkout) && (
                          <div style={{ display: 'flex', gap: 16 }}>
                            {d.checkin && <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>🔑 Check-in: <strong style={{ color: 'var(--text-secondary)' }}>{d.checkin}</strong></span>}
                            {d.checkout && <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>🔓 Check-out: <strong style={{ color: 'var(--text-secondary)' }}>{d.checkout}</strong></span>}
                          </div>
                        )}

                        {/* Restaurant menu */}
                        {(d.menu?.length ?? 0) > 0 && (
                          <div>
                            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>🍽 Cardápio</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                              {d.menu!.map((sec, si) => (
                                <div key={si}>
                                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>{sec.secao}</p>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    {sec.itens.map((it, ii) => (
                                      <div key={ii} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
                                        <div>
                                          <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{it.nome}</span>
                                          {it.descricao && <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>{it.descricao}</p>}
                                        </div>
                                        {it.preco > 0 && <span className="badge-gold" style={{ fontSize: 12, flexShrink: 0, marginLeft: 12 }}>R$ {it.preco.toLocaleString('pt-BR')}</span>}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Tickets */}
                        {(d.ingressos?.length ?? 0) > 0 && (
                          <div>
                            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>🎟 Ingressos / Pacotes</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                              {d.ingressos!.map((t, i) => (
                                <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--gold-border)', borderRadius: 8, padding: '10px 14px', minWidth: 160 }}>
                                  <p style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>{t.tipo}</p>
                                  <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 6 }}>{t.descricao}</p>
                                  <span className="badge-gold" style={{ fontSize: 12 }}>R$ {t.preco?.toLocaleString('pt-BR')}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Schedule / Duration / How to get there */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                          {d.horario && <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>🕐 <strong style={{ color: 'var(--text-secondary)' }}>{d.horario}</strong></span>}
                          {d.duracao && <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>⏱ <strong style={{ color: 'var(--text-secondary)' }}>{d.duracao}</strong></span>}
                          {d.endereco && <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>📍 <strong style={{ color: 'var(--text-secondary)' }}>{d.endereco}</strong></span>}
                        </div>
                        {d.como_chegar && (
                          <p style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>🗺 <strong style={{ color: 'var(--text-secondary)' }}>Como chegar: </strong>{d.como_chegar}</p>
                        )}

                        {/* Site link */}
                        {item.site_oficial && (
                          <a href={item.site_oficial} target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: 12.5, color: 'var(--teal)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                            🌐 Ver site oficial →
                          </a>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
