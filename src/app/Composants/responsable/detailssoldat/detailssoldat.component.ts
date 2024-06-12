import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Chart } from 'chart.js/auto';
import { BehaviorSubject } from 'rxjs';
import { Intervenant } from 'src/app/Models/intervenant';
import { MissionEnCours } from 'src/app/Models/mission-en-cours';
import { AgentMissionService } from 'src/app/Services/agent-mission.service';
import { IntervenantService } from 'src/app/Services/intervenant.service';

@Component({
  selector: 'app-detailssoldat',
  templateUrl: './detailssoldat.component.html',
  styleUrls: ['./detailssoldat.component.css']
})
export class DetailssoldatComponent implements OnInit{
  intervenants!: Intervenant; // Définir intervenants comme un seul objet Intervenant plutôt qu'un tableau d'objets
  soldatId!: string;
  cvVisible: boolean = false;
  pdfSrc: string | undefined; // Déplacez la déclaration ici
  private loggedInUserSubject = new BehaviorSubject<any>(null);
  missions: MissionEnCours[] = [];
  constructor(
    private Agentservice: AgentMissionService,
    private http: HttpClient,
    private intervenantservice:IntervenantService ,
    private route: ActivatedRoute,
    private router:Router,
  ){}


logout(){
  // Supprimer les informations d'authentification stockées, par exemple :
  localStorage.removeItem('token');
  this.loggedInUserSubject.next(null);
  // Rediriger vers la page de connexion
  this.router.navigate(['/login']);
}
  ngOnInit(): void {

    this.route.params.subscribe(params => {
      this.soldatId = params['id'];
      this.intervenantservice.getIntervenantById(this.soldatId).subscribe(
        data => {
          this.intervenants = data;
          this.pdfSrc = `../../../../assets/${data.cv}`;
          console.log(this.pdfSrc);

        },
        error => {
          console.error(error);
          // Gérer l'erreur ici
        }
      );
    });
    this.renderChart();
    this.Agentservice.getMissionsByUser(this.soldatId).subscribe(
      data => {
        this.missions = data;
      },
      error => {
        console.error('Erreur lors de la récupération des données des missions :', error);
      }
    );

  }
  toggleCVVisibility() {
    this.cvVisible = !this.cvVisible;
  }

  renderChart(): void {
    const data = {
      labels: ['2018', '2019', '2020', '2021','2022'], // Modifier avec les années pertinentes
      datasets: [{
        label: 'Participations en mission par année',
        data: [5, 10, 15,10,12], // Modifier avec les données réelles
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)'
        ],
        borderWidth: 1
      }]
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Participations en mission par année'
        }
      }
    };

    const ctx = document.getElementById('missionParticipationChart') as HTMLCanvasElement;
    const myChart = new Chart(ctx, {
      type: 'pie',
      data: data,

    });
  }
}

