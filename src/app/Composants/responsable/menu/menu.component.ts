import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, Inject, OnInit, PLATFORM_ID, Renderer2, ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { EquipementService } from 'src/app/Services/equipement.service';
import { IntervenantService } from 'src/app/Services/intervenant.service';
import { NotificationService } from 'src/app/Services/notification.service';
import Swal from 'sweetalert2';
import * as L from 'leaflet';
import 'leaflet-routing-machine';

import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { MatDialog } from '@angular/material/dialog';

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
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements AfterViewInit,OnInit{
  // Dans votre composant TypeScript
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

//Déclaration des formulaires
  secondFormGroup!: FormGroup;
  firstFormGroup!: FormGroup;
  thirdFormGroup!: FormGroup;
  fourthFormGroup!: FormGroup;
  showCheckboxes: boolean = false;
//Déclaration des data
controlleurs!: any[];
users!:any[];
  intervenants!: any[];
  equipements!: any[];
  controllersControl: FormControl = new FormControl();

  googleMapSrc: SafeResourceUrl | string = '';
  dropdownSettings: IDropdownSettings = {};
  dropdownSettings2: IDropdownSettings = {};
  @ViewChild('selectBtn') selectBtn!: ElementRef;
  @ViewChild('items') items!: ElementRef[];
  minDate!: NgbDateStruct; // Définir le type de la date minimale

  constructor(
    private _formBuilder: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: any,
    private http: HttpClient,

    private intervenantservice:IntervenantService ,
    private equipemntservice:EquipementService,
    private notifService:NotificationService,
    private elementRef: ElementRef, private renderer: Renderer2,
    private router: Router,
    public dialog: MatDialog

  ) {
  }
  toggleSidebar(): void {
    // Ajouter la classe "hovered" à l'élément de la liste sélectionné
    const list = document.querySelectorAll(".navigation li");

    function activeLink(this: any) {
      list.forEach((item) => {
        item.classList.remove("hovered");
      });
      (this as HTMLElement).classList.add("hovered");
    }

    list.forEach((item) => item.addEventListener("mouseover", activeLink));

    // Menu Toggle
    const toggle = document.querySelector(".toggle");
    const navigation = document.querySelector(".navigation");
    const main = document.querySelector(".main");

    if (toggle instanceof HTMLElement && navigation instanceof HTMLElement && main instanceof HTMLElement) {
      toggle.onclick = function () {
        navigation.classList.toggle("active");
        main.classList.toggle("active");
      };
    }
  }



  ngOnInit(): void {
    this.minDate = this.getToday();
    this.initializeFormGroups();



    this.intervenantservice.getIntervenants().subscribe(data => {
      this.intervenants = data;
    });

    this.equipemntservice.getEquipements().subscribe(data => {
      this.equipements = data;
    });

  }
  private getToday(): NgbDateStruct {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() };
  }
  ngAfterViewInit(): void {

  }

  initializeFormGroups(): void {
    this.firstFormGroup = this._formBuilder.group({
      nomMission: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
      missionType: ['', Validators.required],
      objectif: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
      date: [null,  [Validators.required, dateNotPastValidator()]],
      adresse: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
    }),
    this.secondFormGroup = this._formBuilder.group({
      controllers: [null, Validators.required],
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








 /* toggleCheckboxes(): void {
    const selectedOptions = this.thirdFormGroup.get('intervenantsType')?.value;
    this.showCheckboxes = selectedOptions != null && selectedOptions.length > 0;
  }*/
  selectedControllers: any[] = [];
  selectedIntervenants: any[] = [];

  onSelect(event: any): void {
    // Obtenez la valeur sélectionnée à partir de l'événement
    const selectedValue = event.target.value;

    // Vérifiez si une valeur a été sélectionnée
    if (selectedValue) {
      // Ajoutez la valeur sélectionnée au tableau selectedControllers
      this.selectedControllers.push(selectedValue);

      // Affichez la valeur sélectionnée dans la console
      console.log('Selected Controllers:');
      console.log(this.selectedControllers);
    } else {
      // Gérez le cas où aucune valeur n'est sélectionnée
    }
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



  // Ajoutez une propriété pour contrôler l'état du pop-up
missionCreated: boolean = true;
blurBackground: boolean = false;

}
