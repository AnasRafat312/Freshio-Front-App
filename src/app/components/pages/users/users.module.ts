import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersComponent } from './users.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { AddUserComponent } from './add-user/add-user.component';
import { AllUsersComponent } from './components/all-users/all-users.component';
import { CompanyUsersComponent } from './components/company-users/company-users.component';
const routes: Routes = [
    { path: "", 
    component: UsersComponent , children:[
        {path:'',component:AllUsersComponent},
        {path:'companyUsers',component:CompanyUsersComponent},
        ]
    }
    ]
@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        [RouterModule.forChild(routes)]
    ],
    declarations: [UsersComponent,AddUserComponent, AllUsersComponent, CompanyUsersComponent]
})
export class UsersModule { }
