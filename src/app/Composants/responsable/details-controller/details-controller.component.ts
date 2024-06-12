import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AgentMission } from 'src/app/Models/agent-mission';
import { MissionEnCours } from 'src/app/Models/mission-en-cours';
import { AgentMissionService } from 'src/app/Services/agent-mission.service';
import { MissionEnCoursService } from 'src/app/Services/mission-en-cours.service';


@Component({
  selector: 'app-details-controller',
  templateUrl: './details-controller.component.html',
  styleUrls: ['./details-controller.component.css']
})
export class DetailsControllerComponent implements OnInit {
  user!: AgentMission; // Définir user comme un seul objet User plutôt qu'un tableau d'objets
  userId!: string;
  cvVisible: boolean = false;
  pdfSrc: string | undefined;
  private loggedInUserSubject = new BehaviorSubject<any>(null);
  missions: MissionEnCours[] = [];

  constructor(
    private http: HttpClient,
    private Agentservice: AgentMissionService,
    private route: ActivatedRoute,
    private router: Router,
    private missionservice: MissionEnCoursService,

  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.userId = params['id'];
      this.Agentservice.getUserById(this.userId).subscribe(
        data => {
          this.user = data;
          this.pdfSrc = data.cv;
          console.log(data.cv);
        },
        error => {
          console.error(error);
          // Gérer l'erreur ici
        }
      );
    });

    this.Agentservice.getMissionsByUser(this.userId).subscribe(
      data => {
        this.missions = data;
      },
      error => {
        console.error('Erreur lors de la récupération des données des missions :', error);
      }
    );
  }

  logout(): void {
    // Supprimer les informations d'authentification stockées, par exemple :
    localStorage.removeItem('token');
    this.loggedInUserSubject.next(null);
    // Rediriger vers la page de connexion
    this.router.navigate(['/login']);
  }

  toggleCVVisibility(): void {
    this.cvVisible = !this.cvVisible;
  }
}
