import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrivilegeComponent } from './components/privilege/privilege.component';
import { CheckTreeComponent } from './components/check-tree/check-tree.component';

// Define the routes for the feature module
const routes: Routes = [
  {path:'privilege',component:PrivilegeComponent,children:[
    {path:'tree/:id',component:CheckTreeComponent}
  ]}
  // Add more routes as needed
];

@NgModule({
  imports: [RouterModule.forChild(routes)], // Use forChild() since this is a feature module
  exports: [RouterModule],
})
export class ProductRoutingModule {} // Export the routing module