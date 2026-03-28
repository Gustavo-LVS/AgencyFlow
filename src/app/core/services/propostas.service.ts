import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Proposta, CreatePropostaDto, StatusProposta } from '../models/proposta.model';

@Injectable({ providedIn: 'root' })
export class PropostasService extends ApiService {

  create(dto: CreatePropostaDto): Observable<Proposta> {
    return this.http.post<Proposta>(`${this.baseUrl}/propostas`, dto)
      .pipe(catchError(this.handleError));
  }

  getByLeadId(leadId: string): Observable<Proposta[]> {
    return this.http.get<Proposta[]>(`${this.baseUrl}/propostas/${leadId}`)
      .pipe(catchError(this.handleError));
  }

  updateStatus(id: string, status: StatusProposta): Observable<Proposta> {
    return this.http.patch<Proposta>(`${this.baseUrl}/propostas/${id}/status`, { status })
      .pipe(catchError(this.handleError));
  }
}
