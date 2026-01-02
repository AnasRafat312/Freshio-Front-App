import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageDetailsComponent } from './pageDetails/page-details/page-details.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { GenerateHTMLDirective } from './core/directives/generate-html.directive';


const routes: Routes = [
  { path: "",
  component: PageDetailsComponent
}
];
@NgModule({
  declarations: [PageDetailsComponent],
  imports: [
    CommonModule,
    [RouterModule.forChild(routes)],
    SharedModule,
  ]
})
export class PageinfomoduleModule { }
