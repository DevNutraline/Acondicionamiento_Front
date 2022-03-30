import { Injectable, Injector } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { NgxSpinnerService } from "ngx-spinner";
import { GuardService } from "src/app/services/guard/guard.service";
import { NotificationService } from "src/app/services/notification/notification.service";
import { Router } from '@angular/router';
// import 'rxjs';
import { of, Observable, throwError } from 'rxjs';
import { catchError, tap} from 'rxjs/operators';
@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  public userService;
  public spinnerService;

  constructor(private injector: Injector,public router: Router,
    public notificationService: NotificationService,
    public spinner: NgxSpinnerService,) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        this.spinner.hide();
        if (err.status === 401 || err.status === 403) {
          this.router.navigate(["home"]);
          this.notificationService.showError('Error','Token expirado')
          return of(undefined);
        }
        return next.handle(req);
      }
      ));
  }
}