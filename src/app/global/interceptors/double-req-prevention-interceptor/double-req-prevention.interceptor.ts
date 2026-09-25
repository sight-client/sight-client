import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { finalize } from 'rxjs';

const urlsDict = new Set<string>();

const doubleReqPreventionInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  if (urlsDict.has(req.url)) {
    throw new Error('Double request has canceled');
  } else {
    urlsDict.add(req.url);
    return next(req).pipe(finalize(() => urlsDict.delete(req.url)));
  }
};

export default doubleReqPreventionInterceptor;
