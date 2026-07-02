import { InjectionToken } from '@angular/core';

export interface ServiYaAppConfig {
  readonly apiBaseUrl: string;
  readonly keycloak: {
    readonly url: string;
    readonly realm: string;
    readonly clientId: string;
  };
}

export const serviyaAppConfig: ServiYaAppConfig = {
  apiBaseUrl: 'http://localhost:18080',
  keycloak: {
    url: 'http://localhost:8089',
    realm: 'serviya',
    clientId: 'serviya-web'
  }
};

export const SERVIYA_APP_CONFIG = new InjectionToken<ServiYaAppConfig>('SERVIYA_APP_CONFIG');
