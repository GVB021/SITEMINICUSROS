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
  photoMap?: Record<string, string>;
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

export function CategorySkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: 16 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          borderRadius: 16, overflow: 'hidden',
          border: '1px solid var(--border)',
          background: 'var(--bg-card)',
          animationDelay: `${i * 0.1}s`,
        }}>
          <div className="skeleton" style={{ height: 220 }} />
          <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="skeleton" style={{ height: 22, width: '70%' }} />
            <div className="skeleton" style={{ height: 14, width: '45%' }} />
            <div className="skeleton" style={{ height: 14, width: '90%' }} />
            <div className="skeleton" style={{ height: 14, width: '75%' }} />
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <div className="skeleton" style={{ height: 34, flex: 1 }} />
              <div className="skeleton" style={{ height: 34, flex: 1 }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CategorySection({ items, onAdd, onViewDetails, addedIds, emptyMessage, photoMap }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [detailMap, setDetailMap] = useState<Record<string, PlaceDetail | null>>({});
  const [errorIds, setErrorIds] = useState<Set<string>>(new Set());

  const handleToggleDetail = async (item: CardItem) => {
    if (expandedId === item.id) { setExpandedId(null); return; }
    setExpandedId(item.id);
    if (item.id in detailMap) return;
    setLoadingIds(prev => new Set(prev).add(item.id));
    setErrorIds(prev => { const n = new Set(prev); n.delete(item.id); return n; });
    try {
      const detail = await onViewDetails(item);
      setDetailMap(prev => ({ ...prev, [item.id]: detail }));
    } catch {
      setErrorIds(prev => new Set(prev).add(item.id));
      setDetailMap(prev => ({ ...prev, [item.id]: null }));
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: 16 }}>
        {items.map((item, idx) => {
          const isAdded = addedIds.includes(item.id);
          return (
            <div
              key={item.id}
              className="animate-fadeInUp"
              style={{
                background: 'linear-gradient(160deg, var(--bg-card) 0%, rgba(14,16,22,0.98) 100%)',
                border: `1px solid ${isAdded ? 'rgba(78,205,196,0.3)' : 'var(--border)'}`,
                borderRadius: 16,
                overflow: 'hidden',
                animationDelay: `${idx * 0.04}s`,
                opacity: 0,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 28px rgba(0,0,0,0.4)',
                transition: 'box-shadow 0.25s, transform 0.25s, border-color 0.25s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px var(--gold-border)';
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = '0 4px 28px rgba(0,0,0,0.4)';
                e.currentTarget.style.transform = '';
              }}
            >
              {/* ── Image with vignette overlay ──────────────────── */}
              {(() => {
                const realPhoto = photoMap?.[item.id];
                const src = realPhoto ?? item.foto_url ?? getFallbackImage(item.type, item.nome);
                const isRealLoading = !realPhoto && !!photoMap && !(item.id in photoMap) && !item.foto_url;
                return (
                  <div style={{ position: 'relative', height: 220, overflow: 'hidden', background: 'var(--bg-surface)', flexShrink: 0 }}>
                    {isRealLoading && (
                      <div className="skeleton" style={{ position: 'absolute', inset: 0, zIndex: 1 }} />
                    )}
                    <img
                      src={src}
                      alt={item.nome}
                      style={{
                        width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                        transition: 'transform 0.4s, opacity 0.4s',
                        opacity: isRealLoading ? 0 : 1,
                      }}
                      onLoad={e => { (e.currentTarget as HTMLImageElement).style.opacity = '1'; }}
                      onError={e => {
                        const img = e.currentTarget as HTMLImageElement;
                        if (!img.src.includes('images.unsplash.com')) img.src = getFallbackImage(item.type, item.nome);
                        img.style.opacity = '1';
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.04)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'; }}
                    />
                    {/* Gradient vignette */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, transparent 40%, rgba(0,0,0,0.5) 100%)',
                      pointerEvents: 'none',
                    }} />
                    {/* Type icon — top left */}
                    <div style={{
                      position: 'absolute', top: 10, left: 10,
                      background: 'rgba(0,0,0,0.55)',
                      backdropFilter: 'blur(6px)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 8, padding: '3px 9px',
                      fontSize: 13, fontWeight: 600,
                      color: 'white',
                    }}>
                      {typeIcons[item.type]}
                    </div>
                    {/* Rating — top right */}
                    {item.rating != null && (
                      <div style={{
                        position: 'absolute', top: 10, right: 10,
                        background: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(6px)',
                        border: '1px solid rgba(201,169,110,0.4)',
                        borderRadius: 8, padding: '3px 10px',
                        display: 'flex', alignItems: 'center', gap: 4,
                      }}>
                        <span style={{ fontSize: 12, color: 'var(--gold)' }}>★</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold-light)' }}>
                          {item.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                    {/* Price badge — bottom left over image */}
                    <div style={{
                      position: 'absolute', bottom: 10, left: 10,
                      background: 'rgba(10,11,14,0.85)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid var(--gold-border)',
                      borderRadius: 8, padding: '4px 12px',
                    }}>
                      <span className="text-gold-gradient" style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                        {item.badge}
                      </span>
                    </div>
                    {/* Added checkmark — bottom right */}
                    {isAdded && (
                      <div style={{
                        position: 'absolute', bottom: 10, right: 10,
                        background: 'rgba(78,205,196,0.15)',
                        border: '1px solid rgba(78,205,196,0.4)',
                        borderRadius: 8, padding: '4px 10px',
                        fontSize: 11, color: 'var(--teal)', fontWeight: 600,
                      }}>
                        ✓ No Roteiro
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* ── Card content ─────────────────────────────────── */}
              <div style={{ flex: 1, padding: '16px 18px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Name + meta */}
                <div>
                  <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 19, fontWeight: 500,
                    color: 'var(--text-primary)',
                    lineHeight: 1.25, marginBottom: 4,
                    letterSpacing: '0.01em',
                  }}>
                    {item.nome}
                  </h3>
                  {item.meta && (
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>{item.meta}</span>
                  )}
                </div>

                {/* Description */}
                <p style={{
                  fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65, flex: 1,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {item.descricao}
                </p>

                {/* Highlight */}
                {item.destaque && (
                  <div style={{
                    background: 'rgba(201,169,110,0.07)', border: '1px solid var(--gold-border)',
                    borderRadius: 8, padding: '6px 10px',
                  }}>
                    <p style={{ fontSize: 11.5, color: 'var(--gold-light)', lineHeight: 1.45, margin: 0 }}>
                      💡 {item.destaque}
                    </p>
                  </div>
                )}

                {/* Action row */}
                <div style={{
                  display: 'flex', gap: 8, paddingTop: 4,
                  borderTop: '1px solid var(--border)', marginTop: 4,
                }}>
                  {/* Details button — always available */}
                  <button
                    onClick={() => handleToggleDetail(item)}
                    style={{
                      flex: 1,
                      padding: '9px 12px', borderRadius: 8,
                      border: '1px solid var(--gold-border)',
                      background: expandedId === item.id ? 'var(--gold-dim)' : 'rgba(201,169,110,0.06)',
                      color: expandedId === item.id ? 'var(--gold)' : 'var(--gold-light)',
                      cursor: 'pointer', fontSize: 12.5, fontWeight: 600,
                      transition: 'background 0.2s, color 0.2s',
                    }}
                  >
                    {expandedId === item.id ? '▲ Fechar' : '▼ Detalhes'}
                  </button>

                  {/* Add to itinerary */}
                  <button
                    onClick={() => !isAdded && onAdd({ id: item.id, type: item.type, nome: item.nome, preco: item.preco, descricao: item.meta || item.descricao })}
                    className={isAdded ? '' : 'btn-gold'}
                    style={{
                      flex: 1,
                      padding: '9px 12px', borderRadius: 8,
                      border: isAdded ? '1px solid rgba(78,205,196,0.35)' : 'none',
                      background: isAdded ? 'rgba(78,205,196,0.08)' : undefined,
                      color: isAdded ? 'var(--teal)' : undefined,
                      cursor: isAdded ? 'default' : 'pointer',
                      fontSize: 12.5, fontWeight: 600,
                    }}
                  >
                    {isAdded ? '✓ Adicionado' : '+ Roteiro'}
                  </button>
                </div>
              </div>
              {/* end card content */}

              {/* ── Inline expanded detail section ───────────────────── */}
              {expandedId === item.id && (
                <div style={{
                  borderTop: '1px solid var(--border)',
                  padding: '20px 24px',
                  background: 'var(--bg-surface)',
                  animation: 'fadeIn 0.2s ease',
                }}>
                  {loadingIds.has(item.id) ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>
                        <div style={{
                          width: 20, height: 20, borderRadius: '50%',
                          border: '2px solid var(--border)', borderTop: '2px solid var(--gold)',
                          animation: 'spin-slow 1s linear infinite',
                          flexShrink: 0,
                        }} />
                        Carregando detalhes…
                      </div>
                      <div className="skeleton" style={{ height: 80, borderRadius: 10 }} />
                    </div>
                  ) : errorIds.has(item.id) ? (
                    <p style={{ color: 'var(--danger)', fontSize: 13 }}>
                      Não foi possível carregar os detalhes. Tente novamente.
                    </p>
                  ) : (() => {
                    const d = detailMap[item.id];
                    if (!d) return <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Sem informações disponíveis.</p>;

                    // Resolve contact fields — prefer detail data, fall back to card data
                    const phone   = d.telefone   ?? item.telefone   ?? null;
                    const address = d.endereco   ?? null;
                    const siteUrl = d.site_oficial ?? item.site_oficial ?? null;
                    const igUrl   = d.instagram_url ?? null;
                    const mapsUrl = d.google_maps_url
                      ?? `https://www.google.com/maps/search/${encodeURIComponent(item.nome)}+${encodeURIComponent(address ?? '')}`;

                    const hasContact = phone || address || siteUrl || igUrl || mapsUrl;

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                        {/* ── Contact & Location block — always first ── */}
                        {hasContact && (
                          <div style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            borderRadius: 12,
                            padding: '14px 16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 10,
                          }}>
                            <p style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--gold)', letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0 }}>
                              📌 Contato &amp; Localização
                            </p>

                            {address && (
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                                <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>📍</span>
                                <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{address}</span>
                              </div>
                            )}

                            {phone && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 14, flexShrink: 0 }}>📞</span>
                                <a href={`tel:${phone.replace(/\D/g, '')}`}
                                  style={{ fontSize: 13, color: 'var(--teal)', textDecoration: 'none', fontWeight: 500 }}>
                                  {phone}
                                </a>
                              </div>
                            )}

                            {/* Links row */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 2 }}>
                              {siteUrl && (
                                <a href={siteUrl} target="_blank" rel="noopener noreferrer" style={linkChip}>
                                  🌐 Site oficial
                                </a>
                              )}
                              {igUrl && (
                                <a href={igUrl} target="_blank" rel="noopener noreferrer" style={{ ...linkChip, borderColor: 'rgba(225,48,108,0.35)', color: '#e1306c' }}>
                                  📷 Instagram
                                </a>
                              )}
                              {mapsUrl && (
                                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{ ...linkChip, borderColor: 'rgba(66,133,244,0.35)', color: '#4285f4' }}>
                                  🗺️ Google Maps
                                </a>
                              )}
                            </div>

                            {/* Disclaimer for Gemini knowledge fallback */}
                            {d.source === 'knowledge' && (
                              <p style={{
                                fontSize: 11, color: 'var(--text-muted)',
                                borderTop: '1px solid var(--border)',
                                paddingTop: 8, margin: 0, lineHeight: 1.5,
                              }}>
                                ⚠️ Informações estimadas — confirme antes de visitar
                              </p>
                            )}
                          </div>
                        )}

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
                        {(d.horario || d.duracao || d.como_chegar) && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {d.horario && <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>🕐 <strong style={{ color: 'var(--text-secondary)' }}>{d.horario}</strong></span>}
                            {d.duracao && <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>⏱ <strong style={{ color: 'var(--text-secondary)' }}>{d.duracao}</strong></span>}
                            {d.como_chegar && <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>🗺 <strong style={{ color: 'var(--text-secondary)' }}>Como chegar: </strong>{d.como_chegar}</span>}
                          </div>
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

/* ─── Styles ────────────────────────────────────────────────────────────── */
const linkChip: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 5,
  padding: '5px 12px',
  borderRadius: 20,
  border: '1px solid var(--gold-border)',
  background: 'var(--bg-hover)',
  color: 'var(--gold-light)',
  fontSize: 12, fontWeight: 500,
  textDecoration: 'none',
  transition: 'opacity 0.15s',
};
