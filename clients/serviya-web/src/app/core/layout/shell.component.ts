import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { NavbarComponent } from './navbar.component';
import { SidebarComponent } from './sidebar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [NavbarComponent, RouterOutlet, SidebarComponent],
  template: `
    <div class="app-shell">
      <app-sidebar />
      <div class="main-column">
        <app-navbar />
        <main class="app-content">
          <router-outlet />
        </main>
      </div>
    </div>
  `
})
export class ShellComponent {}
