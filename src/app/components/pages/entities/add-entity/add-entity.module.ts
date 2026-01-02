import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { addEntityComponent } from './add-entity.component';
import { TabMenuModule } from 'primeng/tabmenu';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';

const routes:Routes= [
  {path: '', redirectTo: 'basic', pathMatch: 'full' },
  {
  path:"basic",
  component:addEntityComponent
}
]
@NgModule({
  declarations: [
    addEntityComponent,
  ],
  imports: [
    CommonModule,
    TabMenuModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule,
    DropdownModule,
    MatExpansionModule,
    MatCardModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    [RouterModule.forChild(routes)]

  ],
  exports:[
    DropdownModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class AddEntityModule { }
