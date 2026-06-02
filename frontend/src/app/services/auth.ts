import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
  id: number;
  googleId: string;
  email: string;
  name: string;
  avatar: string;
  snakeSkin: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://daudtsnake-production.up.railway.app/api';
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    const saved = localStorage.getItem('user');
    if (saved) this.userSubject.next(JSON.parse(saved));
  }

  private authHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`
    });
  }

  loginWithGoogle(googleId: string, email: string, name: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/google`, { googleId, email, name }).pipe(
      tap((res: any) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.userSubject.next(res.user);
      })
    );
  }

  updateProfile(name: string, avatar: string, snakeSkin: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/auth/profile`,
      { name, avatar, snakeSkin },
      { headers: this.authHeaders() }
    ).pipe(
      tap((user: any) => {
        localStorage.setItem('user', JSON.stringify(user));
        this.userSubject.next(user);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.userSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUser(): User | null {
    return this.userSubject.value;
  }
}