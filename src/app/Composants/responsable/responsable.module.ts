import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ResponsableRoutingModule } from './responsable-routing.module';
import { ResponsableComponent } from './responsable.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MenuComponent } from './menu/menu.component';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { IonicModule } from '@ionic/angular';
import { MatStep, MatStepperModule } from '@angular/material/stepper';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatOptionModule, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DetailmissionComponent } from './detailmission/detailmission.component';
import { DetailssoldatComponent } from './detailssoldat/detailssoldat.component';
import { ListemissiontermineesComponent } from './listemissionterminees/listemissionterminees.component';
import { SoldatsComponent } from './soldats/soldats.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { NgxPrintModule } from 'ngx-print';
import { ListControllerComponent } from './list-controller/list-controller.component';
import { DetailsControllerComponent } from './details-controller/details-controller.component';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from 'src/app/shared/header/header.component';

@NgModule({
  declarations: [
    ResponsableComponent,
    DashboardComponent,
    MenuComponent,
    DetailmissionComponent,
    DetailssoldatComponent,
    ListemissiontermineesComponent,
    SoldatsComponent,
    ListControllerComponent,
    DetailsControllerComponent,

  ],
  imports: [
    RouterModule,
    CommonModule,
    ResponsableRoutingModule,
    MatIconModule,
    IonicModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatOptionModule,
    HttpClientModule,
    MatDialogModule,
    MatNativeDateModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NgbModule,
    PdfViewerModule,
    SharedModule,
    MatTableModule,
    MatPaginatorModule,
    NgApexchartsModule,
    PdfViewerModule,
    NgxExtendedPdfViewerModule,
    NgxPrintModule,

  ]

})
export class ResponsableModule { }
