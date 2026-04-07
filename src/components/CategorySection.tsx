import type { ItineraryItem, ItineraryItemType } from '../types';

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
  rating?: number | null;
  fonte_preco?: string | null;
}

interface Props {
  items: CardItem[];
  onAdd: (item: ItineraryItem) => void;
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

function getFallbackImage(type: ItineraryItemType, nome: string): string {
  const typeKeywords: Record<ItineraryItemType, string> = {
    hospedagem:   'hotel,resort,bedroom',
    restaurante:  'restaurant,food,dining',
    atracao:      'tourism,attraction,landmark',
    evento:       'event,concert,show',
    transporte:   'transportation,travel',
    experiencia:  'adventure,experience,activity',
  };
  const keywords = typeKeywords[type];
  return `https://source.unsplash.com/240x180/?${keywords}`;
}

export default function CategorySection({ items, onAdd, addedIds, emptyMessage }: Props) {
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

  return (
    <div>
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
                flexDirection: 'row',
                minHeight: 180,
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
                    if (!img.src.includes('source.unsplash.com')) {
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

                {/* Bottom row: links + button */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 'auto' }}>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', flex: 1 }}>
                    {item.website && item.website !== 'null' && (
                      <a
                        href={item.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: 11.5,
                          color: 'var(--teal)',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontWeight: 500,
                        }}
                      >
                        🌐 Website
                      </a>
                    )}
                    {item.fonte_preco && item.fonte_preco !== 'consulte o local' && item.fonte_preco.startsWith('http') && (
                      <a
                        href={item.fonte_preco}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: 11.5,
                          color: 'var(--text-muted)',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        💰 Preço
                      </a>
                    )}
                    {item.fonte_preco === 'consulte o local' && (
                      <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                        💰 Consulte
                      </span>
                    )}
                  </div>

                  {/* Add button */}
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
                      padding: '8px 20px',
                      borderRadius: 6,
                      border: isAdded ? '1px solid var(--teal)' : 'none',
                      background: isAdded ? 'var(--teal-dim)' : undefined,
                      color: isAdded ? 'var(--teal)' : undefined,
                      cursor: isAdded ? 'default' : 'pointer',
                      fontSize: 13,
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    {isAdded ? '✓ Adicionado' : '+ Adicionar'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
