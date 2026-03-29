import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Metrics } from '../models/metrics.model';
import { LeadsService } from './leads.service';
import { PropostasService } from './propostas.service';

@Injectable({ providedIn: 'root' })
export class MetricsService {
  constructor(
     private leadsService: LeadsService,
     private propostasService: PropostasService
  ) {}

  get(): Observable<Metrics> {
     return new Observable<Metrics>(observer => {
         this.leadsService.getAll().subscribe(leads => {
             const metrics: Metrics = {
               totalLeads: leads.length,
               receitaPrevista: leads.reduce((acc, l) => acc + l.valorEstimado, 0),
               taxaConversao: leads.length ? (leads.filter(l => l.etapa === 'fechado').length / leads.length) * 100 : 0,
               valorPipeline: leads.filter(l => l.etapa !== 'fechado' && l.etapa !== 'perdido').reduce((acc, l) => acc + l.valorEstimado, 0),
               fechados: leads.filter(l => l.etapa === 'fechado').length,
               perdidos: leads.filter(l => l.etapa === 'perdido').length,
               leadsAtivos: leads.filter(l => l.etapa !== 'fechado' && l.etapa !== 'perdido').length,
               totalPropostas: 1, // Mock
               propostasAceitas: 0, // Mock
               porEtapa: { novo: 0, contato: 0, proposta: 0, negociacao: 0, fechado: 0, perdido: 0 },
               valorPorEtapa: { novo: 0, contato: 0, proposta: 0, negociacao: 0, fechado: 0, perdido: 0 }
             };

             leads.forEach(l => {
                 metrics.porEtapa[l.etapa]++;
                 metrics.valorPorEtapa[l.etapa] += l.valorEstimado;
             });

             observer.next(metrics);
             observer.complete();
         });
     }).pipe(delay(300));
  }
}
