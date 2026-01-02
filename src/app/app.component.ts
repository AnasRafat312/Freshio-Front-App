import { LayoutService } from './layout/service/app.layout.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { LoaderService } from './shared/components/loading-spinner/services/loader.service';
import { PrivilegeService } from './components/pages/privilege/privilege.service';
import { SharedService } from './shared/services/shared.service';
import { ActivatedRoute } from '@angular/router';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
    lastSegment: any;
    lastSegmentOfRout: string | null = null;
    constructor(
        private primengConfig: PrimeNGConfig,
        private loadingSpinnerService: LoaderService,
        private LayoutService: LayoutService,
        private sharedServcie: SharedService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private cookieService: CookieService

    ) {

    }
    loading = this.loadingSpinnerService.getLoadingStatus();
    ngOnInit() {

        const token = this.cookieService.get('userId');
        console.log(token)
        this.lastSegment = window.location.hash
        const regex = /^#\/pages\/Details\/.*$/;
        this.sharedServcie.setIsDetails(regex.test(this.lastSegment))
        this.primengConfig.ripple = true;


        const toogelMenu = localStorage.getItem('showMenu')
        if (toogelMenu) {
            if (toogelMenu == 'true') {
                this.LayoutService.onMenuToggle()
            }
        }
        if (!sessionStorage.getItem('lang')) {
            sessionStorage.setItem('lang', 'en')
        }




        this.router.events
            .pipe(
                filter(event => event instanceof NavigationEnd)
            )
            .subscribe((event: NavigationEnd) => {

                const url = event.urlAfterRedirects;
                const urlSegments = url.split('/');
                this.lastSegmentOfRout = urlSegments[urlSegments.length - 1];

                if (this.lastSegmentOfRout === 'home') {
                    this.LayoutService.setSidebareItemsList('mainList');
                    localStorage.setItem('ListTypeName', 'mainList');
                }

                console.log('Last segment:', this.lastSegmentOfRout);
            });



        /*         console.log('Environment Variable:', this.sharedSarvice.getConfig());
                this.sharedSarvice.loadConfig().subscribe(
                    res => {
                        console.log(res)
                    }
                ) */

    }

}
