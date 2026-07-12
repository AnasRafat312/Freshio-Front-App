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
        let title = 'Freshio';
        
        // Map routes to page titles
        if (url.includes('/home')) {
            title = 'Home - Freshio';
        } else if (url.includes('/users')) {
            if (url.includes('/add')) {
                title = 'Add User - Freshio';
            } else if (url.includes('/edit')) {
                title = 'Edit User - Freshio';
            } else if (url.includes('/details')) {
                title = 'User Details - Freshio';
            } else {
                title = 'Users - Freshio';
            }
        } else if (url.includes('/compaines')) {
            title = 'Companies - Freshio';
        } else if (url.includes('/privilege')) {
            title = 'Privileges - Freshio';
        } else if (url.includes('/roles')) {
            title = 'Roles - Freshio';
        } else if (url.includes('/wallets')) {
            if (url.includes('/add')) {
                title = 'Add Wallet - Freshio';
            } else if (url.includes('/edit')) {
                title = 'Edit Wallet - Freshio';
            } else if (url.includes('/details')) {
                title = 'Wallet Details - Freshio';
            } else {
                title = 'Wallets - Freshio';
            }
        } else if (url.includes('/bank-accounts')) {
            if (url.includes('/add')) {
                title = 'Add Bank Account - Freshio';
            } else if (url.includes('/edit')) {
                title = 'Edit Bank Account - Freshio';
            } else if (url.includes('/details')) {
                title = 'Bank Account Details - Freshio';
            } else {
                title = 'Bank Accounts - Freshio';
            }
        } else if (url.includes('/yellow-cards')) {
            if (url.includes('/add')) {
                title = 'Add Yellow Card - Freshio';
            } else if (url.includes('/edit')) {
                title = 'Edit Yellow Card - Freshio';
            } else if (url.includes('/details')) {
                title = 'Yellow Card Details - Freshio';
            } else {
                title = 'Yellow Cards - Freshio';
            }
        } else if (url.includes('/credit-cards')) {
            if (url.includes('/add')) {
                title = 'Add Credit Card - Freshio';
            } else if (url.includes('/edit')) {
                title = 'Edit Credit Card - Freshio';
            } else if (url.includes('/details')) {
                title = 'Credit Card Details - Freshio';
            } else {
                title = 'Credit Cards - Freshio';
            }
        } else if (url.includes('/traders')) {
            if (url.includes('/add')) {
                title = 'Add Trader - Freshio';
            } else if (url.includes('/edit')) {
                title = 'Edit Trader - Freshio';
            } else if (url.includes('/details')) {
                title = 'Trader Details - Freshio';
            } else {
                title = 'Traders - Freshio';
            }
        } else if (url.includes('/phones')) {
            if (url.includes('/add')) {
                title = 'Add Phone - Freshio';
            } else if (url.includes('/edit')) {
                title = 'Edit Phone - Freshio';
            } else if (url.includes('/details')) {
                title = 'Phone Details - Freshio';
            } else {
                title = 'Phones - Freshio';
            }
        } else if (url.includes('/privileges-management')) {
            if (url.includes('/add')) {
                title = 'Add Privilege - Freshio';
            } else if (url.includes('/edit')) {
                title = 'Edit Privilege - Freshio';
            } else if (url.includes('/details')) {
                title = 'Privilege Details - Freshio';
            } else {
                title = 'Privileges Management - Freshio';
            }
        } else if (url.includes('/breakdown')) {
            if (url.includes('/add')) {
                title = 'Add Breakdown - Freshio';
            } else if (url.includes('/edit')) {
                title = 'Edit Breakdown - Freshio';
            } else if (url.includes('/details')) {
                title = 'Breakdown Details - Freshio';
            } else {
                title = 'Breakdown - Freshio';
            }
        } else if (url.includes('/transaction-fees')) {
            if (url.includes('/add')) {
                title = 'Add Transaction Fee - Freshio';
            } else if (url.includes('/edit')) {
                title = 'Edit Transaction Fee - Freshio';
            } else if (url.includes('/details')) {
                title = 'Transaction Fee Details - Freshio';
            } else {
                title = 'Transaction Fees - Freshio';
            }
        } else if (url.includes('/transactions')) {
            if (url.includes('/add')) {
                title = 'Add Transaction - Freshio';
            } else if (url.includes('/details')) {
                title = 'Transaction Details - Freshio';
            } else {
                title = 'Transactions - Freshio';
            }
        } else if (url.includes('/auth/login')) {
            title = 'Login - Freshio';
        } else if (url.includes('/auth')) {
            title = 'Authentication - Freshio';
        } else if (url.includes('/notfound')) {
            title = 'Page Not Found - Freshio';
        }
        
        this.titleService.setTitle(title);
    }

}
