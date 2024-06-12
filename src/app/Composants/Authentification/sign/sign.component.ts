import { HttpClient } from '@angular/common/http';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, AbstractControl, Validators, FormArray, FormControl } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { Router } from '@angular/router';
import axios from 'axios';
import { AgentMission } from 'src/app/Models/agent-mission';
import { User } from 'src/app/Models/user';
import { AgentMissionService } from 'src/app/Services/agent-mission.service';
import { AuthService } from 'src/app/Services/auth.service';
import { IntervenantService } from 'src/app/Services/intervenant.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sign',
  templateUrl: './sign.component.html',
  styleUrls: ['./sign.component.css']
})
export class SignComponent implements OnInit {

  constructor(private builder: FormBuilder,private httpClient: HttpClient,private intervenantServ:IntervenantService,private router:Router,private agentservice:AgentMissionService,private authserv:AuthService) {
    this.maxDate = new Date();
    this.maxDate.setFullYear(this.maxDate.getFullYear() - 10);
   }
  isLinear=true;
  Empregister!: FormGroup;
  maxSize = 104857600;
  selectedFile: File | null = null;
  selectedFile2: File | null = null;
  maxDate!: Date;

  ngOnInit(): void {
    this.initForm();
  }
  hidePassword: boolean = true;

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }
  notFutureOrCurrentDateValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const selectedDate = new Date(control.value);
    const currentDate = new Date();
    if (selectedDate > currentDate) {
      return { 'futureDate': true };
    }
    return null;
  }

  initForm(): void {
    this.Empregister = this.builder.group({
      basic: this.builder.group({
        name: ['', Validators.required],
        identificationMilitaire: ['', Validators.required],
        adressePersonnelle: ['', Validators.required],
        numeroTelephone: ['', [Validators.required,Validators.maxLength(8)]],
        etatCivil: ['', Validators.required],
        image: [null,Validators.required],
        cv: [null,Validators.required],
        email: ['', [Validators.required,Validators.pattern('^[a-zA-Z0-9.!#$%&\'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[a-zA-Z]+$')]],
        genre: ['', Validators.required],
        role: ['', Validators.required],
        birth: ['', [Validators.required, this.notFutureOrCurrentDateValidator, this.dateOfBirthValidator]],
        statut: ['En attente'],
        password:['']
      }),
      formation: this.builder.group({
        date: ['',[Validators.required, this.notFutureOrCurrentDateValidator]],
        unit: ['', Validators.required],
        experiences:this.builder.array([], Validators.required),
        specializations: this.builder.array([], Validators.required),
      }),
      competence: this.builder.group({
        certificationsArray: this.builder.array([], Validators.required),
        competencesArray: this.builder.array([], Validators.required),
      })
    });
  }
  get experiencesArray() {
    return this.Formation.get('experiences') as FormArray;
  }
  get specializationsArray() {
    return this.Formation.get('specializations') as FormArray;
  }
  get certificationsArray() {
    return this.Competence.get('certificationsArray') as FormArray;
  }

  get competencesArray() {
    return this.Competence.get('competencesArray') as FormArray;
  }


  createExperienceFormGroup() {
    return this.builder.group({
      type: ['', Validators.required],
      annee: ['',[Validators.required, this.notFutureOrCurrentDateValidator]],
    });
  }

  addExperienceRow() {
    this.experiencesArray.push(this.createExperienceFormGroup());
  }

  removeExperienceRow(index: number) {
    this.experiencesArray.removeAt(index);
  }


  createSpecializationFormGroup(): FormGroup {
    return this.builder.group({
      name: ['', Validators.required],
      level: ['',Validators.required]
    });
  }

  addSpecializationRow() {
    this.specializationsArray.push(this.createSpecializationFormGroup());
  }

  removeSpecializationRow(index: number) {
    this.specializationsArray.removeAt(index);
  }

  get Basic() {
    return this.Empregister.get('basic') as FormGroup;
  }

  get Formation(){
    return this.Empregister.get("formation") as FormGroup;
  }

  get Competence(){
    return this.Empregister.get("competence") as FormGroup;
  }

  HandleSubmit(){
      console.log(this.Competence.value)
      console.log(this.Empregister.value);

  }

  createCertificationRow() {
    return this.builder.group({
      nom: ['', Validators.required],
      dateObtention: ['', [Validators.required, this.notFutureOrCurrentDateValidator]]
    });
  }

  addCertificationRow() {
    this.certificationsArray.push(this.createCertificationRow());
  }

  removeCertificationRow(index: number) {
    this.certificationsArray.removeAt(index);
  }

  createCompetenceRow() {
    return this.builder.group({
      nom: ['', Validators.required],
      niveau: ['', Validators.required]
    });
  }

  addCompetenceRow() {
    this.competencesArray.push(this.createCompetenceRow());
  }

  removeCompetenceRow(index: number) {
    this.competencesArray.removeAt(index);
  }


  dateOfBirthValidator(control: AbstractControl): { [key: string]: any } | null {
    const selectedDate = new Date(control.value);
    const currentYear = new Date().getFullYear();
    const minYear = currentYear - 24;

    if (selectedDate.getFullYear() > minYear) {
      control.setValue(null); // Réinitialiser la valeur si la date est invalide
      return { futureDate: true };
    }
    return null;
  }

  async submit(): Promise<void> {
    if (this.Empregister.valid && this.selectedFile && this.selectedFile2) {
      const form = new FormData();
      form.append('file', this.selectedFile);
      form.append('upload_preset', 'maramgnouma'); // Cloudinary upload preset

      try {
        // Envoyer le fichier "image" à Cloudinary
        const cloudinaryResponse = await axios.post('http://api.cloudinary.com/v1_1/deezublk9/upload', form);
        const imageUrl = cloudinaryResponse.data.secure_url;
        console.log('Image uploaded successfully:', imageUrl);

        // Continuer avec l'envoi du fichier "cv" à Cloudinary
        const cvForm = new FormData();
        cvForm.append('file', this.selectedFile2);
        cvForm.append('upload_preset', 'maramgnouma'); // Cloudinary upload preset

        const cvCloudinaryResponse2 = await axios.post('http://api.cloudinary.com/v1_1/deezublk9/upload', cvForm);
        const cvUrl = cvCloudinaryResponse2.data.secure_url;
        console.log('CV uploaded successfully:', cvUrl);
        const basicForm = this.Empregister.get('basic');
        const formationForm = this.Empregister.get('formation');
        const competencesForm = this.Empregister.get('competence');

        if (basicForm !== null && formationForm !== null) {
          const user: AgentMission = {
            name: basicForm.get('name')?.value,
            genre: basicForm.get('genre')?.value,
            datebirth: basicForm.get('birth')?.value,
            idMilitaire: basicForm.get('identificationMilitaire')?.value,
            adresse: basicForm.get('adressePersonnelle')?.value,
            telephone: basicForm.get('numeroTelephone')?.value,
            etatCivil: basicForm.get('etatCivil')?.value,
            email: basicForm.get('email')?.value,
            image: imageUrl,
            cv: cvUrl,
            dateEngagement: formationForm.get('date')?.value,
            unitAffectation: formationForm.get('unit')?.value,
            experiences: this.experiencesArray.value.map((experience: any) => ({
              type: experience.type,
              annee: new Date(experience.annee)
            })),
            specializations: this.specializationsArray.value,
            certifications: this.certificationsArray.value,
            competences: this.competencesArray.value,
            role: basicForm.get('role')?.value,
            status: 'Pending',
            password: basicForm.get('password')?.value,
            _id: '',
            notifications: []
          };
          console.log(cloudinaryResponse.data.secure_url);
          console.log(this.experiencesArray.value);
          // Créer l'objet intervenantdata
          console.log(user)
          // Appeler le service pour créer l'intervenant avec les URLs de l'image et du CV
          this.authserv.register(user).subscribe(
            (response) => {
              console.log(user)

              // Réinitialiser le formulaire après la soumission réussie
              this.initForm();
              console.log(user.role+' créé avec succès :', response);
              // Afficher SweetAlert de succès
              Swal.fire({
                title: 'Succès!',
                text: user.role+' créé avec succès',
                icon: 'success',
                confirmButtonText: 'OK'
              });
            },
            (error) => {
              console.error('Erreur lors de la création de'+user.role+', error');
              // Afficher SweetAlert d'erreur
              Swal.fire({
                title: 'Erreur!',
                text: 'Une erreur est survenue lors de la création de '+user.role+'Veuillez réessayer.',
                icon: 'error',
                confirmButtonText: 'OK'
              });
            }
          );
        }
      } catch (error) {
        console.error('Erreur lors de l\'envoi du fichier à Cloudinary :', error);
        // Afficher SweetAlert d'erreur
        Swal.fire({
          title: 'Erreur!',
          text: 'Une erreur est survenue lors de l\'envoi du fichier à Cloudinary. Veuillez réessayer.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    } else {
      console.error('Le formulaire est invalide ou aucun fichier sélectionné.');
      // Afficher SweetAlert d'erreur
      Swal.fire({
        title: 'Erreur!',
        text: 'Le formulaire est invalide ou aucun fichier sélectionné. Veuillez vérifier les champs obligatoires.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  }


  async onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];

  }


  onFileSelected2(event: any) {
    this.selectedFile2 = event.target.files[0];
  }


}

