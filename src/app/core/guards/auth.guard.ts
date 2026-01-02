import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of, take, tap, map, catchError } from 'rxjs';
import { PrivilegeChecked } from 'src/app/components/pages/privilege/interfaces/privilege';
import { PrivilegeService } from 'src/app/components/pages/privilege/privilege.service';
import { AppMenuComponent } from 'src/app/layout/app.menu.component';
import { MenuService } from 'src/app/layout/app.menu.service';
import { LayoutService } from 'src/app/layout/service/app.layout.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  privilegecheckedList: any[] = [];
  listPagesMenue:any[]=[]
  constructor(
        private constant: Constant,
    private router: Router,
    private privilegeService: PrivilegeService,
    private layoutService: LayoutService,
    private menuService:MenuService
  ) {

  }


  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {


    // Get the current full URL from state
    const currentUrl = state.url;

    // Check if the company ID exists in local storage
    const isCompany = localStorage.getItem('companyId');
    if (!isCompany) {
      this.router.navigate(['/notfound']);
      return of(false);
    }
/*     this.menuService.currentMenue$.subscribe(
      menuData => {
      if (menuData) {
        this.listPagesMenue=menuData;
        this.privilegeService.checkedPrivilegeList.subscribe(
          data => {
            this.privilegecheckedList = data;
            const isActive = this.showActionBaseOnPrivilege(this.privilegecheckedList, currentUrl);
            if (isActive) {
              return (true);
            } else {
              this.router.navigate(['/notfound']);
              return (false);
            }
          }
        );
      }
      else{
        this.router.navigate(['/notfound']);
        return false
      }
    }); */
    return of(true);
  }
  // Check privileges based on current URL path
  showActionBaseOnPrivilege(pages: PrivilegeChecked[], currentUrl: string): boolean {
    
     this.menuService.currentMenue$.subscribe(data => {
      if (data) {
        this.listPagesMenue=data;
      }
    });

    try {
      // Extract route path after 'pages/'
      const regex = /pages\/([^?#]+)/;
      const match = currentUrl.match(regex);

      if (!match) {
        return false;
      }

      const routePath = match[1];

      if (!pages || pages.length === 0) {
        this.router.navigate(['/auth/login']);
        return false;
      }

      // Check if the current route path matches any privileged page
      // First check if the route path is in the routesList from MenuService


      // Check if the route path matches any privilege
      let hasValidPage = false;

      // Check if the route path is directly in the list
      if (this.listPagesMenue && this.listPagesMenue.length > 0) {
        hasValidPage = this.listPagesMenue.some(route => {
          const pageMatch = routePath === route ||
                           routePath.startsWith(route + '/');
          return pageMatch;
        });
      }

      // If no match found, check against the page privileges directly
      if (!hasValidPage && pages && pages.length > 0) {
        hasValidPage = pages.some(page => {
          const pageMatch = routePath === page.page ||
                          routePath.startsWith(page.page + '/');
          return pageMatch;
        });
      }

      if (hasValidPage) {
        return true;
      } else {
        this.router.navigate(['/notfound']);
        return false;
      }
    } catch (error) {
      this.router.navigate(['/auth/login']);
      return false;
    }
  }

}
