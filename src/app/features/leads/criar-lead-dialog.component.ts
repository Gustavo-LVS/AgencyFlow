import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder, FormGroup, Validators, ReactiveFormsModule
} from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { LeadsService } from '../../core/services/leads.service';
import { NotificationService } from '../../core/services/notification.service';
import { CreateLeadDto, EtapaLead, ETAPAS_CONFIG, Lead } from '../../core/models/lead.model';

@Component({
  selector: 'app-criar-lead-dialog',
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
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <div class="header-icon">
          <mat-icon>person_add</mat-icon>
        </div>
        <div>
          <h2 mat-dialog-title>Novo Lead</h2>
          <p class="subtitle">Adicione um novo lead ao funil</p>
        </div>
      </div>

      <mat-dialog-content>
        <form [formGroup]="form" class="lead-form">
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Nome completo</mat-label>
              <input matInput formControlName="nome" placeholder="Ex: João Silva">
              <mat-icon matPrefix>person</mat-icon>
              <mat-error *ngIf="form.get('nome')?.hasError('required')">Nome é obrigatório</mat-error>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Empresa</mat-label>
              <input matInput formControlName="empresa" placeholder="Ex: Empresa LTDA">
              <mat-icon matPrefix>business</mat-icon>
              <mat-error *ngIf="form.get('empresa')?.hasError('required')">Empresa é obrigatória</mat-error>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Contato (e-mail ou telefone)</mat-label>
              <input matInput formControlName="contato" placeholder="Ex: joao@empresa.com">
              <mat-icon matPrefix>contact_mail</mat-icon>
              <mat-error *ngIf="form.get('contato')?.hasError('required')">Contato é obrigatório</mat-error>
            </mat-form-field>
          </div>

          <div class="form-row two-cols">
            <mat-form-field appearance="outline">
              <mat-label>Valor estimado (R$)</mat-label>
              <input matInput type="number" formControlName="valorEstimado"
                     placeholder="0,00" min="0">
              <span matTextPrefix>R$&nbsp;</span>
              <mat-error *ngIf="form.get('valorEstimado')?.hasError('min')">Valor inválido</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Etapa inicial</mat-label>
              <mat-select formControlName="etapa">
                <mat-option *ngFor="let etapa of etapas" [value]="etapa.id">
                  <mat-icon [style.color]="etapa.cor">{{ etapa.icon }}</mat-icon>
                  {{ etapa.label }}
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="cancelar()" [disabled]="loading">
          Cancelar
        </button>
        <button mat-raised-button color="primary"
                (click)="salvar()"
                [disabled]="form.invalid || loading"
                class="save-btn">
          <mat-spinner *ngIf="loading" diameter="18"></mat-spinner>
          <mat-icon *ngIf="!loading">check</mat-icon>
          {{ loading ? 'Salvando...' : 'Criar Lead' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      min-width: 480px;
    }

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
      background: linear-gradient(135deg, #3f51b5, #7c4dff);
      display: flex;
      align-items: center;
      justify-content: center;

      mat-icon {
        color: white;
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }

    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #1a1a2e;
    }

    .subtitle {
      margin: 2px 0 0;
      font-size: 13px;
      color: #666;
    }

    mat-dialog-content {
      padding: 20px 24px !important;
    }

    .lead-form {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .form-row {
      width: 100%;

      mat-form-field {
        width: 100%;
      }

      &.two-cols {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
    }

    mat-dialog-actions {
      padding: 8px 24px 20px !important;
      gap: 8px;
    }

    .save-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 130px;
    }

    mat-option mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      margin-right: 8px;
      vertical-align: middle;
    }

    @media (max-width: 540px) {
      .dialog-container { min-width: unset; }
      .form-row.two-cols { grid-template-columns: 1fr; }
    }
  `]
})
export class CriarLeadDialogComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  etapas = ETAPAS_CONFIG;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CriarLeadDialogComponent>,
    private leadsService: LeadsService,
    private notification: NotificationService,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      empresa: ['', [Validators.required, Validators.minLength(2)]],
      contato: ['', [Validators.required]],
      valorEstimado: [0, [Validators.min(0)]],
      etapa: ['novo' as EtapaLead],
    });
  }

  salvar(): void {
    if (this.form.invalid) return;
    this.loading = true;

    const dto: CreateLeadDto = this.form.value;

    this.leadsService.create(dto).subscribe({
      next: (lead: Lead) => {
        this.notification.success(`Lead "${lead.nome}" criado com sucesso!`);
        this.dialogRef.close(lead);
      },
      error: (err: Error) => {
        this.notification.error(err.message || 'Erro ao criar lead');
        this.loading = false;
      },
    });
  }

  cancelar(): void {
    this.dialogRef.close(null);
  }
}
