import { Component, AfterViewInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login implements AfterViewInit {
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngAfterViewInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/game']);
      return;
    }

    google.accounts.id.initialize({
      client_id: '521099599659-qa84qa48gnnd4jldtkufmn7872a6qpvv.apps.googleusercontent.com',
      callback: (response: any) => this.handleCredential(response)
    });

    google.accounts.id.renderButton(
      document.getElementById('google-btn'),
      { theme: 'filled_black', size: 'large', width: 280 }
    );
  }

  handleCredential(response: any) {
    this.loading = true;
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    this.ngZone.run(() => {
      this.authService.loginWithGoogle(payload.sub, payload.email, payload.name)
        .subscribe({
          next: (res: any) => {
            if (!res.user.avatar || res.user.avatar === 'duck') {
              this.router.navigate(['/setup']);
            } else {
              this.router.navigate(['/game']);
            }
          },
          error: () => { this.loading = false; }
        });
    });
  }
}