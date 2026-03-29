import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Lead, CreateLeadDto, UpdateLeadDto, EtapaLead } from '../models/lead.model';

@Injectable({ providedIn: 'root' })
export class LeadsService {
  private leads: Lead[] = [
    { id: '1', nome: 'João Silva', empresa: 'Empresa A', contato: 'joao@a.com', valorEstimado: 10000, etapa: 'novo', createdAt: new Date().toISOString() },
    { id: '2', nome: 'Maria Souza', empresa: 'Tech B', contato: 'maria@b.com', valorEstimado: 25000, etapa: 'proposta', createdAt: new Date().toISOString() },
    { id: '3', nome: 'Carlos Neves', empresa: 'Serviços C', contato: 'carlos@c.com', valorEstimado: 8000, etapa: 'contato', createdAt: new Date().toISOString() }
  ];

  getAll(): Observable<Lead[]> {
    return of([...this.leads]).pipe(delay(300));
  }

  getById(id: string): Observable<Lead> {
    const lead = this.leads.find(l => l.id === id);
    if (!lead) return throwError(() => new Error('Lead não encontrado'));
    return of({...lead}).pipe(delay(300));
  }

  create(dto: CreateLeadDto): Observable<Lead> {
    const newLead: Lead = {
      id: Math.random().toString(36).substring(2, 9),
      nome: dto.nome,
      empresa: dto.empresa,
      contato: dto.contato,
      valorEstimado: dto.valorEstimado,
      etapa: dto.etapa || 'novo',
      createdAt: new Date().toISOString()
    };
    this.leads.push(newLead);
    return of({...newLead}).pipe(delay(300));
  }

  update(id: string, dto: UpdateLeadDto): Observable<Lead> {
    const index = this.leads.findIndex(l => l.id === id);
    if (index === -1) return throwError(() => new Error('Lead não encontrado'));
    const updated = { ...this.leads[index], ...dto };
    this.leads[index] = updated;
    return of({...updated}).pipe(delay(300));
  }

  updateEtapa(id: string, etapa: EtapaLead): Observable<Lead> {
    return this.update(id, { etapa });
  }

  delete(id: string): Observable<{ message: string; id: string }> {
    this.leads = this.leads.filter(l => l.id !== id);
    return of({ message: 'Lead excluído', id }).pipe(delay(300));
  }
}
