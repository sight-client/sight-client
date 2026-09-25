// import { environment } from '../../../environments/environment';
// interface AppServerConnection {
//   domain: string;
//   host: string;
//   port: number;
// }

// interface AppCatalogConnection {
//   host: string;
//   clientPort: number;
//   serverPort: number;
// }

// export const thisHostFullName = `http://${location.hostname}:${location.port}`;

// // const devServerHost = window.location.origin.slice(7, 19);
// // const devServerHost = location.hostname;
// const apiUrl: URL = new URL(environment.apiUrl); // http://172.17.11.15:5001 - при dev-сборке (на проде environment.ts заменится не будет)
// const apiHost: string = apiUrl.hostname;
// const apiPort: number = +apiUrl.port;
// const apiDomain = getDomain();
// function getDomain() {
//   return `http://${apiHost}:${apiPort}`;
// }

// const catalogUrl: URL = new URL(environment.catalogUrl);
// const catalogHost: string = catalogUrl.hostname;
// const catalogPort: number = +catalogUrl.port;

// // Используется в get-default-domain.interceptor.ts.
// export const appServerConnection: AppServerConnection = {
//   domain: apiDomain,
//   host: apiHost,
//   port: apiPort,
// };

// export const appCatalogConnection: AppCatalogConnection = {
//   host: catalogHost,
//   clientPort: catalogPort,
//   serverPort: 5003,
// };

// /* ---------------------------------------------------------------------------------------- */
// //   При наличии keycloak-авторизации

// // interface KeycloakServerConnection extends AppServerConnection {
// //   realm: string;
// //   clientId: string;
// // }

// // export const keycloakServerConnection: KeycloakServerConnection = {
// //   getDomain() {
// //     return `http://${this.host}:${this.port}`;
// //   },
// //   host: 'localhost',
// //   // host: '10.0.1.194',
// //   port: 8080,
// //   realm: 'travels_auth',
// //   clientId: 'travels_auth_client',
// // };
// /* ---------------------------------------------------------------------------------------- */
