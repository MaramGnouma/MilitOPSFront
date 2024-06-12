import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EquipementService {

  private baseUrl = 'http://localhost:5000'; // Assurez-vous que l'URL est correcte

  constructor(private http: HttpClient) { }

  createEquipement(equipementData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/equipements`, equipementData)
      .pipe(
        catchError(this.handleError)
      );
  }

  getEquipements(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/equipements`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getEquipementById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/equipements/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Implementer les autres méthodes pour update et delete si nécessaire

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(error);
  }
}
