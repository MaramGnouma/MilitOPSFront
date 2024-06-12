import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MissionEnCours } from 'src/app/Models/mission-en-cours';
import { MissionEnCoursService } from 'src/app/Services/mission-en-cours.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-content',
  templateUrl: './modal-content.component.html',
  styleUrls: ['./modal-content.component.css']
})
export class ModalContentComponent implements OnInit {
  resultat: string = '';
  cause: string = '';
  rate!:any;
  showCause: boolean = false;
  showRate: boolean = false;

  missionId!: string;
  mission!: MissionEnCours;

  constructor(public activeModal: NgbActiveModal,
    private missionService: MissionEnCoursService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    console.log(this.missionId); // Utilisation de l'ID de la mission

  }

  loadMissionData(): void {
    this.missionService.getMissionById(this.missionId).subscribe(
      data => {
        this.mission = data;
      },
      error => {
        console.error(error);
      }
    );
  }

  onResultatChange() {
    this.showCause = this.resultat !== 'Success';
    this.showRate = this.resultat !== 'Abandoned';

  }

  updateMissionResult(missionId: string, result: string,rate: number, cause: string | null): void {
    if (cause !== null && rate !== null) {
      this.missionService.updateMissionResult(missionId, result, rate,cause).subscribe(
        response => {
          console.log('Mission result updated successfully: ', rate);
          console.log('Mission result updated successfully: ', response);
          // Display a success SweetAlert to indicate that the mission was updated successfully
          Swal.fire({
            icon: 'success',
            title: 'Mission termined successfully',
            showConfirmButton: false,
            timer: 1500 // Show the alert for 1.5 seconds
          }).then((result) => {
            // Once the alert is closed, check if the modal is still open before redirecting
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

}
