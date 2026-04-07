import { useState } from 'react';
import type { ConciergeResponse, TripConfig, ItineraryItem, PeriodDetail } from '../types';
import type { BudgetPlan } from '../api';

interface Props {
  data: ConciergeResponse;
  config: TripConfig;
  budgetPlan: BudgetPlan | null;
  loadingBudget: boolean;
  onAddItem: (item: ItineraryItem) => void;
  addedIds: string[];
  onReoptimize: () => void;
}

function computeTaxi(distanciaHotel?: string): number | null {
  if (!distanciaHotel) return null;
  const km = parseFloat(distanciaHotel.replace(',', '.'));
  if (isNaN(km) || km <= 0) return null;
  return Math.round(5.5 + km * 2.8);
}

function PeriodDetailPanel({ detail }: { detail: PeriodDetail }) {
  const hasDishes   = (detail.pratos?.length ?? 0) > 0;
  const taxiFare    = computeTaxi(detail.distancia_hotel);
  const hasTransport = detail.distancia_hotel || taxiFare != null;
  if (!hasDishes && !hasTransport) return null;
  return (
    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {hasDishes && (
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
            🍽 Pratos sugeridos
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {detail.pratos!.map((p, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 12px',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 12.5, color: 'var(--text-primary)', fontWeight: 500 }}>{p.nome}</span>
                  {p.descricao && (
                    <span style={{ fontSize: 11.5, color: 'var(--text-muted)', marginLeft: 6 }}>· {p.descricao}</span>
                  )}
                </div>
                <span className="badge-gold" style={{ fontSize: 11.5, flexShrink: 0, marginLeft: 12 }}>
                  R$ {p.preco.toLocaleString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      {hasTransport && (
        <div style={{
          display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center',
          background: 'rgba(201,169,110,0.06)', border: '1px solid var(--gold-border)',
          borderRadius: 8, padding: '9px 14px',
        }}>
          {detail.distancia_hotel && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span>📍</span>
              <strong style={{ color: 'var(--text-secondary)' }}>{detail.distancia_hotel}</strong>
              <span>do hotel</span>
            </span>
          )}
          {taxiFare != null && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span>🚕</span>
              <span>Táxi aprox.</span>
              <strong style={{ color: 'var(--gold-light)' }}>R$ {taxiFare.toLocaleString('pt-BR')}</strong>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default function BudgetPanel({ data, config, budgetPlan, loadingBudget, onAddItem, addedIds, onReoptimize }: Props) {
  const [expandedPeriodKey, setExpandedPeriodKey] = useState<string | null>(null);

  const togglePeriod = (key: string) =>
    setExpandedPeriodKey(prev => (prev === key ? null : key));

  if (!config.budget) return null;
  const budget = config.budget;
  const breakdown = budgetPlan?.resumo_orcamento;
  const itinerary = budgetPlan?.roteiro_dia_a_dia ?? [];

  const total = breakdown?.total ?? 0;
  const diff = budget - total;
  const overBudget = diff < 0;

  const budgetRows = breakdown
    ? [
        { label: '🏨 Hospedagem',    value: breakdown.hospedagem },
        { label: '🍽️ Alimentação',   value: breakdown.alimentacao },
        { label: '🗺️ Passeios',       value: breakdown.passeios },
        { label: '🚗 Transporte',     value: breakdown.transporte },
        { label: '🎵 Eventos',        value: breakdown.eventos },
        { label: '✨ Experiências',   value: breakdown.experiencias },
      ]
    : [];

  if (loadingBudget) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', width: '100%' }}>
        {/* Accommodation skeleton */}
        <div className="skeleton" style={{ height: 68, borderRadius: 12, marginBottom: 20 }} />
        {/* Tip skeleton */}
        <div className="skeleton" style={{ height: 48, borderRadius: 10, marginBottom: 24 }} />
        {/* Summary cards skeleton */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 12, marginBottom: 24 }}>
          {[0, 1, 2].map(i => (
            <div key={i} className="skeleton" style={{ height: 88, borderRadius: 12 }} />
          ))}
        </div>
        {/* Progress bar skeleton */}
        <div className="skeleton" style={{ height: 12, borderRadius: 6, marginBottom: 32 }} />
        {/* Breakdown table skeleton */}
        <div className="skeleton" style={{ height: 220, borderRadius: 12, marginBottom: 32 }} />
        {/* Itinerary day skeletons */}
        {[0, 1, 2].map(i => (
          <div key={i} style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
            <div className="skeleton" style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, marginTop: 14 }} />
            <div className="skeleton" style={{ flex: 1, height: 140, borderRadius: 14 }} />
          </div>
        ))}
        <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', marginTop: 8, fontStyle: 'italic' }}>
          Montando seu roteiro dentro do orçamento…
        </p>
      </div>
    );
  }

  if (!budgetPlan) {
    return (
      <div style={{ padding: '48px 0', textAlign: 'center' }}>
        <p style={{ fontSize: 32, marginBottom: 12 }}>💰</p>
        <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
          Nenhum plano disponível. Carregue uma viagem com orçamento definido.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', width: '100%' }}>

      {/* ── Suggested Accommodation ─────────────────────────────────────── */}
      {budgetPlan.hospedagem_sugerida && (
        <div style={{
          background: 'var(--gold-dim)',
          border: '1px solid var(--gold-border)',
          borderRadius: 12, padding: '16px 20px',
          marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 22 }}>🏨</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>
              Hospedagem sugerida
            </p>
            <p style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>
              {budgetPlan.hospedagem_sugerida}
            </p>
          </div>
          <button
            onClick={() => {
              const hotel = data.hospedagem.find(h => h.nome === budgetPlan.hospedagem_sugerida);
              if (!hotel) return;
              const id = `hosp-${hotel.nome}`;
              if (!addedIds.includes(id)) {
                onAddItem({ id, type: 'hospedagem', nome: hotel.nome, preco: hotel.diaria, descricao: hotel.descricao });
              }
            }}
            className={addedIds.includes(`hosp-${budgetPlan.hospedagem_sugerida}`) ? '' : 'btn-gold'}
            style={{
              padding: '7px 14px', borderRadius: 6, fontSize: 12.5, fontWeight: 600, flexShrink: 0,
              ...(addedIds.includes(`hosp-${budgetPlan.hospedagem_sugerida}`)
                ? { background: 'var(--teal-dim)', border: '1px solid var(--teal)', color: 'var(--teal)', cursor: 'default' }
                : {}),
            }}
          >
            {addedIds.includes(`hosp-${budgetPlan.hospedagem_sugerida}`) ? '✓ Adicionado' : '+ Roteiro'}
          </button>
        </div>
      )}

      {/* ── Concierge tip ───────────────────────────────────────────────── */}
      {budgetPlan.dica_economia && (
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '12px 16px', marginBottom: 24,
          display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <span>💡</span>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--gold)' }}>Dica de economia: </strong>
            {budgetPlan.dica_economia}
          </p>
        </div>
      )}

      {/* ── Budget Summary ──────────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
        gap: 12,
        marginBottom: 24,
      }}>
        <div style={summaryCard}>
          <p style={summaryLabel}>Orçamento disponível</p>
          <p style={{ ...summaryValue, color: 'var(--text-primary)' }}>
            R$ {budget.toLocaleString('pt-BR')}
          </p>
        </div>
        <div style={summaryCard}>
          <p style={summaryLabel}>Total estimado</p>
          <p style={{ ...summaryValue, color: 'var(--gold-light)' }}>
            R$ {total.toLocaleString('pt-BR')}
          </p>
        </div>
        <div style={{
          ...summaryCard,
          borderColor: overBudget ? 'var(--danger-border)' : 'rgba(78,205,196,0.3)',
          background: overBudget ? 'var(--danger-bg)' : 'var(--teal-dim)',
          border: undefined,
        }}>
          <p style={summaryLabel}>{overBudget ? '⚠️ Ultrapassou em' : '✅ Saldo restante'}</p>
          <p style={{ ...summaryValue, color: overBudget ? 'var(--danger)' : 'var(--teal)' }}>
            R$ {Math.abs(diff).toLocaleString('pt-BR')}
          </p>
        </div>
      </div>

      {/* ── Budget Progress Bar ─────────────────────────────────────────── */}
      {breakdown && (
        <div style={{ marginBottom: 32 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 8,
            fontSize: 12,
            color: 'var(--text-muted)',
          }}>
            <span>R$ 0</span>
            <span>R$ {budget.toLocaleString('pt-BR')}</span>
          </div>
          <div style={{
            height: 12,
            background: 'var(--bg-hover)',
            borderRadius: 6,
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${Math.min(100, (total / budget) * 100)}%`,
              background: overBudget
                ? 'var(--danger)'
                : 'linear-gradient(90deg, var(--teal), var(--gold))',
              borderRadius: 6,
              transition: 'width 0.6s ease',
            }} />
          </div>
          <p style={{ fontSize: 12, color: overBudget ? 'var(--danger)' : 'var(--text-muted)', marginTop: 6, textAlign: 'right' }}>
            {((total / budget) * 100).toFixed(0)}% do orçamento utilizado
          </p>
        </div>
      )}

      {/* ── Cost Breakdown Table ─────────────────────────────────────────── */}
      {breakdown && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          overflow: 'hidden',
          marginBottom: 32,
        }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
              Distribuição de Custos
            </h3>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {config.people} pessoa{config.people !== 1 ? 's' : ''}
            </span>
          </div>
          {budgetRows.filter(r => r.value > 0).map((row, idx) => (
            <div key={idx} style={{
              padding: '14px 20px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                <span style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>{row.label}</span>
                <div style={{
                  flex: 1,
                  height: 4,
                  background: 'var(--bg-hover)',
                  borderRadius: 2,
                  maxWidth: 200,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(100, (row.value / total) * 100)}%`,
                    background: 'var(--gold-dim)',
                    borderRadius: 2,
                  }} />
                </div>
              </div>
              <span className="badge-gold" style={{ marginLeft: 16 }}>
                R$ {row.value.toLocaleString('pt-BR')}
              </span>
            </div>
          ))}
          <div style={{
            padding: '14px 20px',
            background: 'var(--bg-surface)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Total</span>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 20,
              fontWeight: 500,
              color: 'var(--gold-light)',
            }}>
              R$ {total.toLocaleString('pt-BR')}
            </span>
          </div>
        </div>
      )}

      {/* ── Day-by-Day Itinerary ─────────────────────────────────────────── */}
      {itinerary.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 26, fontWeight: 400,
            color: 'var(--text-primary)',
            marginBottom: 28,
            letterSpacing: '-0.01em',
          }}>
            Roteiro Dia a Dia
          </h3>

          {/* Timeline container */}
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 0 }}>
            {/* Vertical gold line */}
            <div style={{
              position: 'absolute',
              left: 19, top: 20, bottom: 20,
              width: 1,
              background: 'linear-gradient(180deg, var(--gold-border) 0%, rgba(201,169,110,0.1) 100%)',
              zIndex: 0,
            }} />

            {itinerary.map((day, idx) => (
              <div
                key={idx}
                className="animate-fadeInUp"
                style={{
                  display: 'flex', gap: 20,
                  animationDelay: `${idx * 0.07}s`,
                  opacity: 0,
                  marginBottom: 24,
                  position: 'relative', zIndex: 1,
                }}
              >
                {/* Timeline circle */}
                <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 14 }}>
                  <div style={{
                    width: 38, height: 38,
                    borderRadius: '50%',
                    background: 'var(--bg-base)',
                    border: '2px solid var(--gold-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 16px rgba(201,169,110,0.15)',
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 14, fontWeight: 500, color: 'var(--gold)',
                    }}>{day.dia}</span>
                  </div>
                </div>

                {/* Day card */}
                <div style={{
                  flex: 1,
                  background: 'linear-gradient(145deg, var(--bg-card) 0%, rgba(16,18,24,0.95) 100%)',
                  border: '1px solid var(--border)',
                  borderRadius: 14,
                  overflow: 'hidden',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
                }}>
                  {/* Day header */}
                  <div style={{
                    padding: '14px 20px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'rgba(255,255,255,0.02)',
                  }}>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Dia {day.dia}</span>
                      {day.data && <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 10 }}>{day.data}</span>}
                    </div>
                    {day.custo_estimado > 0 && (
                      <span className="badge-gold" style={{ fontSize: 12.5 }}>
                        R$ {day.custo_estimado.toLocaleString('pt-BR')}
                      </span>
                    )}
                  </div>

                  {/* Period blocks */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {([
                      { period: '🌅 Manhã', content: day.manha, detalhe: day.manha_detalhe, key: `${idx}-manha` },
                      { period: '☀️ Tarde', content: day.tarde, detalhe: day.tarde_detalhe, key: `${idx}-tarde` },
                      { period: '🌙 Noite', content: day.noite, detalhe: day.noite_detalhe, key: `${idx}-noite` },
                    ] as const).filter(p => p.content).map((p, pi, arr) => {
                      const taxiFare = computeTaxi(p.detalhe?.distancia_hotel);
                      const hasDetail = p.detalhe && (
                        (p.detalhe.pratos?.length ?? 0) > 0 ||
                        p.detalhe.distancia_hotel ||
                        taxiFare != null
                      );
                      const isExpanded = expandedPeriodKey === p.key;
                      return (
                        <div
                          key={p.key}
                          style={{
                            padding: '14px 20px',
                            borderBottom: pi < arr.length - 1 ? '1px solid var(--border)' : 'none',
                            background: isExpanded ? 'rgba(201,169,110,0.04)' : 'transparent',
                            transition: 'background 0.2s',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                            <div style={{ flex: 1 }}>
                              {/* Period label */}
                              <p style={{
                                fontSize: 10, fontWeight: 700,
                                color: 'var(--gold)', letterSpacing: '0.14em',
                                textTransform: 'uppercase', marginBottom: 4,
                              }}>
                                {p.period}
                              </p>
                              {/* local_nome as prominent title */}
                              {p.detalhe?.local_nome && (
                                <p style={{
                                  fontSize: 13.5, fontWeight: 600,
                                  color: 'var(--text-primary)', marginBottom: 3,
                                  fontFamily: 'var(--font-display)', letterSpacing: '0.01em',
                                }}>
                                  {p.detalhe.local_nome}
                                </p>
                              )}
                              {/* Description */}
                              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                                {p.content}
                              </p>
                            </div>
                            {/* Details toggle */}
                            {hasDetail && (
                              <button
                                onClick={() => togglePeriod(p.key)}
                                style={{
                                  flexShrink: 0,
                                  background: isExpanded ? 'var(--gold-dim)' : 'rgba(255,255,255,0.04)',
                                  border: `1px solid ${isExpanded ? 'var(--gold-border)' : 'var(--border)'}`,
                                  borderRadius: 6, cursor: 'pointer',
                                  fontSize: 11, color: isExpanded ? 'var(--gold)' : 'var(--text-muted)',
                                  fontWeight: 600, padding: '4px 10px',
                                  transition: 'all 0.15s',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {isExpanded ? '▲ Fechar' : '▼ Detalhes'}
                              </button>
                            )}
                          </div>
                          {isExpanded && p.detalhe && (
                            <PeriodDetailPanel detail={p.detalhe} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Overspend warning + reoptimize ──────────────────────────────── */}
      {overBudget && (
        <div style={{
          background: 'var(--danger-bg)',
          border: '1px solid var(--danger-border)',
          borderRadius: 12,
          padding: '20px 24px',
          marginBottom: 24,
        }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--danger)', marginBottom: 8 }}>
            ⚠️ Orçamento ultrapassado em R$ {Math.abs(diff).toLocaleString('pt-BR')}
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
            Tente reotimizar para que o concierge refaça o roteiro dentro do seu orçamento,
            priorizando as opções mais econômicas.
          </p>
          <button className="btn-gold" onClick={onReoptimize}>
            🔄 Reotimizar roteiro
          </button>
        </div>
      )}

      {!overBudget && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button className="btn-ghost" onClick={onReoptimize} style={{ fontSize: 13 }}>
            🔄 Gerar nova sugestão de roteiro
          </button>
        </div>
      )}
    </div>
  );
}

const summaryCard: React.CSSProperties = {
  background: 'var(--bg-card)',
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: 'var(--border)',
  borderRadius: 12,
  padding: '20px',
};

const summaryLabel: React.CSSProperties = {
  fontSize: 12,
  color: 'var(--text-muted)',
  marginBottom: 8,
  fontWeight: 500,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
};

const summaryValue: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 26,
  fontWeight: 400,
  letterSpacing: '-0.01em',
};
