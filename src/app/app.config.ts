import {
  ApplicationConfig,
  // ErrorHandler,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import {
  provideRouter,
  // withViewTransitions
} from '@angular/router';
import { routes } from './app.routes';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptors,
  withInterceptorsFromDi,
} from '@angular/common/http';

import badHtmlInterceptor from '@global/interceptors/bad-html-interceptor/bad-html.interceptor';
import stopDoubleRequestInterceptor from '@global/interceptors/stop-double-request-interceptor/stop-double-request.interceptor';
import cachingGetReqInterceptor from '@global/interceptors/caching-get-req-interceptor/caching-get-req.interceptor';
// import useApiServProxyInterceptor from '@global/interceptors/use-api-serv-proxy-interceptor/use-api-serv-proxy.interceptor';
import { ProgressInterceptor } from '@global/interceptors/show-progress-inrerceptor/show-progress.interceptor';

// import { GlobalErrorHandlerService } from '@global/services/global-error-handler-service/global-error-handler.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    // provideRouter(routes, withViewTransitions()),
    // { provide: ErrorHandler, useClass: GlobalErrorHandlerService },

    provideHttpClient(
      // Порядок перехватчиков в массиве имеет значение
      withInterceptors([
        badHtmlInterceptor,
        stopDoubleRequestInterceptor,
        cachingGetReqInterceptor,
        // useApiServProxyInterceptor,
      ]),
      withInterceptorsFromDi(),
    ),
    { provide: HTTP_INTERCEPTORS, useClass: ProgressInterceptor, multi: true },
  ],
};
