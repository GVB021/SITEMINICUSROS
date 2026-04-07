import { useEffect } from 'react';
import type { PlaceDetail, ItineraryItemType } from '../types';

interface Props {
  nome: string;
  categoria: ItineraryItemType;
  siteOficial: string | null;
  telefone?: string | null;
  detail: PlaceDetail | null;
  loading: boolean;
  onClose: () => void;
}

export default function PlaceDetailModal({
  nome,
  categoria,
  siteOficial,
  telefone,
  detail,
  loading,
  onClose,
}: Props) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const categoryLabels: Record<ItineraryItemType, string> = {
    hospedagem:  'Hospedagem',
    restaurante: 'Restaurante',
    atracao:     'Atração',
    evento:      'Evento',
    transporte:  'Transporte',
    experiencia: 'Experiência',
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '24px 16px', overflowY: 'auto',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          width: '100%', maxWidth: 720,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 16, overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          marginTop: 16,
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16,
          background: 'var(--bg-card)',
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{
                fontSize: 11, fontWeight: 600, color: 'var(--gold)',
                background: 'var(--gold-dim)', padding: '2px 8px', borderRadius: 4,
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                {categoryLabels[categoria]}
              </span>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: 8 }}>
              {nome}
            </h2>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {siteOficial && (
                <a href={siteOficial} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 12.5, color: 'var(--teal)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
                  🌐 Site oficial
                </a>
              )}
              {(detail?.telefone || telefone) && (
                <a href={`tel:${detail?.telefone || telefone}`}
                  style={{ fontSize: 12.5, color: 'var(--teal)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                  📞 {detail?.telefone || telefone}
                </a>
              )}
              {detail?.endereco && (
                <span style={{ fontSize: 12.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  📍 {detail.endereco}
                </span>
              )}
              {detail?.horario && (
                <span style={{ fontSize: 12.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  🕐 {detail.horario}
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'transparent', border: '1px solid var(--border)',
            borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: 18, lineHeight: 1,
            flexShrink: 0,
          }}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>

          {/* Loading state */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🔍</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 8 }}>
                Buscando informações no site oficial...
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                Tavily está extraindo o conteúdo, Gemini está organizando os dados
              </p>
            </div>
          )}

          {/* Error / no detail */}
          {!loading && !detail && (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 16 }}>
                Não foi possível extrair detalhes automaticamente.
              </p>
              {siteOficial && (
                <a href={siteOficial} target="_blank" rel="noopener noreferrer"
                  className="btn-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  🌐 Acessar site oficial
                </a>
              )}
            </div>
          )}

          {/* Detail content */}
          {!loading && detail && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Description */}
              {detail.descricao_completa && (
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                  {detail.descricao_completa}
                </p>
              )}

              {/* Raw fallback info */}
              {detail.raw_info && !detail.quartos?.length && !detail.menu?.length && !detail.ingressos?.length && (
                <div style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 10, padding: '16px',
                }}>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                    {detail.raw_info}
                  </p>
                  {siteOficial && (
                    <a href={siteOficial} target="_blank" rel="noopener noreferrer"
                      style={{ marginTop: 12, display: 'inline-flex', fontSize: 12.5, color: 'var(--teal)', textDecoration: 'none', fontWeight: 500 }}>
                      Ver site oficial →
                    </a>
                  )}
                </div>
              )}

              {/* Photos */}
              {(detail.fotos?.length ?? 0) > 0 && (
                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                    Fotos
                  </h4>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {detail.fotos!.map((url, i) => (
                      <img key={i} src={url} alt={`Foto ${i + 1}`}
                        style={{ width: 160, height: 110, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }}
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* HOTEL: Quartos */}
              {(detail.quartos?.length ?? 0) > 0 && (
                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                    Tipos de Quarto
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {detail.quartos!.map((q, i) => (
                      <div key={i} style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        borderRadius: 10, padding: '14px 16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                      }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{q.tipo}</p>
                          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', margin: 0 }}>{q.descricao}</p>
                          {q.capacidade && <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>👥 {q.capacidade}</p>}
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--gold)', margin: 0 }}>
                            R$ {q.preco.toLocaleString('pt-BR')}
                          </p>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>/noite</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {(detail.checkin || detail.checkout) && (
                    <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                      {detail.checkin && <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>✅ Check-in: {detail.checkin}</span>}
                      {detail.checkout && <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>🔑 Check-out: {detail.checkout}</span>}
                    </div>
                  )}
                </div>
              )}

              {/* HOTEL: Comodidades */}
              {(detail.comodidades?.length ?? 0) > 0 && (
                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                    Comodidades
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {detail.comodidades!.map((c, i) => (
                      <span key={i} style={{
                        fontSize: 12.5, color: 'var(--text-secondary)',
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        borderRadius: 6, padding: '4px 10px',
                      }}>✓ {c}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* RESTAURANTE: Menu */}
              {(detail.menu?.length ?? 0) > 0 && (
                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                    Cardápio
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {detail.menu!.map((section, si) => (
                      <div key={si}>
                        <p style={{
                          fontSize: 13, fontWeight: 700, color: 'var(--gold-light)',
                          textTransform: 'uppercase', letterSpacing: '0.04em',
                          marginBottom: 10, paddingBottom: 8,
                          borderBottom: '1px solid var(--border)',
                        }}>
                          {section.secao}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {section.itens.map((item, ii) => (
                            <div key={ii} style={{
                              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12,
                            }}>
                              <div style={{ flex: 1 }}>
                                <p style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>{item.nome}</p>
                                {item.descricao && <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{item.descricao}</p>}
                              </div>
                              {item.preco > 0 && (
                                <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--gold)', flexShrink: 0 }}>
                                  R$ {item.preco.toLocaleString('pt-BR')}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ATRACAO / EVENTO / EXPERIENCIA: Ingressos */}
              {(detail.ingressos?.length ?? 0) > 0 && (
                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                    Ingressos / Pacotes
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {detail.ingressos!.map((t, i) => (
                      <div key={i} style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        borderRadius: 10, padding: '14px 16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                      }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{t.tipo}</p>
                          {t.descricao && <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{t.descricao}</p>}
                        </div>
                        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--gold)', flexShrink: 0 }}>
                          {t.preco > 0 ? `R$ ${t.preco.toLocaleString('pt-BR')}` : 'Gratuito'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Duration + how to get there */}
              {(detail.duracao || detail.como_chegar) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {detail.duracao && (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 13 }}>⏱️</span>
                      <span style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>Duração:</strong> {detail.duracao}
                      </span>
                    </div>
                  )}
                  {detail.como_chegar && (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 13, marginTop: 2 }}>🗺️</span>
                      <span style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        <strong style={{ color: 'var(--text-primary)' }}>Como chegar:</strong> {detail.como_chegar}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* CTA */}
              {siteOficial && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  {(detail.telefone || telefone) && (
                    <a href={`tel:${detail.telefone || telefone}`}
                      className="btn-ghost"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                      📞 Ligar para reserva
                    </a>
                  )}
                  <a href={siteOficial} target="_blank" rel="noopener noreferrer"
                    className="btn-gold"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                    🌐 Ver no site oficial
                  </a>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
