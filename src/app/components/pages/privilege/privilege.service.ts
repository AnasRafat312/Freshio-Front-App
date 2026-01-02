import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, forkJoin, map } from 'rxjs';
import { FertualTree, PrivilegeRoles, PrivilegeTree } from 'src/app/components/pages/privilege/interfaces/privilege';
import { Constant } from 'src/app/core/constants/constant';
@Injectable({
  providedIn: 'root'
})
export class PrivilegeService {
    updateTree = ''
    treeUrl = ''
  roleSubject = new Subject();
  private roleIdSubject = new BehaviorSubject<number>(0);
  roleId = this.roleIdSubject.asObservable()
  private showTreeSubject = new BehaviorSubject<boolean>(false);
  showTree = this.showTreeSubject.asObservable()
  private showRolesSubject = new BehaviorSubject<boolean>(true);
  showRoles = this.showRolesSubject.asObservable()
  checkedPrivilegeListSubject = new BehaviorSubject<any[]>([]);
  checkedPrivilegeList = this.checkedPrivilegeListSubject.asObservable()
  constructor(
      private constant: Constant,private http: HttpClient) {
          this.treeUrl = `${this.constant.GETWAY_API_ENDPOINT}RoleClaim/GetAllClaimsForRole/`;
          this.updateTree = `${this.constant.GETWAY_API_ENDPOINT}RoleClaim/UpdateAllRoleClaimForRole`;
    }
    pageslistFromDatabase = []
    actionsListFromDatabase = []
    finalActionsList = []
    finalResult = []
    // get all roles
    getRoles(): Observable<PrivilegeRoles[]> {
      
        return this.http.get<PrivilegeRoles[]>(this.constant.GETWAY_API_ENDPOINT + 'Role/GetCompanyRoles/' + localStorage.getItem('companyId'))
  }

  // add role
  addRole(role: any) {
    return this.http.post<PrivilegeRoles>(this.constant.GETWAY_API_ENDPOINT + 'Role/CreateRole', role)
  }

  //update role
  updateRole(role: any) {
    return this.http.put<PrivilegeRoles>(this.constant.GETWAY_API_ENDPOINT + 'Role/UpdateRole', role)
  }

  //get tree by id of special role
  getRoleTreeById(id: number): Observable<PrivilegeTree[]> {
    
    this.treeUrl = `${this.constant.GETWAY_API_ENDPOINT}RoleClaim/GetAllClaimsForRole/`;
    this.updateTree = `${this.constant.GETWAY_API_ENDPOINT}RoleClaim/UpdateAllRoleClaimForRole`;
    return this.http.get<PrivilegeTree[]>(this.treeUrl + id)
  }
  sendUpdatedTree(data: any) {
    return this.http.post(this.updateTree, data)
  }
  updatId(newId: number) {
    this.roleIdSubject.next(newId);
  }

  updatCheckedPrivilegeList(data: any) {
    this.checkedPrivilegeListSubject.next([]);
    this.checkedPrivilegeListSubject.next(data);
  }

  removeDuplicates(arr, prop) {
    return arr.filter((obj, index, self) =>
      index === self.findIndex((el) => el[prop] === obj[prop])
    );
  }
  clearCheckedPrivilegeList() {
    this.checkedPrivilegeListSubject.next([]);
  }
  updateShowTree(show: boolean) {
    this.showTreeSubject.next(show);
  }
  updateShowRoles(show: boolean) {
    this.showRolesSubject.next(show);
  }

  buildTree(data, parentId): FertualTree[] {
    const tree = [];
    if (!data) {
      return tree; // Return an empty array if data is undefined or null
    }
    data.forEach(node => {
      if (node.parentID === parentId) {
        const newNode: FertualTree = {
          name: node?.arabicName,
          id: node.id,
          isChecked: node.isChecked,
          isPlanType: node.claimType === 1,
          claimId: node.claimType,
          isLeaf: node.isLeaf,
          children: this.buildTree(data, node.id)
        };
        tree.push(newNode);
      }
    });

    return tree;
  }
  getPages(data: any) {
    this.checkedPrivilegeListSubject.next([]);
    this.finalResult = []
    this.pageslistFromDatabase = data.Pages;
    this.actionsListFromDatabase = data.Actions;
    this.pageslistFromDatabase.forEach(page => {
      const pageActions = this.actionsListFromDatabase
      .filter(action => action.parentID === page.id)
      .map(action => action.type);
      this.finalResult.push({ page: page?.type.trim(), actions: pageActions });
    });
    this.finalResult = this.removeDuplicates(this.finalResult, 'page')
    console.log(this.finalResult)
    this.checkedPrivilegeListSubject.next(this.finalResult)
    return (this.finalResult);
  }
  getUserRoleInCompanyAndPrivilege(companyID?:number): Observable<any[]> {
    let model = {
      CompanyID: companyID ? companyID : localStorage.getItem("companyId"),
      UserID: localStorage.getItem("userId"),
      ModuleID: 10
    }
    return this.http.post<any[]>(this.constant.GETWAY_API_ENDPOINT + 'UserRole/GetUserRoleInCompany', model)
  }
}
