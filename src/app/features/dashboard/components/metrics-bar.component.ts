import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Metrics } from '../../../core/models/metrics.model';

@Component({
  selector: 'app-metrics-bar',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressBarModule, MatTooltipModule],
  template: `
    <div class="metrics-bar" *ngIf="metrics">
      <div class="metric-card receita">
        <div class="metric-icon">
          <mat-icon>trending_up</mat-icon>
        </div>
        <div class="metric-body">
          <span class="metric-value">
            {{ metrics.receitaPrevista | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}
          </span>
          <span class="metric-label">Receita Prevista</span>
        </div>
      </div>

      <div class="metric-card leads">
        <div class="metric-icon">
          <mat-icon>people</mat-icon>
        </div>
        <div class="metric-body">
          <span class="metric-value">{{ metrics.totalLeads }}</span>
          <span class="metric-label">Total de Leads</span>
        </div>
      </div>

      <div class="metric-card conversao">
        <div class="metric-icon">
          <mat-icon>percent</mat-icon>
        </div>
        <div class="metric-body">
          <div class="metric-value-row">
            <span class="metric-value">{{ metrics.taxaConversao }}%</span>
          </div>
          <span class="metric-label">Taxa de Conversão</span>
          <mat-progress-bar
            mode="determinate"
            [value]="metrics.taxaConversao"
            class="conv-bar"
            [matTooltip]="metrics.fechados + ' fechados de ' + metrics.leadsAtivos + ' ativos'"
          ></mat-progress-bar>
        </div>
      </div>

      <div class="metric-card pipeline">
        <div class="metric-icon">
          <mat-icon>account_balance_wallet</mat-icon>
        </div>
        <div class="metric-body">
          <span class="metric-value">
            {{ metrics.valorPipeline | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}
          </span>
          <span class="metric-label">Valor no Pipeline</span>
        </div>
      </div>

      <div class="metric-card propostas">
        <div class="metric-icon">
          <mat-icon>description</mat-icon>
        </div>
        <div class="metric-body">
          <span class="metric-value">{{ metrics.propostasAceitas }}/{{ metrics.totalPropostas }}</span>
          <span class="metric-label">Propostas Aceitas</span>
        </div>
      </div>
    </div>

    <div class="metrics-skeleton" *ngIf="!metrics">
      <div class="skeleton-card" *ngFor="let i of [1,2,3,4,5]"></div>
    </div>
  `,
  styles: [`
    .metrics-bar {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 24px;
    }

    .metric-card {
      flex: 1;
      min-width: 160px;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 18px;
      border-radius: 12px;
      background: white;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
      transition: box-shadow 0.2s;

      &:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
    }

    .metric-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      mat-icon {
        font-size: 22px;
        width: 22px;
        height: 22px;
        color: white;
      }
    }

    .receita .metric-icon  { background: linear-gradient(135deg, #43a047, #00c853); }
    .leads .metric-icon    { background: linear-gradient(135deg, #1e88e5, #00b0ff); }
    .conversao .metric-icon{ background: linear-gradient(135deg, #8e24aa, #e040fb); }
    .pipeline .metric-icon { background: linear-gradient(135deg, #f57c00, #ffb300); }
    .propostas .metric-icon{ background: linear-gradient(135deg, #00897b, #00e5ff); }

    .metric-body {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .metric-value {
      font-size: 18px;
      font-weight: 700;
      color: #1a1a2e;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .metric-label {
      font-size: 11px;
      color: #888;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 2px;
    }

    .conv-bar {
      margin-top: 6px;
      border-radius: 4px;
      height: 4px;
    }

    /* Skeleton */
    .metrics-skeleton {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    .skeleton-card {
      flex: 1;
      min-width: 160px;
      height: 76px;
      border-radius: 12px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
    }

    @keyframes shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    @media (max-width: 768px) {
      .metric-card { min-width: 140px; }
      .metric-value { font-size: 15px; }
    }
  `]
})
export class MetricsBarComponent {
  @Input() metrics: Metrics | null = null;
}
