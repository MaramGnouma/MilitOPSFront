import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ControleurRoutingModule } from './controleur-routing.module';
import { ControleurComponent } from './controleur.component';
import { SharedModule } from 'src/app/shared/shared.module';

import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    ControleurComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ControleurRoutingModule,
    SharedModule,
  ]
})
export class ControleurModule { }
