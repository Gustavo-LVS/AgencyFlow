import {
  Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem
} from '@angular/cdk/drag-drop';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

import { LeadsService } from '../../core/services/leads.service';
import { MetricsService } from '../../core/services/metrics.service';
import { NotificationService } from '../../core/services/notification.service';
import { Lead, EtapaLead, ETAPAS_CONFIG } from '../../core/models/lead.model';
import { Metrics } from '../../core/models/metrics.model';

import { MetricsBarComponent } from './components/metrics-bar.component';
import { LeadCardComponent } from './components/lead-card.component';
import { CriarLeadDialogComponent } from '../leads/criar-lead-dialog.component';
import { CriarPropostaDialogComponent } from '../propostas/criar-proposta-dialog.component';
import { PropostasDialogComponent } from '../propostas/propostas-dialog.component';

type KanbanBoard = Record<EtapaLead, Lead[]>;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatBadgeModule,
    MatMenuModule,
    MetricsBarComponent,
    LeadCardComponent,
  ],
  template: `
    <!-- ========== TOOLBAR ========== -->
    <mat-toolbar class="main-toolbar" color="primary">
      <div class="toolbar-inner">
        <div class="brand">
          <div class="brand-icon">
            <mat-icon>rocket_launch</mat-icon>
          </div>
          <div class="brand-text">
            <span class="brand-name">AgencyFlow</span>
            <span class="brand-sub">Gestão Comercial</span>
          </div>
        </div>

        <div class="toolbar-actions">
          <button mat-icon-button
                  (click)="recarregar()"
                  [disabled]="loading"
                  matTooltip="Recarregar dados">
            <mat-icon [class.spinning]="loading">refresh</mat-icon>
          </button>

          <button mat-raised-button
                  class="new-lead-btn"
                  (click)="abrirCriarLead()">
            <mat-icon>add</mat-icon>
            Novo Lead
          </button>
        </div>
      </div>
    </mat-toolbar>

    <!-- ========== CONTEÚDO ========== -->
    <div class="page-container">

      <!-- Métricas -->
      <app-metrics-bar [metrics]="metrics"></app-metrics-bar>

      <!-- Filtro de busca -->
      <div class="kanban-controls">
        <div class="search-box">
          <mat-icon class="search-icon">search</mat-icon>
          <input [(ngModel)]="searchTerm"
                 (input)="filtrar()"
                 placeholder="Buscar lead por nome ou empresa..."
                 class="search-input">
          <button *ngIf="searchTerm"
                  class="clear-search"
                  (click)="limparBusca()">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <div class="total-info">
          <mat-icon>people</mat-icon>
          {{ totalLeadsFiltrados }} lead{{ totalLeadsFiltrados !== 1 ? 's' : '' }}
        </div>
      </div>

      <!-- Loading state -->
      <div *ngIf="loading && !board" class="loading-full">
        <mat-spinner diameter="48"></mat-spinner>
        <p>Carregando pipeline...</p>
      </div>

      <!-- ========== KANBAN ========== -->
      <div *ngIf="board" class="kanban-board"
           cdkDropListGroup>
        <div *ngFor="let etapa of etapas"
             class="kanban-column"
             [id]="'col-' + etapa.id">

          <!-- Cabeçalho da coluna -->
          <div class="column-header" [style.border-color]="etapa.cor">
            <div class="col-header-left">
              <div class="col-icon" [style.background]="etapa.corFundo">
                <mat-icon [style.color]="etapa.cor">{{ etapa.icon }}</mat-icon>
              </div>
              <span class="col-label">{{ etapa.label }}</span>
            </div>
            <span class="col-badge" [style.background]="etapa.corFundo" [style.color]="etapa.cor">
              {{ board[etapa.id].length }}
            </span>
          </div>

          <!-- Valor total da coluna -->
          <div class="column-valor" *ngIf="board[etapa.id].length > 0">
            {{ getValorColuna(etapa.id) | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}
          </div>

          <!-- Drop list -->
          <div class="column-body"
               cdkDropList
               [cdkDropListData]="board[etapa.id]"
               [id]="etapa.id"
               [cdkDropListConnectedTo]="getConnectedLists(etapa.id)"
               (cdkDropListDropped)="onDrop($event, etapa.id)"
               [class.empty-col]="board[etapa.id].length === 0">

            <!-- Cards -->
            <div *ngFor="let lead of board[etapa.id]; trackBy: trackByLead"
                 cdkDrag
                 [cdkDragData]="lead"
                 class="drag-item">
              <app-lead-card
                [lead]="lead"
                (criarProposta)="abrirCriarProposta($event)"
                (verPropostas)="abrirPropostas($event)"
                (delete)="confirmarDelete($event)"
              ></app-lead-card>
            </div>

            <!-- Placeholder quando coluna vazia -->
            <div *ngIf="board[etapa.id].length === 0" class="empty-placeholder">
              <mat-icon [style.color]="etapa.cor">inbox</mat-icon>
              <span>Arraste um lead aqui</span>
            </div>
          </div>

          <!-- Botão rápido de adicionar -->
          <button class="add-to-col-btn"
                  [style.color]="etapa.cor"
                  (click)="abrirCriarLead(etapa.id)"
                  matTooltip="Adicionar lead nesta etapa">
            <mat-icon>add_circle_outline</mat-icon>
            Adicionar
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* TOOLBAR */
    .main-toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
      height: 64px;
      background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%) !important;
      box-shadow: 0 2px 8px rgba(15,23,42,0.4);
    }

    .toolbar-inner {
      width: 100%;
      max-width: 1600px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      mat-icon { color: white; }
    }

    .brand-name {
      display: block;
      font-size: 18px;
      font-weight: 700;
      color: white;
      line-height: 1.1;
    }

    .brand-sub {
      display: block;
      font-size: 10px;
      color: rgba(255,255,255,0.7);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .toolbar-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .new-lead-btn {
      background: white !important;
      color: #0f172a !important;
      font-weight: 600;
      border-radius: 20px;

      mat-icon { margin-right: 4px; }
    }

    .spinning { animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* PAGE */
    .page-container {
      max-width: 1600px;
      margin: 0 auto;
      padding: 24px 16px;
    }

    /* KANBAN CONTROLS */
    .kanban-controls {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 20px;
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 8px;
      background: white;
      border-radius: 24px;
      padding: 8px 16px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.1);
      flex: 1;
      max-width: 400px;
    }

    .search-icon { color: #aaa; font-size: 20px; }

    .search-input {
      border: none;
      outline: none;
      font-size: 14px;
      flex: 1;
      background: transparent;
      color: #333;

      &::placeholder { color: #bbb; }
    }

    .clear-search {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      display: flex;
      mat-icon { font-size: 18px; color: #aaa; }
    }

    .total-info {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #666;
      font-weight: 500;
      mat-icon { font-size: 16px; color: #aaa; }
    }

    /* LOADING */
    .loading-full {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px;
      gap: 16px;
      color: #888;
    }

    /* KANBAN BOARD */
    .kanban-board {
      display: flex;
      gap: 10px;
      overflow-x: auto;
      padding-bottom: 8px;
      min-height: calc(100vh - 280px);

      /* Ocultando a barra de rolagem de forma simples e definitiva */
      scrollbar-width: none; /* Firefox */
      -ms-overflow-style: none; /* IE/Edge */
      &::-webkit-scrollbar {
        display: none; /* Chrome, Safari e Edge chromiun */
      }
    }

    .kanban-column {
      flex: 1;
      min-width: 180px;
      display: flex;
      flex-direction: column;
      background: #f0f1f6;
      border-radius: 14px;
      padding: 12px;
      min-height: 400px;
    }

    .column-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
      border-bottom: 2px solid;
      padding-bottom: 8px;
    }

    .col-header-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .col-icon {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }

    .col-label {
      font-size: 13px;
      font-weight: 600;
      color: #333;
    }

    .col-badge {
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 700;
    }

    .column-valor {
      font-size: 11px;
      color: #888;
      font-weight: 600;
      text-align: right;
      margin-bottom: 8px;
    }

    .column-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-height: 60px;
      border-radius: 8px;
      transition: background 0.2s;

      &.empty-col {
        background: rgba(255,255,255,0.4);
        border: 2px dashed #ddd;
      }

      &.cdk-drop-list-dragging {
        background: rgba(255,255,255,0.6);
      }

      &.cdk-drop-list-receiving {
        background: rgba(124,77,255,0.05);
        border: 2px dashed #7c4dff;
      }
    }

    .drag-item {
      cursor: grab;
      &:active { cursor: grabbing; }
    }

    .empty-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 24px 12px;
      color: #bbb;
      flex: 1;

      mat-icon { font-size: 32px; width: 32px; height: 32px; opacity: 0.4; }
      span { font-size: 12px; }
    }

    .add-to-col-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      padding: 8px 4px 0;
      opacity: 0.6;
      transition: opacity 0.2s;
      width: 100%;

      &:hover { opacity: 1; }

      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }

    @media (max-width: 768px) {
      .kanban-column { flex: 0 0 220px; }
      .kanban-controls { flex-direction: column; align-items: stretch; }
      .search-box { max-width: 100%; }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  board: KanbanBoard | null = null;
  metrics: Metrics | null = null;
  loading = false;
  searchTerm = '';
  totalLeadsFiltrados = 0;

  readonly etapas = ETAPAS_CONFIG;
  private allLeads: Lead[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private leadsService: LeadsService,
    private metricsService: MetricsService,
    private notification: NotificationService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.carregarDados();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  recarregar(): void {
    this.carregarDados();
  }

  private carregarDados(): void {
    this.loading = true;
    this.cdr.markForCheck();

    forkJoin({
      leads: this.leadsService.getAll(),
      metrics: this.metricsService.get(),
    })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => { this.loading = false; this.cdr.markForCheck(); })
      )
      .subscribe({
        next: ({ leads, metrics }) => {
          this.allLeads = leads;
          this.metrics = metrics;
          this.montarBoard(leads);
        },
        error: (err) => {
          this.notification.error('Erro ao carregar dados: ' + err.message);
        },
      });
  }

  private montarBoard(leads: Lead[]): void {
    const board = {} as KanbanBoard;
    for (const etapa of this.etapas) board[etapa.id] = [];
    for (const lead of leads) {
      if (board[lead.etapa]) board[lead.etapa].push(lead);
    }
    this.board = board;
    this.calcularTotal();
    this.cdr.markForCheck();
  }

  filtrar(): void {
    if (!this.searchTerm.trim()) {
      this.montarBoard(this.allLeads);
      return;
    }
    const termo = this.searchTerm.toLowerCase();
    const filtrados = this.allLeads.filter(l =>
      l.nome.toLowerCase().includes(termo) ||
      l.empresa.toLowerCase().includes(termo) ||
      l.contato.toLowerCase().includes(termo)
    );
    this.montarBoard(filtrados);
  }

  limparBusca(): void {
    this.searchTerm = '';
    this.montarBoard(this.allLeads);
  }

  private calcularTotal(): void {
    if (!this.board) return;
    this.totalLeadsFiltrados = Object.values(this.board).reduce((s, c) => s + c.length, 0);
  }

  getConnectedLists(etapaId: EtapaLead): string[] {
    return this.etapas.map(e => e.id).filter(id => id !== etapaId);
  }

  getValorColuna(etapa: EtapaLead): number {
    return this.board?.[etapa]?.reduce((s, l) => s + l.valorEstimado, 0) ?? 0;
  }

  trackByLead(_: number, lead: Lead): string { return lead.id; }

  onDrop(event: CdkDragDrop<Lead[]>, novaEtapa: EtapaLead): void {
    if (!this.board) return;

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.cdr.markForCheck();
      return;
    }

    const lead: Lead = event.item.data;
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );

    this.calcularTotal();
    this.cdr.markForCheck();

    this.leadsService.updateEtapa(lead.id, novaEtapa)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          lead.etapa = novaEtapa;
          this.recarregarMetricas();
        },
        error: (err) => {
          // Reverter a UI
          transferArrayItem(
            event.container.data,
            event.previousContainer.data,
            event.currentIndex,
            event.previousIndex
          );
          this.calcularTotal();
          this.cdr.markForCheck();
          this.notification.error('Erro ao mover lead: ' + err.message);
        },
      });
  }

  private recarregarMetricas(): void {
    this.metricsService.get()
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: (m) => { this.metrics = m; this.cdr.markForCheck(); } });
  }

  abrirCriarLead(etapaInicial?: EtapaLead): void {
    const ref = this.dialog.open(CriarLeadDialogComponent, {
      width: '520px',
      disableClose: true,
      data: { etapa: etapaInicial },
    });

    ref.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(lead => {
        if (lead) {
          this.allLeads.unshift(lead);
          if (this.board) {
            this.board[lead.etapa as EtapaLead].unshift(lead);
            this.calcularTotal();
          }
          this.recarregarMetricas();
          this.cdr.markForCheck();
        }
      });
  }

  abrirCriarProposta(lead: Lead): void {
    this.dialog.open(CriarPropostaDialogComponent, {
      width: '540px',
      disableClose: true,
      data: { lead },
    });
  }

  abrirPropostas(lead: Lead): void {
    this.dialog.open(PropostasDialogComponent, {
      width: '560px',
      data: { lead },
    });
  }

  confirmarDelete(lead: Lead): void {
    if (!confirm(`Remover o lead "${lead.nome}"?`)) return;

    this.leadsService.delete(lead.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.allLeads = this.allLeads.filter(l => l.id !== lead.id);
          if (this.board) {
            this.board[lead.etapa] = this.board[lead.etapa].filter(l => l.id !== lead.id);
            this.calcularTotal();
          }
          this.recarregarMetricas();
          this.cdr.markForCheck();
          this.notification.success('Lead removido!');
        },
        error: (err) => this.notification.error(err.message),
      });
  }
}
