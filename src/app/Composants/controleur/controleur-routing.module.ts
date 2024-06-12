import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ControleurComponent } from './controleur.component';

const routes: Routes = [{ path: '', component: ControleurComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ControleurRoutingModule { }
