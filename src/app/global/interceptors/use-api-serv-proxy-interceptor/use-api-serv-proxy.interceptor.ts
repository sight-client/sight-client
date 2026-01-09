// import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';

// import { appServerConnection } from '@global/configs/connections.config';

// export const useApiServProxyInterceptor: HttpInterceptorFn = (
//   req: HttpRequest<unknown>,
//   next: HttpHandlerFn,
// ) => {
//   if (req.url.startsWith('/api')) {
//     const modifiedReq: HttpRequest<unknown> = req.clone({
//       url: appServerConnection.domain + req.url,
//       timeout: 5000,
//     });
//     return next(modifiedReq);
//   }
//   return next(req);
// };
// export default useApiServProxyInterceptor;
