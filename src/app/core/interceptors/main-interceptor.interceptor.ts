// main-interceptor.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoaderService } from 'src/app/shared/components/loading-spinner/services/loader.service';
import { PrivilegeService } from 'src/app/components/pages/privilege/privilege.service';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

@Injectable()
export class MainInterceptorInterceptor implements HttpInterceptor {

  constructor(
    private loadingSpinnerService: LoaderService,
    private privilegService: PrivilegeService,
    private languageService: LanguagesService,
    private cookieService:CookieService,
    private router:Router
  ) {}

  /*intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const disableLoader = request.headers.get('disableLoader');

    if (!disableLoader || disableLoader.toLowerCase() !== 'true') {
      this.privilegService.updateShowTree(false); // hide the privilege tree during request
      this.loadingSpinnerService.show(); // Display loading spinner
    }
    // Add your additional headers here
    request = request.clone({
      setHeaders: {
        "Accept-Language": this.languageService.getCurrentLanguage()
      }
    });


    return next.handle(request).pipe(
      finalize(() => {
        if (!disableLoader || disableLoader.toLowerCase() !== 'true') {
          this.loadingSpinnerService.hide(); // Hide loading spinner when request is completed
          this.privilegService.updateShowTree(true); // hide the privilege tree after request
        }
      })
    );
  }*/
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      const disableLoader = request.headers.get('disableLoader');
      const login = localStorage.getItem('Login') ;
      if (!disableLoader || disableLoader.toLowerCase() !== 'true') {
        this.privilegService.updateShowTree(false);
        this.loadingSpinnerService.show();
      }
      const token = localStorage.getItem('token')?? "";
      //const token = this.cookieService.get('token')
      // let headersConfig: { [name: string]: string | string[] } = {
      //   'Accept-Language': this.languageService.getCurrentLanguage()
      // };

      // if (token) {
      //   headersConfig['Authorization'] = `Bearer ${token}`;
      // }
      // else{
      //   this.router.navigate(['/auth/login']);
      // }
      if (!token && !login) {
        this.router.navigate(['/auth/login']);
      }

      const headersConfig: { [name: string]: string | string[] } = {
        'Accept-Language': this.languageService.getCurrentLanguage(),
        'Authorization': `Bearer ${token}`,
        'CompanyId': `${localStorage.getItem('companyId')}`,
        'AccountId': `${localStorage.getItem('accountId')}`,
        'uid':`${localStorage.getItem('userId')}`
      };
      request = request.clone({
        setHeaders: headersConfig
      });

      return next.handle(request).pipe(
        finalize(() => {
          if (!disableLoader || disableLoader.toLowerCase() !== 'true') {
            this.loadingSpinnerService.hide();
            this.privilegService.updateShowTree(true);
          }
        })
      );
    }

}
