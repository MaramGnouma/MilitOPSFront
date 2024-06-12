import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Intervenant } from 'src/app/Models/intervenant';
import { IntervenantService } from 'src/app/Services/intervenant.service';

@Component({
  selector: 'app-soldats',
  templateUrl: './soldats.component.html',
  styleUrls: ['./soldats.component.css']
})
export class SoldatsComponent implements OnInit {
  intervenants!: Intervenant[];
  intervenantsChunked: any[][] = [];
  private loggedInUserSubject = new BehaviorSubject<any>(null);
  searchTerm: string = '';

  constructor(
    private http: HttpClient,
    private intervenantservice:IntervenantService ,
    private router:Router
  ){}
  ngOnInit(): void {

   this.loadIntervenant()
  }
  loadIntervenant(){
    this.intervenantservice.getIntervenants().subscribe(
      (data: Intervenant[]) => { // Assurez-vous de typer 'data' comme un tableau d'objets Soldat
        this.intervenants = data;
      },
      (error) => {
        console.error('Erreur lors de la récupération des données des soldats :', error);
      }
    );
  }
  filterSoldats(): Intervenant[] {
    if (!this.searchTerm.trim()) {
      return this.intervenants; // Return all missions if search term is empty
    }
    return this.intervenants.filter(intervenant =>
      intervenant.name.toLowerCase().includes(this.searchTerm.toLowerCase())
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



