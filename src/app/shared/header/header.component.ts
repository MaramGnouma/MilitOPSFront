import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs';
import { Notification } from 'src/app/Models/notification';
import { AgentMissionService } from 'src/app/Services/agent-mission.service';
import { AuthService } from 'src/app/Services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit{
  userName: string = '';
  userRole: string = '';
  loggedInUserName!: string;
  notifications!:Notification[]
  users!:any;
  private apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
  private apiKey = 'e65a1c335f3fa7b08d53fef28dc9df1c'; // Replace with your API key
  weatherData: any;
  title1: string = '';
  constructor(
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: any,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private Agentservice:AgentMissionService
  ) {
  }


updateTitle(): void {
  this.router.events.pipe(
    filter((event) => event instanceof NavigationEnd),
    map(() => this.route),
    map((route) => {
      while (route.firstChild) {
        route = route.firstChild;
      }
      return route;
    }),
    filter((route) => route.outlet === 'primary'),
    map((route) => route.snapshot.data)
  )
  .subscribe((event) => {
    this.title1 = event['title'];
    // Force la détection des changements ici
    this.cdr.detectChanges();
    console.log(this.title1);
  });
}

ngOnInit(): void {

  // Récupérer les données de l'utilisateur depuis le localStorage
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    const userDetails = JSON.parse(currentUser);
    this.users = userDetails;
    console.log(this.users)
    if (userDetails.notifications) {
      this.Agentservice.getUserNotifications(userDetails._id).subscribe(
        (data: Notification[]) => {
          this.notifications = []; // ou bien, initialisez-le avec les données provenant de votre service
          // Assurez-vous de typer 'data' comme un tableau d'objets Notification
          this.notifications = data;
        },
      )
  } else {
      console.log("Aucune notification n'est disponible pour cet utilisateur.");
  }

  } else {
    this.loggedInUserName = 'Default User';
  }

  console.log(this.loggedInUserName)

  this.showWeather();


}



  formatTime(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString();
  }

  getWeather(latitude: number, longitude: number) {
    const params = new HttpParams()
      .set('lat', latitude.toString())
      .set('lon', longitude.toString())
      .set('appid', this.apiKey)
      .set('units', 'metric');

    console.log(params);
    return this.http.get(this.apiUrl, { params });
  }

  getRouteTitle(route: any): string {
    let title = '';
    if (route.data && route.data.title) {
      title = route.data.title;
    }
    if (route.firstChild) {
      title = this.getRouteTitle(route.firstChild);
    }
    return title;
  }

  showWeather() {
    if (isPlatformBrowser(this.platformId)) {
      navigator.geolocation.getCurrentPosition((position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        this.getWeather(latitude, longitude).subscribe(weatherData => {
          this.weatherData = weatherData;
          console.log(this.weatherData); // Déplacer ici
        });
      });
    }
  }

}
