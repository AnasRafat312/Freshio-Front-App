import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DetailHeaderComponent } from './detail-header/detail-header.component';
import { DetailCardComponent } from './detail-card/detail-card.component';
import { DetailItemComponent } from './detail-item/detail-item.component';
import { LocalizedDatePipe } from './pipes/localized-date.pipe';
import { ButtonModule } from 'primeng/button';
@NgModule({
  declarations: [
    DetailHeaderComponent,
    DetailCardComponent,
    DetailItemComponent,
    LocalizedDatePipe
  ],
  imports: [
    CommonModule,
    ButtonModule
  ],
  exports: [
    DetailHeaderComponent,
    DetailCardComponent,
    DetailItemComponent,
    LocalizedDatePipe
  ]
})
export class DetailsModule { }
