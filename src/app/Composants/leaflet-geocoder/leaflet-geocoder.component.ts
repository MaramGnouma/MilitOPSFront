import { AfterViewInit, Component } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-leaflet-geocoder',
  templateUrl: './leaflet-geocoder.component.html',
  styleUrls: ['./leaflet-geocoder.component.css']
})
export class LeafletGeocoderComponent implements AfterViewInit {
  constructor(private http: HttpClient) {}

  ngAfterViewInit(): void {
    const map = L.map('map').setView([36.8065, 10.1815], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const defaultIcon = L.icon({
      iconUrl: '/marker-icon.png',
      iconSize: [25, 41],
      iconAnchor: [10, 41],
      popupAnchor: [2, -40]
    });
    L.Marker.prototype.options.icon = defaultIcon;

    let marker1: L.Marker;
    map.on('click', (e) => {
      if (marker1) {
        map.removeLayer(marker1);
      }
      marker1 = L.marker(e.latlng, { icon: defaultIcon }).addTo(map);

      // Géocodage manuel avec l'API de géocodage nominatim de OpenStreetMap
      this.http.get<any>(`https://nominatim.openstreetmap.org/reverse?lat=${e.latlng.lat}&lon=${e.latlng.lng}&format=json`)
        .subscribe(data => {
          const address = data.display_name;
          marker1.bindPopup(address).openPopup();
        });

      L.Routing.control({
        waypoints: [
          L.latLng(36.8065, 10.1815),
          L.latLng(e.latlng.lat, e.latlng.lng)
        ],
        lineOptions: {
          styles: [
            {
              color: 'blue',
              weight: 4,
              opacity: 0.7
            }
          ],
          extendToWaypoints: true,
          missingRouteTolerance: 100 // Ajout de cette option pour corriger l'erreur de type
        },
        routeWhileDragging: false,
        addWaypoints: false,
        fitSelectedRoutes: true,
        showAlternatives: true
      })
      .on('routesfound', function (e) {
        e.routes[0].coordinates.forEach((c: { lat: number; lng: number; }, i: number) => {
          setTimeout(() => {
            marker1.setLatLng([c.lat, c.lng]);
          }, 1000 * i);
        });
      })
      .addTo(map);
    });
  }
}
