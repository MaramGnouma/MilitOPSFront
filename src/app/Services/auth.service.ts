import { HttpClient, HttpEvent, HttpHandler, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, throwError } from 'rxjs';
import { User } from '../Models/user';
import { localeData } from 'moment';
import { Router } from '@angular/router';
import { AgentMission } from '../Models/agent-mission';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user!: AgentMission;
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.isLoggedIn());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();


   isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
  constructor(private http: HttpClient, private router: Router) {

  }
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    return next.handle(request);
  }

  forgotPassword(email: string) {
    return this.http.post<any>('http://localhost:5000/forgot-password', { email });
  }

  resetPassword(id: string, token: string, password: string) {
    return this.http.post<any>(`http://localhost:5000/reset-password/${id}/${token}`, { password });
  }


  register(user: any): Observable<any> {
    return this.http.post<any>('http://localhost:5000/register', user);
  }



  login(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post<any>('http://localhost:5000/login', credentials)
      .pipe(
        tap(response => {
          // Mettre à jour le localStorage après une connexion réussie
          localStorage.setItem('token', response.token);
          this.isLoggedInSubject.next(true);
        })
      );
  }

  logout(): void {
    // Envoi d'une requête POST à l'API pour déconnecter l'utilisateur
    this.http.post<any>('http://localhost:5000/logout', {}).subscribe({
      next: () => {
        // Supprimer le token JWT stocké localement
        localStorage.removeItem('token');
        // Rediriger vers la page de connexion ou une autre page appropriée
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Une erreur s\'est produite lors de la déconnexion : ', error);
        // Vous pouvez ajouter une logique de gestion d'erreur ici
      }
    });
  }
  getUser(): Observable<any> {
    return this.http.get<any>('http://localhost:5000/user');
  }

}
