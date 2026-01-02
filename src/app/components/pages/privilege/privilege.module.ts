import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrivilegeComponent } from './components/privilege/privilege.component';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {NgFor} from '@angular/common';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { MatTreeModule } from '@angular/material/tree';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RolesComponent } from './components/roles/roles.component';
import { CheckTreeComponent } from './components/check-tree/check-tree.component';
import { MatIconModule } from '@angular/material/icon'; 
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule} from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';


import {DragDropModule} from '@angular/cdk/drag-drop';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {CdkTableModule} from '@angular/cdk/table';
import {CdkTreeModule} from '@angular/cdk/tree';





//import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
//import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
const routes: Routes = [
  { path: '', component: PrivilegeComponent },
];

@NgModule({
  declarations: [
    PrivilegeComponent,
    RolesComponent,
    CheckTreeComponent,
    
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FormsModule,
    MatInputModule,
    NgFor,
    MatSelectModule,
    MatFormFieldModule,
    HttpClientModule,
    MatTreeModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatTooltipModule,
    CdkTreeModule,
    ScrollingModule,
    DragDropModule,
    CdkTableModule,
    MatProgressSpinnerModule,
  ],
  exports:[PrivilegeComponent,RolesComponent,CheckTreeComponent]
})
export class PrivilegeModule { }
