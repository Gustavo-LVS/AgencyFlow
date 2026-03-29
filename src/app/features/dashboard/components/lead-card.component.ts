import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { Lead } from '../../../core/models/lead.model';

@Component({
  selector: 'app-lead-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatMenuModule,
  ],
  template: `
    <mat-card class="lead-card" [class.dragging]="isDragging">
      <div class="card-header">
        <div class="avatar" [style.background]="getAvatarColor()">
          {{ getInitials() }}
        </div>
        <div class="card-info">
          <h4 class="lead-nome">{{ lead.nome }}</h4>
          <span class="lead-empresa">
            <mat-icon class="empresa-icon">business</mat-icon>
            {{ lead.empresa }}
          </span>
        </div>

        <button mat-icon-button [matMenuTriggerFor]="menu"
                class="card-menu-btn"
                (click)="$event.stopPropagation()">
          <mat-icon>more_vert</mat-icon>
        </button>

        <mat-menu #menu="matMenu">
          <button mat-menu-item (click)="onCriarProposta()">
            <mat-icon>description</mat-icon>
            <span>Gerar Proposta</span>
          </button>
          <button mat-menu-item (click)="onVerPropostas()">
            <mat-icon>folder_open</mat-icon>
            <span>Ver Propostas</span>
          </button>
          <button mat-menu-item (click)="onDelete()" class="delete-option">
            <mat-icon color="warn">delete</mat-icon>
            <span style="color: #c62828">Remover Lead</span>
          </button>
        </mat-menu>
      </div>

      <div class="card-footer">
        <div class="valor-badge">
          <mat-icon class="valor-icon">attach_money</mat-icon>
          <span>{{ lead.valorEstimado | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}</span>
        </div>

        <div class="contato-badge" [matTooltip]="lead.contato">
          <mat-icon class="contato-icon">contact_mail</mat-icon>
        </div>
      </div>
    </mat-card>
  `,
  styles: [`
    .lead-card {
      padding: 14px;
      cursor: grab;
      border-radius: 10px !important;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08) !important;
      transition: box-shadow 0.2s, transform 0.15s;
      background: #fff;
      border-left: 3px solid transparent;

      &:hover {
        box-shadow: 0 4px 16px rgba(0,0,0,0.13) !important;
        transform: translateY(-1px);
      }

      &.dragging {
        cursor: grabbing;
      }
    }

    .card-header {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 10px;
    }

    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 13px;
      font-weight: 700;
      flex-shrink: 0;
      letter-spacing: 0.5px;
    }

    .card-info {
      flex: 1;
      min-width: 0;
    }

    .lead-nome {
      margin: 0 0 3px;
      font-size: 14px;
      font-weight: 600;
      color: #1a1a2e;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .lead-empresa {
      display: flex;
      align-items: center;
      gap: 3px;
      font-size: 12px;
      color: #666;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .empresa-icon {
      font-size: 12px;
      width: 12px;
      height: 12px;
      color: #999;
    }

    .card-menu-btn {
      width: 28px;
      height: 28px;
      line-height: 28px;
      flex-shrink: 0;
      margin-top: -4px;
      margin-right: -8px;

      mat-icon { font-size: 18px; color: #999; }
    }

    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .valor-badge {
      display: flex;
      align-items: center;
      gap: 2px;
      font-size: 13px;
      font-weight: 700;
      color: #2e7d32;
      background: #f1f8e9;
      padding: 3px 8px;
      border-radius: 20px;
    }

    .valor-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .contato-badge {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      .contato-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
        color: #777;
      }
    }

    .delete-option mat-icon { color: #c62828; }
  `]
})
export class LeadCardComponent {
  @Input() lead!: Lead;
  @Input() isDragging = false;

  @Output() criarProposta = new EventEmitter<Lead>();
  @Output() verPropostas = new EventEmitter<Lead>();
  @Output() delete = new EventEmitter<Lead>();

  private readonly CORES_AVATAR = [
    '#3f51b5', '#7c4dff', '#00897b', '#e91e63',
    '#ff5722', '#1976d2', '#388e3c', '#f57c00',
  ];

  getInitials(): string {
    return this.lead.nome
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }

  getAvatarColor(): string {
    let hash = 0;
    for (const c of this.lead.nome) hash = c.charCodeAt(0) + ((hash << 5) - hash);
    return this.CORES_AVATAR[Math.abs(hash) % this.CORES_AVATAR.length];
  }

  onCriarProposta(): void { this.criarProposta.emit(this.lead); }
  onVerPropostas(): void { this.verPropostas.emit(this.lead); }
  onDelete(): void { this.delete.emit(this.lead); }
}
