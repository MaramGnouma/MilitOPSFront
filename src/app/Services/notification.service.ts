import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private apiUrl = 'http://localhost:5000/notifications';

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

  createNotification(notification: Notification): Observable<Notification> {
    return this.http.post<Notification>(this.apiUrl, notification)
      .pipe(
        catchError(this.handleError)
      );
  }

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError)
      );
  }

  getNotificationById(id: string): Observable<Notification> {
    return this.http.get<Notification>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  updateNotification(id: string, notification: Notification): Observable<Notification> {
    return this.http.put<Notification>(`${this.apiUrl}/${id}`, notification)
      .pipe(
        catchError(this.handleError)
      );
  }

  deleteNotification(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }
}
