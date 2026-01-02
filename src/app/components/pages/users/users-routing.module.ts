import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UsersComponent } from './users.component';
import { AllUsersComponent } from './components/all-users/all-users.component';
import { CompanyUsersComponent } from './components/company-users/company-users.component';

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: UsersComponent },
	])],
	exports: [RouterModule]
})
export class CrudRoutingModule { }
