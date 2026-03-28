import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Lead, CreateLeadDto, UpdateLeadDto, EtapaLead } from '../models/lead.model';

@Injectable({ providedIn: 'root' })
export class LeadsService extends ApiService {

  getAll(): Observable<Lead[]> {
    return this.http.get<Lead[]>(`${this.baseUrl}/leads`)
      .pipe(catchError(this.handleError));
  }

  getById(id: string): Observable<Lead> {
    return this.http.get<Lead>(`${this.baseUrl}/leads/${id}`)
      .pipe(catchError(this.handleError));
  }

  create(dto: CreateLeadDto): Observable<Lead> {
    return this.http.post<Lead>(`${this.baseUrl}/leads`, dto)
      .pipe(catchError(this.handleError));
  }

  update(id: string, dto: UpdateLeadDto): Observable<Lead> {
    return this.http.patch<Lead>(`${this.baseUrl}/leads/${id}`, dto)
      .pipe(catchError(this.handleError));
  }

  updateEtapa(id: string, etapa: EtapaLead): Observable<Lead> {
    return this.update(id, { etapa });
  }

  delete(id: string): Observable<{ message: string; id: string }> {
    return this.http.delete<{ message: string; id: string }>(`${this.baseUrl}/leads/${id}`)
      .pipe(catchError(this.handleError));
  }
}
