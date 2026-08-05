import { ChangeDetectorRef, OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { LayoutService } from './service/app.layout.service';
import { LanguagesService } from '../shared/services/languages.service';
import { PrivilegeService } from '../components/pages/privilege/privilege.service';
import { PrivilegeChecked } from '../components/pages/privilege/interfaces/privilege';
import { FormsModule } from '@angular/forms';
import { TranslateToArabicPipe } from '../core/pipes/translate-to-arabic.pipe';


@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html',
})
export class AppMenuComponent implements OnInit {
    privilegeList = [];
    list = [];
    model: any[] = [];
    filteredModel: any[] = [];
    searchQuery: string = '';
    languageFactor = 'ar';
    languagePipe = new TranslateToArabicPipe();
    constructor(
        public layoutService: LayoutService,
        private language: LanguagesService,
        private privilegeService: PrivilegeService
    ) {}


    ngOnInit() {
        this.language.currentLanguage.subscribe((data) => {
            this.languageFactor = data;
        });


        this.privilegeService.checkedPrivilegeList.subscribe((data) => {
            this.privilegeList = [];
            this.list = [];
            this.privilegeList = this.removeDuplicates(data, 'page');
            this.createPages(this.privilegeList);
            this.model = [{ items: this.list }];
            this.filteredModel = [...this.model];
        });
    }
    removeDuplicates(originalArray, prop) {
        const seen = new Set();
        return originalArray.filter((item) => {
            const value = item[prop];
            return seen.has(value) ? false : seen.add(value);
        });
    }
    /**
     * Filters the menu items based on search query
     */
    filterMenu() {
        if (!this.searchQuery || this.searchQuery.trim() === '') {
            this.filteredModel = [...this.model];
            return;
        }
        
        const query = this.searchQuery.toLowerCase();
        
        // Create a deep copy of the model to avoid modifying the original
        this.filteredModel = this.model.map(item => {
            if (!item.items) return item;
            
            // Filter items based on label
            const filteredItems = item.items.filter(subItem => 
                subItem.label && subItem.label.toLowerCase().includes(query)
            );
            
            if (filteredItems.length > 0) {
                return { ...item, items: filteredItems };
            }
            return { ...item, items: [] };
        });
    }
    
    createPages(pagesList: PrivilegeChecked[]) {
        const pageConfig = {
            BOQs: {
                label: this.languagePipe.transform('BOQs', this.languageFactor),
                icon: 'fa-solid fa-cubes fa-xl',
                routerLink: ['/pages/BOQ/BOQsList'],
            },
            PurchaseOrders: {
                label:
                    this.languagePipe.transform('Purchase Orders', this.languageFactor),
                icon: 'fa-solid fa-file-invoice fa-xl',
                routerLink: ['/pages/PO'],
            },
            Projects: {
                label: this.languagePipe.transform('Projects', this.languageFactor),
                icon: 'fa-solid fa-file-invoice fa-xl',
                routerLink: ['/pages/projects'],
            },
            Contracts: {
                label: this.languagePipe.transform('Contracts', this.languageFactor),
                icon: 'fa-solid fa-file-invoice fa-xl',
                routerLink: ['/pages/contracts/List'],
            },
            RequestForQuatation: {
                label: this.languagePipe.transform('Requests For Quotation', this.languageFactor),
                icon: 'fa-solid fa-file-signature fa-xl',
                routerLink: ['/pages/RequestsForQuatation'],
            },
            Offers: {
                label: this.languagePipe.transform('Offers', this.languageFactor),
                icon: 'fa-solid fa-tags fa-xl',
                routerLink: ['/pages/offers'],
            },
            QuantitySurveying: {
                label: this.languagePipe.transform('Quantity Surveying', this.languageFactor),
                icon: 'fa-solid fa-tags fa-xl',
                routerLink: ['/pages/quantity-surveying'],
            },
            ProjectInvoices: {
                label: this.languagePipe.transform('Project Invoices', this.languageFactor),
                icon: 'fa-solid fa-tags fa-xl',
                routerLink: ['/pages/project-invoices'],
            },
            ProjectCategory: {
                label: this.languagePipe.transform('Project Category', this.languageFactor),
                icon: 'fa-solid fa-tags fa-xl',
                routerLink: ['/pages/projectCategory'],
            },
            Cycles: {
                label: this.languagePipe.transform('Cycles', this.languageFactor),
                icon: 'fa-solid fa-tags fa-xl',
                routerLink: ['/pages/cycles/Invoice-Cycle'],
            },
            CycleSteps: {
                label: this.languagePipe.transform('Cycle Steps', this.languageFactor),
                icon: 'fa-solid fa-tags fa-xl',
                routerLink: ['/pages/cycles/Cycle-Steps'],
            },
        };


        for (const page of pagesList) {
            if (pageConfig[page.page]) {
                this.list.push(pageConfig[page.page]);
            }
        }


        // Freshio Business Menu Items
        const staticPages = [
            {
                label: this.languagePipe.transform('Dashboard', this.languageFactor),
                icon: 'pi pi-home',
                routerLink: ['/pages/home'],
            },
            {
                label: this.languagePipe.transform('Items', this.languageFactor),
                icon: 'pi pi-box',
                routerLink: ['/pages/items'],
            },
            {
                label: this.languagePipe.transform('Inventory', this.languageFactor),
                icon: 'pi pi-database',
                routerLink: ['/pages/inventory'],
            },
            {
                label: this.languagePipe.transform('Entities', this.languageFactor),
                icon: 'pi pi-users',
                routerLink: ['/pages/entities'],
            },
            {
                label: this.languagePipe.transform('Purchases', this.languageFactor),
                icon: 'pi pi-shopping-cart',
                routerLink: ['/pages/purchases'],
            },
            {
                label: this.languagePipe.transform('Sales Orders', this.languageFactor),
                icon: 'pi pi-shopping-bag',
                routerLink: ['/pages/sales-orders'],
            },
            {
                label: this.languagePipe.transform('Orders Dashboard', this.languageFactor),
                icon: 'pi pi-chart-bar',
                routerLink: ['/pages/orders-dashboard'],
            },
            {
                label: this.languagePipe.transform('Stock Shortages', this.languageFactor),
                icon: 'pi pi-exclamation-triangle',
                routerLink: ['/pages/stock-shortages'],
            },
            {
                label: this.languagePipe.transform('Waste', this.languageFactor),
                icon: 'pi pi-trash',
                routerLink: ['/pages/waste'],
            },
            /* {
                label: this.languagePipe.transform('Delivery Routes', this.languageFactor),
                icon: 'pi pi-map-marker',
                routerLink: ['/pages/delivery-routes'],
            },
            {
                label: this.languagePipe.transform('Users', this.languageFactor),
                icon: 'pi pi-user',
                routerLink: ['/pages/users'],
            } */
        ];


        this.list.unshift(...staticPages);


        this.list = this.removeDuplicates(this.list, 'label');
        return this.list;
    }
}
