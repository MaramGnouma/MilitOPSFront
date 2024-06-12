import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatistiquesService {

  private apiUrl = 'http://localhost:5000';

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse): Observable<never> {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    return throwError(
      'Something bad happened; please try again later.');
  }

  getMissionStatsByType(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/byType`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getMissionStatsByResultAndYear(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/byResult`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getMissionStatsByResponsableAndResult(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/byResponsable`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getAverageMissionDuration(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/byduree`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getResultsDistributionByPeriod(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/byperiod`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getAverageSuccessRateByType(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/byrate`)
      .pipe(
        catchError(this.handleError)
      );
  }
}
