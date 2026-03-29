// === Lead Model ===

export type EtapaLead =
  | 'novo'
  | 'contato'
  | 'proposta'
  | 'negociacao'
  | 'fechado'
  | 'perdido';

export interface Lead {
  id: string;
  nome: string;
  empresa: string;
  contato: string;
  valorEstimado: number;
  etapa: EtapaLead;
  createdAt: string;
}

export interface CreateLeadDto {
  nome: string;
  empresa: string;
  contato: string;
  valorEstimado: number;
  etapa?: EtapaLead;
}

export interface UpdateLeadDto {
  nome?: string;
  empresa?: string;
  contato?: string;
  valorEstimado?: number;
  etapa?: EtapaLead;
}

// Configurações de cada etapa do kanban
export interface EtapaConfig {
  id: EtapaLead;
  label: string;
  icon: string;
  cor: string;
  corFundo: string;
}

export const ETAPAS_CONFIG: EtapaConfig[] = [
  { id: 'novo',        label: 'Novo Lead',    icon: 'fiber_new',        cor: '#1565c0', corFundo: '#e3f2fd' },
  { id: 'contato',     label: 'Contato',      icon: 'phone_in_talk',    cor: '#6a1b9a', corFundo: '#f3e5f5' },
  { id: 'proposta',    label: 'Proposta',     icon: 'description',      cor: '#f57f17', corFundo: '#fff8e1' },
  { id: 'negociacao',  label: 'Negociação',   icon: 'handshake',        cor: '#2e7d32', corFundo: '#e8f5e9' },
  { id: 'fechado',     label: 'Fechado',      icon: 'check_circle',     cor: '#00695c', corFundo: '#e0f2f1' },
  { id: 'perdido',     label: 'Perdido',      icon: 'cancel',           cor: '#880e4f', corFundo: '#fce4ec' },
];
