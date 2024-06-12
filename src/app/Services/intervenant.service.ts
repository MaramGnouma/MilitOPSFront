import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Intervenant } from '../Models/intervenant';

@Injectable({
  providedIn: 'root'
})
export class IntervenantService {

  private apiUrl = 'http://localhost:5000/soldats';

  constructor(private http: HttpClient) {}

  createIntervenant(intervenant: Intervenant): Observable<Intervenant> {
    return this.http.post<Intervenant>(this.apiUrl, intervenant);
  }

  getIntervenants(): Observable<Intervenant[]> {
    return this.http.get<Intervenant[]>(this.apiUrl);
  }

  getIntervenantById(id: string): Observable<Intervenant> {
    return this.http.get<Intervenant>(`${this.apiUrl}/${id}`);
  }

  updateIntervenant(id: string, intervenant: Intervenant): Observable<Intervenant> {
    return this.http.put<Intervenant>(`${this.apiUrl}/${id}`, intervenant);
  }

  deleteIntervenant(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getIntervenantByName(name: string): Observable<Intervenant[]> {
    return this.http.get<Intervenant[]>(`${this.apiUrl}/name/${name}`);
  }
  }
