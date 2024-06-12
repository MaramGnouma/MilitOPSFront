import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import jsPDF from 'jspdf';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { AgentMission } from 'src/app/Models/agent-mission';
import { Intervenant } from 'src/app/Models/intervenant';
import { Missionterminees } from 'src/app/Models/missionterminees';
import { AgentMissionService } from 'src/app/Services/agent-mission.service';
import { MissiontermineesService } from 'src/app/Services/missionterminees.service';

@Component({
  selector: 'app-listemissionterminees',
  templateUrl: './listemissionterminees.component.html',
  styleUrls: ['./listemissionterminees.component.css']
})
export class ListemissiontermineesComponent implements OnInit{
  private loggedInUserSubject = new BehaviorSubject<any>(null);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort; // Définir MatSort sans optionnel
  displayedColumns: string[] = ['name', 'datedebut', 'dateFin','resultat', 'actions'];
  dataSource!: MatTableDataSource<Missionterminees>; // Déclarer le type de dataSource
  searchTerm: string = '';
  missionId!: string;
missionT!:any[]
missionT1!: Missionterminees;

user!:AgentMission;
intervenants!: Intervenant [];
tab!: Intervenant[];
controller: string = '';
responsable: string = '';
equipements:any;
baseUrl = 'http://localhost:5000';

  constructor(private router:Router,private missionterminnes:MissiontermineesService,
    private Agentservice: AgentMissionService,private http: HttpClient
  ){

  }
  ngOnInit(): void {
    this.loadMissionTerminnees(); // Charger les missions terminées lors de l'initialisation du composant
  }

  loadMissionTerminnees() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const userDetails = JSON.parse(currentUser);
      this.user = userDetails;
      console.log(this.user)
      this.missionterminnes.getMissionsTerminneesByUserId(userDetails._id).subscribe(
        (data: Missionterminees[]) => {
          this.missionT = data;
          this.dataSource = new MatTableDataSource<Missionterminees>(data);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        },
        (error) => {
          console.error('Erreur lors de la récupération des données des missions terminées :', error);
        }
      );
    }
  }
  loadMissionData(): void {
    this.missionterminnes.getMissionTermineeById(this.missionId).subscribe(
      data => {
        this.missionT1 = data;
      },
      error => {
        console.error(error);
      }
    );
  }
  filterMission() {
    if (!this.searchTerm.trim()) {
      this.dataSource.data = this.missionT; // Afficher toutes les missions terminées si le terme de recherche est vide
      return;
    }
    const filteredMissions = this.missionT.filter(mis =>
      mis.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.dataSource.data = filteredMissions; // Mettre à jour la source de données avec les missions filtrées
  }


  logout(){
    // Supprimer les informations d'authentification stockées, par exemple :
    localStorage.removeItem('token');
    this.loggedInUserSubject.next(null);
    // Rediriger vers la page de connexion
    this.router.navigate(['/login']);
  }
  isActive(url: string): boolean {
    return this.router.url === url;
  }

  generateAndPreviewPdf(missionId1:string) {
    // Create a new instance of jsPDF
    const doc = new jsPDF();
    if (!missionId1) {
      console.error("Mission ID is undefined or null");
      return;
    }

    this.missionterminnes.getMissionTermineeById(missionId1).subscribe(
        data => {
          this.missionT1 = data;
          console.log(this.missionT1.controller.name)

          // Add the image to the center of the page at the top
          const imageUrl = '../../../../assets/army.png'; // Replace with your image URL
          doc.addImage(imageUrl, 'PNG', 10, 10, 20, 20); // Adjusted image position

          // Add the report title "Mission Report" at the center
          doc.setFontSize(20);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor('red');
          doc.text("Mission Report", doc.internal.pageSize.getWidth() / 2, 25, { align: 'center' }); // Adjusted text position

          // Add the current date to the right side
          const currentDate = new Date();
          const formattedDate = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;
          doc.setFontSize(10); // Adjust font size for date
          doc.setTextColor('black'); // Adjust text color for date
          doc.text("Tunis , ", doc.internal.pageSize.getWidth() - 20 - doc.getTextWidth("Tunis ,le "), 20, { align: 'right' }); // Adjusted text position for location
    doc.text(formattedDate, doc.internal.pageSize.getWidth() - 20, 20, { align: 'right' }); // Adjusted text position for date
          // Reset font and text color
          doc.setFont('helvetica');
          doc.setTextColor('black');

          // Add mission details
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.text("Mission Name:", 10, 50);
          doc.text(this.missionT1.name, 60, 50);
          doc.text("Responsible:", 10, 60);
          doc.text(this.missionT1.Responsable.name, 60, 60);
          doc.text("Controller :", 10, 70);
          doc.text(this.missionT1.controller.name, 60, 70);
          doc.text("Start Date:", 10, 80);
          doc.text(moment(this.missionT1.datedebut).format('YYYY-MM-DD'), 60, 80);
          doc.text("Start Time:", 10, 90);
          doc.text(this.missionT1.heuredebut, 60, 90);
          doc.text("Objective:", 10, 100);
          doc.text(this.missionT1.objectif, 60, 100);
          doc.text("Address:", 10, 110);
          doc.text(this.missionT1.adresse, 60, 110);
          doc.text("Type:", 10, 120);
          doc.text(this.missionT1.typemission, 60, 120);
          doc.text("Result:", 10, 130);
          doc.text(this.missionT1.resultat, 60, 130);
          if(this.missionT1.cause){
          doc.text("Cause:", 10, 140);
  doc.text(this.missionT1?.cause ? this.missionT1.cause : "No", 60, 140);
  if (this.missionT1.dateFin) {
    doc.text("End Date:", 10, 150);
    doc.text(moment(this.missionT1.dateFin).format('YYYY-MM-DD'), 60, 150);
    }
    if (this.missionT1.heureFin) {
    doc.text("End Time:", 10, 160);
    doc.text(this.missionT1.heureFin, 60, 160);
    }
    if (this.missionT1.rate) {
      doc.text("Rate:", 10, 170);
              doc.text(`${this.missionT1.rate}`, 60, 170);
              }
              if (this.missionT1.rate) {
    doc.text("Total Duration:", 10, 180);
    doc.text(this.missionT1.name, 60, 180);
               } // Correction: Display duration value
        }
        else{
          if (this.missionT1.dateFin) {
            doc.text("End Date:", 10, 140);
            doc.text(moment(this.missionT1.dateFin).format('YYYY-MM-DD'), 60, 140);
            }
            if (this.missionT1.heureFin) {
            doc.text("End Time:", 10, 150);
            doc.text(this.missionT1.heureFin, 60, 150);
            }
              doc.text("Rate:", 10, 160);
                      doc.text(`${this.missionT1.rate}`, 60, 160);

            doc.text("Total Duration:", 10, 170);
            doc.text(this.missionT1.name, 60, 170); // Correction: Display duration value
        }

          this.missionterminnes.getEquipementStatsForMission(missionId1).subscribe(
            (dataequip: any) => {
              // Récupération des données
              this.equipements = Object.entries(dataequip);
            }
          );
          // Add intervenants
          this.missionterminnes.getIntervenantsFromMission(missionId1).subscribe(
            dataIntervenants => {
              const intervenantsData = dataIntervenants.map((intervenant: { name: any; birth: moment.MomentInput; }) => [intervenant.name, moment(intervenant.birth).format('YYYY-MM-DD')]);
              console.log(intervenantsData);

              const tableHtml = `
        <div style="margin-top: 175px">
          <style>
            table {
              width:100px;
              height:100px
              border-collapse: collapse;
              overflow: hidden;
              box-shadow: 0 0 20px rgba(0,0,0,0.1);
              margin-left:15px
            }

            th {
              background-color: rgba(255,255,255,0.2);
              color: #66a5b4;
              font-size:5px;

            }
            td {
              background-color: rgba(255,255,255,0.2);
              color: #455356;
              font-size:5px;


            }

            thead th {
              background-color: #1e1e21;
            }

            tbody tr:hover {
              background-color: rgba(255,255,255,0.3);
            }

            tbody td {
            }

            tbody td:hover:before {
              content: "";
              left: 0;
              right: 0;

              background-color: rgba(255,255,255,0.2);
            }
          </style>
          <table style="border-collapse: collapse;">
          <caption style="caption-side: top;font-size: 5px; font-weight:bold;font-family:helvetica">List of intervenant</caption>

            <thead>
              <tr>
                <th>Name</th>
                <th>Date of Birth</th>
              </tr>
            </thead>
            <tbody>
              ${intervenantsData.map((intervenant: any[]) => `
                <tr>
                  <td>${intervenant[0]}</td>
                  <td>${intervenant[1]}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <table>
          <caption style="caption-side: top;font-size: 5px; font-weight:bold;font-family:helvetica">List of equipment</caption>
            <thead>
              <tr>
                <th>Name</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              ${this.equipements.map((eq: any[]) => `
                <tr>
                  <td>${eq[0]}</td>
                  <td>${eq[1]}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="margin-top: 20px;margin-left:150px">
          <p style="font-size: 8px; font-family: helvetica;">Signature</p>
          <hr />
          </div>
      </div>
        </div>

  `;

      // Add the table HTML to the document
      doc.html(tableHtml, {
        callback: (doc) => {
          // Get a blob representation of the PDF
          const pdfBlob = doc.output("blob");

          // Create a URL from the blob
          const pdfUrl = URL.createObjectURL(pdfBlob);

          // Open a new window to display the PDF preview
          window.open(pdfUrl, "_blank");
        }
      });
    }
  );

  }
  );
            }
            showMissionReport(missionId: string) {
              // Faites une requête HTTP pour récupérer le PDF correspondant à l'identifiant de la mission
              this.http.get(`${this.baseUrl}/rapport/${missionId}`, { responseType: 'blob' })
                .subscribe((pdfBlob: Blob) => {
                  // Créer un objet URL à partir du Blob
                  const fileURL = URL.createObjectURL(pdfBlob);

                  // Créer une nouvelle instance de jsPDF
                  const pdf = new jsPDF();

                  // Convertir le PDF en une image
                  const img = new Image();
                  img.onload = () => {
                    const imgWidth = pdf.internal.pageSize.getWidth();
                    const imgHeight = img.height * imgWidth / img.width;
                    pdf.addImage(img, 'PNG', 0, 0, imgWidth, imgHeight);

                    // Télécharger le PDF
                    pdf.save('mission_report.pdf');
                  };
                  img.src = fileURL;
                });
            }

            getPdfUrl(missionId: string): string {
              if (!missionId) {
                console.error("Mission ID is undefined or null");
              }
              return `http://localhost:5000/pdf/${missionId}`;
            }
            openPdf(missionId: string): void {
              const pdfUrl = this.getPdfUrl(missionId);
              if (pdfUrl) {
                window.open(pdfUrl, '_blank');
              }
            }


            sortMissions(event: Event) {
              const selectedValue = (event.target as HTMLSelectElement).value.toLowerCase();
              let filteredMissions: Missionterminees[] = [];

              if (selectedValue) {
                switch (selectedValue) {
                  case 'success':
                    filteredMissions = this.missionT.filter(m => m.resultat.toLowerCase() === 'success');
                    break;
                  case 'failed':
                    filteredMissions = this.missionT.filter(m => m.resultat.toLowerCase() === 'failed');
                    break;
                  case 'abandoned':
                    filteredMissions = this.missionT.filter(m => m.resultat.toLowerCase() === 'abandoned');
                    break;
                  default:
                    filteredMissions = this.missionT;
                    break;
                }

                // Update dataSource after filtering
                this.dataSource.data = filteredMissions;
              }
            }



        }




