import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  protected readonly baseUrl = environment.apiUrl;

  constructor(protected http: HttpClient) {}

  protected handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'Erro desconhecido';

    if (error.error instanceof ErrorEvent) {
      message = `Erro de rede: ${error.error.message}`;
    } else {
      message = error.error?.error || error.message || `Erro ${error.status}`;
    }

    console.error('API Error:', error);
    return throwError(() => new Error(message));
  }
}
