import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// define an environment variable that tells Cesium the base URL to load static files
(window as unknown as Record<string, unknown>)['CESIUM_BASE_URL'] = '/sight-client/assets/cesium/';
// При этом в angular.json во всех конфигах сборки д/б: "baseHref": "/sight-client/" - имя репозитория на gitgub (для github pages),
// а в его конфиге ассетов д/б:
//               {
//                 "glob": "**/*",
//                 "input": "node_modules/cesium/Build/Cesium",
//                 "output": "assets/cesium"
//               }

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
