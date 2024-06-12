import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Chart } from 'chart.js/auto';
import { ApexAxisChartSeries, ApexChart, ApexXAxis, ApexYAxis, ApexTitleSubtitle, ApexFill, ApexTooltip, ChartComponent } from 'ng-apexcharts';
import { BehaviorSubject } from 'rxjs';
import { AgentMissionService } from 'src/app/Services/agent-mission.service';
import { EquipementService } from 'src/app/Services/equipement.service';
import { IntervenantService } from 'src/app/Services/intervenant.service';
import { MissionEnCoursService } from 'src/app/Services/mission-en-cours.service';
import { MissiontermineesService } from 'src/app/Services/missionterminees.service';
import { StatistiquesService } from 'src/app/Services/statistiques.service';

export type ChartOptions3 = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis | ApexYAxis[];
  title: ApexTitleSubtitle;
  labels: string[];
  stroke: any; // ApexStroke;
  dataLabels: any; // ApexDataLabels;
  fill: ApexFill;
  tooltip: ApexTooltip;
};
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  controlleurs!: any[];
  intervenants!: any[];
  equipements!: any[];
  missions!:any[];
  private loggedInUserSubject = new BehaviorSubject<any>(null);
  users!:any[];

  missionTypes: string[] = [];
  missionTypeCounts: number[] = [];
  totalIntervenants!: number;
  totalMissions!: number;
  totalControllers!: number;
  totalEquipements!: number;
  chartOptions: any = {}; // Déclaration de la variable chartOptions
  chartOptions2: any = {}; // Déclaration de la variable chartOptions
  chartOptions3: any = {}; // Déclaration de la variable chartOptions
  constructor(
    private elementRef: ElementRef,
    private AgentService: AgentMissionService,
    private intervenantservice:IntervenantService ,
    private equipemntservice:EquipementService,
    private missionservice:MissiontermineesService,
    private statistiquesService: StatistiquesService,
    private router:Router,
  ) {
  }

  ngOnInit(): void {
    this.loadMissionStatsByType();
    this.loadMissionStatsByResponsableAndResult();
    this.plotSuccessAndFailureRatesByType();
    this.missionservice.getMissionsTerminnees().subscribe(missions => {
      this.missions = missions;
      this.totalMissions = missions.length; // Récupérer le nombre total d'intervenants
    });

    this.intervenantservice.getIntervenants().subscribe(intervenants => {
      this.intervenants = intervenants;
      this.totalIntervenants = intervenants.length; // Récupérer le nombre total d'intervenants
    });
    this.AgentService.getUsersByRole('Controller').subscribe(data => {
      this.users = data.filter((user: any) => user.status === 'Accepted')
      this.totalControllers = this.users.length;;
    });



    this.equipemntservice.getEquipements().subscribe(equipements => {
      this.equipements = equipements;
      this.totalEquipements = equipements.length; // Récupérer le nombre total d'équipements
    });
  }

  isActive(url: string): boolean {
    return this.router.url === url;
  }

  logout(){
    // Supprimer les informations d'authentification stockées, par exemple :
    localStorage.removeItem('token');
    this.loggedInUserSubject.next(null);
    // Rediriger vers la page de connexion
    this.router.navigate(['/login']);
  }




  loadMissionStatsByType() {
    this.statistiquesService.getMissionStatsByType().subscribe(data => {
      const missionTypes = data.map((item: any) => item._id);
      const missionTypeCounts = data.map((item: any) => item.count);
      const totalMissions = missionTypeCounts.reduce((acc: any, curr: any) => acc + curr, 0);
      const percentages = missionTypeCounts.map((count: number) => ((count / totalMissions) * 100).toFixed(2) + '%');

      const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33F9', '#F9FF33', '#33F9FF'];

      this.chartOptions = {
        series: missionTypeCounts,
        chart: {
          type: 'donut',
          height: 350
        },
        labels: missionTypes,
        colors: colors,
        indexLabel: "{missionTypeCounts}: {y}%",
        stroke: {
          width: 0
        },
        dataLabels: {
          enabled: true,
          formatter: function(val: any, opts: { seriesIndex: string | number; w: { config: { labels: { [x: string]: string; }; }; }; }) {
            const percent = percentages[opts.seriesIndex];
            return opts.w.config.labels[opts.seriesIndex] + ': ' + percent;
          }
        }
      };
    });
  }

  async loadMissionStatsByResponsableAndResult() {
    try {
        interface Result {
            result: string;
            count: number;
        }

        interface MissionStat {
            responsable: string;
            responsableName: string;
            results: Result[][];
        }

        const missionStats: MissionStat[] = await this.statistiquesService.getMissionStatsByResponsableAndResult().toPromise();

        // Extraction des noms et des identifiants des responsables
        const responsables: { id: string, name: string }[] = missionStats.map(item => ({ id: item.responsable, name: item.responsableName }));
        console.log('Responsables :', responsables);

        // Initialisation d'un objet pour stocker les résultats par responsable
        const resultCountsByResponsable: { [key: string]: { [key: string]: number } } = {};

        missionStats.forEach(item => {
            const responsableId = item.responsable;
            if (!resultCountsByResponsable[responsableId]) {
                resultCountsByResponsable[responsableId] = {};
            }
            item.results.forEach(resultArr => {
                const result = resultArr[0]; // Récupérer le premier (et seul) élément de chaque tableau
                if (resultCountsByResponsable[responsableId][result.result]) {
                    resultCountsByResponsable[responsableId][result.result] += result.count;
                } else {
                    resultCountsByResponsable[responsableId][result.result] = result.count;
                }
            });
        });

        console.log('Résultats par responsable :', resultCountsByResponsable);

        // Construction des données de séries pour le graphique
        const uniqueResults: string[] = Array.from(new Set(missionStats.flatMap(item => item.results.map(resultArr => resultArr[0].result))));

        const seriesData = uniqueResults.map(result => ({
            name: result,
            legendText: result,
            data: responsables.map(responsable => resultCountsByResponsable[responsable.id][result] || 0),
            color: result === 'Success' ? '#33FF57' : result === 'Abandoned' ? '#ff3c12' : result === 'Failed' ? '#3d4980' : '#3d4980'
        }));

        console.log('Données de série :', seriesData);

        this.chartOptions2 = {
            series: seriesData,
            chart: {
                type: 'bar',
                height: 350
            },
            xaxis: {
                categories: responsables.map(responsable => responsable.name) // Utiliser les noms des responsables comme catégories pour l'axe x
            },
            colors: seriesData.map(series => series.color),
            plotOptions: {
                bar: {
                    columnWidth: '15%',
                    endingShape: 'flat',
                    start: 0
                }
            },
            dataLabels: {
                enabled: true
            },
            stroke: {
                width: 1,
                colors: ['#fff']
            },
            legend: {
                show: true,
                position: 'bottom',
                horizontalAlign: 'center',
                floating: false,
                fontSize: '14px',
                offsetY: 10,
                markers: {
                    width: 12,
                    height: 12,
                    radius: 12
                }
            }
        };
    } catch (error) {
        console.error('Error loading mission stats by responsable and result:', error);
    }
}

async plotSuccessAndFailureRatesByType() {
  try {
      const successAndFailureRates = await this.statistiquesService.getAverageSuccessRateByType().toPromise();
      console.log('f', successAndFailureRates);

      const missionTypes = successAndFailureRates.map((data: any) => data._id);
      const successRates = successAndFailureRates.map((data: any) => Number(data.successRate).toFixed(0));
      const failureRates = successAndFailureRates.map((data: any) => Number(data.failureRate).toFixed(0));
      const missionTypeCounts = successAndFailureRates.map((item: any) => item.totalMissions);

      const chartOptions3 = {
          series: [
              {
                  name: 'Number of missions per type',
                  type: "bar",
                  data: missionTypeCounts,
              },
              {
                  name: 'Success Rate (%)',
                  type: "line",
                  data: successRates,
                  color: '#00FF00' // Couleur verte pour la série de taux de réussite
              },
              {
                  name: 'Failure Rate (%)',
                  type: "line",
                  data: failureRates,
                  color: '#FF0000' // Couleur rouge pour la série de taux d'échec
              }
          ],
          chart: {
              height: 350,
              type: "line"
          },
          stroke: {
              width: [0, 4, 4]
          },
          title: {
              text: "Average Success And Failure Rate By Type"
          },
          dataLabels: {
              enabled: true,
              enabledOnSeries: [1, 2]
          },
          labels: missionTypes,
          xaxis: {
              categories: missionTypes
          },
          yaxis: [
              {
                  title: {
                      text: "Number of missions per type"
                  }
              },
              {
                  opposite: true,
                  title: {
                      text: "Success And Failure Rate (%)"
                  },
                  min: 0, // Valeur minimale de l'axe y pour les taux
                  max: 100, // Valeur maximale de l'axe y pour les taux
                  tickAmount: 10, // Nombre de ticks sur l'axe y (pour créer des intervalles de 10 unités)
                  labels: {
                      formatter: function (value: number) {
                          return value.toFixed(0) + "%"; // Ajouter un symbole de pourcentage aux labels et fixer à 0 décimales
                      }
                  }
              }
          ],
          plotOptions: {
            bar: {
                columnWidth: '20%', // Réduire la largeur des barres à 10%
                endingShape: 'flat' // Garder les barres avec une forme plate à la fin
            }
        }
      };

      this.chartOptions3 = chartOptions3;
  } catch (error) {
      console.error('Error plotting success and failure rates by type:', error);
  }
}

}
