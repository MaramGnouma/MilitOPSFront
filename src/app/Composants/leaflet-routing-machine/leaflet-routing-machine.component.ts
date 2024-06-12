import { AfterViewInit, Component } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-leaflet-routing-machine',
  templateUrl: './leaflet-routing-machine.component.html',
  styleUrls: ['./leaflet-routing-machine.component.css']
})
export class LeafletRoutingMachineComponent implements AfterViewInit {
  constructor(private http: HttpClient) {}

  ngAfterViewInit() {
    const map = L.map('map').setView([36.8065, 10.1815], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const DefaultIcon = L.icon({
      iconUrl: '/marche.gif',
      iconSize: [90, 90],
    });

    const marker1 = L.marker([36.8065, 10.1815], { icon: DefaultIcon }).addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
      L.Routing.control({
        waypoints: [
          L.latLng(36.8065, 10.1815),
          L.latLng(e.latlng.lat, e.latlng.lng),
        ],
        lineOptions: {
          styles: [{ color: 'blue', weight: 4, opacity: 0.7 }],
          extendToWaypoints: true,
          missingRouteTolerance: 10
        } as L.Routing.LineOptions,
        routeWhileDragging: false,
        addWaypoints: false,
        fitSelectedRoutes: true,
        showAlternatives: true,
      })
      .on('routesfound', (e: any) => {
        e.routes[0].coordinates.forEach((c: any, i: number) => {
          setTimeout(() => {
            marker1.setLatLng([c.lat, c.lng]);
          }, 1000 * i);
        });
      })
      .addTo(map);
    });

    // Initialize the geocoder control
    this.initializeGeocoder(map);
  }

  initializeGeocoder(map: L.Map) {
    const GeocoderControl = L.Control.extend({
      onAdd: (map: L.Map) => {
        const geocoderContainer = L.DomUtil.create('div', 'geocoder-container');
        const input = L.DomUtil.create('input', 'geocoder-input', geocoderContainer);
        input.placeholder = 'Enter location';
        const button = L.DomUtil.create('button', 'geocoder-button', geocoderContainer);
        button.innerText = 'Geocode';

        L.DomEvent.on(button, 'click', () => {
          const query = input.value;
          if (query) {
            this.geocode(query).subscribe((results: any) => {
              if (results.length > 0) {
                const result = results[0];
                const latlng = L.latLng(result.lat, result.lon);
                L.marker(latlng).addTo(map).bindPopup(result.display_name).openPopup();
                map.setView(latlng, 13);
              }
            });
          }
        });

        return geocoderContainer;
      }
    });

    map.addControl(new GeocoderControl({ position: 'topright' }));
  }

  geocode(query: string) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}`;
    return this.http.get(url);
  }
}
