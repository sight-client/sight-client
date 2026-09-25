import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
} from '@angular/common/http';
import DOMPurify from 'dompurify';
import { Observable } from 'rxjs';

const badHtmlInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  if (req.method === 'GET' || req.method === 'DELETE') return next(req);
  if (typeof req.body !== 'string') return next(req);

  const clean = DOMPurify.sanitize(req.body);
  if (clean !== req.body) {
    throw new Error(`BAD HTML HAS DETECTED in: "${(req.body)}"`);
  }

  return next(req);
};

export default badHtmlInterceptor;
