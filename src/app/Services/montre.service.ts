import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Montre } from '../Models/montre';

@Injectable({
  providedIn: 'root'
})
export class MontreService {
  private baseUrl = 'http://localhost:5000'; // Update with your backend API base URL

  constructor(private http: HttpClient) { }

  createMontre(montreData: Montre): Observable<Montre> {
    return this.http.post<Montre>(`${this.baseUrl}/montres`, montreData);
  }

  getMontres(): Observable<Montre[]> {
    return this.http.get<Montre[]>(`${this.baseUrl}/montres`);
  }

  getMontreById(montreId: string): Observable<Montre> {
    return this.http.get<Montre>(`${this.baseUrl}/montres/${montreId}`);
  }

  updateMontre(montreId: string, updatedMontreData: Montre): Observable<Montre> {
    return this.http.put<Montre>(`${this.baseUrl}/montres/${montreId}`, updatedMontreData);
  }

  deleteMontre(montreId: string): Observable<Montre> {
    return this.http.delete<Montre>(`${this.baseUrl}/montres/${montreId}`);
  }
}
