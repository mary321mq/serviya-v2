import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { PaymentService, TipoComprobante, TipoDocumento } from '../services/payment.service';
import { ServiceRequestService } from '../services/service-request.service';
import { ClienteProfileService } from '../services/cliente-profile.service';
import { ServiceRequestResponseDTO } from '../services/public-catalog.service';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="checkout-container">
      <div *ngIf="loading" class="loading-state">
        <p>Procesando tu solicitud...</p>
      </div>

      <div *ngIf="!loading && !pagoCompletado" class="checkout-grid">
        
        <!-- Columna Izquierda -->
        <div class="checkout-left">
          <a class="back-link" (click)="irMisSolicitudes()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Volver a la solicitud
          </a>
          
          <div class="header-section">
            <div class="titles">
              <h1 class="page-title">Pagar cotización</h1>
              <p class="page-subtitle">Revisa el resumen y completa el pago de forma segura.</p>
            </div>
            
            <div class="checkout-stepper">
              <div class="step active">
                <div class="circle">1</div>
                <span>Resumen</span>
              </div>
              <div class="step-line"></div>
              <div class="step">
                <div class="circle">2</div>
                <span>Comprobante</span>
              </div>
              <div class="step-line"></div>
              <div class="step">
                <div class="circle">3</div>
                <span>Pago</span>
              </div>
            </div>
          </div>

          <!-- Tarjeta Comprobante -->
          <div class="checkout-card">
            <h3 class="card-title">
              <div class="icon-box blue-light"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg></div>
              Comprobante
            </h3>
            
            <div class="toggle-buttons">
              <button type="button" class="btn-toggle" [class.active]="tipoComprobante === 'BOLETA'" (click)="seleccionarComprobante('BOLETA')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2" ry="2"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M7 15h2"/></svg>
                Boleta (DNI)
              </button>
              <button type="button" class="btn-toggle" [class.active]="tipoComprobante === 'FACTURA'" (click)="seleccionarComprobante('FACTURA')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                Factura (RUC)
              </button>
            </div>
            
            <div class="form-grid">
              <div class="input-group">
                <label>{{ tipoComprobante === 'BOLETA' ? 'Nombre completo' : 'Razón social' }}</label>
                <input type="text" [(ngModel)]="nombreCliente" [placeholder]="tipoComprobante === 'BOLETA' ? 'MARIA MAMANI LUQUE' : 'Empresa SAC'">
              </div>
              <div class="input-group">
                <label>{{ tipoDocumento }}</label>
                <input type="text" [(ngModel)]="numeroDocumento" [attr.maxlength]="tipoDocumento === 'DNI' ? 8 : 11" inputmode="numeric" [placeholder]="tipoDocumento === 'DNI' ? '8 dígitos' : '11 dígitos'" (input)="soloNumerosDocumento()">
              </div>
            </div>
          </div>

          <!-- Tarjeta Método de pago -->
          <div class="checkout-card">
            <h3 class="card-title">
              <div class="icon-box blue-light"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg></div>
              Método de pago
            </h3>
            
            <div class="toggle-buttons payment-tabs">
              <button type="button" class="btn-toggle" [class.active]="metodoPago === 'TARJETA'" (click)="metodoPago = 'TARJETA'">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                Tarjeta
              </button>
              <button type="button" class="btn-toggle" [class.active]="metodoPago === 'QR'" (click)="metodoPago = 'QR'">
                <span style="font-weight: 800; font-style: italic; font-size: 1.1em;">S/</span> Yape / Plin
              </button>
            </div>

            <!-- Formularios de pago -->
            <div *ngIf="metodoPago === 'TARJETA'" class="payment-form-box">
              <div class="security-header">
                <div class="security-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  Información de pago
                </div>
                <div class="security-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  Pago seguro y cifrado
                </div>
              </div>
              
              <div class="form-grid">
                <div class="input-group">
                  <label>Correo electrónico</label>
                  <input type="email" placeholder="ejemplo@correo.com">
                </div>
                <div class="input-group">
                  <label>Número de tarjeta</label>
                  <div class="card-input-wrapper">
                    <input type="text" placeholder="0000 0000 0000 0000" maxlength="19" inputmode="numeric">
                    <div class="card-icons">
                      <span style="color:#1a1f71; font-weight:800; font-style:italic; font-size: 0.8rem;">VISA</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="form-grid" style="margin-top: 16px;">
                <div class="input-group">
                  <label>Fecha de vencimiento</label>
                  <input type="text" placeholder="MM/AA" maxlength="5" inputmode="numeric">
                </div>
                <div class="input-group">
                  <label>CVV</label>
                  <input type="password" placeholder="123" maxlength="4" inputmode="numeric">
                </div>
              </div>
            </div>

            <div *ngIf="metodoPago === 'QR'" class="payment-form-box qr-box">
              <p>Escanea el código QR desde tu app Yape o Plin para pagar <strong>S/ {{ monto | number:'1.2-2' }}</strong>.</p>
              <img *ngIf="!qrImageError" [src]="qrImageUrl" alt="Código QR Yape/Plin" (error)="qrImageError = true">
              <div *ngIf="qrImageError" class="error-msg">No se pudo cargar el QR de pago.</div>
              <div class="input-group">
                <label>Número de operación Yape/Plin</label>
                <input type="text" [(ngModel)]="numeroOperacionQR" placeholder="Ej. 12345678" (input)="soloNumerosOperacion()">
              </div>
            </div>
          </div>
          
          <!-- Beneficios (Footer) -->
          <div class="benefits-row">
            <div class="benefit-item">
              <div class="icon-circle blue"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
              <div>
                <h4>Pago seguro</h4>
                <p>Tus datos están protegidos con encriptación SSL.</p>
              </div>
            </div>
            <div class="benefit-item">
              <div class="icon-circle green"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg></div>
              <div>
                <h4>Comprobante digital</h4>
                <p>Recibe tu comprobante al instante en tu correo.</p>
              </div>
            </div>
            <div class="benefit-item">
              <div class="icon-circle purple"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9333ea" stroke-width="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg></div>
              <div>
                <h4>Soporte 24/7</h4>
                <p>Estamos disponibles para ayudarte siempre.</p>
              </div>
            </div>
          </div>
          
        </div>

        <!-- Columna Derecha (Resumen de Pago) -->
        <div class="checkout-right">
          <div class="summary-card">
            <h3 class="card-title">
              <div class="icon-box blue"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg></div>
              Resumen de pago
            </h3>
            
            <div class="summary-details">
              <div class="detail-row">
                <span class="label">Solicitud</span>
                <span class="value dark">Lista para pagar</span>
              </div>
              <div class="detail-row" *ngIf="clienteFullname">
                <span class="label">Cliente</span>
                <span class="value uppercase">{{ clienteFullname }}</span>
              </div>
              
              <div class="quote-detail" *ngIf="solicitud && (solicitud.items?.length || (pagoVisita && solicitud.costoVisita))">
                <h4>Detalle de la cotización</h4>
                <div class="quote-row" *ngIf="pagoVisita && solicitud.costoVisita > 0">
                  <span>Costo de Evaluación (x1)</span>
                  <span>S/ {{ solicitud.costoVisita | number:'1.2-2' }}</span>
                </div>
                <div class="quote-row" *ngFor="let item of solicitud.items">
                  <span>{{ item.descripcion }} (x{{ item.cantidad }})</span>
                  <span>S/ {{ (item.cantidad * item.precioUnitario) | number:'1.2-2' }}</span>
                </div>
              </div>
            </div>
            
            <div class="total-box-alt">
              <span class="total-label-alt">Total a pagar</span>
              <span class="total-amount-alt">S/ {{ monto | number:'1.2-2' }}</span>
            </div>
            
            <button class="btn-primary" (click)="iniciarPago(metodoPago === 'TARJETA' ? 'MERCADO_PAGO' : 'YAPE_PLIN')" [disabled]="procesando || (metodoPago === 'QR' && !numeroOperacionQR)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              {{ procesando ? 'Procesando Pago...' : 'Pagar S/ ' + (monto | number:'1.2-2') }}
            </button>
            
            <button class="btn-outline" (click)="irMisSolicitudes()">
              Cancelar
            </button>
            
            <div class="payment-methods-footer">
              <p>Aceptamos los siguientes métodos de pago</p>
              <div class="methods-logos">
                <span class="logo-box" style="color:#1a1f71; font-weight:900; font-style:italic;">VISA</span>
                <span class="logo-box" style="color:#eb001b;">MC</span>
                <span class="logo-box" style="color:#783183; font-weight:800; font-style:italic;">Yape</span>
                <span class="logo-box" style="color:#00c1d4; font-weight:800; font-style:italic;">Plin</span>
                <span class="logo-box" style="font-size:0.75rem;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> TRANSFERENCIA</span>
              </div>
            </div>
            
            <div *ngIf="error" class="error-msg" style="margin-top: 16px;">
              {{ error }}
            </div>
          </div>
        </div>
      </div>

      <!-- Estado Completado -->
      <div *ngIf="pagoCompletado" class="success-state">
        <div class="success-icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
        <h3>Pago realizado con éxito</h3>
        <p>Tu dinero está seguro en Escrow. Ya puedes descargar tu {{ tipoComprobante.toLowerCase() }}.</p>
        <div class="actions">
          <button class="btn-primary" (click)="descargarComprobante()" [disabled]="descargandoComprobante">
            {{ descargandoComprobante ? 'Descargando...' : 'Descargar ' + tipoComprobante.toLowerCase() }}
          </button>
          <button class="btn-dark" (click)="irMisSolicitudes()">
            Ver mis solicitudes
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .checkout-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 24px;
      font-family: 'Inter', sans-serif;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      min-height: 100vh;
    }
    
    .checkout-grid {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 32px;
      align-items: start;
    }
    
    @media (max-width: 900px) {
      .checkout-grid { grid-template-columns: 1fr; }
    }
    
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: #475569;
      font-weight: 500;
      font-size: 0.95rem;
      cursor: pointer;
      margin-bottom: 24px;
      transition: all 0.2s;
      padding: 8px 16px;
      border-radius: 8px;
      background: white;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }
    .back-link:hover { 
      color: #4f46e5; 
      border-color: #4f46e5;
      transform: translateY(-1px);
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    }
    
    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }
    .page-title {
      font-size: 2.25rem;
      font-weight: 800;
      background: linear-gradient(135deg, #0f172a 0%, #4f46e5 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0 0 8px 0;
      letter-spacing: -0.02em;
    }
    .page-subtitle {
      color: #64748b;
      font-size: 1.05rem;
      margin: 0;
    }
    
    .checkout-stepper {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 24px;
      background: white;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      color: #94a3b8;
      font-size: 0.8rem;
      font-weight: 600;
    }
    .step.active {
      color: #4f46e5;
    }
    .step .circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      font-weight: 700;
      transition: all 0.3s;
    }
    .step.active .circle {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
    }
    .step-line {
      width: 40px;
      height: 3px;
      background: linear-gradient(90deg, #e2e8f0 0%, #cbd5e1 100%);
      border-radius: 2px;
      margin-bottom: 16px;
    }
    
    .checkout-card {
      background: white;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      padding: 28px;
      margin-bottom: 24px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .checkout-card:hover {
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.04);
    }
    .card-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 1.25rem;
      color: #0f172a;
      font-weight: 800;
      margin: 0 0 24px 0;
      letter-spacing: -0.01em;
    }
    .icon-box {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .icon-box.blue-light { 
      background: linear-gradient(135deg, #e0e7ff 0%, #dbeafe 100%); 
      box-shadow: 0 2px 8px rgba(79, 70, 229, 0.15);
    }
    .icon-box.blue { 
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); 
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
    }
    
    .toggle-buttons {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
    }
    .btn-toggle {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 14px;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      background: white;
      color: #64748b;
      font-weight: 700;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }
    .btn-toggle:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }
    .btn-toggle.active {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      border-color: transparent;
      color: white;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
    }
    
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    @media (max-width: 600px) {
      .form-grid { grid-template-columns: 1fr; }
    }
    .input-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .input-group label {
      font-size: 0.875rem;
      color: #374151;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .input-group input {
      padding: 14px 16px;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      font-size: 1rem;
      color: #0f172a;
      outline: none;
      transition: all 0.3s;
      font-weight: 500;
    }
    .input-group input:focus {
      border-color: #4f46e5;
      box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
    }
    .input-group input::placeholder {
      color: #94a3b8;
    }
    
    .payment-tabs .btn-toggle {
      background: #f8fafc;
      border-color: #e2e8f0;
    }
    .payment-tabs .btn-toggle.active {
      background: white;
      border-color: #4f46e5;
      color: #4f46e5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    }
    
    .payment-form-box {
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      padding: 24px;
      background: linear-gradient(180deg, #fefefe 0%, #f8fafc 100%);
    }
    .security-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid #e2e8f0;
    }
    .security-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 800;
      color: #0f172a;
      font-size: 1.05rem;
    }
    .security-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
      color: #059669;
      font-weight: 700;
      padding: 6px 12px;
      background: #ecfdf5;
      border-radius: 8px;
    }
    .card-input-wrapper {
      position: relative;
    }
    .card-input-wrapper input {
      width: 100%;
      box-sizing: border-box;
    }
    .card-icons {
      position: absolute;
      right: 16px;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      gap: 6px;
    }
    
    .qr-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .qr-box img {
      width: 220px;
      height: 220px;
      margin: 20px 0;
      border-radius: 16px;
      border: 2px dashed #cbd5e1;
      padding: 16px;
      background: white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    .qr-box p {
      font-size: 1rem;
      color: #374151;
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    .benefits-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-top: 32px;
    }
    .benefit-item {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 20px;
      background: white;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      transition: all 0.2s;
    }
    .benefit-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }
    .icon-circle {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .icon-circle.blue { background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); }
    .icon-circle.green { background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); }
    .icon-circle.purple { background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%); }
    .benefit-item h4 {
      margin: 0 0 6px 0;
      font-size: 0.95rem;
      color: #0f172a;
      font-weight: 800;
    }
    .benefit-item p {
      margin: 0;
      font-size: 0.85rem;
      color: #64748b;
      line-height: 1.5;
    }
    
    .checkout-right {
      position: sticky;
      top: 24px;
    }
    .summary-card {
      background: linear-gradient(180deg, white 0%, #fefefe 100%);
      border-radius: 20px;
      border: 1px solid #e2e8f0;
      padding: 32px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
    }
    .summary-details {
      margin: 28px 0;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 18px;
      font-size: 1rem;
    }
    .detail-row .label { color: #64748b; font-weight: 600; }
    .detail-row .value { font-weight: 700; }
    .detail-row .value.dark { color: #0f172a; }
    .detail-row .value.uppercase { text-transform: uppercase; color: #0f172a; }
    
    .quote-detail {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border-radius: 12px;
      padding: 20px;
      margin-top: 20px;
      border: 1px solid #e2e8f0;
    }
    .quote-detail h4 {
      margin: 0 0 16px 0;
      font-size: 0.95rem;
      color: #334155;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .quote-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
      color: #475569;
      margin-bottom: 10px;
      font-weight: 500;
    }
    
    .total-box-alt {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      border-radius: 16px;
      padding: 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 28px;
      box-shadow: 0 8px 20px rgba(79, 70, 229, 0.3);
    }
    .total-label-alt {
      color: #e0e7ff;
      font-weight: 700;
      font-size: 1.1rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .total-amount-alt {
      color: white;
      font-size: 2.5rem;
      font-weight: 900;
      letter-spacing: -0.02em;
    }
    
    .btn-primary {
      width: 100%;
      padding: 18px;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: white;
      border: none;
      border-radius: 14px;
      font-weight: 800;
      font-size: 1.1rem;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;
      transition: all 0.3s;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
    }
    .btn-primary:hover:not(:disabled) { 
      background: linear-gradient(135deg, #4338ca 0%, #6d28d9 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(79, 70, 229, 0.5);
    }
    .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
    
    .btn-outline {
      width: 100%;
      padding: 16px;
      background: white;
      color: #334155;
      border: 2px solid #e2e8f0;
      border-radius: 14px;
      font-weight: 700;
      font-size: 1rem;
      cursor: pointer;
      margin-top: 14px;
      transition: all 0.3s;
    }
    .btn-outline:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
      transform: translateY(-1px);
    }
    
    .payment-methods-footer {
      margin-top: 36px;
      text-align: center;
    }
    .payment-methods-footer p {
      font-size: 0.85rem;
      color: #64748b;
      margin: 0 0 16px 0;
      font-weight: 600;
    }
    .methods-logos {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .logo-box {
      background: white;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      padding: 10px 16px;
      font-size: 0.95rem;
      font-weight: 700;
      transition: all 0.2s;
    }
    .logo-box:hover {
      border-color: #cbd5e1;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }
    
    .error-msg {
      padding: 16px;
      background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
      border: 2px solid #fecaca;
      color: #dc2626;
      border-radius: 12px;
      font-size: 0.95rem;
      text-align: center;
      font-weight: 600;
      margin-top: 20px;
    }
    
    .success-state {
      text-align: center;
      padding: 80px 20px;
      max-width: 550px;
      margin: 0 auto;
    }
    .success-icon {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 32px;
      box-shadow: 0 8px 24px rgba(5, 150, 105, 0.2);
    }
    .success-state h3 {
      font-size: 2rem;
      color: #0f172a;
      margin: 0 0 16px 0;
      font-weight: 900;
      letter-spacing: -0.02em;
    }
    .success-state p {
      color: #64748b;
      font-size: 1.15rem;
      margin: 0 0 40px 0;
      line-height: 1.6;
    }
    .actions {
      display: flex;
      gap: 20px;
      justify-content: center;
      flex-wrap: wrap;
    }
    .btn-dark {
      padding: 16px 32px;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-weight: 700;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.3);
    }
    .btn-dark:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(15, 23, 42, 0.4);
    }
  `]
})
export class CheckoutPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly paymentService = inject(PaymentService);
  private readonly requestService = inject(ServiceRequestService);
  private readonly profileService = inject(ClienteProfileService);

  solicitudId = 0;
  solicitud: any = null;
  clienteFullname = '';
  monto = 0;

  loading = true;
  procesando = false;
  simulando = false;
  descargandoComprobante = false;
  pasoSimulacion = false;
  pagoCompletado = false;
  error = '';
  pagoVisita = false;

  transaccionId = 0;
  codigoOperacionExterna = '';

  metodoPago: 'TARJETA' | 'QR' = 'TARJETA';
  tipoComprobante: TipoComprobante = 'BOLETA';
  tipoDocumento: TipoDocumento = 'DNI';
  nombreCliente = '';
  numeroDocumento = '';
  numeroOperacionQR = '';
  qrImageUrl = '/assets/images/qr-pago.png';
  qrImageError = false;

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['solicitudId']) {
        this.solicitudId = +params['solicitudId'];
        this.pagoVisita = !!params['montoVisita'];
        this.monto = +(params['monto'] || params['montoVisita'] || 0);
        
        // Fetch request details
        this.requestService.getRequest(this.solicitudId.toString()).subscribe({
          next: (req) => {
            this.solicitud = req;
            if (params['montoVisita']) {
              this.monto = req.costoVisita || this.monto;
            } else {
              this.monto = req.costoTotal || this.monto;
            }
          }
        });
        
        // Fetch client profile
        this.profileService.getProfile().subscribe({
          next: (prof) => {
            const fullName = `${prof.firstName || ''} ${prof.lastName || ''}`.trim();
            this.clienteFullname = fullName;
            if (!this.nombreCliente) this.nombreCliente = fullName;
          }
        });

        this.loading = false;
      } else {
        this.error = 'No se encontro la informacion de la solicitud.';
        this.loading = false;
      }
    });
  }

  seleccionarComprobante(tipo: TipoComprobante): void {
    this.tipoComprobante = tipo;
    this.tipoDocumento = tipo === 'BOLETA' ? 'DNI' : 'RUC';
    this.numeroDocumento = '';
    this.error = '';
  }

  soloNumerosDocumento(): void {
    const maxLength = this.tipoDocumento === 'DNI' ? 8 : 11;
    this.numeroDocumento = this.numeroDocumento.replace(/\D/g, '').slice(0, maxLength);
  }

  soloNumerosOperacion(): void {
    this.numeroOperacionQR = this.numeroOperacionQR.replace(/\D/g, '').slice(0, 24);
  }

  iniciarPago(pasarela: 'MERCADO_PAGO' | 'YAPE_PLIN'): void {
    if (!this.validarComprobante()) {
      return;
    }
    if (pasarela === 'YAPE_PLIN' && !this.numeroOperacionQR) {
      this.error = 'Ingresa el numero de operacion de Yape/Plin.';
      return;
    }

    this.procesando = true;
    this.error = '';

    this.paymentService.crearIntencionPago({
      solicitudId: this.solicitudId,
      montoTotal: this.monto,
      pasarela,
      codigoOperacionExterna: pasarela === 'YAPE_PLIN' ? this.numeroOperacionQR : undefined,
      tipoComprobante: this.tipoComprobante,
      tipoDocumento: this.tipoDocumento,
      numeroDocumento: this.numeroDocumento,
      nombreCliente: this.nombreCliente
    }).subscribe({
      next: (res) => {
        this.procesando = false;
        this.transaccionId = res.id;
        this.codigoOperacionExterna = res.codigoOperacionExterna;

        this.simularExito();
      },
      error: (err) => {
        this.procesando = false;
        this.error = this.obtenerMensajeError(err, 'Ocurrio un error al crear la intencion de pago.');
        console.error(err);
      }
    });
  }

  simularExito(): void {
    this.simulando = true;
    this.error = '';

    this.paymentService.simularWebhook({
      codigoOperacionExterna: this.codigoOperacionExterna || this.transaccionId.toString(),
      estadoExterno: 'APPROVED'
    }).subscribe({
      next: () => {
        this.requestService.markPaid(this.solicitudId.toString()).subscribe({
          next: (request) => {
            this.solicitud = request;
            this.simulando = false;
            this.pagoCompletado = true;
          },
          error: (err) => {
            this.simulando = false;
            this.error = this.obtenerMensajeError(err, 'El pago fue aprobado, pero no se pudo actualizar la solicitud.');
            console.error(err);
          }
        });
      },
      error: (err) => {
        this.simulando = false;
        this.error = this.obtenerMensajeError(err, 'Error en el webhook simulado.');
        console.error(err);
      }
    });
  }

  descargarComprobante(): void {
    if (!this.transaccionId) {
      this.error = 'No hay una transaccion pagada para descargar.';
      return;
    }

    this.descargandoComprobante = true;
    this.error = '';

    this.paymentService.descargarComprobante(this.transaccionId).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.tipoComprobante.toLowerCase()}-serviya-${this.transaccionId}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
        this.descargandoComprobante = false;
      },
      error: (err) => {
        this.descargandoComprobante = false;
        this.error = this.obtenerMensajeError(err, 'No se pudo descargar el comprobante.');
        console.error(err);
      }
    });
  }

  irMisSolicitudes(): void {
    this.router.navigate(['/cliente/solicitudes']);
  }

  private validarComprobante(): boolean {
    const nombre = this.nombreCliente.trim();
    if (!nombre) {
      this.error = this.tipoComprobante === 'BOLETA'
        ? 'Ingresa el nombre para la boleta.'
        : 'Ingresa la razon social para la factura.';
      return false;
    }

    if (this.tipoDocumento === 'DNI' && !/^\d{8}$/.test(this.numeroDocumento)) {
      this.error = 'Para boleta debes ingresar un DNI valido de 8 digitos.';
      return false;
    }

    if (this.tipoDocumento === 'RUC' && !/^\d{11}$/.test(this.numeroDocumento)) {
      this.error = 'Para factura debes ingresar un RUC valido de 11 digitos.';
      return false;
    }

    this.nombreCliente = nombre;
    return true;
  }

  private obtenerMensajeError(err: any, fallback: string): string {
    const body = err?.error;
    if (typeof body === 'string') {
      try {
        const parsed = JSON.parse(body);
        return parsed.detail || parsed.message || fallback;
      } catch {
        return body || fallback;
      }
    }
    return body?.detail || body?.message || body?.title || err?.message || fallback;
  }
}
