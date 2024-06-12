import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DonneesBiometriques } from '../Models/donnees-biometriques';

@Injectable({
  providedIn: 'root'
})
export class DonneesBiometriquesService {

  private apiUrl = 'http://localhost:5000'; // Mettez à jour avec l'URL de votre API

  constructor(private http: HttpClient) {}

  getLastHeartRate(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/last-heart-rate`);
  }

  getHeartRateData(): Observable<DonneesBiometriques[]> {
    return this.http.get<DonneesBiometriques[]>(`${this.apiUrl}/api/heart-rate`);
  }
}
