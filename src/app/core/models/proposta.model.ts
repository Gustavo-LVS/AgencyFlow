export type StatusProposta = 'rascunho' | 'enviada' | 'aceita' | 'recusada';

export type TipoServico =
  | 'redes-sociais'
  | 'trafego-pago'
  | 'seo'
  | 'branding'
  | 'email-marketing'
  | 'inbound'
  | 'consultoria'
  | 'full-service';

export type Complexidade = 'basico' | 'intermediario' | 'avancado';

export interface Proposta {
  id: string;
  leadId: string;
  servicos: TipoServico[];
  valor: number;
  descricao: string;
  status: StatusProposta;
  createdAt: string;
}

export interface CreatePropostaDto {
  leadId: string;
  servicos: TipoServico[];
  investimento: number;
  complexidade: Complexidade;
}

export interface TipoServicoOption {
  value: TipoServico;
  label: string;
  icon: string;
}

export const TIPOS_SERVICO_OPTIONS: TipoServicoOption[] = [
  { value: 'redes-sociais',   label: 'Gestão de Redes Sociais',        icon: 'share' },
  { value: 'trafego-pago',    label: 'Tráfego Pago (Meta/Google Ads)', icon: 'ads_click' },
  { value: 'seo',             label: 'SEO e Marketing de Conteúdo',    icon: 'search' },
  { value: 'branding',        label: 'Identidade Visual e Branding',   icon: 'palette' },
  { value: 'email-marketing', label: 'E-mail Marketing',               icon: 'email' },
  { value: 'inbound',         label: 'Inbound Marketing',              icon: 'hub' },
  { value: 'consultoria',     label: 'Consultoria em Marketing',       icon: 'lightbulb' },
  { value: 'full-service',    label: 'Full Service Marketing Digital', icon: 'rocket_launch' },
];

export const STATUS_PROPOSTA_CONFIG: Record<StatusProposta, { label: string; cor: string }> = {
  rascunho: { label: 'Rascunho', cor: '#757575' },
  enviada:  { label: 'Enviada',  cor: '#1565c0' },
  aceita:   { label: 'Aceita',   cor: '#2e7d32' },
  recusada: { label: 'Recusada', cor: '#c62828' },
};
