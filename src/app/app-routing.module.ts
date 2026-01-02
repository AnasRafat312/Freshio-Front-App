import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { NotfoundComponent } from './components/notfound/notfound.component';
import { AppLayoutComponent } from "./layout/app.layout.component";
import { AuthGuard } from './core/common/auth.guard ';

@NgModule({
    imports: [
        RouterModule.forRoot([
            { path: '', redirectTo: '/auth/login',pathMatch:'full' },
            {
                
                path: '', component: AppLayoutComponent, canActivate: [AuthGuard],
                children: [
                    { path: 'pages', loadChildren: () => import('./components/pages/pages.module').then(m => m.PagesModule) },
                    
                ]
            },
            { path: 'Varifaction', loadChildren: () => import('./shared/components/VarifacationPage/varifacation/varifacation.module').then(m => m.VarifacationModule) },
            { path: 'auth', loadChildren: () => import('./components/auth/auth.module').then(m => m.AuthModule) },
            // { path: 'landing', loadChildren: () => import('./demo/components/landing/landing.module').then(m => m.LandingModule) },
            { path: 'notfound', component: NotfoundComponent },
            { path: '**', redirectTo: 'notfound' },
        ], { scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled', onSameUrlNavigation: 'reload' })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
