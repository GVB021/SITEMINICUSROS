import { useEffect } from 'react';
import type { ItineraryItem, TripConfig } from '../types';

interface Props {
  open: boolean;
  items: ItineraryItem[];
  config: TripConfig;
  onClose: () => void;
  onRemove: (id: string) => void;
}

const typeIcons: Record<string, string> = {
  hospedagem:  '🏨',
  restaurante: '🍽️',
  atracao:     '🗺️',
  evento:      '🎵',
  transporte:  '🚗',
  experiencia: '✨',
};

const typeLabels: Record<string, string> = {
  hospedagem:  'Hospedagem',
  restaurante: 'Restaurante',
  atracao:     'Atração',
  evento:      'Evento',
  transporte:  'Transporte',
  experiencia: 'Experiência',
};

export default function ItinerarySidebar({ open, items, config, onClose, onRemove }: Props) {
  const total = items.reduce((sum, i) => sum + i.preco, 0);
  const budgetLeft = config.budget ? config.budget - total : null;

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  function exportItinerary() {
    const lines: string[] = [
      `🧳 MEU ROTEIRO — ${config.destination}`,
      `📅 ${config.checkIn} → ${config.checkOut} | 👤 ${config.people} pessoa(s)`,
      '',
      '═══════════════════════════════',
      '',
    ];

    const grouped: Record<string, ItineraryItem[]> = {};
    items.forEach((item) => {
      if (!grouped[item.type]) grouped[item.type] = [];
      grouped[item.type].push(item);
    });

    Object.entries(grouped).forEach(([type, typeItems]) => {
      lines.push(`${typeIcons[type] ?? '📌'} ${typeLabels[type] ?? type.toUpperCase()}`);
      typeItems.forEach((item) => {
        lines.push(`  • ${item.nome} — R$ ${item.preco.toLocaleString('pt-BR')}`);
        if (item.descricao) lines.push(`    ${item.descricao}`);
      });
      lines.push('');
    });

    lines.push('═══════════════════════════════');
    lines.push(`💰 TOTAL ESTIMADO: R$ ${total.toLocaleString('pt-BR')}`);
    if (config.budget) {
      const left = config.budget - total;
      lines.push(`🎯 Orçamento: R$ ${config.budget.toLocaleString('pt-BR')}`);
      lines.push(left >= 0
        ? `✅ Saldo restante: R$ ${left.toLocaleString('pt-BR')}`
        : `⚠️ Ultrapassou em: R$ ${Math.abs(left).toLocaleString('pt-BR')}`
      );
    }
    lines.push('');
    lines.push('Gerado por Concierge Virtual ✨');

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roteiro-${config.destination.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 200,
            animation: 'fadeIn 0.2s ease',
          }}
        />
      )}

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Meu Roteiro"
        style={{
          position: 'fixed',
          top: 0, right: 0, bottom: 0,
          width: 'min(380px, 100vw)',
          background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border)',
          zIndex: 201,
          display: 'flex',
          flexDirection: 'column',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.4)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 20,
              fontWeight: 400,
              color: 'var(--text-primary)',
              marginBottom: 2,
            }}>
              Meu Roteiro
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {config.destination} · {items.length} item{items.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar roteiro"
            style={{
              background: 'var(--bg-hover)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              color: 'var(--text-secondary)',
              width: 32, height: 32,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16,
            }}
          >
            ×
          </button>
        </div>

        {/* Items list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }} className="animate-float">🗺️</div>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6 }}>
                Seu roteiro está vazio.<br />
                Adicione itens das categorias ao lado.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  className="animate-fadeInUp"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                  }}
                >
                  <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>
                    {typeIcons[item.type] ?? '📌'}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: 13.5,
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                      marginBottom: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {item.nome}
                    </p>
                    <p style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                      {typeLabels[item.type]}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                    <span className="badge-gold" style={{ fontSize: 11 }}>
                      R$ {item.preco.toLocaleString('pt-BR')}
                    </span>
                    <button
                      onClick={() => onRemove(item.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: 11,
                        padding: '2px 6px',
                        borderRadius: 4,
                        transition: 'color 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                    >
                      remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer — total + export */}
        <div style={{
          borderTop: '1px solid var(--border)',
          padding: '20px 24px',
        }}>
          {/* Total */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: '14px 16px',
            marginBottom: 14,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: budgetLeft !== null ? 8 : 0 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Total estimado</span>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: 22,
                fontWeight: 500,
                color: 'var(--gold-light)',
              }}>
                R$ {total.toLocaleString('pt-BR')}
              </span>
            </div>

            {budgetLeft !== null && (
              <>
                <div style={{
                  height: 1,
                  background: 'var(--border)',
                  margin: '10px 0',
                }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {budgetLeft >= 0 ? 'Saldo restante' : 'Ultrapassou em'}
                  </span>
                  <span style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: budgetLeft >= 0 ? 'var(--teal)' : 'var(--danger)',
                  }}>
                    {budgetLeft >= 0 ? '+' : '-'}R$ {Math.abs(budgetLeft).toLocaleString('pt-BR')}
                  </span>
                </div>
                {/* Budget progress bar */}
                <div style={{
                  marginTop: 10,
                  height: 4,
                  background: 'var(--bg-hover)',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(100, (total / config.budget!) * 100)}%`,
                    background: budgetLeft >= 0
                      ? 'linear-gradient(90deg, var(--teal), var(--gold))'
                      : 'var(--danger)',
                    borderRadius: 2,
                    transition: 'width 0.4s ease',
                  }} />
                </div>
              </>
            )}
          </div>

          <button
            className="btn-gold"
            onClick={exportItinerary}
            disabled={items.length === 0}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <span>⬇️</span> Exportar roteiro
          </button>
        </div>
      </div>
    </>
  );
}
