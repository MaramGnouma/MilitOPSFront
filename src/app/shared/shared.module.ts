import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing.module';
import { SharedComponent } from './shared.component';
import { ProfilComponent } from './profil/profil.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { HeaderComponent } from './header/header.component';
import { ListemissiondirectComponent } from './listemissiondirect/listemissiondirect.component';
import { MissiondirectComponent } from './missiondirect/missiondirect.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule, MatOptionModule, MatPseudoCheckbox } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalContentComponent } from './modal-content/modal-content.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { UpdateMissionComponent } from './update-mission/update-mission.component';
import { MatDialogTitle, MatDialogContent, MatDialogModule } from '@angular/material/dialog';
import { NgSelectModule } from '@ng-select/ng-select';
import { LeafletGeocoderComponent } from '../Composants/leaflet-geocoder/leaflet-geocoder.component';
import { LeafletRoutingMachineComponent } from '../Composants/leaflet-routing-machine/leaflet-routing-machine.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    SharedComponent,
    ProfilComponent,
    HeaderComponent,
    ListemissiondirectComponent,
    MissiondirectComponent,
    ModalContentComponent,
    UpdateMissionComponent,
    LeafletRoutingMachineComponent,
    LeafletGeocoderComponent,
  ],
  imports: [
    RouterModule,
    CommonModule,
    SharedRoutingModule,
    PdfViewerModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatOptionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NgbModule,
    MatTooltipModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDialogModule,
    NgSelectModule,
  ],
  exports: [
    HeaderComponent,
    ListemissiondirectComponent,
    MissiondirectComponent,
    ModalContentComponent
  ],

})
export class SharedModule { }
