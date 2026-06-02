import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game';

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ranking-page">
      <div class="ranking-card">
        <div class="top-bar">
          <button class="back-btn" (click)="goBack()">← Voltar</button>
          <h1>🏆 Ranking</h1>
          <span></span>
        </div>

        <div class="loading" *ngIf="loading">
          <div class="spinner"></div>
          <span>Carregando...</span>
        </div>

        <div class="empty" *ngIf="!loading && ranking.length === 0">
          <p>Nenhuma pontuação ainda. Seja o primeiro!</p>
        </div>

        <div class="list" *ngIf="!loading && ranking.length > 0">
          <div class="item" *ngFor="let r of ranking; let i = index"
            [class.gold]="i === 0"
            [class.silver]="i === 1"
            [class.bronze]="i === 2">
            <span class="medal">{{ getMedal(i) }}</span>
            <span class="avatar">{{ getAvatar(r.avatar) }}</span>
            <span class="name">{{ r.userName }}</span>
            <span class="games">{{ r.totalGames }} partidas</span>
            <span class="score">{{ r.bestScore }} pts</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './ranking.scss'
})
export class Ranking {
  ranking: any[] = [];
  loading = true;

  constructor(
    private gameService: GameService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.gameService.getRanking().subscribe({
      next: (data: any) => {
        this.ranking = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getAvatar(avatar: string) {
    const map: any = { duck: '🦆', lion: '🦁', bear: '🐻' };
    return map[avatar] ?? '🦆';
  }

  getMedal(i: number) {
    return ['🥇', '🥈', '🥉'][i] ?? `${i + 1}º`;
  }

  goBack() { this.router.navigate(['/game']); }
}