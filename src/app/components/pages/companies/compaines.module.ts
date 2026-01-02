import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompainesComponent } from './compaines.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { AddCompanyComponent } from './add-company/add-company.component';
const routes: Routes = [
    { path: "", 
    component: CompainesComponent
  }
  ];
@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        [RouterModule.forChild(routes)
        ]
    ],
    declarations: [CompainesComponent,AddCompanyComponent]
})
export class CompainesModule { }
