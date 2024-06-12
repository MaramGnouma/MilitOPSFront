import { Injectable } from "@angular/core";
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const userRoleString = localStorage.getItem("currentUser");
    if (!userRoleString) {
      this.router.navigate(['/login']); // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
      return false;
    }

    const userRole = JSON.parse(userRoleString);

    if (userRole.role === 'Superviseur' && state.url !== '/responsable/dash') {
      this.router.navigate(['/responsable/dash']);
      return false;
    } else if (userRole.role === 'Controleur' && state.url !== '/controleur') {
      this.router.navigate(['/controleur']);
      return false;
    }

    return true;
  }
}
