import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { getDepartments, getProvinces, getDistricts } from 'ubigeo-fns';
import { ClienteAddress } from '../../../features/cliente/models/cliente-address.model';
import { ClienteAddressService } from '../../../features/cliente/services/cliente-address.service';

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
  selector: 'app-address-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="address-selector dark-theme">
      
      <div class="light-mode-toggle" *ngIf="!isProfileMode">
        <label class="toggle-option-label">
          <input type="radio" name="mode" [value]="'saved'" [(ngModel)]="mode">
          <span>Usar dirección guardada</span>
        </label>
        <label class="toggle-option-label">
          <input type="radio" name="mode" [value]="'new'" [(ngModel)]="mode" (change)="initMapIfNeeded()">
          <span>Añadir nueva dirección</span>
        </label>
      </div>

      <!-- MODO GUARDADAS -->
      <div *ngIf="mode === 'saved'" class="saved-addresses-container">
        <div class="input-wrapper">
          <span class="prefix-icon">📁</span>
          <select [(ngModel)]="selectedSavedAddressId" (change)="emitSavedAddress()" class="form-control has-prefix">
            <option value="">Selecciona una dirección...</option>
            <option *ngFor="let addr of savedAddresses" [value]="addr.publicId">
              {{ formatAddressString(addr) }}
            </option>
          </select>
        </div>
        <div *ngIf="savedAddresses.length === 0" class="empty-state">
          No tienes direcciones guardadas.
        </div>
      </div>

      <!-- MODO NUEVA -->
      <div *ngIf="mode === 'new'" class="new-address-container">
        
        <div class="header-section" *ngIf="isProfileMode">
          <div class="icon-box">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          </div>
          <div>
            <h3>Dirección</h3>
            <p>Cuéntanos dónde te encuentras para conectarte con técnicos cerca de ti.</p>
          </div>
        </div>

        <div class="ubigeo-grid">
          <div class="form-group">
            <label>Departamento</label>
            <div class="input-wrapper">
              <span class="prefix-icon">🏢</span>
              <select [(ngModel)]="selectedDepartment" (change)="onDepartmentChange()" [disabled]="disabled" class="form-control has-prefix">
                <option value="">Seleccione...</option>
                <option *ngFor="let dep of departments" [value]="dep.code">{{ dep.name }}</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Provincia</label>
            <div class="input-wrapper">
              <span class="prefix-icon">🏢</span>
              <select [(ngModel)]="selectedProvince" (change)="onProvinceChange()" [disabled]="disabled || !selectedDepartment" class="form-control has-prefix">
                <option value="">Seleccione...</option>
                <option *ngFor="let prov of provinces" [value]="prov.code">{{ prov.name }}</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Distrito</label>
            <div class="input-wrapper">
              <span class="prefix-icon">🏢</span>
              <select [(ngModel)]="selectedDistrict" (change)="onDistrictChange()" [disabled]="disabled || !selectedProvince" class="form-control has-prefix">
                <option value="">Seleccione...</option>
                <option *ngFor="let dist of districts" [value]="dist.code">{{ dist.name }}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>Dirección principal <span class="text-red" *ngIf="isProfileMode">*</span></label>
          <div class="input-wrapper">
            <span class="prefix-icon">📍</span>
            <input type="text" [(ngModel)]="addressLine" (input)="emitNewAddress()" [disabled]="disabled" placeholder="Escribe tu dirección (ej: Av. Los Incas 123, Lima)" class="form-control has-prefix">
            <span class="clear-icon" *ngIf="addressLine" (click)="addressLine = ''; emitNewAddress()">✕</span>
          </div>
          <small class="helper-text" *ngIf="isProfileMode">Te sugeriremos opciones mientras escribes</small>
        </div>

        <div class="action-buttons-grid" *ngIf="isProfileMode">
          <button type="button" class="btn-location" (click)="useGPS()">
            <span class="icon">🎯</span>
            <div class="text-left">
              <strong>Usar mi ubicación actual</strong>
              <span>Detectar automáticamente</span>
            </div>
          </button>
          <button type="button" class="btn-map" (click)="searchAddressOnMap()">
            <span class="icon">🗺️</span>
            <div class="text-left">
              <strong>Ajustar en mapa (opcional)</strong>
              <span>Ver y ajustar tu ubicación</span>
            </div>
          </button>
        </div>

        <div class="form-group">
          <label>Referencia <span class="text-muted">(opcional)</span></label>
          <div class="input-wrapper">
            <span class="prefix-icon">🏬</span>
            <input type="text" [(ngModel)]="reference" (input)="emitNewAddress()" [disabled]="disabled" placeholder="Ej: Frente a la plaza, puerta negra, piso 2, etc." class="form-control has-prefix">
          </div>
          <small class="helper-text" *ngIf="isProfileMode">Ayuda adicional para que los técnicos te encuentren fácilmente.</small>
        </div>

        <!-- MODO LIGHT: MAPA NORMAL -->
        <div *ngIf="!isProfileMode" class="map-group-section">
          <div class="map-header-row">
            <p>Ubica tu punto exacto en el mapa (Obligatorio):</p>
            <button type="button" (click)="useGPS()" [disabled]="disabled" class="btn-gps-lite">
              📍 Usar mi ubicación actual
            </button>
          </div>
          <div id="map" class="map-container" [style.pointer-events]="disabled ? 'none' : 'auto'" [style.opacity]="disabled ? '0.7' : '1'"></div>
          <p *ngIf="lat && lng" class="coords-indicator">
            Coordenadas seleccionadas: {{ lat | number:'1.4-4' }}, {{ lng | number:'1.4-4' }}
          </p>
        </div>

        <!-- MODO DARK: VISTA PREVIA -->
        <div class="map-preview-card" *ngIf="isProfileMode">
          <div class="preview-header">
            <h4>Vista previa de tu ubicación</h4>
            <span class="badge" *ngIf="lat && lng">Detectada</span>
          </div>
          <div class="preview-body">
            <div id="map" class="map-container dark-map"></div>
            <div class="address-details" *ngIf="lat && lng">
              <strong>{{ addressLine || 'Ubicación seleccionada' }}</strong>
              <p>{{ getDistrictName() }}{{ getProvinceName() ? ', ' + getProvinceName() : '' }} Perú</p>
              <p class="coords">⏱ Coordenadas:<br>{{ lat | number:'1.4-4' }}, {{ lng | number:'1.4-4' }}</p>
            </div>
          </div>
          <div class="preview-footer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            Podrás ajustar la ubicación en el mapa si es necesario.
          </div>
        </div>

        <div class="save-address-check" *ngIf="!isProfileMode">
          <label class="check-label">
            <input type="checkbox" [(ngModel)]="saveAddress" (change)="emitNewAddress()">
            <span>Guardar esta dirección en mi perfil para futuras solicitudes</span>
          </label>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ESTILOS DARK THEME COMPACT (Siempre activo para coherencia de diseño) */
    .address-selector.dark-theme {
      background: #0b0f19;
      border: 1px solid #1e293b;
      border-radius: 16px;
      padding: 24px;
      font-family: 'Inter', sans-serif;
      color: #f8fafc;
    }
    
    .light-mode-toggle {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .toggle-option-label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      color: #cbd5e1;
      font-size: 0.92rem;
      font-weight: 500;
    }
    .toggle-option-label input[type="radio"] {
      accent-color: #3b82f6;
      cursor: pointer;
    }
    
    .form-control {
      width: 100%;
      padding: 12px 16px;
      border-radius: 12px;
      border: 1px solid #1e293b;
      font-size: 0.95rem;
      color: #f8fafc;
      background: #0f172a;
      box-sizing: border-box;
      outline: none;
      transition: all 0.2s ease;
    }
    .form-control:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
    }
    .form-control.has-prefix {
      padding-left: 44px;
    }
    
    .empty-state {
      color: #64748b;
      font-size: 0.88rem;
      margin-top: 12px;
      font-style: italic;
    }
    
    .new-address-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-top: 16px;
    }
    
    .ubigeo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
    }
    
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .form-group label {
      font-size: 0.9rem;
      color: #cbd5e1;
      font-weight: 600;
    }
    
    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
    }
    .prefix-icon {
      position: absolute;
      left: 16px;
      font-size: 1rem;
      color: #64748b;
      pointer-events: none;
    }
    .clear-icon {
      position: absolute;
      right: 16px;
      cursor: pointer;
      color: #64748b;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: #1e293b;
      font-size: 0.72rem;
      transition: all 0.2s;
    }
    .clear-icon:hover {
      color: #f8fafc;
      background: #334155;
    }
    
    /* Map Container */
    .map-group-section {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 12px;
    }
    .map-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }
    .map-header-row p {
      margin: 0;
      font-size: 0.9rem;
      color: #cbd5e1;
      font-weight: 500;
    }
    .btn-gps-lite {
      background: transparent;
      border: none;
      color: #3b82f6;
      cursor: pointer;
      font-size: 0.88rem;
      font-weight: 600;
      padding: 0;
      transition: color 0.2s;
    }
    .btn-gps-lite:hover {
      color: #60a5fa;
    }
    .map-container {
      height: 250px;
      border-radius: 12px;
      border: 1px solid #1e293b;
      z-index: 1;
    }
    .coords-indicator {
      font-size: 0.8rem;
      color: #3b82f6;
      margin: 4px 0 0 0;
      font-weight: 500;
    }
    
    .save-address-check {
      background: #0f172a;
      border: 1px dashed #1e293b;
      border-radius: 12px;
      padding: 14px;
    }
    .check-label {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      color: #cbd5e1;
      font-size: 0.88rem;
      font-weight: 500;
    }
    .check-label input[type="checkbox"] {
      accent-color: #3b82f6;
      cursor: pointer;
    }

    /* Onboarding wizard custom elements (preserved) */
    .header-section {
      display: flex;
      gap: 16px;
      align-items: center;
      margin-bottom: 24px;
    }
    .icon-box {
      background: #1e293b;
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .header-section h3 { margin: 0 0 4px 0; font-size: 1.25rem; font-weight: 600; color: #f8fafc; }
    .header-section p { margin: 0; font-size: 0.9rem; color: #94a3b8; }
    .text-red { color: #ef4444; margin-left: 4px; }
    .text-muted { color: #64748b; font-weight: normal; margin-left: 4px; }
    .helper-text { color: #64748b; font-size: 0.85rem; margin-top: 6px; }
    
    .action-buttons-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
    .btn-location, .btn-map { background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 16px; display: flex; gap: 12px; align-items: center; cursor: pointer; transition: all 0.2s; color: #f8fafc; text-align: left; }
    .btn-location:hover, .btn-map:hover { background: #1e293b; border-color: #334155; }
    .btn-location .icon { color: #60a5fa; font-size: 1.25rem; }
    .btn-map .icon { color: #c084fc; font-size: 1.25rem; }
    .text-left { display: flex; flex-direction: column; gap: 4px; }
    .text-left strong { font-size: 0.95rem; font-weight: 500; }
    .text-left span { font-size: 0.8rem; color: #64748b; }
    
    .map-preview-card { background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; margin-top: 24px; }
    .preview-header { padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; }
    .preview-header h4 { margin: 0; color: #f8fafc; font-size: 1rem; font-weight: 600; }
    .preview-header .badge { background: #052e16; color: #4ade80; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; border: 1px solid #166534; }
    .preview-body { padding: 20px; display: flex; gap: 20px; align-items: center; }
    .map-container.dark-map { width: 140px; height: 100px; border-radius: 12px; border: 1px solid #334155; flex-shrink: 0; }
    .address-details { display: flex; flex-direction: column; gap: 4px; }
    .address-details strong { color: #f8fafc; font-size: 1rem; }
    .address-details p { color: #94a3b8; font-size: 0.9rem; margin: 0; }
    .address-details .coords { font-size: 0.85rem; margin-top: 8px; color: #64748b; }
    .preview-footer { background: #0b0f19; padding: 12px 20px; font-size: 0.85rem; color: #94a3b8; display: flex; align-items: center; gap: 8px; border-top: 1px solid #1e293b; }
  `]
})
export class AddressSelectorComponent implements OnInit {
  private readonly addressService = inject(ClienteAddressService);

  @Input() isProfileMode = false;
  @Input() initialData: any = null;
  @Input() disabled = false;

  @Output() addressSelected = new EventEmitter<{
    mode: 'saved' | 'new';
    savedAddressId?: string;
    savedAddressString?: string;
    saveAddress?: boolean;
    newAddress?: {
      department: string;
      province: string;
      district: string;
      addressLine: string;
      reference: string;
      lat: number;
      lng: number;
    }
  }>();

  mode: 'saved' | 'new' = 'saved';
  saveAddress = false;
  savedAddresses: ClienteAddress[] = [];
  selectedSavedAddressId: string = '';

  getProvinceName(): string {
    return this.provinces.find(p => p.code === this.selectedProvince)?.name || '';
  }

  getDistrictName(): string {
    return this.districts.find(d => d.code === this.selectedDistrict)?.name || '';
  }
  
  departments: any[] = [];
  provinces: any[] = [];
  districts: any[] = [];

  selectedDepartment: string = '';
  selectedProvince: string = '';
  selectedDistrict: string = '';
  addressLine: string = '';
  reference: string = '';
  lat: number = 0;
  lng: number = 0;

  private map: L.Map | null = null;
  private marker: L.Marker | null = null;

  ngOnInit(): void {
    this.departments = getDepartments();

    if (this.isProfileMode) {
      this.mode = 'new';
      if (this.initialData) {
        this.selectedDepartment = this.initialData.department || '';
        if (this.selectedDepartment) this.provinces = getProvinces(this.selectedDepartment);
        this.selectedProvince = this.initialData.province || '';
        if (this.selectedProvince) this.districts = getDistricts(this.selectedProvince);
        this.selectedDistrict = this.initialData.district || '';
        this.addressLine = this.initialData.addressLine || '';
        this.reference = this.initialData.reference || '';
        this.lat = this.initialData.lat || 0;
        this.lng = this.initialData.lng || 0;
      }
      this.initMapIfNeeded();
    } else {
      // Load saved addresses
      this.addressService.getAddresses().subscribe(addresses => {
        this.savedAddresses = addresses;
        if (addresses.length > 0) {
          this.selectedSavedAddressId = addresses.find(a => a.primary)?.publicId || addresses[0].publicId;
          this.emitSavedAddress();
        } else {
          this.mode = 'new';
          this.initMapIfNeeded();
        }
      });
    }
  }

  onDepartmentChange() {
    this.selectedProvince = '';
    this.selectedDistrict = '';
    this.districts = [];
    if (this.selectedDepartment) {
      this.provinces = getProvinces(this.selectedDepartment);
      const depName = this.departments.find(d => d.code === this.selectedDepartment)?.name || '';
      if (depName) this.updateMapToLocation(depName, 9);
    } else {
      this.provinces = [];
    }
    this.emitNewAddress();
  }

  onProvinceChange() {
    this.selectedDistrict = '';
    if (this.selectedProvince) {
      this.districts = getDistricts(this.selectedProvince);
      const depName = this.departments.find(d => d.code === this.selectedDepartment)?.name || '';
      const provName = this.provinces.find(p => p.code === this.selectedProvince)?.name || '';
      if (provName) this.updateMapToLocation(`${provName}, ${depName}`, 11);
    } else {
      this.districts = [];
    }
    this.emitNewAddress();
  }

  onDistrictChange() {
    const depName = this.departments.find(d => d.code === this.selectedDepartment)?.name || '';
    const provName = this.provinces.find(p => p.code === this.selectedProvince)?.name || '';
    const distName = this.districts.find(d => d.code === this.selectedDistrict)?.name || '';
    if (distName) this.updateMapToLocation(`${distName}, ${provName}, ${depName}`, 14);
    this.emitNewAddress();
  }

  emitSavedAddress() {
    const addr = this.savedAddresses.find(a => a.publicId === this.selectedSavedAddressId);
    this.addressSelected.emit({
      mode: 'saved',
      savedAddressId: this.selectedSavedAddressId,
      savedAddressString: addr ? this.formatAddressString(addr) : ''
    });
  }

  formatAddressString(addr: ClienteAddress): string {
    try {
      const depName = this.departments.find(d => d.code === addr.department)?.name || addr.department;
      let provName = addr.province;
      let distName = addr.district;
      try {
        const provs = getProvinces(addr.department);
        provName = provs.find(p => p.code === addr.province)?.name || addr.province;
      } catch(e){}
      try {
        const dists = getDistricts(addr.province);
        distName = dists.find(d => d.code === addr.district)?.name || addr.district;
      } catch(e){}
      return `${depName} - ${provName} - ${distName}: ${addr.addressLine}`;
    } catch(e) {
      return `${addr.department} - ${addr.province} - ${addr.district}: ${addr.addressLine}`;
    }
  }

  emitNewAddress() {
    const depName = this.departments.find(d => d.code === this.selectedDepartment)?.name || '';
    const provName = this.provinces.find(p => p.code === this.selectedProvince)?.name || '';
    const distName = this.districts.find(d => d.code === this.selectedDistrict)?.name || '';

    this.addressSelected.emit({
      mode: 'new',
      saveAddress: this.saveAddress,
      newAddress: {
        department: depName,
        province: provName,
        district: distName,
        addressLine: this.addressLine,
        reference: this.reference,
        lat: this.lat,
        lng: this.lng
      }
    });
  }

  initMapIfNeeded() {
    if (this.mode === 'new') {
      setTimeout(() => {
        if (!this.map) {
          const startLat = this.lat || -12.0464;
          const startLng = this.lng || -77.0428;
          this.map = L.map('map').setView([startLat, startLng], this.lat ? 16 : 12);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(this.map);

          if (this.lat && this.lng) {
            this.marker = L.marker([this.lat, this.lng]).addTo(this.map!);
          }

          this.map.on('click', (e: L.LeafletMouseEvent) => {
            this.lat = e.latlng.lat;
            this.lng = e.latlng.lng;
            
            if (this.marker) {
              this.marker.setLatLng(e.latlng);
            } else {
              this.marker = L.marker(e.latlng).addTo(this.map!);
            }
            this.reverseGeocode(this.lat, this.lng);
            this.emitNewAddress();
          });
        } else {
          this.map.invalidateSize();
        }
      }, 100);
    }
  }

  private async reverseGeocode(lat: number, lng: number) {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        
        const normalize = (str: string) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim() : "";
        
        const stateName = normalize(addr.state || addr.region || "");
        
        const possibleProvinces = [
          normalize(addr.region),
          normalize(addr.county),
          normalize(addr.state_district),
          normalize(addr.city),
          normalize(addr.municipality)
        ].filter(Boolean);
        
        const possibleDistricts = [
          normalize(addr.city),
          normalize(addr.town),
          normalize(addr.village),
          normalize(addr.suburb),
          normalize(addr.neighbourhood),
          normalize(addr.borough),
          normalize(addr.hamlet)
        ].filter(Boolean);
        
        const dep = this.departments.find(d => {
          const n = normalize(d.name);
          return n === stateName || stateName.includes(n) || n.includes(stateName);
        });
        
        if (dep) {
          this.selectedDepartment = dep.code;
          this.provinces = getProvinces(dep.code);
          
          const prov = this.provinces.find(p => {
            const n = normalize(p.name);
            return possibleProvinces.some(provName => provName === n || provName.includes(n) || n.includes(provName));
          });
          
          if (prov) {
            this.selectedProvince = prov.code;
            this.districts = getDistricts(prov.code);
            
            const dist = this.districts.find(d => {
              const n = normalize(d.name);
              return possibleDistricts.some(distName => distName === n || distName.includes(n) || n.includes(distName));
            });
            
            if (dist) {
              this.selectedDistrict = dist.code;
            }
          }
        }
        
        const road = addr.road || "";
        const houseNumber = addr.house_number || "";
        if (road) {
          this.addressLine = `${road} ${houseNumber}`.trim();
        }
        
        this.emitNewAddress();
      }
    } catch (e) {
      console.error("Reverse geocoding error", e);
    }
  }

  private async updateMapToLocation(query: string, zoom: number, placeMarker: boolean = false) {
    if (!this.map) return;
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query + ', Perú')}`);
      const data = await response.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        this.map.flyTo([lat, lon], zoom, { animate: true, duration: 1.5 });
        
        if (placeMarker) {
          this.lat = lat;
          this.lng = lon;
          if (this.marker) {
            this.marker.setLatLng([lat, lon]);
          } else {
            this.marker = L.marker([lat, lon]).addTo(this.map!);
          }
          this.emitNewAddress();
        }
      } else if (placeMarker) {
        alert('No se pudo encontrar la dirección exacta. Por favor, mueve el mapa y haz clic manualmente.');
      }
    } catch (e) {
      console.error('Error fetching location data for map:', e);
    }
  }

  searchAddressOnMap() {
    if (!this.addressLine) return;
    const depName = this.departments.find(d => d.code === this.selectedDepartment)?.name || '';
    const provName = this.provinces.find(p => p.code === this.selectedProvince)?.name || '';
    const distName = this.districts.find(d => d.code === this.selectedDistrict)?.name || '';
    
    let query = this.addressLine;
    if (distName) query += `, ${distName}`;
    if (provName) query += `, ${provName}`;
    if (depName) query += `, ${depName}`;
    
    this.updateMapToLocation(query, 16, true);
  }

  useGPS() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        if (this.map) {
          this.map.flyTo([lat, lng], 16, { animate: true, duration: 1.5 });
          this.lat = lat;
          this.lng = lng;
          if (this.marker) {
            this.marker.setLatLng([lat, lng]);
          } else {
            this.marker = L.marker([lat, lng]).addTo(this.map!);
          }
          this.reverseGeocode(lat, lng);
          this.emitNewAddress();
        }
      }, (error) => {
        alert('No pudimos acceder a tu ubicación. Por favor, verifica los permisos del navegador.');
      });
    } else {
      alert('Tu navegador no soporta geolocalización.');
    }
  }
}
