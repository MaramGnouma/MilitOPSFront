import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RapportService {

  private apiUrl = 'http://localhost:5000'; // Mettez à jour avec l'URL de votre API

  constructor(private http: HttpClient) {}

  generateMissionReport(missionId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/generatereport/${missionId}`, {});
  }

  getRapportByMissionId(missionId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/rapport/${missionId}`);
  }
}
