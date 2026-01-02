import { APP_INITIALIZER, NgModule, OnInit } from '@angular/core';
import {
    CommonModule,
    HashLocationStrategy,
    LocationStrategy,
    registerLocaleData,
} from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppLayoutModule } from './layout/app.layout.module';
import { NotfoundComponent } from './components/notfound/notfound.component';
import { UsersService } from './components/pages/users/users.service';
import { MainInterceptorInterceptor } from './core/interceptors/main-interceptor.interceptor';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Constant } from './core/constants/constant';
import { SharedModule } from './shared/shared.module';
import { FormsModule } from '@angular/forms';
import {DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { ConfigService } from './shared/services/config.service';
import localeEn from '@angular/common/locales/en';
export function appInitializer(configService: ConfigService) {
    return () => configService.loadConfig();
  }
registerLocaleData(localeEn);
@NgModule({
    declarations: [AppComponent, NotfoundComponent],
    imports: [
        BrowserModule,
        HttpClientModule,
        AppRoutingModule,
        AppLayoutModule,
        ToastrModule.forRoot(),
        BrowserAnimationsModule,
        SharedModule,
        FormsModule,
        CommonModule,
    ],
    exports: [],

    providers: [
        { provide: LocationStrategy, useClass: HashLocationStrategy },
        UsersService,
        MessageService,
        DialogService,MessageService,ConfirmationService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: MainInterceptorInterceptor,
            multi: true,
        },
        { provide: APP_INITIALIZER, useFactory: appInitializer, deps: [ConfigService], multi: true }
    ],
    bootstrap: [AppComponent],
})
export class AppModule implements OnInit {
    constructor(
        private constant: Constant,) {
        document.documentElement.style.fontSize = '11px';
    }
    ngOnInit(): void {}
}
