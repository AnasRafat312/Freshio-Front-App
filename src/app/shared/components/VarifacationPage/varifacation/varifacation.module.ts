import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VarifacationComponent } from './varifacation.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';



const routes : Routes =[
  { path: '', component: VarifacationComponent },

];
@NgModule({
  declarations: [],
  imports: [
    SharedModule,
    CommonModule,
    [RouterModule.forChild(routes)],

 
  ]
})
export class VarifacationModule { 



}
