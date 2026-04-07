export type TripProfile = 'solo' | 'casal' | 'familia' | 'grupo';

export type TripType =
  | 'ferias'
  | 'aventura'
  | 'gastronomico'
  | 'romantico'
  | 'cultural'
  | 'show'
  | 'negocios';

export interface TripConfig {
  destination: string;
  checkIn: string;
  checkOut: string;
  people: number;
  profile: TripProfile;
  types: TripType[];
  budget?: number;
}

// ── API response types ─────────────────────────────────────────────────────

export interface Accommodation {
  nome: string;
  tipo: string;
  diaria: number;
  descricao: string;
  perfil_ideal: string;
  destaque?: string;
  foto_url?: string | null;
  website?: string | null;
  site_oficial?: string | null;
  telefone?: string | null;
  rating?: number | null;
  fonte_preco?: string | null;
}

export interface Restaurant {
  nome: string;
  cozinha: string;
  preco_por_pessoa: number;
  prato_estrela: string;
  horario: string;
  descricao: string;
  foto_url?: string | null;
  website?: string | null;
  site_oficial?: string | null;
  telefone?: string | null;
  rating?: number | null;
  fonte_preco?: string | null;
}

export interface Attraction {
  nome: string;
  preco: number;
  duracao: string;
  perfil_ideal: string;
  descricao: string;
  foto_url?: string | null;
  website?: string | null;
  site_oficial?: string | null;
  telefone?: string | null;
  rating?: number | null;
  fonte_preco?: string | null;
}

export interface Event {
  nome: string;
  data: string;
  preco: number;
  local: string;
  descricao: string;
  foto_url?: string | null;
  site_oficial?: string | null;
  telefone?: string | null;
  fonte_preco?: string | null;
}

export interface Transport {
  tipo: string;
  nome: string;
  descricao: string;
  valor: number;
  site_oficial?: string | null;
  telefone?: string | null;
}

export interface SpecialExperience {
  nome: string;
  preco_por_pessoa: number;
  duracao: string;
  descricao: string;
  foto_url?: string | null;
  website?: string | null;
  site_oficial?: string | null;
  telefone?: string | null;
  rating?: number | null;
  fonte_preco?: string | null;
}

export interface PeriodDish {
  nome: string;
  descricao?: string;
  preco: number;
}

export interface PeriodDetail {
  local_nome?: string;
  pratos?: PeriodDish[];
  distancia_hotel?: string;
  tarifa_taxi?: number;
}

export interface DayItinerary {
  dia: number;
  data: string;
  manha: string;
  tarde: string;
  noite: string;
  custo_estimado: number;
  manha_detalhe?: PeriodDetail;
  tarde_detalhe?: PeriodDetail;
  noite_detalhe?: PeriodDetail;
}

export interface BudgetBreakdown {
  hospedagem: number;
  alimentacao: number;
  passeios: number;
  transporte: number;
  eventos: number;
  experiencias: number;
  total: number;
}

export interface ConciergeResponse {
  destino: string;
  clima_estimado: string;
  descricao_destino: string;
  hospedagem: Accommodation[];
  restaurantes: Restaurant[];
  atracoes: Attraction[];
  eventos: Event[];
  transporte: Transport[];
  experiencias: SpecialExperience[];
  roteiro_dia_a_dia?: DayItinerary[];
  resumo_orcamento?: BudgetBreakdown;
  dica_concierge?: string;
}

// ── Place Detail (extracted from official site via Tavily + Gemini) ────────

export interface PlaceDetailRoom {
  tipo: string;
  preco: number;
  descricao: string;
  capacidade?: string;
}

export interface PlaceDetailMenuItem {
  nome: string;
  descricao: string;
  preco: number;
}

export interface PlaceDetailMenuSection {
  secao: string;
  itens: PlaceDetailMenuItem[];
}

export interface PlaceDetailTicket {
  tipo: string;
  preco: number;
  descricao: string;
}

export interface PlaceDetail {
  nome: string;
  site_oficial: string | null;
  telefone?: string | null;
  endereco?: string | null;
  horario?: string | null;
  descricao_completa?: string | null;
  fotos?: string[];
  // hotel
  quartos?: PlaceDetailRoom[];
  comodidades?: string[];
  checkin?: string;
  checkout?: string;
  // restaurante
  menu?: PlaceDetailMenuSection[];
  // atracao / evento / experiencia
  ingressos?: PlaceDetailTicket[];
  duracao?: string;
  como_chegar?: string;
  // social / maps
  instagram_url?: string | null;
  google_maps_url?: string | null;
  // source marker for disclaimer
  source?: 'official' | 'knowledge';
  // raw fallback
  raw_info?: string;
}

// ── Itinerary item (sidebar) ───────────────────────────────────────────────

export type ItineraryItemType =
  | 'hospedagem'
  | 'restaurante'
  | 'atracao'
  | 'evento'
  | 'transporte'
  | 'experiencia';

export interface ItineraryItem {
  id: string;
  type: ItineraryItemType;
  nome: string;
  preco: number;
  descricao: string;
}
