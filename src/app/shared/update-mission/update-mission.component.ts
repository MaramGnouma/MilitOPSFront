import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, Inject, Input, Renderer2, ViewChild } from '@angular/core';
import { FormGroup, FormControl, AbstractControl, ValidatorFn, Validators, FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { SafeResourceUrl } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';
import * as L from 'leaflet';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { BehaviorSubject } from 'rxjs';
import { AgentMission } from 'src/app/Models/agent-mission';
import { MissionEnCours } from 'src/app/Models/mission-en-cours';
import { AgentMissionService } from 'src/app/Services/agent-mission.service';
import { EquipementService } from 'src/app/Services/equipement.service';
import { IntervenantService } from 'src/app/Services/intervenant.service';
import { MissionEnCoursService } from 'src/app/Services/mission-en-cours.service';
import Swal from 'sweetalert2';
function dateToNgbDateStruct(date: Date): NgbDateStruct {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate()
  };
}

function ngbDateStructToDate(dateStruct: NgbDateStruct): Date {
  return new Date(dateStruct.year, dateStruct.month - 1, dateStruct.day);
}


function dateNotPastValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const selectedDate = control.value;
    const currentDate = new Date();
    if (selectedDate && selectedDate.year && selectedDate.month && selectedDate.day) {
      const selectedDateObj = new Date(selectedDate.year, selectedDate.month - 1, selectedDate.day);
      // Vérifiez si la date sélectionnée est antérieure à la date d'aujourd'hui
      if (selectedDateObj < currentDate && selectedDateObj.toDateString() !== currentDate.toDateString()) {
        return { 'dateNotPast': true };
      }
    }
    return null;
  };
}
@Component({
  selector: 'app-update-mission',
  templateUrl: './update-mission.component.html',
  styleUrls: ['./update-mission.component.css']
})
export class UpdateMissionComponent {
  firstFormFilled: boolean = false;
isLinear=true;
typesMissions: string[] = [
  'Mission de reconnaissance',
  'Mission d\'assaut',
  'Mission de défense',
  'Mission de soutien',
  'Mission de formation',
  'Mission de contre-terrorisme',
  'Mission de maintien de la paix',
  'Mission humanitaire',
  'Mission de reconnaissance aérienne',
  'Mission de cyberdéfense'
];

checkFirstFormValidity() {
  this.firstFormFilled = this.firstFormGroup.valid;
}

  model!: NgbDateStruct;
  @ViewChild('inputfield') searchInputElement!: ElementRef<HTMLInputElement>;

  map!: L.Map;
  @ViewChild('stepper') stepper!: MatStepper;
 secondFormGroup!: FormGroup;
  firstFormGroup!: FormGroup;
  thirdFormGroup!: FormGroup;
  fourthFormGroup!: FormGroup;
  showCheckboxes: boolean = false;
//Déclaration des data
controlleurs!: any[];
users!:any[];
user!:AgentMission;
  intervenants!: any[];
  equipements!: any[];
  controllersControl: FormControl = new FormControl();
  selectedMission: any; // Variable pour stocker les données de la mission sélectionnée

  googleMapSrc: SafeResourceUrl | string = '';
  dropdownSettings: IDropdownSettings = {};
  dropdownSettings2: IDropdownSettings = {};
  @ViewChild('selectBtn') selectBtn!: ElementRef;
  @ViewChild('items') items!: ElementRef[];
  minDate!: NgbDateStruct; // Définir le type de la date minimale

  private loggedInUserSubject = new BehaviorSubject<any>(null);
  mission!: MissionEnCours; // Définir intervenants comme un seul objet Intervenant plutôt qu'un tableau d'objets
  @Input() missionId!: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: MissionEnCours, private Agentservice: AgentMissionService,
  private intervenantservice:IntervenantService ,
  private equipemntservice:EquipementService,
  private missionservice:MissionEnCoursService,
  private elementRef: ElementRef, private renderer: Renderer2,
  private router: Router,
  public dialog: MatDialog,
  private route: ActivatedRoute,
  private _formBuilder: FormBuilder,    private http: HttpClient,


) {
  this.firstFormGroup = this._formBuilder.group({
    nomMission: [data.name],
    missionType: [data.typemission],
    objectif: [data.objectif],
    adresse: [data.adresse],
    date: [data.datedebut],
    heuredebut: [data.heuredebut],
  });
}

ngOnInit(): void {
  this.minDate = this.getToday();
  this.initializeFormGroups();

  this.Agentservice.getUsersByRole('Controller').subscribe(data => {
    this.users = data.filter((user: any) => user.status === 'Accepted');
  });

  this.intervenantservice.getIntervenants().subscribe(data => {
    this.intervenants = data;
  });

  this.equipemntservice.getEquipements().subscribe(data => {
    this.equipements = data;
  });

}


isActive(url: string): boolean {
  return this.router.url === url;
}
private getToday(): NgbDateStruct {
  const today = new Date();
  return { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() };
}
ngAfterViewInit(): void {
  this.initMap();
  this.initAutocomplete();
}

initializeFormGroups(): void {
  this.firstFormGroup = this._formBuilder.group({
    nomMission: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9 ]+')]],
    missionType: ['', Validators.required],
    objectif: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9 ]+')]],
    date: [null,  [Validators.required, dateNotPastValidator()]],
    adresse: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9 ]+')]],
    heuredebut: ['', Validators.required],

  }),
  this.secondFormGroup = this._formBuilder.group({
    controllers: ['', Validators.required] // Assurez-vous que vous avez un contrôle 'controllers' dans votre deuxième formulaire
  }),
  this.thirdFormGroup = this._formBuilder.group({
    intervenantsType: [null, Validators.required],
  }),
  this.fourthFormGroup= this._formBuilder.group({
    Equipement: [null, Validators.required],
    check: [false, Validators.required],
    quantite: [0, [Validators.required, Validators.pattern('^[1-9][0-9]*$')]]

  });
}


toggleDropdown(): void {
  const selectBtn = this.elementRef.nativeElement.querySelector('.select-btn');
  const items = this.elementRef.nativeElement.querySelectorAll('.item');

  this.renderer.addClass(selectBtn, 'open');

  items.forEach((item: HTMLElement) => {
    item.addEventListener('click', () => {
      item.classList.toggle('checked');

      const checkedItems = this.elementRef.nativeElement.querySelectorAll('.checked');
      const btnText = this.elementRef.nativeElement.querySelector('.btn-text');

      if (checkedItems && checkedItems.length > 0) {
        btnText.innerText = `${checkedItems.length} Selected`;
        console.log(btnText.innerText);

        // Ajoutez une console pour récupérer les valeurs sélectionnées
        checkedItems.forEach((checkedItem: HTMLElement) => {
          console.log('Selected Value:', checkedItem.innerText);
        });
      } else {
        btnText.innerText = 'Select Controllers';
      }
    });
  });

  // Supprimer la classe 'checked' des éléments au démarrage
  items.forEach((item: HTMLElement) => {
    item.classList.remove('checked');
  });
}


toggleDropdown2(): void {
  const selectBtn = this.elementRef.nativeElement.querySelector('.select-btn2');
  const items = this.elementRef.nativeElement.querySelectorAll('.item2');

  this.renderer.addClass(selectBtn, 'open');

  items.forEach((item: HTMLElement) => {
    item.addEventListener('click', () => {
      item.classList.toggle('checked2'); // Utiliser 'checked2' pour la deuxième étape

      const checkedItems = this.elementRef.nativeElement.querySelectorAll('.checked2');
      const btnText = this.elementRef.nativeElement.querySelector('.btn-text2');

      if (checkedItems && checkedItems.length > 0) {
        btnText.innerText = `${checkedItems.length} Selected`;

      } else {
        btnText.innerText = 'Select Intervenants';
      }
    });
  });

  // Supprimer la classe 'checked2' des éléments au démarrage
  items.forEach((item: HTMLElement) => {
    item.classList.remove('checked2');
  });
}

errorMessages = {
  nomMission: [
    { type: 'required', message: 'Mission name is required' },
    { type: 'pattern', message: 'Mission name should contain only alphanumeric characters' }
  ],
  heuredebut: [
    { type: 'required', message: 'Time  is required' },
  ],
  missionType: [
    { type: 'required', message: 'Mission type is required' }
  ],
  objectif: [
    { type: 'required', message: 'Objective is required' },
    { type: 'pattern', message: 'Objective should contain only alphanumeric characters' }
  ],
  adresse: [
    { type: 'required', message: 'Address is required' },
    { type: 'pattern', message: 'Address should contain only alphanumeric characters' }
  ],
  date: [
    { type: 'required', message: 'Mission date is required' }
  ]
};


initMap(): void {
  this.map = L.map('map').setView([36.84696213032459, 10.152617585135552], 13);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(this.map);

  L.marker([50.4501, 30.5234], { alt: 'Kyiv' }).addTo(this.map)
    .bindPopup('Kyiv, Ukraine is the birthplace of Leaflet!');
}

initAutocomplete(): void {
  const searchInput = this.searchInputElement.nativeElement;
  searchInput.addEventListener('blur', () => {
    const address = searchInput.value;
    this.searchAddress(address);
    console.log(address);
  });
}

displayRoute(startCoords: number[], endCoords: number[]): void {
  const control = L.Routing.control({
    waypoints: [
      L.latLng(startCoords[0], startCoords[1]),
      L.latLng(endCoords[0], endCoords[1])
    ],
    routeWhileDragging: true,
    show: false,
    lineOptions: {
      styles: [{ color: '#0078FF', opacity: 1, weight: 6 }],
      extendToWaypoints: true,
      missingRouteTolerance: 10000
    }
  });

  console.log(this.map);
  control.addTo(this.map);
}

searchAddress(address: string): void {
  this.http.get<any>(`https://nominatim.openstreetmap.org/search?format=json&q=${address}`).subscribe(
    (response) => {
      if (response && response.length > 0) {
        const result = response[0];
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);

        navigator.geolocation.getCurrentPosition((position) => {
          const startLat = position.coords.latitude;
          const startLon = position.coords.longitude;
          this.displayRoute([startLat, startLon], [lat, lon]);
        });
      }
    },
    (error) => {
      console.error('Error fetching address:', error);
    }
  );
}

/* toggleCheckboxes(): void {
  const selectedOptions = this.thirdFormGroup.get('intervenantsType')?.value;
  this.showCheckboxes = selectedOptions != null && selectedOptions.length > 0;
}*/
selectedIntervenants: any[] = [];

selectedController: string = '';

onSelect(event: any): void {
// Vous pouvez gérer d'autres opérations ici si nécessaire
console.log('Selected Controller:', this.selectedController);
}

onSelect2(event: any): void {
  // Obtenez la valeur sélectionnée à partir de l'événement
  const selectedValue = event.target.value;

  // Vérifiez si une valeur a été sélectionnée
  if (selectedValue) {
    // Ajoutez la valeur sélectionnée au tableau selectedIntervenants
    this.selectedIntervenants.push(selectedValue);

    // Affichez la valeur sélectionnée dans la console
    console.log('Selected Intervenants:');
    console.log(this.selectedIntervenants);
  } else {
    // Gérez le cas où aucune valeur n'est sélectionnée
  }
}
selectedEquipements: any[] = [];

onSelect3(event: any, equipementId: string): void {
  // Obtenez la valeur de la quantité utilisée à partir de l'événement
  const quantiteUtilisee = parseInt(event.target.value, 10);

  // Vérifiez si une valeur de quantité a été spécifiée
  if (quantiteUtilisee) {
    // Ajoutez l'équipement sélectionné avec sa quantité au tableau selectedEquipements
    this.selectedEquipements.push({
      equipementId: equipementId,
      quantiteUtilisee: quantiteUtilisee
    });

    // Affichez les équipements sélectionnés avec leurs quantités dans la console
    console.log('Selected Equipements:');
    console.log(this.selectedEquipements);
  } else {
    // Gérez le cas où aucune quantité n'est spécifiée
  }
}





checkDateTime(date: NgbDateStruct, time: string): boolean {
const currentDate = new Date();
const formDate = new Date(date.year, date.month - 1, date.day);
const [hours, minutes] = time.split(':').map(part => parseInt(part, 10));

const formDateTime = new Date(
  date.year, date.month - 1, date.day,
  hours, minutes
);

return formDateTime <= currentDate;
}
voirDetail(mission: MissionEnCours): void {
const missionDate = dateToNgbDateStruct(new Date(mission.datedebut));

if (!this.checkDateTime(missionDate, mission.heuredebut)) {
  Swal.fire('Error', 'The mission cannot be viewed before its start date and time.', 'error');
  return;
}

// Code pour afficher les détails de la mission
this.router.navigate(['/shared/missioncour/', mission._id]);
}




}
