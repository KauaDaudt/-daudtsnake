import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private apiUrl = 'https://daudtsnake-production.up.railway.app/api';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.auth.getToken()}`
    });
  }

  getRanking(): Observable<any> {
    return this.http.get(`${this.apiUrl}/score/ranking`);
  }

  saveScore(points: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/score`,
      { points },
      { headers: this.headers() }
    );
  }

  generatePix(amount: number, payerEmail: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/payment/pix`, { amount, payerEmail });
  }
}