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
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 16,
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
                animationDelay: `${idx * 0.05}s`,
                opacity: 0,
              }}
            >
              {/* Card top color strip */}
              <div style={{
                height: 3,
                background: isAdded
                  ? 'linear-gradient(90deg, var(--teal), #38b2ac)'
                  : 'linear-gradient(90deg, var(--gold), #a07840)',
              }} />

              {/* Photo */}
              {item.foto_url && (
                <div style={{ height: 140, overflow: 'hidden', background: 'var(--bg-surface)' }}>
                  <img
                    src={item.foto_url}
                    alt={item.nome}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              )}

              <div style={{ padding: '18px 20px' }}>
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ flex: 1, marginRight: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 16 }}>{typeIcons[item.type]}</span>
                      <h3 style={{
                        fontSize: 15,
                        fontWeight: 500,
                        color: 'var(--text-primary)',
                        lineHeight: 1.3,
                      }}>
                        {item.nome}
                      </h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      {item.meta && (
                        <p style={{ fontSize: 11.5, color: 'var(--text-muted)', margin: 0 }}>
                          {item.meta}
                        </p>
                      )}
                      {item.rating != null && (
                        <span style={{
                          fontSize: 11, color: 'var(--gold)',
                          background: 'var(--gold-dim)', borderRadius: 4,
                          padding: '1px 6px', fontWeight: 600,
                        }}>
                          ★ {item.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="badge-gold" style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {item.badge}
                  </span>
                </div>

                {/* Description */}
                <p style={{
                  fontSize: 13.5,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  marginBottom: item.destaque ? 10 : 12,
                }}>
                  {item.descricao}
                </p>

                {/* Highlight tag */}
                {item.destaque && (
                  <div style={{
                    background: 'var(--gold-dim)',
                    border: '1px solid var(--gold-border)',
                    borderRadius: 6,
                    padding: '6px 10px',
                    marginBottom: 12,
                  }}>
                    <p style={{ fontSize: 12, color: 'var(--gold-light)', lineHeight: 1.4 }}>
                      {item.destaque}
                    </p>
                  </div>
                )}

                {/* Website + price source row */}
                {(item.website || item.fonte_preco) && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                    {item.website && item.website !== 'null' && (
                      <a
                        href={item.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: 11, color: 'var(--teal)',
                          textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3,
                        }}
                      >
                        🌐 Site oficial
                      </a>
                    )}
                    {item.fonte_preco && item.fonte_preco !== 'consulte o local' && item.fonte_preco.startsWith('http') && (
                      <a
                        href={item.fonte_preco}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: 11, color: 'var(--text-muted)',
                          textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3,
                        }}
                      >
                        💰 Fonte do preço
                      </a>
                    )}
                    {item.fonte_preco === 'consulte o local' && (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        💰 Preço: consulte o local
                      </span>
                    )}
                  </div>
                )}

                {/* Add button */}
                <button
                  onClick={() => !isAdded && onAdd({
                    id: item.id,
                    type: item.type,
                    nome: item.nome,
                    preco: item.preco,
                    descricao: item.meta || item.descricao,
                  })}
                  style={{
                    width: '100%',
                    padding: '9px 16px',
                    borderRadius: 7,
                    border: isAdded ? '1px solid rgba(78,205,196,0.3)' : '1px solid var(--border-light)',
                    background: isAdded ? 'var(--teal-dim)' : 'transparent',
                    color: isAdded ? 'var(--teal)' : 'var(--text-secondary)',
                    cursor: isAdded ? 'default' : 'pointer',
                    fontSize: 12.5,
                    fontFamily: 'var(--font-body)',
                    fontWeight: 500,
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                  onMouseEnter={(e) => {
                    if (!isAdded) {
                      (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-hover)';
                      (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isAdded) {
                      (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                      (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  {isAdded ? (
                    <><span>✓</span> Adicionado ao roteiro</>
                  ) : (
                    <><span>+</span> Adicionar ao roteiro</>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
