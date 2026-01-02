import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, elementAt } from 'rxjs';
import { Constant } from 'src/app/core/constants/constant';
import { Router } from '@angular/router';
import { SharedService } from 'src/app/shared/services/shared.service';
export interface AppConfig {
    inputStyle: string;
    colorScheme: string;
    theme: string;
    ripple: boolean;
    menuMode: string;
    scale: number;
}
export interface ChangePassword {
    UserId:number,
    CurrentPassword:string|number,
    NewPassword:string|number,
    RepeatPassword:string|number,
}

interface LayoutState {
    staticMenuDesktopInactive: boolean;
    overlayMenuActive: boolean;
    profileSidebarVisible: boolean;
    configSidebarVisible: boolean;
    staticMenuMobileActive: boolean;
    menuHoverActive: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class LayoutService {
    sidebareListItemsSubject = new BehaviorSubject('')
    isDetails:boolean;
    lastSegment:any;
    private _menuCollapsed: boolean = false;
    constructor(
        private constant: Constant,public http: HttpClient, private router:Router,private sharedService:SharedService,){
        document.documentElement.style.fontSize = '11px';

    }
    config: AppConfig = {
        ripple: false,
        inputStyle: 'outlined',
        menuMode: 'static',
        colorScheme: 'light',
        theme: 'lara-light-indigo',
        scale: 11,
    };

    state: LayoutState = {
        staticMenuDesktopInactive: false,
        overlayMenuActive: false,
        profileSidebarVisible: false,
        configSidebarVisible: false,
        staticMenuMobileActive: false,
        menuHoverActive: false
    };

    private configUpdate = new Subject<AppConfig>();

    private overlayOpen = new Subject<any>();

    configUpdate$ = this.configUpdate.asObservable();

    overlayOpen$ = this.overlayOpen.asObservable();

    onMenuToggle() {

        this.sharedService.getIsDetails().subscribe(
            res => {


              this.isDetails = res
              if (this.isOverlay()) {
                  this.state.overlayMenuActive = !this.state.overlayMenuActive;
                  if (this.state.overlayMenuActive) {
                      this.overlayOpen.next(null);
                  }
              }
              if(this.isDetails)
              {
                  this.state.staticMenuDesktopInactive = true;
                  localStorage.setItem('showMenu',JSON.stringify(true))

              }
              else
              {
                  if (this.isDesktop()) {
                      this.state.staticMenuDesktopInactive = !this.state.staticMenuDesktopInactive;
                      localStorage.setItem('showMenu',JSON.stringify(this.state.staticMenuDesktopInactive))
                  }
                  else {
                      this.state.staticMenuMobileActive = !this.state.staticMenuMobileActive;

                      if (this.state.staticMenuMobileActive) {
                          this.overlayOpen.next(null);
                      }
                  }
              }
            }
          )
    }

    showProfileSidebar() {
        this.state.profileSidebarVisible = !this.state.profileSidebarVisible;
        if (this.state.profileSidebarVisible) {
            this.overlayOpen.next(null);
        }
    }

    showConfigSidebar() {
        this.state.configSidebarVisible = true;
    }

    isOverlay() {
        return this.config.menuMode === 'overlay';
    }

    isDesktop() {
        return window.innerWidth > 991;
    }

    isMobile() {
        return !this.isDesktop();
    }

    onConfigUpdate() {
        this.configUpdate.next(this.config);
    }

    logout(){
        localStorage.removeItem('userId');
        localStorage.removeItem('companyId');
        localStorage.removeItem('accountId');
        localStorage.removeItem('roleId');
        localStorage.removeItem('showRoleAdd');
        //localStorage.clear()
        this.router.navigate(['/auth/login']);
      }
    changePassword(userInfo:ChangePassword) {
        return this.http.put(this.constant.GETWAY_API_ENDPOINT + 'AssembleUser/ChangePassWord', userInfo);
    }
    setSidebareItemsList(listName) {
        this.sidebareListItemsSubject.next(listName)
    }
    getSidebareListItems() {
        return this.sidebareListItemsSubject.asObservable()
    }

    // /**
    //  * Check if the menu is currently collapsed
    //  * @returns boolean indicating if menu is collapsed
    //  */
    // isMenuCollapsed(): boolean {
    //     return this._menuCollapsed;
    // }

    // /**
    //  * Set menu collapsed state
    //  * @param value boolean value to set collapsed state
    //  */
    // setMenuCollapsed(value: boolean): void {
    //     this._menuCollapsed = value;
    //     localStorage.setItem('menuCollapsed', value ? 'true' : 'false');
    // }
}
