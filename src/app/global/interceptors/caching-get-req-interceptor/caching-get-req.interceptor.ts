import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpEventType,
  HttpParams,
} from '@angular/common/http';
import {
  Observable,
  of,
  tap,
  // catchError
} from 'rxjs';
import chalk from 'chalk';
import { CACHING_ENABLED_TOKEN } from '@global/tokens/http-context-tokens';

import { getUserNameGlobal } from '@global/services/user-data-service/user-data.service';

// Если необходимо кэширование запроса, устанавливать токен на true вручную, в контексте запроса, например:
// const data$ = http.get('/sensitive/data', {
//   context: new HttpContext().set(CACHING_ENABLED_TOKEN, true),
// });

const cache = new Map<
  {
    userName: string | undefined;
    url: string;
    params: HttpParams;
    body: any;
  },
  HttpEvent<unknown>
>();

// Кастомное кэширование запросов
const cachingGetReqInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  if (!req.context?.get(CACHING_ENABLED_TOKEN)) return next(req);
  if (req.method !== 'GET') return next(req);
  const cachedReqObj = {
    userName: getUserNameGlobal(),
    url: req.url,
    params: req?.params,
    body: req?.body,
  };
  if (cache.has(cachedReqObj) && cache.get(cachedReqObj) !== undefined) {
    console.log(chalk.blue('The request has already cached'));
    return of(cache.get(cachedReqObj) as HttpEvent<unknown>);
  } else {
    return next(req).pipe(
      tap((event: HttpEvent<unknown>) => {
        if (event.type === HttpEventType.Response) {
          cache.set(cachedReqObj, event);
        }
      }),
      // catchError((error) => {
      //   console.log(error.message);
      //   return [];
      // }),
    );
  }
};

export default cachingGetReqInterceptor;
