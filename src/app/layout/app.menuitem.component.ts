import { ChangeDetectorRef, Component, Host, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { MenuService } from './app.menu.service';
import { LayoutService } from './service/app.layout.service';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: '[app-menuitem]',
    template: `
		<ng-container>
            <div *ngIf="root && item.visible !== false" class="layout-menuitem-root-text">{{item.label}}</div>
			<a *ngIf="(!item.routerLink || item.items) && item.visible !== false" [attr.href]="item.url"
			   [ngClass]="getItemClasses(item)" [attr.target]="item.target" tabindex="0" pRipple (mouseleave)="onMouseLeave($event)">
				<div class="menu-item-content">
                    <i [ngClass]="item.icon" class="layout-menuitem-icon" [@iconAnimation]="active ? 'active' : 'inactive'"></i>
                    <span class="layout-menuitem-text">{{item.label}}</span>
                    <span *ngIf="item.badge" class="menu-item-badge" [ngClass]="item.badgeClass || 'p-badge-info'">{{item.badge}}</span>
                    <i class="pi pi-fw pi-angle-down layout-submenu-toggler" *ngIf="item.items" [@rotateAnimation]="active ? 'rotated' : 'default'"></i>
                </div>
                <div class="menu-item-tooltip" *ngIf="showTooltip">{{item.label}}</div>
			</a>
			<a *ngIf="(item.routerLink && !item.items) && item.visible !== false"
			   [ngClass]="getItemClasses(item)"
			   [routerLink]="item.routerLink" routerLinkActive="active-route" [routerLinkActiveOptions]="item.routerLinkActiveOptions||{ paths: 'exact', queryParams: 'ignored', matrixParams: 'ignored', fragment: 'ignored' }"
               [fragment]="item.fragment" [queryParamsHandling]="item.queryParamsHandling" [preserveFragment]="item.preserveFragment"
               [skipLocationChange]="item.skipLocationChange" [replaceUrl]="item.replaceUrl" [state]="item.state" [queryParams]="item.queryParams"
               [attr.target]="item.target" tabindex="0" pRipple (mouseleave)="onMouseLeave($event)">
				<div class="menu-item-content">
                    <i [ngClass]="item.icon" class="layout-menuitem-icon" [@iconAnimation]="active ? 'active' : 'inactive'"></i>
                    <span class="layout-menuitem-text">{{item.label}}</span>
                    <span *ngIf="item.badge" class="menu-item-badge" [ngClass]="item.badgeClass || 'p-badge-info'">{{item.badge}}</span>
                    <i class="pi pi-fw pi-angle-down layout-submenu-toggler" *ngIf="item.items" [@rotateAnimation]="active ? 'rotated' : 'default'"></i>
                </div>
                <div class="menu-item-tooltip" *ngIf="showTooltip">{{item.label}}</div>
			</a>

			<ul *ngIf="item.items && item.visible !== false" [@children]="submenuAnimation">
				<ng-template ngFor let-child let-i="index" [ngForOf]="item.items">
					<li app-menuitem [item]="child" [index]="i" [parentKey]="key" [class]="child.badgeClass"></li>
				</ng-template>
			</ul>
		</ng-container>
    `,
    animations: [
        trigger('children', [
            state('collapsed', style({
                height: '0',
                opacity: 0,
                overflow: 'hidden'
            })),
            state('expanded', style({
                height: '*',
                opacity: 1,
                overflow: 'hidden'
            })),
            transition('collapsed <=> expanded', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)'))
        ]),
        trigger('iconAnimation', [
            state('inactive', style({
                transform: 'scale(1)'
            })),
            state('active', style({
                transform: 'scale(1.2)',
                color: 'var(--primary-color)'
            })),
            transition('inactive <=> active', animate('200ms ease-in-out'))
        ]),
        trigger('rotateAnimation', [
            state('default', style({
                transform: 'rotate(0deg)'
            })),
            state('rotated', style({
                transform: 'rotate(-180deg)'
            })),
            transition('default <=> rotated', animate('300ms ease-in-out'))
        ])
    ]
})
export class AppMenuitemComponent implements OnInit, OnDestroy {

    @Input() item: any;

    @Input() index!: number;

    @Input() @HostBinding('class.layout-root-menuitem') root!: boolean;

    @Input() parentKey!: string;

    active = false;

    showTooltip = false;

    menuSourceSubscription: Subscription;

    menuResetSubscription: Subscription;

    key: string = "";

    constructor(public layoutService: LayoutService, private cd: ChangeDetectorRef, public router: Router, private menuService: MenuService) {
        this.menuSourceSubscription = this.menuService.menuSource$.subscribe(value => {
            Promise.resolve(null).then(() => {
                if (value.routeEvent) {
                    this.active = (value.key === this.key || value.key.startsWith(this.key + '-')) ? true : false;
                }
                else {
                    if (value.key !== this.key && !value.key.startsWith(this.key + '-')) {
                        this.active = false;
                    }
                }
            });
        });

        this.menuResetSubscription = this.menuService.resetSource$.subscribe(() => {
            this.active = false;
        });

        this.router.events.pipe(filter(event => event instanceof NavigationEnd))
            .subscribe(params => {
                if (this.item.routerLink) {
                    this.updateActiveStateFromRoute();
                }
            });
    }

    ngOnInit() {
        this.key = this.parentKey ? this.parentKey + '-' + this.index : String(this.index);

        if (this.item.routerLink) {
            this.updateActiveStateFromRoute();
        }
    }

    updateActiveStateFromRoute() {
        let activeRoute = this.router.isActive(this.item.routerLink[0], { paths: 'exact', queryParams: 'ignored', matrixParams: 'ignored', fragment: 'ignored' });

        if (activeRoute) {
            this.menuService.onMenuStateChange({ key: this.key, routeEvent: true });
        }
    }
// onMouseEnter(event: MouseEvent) {
    //     if (this.layoutService.isMenuCollapsed() && !this.root) {
    //         this.showTooltip = true;
    //     }
    // }
    /**
     * Handle mouse enter event to show tooltip for collapsed menu items
     */
    // onMouseEnter(event: MouseEvent) {
    //     if (this.layoutService.isMenuCollapsed() && !this.root) {
    //         this.showTooltip = true;
    //     }
    // }

    /**
     * Handle mouse leave event to hide tooltip
     */
    onMouseLeave(event: MouseEvent) {
        this.showTooltip = false;
    }

    /**
     * Create ripple effect on menu item click
     */
    // createRipple(event: MouseEvent) {
    //     const button = event.currentTarget as HTMLElement;
    //     const ripple = document.createElement('span');
    //     const rect = button.getBoundingClientRect();
    //     const size = Math.max(rect.width, rect.height);

    //     ripple.style.width = ripple.style.height = `${size}px`;
    //     ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    //     ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
    //     ripple.classList.add('ripple');

    //     button.appendChild(ripple);
    //     setTimeout(() => ripple.remove(), 600);
    // }

    // itemClick(event: Event, item) {
    //     console.log(item)
    //     if(item.label == 'Home') {
    //         this.layoutService.setSidebareItemsList('mainList');
    //         localStorage.setItem('ListTypeName','mainList')
    //     }
    //     // avoid processing disabled items
    //     if (this.item.disabled) {
    //         event.preventDefault();
    //         return;
    //     }

    //     // execute command
    //     if (this.item.command) {
    //         this.item.command({ originalEvent: event, item: this.item });
    //     }

    //     // toggle active state
    //     if (this.item.items) {
    //         this.active = !this.active;
    //     }

    //     // Create ripple effect
    //     this.createRipple(event as MouseEvent);

    //     // Add to recently visited if it has a routerLink
    //     if (this.item.routerLink && this.layoutService['addToRecentlyVisited']) {
    //         this.layoutService['addToRecentlyVisited'](this.item);
    //     }

    //     this.menuService.onMenuStateChange({ key: this.key });
    // }

    get submenuAnimation() {
        return this.root ? 'expanded' : (this.active ? 'expanded' : 'collapsed');
    }

    @HostBinding('class.active-menuitem')
    get activeClass() {
        return this.active && !this.root;
    }

    /**
     * Get CSS classes for menu item
     * @param item Menu item
     * @returns Object with CSS class names as keys and boolean values
     */
    getItemClasses(item: any) {
        const classes: {[key: string]: boolean} = {};

        // Add item.class if it exists and is a string
        if (item.class && typeof item.class === 'string') {
            classes[item.class] = true;
        }

        // Add badge class if item has a badge
        if (item.badge) {
            classes['menu-item-has-badge'] = true;
        }

        return classes;
    }

    ngOnDestroy() {
        if (this.menuSourceSubscription) {
            this.menuSourceSubscription.unsubscribe();
        }

        if (this.menuResetSubscription) {
            this.menuResetSubscription.unsubscribe();
        }
    }
}
