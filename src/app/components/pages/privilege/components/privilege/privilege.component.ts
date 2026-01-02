import { Component, OnInit, ViewChild } from '@angular/core';
import { PrivilegeService } from 'src/app/components/pages/privilege/privilege.service';
import { CheckTreeComponent } from '../check-tree/check-tree.component';
import { SharedService } from 'src/app/shared/services/shared.service';
import { PageNaming } from 'src/app/shared/components/page-info/core/page-naming';
@Component({
  selector: 'app-privilege',
  templateUrl: './privilege.component.html',
  styleUrls: ['./privilege.component.scss']
})
export class PrivilegeComponent implements OnInit {
  @ViewChild(CheckTreeComponent) tree: CheckTreeComponent;
  showTree:boolean = false;
  showRolesSelector:boolean = true;
  constructor(private service:PrivilegeService,private sharedService: SharedService){}
  ngOnInit(): void {
    this.sharedService.setPageLocalName(PageNaming.Privilige);
    if(localStorage.getItem('showTree')=='true'&&localStorage.getItem('showRole')=='false'){
      this.showTree = Boolean(localStorage.getItem('showTree'))
      this.showRolesSelector = false
    }else {
      this.service.showTree.subscribe(data => {
        this.showTree = data
      })
      this.service.showRoles.subscribe(data => {
        this.showRolesSelector = data
      })
    }
  }



}
