import { Component, EventEmitter, Input, Output, AfterViewInit, OnDestroy, ElementRef, ViewChild, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

export interface LocationDetails {
  lat: number;
  lng: number;
  addressLine?: string;
  district?: string;
  city?: string;
  country?: string;
}

// Fix for default Leaflet marker icon not showing correctly in Angular
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-map-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-container">
      <div class="map-wrapper">
        <div #map class="map"></div>
        <button type="button" class="btn-location" (click)="goToCurrentLocation()" title="Centrar en mi ubicación">
          📍 Mi Ubicación
        </button>
        <div class="loading-overlay" *ngIf="isLoadingDetails">
          <span>Obteniendo dirección...</span>
        </div>
      </div>
      <div class="map-instructions">Arrastra el marcador azul o haz clic en el mapa para autocompletar la dirección.</div>
    </div>
  `,
  styles: [`
    .map-container {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .map-wrapper {
      position: relative;
      height: 350px;
      width: 100%;
    }
    .map {
      height: 100%;
      width: 100%;
      border-radius: 8px;
      border: 1px solid #ccc;
      z-index: 1; 
    }
    .btn-location {
      position: absolute;
      bottom: 20px;
      right: 10px;
      z-index: 1000;
      background: white;
      border: 2px solid rgba(0,0,0,0.2);
      border-radius: 4px;
      padding: 8px 12px;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 1px 5px rgba(0,0,0,0.4);
    }
    .btn-location:hover {
      background: #f4f4f4;
    }
    .loading-overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(255,255,255,0.8);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      font-weight: bold;
      color: #333;
    }
    .map-instructions {
      font-size: 0.85rem;
      color: #666;
      text-align: center;
      margin-top: 4px;
    }
  `]
})
export class MapPickerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('map', { static: false }) mapContainer!: ElementRef;
  
  @Input() initialLat = -12.0464; // Default to Lima
  @Input() initialLatStr = '';
  @Input() initialLng = -77.0428;
  @Input() initialLngStr = '';
  
  @Output() locationSelected = new EventEmitter<LocationDetails>();

  private map: L.Map | undefined;
  private marker: L.Marker | undefined;
  isLoadingDetails = false;

  constructor(private zone: NgZone) {}

  ngAfterViewInit() {
    let lat = this.initialLat;
    let lng = this.initialLng;
    if (this.initialLatStr) lat = parseFloat(this.initialLatStr) || lat;
    if (this.initialLngStr) lng = parseFloat(this.initialLngStr) || lng;
    
    setTimeout(() => this.initMap(lat, lng), 100);
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(lat: number, lng: number) {
    this.map = L.map(this.mapContainer.nativeElement).setView([lat, lng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    this.marker = L.marker([lat, lng], {
      draggable: true
    }).addTo(this.map);

    this.marker.on('dragend', () => {
      const position = this.marker?.getLatLng();
      if (position) {
        this.fetchAddressDetails(position.lat, position.lng);
      }
    });

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const position = e.latlng;
      this.marker?.setLatLng(position);
      this.fetchAddressDetails(position.lat, position.lng);
    });
    
    this.map.invalidateSize();
    this.fetchAddressDetails(lat, lng); // Initial fetch
  }

  goToCurrentLocation() {
    if (navigator.geolocation) {
      this.isLoadingDetails = true;
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          this.map?.setView([lat, lng], 16);
          this.marker?.setLatLng([lat, lng]);
          this.fetchAddressDetails(lat, lng);
        },
        (error) => {
          console.error("Error obtaining location", error);
          alert("No se pudo obtener la ubicación. Verifica los permisos de tu navegador.");
          this.isLoadingDetails = false;
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      alert("Geolocalización no soportada por este navegador.");
    }
  }

  async searchAndFlyTo(addressStr: string) {
    this.zone.run(() => {
      this.isLoadingDetails = true;
    });

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressStr)}&format=json&limit=1`, {
        headers: { 'Accept-Language': 'es' }
      });
      const data = await response.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        
        this.map?.flyTo([lat, lng], 15);
        this.marker?.setLatLng([lat, lng]);
        this.fetchAddressDetails(lat, lng);
      } else {
        console.warn('No results found for:', addressStr);
        this.zone.run(() => { this.isLoadingDetails = false; });
      }
    } catch (error) {
      console.error("Search geocoding failed", error);
      this.zone.run(() => { this.isLoadingDetails = false; });
    }
  }

  private async fetchAddressDetails(lat: number, lng: number) {
    this.zone.run(() => {
      this.isLoadingDetails = true;
    });

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
        headers: {
          'Accept-Language': 'es' // Request spanish names
        }
      });
      const data = await response.json();
      
      const address = data.address;
      let addressLine = address?.road || '';
      if (address?.house_number) {
        addressLine += ' ' + address.house_number;
      }
      
      const district = address?.suburb || address?.neighbourhood || address?.city_district || '';
      const city = address?.city || address?.town || address?.village || address?.county || address?.state || '';
      const country = address?.country_code?.toUpperCase() || 'PE';

      this.zone.run(() => {
        this.locationSelected.emit({
          lat,
          lng,
          addressLine: addressLine.trim(),
          district,
          city,
          country
        });
        this.isLoadingDetails = false;
      });
      
    } catch (error) {
      console.error("Reverse geocoding failed", error);
      this.zone.run(() => {
        this.locationSelected.emit({ lat, lng });
        this.isLoadingDetails = false;
      });
    }
  }
}
