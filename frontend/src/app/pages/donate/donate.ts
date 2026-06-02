import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../services/game';

@Component({
  selector: 'app-donate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './donate.html',
  styleUrl: './donate.scss'
})
export class Donate {
  selectedAmount = 0;
  customAmount = '';
  payerEmail = '';
  qrCode = '';
  pixCode = '';
  loading = false;
  error = '';
  success = false;

  amounts = [5, 10, 20, 50];

  constructor(
    private gameService: GameService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  get finalAmount(): number {
    return this.selectedAmount || parseFloat(this.customAmount) || 0;
  }

  selectAmount(v: number) {
    this.selectedAmount = v;
    this.customAmount = '';
  }

  generatePix() {
    if (!this.finalAmount || this.finalAmount < 1) {
      this.error = 'Escolhe um valor de pelo menos R$1!';
      return;
    }
    if (!this.payerEmail) {
      this.error = 'Coloca seu e-mail pra gerar o Pix!';
      return;
    }
    this.error = '';
    this.loading = true;
    this.cdr.detectChanges();

    this.gameService.generatePix(this.finalAmount, this.payerEmail).subscribe({
      next: (res: any) => {
        this.qrCode = res.point_of_interaction?.transaction_data?.qr_code_base64 ?? '';
        this.pixCode = res.point_of_interaction?.transaction_data?.qr_code ?? '';
        this.loading = false;
        this.success = true;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Erro ao gerar Pix. Tenta de novo!';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  copyPix() {
    navigator.clipboard.writeText(this.pixCode);
  }

  goBack() { this.router.navigate(['/game']); }
}