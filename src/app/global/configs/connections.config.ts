// import { environment } from '../../../environments/environment';
// interface AppServerConnection {
//   domain: string;
//   host: string;
//   port: number;
// }

// const apiUrl: URL = new URL(environment.apiUrl); // environment.ts заменится при dev-сборке на environment.development.ts
// const apiHost: string = apiUrl.hostname;
// const apiPort: number = +apiUrl.port;
// const apiDomain = getDomain();
// function getDomain() {
//   return `http://${apiHost}:${apiPort}`;
// }

// // Используется в get-default-domain.interceptor.ts.
// export const appServerConnection: AppServerConnection = {
//   domain: apiDomain,
//   host: apiHost,
//   port: apiPort,
// };

/* ---------------------------------------------------------------------------------------- */
//   При наличии keycloack-авторизации

// interface KeycloackServerConnection extends AppServerConnection {
//   realm: string;
//   clientId: string;
// }

// export const keycloackServerConnection: KeycloackServerConnection = {
//   getDomain() {
//     return `http://${this.host}:${this.port}`;
//   },
//   host: 'localhost',
//   // host: '10.0.1.194',
//   port: 8080,
//   realm: 'travels_auth',
//   clientId: 'travels_auth_client',
// };
/* ---------------------------------------------------------------------------------------- */
