import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, Inject, Input, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Chart, { CategoryScale, ChartConfiguration, LinearScale } from 'chart.js/auto';
import * as L from 'leaflet';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ModalContentComponent } from '../modal-content/modal-content.component';
import { Camera } from 'src/app/Models/camera';
declare var UnrealWebRTCPlayer: any;
import io from 'socket.io-client'; // Importer le client Socket.IO
import { AgentMission } from 'src/app/Models/agent-mission';
import { MissionEnCoursService } from 'src/app/Services/mission-en-cours.service';
import { DonneesBiometriquesService } from 'src/app/Services/donnees-biometriques.service';
import { MissionEnCours } from 'src/app/Models/mission-en-cours';

// Enregistrez les échelles dans Chart.js
Chart.register(LinearScale, CategoryScale);

@Component({
  selector: 'app-missiondirect',
  templateUrl: './missiondirect.component.html',
  styleUrls: ['./missiondirect.component.css']
})
export class MissiondirectComponent implements OnInit {
  @ViewChild('heartRateChart') chartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('heartRateChart2') chartRef2!: ElementRef<HTMLCanvasElement>;
  @ViewChild('heartRateChart3') chartRef3!: ElementRef<HTMLCanvasElement>;
  @ViewChild('remoteVideo') remoteVideoRef!: ElementRef<HTMLVideoElement>;
  private loggedInUserSubject = new BehaviorSubject<any>(null);
  livebrodcast!: string;
  heartRateChart: any;
  heartRateChart2: any;
  heartRateChart3: any;
  lastHeartRate!: number;
  chart: any;
  camera!: Camera;
  private centroid: L.LatLngExpression = [36.8065, 10.1815];
  map2!: L.Map;
  missions!: MissionEnCours; // Définir missions comme un seul objet Mission plutôt qu'un tableau d'objets
  @Input() missionId!: string; // Déclaration de la variable missionId
  user!: AgentMission;
  closeResult = '';
  socket: any; // Déclarer une variable pour le client Socket.IO

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private http: HttpClient,
    private missionService: MissionEnCoursService,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
    private donnesBiometriques:DonneesBiometriquesService
  ) {
    this.socket = io('http://localhost:5000');
      // Écouter l'événement 'bpm' émis par le serveur socket
  this.socket.on('bpm', (bpm: string) => {
    this.updateHeartRateData(bpm);
  });
  }

  openModal(missionId: string) {
    const modalRef = this.modalService.open(ModalContentComponent);
    modalRef.componentInstance.missionId = missionId; // Envoyer l'ID de la mission à ModalContentComponent
    modalRef.result.then(
      (result) => {
        this.closeResult = `Fermé avec: ${result}`;
      },
      (reason) => {
        this.closeResult = `Rejeté: ${reason}`;
      }
    );
  }
  ngAfterViewInit(): void {
    this.initializeChart();

}
  ngOnInit(): void {
    this.fetchLastHeartRate();
    setInterval(() => {
      this.fetchLastHeartRate();
    }, 2000); // Interroger toutes les 5 secondes
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      this.user = JSON.parse(currentUser);
    }
    this.setupWebRTCPlayer();
    this.route.params.subscribe(params => {
      this.missionId = params['id'];
      this.missionService.getMissionById(this.missionId).subscribe(
        data => {
          this.missions = data;
          this.initMapWithAddress(this.missions.adresse);
        },
        error => {
          console.error(error);
          // Gérer l'erreur ici
        }
      );
    });
  }
  fetchLastHeartRate(): void {
    this.donnesBiometriques.getLastHeartRate().subscribe((response: any) => {
      if (response && typeof response.bpm === 'number') {
        this.lastHeartRate = response.bpm;
        this.updateChart(this.lastHeartRate);
      } else {
        console.error('Format de données invalide pour la fréquence cardiaque:', response);
      }
    }, error => {
      console.error('Erreur lors de la récupération de la fréquence cardiaque:', error);
    });
  }

  updateChart(heartRate: number): void {
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const currentSecond = currentTime.getSeconds();
    const currentLabel = `${currentHour}:${currentMinute}`;

    if (!this.chart) {
      this.chart = new Chart('canvas', {
        type: 'line',
        data: {
          labels: [currentLabel], // Utilisez l'heure actuelle comme premier libellé
          datasets: [{
            label: 'Fréquence cardiaque (BPM)',
            data: [heartRate], // Ajoutez la fréquence cardiaque ici
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    } else {
      // Ajoutez le nouvel enregistrement au graphique existant
      this.chart.data.labels.push(currentLabel);
      this.chart.data.datasets[0].data.push(heartRate);

      // Limitez le nombre de libellés affichés pour éviter la surcharge visuelle
      const maxLabels = 5;
      if (this.chart.data.labels.length > maxLabels) {
        this.chart.data.labels.shift(); // Supprimez le libellé le plus ancien
        this.chart.data.datasets[0].data.shift(); // Supprimez la donnée correspondante
      }

      this.chart.update();
    }
  }
  logout() {
    // Supprimer les informations d'authentification stockées, par exemple :
    localStorage.removeItem('token');
    this.loggedInUserSubject.next(null);
    // Rediriger vers la page de connexion
    this.router.navigate(['/login']);
  }

  setupWebRTCPlayer(): void {
    this.route.params.subscribe(params => {
      this.missionId = params['id'];
      this.missionService.getMissionById(this.missionId).subscribe(
        data => {
          this.missions = data;
          this.livebrodcast = "cameraPFE";
          console.log(this.missions);
          this.missionService.getCamerasByMissionId(this.missionId).subscribe(
            cam => {
              this.camera = cam;
              console.log(this.camera.aliasbrodcast);
              if (this.camera.aliasbrodcast === this.livebrodcast) {
                const webrtcPlayer = new UnrealWebRTCPlayer("remoteVideo", this.livebrodcast, "", "192.168.1.240", "5119", false, true, "tcp");
                webrtcPlayer.Play();
              }
            }
          );
        },
        error => {
          console.error(error);
          // Gérer l'erreur ici
        }
      );
    });
  }

  isActive(url: string): boolean {
    return this.router.url === url;
  }

  initMapWithAddress(address: string): void {
    this.http.get<any>(`https://nominatim.openstreetmap.org/search?format=json&q=${address}`)
      .pipe(
        map(response => response[0]) // Prendre le premier résultat
      )
      .subscribe(location => {
        if (location) {
          this.initializeMap(location.lat, location.lon);
        } else {
          console.error('Adresse introuvable');
        }
      });
  }

  initializeMap(latitude: number, longitude: number): void {
    if (!this.map2) {
      this.map2 = L.map('map2').setView([latitude, longitude], 13);
      const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(this.map2);

      const marker = L.marker([latitude, longitude]).addTo(this.map2)
        .bindPopup('<b>' + this.missions.adresse + '</b><br />').openPopup();
    }
  }

  initializeChart(): void {
    if (this.chartRef2?.nativeElement && this.chartRef3?.nativeElement) {
      const ctx2 = this.chartRef2.nativeElement.getContext('2d');
      const ctx3 = this.chartRef3.nativeElement.getContext('2d');

      if (ctx2 && ctx3) {
        const labels = ['1', '2', '3', '4', '5'];
        const chartOptions: ChartConfiguration<'line', number[], string> = {
          type: 'line',
          data: {
            labels: labels,
            datasets: [
              {
                label: 'Fréquence cardiaque',
                data: [],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                fill: false
              },
              {
                label: 'Pression artérielle',
                data: [],
                borderColor: 'rgb(255, 99, 132)',
                tension: 0.1,
                fill: false
              },
              {
                label: 'Niveau d\'oxygène',
                data: [],
                borderColor: 'rgb(54, 162, 235)',
                tension: 0.1,
                fill: false
              }
            ]
          },
          options: {
            scales: {
              y: {
                title: {
                  display: true,
                  text: 'Valeur'
                },
                suggestedMin: 50,
                suggestedMax: 180,
                beginAtZero: false
              },
              x: {
                title: {
                  display: true,
                  text: 'Heure'
                }
              }
            }
          }
        };

        this.heartRateChart2 = new Chart(ctx2, chartOptions);
        this.heartRateChart3 = new Chart(ctx3, chartOptions);

        setInterval(() => {
          this.updateChartData();
        }, 2000);
      }
    } else {
      console.error('La référence du graphique n\'est pas encore disponible.');
    }
  }

  updateChartData(): void {
    const heartRateData: number[] = this.generateRandomData();
    const bloodPressureData: number[] = this.generateRandomData();
    const oxygenLevelData: number[] = this.generateRandomData();

    if (this.heartRateChart2 && this.heartRateChart3) {
      this.heartRateChart2.data.datasets[0].data = heartRateData;
      this.heartRateChart2.data.datasets[1].data = bloodPressureData;
      this.heartRateChart2.data.datasets[2].data = oxygenLevelData;
      this.heartRateChart2.update();

      this.heartRateChart3.data.datasets[0].data = heartRateData;
      this.heartRateChart3.data.datasets[1].data = bloodPressureData;
      this.heartRateChart3.data.datasets[2].data = oxygenLevelData;
      this.heartRateChart3.update();
    }
  }

  updateHeartRateData(bpm: string): void {
    console.log('New BPM received:', bpm);
  }

  generateRandomData(): number[] {
    const data: number[] = [];
    for (let i = 0; i < 5; i++) {
      data.push(Math.floor(Math.random() * 100) + 50);
    }
    return data;
  }
}
