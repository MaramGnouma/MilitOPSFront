import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, Inject, Input, OnInit, PLATFORM_ID, Renderer2, ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, ValidatorFn, AbstractControl, FormArray } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { BehaviorSubject } from 'rxjs';
import { AgentMission } from 'src/app/Models/agent-mission';
import { Camera } from 'src/app/Models/camera';
import { EquipementTerrain } from 'src/app/Models/equipement-terrain';
import { MissionEnCours } from 'src/app/Models/mission-en-cours';
import { Montre } from 'src/app/Models/montre';
import { AgentMissionService } from 'src/app/Services/agent-mission.service';
import { AuthService } from 'src/app/Services/auth.service';
import { CameraService } from 'src/app/Services/camera.service';
import { EquipementService } from 'src/app/Services/equipement.service';
import { IntervenantService } from 'src/app/Services/intervenant.service';
import { MissionEnCoursService } from 'src/app/Services/mission-en-cours.service';
import { MontreService } from 'src/app/Services/montre.service';
import { NotificationService } from 'src/app/Services/notification.service';
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
    const selectedDateStr: string = control.value;
    const currentDateStr: string = new Date().toISOString().split('T')[0]; // Format "YYYY-MM-DD"

    if (selectedDateStr < currentDateStr) {
      return { 'dateNotPast': true };
    }
    return null;
  };
}
interface WatchSelection {
  intervenantId: any;
  watch: any;
}

// Assurez-vous que watchesSelected est déclaré avec le type WatchSelection[]
@Component({
  selector: 'app-listemissiondirect',
  templateUrl: './listemissiondirect.component.html',
  styleUrls: ['./listemissiondirect.component.css']
})
export class ListemissiondirectComponent implements OnInit {
  defaultDate!: NgbDateStruct; // Définissez votre modèle pour la date par défaut
  camera!:Camera;
  missions!: MissionEnCours[];
  userRole!: string; // Define userRole variable
    // Dans votre composant TypeScript
firstFormFilled: boolean = false;
isLinear=true;
isLinear1=true;
qt!:any;
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
  searchTerm: string = '';
  resultat: string = '';
  cause: string = '';
//Déclaration des formulaires
  secondFormGroup!: FormGroup;
  firstFormGroup!: FormGroup;
  thirdFormGroup!: FormGroup;
  fourthFormGroup!: FormGroup;
  showCheckboxes: boolean = false;
//Déclaration des data
users!:any[];
user!:AgentMission;
  intervenants!: any[];
  montres: Montre[] = [];  // Assuming you have an array of watches
  equipements!: EquipementTerrain[];
  equipements2!: any[];

  controllersControl: FormControl = new FormControl();
  selectedMission: any; // Variable pour stocker les données de la mission sélectionnée

  googleMapSrc: SafeResourceUrl | string = '';
  dropdownSettings: IDropdownSettings = {};
  dropdownSettings2: IDropdownSettings = {};
  @ViewChild('selectBtn') selectBtn!: ElementRef;
  @ViewChild('items') items!: ElementRef[];
  minDate!: NgbDateStruct; // Définir le type de la date minimale
cameras!:Camera[];
  private loggedInUserSubject = new BehaviorSubject<any>(null);
  mission!: MissionEnCours; // Définir intervenants comme un seul objet Intervenant plutôt qu'un tableau d'objets
  @Input() missionId!: string;
  selectedMissionId!: string;


  constructor(
    private _formBuilder: FormBuilder,
    private http: HttpClient,
    private Agentservice: AgentMissionService,
    private intervenantservice:IntervenantService ,
    private equipemntservice:EquipementService,
    private missionservice:MissionEnCoursService,
    private cameraservice:CameraService,
    private notifService:NotificationService,
    private elementRef: ElementRef, private renderer: Renderer2,
    private router: Router,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private authService: AuthService,
    private montreservice:MontreService,


  ) {
  }

  options = {
    layers: [
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      })
    ],
    zoom: 13,
    center: L.latLng([36.8065, 10.1815])
  };
  ngOnInit(): void {
    this.getWatchesForIntervenant() ;
    this.navigateToDefaultDate();
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const userDetails = JSON.parse(currentUser);
      this.user = userDetails;
    console.log(this.user)
      this.Agentservice.getMissionsByUser(userDetails._id).subscribe(
        (data: MissionEnCours[]) => { // Assurez-vous de typer 'data' comme un tableau d'objets Soldat
          this.missions = data;
          console.log(this.missions)
        },
        (error) => {
          console.error('Erreur lors de la récupération des données des mission :', error);
        }
      );
    }

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
      console.log(this.equipements)
    });
    this.cameraservice.getCameras().subscribe(data => {
      this.cameras = data;
    });

  }
  openUpdateMissionModal2(missionId: string) {
    this.selectedMissionId = missionId;
  }
  loadMissionData(): void {
    this.missionservice.getMissionById(this.missionId).subscribe(
      data => {
        this.mission = data;
      },
      error => {
        console.error(error);
      }
    );
  }

  updateMissionResult(missionId: string, result: string, rate: number | null, cause: string | null): void {
    if (cause !== null || rate !== null) {
      const rateValue: number = rate!;
      const causeValue: string = cause ?? ''; // Utilisez l'opérateur de coalescence nullish (??) pour fournir une valeur par défaut
      this.missionservice.updateMissionResult( this.selectedMissionId, result, rateValue,causeValue).subscribe(
        response => {
          console.log('Mission result updated successfully: ', rate);
          console.log('Mission result updated successfully: ', response);
          // Display a success SweetAlert to indicate that the mission was updated successfully
          Swal.fire({
            title: 'Success!',
            text: 'Mission termined successfully',
            icon: 'success',
            confirmButtonText: 'OK'
          }).then((result) => {
            // Recharger la page si l'utilisateur clique sur le bouton "OK"
            if (result.isConfirmed) {
              window.location.reload();
            }
          });
        },
        error => {
          console.error('Error updating mission result: ', error);
          // Display an error SweetAlert to indicate that an error occurred while updating the mission
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'An error occurred while updating the mission. Please try again later.',
            confirmButtonText: 'OK'
          });
        }
      );
    } else {
      console.error('Cause of failure not specified');
    }
  }
  isMissionStarted(startDate: Date | string, startTime: string): boolean {
    if (typeof startDate === 'string') {
      startDate = new Date(startDate); // Convertir la date en objet Date si elle est fournie en tant que chaîne de caractères
    }

    const now = new Date();
    const missionStartDateTime = new Date(startDate!.toDateString() + ' ' + startTime);

    return missionStartDateTime <= now;
  }


  loadMission() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const userDetails = JSON.parse(currentUser);
      this.user = userDetails;
      console.log(this.user);
      this.missionservice.getMissionsByUserId(userDetails._id).subscribe(
        (data: MissionEnCours[]) => {
          this.missions = data;
          console.log(data);
        },
        (error) => {
          console.error('Error retrieving mission data:', error);
        }
      );
    }
  }

  filterMissions(): MissionEnCours[] {
    if (!this.searchTerm.trim()) {
      return this.missions; // Return all missions if search term is empty
    }
    return this.missions.filter(mission =>
      mission.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      mission.adresse.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
  sortMissions(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    if (selectedValue) {
      switch (selectedValue) {
        case 'dateAsc':
          this.missions.sort((a, b) => new Date(a.datedebut).getTime() - new Date(b.datedebut).getTime());
          break;
        case 'dateDesc':
          this.missions.sort((a, b) => new Date(b.datedebut).getTime() - new Date(a.datedebut).getTime());
          break;
        case 'nameAsc':
          this.missions.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'nameDesc':
          this.missions.sort((a, b) => b.name.localeCompare(a.name));
          break;
        default:
          break;
      }
    }
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
objectif: ['', [Validators.required, Validators.pattern("[\\p{a-zA-Zéàç&}0-9',.\\s]+")]],
      date: [null,  [Validators.required, dateNotPastValidator()]],
      adresse: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9 ]+')]],
      heuredebut: ['', Validators.required],
      camera: ['', Validators.required],

    }),
    this.secondFormGroup = this._formBuilder.group({
      controllers: ['', Validators.required] // Assurez-vous que vous avez un contrôle 'controllers' dans votre deuxième formulaire
    }),
    this.thirdFormGroup = this._formBuilder.group({
      intervenantsType: ['', Validators.required],
    }),
    this.fourthFormGroup= this._formBuilder.group({
      equipements: this._formBuilder.array([]),
      check: [false, Validators.required],
      quantite: [0, [Validators.required, Validators.pattern('^[1-9][0-9]*$')]]

    });
  }

  logout(){
  this.authService.logout()
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
  toggleDropdown3(): void {
    const selectBtn = this.elementRef.nativeElement.querySelector('.select-btn3');
    const items = this.elementRef.nativeElement.querySelectorAll('.item3');

    this.renderer.addClass(selectBtn, 'open');

    items.forEach((item: HTMLElement) => {
      item.addEventListener('click', () => {
        item.classList.toggle('checked');

        const checkedItems = this.elementRef.nativeElement.querySelectorAll('.checked');
        const btnText = this.elementRef.nativeElement.querySelector('.btn-text3');

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

selectedController: string = '';

onSelect(controllerId: string): void {
  // Mettre à jour la valeur de selectedController
  this.selectedController = controllerId;
  // Afficher la sélection dans la console
  console.log('Selected Controller:', this.selectedController);
}
selectCamera: string = '';

onSelectCamera(cameraId: string): void {
  // Mettre à jour la valeur de selectedController
  this.selectCamera = cameraId;
  // Afficher la sélection dans la console
  console.log('Selected camera:', this.selectCamera);
}
selectedIntervenant: any;
watchesSelected: WatchSelection[] = [];
selectedIntervenants: any[] = [];

// Dans votre composant TypeScript
onSelectIntervenant(event: any, intervenant: any) {
  const isChecked = event.target.checked;
  if (isChecked) {
    this.selectedIntervenant = intervenant;
    console.log('he1', this.selectedIntervenant);
    this.clearPreviousWatchSelection();
  } else {
    this.selectedIntervenant = null;
    this.watchesSelected = this.watchesSelected.filter(ws => ws.intervenantId !== intervenant._id);
  }

  const selectedValue = event.target.value;

  if (selectedValue) {
    this.selectedIntervenants.push(selectedValue);
    console.log('Selected Intervenants:', this.selectedIntervenants);
  }
}

clearWatchSelectionForIntervenant(intervenantId: string) {
  this.watchesSelected = this.watchesSelected.filter(ws => ws.intervenantId !== intervenantId);
  // Vous pouvez également réinitialiser complètement watchesSelected si nécessaire
  // this.watchesSelected = [];
}

isWatchSelected(watch: any, intervenantId: string): boolean {
  return this.watchesSelected.some(ws => ws.intervenantId === intervenantId && ws.watch === watch.nom);
}

clearPreviousWatchSelection() {
  if (this.selectedIntervenant) {
    this.watchesSelected = this.watchesSelected.filter(ws => ws.intervenantId !== this.selectedIntervenant._id);
  }
}

getWatchesForIntervenant() {
  this.montreservice.getMontres().subscribe(
    (data: Montre[]) => {
      this.montres = data;
      console.log(this.montres);
    },
    (error) => {
      console.error('Erreur lors de la récupération des données des montres :', error);
    }
  );
}

// New method to get watch ID by its name
getWatchIdByName(name: string): string | undefined {
  const watch = this.montres.find(m => m.nom === name);
  return watch ? watch._id : undefined;
}

onSelectWatch(event: any, intervenantId: string) {
  const watchName = event.target.value;
  const watchId = this.getWatchIdByName(watchName);

  if (watchId) {
    if (!Array.isArray(this.watchesSelected)) {
      this.watchesSelected = [];
    }

    this.watchesSelected.push({ intervenantId: intervenantId, watch: watchId });
    console.log('this.watchesSelected:', this.watchesSelected);
  } else {
    console.error('Watch ID not found for the selected watch name:', watchName);
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

resetForms() {
  this.firstFormGroup.reset();
  this.secondFormGroup.reset();
  this.thirdFormGroup.reset();
}

  // Ajoutez une propriété pour contrôler l'état du pop-up
missionCreated: boolean = true;
blurBackground: boolean = false;

createMission(): void {
  this.blurBackground = true;
  const nomMission = this.firstFormGroup.get('nomMission')?.value;
  const missionType = this.firstFormGroup.get('missionType')?.value;
  const objectif = this.firstFormGroup.get('objectif')?.value;
  const date = this.firstFormGroup.get('date')?.value;
  const adresse = this.firstFormGroup.get('adresse')?.value;
  const camera = this.firstFormGroup.get('camera');
  const checkControl = this.fourthFormGroup.get('check');
  const heuredebut = this.firstFormGroup.get('heuredebut')?.value;

  if (checkControl) {
    const checkValue = checkControl.value === true;

    if (!checkValue) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'You must select at least one equipment or check the box',
      });
      return;
    }
  }

  if (this.selectedIntervenants.length > 0) {
    const currentUser = localStorage.getItem('currentUser');
    const intervenantWatches = this.watchesSelected.map((watch: { intervenantId: any; watch: any; }) => ({
      intervenantId: watch.intervenantId,
      watch: watch.watch
    }));
console.log('hhh',intervenantWatches)
    if (currentUser) {
      const userDetails = JSON.parse(currentUser);
      const missionData = {
        name: nomMission,
        typemission: missionType,
        objectif: objectif,
        datedebut: new Date(date),
        adresse: adresse,
        controller: this.selectedController,
        intervenants: this.selectedIntervenants,
        equipements: this.selectedEquipements,
        Responsable: userDetails._id,
        heuredebut: heuredebut,
        camera: this.selectCamera,
        intervenantWatches: intervenantWatches
      };
console.log(missionData)
      this.missionservice.createMission(missionData).subscribe(
        (response) => {
          console.log('Mission created successfully:', response);
          Swal.fire({
            title: 'Success!',
            text: 'Mission created successfully',
            icon: 'success',
            confirmButtonText: 'OK'
          }).then((result) => {
            if (result.isConfirmed) {
              window.location.reload();
            }
          });

          this.missionCreated = false;
          this.firstFormGroup.reset();
          this.secondFormGroup.reset();
          this.thirdFormGroup.reset();
          this.fourthFormGroup.reset();
          this.fourthFormGroup.get('check')?.reset();
        },
        (error) => {
          console.error('Error creating mission:', error);
        }
      );
    } else {
      console.error('Error: Current user details not found.');
    }
  } else {
    console.error('Error: No controller or responder selected.');
  }
}


checkFirstStep(): boolean {
  const firstFormValid = this.firstFormGroup.valid;

  if (!firstFormValid) {
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: 'You must complete all fields of the first form',
    });
  }

  return firstFormValid;
}

checkSecondStep(): boolean {
  const secondFormValid = this.secondFormGroup.valid;
  if (!secondFormValid) {
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: 'You must complete all fields of the second form',
    });
  }

  return secondFormValid;
}
checkThirdStep(): boolean {
  const thirdFormGroup = this.thirdFormGroup.valid;

  if (!thirdFormGroup) {
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: 'You must complete all fields of the third form',
    });
  }

  return thirdFormGroup;
}
checkfourthStep(): boolean {
  const fourthFormGroup = this.fourthFormGroup.valid;

  if (!fourthFormGroup) {
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: 'You must complete all fields of the Fourth form',
    });
  }

  return fourthFormGroup;
}



advanceToNextStep(stepper: MatStepper): void {
  const currentStepIndex = stepper.selectedIndex;

  switch (currentStepIndex) {
    case 0:
      if (this.checkFirstStep()) {
        stepper.next();
      }
      break;
    case 1:
        if (this.checkSecondStep()) {
          stepper.next();
        }
        break;
    case 2:
      if (this.checkThirdStep()) {
        stepper.next();
      }
      break;


    default:
      break;
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

openUpdateMissionModal(missionId: string) {
  // Récupérer les données de la mission par ID et ouvrir le modal
  this.missionservice.getMissionById(missionId).subscribe((missionData: any) => {
    this.selectedMission = missionData;
    this.missionservice.getCamerasByMissionId(this.selectedMission._id).subscribe(
      cam=>{
        this.camera=cam;
        console.log(this.camera.aliasbrodcast)
      })
    this.fillMissionForm();
  });
}
navigateToDefaultDate() {
  // Naviguez vers la date par défaut dans le sélecteur de date
  if (this.defaultDate && this.firstFormGroup.get('date')) {
    this.firstFormGroup.get('date')!.setValue(this.defaultDate); // Utilisation du '!' pour indiquer à TypeScript que firstFormGroup.get('date') ne sera pas null ici
  }
}
get equipementsArray(): FormArray {
  return this.fourthFormGroup.get('equipements') as FormArray;
}

fillMissionForm() {
  const dateISO = this.selectedMission.datedebut;
  const formattedDate = this.formatDate(dateISO);
  console.log('Formatted Date:', formattedDate);

  this.missionservice.getAllEquipmentsForMission(this.selectedMission._id).subscribe(
    (equipements: any[]) => {
      this.equipements2 = equipements;
      console.log('Equipements récupérés :', this.equipements2);

      if (this.selectedMission && this.selectedMission.equipements) {
        console.log('Équipements de la mission :', this.selectedMission.equipements);

        // Mettre à jour les champs généraux du formulaire
        this.firstFormGroup.patchValue({
          nomMission: this.selectedMission.name,
          missionType: this.selectedMission.typemission,
          objectif: this.selectedMission.objectif,
          adresse: this.selectedMission.adresse,
          date: formattedDate,
          heuredebut: this.selectedMission.heuredebut,
          camera: this.selectedMission.camera
        });
        console.log('FirstFormGroup mis à jour :', this.firstFormGroup);

        this.secondFormGroup.patchValue({
          controllers: this.selectedMission.controller,
        });

        this.thirdFormGroup.patchValue({
          intervenantsType: this.selectedMission.intervenants.name,
        });

        // Réinitialisez le FormArray des équipements
        this.equipementsArray.clear();

        // Parcourir la liste des équipements de la mission
        for (const missionEquipment of this.selectedMission.equipements) {
          const usedEquipment = this.equipements2.find(equipment => equipment._id === missionEquipment._id);
          console.log('Équipement utilisé trouvé :', usedEquipment);

          if (usedEquipment) {
            const isChecked = usedEquipment._id === missionEquipment.equipementId;

            if (isChecked) {
              const equipmentFormGroup = this._formBuilder.group({
                Equipement: [missionEquipment._id],
                quantite: [missionEquipment.quantity || 0],  // Utilisez la quantité de missionEquipment ou 0 si non définie
                check: [isChecked]
              });

              this.equipementsArray.push(equipmentFormGroup);

              console.log('FourthFormGroup après ajout de l\'équipement :', equipmentFormGroup.value);
            }
          } else {
            console.warn(`Equipment with id ${missionEquipment.equipementId} not found in equipements2`);
          }
        }

        console.log('FourthFormGroup complet :', this.fourthFormGroup.value);
      }
    }
  );
}

formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
}
updateMission(): void {
  // Assurez-vous que les formulaires sont valides avant de procéder

    // Récupérer les valeurs des formulaires
    const nomMission = this.firstFormGroup.get('nomMission')?.value;
    const missionType = this.firstFormGroup.get('missionType')?.value;
    const objectif = this.firstFormGroup.get('objectif')?.value;
    const date = this.firstFormGroup.get('date')?.value;
    const adresse = this.firstFormGroup.get('adresse')?.value;
    const checkControl = this.fourthFormGroup.get('check');
    const heuredebut = this.firstFormGroup.get('heuredebut')?.value;
    const intervenantWatches = this.watchesSelected.map((watch: { intervenantId: any; watch: any; }) => ({
      intervenantId: watch.intervenantId,
      watch: watch.watch
    }));
console.log('hhh',intervenantWatches)
    // Vérifier si des contrôleurs et intervenants ont été sélectionnés
    if (this.selectedIntervenants.length > 0) {
      // Créer l'objet de données de la mission
      const missionData = {
        _id:this.selectedMission._id,
        name: nomMission,
        typemission: missionType,
        objectif: objectif,
        datedebut: new Date(date),
        adresse: adresse,
        user: this.selectedController,
        intervenants: this.selectedIntervenants,
        equipements: this.selectedEquipements,
        camera:this.selectCamera,
        heuredebut: heuredebut,
        intervenantWatches: intervenantWatches
      };
console.log(missionData)
console.log(missionData._id)
      // Appeler le service pour mettre à jour la mission
      this.missionservice.updateMission(missionData._id, missionData).subscribe(
        () => {
          // Afficher un message de succès
          Swal.fire({
            title: 'Success!',
            text: 'Mission updated successfully',
            icon: 'success',
            confirmButtonText: 'OK'
          }).then((result) => {
            // Recharger la page si l'utilisateur clique sur le bouton "OK"
            if (result.isConfirmed) {
              window.location.reload();
            }
          });
          // Réinitialiser les formulaires et les sélections
          this.firstFormGroup.reset();
          this.secondFormGroup.reset();
          this.thirdFormGroup.reset();
          this.fourthFormGroup.reset();
          this.fourthFormGroup.get('check')?.reset();
          this.secondFormGroup.reset();
        },
        (error: any) => {
          // Gérer les erreurs
          console.error('Error updating mission:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'An error occurred while updating the mission',
          });
        }
      );
    } else {
      // Afficher un message d'erreur si aucun contrôleur ou intervenant n'a été sélectionné
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No controller or responder selected',
      });
    }

    // Afficher un message d'erreur si les formulaires ne sont pas valides
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Form data is not valid',
    });
  }
}

