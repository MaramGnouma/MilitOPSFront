import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Chart } from 'chart.js/auto';
import { BehaviorSubject } from 'rxjs';
import { AgentMission } from 'src/app/Models/agent-mission';
import { MissionEnCours } from 'src/app/Models/mission-en-cours';
import { AgentMissionService } from 'src/app/Services/agent-mission.service';
import { MissionEnCoursService } from 'src/app/Services/mission-en-cours.service';


@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.css']
})
export class ProfilComponent implements OnInit{
  user!: AgentMission; // Définir intervenants comme un seul objet Intervenant plutôt qu'un tableau d'objets
  soldatId!: string;
  cvVisible: boolean = false;
  pdfSrc: string | undefined; // Déplacez la déclaration ici
  private loggedInUserSubject = new BehaviorSubject<any>(null);
  missions: MissionEnCours[] = [];

  constructor(private router: Router,private Agentservice: AgentMissionService,private missionservice: MissionEnCoursService,

  ){}

  ngOnInit(): void {

    const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    const userDetails = JSON.parse(currentUser);
    this.user = userDetails;
    this.pdfSrc=this.user.cv

  }
  this.Agentservice.getMissionsByUser(this.user._id).subscribe(
    data => {
      this.missions = data;
    },
    error => {
      console.error('Erreur lors de la récupération des données des missions :', error);
    }
  );
}
logout(){
  // Supprimer les informations d'authentification stockées, par exemple :
  localStorage.removeItem('token');
  this.loggedInUserSubject.next(null);
  // Rediriger vers la page de connexion
  this.router.navigate(['/login']);
}
  toggleCVVisibility() {
    this.cvVisible = !this.cvVisible;
  }


}
