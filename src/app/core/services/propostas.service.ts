import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Proposta, CreatePropostaDto, StatusProposta } from '../models/proposta.model';

@Injectable({ providedIn: 'root' })
export class PropostasService {
  private propostas: Proposta[] = [
    { id: 'p1', leadId: '2', servicos: ['redes-sociais', 'trafego-pago'], valor: 4500, descricao: 'Proposta inicial (Gerada via Simulação)', status: 'enviada', createdAt: new Date().toISOString() }
  ];

  create(dto: CreatePropostaDto): Observable<Proposta> {
    const mult: Record<string, number> = { basico: 1.0, intermediario: 1.4, avancado: 1.8 };
    const multiplier = mult[dto.complexidade] || 1;
    const qtd = dto.servicos.length;
    const bonus = qtd > 1 ? (qtd - 1) * 0.15 : 0;
    const valor = Math.round(dto.investimento * multiplier * (1 + bonus));

    const nova: Proposta = {
      id: Math.random().toString(36).substring(2, 9),
      leadId: dto.leadId,
      servicos: dto.servicos,
      valor,
      descricao: 'Proposta gerada automaticamente',
      status: 'rascunho',
      createdAt: new Date().toISOString()
    };
    this.propostas.push(nova);
    return of({...nova}).pipe(delay(300));
  }

  getByLeadId(leadId: string): Observable<Proposta[]> {
    const list = this.propostas.filter(p => p.leadId === leadId);
    return of([...list]).pipe(delay(300));
  }

  updateStatus(id: string, status: StatusProposta): Observable<Proposta> {
    const index = this.propostas.findIndex(p => p.id === id);
    if (index === -1) return throwError(() => new Error('Não encontrada'));
    this.propostas[index] = { ...this.propostas[index], status };
    return of({...this.propostas[index]}).pipe(delay(300));
  }
}
