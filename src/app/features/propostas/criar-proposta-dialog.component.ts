import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder, FormGroup, Validators, ReactiveFormsModule
} from '@angular/forms';
import {
  MatDialogModule, MatDialogRef, MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';

import { PropostasService } from '../../../core/services/propostas.service';
import { NotificationService } from '../../../core/services/notification.service';
import {
  CreatePropostaDto, TIPOS_SERVICO_OPTIONS, TipoServico, Complexidade
} from '../../../core/models/proposta.model';
import { Lead } from '../../../core/models/lead.model';

export interface CriarPropostaDialogData {
  lead: Lead;
}

@Component({
  selector: 'app-criar-proposta-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
    MatCardModule,
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <div class="header-icon">
          <mat-icon>description</mat-icon>
        </div>
        <div>
          <h2 mat-dialog-title>Gerar Proposta</h2>
          <p class="subtitle">Para: <strong>{{ data.lead.nome }}</strong> · {{ data.lead.empresa }}</p>
        </div>
      </div>

      <mat-dialog-content>
        <form [formGroup]="form" class="proposta-form">

          <!-- Serviços -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Serviços</mat-label>
            <mat-select formControlName="servicos" multiple>
              <mat-option *ngFor="let s of tiposServico" [value]="s.value">
                <mat-icon class="option-icon">{{ s.icon }}</mat-icon>
                {{ s.label }}
              </mat-option>
            </mat-select>
            <mat-hint>Selecione um ou mais serviços</mat-hint>
            <mat-error *ngIf="form.get('servicos')?.hasError('required')">
              Selecione ao menos um serviço
            </mat-error>
          </mat-form-field>

          <div class="two-cols">
            <!-- Investimento base -->
            <mat-form-field appearance="outline">
              <mat-label>Investimento base (R$)</mat-label>
              <input matInput type="number" formControlName="investimento"
                     placeholder="0,00" min="100">
              <span matTextPrefix>R$&nbsp;</span>
              <mat-error *ngIf="form.get('investimento')?.hasError('required')">Obrigatório</mat-error>
              <mat-error *ngIf="form.get('investimento')?.hasError('min')">Mínimo R$ 100</mat-error>
            </mat-form-field>

            <!-- Complexidade -->
            <mat-form-field appearance="outline">
              <mat-label>Complexidade</mat-label>
              <mat-select formControlName="complexidade">
                <mat-option value="basico">
                  <mat-icon class="option-icon level-basico">looks_one</mat-icon>
                  Básico (×1.0)
                </mat-option>
                <mat-option value="intermediario">
                  <mat-icon class="option-icon level-inter">looks_two</mat-icon>
                  Intermediário (×1.4)
                </mat-option>
                <mat-option value="avancado">
                  <mat-icon class="option-icon level-avanc">looks_3</mat-icon>
                  Avançado (×1.8)
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <!-- Preview de valor estimado -->
          <div class="valor-preview" *ngIf="valorEstimado > 0">
            <mat-icon>calculate</mat-icon>
            <div>
              <span class="preview-label">Valor estimado da proposta:</span>
              <span class="preview-valor">{{ valorEstimado | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
            </div>
          </div>

        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="cancelar()" [disabled]="loading">
          Cancelar
        </button>
        <button mat-raised-button color="primary"
                (click)="gerar()"
                [disabled]="form.invalid || loading"
                class="gerar-btn">
          <mat-spinner *ngIf="loading" diameter="18"></mat-spinner>
          <mat-icon *ngIf="!loading">auto_awesome</mat-icon>
          {{ loading ? 'Gerando...' : 'Gerar Proposta' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container { min-width: 500px; }

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
      background: linear-gradient(135deg, #f57f17, #ff8f00);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      mat-icon { color: white; font-size: 24px; width: 24px; height: 24px; }
    }

    h2 { margin: 0; font-size: 20px; font-weight: 600; }
    .subtitle { margin: 2px 0 0; font-size: 13px; color: #666; }

    mat-dialog-content { padding: 20px 24px !important; }

    .proposta-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .full-width { width: 100%; }

    .two-cols {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .option-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      margin-right: 8px;
      vertical-align: middle;
    }

    .level-basico { color: #43a047; }
    .level-inter  { color: #fb8c00; }
    .level-avanc  { color: #e53935; }

    .valor-preview {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 10px;
      background: linear-gradient(135deg, #e8f5e9, #f1f8e9);
      border: 1px solid #c8e6c9;

      mat-icon { color: #2e7d32; }

      .preview-label {
        display: block;
        font-size: 12px;
        color: #555;
        margin-bottom: 2px;
      }

      .preview-valor {
        display: block;
        font-size: 20px;
        font-weight: 700;
        color: #1b5e20;
      }
    }

    mat-dialog-actions {
      padding: 8px 24px 20px !important;
      gap: 8px;
    }

    .gerar-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 150px;
    }

    @media (max-width: 540px) {
      .dialog-container { min-width: unset; }
      .two-cols { grid-template-columns: 1fr; }
    }
  `]
})
export class CriarPropostaDialogComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  tiposServico = TIPOS_SERVICO_OPTIONS;

  readonly MULTIPLICADORES: Record<Complexidade, number> = {
    basico: 1.0,
    intermediario: 1.4,
    avancado: 1.8,
  };

  get valorEstimado(): number {
    const { investimento, complexidade, servicos } = this.form?.value || {};
    if (!investimento || investimento <= 0) return 0;
    const mult = this.MULTIPLICADORES[complexidade as Complexidade] ?? 1;
    const qtd = Array.isArray(servicos) ? servicos.length : 1;
    const bonus = qtd > 1 ? (qtd - 1) * 0.15 : 0;
    return Math.round(investimento * mult * (1 + bonus));
  }

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CriarPropostaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CriarPropostaDialogData,
    private propostasService: PropostasService,
    private notification: NotificationService,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      servicos: [[], [Validators.required]],
      investimento: [
        this.data.lead.valorEstimado || null,
        [Validators.required, Validators.min(100)]
      ],
      complexidade: ['intermediario'],
    });
  }

  gerar(): void {
    if (this.form.invalid) return;
    this.loading = true;

    const dto: CreatePropostaDto = {
      leadId: this.data.lead.id,
      servicos: this.form.value.servicos as TipoServico[],
      investimento: this.form.value.investimento,
      complexidade: this.form.value.complexidade as Complexidade,
    };

    this.propostasService.create(dto).subscribe({
      next: (proposta) => {
        this.notification.success('Proposta gerada com sucesso!');
        this.dialogRef.close(proposta);
      },
      error: (err) => {
        this.notification.error(err.message || 'Erro ao gerar proposta');
        this.loading = false;
      },
    });
  }

  cancelar(): void {
    this.dialogRef.close(null);
  }
}
