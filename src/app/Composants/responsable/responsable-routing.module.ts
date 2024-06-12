import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ResponsableComponent } from './responsable.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MenuComponent } from './menu/menu.component';
import { SoldatsComponent } from './soldats/soldats.component';
import { DetailssoldatComponent } from './detailssoldat/detailssoldat.component';
import { ListemissiontermineesComponent } from './listemissionterminees/listemissionterminees.component';
import { DetailmissionComponent } from './detailmission/detailmission.component';
import { RoleGuard } from 'src/app/Guards/role.guard';
import { AuthGuard } from 'src/app/Services/auth-guard.service';
import { SharedComponent } from 'src/app/shared/shared.component';
import { ListControllerComponent } from './list-controller/list-controller.component';
import { DetailsControllerComponent } from './details-controller/details-controller.component';

const routes: Routes = [
  {
    path: '',
    component: ResponsableComponent,canActivate: [RoleGuard],
    children: [
      { path: 'dash', component: DashboardComponent },
      { path: 'soldats', component: SoldatsComponent ,data: { title: 'Soldats' } },
      { path: 'soldats/:id', component: DetailssoldatComponent } ,// Définition de la route pour les détails du soldat avec un paramètre d'itinéraire pour l'ID
      { path: 'missionterminees', component: ListemissiontermineesComponent ,data: { title: 'Mission Terminées' } },
      { path: 'missionterminees/:id', component: DetailmissionComponent ,data: { title: 'Détails Mission' } },
      { path: 'controller', component: ListControllerComponent ,data: { title: 'Soldats' } },
      { path: 'controller/:id', component: DetailsControllerComponent } ,// Définition de la route pour les détails du soldat avec un paramètre d'itinéraire pour l'ID


    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ResponsableRoutingModule { }
