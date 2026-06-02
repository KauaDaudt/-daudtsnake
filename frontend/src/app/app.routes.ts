import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/login/login').then(m => m.Login)
  },
  {
    path: 'setup',
    loadComponent: () =>
      import('./pages/profile-setup/profile-setup').then(m => m.ProfileSetup)
  },
  {
    path: 'game',
    loadComponent: () =>
      import('./pages/game/game').then(m => m.Game)
  },
  {
    path: 'ranking',
    loadComponent: () =>
      import('./pages/ranking/ranking').then(m => m.Ranking)
  },
  {
    path: 'donate',
    loadComponent: () =>
      import('./pages/donate/donate').then(m => m.Donate)
  },
  {
    path: '**',
    redirectTo: ''
  }
];