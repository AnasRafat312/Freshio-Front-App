import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabMenuModule } from 'primeng/tabmenu';
import { RouterModule, Routes } from '@angular/router';
import { EntitiesListComponent } from './entities-list/entities-list.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { EntityEnumsToStringPipe } from './pipes/entity-enums-to-string.pipe';
import {MatExpansionModule} from '@angular/material/expansion';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { EntityDetailsComponent } from './entity-details/entity-details.component';
import { WebDataEnumsToStringPipe } from './pipes/web-data-enums-to-string.pipe';
import { SendAttatchmentsInEntityComponent } from './send-attatchments-in-entity/send-attatchments-in-entity.component';

const routes:Routes= [
{path: '', component:EntitiesListComponent
},
{
  path:'add',
  loadChildren: () => import('../entities/add-entity/add-entity.module').then(m => m.AddEntityModule)
},
{
  path:'edit/:id',
  loadChildren: () => import('../entities/add-entity/add-entity.module').then(m => m.AddEntityModule)
},
]

@NgModule({
  declarations: [
  EntitiesListComponent,
  EntityEnumsToStringPipe,
  EntityDetailsComponent,
  WebDataEnumsToStringPipe,
  SendAttatchmentsInEntityComponent
  ],
  imports: [
    CommonModule,
    TabMenuModule,
    SharedModule,
    MatExpansionModule,
    FormsModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    [RouterModule.forChild(routes)],
  ],
  
})
export class EntityModule { }
