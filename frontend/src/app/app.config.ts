import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
  ]
};

const originalWarn = console.warn;
console.warn = function (...args) {
  const message = args[0]?.toString() || '';
  if (message.includes('recaptcha') || message === 'Timeout') {
    return;
  }
  originalWarn.apply(console, args);
};
