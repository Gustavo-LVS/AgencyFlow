import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Metrics } from '../models/metrics.model';

@Injectable({ providedIn: 'root' })
export class MetricsService extends ApiService {

  get(): Observable<Metrics> {
    return this.http.get<Metrics>(`${this.baseUrl}/metrics`)
      .pipe(catchError(this.handleError));
  }
}
