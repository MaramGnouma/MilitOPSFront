import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './Composants/Authentification/login/login.component';
import { SignComponent } from './Composants/Authentification/sign/sign.component';
import { AuthGuard } from './Services/auth-guard.service';
import { RoleGuard } from './Guards/role.guard';
import { ProfilComponent } from './shared/profil/profil.component';

export  const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'sign', component: SignComponent },
  { path: 'profile', component: ProfilComponent },
  {
    path: 'responsable',
    loadChildren: () => import('./Composants/responsable/responsable.module').then(m => m.ResponsableModule),
    canActivate: [AuthGuard,RoleGuard],
  },
  {
    path: 'controleur',
    loadChildren: () => import('./Composants/controleur/controleur.module').then(m => m.ControleurModule),
    canActivate: [AuthGuard],
  },
  { path: 'shared',
   loadChildren: () => import('./shared/shared.module').then(m => m.SharedModule) }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
