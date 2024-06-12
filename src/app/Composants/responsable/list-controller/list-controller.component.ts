import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AgentMission } from 'src/app/Models/agent-mission';
import { AgentMissionService } from 'src/app/Services/agent-mission.service';

@Component({
  selector: 'app-list-controller',
  templateUrl: './list-controller.component.html',
  styleUrls: ['./list-controller.component.css']
})
export class ListControllerComponent implements OnInit {
  users!: AgentMission[];
  intervenantsChunked: any[][] = [];
  private loggedInUserSubject = new BehaviorSubject<any>(null);
  searchTerm: string = '';
  constructor(
    private http: HttpClient,
    private Agentservice:AgentMissionService ,
    private router:Router
  ){}
  ngOnInit(): void {

   this.loadController()
  }
  loadController() {
    this.Agentservice.getUsersByRole('Controller').subscribe(
      (data: AgentMission[]) => {
        this.users = data.filter((user: any) => user.status === 'Accepted');
      },
      (error) => {
        console.error('Erreur lors de la récupération des données des contrôleurs :', error);
      }
    );
  }



  filterController(): AgentMission[] {
    if (!this.searchTerm.trim()) {
      return this.users; // Return all missions if search term is empty
    }
    return this.users.filter(user =>
      user.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
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
  }



