import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponent } from './Composants/Authentification/login/login.component';
import { ForgetComponent } from './Composants/Authentification/forget/forget.component';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { HttpClientModule } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import {MatSelectModule} from '@angular/material/select';
import { IonicModule } from '@ionic/angular';
import { SignComponent } from './Composants/Authentification/sign/sign.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { SharedModule } from './shared/shared.module';
import { MatIconModule } from '@angular/material/icon';
import { LeafletRoutingMachineComponent } from './Composants/leaflet-routing-machine/leaflet-routing-machine.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { LeafletGeocoderComponent } from './Composants/leaflet-geocoder/leaflet-geocoder.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ForgetComponent,
    SignComponent,

  ],
  imports: [
    BrowserModule,
    LeafletModule,
    AppRoutingModule,
    BrowserAnimationsModule,
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
    IonicModule,
    PdfViewerModule,
    SharedModule,
    MatIconModule,

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
