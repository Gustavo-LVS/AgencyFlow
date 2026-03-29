import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

import { PropostasService } from '../../core/services/propostas.service';
import { NotificationService } from '../../core/services/notification.service';
import {
  Proposta, StatusProposta, STATUS_PROPOSTA_CONFIG, TIPOS_SERVICO_OPTIONS, TipoServicoOption
} from '../../core/models/proposta.model';
import { Lead } from '../../core/models/lead.model';

@Component({
  selector: 'app-propostas-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatDialogModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatDividerModule, MatProgressSpinnerModule, MatSelectModule,
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <div class="header-icon">
          <mat-icon>folder_open</mat-icon>
        </div>
        <div>
          <h2 mat-dialog-title>Propostas</h2>
          <p class="subtitle">{{ data.lead.nome }} · {{ data.lead.empresa }}</p>
        </div>
      </div>

      <mat-dialog-content>
        <div *ngIf="loading" class="loading-center">
          <mat-spinner diameter="40"></mat-spinner>
        </div>

        <div *ngIf="!loading && propostas.length === 0" class="empty-state">
          <mat-icon>inbox</mat-icon>
          <p>Nenhuma proposta gerada ainda.</p>
        </div>

        <div *ngIf="!loading" class="propostas-list">
          <div *ngFor="let p of propostas; let i = index" class="proposta-item">
            <div class="proposta-header">
              <div class="proposta-num">Proposta #{{ i + 1 }}</div>
              <div class="proposta-valor">
                {{ p.valor | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
              </div>
            </div>

            <div class="servicos-chips">
              <span *ngFor="let s of p.servicos" class="servico-chip">
                <mat-icon class="chip-icon">{{ getServicoIcon(s) }}</mat-icon>
                {{ getServicoLabel(s) }}
              </span>
            </div>

            <p class="proposta-descricao">{{ p.descricao }}</p>

            <div class="proposta-footer">
              <div class="status-select">
                <mat-select [(ngModel)]="p.status"
                            (ngModelChange)="atualizarStatus(p)"
                            class="status-selector"
                            [style.color]="getStatusConfig(p.status).cor">
                  <mat-option value="rascunho">📝 Rascunho</mat-option>
                  <mat-option value="enviada">📤 Enviada</mat-option>
                  <mat-option value="aceita">✅ Aceita</mat-option>
                  <mat-option value="recusada">❌ Recusada</mat-option>
                </mat-select>
              </div>
              <span class="proposta-data">
                {{ p.createdAt | date:'dd/MM/yyyy':'pt-BR' }}
              </span>
            </div>

            <mat-divider *ngIf="i < propostas.length - 1" style="margin-top: 16px;"></mat-divider>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-raised-button (click)="fechar()">Fechar</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container { min-width: 520px; }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 24px 24px 0;
    }

    .header-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: linear-gradient(135deg, #00897b, #26c6da);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      mat-icon { color: white; font-size: 24px; width: 24px; height: 24px; }
    }

    h2 { margin: 0; font-size: 20px; font-weight: 600; }
    .subtitle { margin: 2px 0 0; font-size: 13px; color: #666; }

    mat-dialog-content { padding: 16px 24px !important; max-height: 60vh; }

    .loading-center {
      display: flex;
      justify-content: center;
      padding: 40px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 40px;
      color: #bbb;
      mat-icon { font-size: 48px; width: 48px; height: 48px; }
      p { font-size: 14px; margin: 0; }
    }

    .proposta-item { padding: 4px 0 12px; }

    .proposta-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .proposta-num {
      font-weight: 600;
      font-size: 14px;
      color: #333;
    }

    .proposta-valor {
      font-weight: 700;
      font-size: 18px;
      color: #2e7d32;
    }

    .servicos-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 10px;
    }

    .servico-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 10px;
      border-radius: 20px;
      background: #ede7f6;
      color: #4527a0;
      font-size: 12px;
      font-weight: 500;
    }

    .chip-icon {
      font-size: 12px;
      width: 12px;
      height: 12px;
    }

    .proposta-descricao {
      font-size: 13px;
      color: #555;
      line-height: 1.6;
      white-space: pre-line;
      background: #fafafa;
      border-radius: 8px;
      padding: 10px 12px;
      border-left: 3px solid #7c4dff;
      margin: 0 0 10px;
    }

    .proposta-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .status-select { min-width: 140px; }

    .proposta-data {
      font-size: 12px;
      color: #999;
    }

    mat-dialog-actions { padding: 8px 24px 20px !important; }

    @media (max-width: 560px) {
      .dialog-container { min-width: unset; }
    }
  `]
})
export class PropostasDialogComponent implements OnInit {
  propostas: Proposta[] = [];
  loading = true;

  private readonly tiposMap = new Map<string, TipoServicoOption>(
    TIPOS_SERVICO_OPTIONS.map((t: TipoServicoOption) => [t.value, t] as [string, TipoServicoOption])
  );

  constructor(
    private dialogRef: MatDialogRef<PropostasDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { lead: Lead },
    private propostasService: PropostasService,
    private notification: NotificationService,
  ) {}

  ngOnInit(): void {
    this.propostasService.getByLeadId(this.data.lead.id).subscribe({
      next: (p: Proposta[]) => { this.propostas = p; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  getStatusConfig(status: StatusProposta) {
    return STATUS_PROPOSTA_CONFIG[status] ?? { label: status, cor: '#333' };
  }

  getServicoLabel(value: string): string {
    return this.tiposMap.get(value)?.label ?? value;
  }

  getServicoIcon(value: string): string {
    return this.tiposMap.get(value)?.icon ?? 'star';
  }

  atualizarStatus(proposta: Proposta): void {
    this.propostasService.updateStatus(proposta.id, proposta.status).subscribe({
      next: () => this.notification.success('Status atualizado!'),
      error: (err: Error) => this.notification.error(err.message),
    });
  }

  fechar(): void { this.dialogRef.close(); }
}
