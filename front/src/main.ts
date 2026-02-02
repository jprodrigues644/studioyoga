// === CODE COVERAGE INSTRUMENTATION ===
declare global {
  interface Window {
    Cypress?: any;
    __coverage__?: any;
  }
}

if (window.Cypress) {
  window.__coverage__ = window.__coverage__ || {};
}
// === END CODE COVERAGE ===

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));