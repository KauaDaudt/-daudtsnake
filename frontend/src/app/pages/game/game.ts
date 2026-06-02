import { Component, OnInit, OnDestroy, HostListener, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { GameService } from '../../services/game';

const CELL = 24;
const COLS = 25;
const ROWS = 20;

interface Point { x: number; y: number; }

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game.html',
  styleUrl: './game.scss'
})
export class Game implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  user: any = null;
  score = 0;
  bestScore = 0;
  gameState: 'idle' | 'playing' | 'dead' = 'idle';

  private snake: Point[] = [];
  private dir: Point = { x: 1, y: 0 };
  private nextDir: Point = { x: 1, y: 0 };
  private food: Point = { x: 0, y: 0 };
  private loop: any;
  private touchStart: Point = { x: 0, y: 0 };

  constructor(
    private authService: AuthService,
    private gameService: GameService,
    private router: Router
  ) {}

  ngAfterViewInit() {
  setTimeout(() => {
    this.user = this.authService.getUser();
    this.authService.user$.subscribe(u => { if (u) this.user = u; });
  });
  this.drawIdle();
}

  ngOnDestroy() {
    clearInterval(this.loop);
  }

  startGame() {
    this.score = 0;
    this.snake = [
      { x: 12, y: 10 }, { x: 11, y: 10 }, { x: 10, y: 10 }
    ];
    this.dir = { x: 1, y: 0 };
    this.nextDir = { x: 1, y: 0 };
    this.spawnFood();
    this.gameState = 'playing';
    clearInterval(this.loop);
    this.loop = setInterval(() => this.tick(), 130);
  }

  private tick() {
  this.dir = this.nextDir;
  const head = {
    x: this.snake[0].x + this.dir.x,
    y: this.snake[0].y + this.dir.y
  };

  if (
    head.x < 0 || head.x >= COLS ||
    head.y < 0 || head.y >= ROWS ||
    this.snake.some(s => s.x === head.x && s.y === head.y)
  ) {
    clearInterval(this.loop);
    this.gameState = 'dead';
    if (this.score > this.bestScore) this.bestScore = this.score;
    if (this.score > 0) {
      this.gameService.saveScore(this.score).subscribe();
    }
    this.draw();
    return;
  }

  this.snake.unshift(head);

  if (head.x === this.food.x && head.y === this.food.y) {
    this.score += 10;
    this.spawnFood();
  } else {
    this.snake.pop();
  }

  this.draw();
}

  private die() {
    clearInterval(this.loop);
    this.gameState = 'dead';
    if (this.score > this.bestScore) this.bestScore = this.score;
    if (this.score > 0) {
      this.gameService.saveScore(this.score).subscribe();
    }
    this.draw();
  }

  private spawnFood() {
    do {
      this.food = {
        x: Math.floor(Math.random() * COLS),
        y: Math.floor(Math.random() * ROWS)
      };
    } while (this.snake.some(s => s.x === this.food.x && s.y === this.food.y));
  }

  @HostListener('window:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    if (this.gameState !== 'playing') return;
    const map: any = {
      ArrowUp:    { x: 0, y: -1 },
      ArrowDown:  { x: 0, y: 1 },
      ArrowLeft:  { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 }
    };
    const d = map[e.key];
    if (d && !(d.x === -this.dir.x && d.y === -this.dir.y)) {
      this.nextDir = d;
      e.preventDefault();
    }
  }

  onTouchStart(e: TouchEvent) {
    this.touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }

  onTouchEnd(e: TouchEvent) {
    if (this.gameState !== 'playing') return;
    const dx = e.changedTouches[0].clientX - this.touchStart.x;
    const dy = e.changedTouches[0].clientY - this.touchStart.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      const d = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
      if (!(d.x === -this.dir.x)) this.nextDir = d;
    } else {
      const d = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
      if (!(d.y === -this.dir.y)) this.nextDir = d;
    }
  }

  private getCanvas() {
    return this.canvasRef.nativeElement;
  }

  private getCtx() {
    return this.getCanvas().getContext('2d')!;
  }

  private drawIdle() {
    const ctx = this.getCtx();
    this.drawBackground(ctx);
  }

  private draw() {
  const ctx = this.getCtx();
  this.drawBackground(ctx);

  // Comida — maçã vermelha
  ctx.fillStyle = '#e74c3c';
  ctx.beginPath();
  ctx.arc(
    this.food.x * CELL + CELL / 2,
    this.food.y * CELL + CELL / 2,
    CELL / 2 - 3, 0, Math.PI * 2
  );
  ctx.fill();
  ctx.fillStyle = '#27ae60';
  ctx.fillRect(this.food.x * CELL + CELL / 2, this.food.y * CELL + 2, 3, 6);

  const skin = this.user?.snakeSkin ?? 'green';
  this.snake.forEach((s, i) => {
    const cx = s.x * CELL + CELL / 2;
    const cy = s.y * CELL + CELL / 2;
    const isHead = i === 0;
    const isTail = i === this.snake.length - 1;

    if (skin === 'green') {
      ctx.fillStyle = isHead ? '#2ecc71' : '#27ae60';
      ctx.beginPath();
      ctx.roundRect(s.x * CELL + 2, s.y * CELL + 2, CELL - 4, CELL - 4, isHead ? 6 : 3);
      ctx.fill();
      if (isHead) {
        ctx.fillStyle = '#1a252f';
        ctx.beginPath(); ctx.arc(cx - 4, cy - 3, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 4, cy - 3, 2, 0, Math.PI * 2); ctx.fill();
      }

    } else if (skin === 'dragon') {
      ctx.fillStyle = isHead ? '#e74c3c' : '#c0392b';
      ctx.beginPath();
      ctx.roundRect(s.x * CELL + 2, s.y * CELL + 2, CELL - 4, CELL - 4, isHead ? 6 : 3);
      ctx.fill();
      // Escamas triangulares no corpo
      if (!isHead && !isTail) {
        ctx.fillStyle = '#e67e22';
        ctx.beginPath();
        ctx.moveTo(cx, s.y * CELL + 2);
        ctx.lineTo(cx - 5, s.y * CELL + 10);
        ctx.lineTo(cx + 5, s.y * CELL + 10);
        ctx.closePath();
        ctx.fill();
      }
      if (isHead) {
        // Chifrinhos
        ctx.fillStyle = '#f39c12';
        ctx.beginPath(); ctx.moveTo(cx - 5, s.y * CELL + 2); ctx.lineTo(cx - 8, s.y * CELL - 4); ctx.lineTo(cx - 2, s.y * CELL + 2); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(cx + 5, s.y * CELL + 2); ctx.lineTo(cx + 8, s.y * CELL - 4); ctx.lineTo(cx + 2, s.y * CELL + 2); ctx.closePath(); ctx.fill();
        // Olhos
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath(); ctx.arc(cx - 4, cy - 2, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 4, cy - 2, 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#1a252f';
        ctx.beginPath(); ctx.arc(cx - 4, cy - 2, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 4, cy - 2, 1.5, 0, Math.PI * 2); ctx.fill();
      }

    } else if (skin === 'rattlesnake') {
      ctx.fillStyle = isHead ? '#d4ac6e' : '#c9a84c';
      ctx.beginPath();
      ctx.roundRect(s.x * CELL + 2, s.y * CELL + 2, CELL - 4, CELL - 4, isHead ? 6 : 3);
      ctx.fill();
      // Listras escuras no corpo
      if (!isHead && !isTail && i % 2 === 0) {
        ctx.fillStyle = '#7d6608';
        ctx.fillRect(s.x * CELL + 4, s.y * CELL + 8, CELL - 8, 4);
      }
      // Chocalho na cauda
      if (isTail) {
        ctx.fillStyle = '#aaa';
        ctx.beginPath();
        ctx.arc(cx, cy, CELL / 2 - 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#888';
        ctx.beginPath();
        ctx.arc(cx, cy, CELL / 2 - 7, 0, Math.PI * 2);
        ctx.fill();
      }
      if (isHead) {
        // Olhos
        ctx.fillStyle = '#1a252f';
        ctx.beginPath(); ctx.arc(cx - 4, cy - 2, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 4, cy - 2, 2, 0, Math.PI * 2); ctx.fill();
        // Língua
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy + 4);
        ctx.lineTo(cx - 3, cy + 9);
        ctx.moveTo(cx, cy + 4);
        ctx.lineTo(cx + 3, cy + 9);
        ctx.stroke();
      }
    }
  });
}

  private drawBackground(ctx: CanvasRenderingContext2D) {
    const canvas = this.getCanvas();
    // Fundo do mapa medieval
    for (let x = 0; x < COLS; x++) {
      for (let y = 0; y < ROWS; y++) {
        const isEdge = x === 0 || y === 0 || x === COLS - 1 || y === ROWS - 1;
        ctx.fillStyle = isEdge ? '#2c1810' : (x + y) % 2 === 0 ? '#1a2a1a' : '#162216';
        ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
      }
    }

    // Tijolos nas bordas
    ctx.fillStyle = '#4a2c17';
    for (let x = 0; x < COLS; x++) {
      ctx.fillRect(x * CELL + 2, 2, CELL - 4, CELL - 4);
      ctx.fillRect(x * CELL + 2, (ROWS - 1) * CELL + 2, CELL - 4, CELL - 4);
    }
    for (let y = 1; y < ROWS - 1; y++) {
      ctx.fillRect(2, y * CELL + 2, CELL - 4, CELL - 4);
      ctx.fillRect((COLS - 1) * CELL + 2, y * CELL + 2, CELL - 4, CELL - 4);
    }

    // Detalhes fogo nas bordas
    ctx.fillStyle = '#ff6b2b';
    for (let x = 1; x < COLS - 1; x += 4) {
      ctx.fillRect(x * CELL + 8, 4, 8, 6);
      ctx.fillRect(x * CELL + 8, (ROWS - 1) * CELL + 14, 8, 6);
    }
  }

  goRanking() {
    this.router.navigate(['/ranking']);
  }

  goDonate() {
    this.router.navigate(['/donate']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
  goSetup() {
  this.router.navigate(['/setup']);
}
}