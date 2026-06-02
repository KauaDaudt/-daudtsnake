import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-setup.html',
  styleUrl: './profile-setup.scss'
})
export class ProfileSetup implements OnInit {
  name = '';
  selectedAvatar = 'duck';
  selectedSkin = 'green';
  loading = false;
  error = '';
  isEditing = false;

  avatars = [
    { id: 'duck', emoji: '🦆', label: 'Pato' },
    { id: 'lion', emoji: '🦁', label: 'Leão' },
    { id: 'bear', emoji: '🐻', label: 'Urso' }
  ];

  skins = [
    { id: 'green', emoji: '🟢', label: 'Cobra Verde' },
    { id: 'dragon', emoji: '🐲', label: 'Dragão' },
    { id: 'rattlesnake', emoji: '🟡', label: 'Cascavel' }
  ];

  constructor(public authService: AuthService, public router: Router) {}

  ngOnInit() {
  const user = this.authService.getUser();
  if (user && user.name) {
    this.isEditing = true;
    this.name = user.name;
    this.selectedAvatar = user.avatar ?? 'duck';
    this.selectedSkin = user.snakeSkin ?? 'green';
  }
}

  confirm() {
    if (!this.name.trim()) {
      this.error = 'Escolhe um nome pra jogar!';
      return;
    }
    this.loading = true;
    this.authService.updateProfile(this.name, this.selectedAvatar, this.selectedSkin)
      .subscribe({
        next: () => this.router.navigate(['/game']),
        error: () => {
          this.error = 'Erro ao salvar perfil. Tenta de novo!';
          this.loading = false;
        }
      });
  }
}