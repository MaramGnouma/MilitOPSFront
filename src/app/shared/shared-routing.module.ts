import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedComponent } from './shared.component';
import { RoleGuard } from '../Guards/role.guard';
import { ProfilComponent } from './profil/profil.component';
import { ListemissiondirectComponent } from './listemissiondirect/listemissiondirect.component';
import { MissiondirectComponent } from './missiondirect/missiondirect.component';
import { SoldatsComponent } from '../Composants/responsable/soldats/soldats.component';
import { DetailssoldatComponent } from '../Composants/responsable/detailssoldat/detailssoldat.component';
import { ListemissiontermineesComponent } from '../Composants/responsable/listemissionterminees/listemissionterminees.component';

const routes: Routes = [  { path: '', component: SharedComponent,
children: [
  { path: 'profile', component:  ProfilComponent},
  { path: 'listdirect', component: ListemissiondirectComponent ,data: { title: 'Mission direct' }},
  { path: 'missioncour', component: MissiondirectComponent ,data: { title: 'Mission en cours' } },
  { path: 'missioncour/:id', component: MissiondirectComponent ,data: { title: 'Mission en cours' } },
  { path: 'soldats', component: SoldatsComponent ,data: { title: 'Soldiers' } },
  { path: 'missionterminees', component: ListemissiontermineesComponent ,data: { title: 'Mission Completed' } },
  { path: 'soldats/:id', component: DetailssoldatComponent } ,// Définition de la route pour les détails du soldat avec un paramètre d'itinéraire pour l'ID



] }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SharedRoutingModule { }
