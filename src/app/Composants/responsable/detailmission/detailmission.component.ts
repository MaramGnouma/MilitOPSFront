import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { ChartComponent } from 'chart.js/auto';
import { BehaviorSubject } from 'rxjs';
import { Intervenant } from 'src/app/Models/intervenant';
import { Missionterminees } from 'src/app/Models/missionterminees';
import { AgentMissionService } from 'src/app/Services/agent-mission.service';
import { MissiontermineesService } from 'src/app/Services/missionterminees.service';



@Component({
  selector: 'app-detailmission',
  templateUrl: './detailmission.component.html',
  styleUrls: ['./detailmission.component.css']
})
export class DetailmissionComponent implements OnInit {
  @ViewChild('missionSuccessFailureChart') missionChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('equipement') equipmentChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  @ViewChild("chart") chart!: ChartComponent;
  chartOptions: any = {}; // Déclaration de la variable chartOptions


  displayedColumns: string[] = ['image','name'];
  dataSource!: MatTableDataSource<Intervenant>;
  missionT!: Missionterminees;
  missionId!: string;
  missionid!:string
  intervenants!: Intervenant [];
  tab!: Intervenant[];
controller: string = '';
responsable: string = '';
equipements:any;
  @ViewChild('pdfViewer') pdfViewer: any;
  calculateTotalDuration(startTime: string, endTime: string): number {
    // Assurez-vous que startTime et endTime sont des chaînes non vides
    if (!startTime || !endTime) {
      return 0; // Retourner 0 si l'une des valeurs est manquante
    }

    // Convertir les chaînes de temps en objets Date
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    // Vérifier si les dates sont valides
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return 0; // Retourner 0 si les dates ne sont pas valides
    }

    // Calculer la différence en millisecondes entre les deux dates
    const durationMs = Math.abs(endDate.getTime() - startDate.getTime());

    // Convertir la durée en heures
    const durationHours = durationMs / (1000 * 60 * 60);

    return durationHours;
  }


  private loggedInUserSubject = new BehaviorSubject<any>(null);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private missionTService: MissiontermineesService,
    private Agentservice: AgentMissionService
  ) {

  }

  ngOnInit(): void {
    this.createEquipmentChart();
    this.route.params.subscribe(params => {
      this.missionId = params['id'];
      this.missionTService.getMissionTermineeById(this.missionId).subscribe(
        data => {
          this.missionT = data;
          this.Agentservice.getUserById(this.missionT.controller).subscribe(
            userData => {
                this.controller = userData.name;
              });
              this.Agentservice.getUserById(this.missionT.Responsable).subscribe(
                userData => {
                    this.responsable = userData.name;
                  })

              // Vous pouvez maintenant utiliser this.controller ou this.responsable selon le besoin dans votre application

             this.missionTService.getIntervenantsFromMission(data._id).subscribe(
            intervenantsData => {
              this.intervenants = intervenantsData;
              console.log(this.intervenants);
              this.dataSource = new MatTableDataSource<Intervenant>(this.intervenants); // Pas besoin de l'envelopper dans un tableau
              this.dataSource.paginator = this.paginator;
              this.dataSource.sort = this.sort;
            },
            error => {
              console.error('Erreur lors de la récupération des détails des intervenants :', error);
            }
          );
        },
        error => {
          console.error('Erreur lors de la récupération des détails de la mission :', error);
        }
      );
    });
  }

  logout(){
    localStorage.removeItem('token');
    this.loggedInUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  createEquipmentChart() {
    this.route.params.subscribe(params => {
      this.missionid = params['id'];
      console.log(this.missionId)
      this.missionTService.getEquipementStatsForMission(this.missionid).subscribe(
        (data: any) => {
          console.log("fff",data)
          if (data) { // Vérifiez si data n'est pas null ou undefined
            const equipmentLabels: string[] = [];
            const equipmentValues: number[] = [];
            for (const key in data) {
              if (Object.prototype.hasOwnProperty.call(data, key)) {
                equipmentLabels.push(key);
                equipmentValues.push(data[key]);
              }
            }
            // Maintenant, vos labels et valeurs devraient être corrects pour créer le graphique.
            this.chartOptions = {
              series: equipmentValues,
              chart: {
                width: 380,
                type: 'polarArea'
              },
              labels: equipmentLabels,
              fill: {
                opacity: 1
              },
              stroke: {
                width: 1,
                colors: undefined
              },
              yaxis: {
                show: false
              },
              legend: {
                position: 'bottom'
              },
              plotOptions: {
                polarArea: {
                  rings: {
                    strokeWidth: 0
                  }
                }
              },
              theme: {
                monochrome: {
                  shadeTo: 'light',
                  shadeIntensity: 0.6
                }
              }
            };
          } else {
            console.error("Aucune donnée n'a été renvoyée pour les statistiques des équipements.");
          }
        },
        error => {
          console.error('Erreur lors de la récupération des statistiques des équipements :', error);
        }
      );
    })

}


}


