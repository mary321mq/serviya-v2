import { DOCUMENT } from '@angular/common';
import { Injectable, computed, inject, signal } from '@angular/core';
import Keycloak from 'keycloak-js';

import { KEYCLOAK_INSTANCE } from './keycloak.token';

export type AppRole = 'CLIENTE' | 'TECNICO' | 'TRABAJADOR' | 'ADMIN';

export interface AuthSession {
  readonly authenticated: boolean;
  readonly username: string;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly email?: string;
  readonly roles: readonly AppRole[];
}

interface ServiYaToken {
  readonly name?: string;
  readonly given_name?: string;
  readonly family_name?: string;
  readonly preferred_username?: string;
  readonly email?: string;
  readonly realm_access?: {
    readonly roles?: readonly string[];
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly keycloak = inject(KEYCLOAK_INSTANCE);
  private readonly document = inject(DOCUMENT);
  private readonly session = signal<AuthSession>({
    authenticated: false,
    username: 'Invitado',
    roles: []
  });

  readonly sessionState = this.session.asReadonly();
  readonly isAuthenticated = computed(() => this.session().authenticated);
  readonly username = computed(() => this.session().username);
  readonly firstName = computed(() => this.session().firstName);
  readonly lastName = computed(() => this.session().lastName);
  readonly email = computed(() => this.session().email);
  readonly roles = computed(() => this.session().roles);

  async initialize(): Promise<void> {
    try {
      await this.keycloak.init({
        onLoad: 'check-sso',
        pkceMethod: 'S256',
        checkLoginIframe: false,
        silentCheckSsoRedirectUri: `${this.document.location.origin}/assets/silent-check-sso.html`
      });
      this.syncSession();
    } catch (error) {
      console.error('Keycloak initialization failed');
      this.session.set({ authenticated: false, username: 'Invitado', roles: [] });
    }
  }

  login(redirectUri = this.document.location.origin): Promise<void> {
    return this.keycloak.login({ redirectUri });
  }

  register(redirectUri = `${this.document.location.origin}/cliente/perfil`): Promise<void> {
    return this.keycloak.register({ redirectUri });
  }

  logout(): Promise<void> {
    return this.keycloak.logout({ redirectUri: this.document.location.origin });
  }

  manageAccount(): Promise<void> {
    return this.keycloak.accountManagement();
  }

  async getValidToken(): Promise<string | null> {
    if (!this.keycloak.authenticated) {
      return null;
    }

    await this.keycloak.updateToken(30);
    this.syncSession();
    return this.keycloak.token ?? null;
  }

  hasRole(role: AppRole): boolean {
    return this.roles().includes(role);
  }

  hasAnyRole(roles: readonly AppRole[]): boolean {
    return this.hasRole('ADMIN') || roles.some((role) => this.hasRole(role));
  }

  private syncSession(): void {
    const token = this.keycloak.tokenParsed as ServiYaToken | undefined;
    const roles = this.extractRoles(token);
    const username = token?.name ?? token?.preferred_username ?? token?.email ?? 'Usuario';

    let fName = token?.given_name;
    let lName = token?.family_name;

    if (!fName && !lName && token?.name) {
      const parts = token.name.split(' ');
      fName = parts[0];
      lName = parts.slice(1).join(' ');
    }

    this.session.set({
      authenticated: this.keycloak.authenticated === true,
      username,
      firstName: fName,
      lastName: lName,
      email: token?.email,
      roles
    });
  }

  private extractRoles(token: ServiYaToken | undefined): AppRole[] {
    const realmRoles = token?.realm_access?.roles ?? [];
    return realmRoles.filter((role): role is AppRole =>
      ['CLIENTE', 'TECNICO', 'TRABAJADOR', 'ADMIN'].includes(role)
    );
  }
}
