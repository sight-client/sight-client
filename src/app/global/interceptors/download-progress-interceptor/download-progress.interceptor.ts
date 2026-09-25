import {
  // HttpInterceptorFn,
  // HttpHandlerFn,
  HttpRequest,
  HttpEvent,
  HttpEventType,
  HttpInterceptor,
  HttpHandler,
} from '@angular/common/http';
import {
  tap,
  // catchError,
  Observable,
  finalize,
} from 'rxjs';
import { SetProgressSpinnerService } from '@global/services/set-progress-spinner-service/set-progress-spinner.service';
import { Injectable } from '@angular/core';

// Перехватчик, как класс (не рекомендовано документацией, т.к. порядок работы таких перехватчиков неочевиден)
@Injectable()
export class DownloadProgressInterceptor implements HttpInterceptor {
  constructor(private $setProgressSpinnerService: SetProgressSpinnerService) {}
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    this.$setProgressSpinnerService.setSpinnerOn();
    return next.handle(req).pipe(
      tap((event: HttpEvent<unknown>) => {
        switch (event.type) {
          // Не будет работать при использовании withFetch в настройках провайдера HttpClient
          case HttpEventType.UploadProgress:
            console.info('Uploaded ' + event.loaded + ' out of ' + event.total + ' bytes'); // на будущее: добавить процентовку к спинеру у курсора
            break;
          case HttpEventType.DownloadProgress:
            console.info('Downloaded ' + event.loaded + ' out of ' + event.total + ' bytes');
            break;
          // case HttpEventType.Response:
          //   console.log('Finished!');
          //   // console.log(req.url, 'returned a response with status', event.status);
          //   break;
        }
      }),
      finalize(() => {
        this.$setProgressSpinnerService.setSpinnerOff();
      }),
    );
  }
}

// Перехватчик, как функция
// const downloadProgressInterceptor: HttpInterceptorFn = (
//   req: HttpRequest<unknown>,
//   next: HttpHandlerFn,
// ): Observable<HttpEvent<unknown>> => {
//   return next(req).pipe(
//     tap((event: HttpEvent<unknown>) => {
//       switch (event.type) {
//         case HttpEventType.UploadProgress:
//           console.log('Uploaded ' + event.loaded + ' out of ' + event.total + ' bytes');
//           break;
//         case HttpEventType.DownloadProgress:
//           console.log('Downloaded ' + event.loaded + ' out of ' + event.total + ' bytes');
//           break;
//         case HttpEventType.Response:
//           console.log('Finished!');
//           // console.log(req.url, 'returned a response with status', event.status);
//           break;
//       }
//     }),
//     // catchError((error) => {
//     //   console.log(error.message);
//     //   return [];
//     // }),
//     finalize(() => {}),
//   );
// };

// HttpEventType.Sent	- Запрос был отправлен на сервер.
// HttpEventType.UploadProgress	- Отчет HttpUploadProgressEventо ходе загрузки тела запроса
// HttpEventType.ResponseHeader	- Получен заголовок ответа, включая статус и заголовки.
// HttpEventType.DownloadProgress	- Отчет HttpDownloadProgressEventо ходе загрузки тела ответа
// HttpEventType.Response	- Получен весь ответ, включая текст ответа.
// HttpEventType.User	- Пользовательское событие от перехватчика HTTP.
