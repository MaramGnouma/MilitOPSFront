import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      return true; // Autoriser l'accès à la route si l'utilisateur est connecté
    } else {
      this.router.navigate(['/login']); // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
      return false; // Interdire l'accès à la route
    }
  }
}
