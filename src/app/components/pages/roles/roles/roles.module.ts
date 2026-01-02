import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RolesComponent } from './components/roles/roles.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { AddRoleComponent } from './components/add-role/add-role.component';
import { MatTooltipModule } from '@angular/material/tooltip';

const routes: Routes = [
  { path: "", component: RolesComponent }
  ]

@NgModule({
  declarations: [
    RolesComponent,
    AddRoleComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    MatTooltipModule,
    [RouterModule.forChild(routes)]
  ]
})
export class RolesModule { }
