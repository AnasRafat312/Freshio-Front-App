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
import { Title } from '@angular/platform-browser';
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
        private cookieService: CookieService,
        private titleService: Title

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
                
                // Update page title based on route
                this.updatePageTitle(url);
            });



        /*         console.log('Environment Variable:', this.sharedSarvice.getConfig());
                this.sharedSarvice.loadConfig().subscribe(
                    res => {
                        console.log(res)
                    }
                ) */

    }

    updatePageTitle(url: string): void {
        let title = 'Hesabato';
        
        // Map routes to page titles
        if (url.includes('/home')) {
            title = 'Home - Hesabato';
        } else if (url.includes('/users')) {
            if (url.includes('/add')) {
                title = 'Add User - Hesabato';
            } else if (url.includes('/edit')) {
                title = 'Edit User - Hesabato';
            } else if (url.includes('/details')) {
                title = 'User Details - Hesabato';
            } else {
                title = 'Users - Hesabato';
            }
        } else if (url.includes('/compaines')) {
            title = 'Companies - Hesabato';
        } else if (url.includes('/privilege')) {
            title = 'Privileges - Hesabato';
        } else if (url.includes('/roles')) {
            title = 'Roles - Hesabato';
        } else if (url.includes('/wallets')) {
            if (url.includes('/add')) {
                title = 'Add Wallet - Hesabato';
            } else if (url.includes('/edit')) {
                title = 'Edit Wallet - Hesabato';
            } else if (url.includes('/details')) {
                title = 'Wallet Details - Hesabato';
            } else {
                title = 'Wallets - Hesabato';
            }
        } else if (url.includes('/bank-accounts')) {
            if (url.includes('/add')) {
                title = 'Add Bank Account - Hesabato';
            } else if (url.includes('/edit')) {
                title = 'Edit Bank Account - Hesabato';
            } else if (url.includes('/details')) {
                title = 'Bank Account Details - Hesabato';
            } else {
                title = 'Bank Accounts - Hesabato';
            }
        } else if (url.includes('/yellow-cards')) {
            if (url.includes('/add')) {
                title = 'Add Yellow Card - Hesabato';
            } else if (url.includes('/edit')) {
                title = 'Edit Yellow Card - Hesabato';
            } else if (url.includes('/details')) {
                title = 'Yellow Card Details - Hesabato';
            } else {
                title = 'Yellow Cards - Hesabato';
            }
        } else if (url.includes('/credit-cards')) {
            if (url.includes('/add')) {
                title = 'Add Credit Card - Hesabato';
            } else if (url.includes('/edit')) {
                title = 'Edit Credit Card - Hesabato';
            } else if (url.includes('/details')) {
                title = 'Credit Card Details - Hesabato';
            } else {
                title = 'Credit Cards - Hesabato';
            }
        } else if (url.includes('/traders')) {
            if (url.includes('/add')) {
                title = 'Add Trader - Hesabato';
            } else if (url.includes('/edit')) {
                title = 'Edit Trader - Hesabato';
            } else if (url.includes('/details')) {
                title = 'Trader Details - Hesabato';
            } else {
                title = 'Traders - Hesabato';
            }
        } else if (url.includes('/phones')) {
            if (url.includes('/add')) {
                title = 'Add Phone - Hesabato';
            } else if (url.includes('/edit')) {
                title = 'Edit Phone - Hesabato';
            } else if (url.includes('/details')) {
                title = 'Phone Details - Hesabato';
            } else {
                title = 'Phones - Hesabato';
            }
        } else if (url.includes('/privileges-management')) {
            if (url.includes('/add')) {
                title = 'Add Privilege - Hesabato';
            } else if (url.includes('/edit')) {
                title = 'Edit Privilege - Hesabato';
            } else if (url.includes('/details')) {
                title = 'Privilege Details - Hesabato';
            } else {
                title = 'Privileges Management - Hesabato';
            }
        } else if (url.includes('/breakdown')) {
            if (url.includes('/add')) {
                title = 'Add Breakdown - Hesabato';
            } else if (url.includes('/edit')) {
                title = 'Edit Breakdown - Hesabato';
            } else if (url.includes('/details')) {
                title = 'Breakdown Details - Hesabato';
            } else {
                title = 'Breakdown - Hesabato';
            }
        } else if (url.includes('/transaction-fees')) {
            if (url.includes('/add')) {
                title = 'Add Transaction Fee - Hesabato';
            } else if (url.includes('/edit')) {
                title = 'Edit Transaction Fee - Hesabato';
            } else if (url.includes('/details')) {
                title = 'Transaction Fee Details - Hesabato';
            } else {
                title = 'Transaction Fees - Hesabato';
            }
        } else if (url.includes('/transactions')) {
            if (url.includes('/add')) {
                title = 'Add Transaction - Hesabato';
            } else if (url.includes('/details')) {
                title = 'Transaction Details - Hesabato';
            } else {
                title = 'Transactions - Hesabato';
            }
        } else if (url.includes('/auth/login')) {
            title = 'Login - Hesabato';
        } else if (url.includes('/auth')) {
            title = 'Authentication - Hesabato';
        } else if (url.includes('/notfound')) {
            title = 'Page Not Found - Hesabato';
        }
        
        this.titleService.setTitle(title);
    }

}
