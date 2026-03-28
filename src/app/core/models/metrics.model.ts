import { EtapaLead } from './lead.model';

export interface Metrics {
  totalLeads: number;
  receitaPrevista: number;
  taxaConversao: number;
  valorPipeline: number;
  fechados: number;
  perdidos: number;
  leadsAtivos: number;
  totalPropostas: number;
  propostasAceitas: number;
  porEtapa: Record<EtapaLead, number>;
  valorPorEtapa: Record<EtapaLead, number>;
}
