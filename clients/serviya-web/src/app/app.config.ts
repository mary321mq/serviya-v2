import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, inject, provideAppInitializer, importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import Keycloak from 'keycloak-js';
import { LucideAngularModule, Zap, Wrench, Shield, Home, Briefcase, Flame, Search, Filter, Edit, Edit2, Power, Trash2, Plus, LayoutGrid, X, Code, Type, Image, FileText, BarChart2, Eye, Save, Droplet, PaintBucket, Fan, Snowflake, Car, Plug, MoreHorizontal, Folder, Check, Pause, Info, DollarSign, Tag, Star, Clipboard, Camera, ShieldCheck, Users, CheckCircle, UserX, Lock, Unlock, ChevronLeft, ChevronRight, ChevronDown, Download, UserCheck, ClipboardCheck, XCircle, User, RotateCcw, Clock, Mail, Phone, MapPin, Settings, Globe, Monitor, Bell, Calendar, UserPlus, Megaphone, MoreVertical, ChevronsLeft, ChevronsRight, CheckCheck, ReceiptText, FileCheck2, WalletCards, List, History } from 'lucide-angular';

import { routes } from './app.routes';
import { AuthService } from './core/auth/auth.service';
import { KEYCLOAK_INSTANCE } from './core/auth/keycloak.token';
import { tokenInterceptor } from './core/auth/token.interceptor';
import { SERVIYA_APP_CONFIG, serviyaAppConfig } from './core/config/app-config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([tokenInterceptor])),
    importProvidersFrom(LucideAngularModule.pick({ Zap, Wrench, Shield, Home, Briefcase, Flame, Search, Filter, Edit, Edit2, Power, Trash2, Plus, LayoutGrid, X, Code, Type, Image, FileText, BarChart2, Eye, Save, Droplet, PaintBucket, Fan, Snowflake, Car, Plug, MoreHorizontal, Folder, Check, Pause, Info, DollarSign, Tag, Star, Clipboard, Camera, ShieldCheck, Users, CheckCircle, UserX, Lock, Unlock, ChevronLeft, ChevronRight, ChevronDown, Download, UserCheck, ClipboardCheck, XCircle, User, RotateCcw, Clock, Mail, Phone, MapPin, Settings, Globe, Monitor, Bell, Calendar, UserPlus, Megaphone, MoreVertical, ChevronsLeft, ChevronsRight, CheckCheck, ReceiptText, FileCheck2, WalletCards, List, History })),
    { provide: SERVIYA_APP_CONFIG, useValue: serviyaAppConfig },
    {
      provide: KEYCLOAK_INSTANCE,
      useFactory: () =>
        new Keycloak({
          url: serviyaAppConfig.keycloak.url,
          realm: serviyaAppConfig.keycloak.realm,
          clientId: serviyaAppConfig.keycloak.clientId
        })
    },
    provideAppInitializer(() => inject(AuthService).initialize())
  ]
};
