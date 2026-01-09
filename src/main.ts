import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// define an environment variable that tells Cesium the base URL to load static files
(window as Record<string, any>)['CESIUM_BASE_URL'] = '/sight-client/assets/cesium/';

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
