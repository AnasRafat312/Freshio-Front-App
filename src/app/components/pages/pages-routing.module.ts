import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [RouterModule.forChild([
        { path: 'home', loadChildren: () => import('./home/home.module').then(m => m.HomeModule)},
        { 
            path: 'users',
            children: [
                { path: '', loadComponent: () => import('./users/components/list/users-list.component').then(m => m.Users) },
                { path: 'add', loadComponent: () => import('./users/components/add-edit/add-edit.component').then(m => m.UsersAddEditComponent) },
                { path: 'edit/:id', loadComponent: () => import('./users/components/add-edit/add-edit.component').then(m => m.UsersAddEditComponent) },
                { path: 'details/:id', loadComponent: () => import('./users/components/details/details.component').then(m => m.UsersDetailsComponent) }
            ]
        },
        { path: 'compaines', loadChildren: () => import('./companies/compaines.module').then(m => m.CompainesModule)},
        { path: 'privilege', loadChildren: () => import('./privilege/privilege.module').then(m => m.PrivilegeModule)},
        { path: 'roles', loadChildren: () => import('./roles/roles/roles.module').then(m => m.RolesModule)},
        { 
            path: 'wallets',
            children: [
                //{ path: '', redirectTo: '', pathMatch: 'full' },
                { path: '', loadComponent: () => import('./wallets/components/list/wallets-list.component').then(m => m.WalletsList) },
                { path: 'add', loadComponent: () => import('./wallets/components/add-edit/add-edit.component').then(m => m.WalletsAddEditComponent) },
                { path: 'edit/:id', loadComponent: () => import('./wallets/components/add-edit/add-edit.component').then(m => m.WalletsAddEditComponent) },
                { path: 'details/:id', loadComponent: () => import('./wallets/components/details/details.component').then(m => m.WalletsDetailsComponent) }
            ]
        },
        { 
            path: 'fawry-machines',
            children: [
                { path: '', loadComponent: () => import('./fawry-machines/components/list/fawry-machines-list.component').then(m => m.FawryMachinesList) },
                { path: 'add', loadComponent: () => import('./fawry-machines/components/add-edit/add-edit.component').then(m => m.FawryMachinesAddEditComponent) },
                { path: 'edit/:id', loadComponent: () => import('./fawry-machines/components/add-edit/add-edit.component').then(m => m.FawryMachinesAddEditComponent) },
                { path: 'details/:id', loadComponent: () => import('./fawry-machines/components/details/details.component').then(m => m.FawryMachinesDetailsComponent) }
            ]
        },
        { 
            path: 'bank-accounts',
            children: [
                //{ path: '', redirectTo: '', pathMatch: 'full' },
                { path: '', loadComponent: () => import('./bank-accounts/components/list/bank-accounts-list.component').then(m => m.BankAccountsList) },
                { path: 'add', loadComponent: () => import('./bank-accounts/components/add-edit/add-edit.component').then(m => m.BankAccountsAddEditComponent) },
                { path: 'edit/:id', loadComponent: () => import('./bank-accounts/components/add-edit/add-edit.component').then(m => m.BankAccountsAddEditComponent) },
                { path: 'details/:id', loadComponent: () => import('./bank-accounts/components/details/details.component').then(m => m.BankAccountsDetailsComponent) }
            ]
        },
        { 
            path: 'yellow-cards',
            children: [
                //{ path: '', redirectTo: '', pathMatch: 'full' },
                { path: '', loadComponent: () => import('./yellow-cards/components/list/yellow-cards-list.component').then(m => m.YellowCardsList) },
                { path: 'add', loadComponent: () => import('./yellow-cards/components/add-edit/add-edit.component').then(m => m.YellowCardsAddEditComponent) },
                { path: 'edit/:id', loadComponent: () => import('./yellow-cards/components/add-edit/add-edit.component').then(m => m.YellowCardsAddEditComponent) },
                { path: 'details/:id', loadComponent: () => import('./yellow-cards/components/details/details.component').then(m => m.YellowCardsDetailsComponent) }
            ]
        },
        { 
            path: 'credit-cards',
            children: [
                //{ path: '', redirectTo: '', pathMatch: 'full' },
                { path: '', loadComponent: () => import('./credit-cards/components/list/credit-cards-list.component').then(m => m.CreditCardsList) },
                { path: 'add', loadComponent: () => import('./credit-cards/components/add-edit/add-edit.component').then(m => m.CreditCardsAddEditComponent) },
                { path: 'edit/:id', loadComponent: () => import('./credit-cards/components/add-edit/add-edit.component').then(m => m.CreditCardsAddEditComponent) },
                { path: 'details/:id', loadComponent: () => import('./credit-cards/components/details/details.component').then(m => m.CreditCardsDetailsComponent) }
            ]
        },
        { 
            path: 'traders',
            children: [
                //{ path: '', redirectTo: '', pathMatch: 'full' },
                { path: '', loadComponent: () => import('./traders/components/list/traders-list.component').then(m => m.TradersList) },
                { path: 'add', loadComponent: () => import('./traders/components/add-edit/add-edit.component').then(m => m.TradersAddEditComponent) },
                { path: 'edit/:id', loadComponent: () => import('./traders/components/add-edit/add-edit.component').then(m => m.TradersAddEditComponent) },
                { path: 'details/:id', loadComponent: () => import('./traders/components/details/details.component').then(m => m.TradersDetailsComponent) }
            ]
        },
        { 
            path: 'phones',
            children: [
                //{ path: '', redirectTo: '', pathMatch: 'full' },
                { path: '', loadComponent: () => import('./phones/components/list/phones-list.component').then(m => m.PhonesList) },
                { path: 'add', loadComponent: () => import('./phones/components/add-edit/add-edit.component').then(m => m.PhonesAddEditComponent) },
                { path: 'edit/:id', loadComponent: () => import('./phones/components/add-edit/add-edit.component').then(m => m.PhonesAddEditComponent) },
                { path: 'details/:id', loadComponent: () => import('./phones/components/details/details.component').then(m => m.PhonesDetailsComponent) }
            ]
        },
        { 
            path: 'privileges-management',
            children: [
                //{ path: '', redirectTo: '', pathMatch: 'full' },
                { path: '', loadComponent: () => import('./privileges/components/list/privileges-list.component').then(m => m.PrivilegesList) },
                { path: 'add', loadComponent: () => import('./privileges/components/add-edit/add-edit.component').then(m => m.PrivilegesAddEditComponent) },
                { path: 'edit/:id', loadComponent: () => import('./privileges/components/add-edit/add-edit.component').then(m => m.PrivilegesAddEditComponent) },
                { path: 'details/:id', loadComponent: () => import('./privileges/components/details/details.component').then(m => m.PrivilegesDetailsComponent) }
            ]
        },
        { 
            path: 'breakdown',
            children: [
                //{ path: '', redirectTo: '', pathMatch: 'full' },
                { path: '', loadComponent: () => import('./breakdown/components/list/breakdown-list.component').then(m => m.BreakdownList) },
                { path: 'add', loadComponent: () => import('./breakdown/components/add-edit/add-edit.component').then(m => m.BreakdownAddEditComponent) },
                { path: 'edit/:id', loadComponent: () => import('./breakdown/components/add-edit/add-edit.component').then(m => m.BreakdownAddEditComponent) },
                { path: 'details/:id', loadComponent: () => import('./breakdown/components/details/details.component').then(m => m.BreakdownDetailsComponent) }
            ]
        },
        { 
            path: 'adjustments',
            children: [
                { path: '', loadComponent: () => import('./adjustments/components/list/adjustments-list.component').then(m => m.AdjustmentsList) },
                { path: 'add', loadComponent: () => import('./adjustments/components/add-edit/add-edit.component').then(m => m.AdjustmentsAddEditComponent) },
                { path: 'edit/:id', loadComponent: () => import('./adjustments/components/add-edit/add-edit.component').then(m => m.AdjustmentsAddEditComponent) },
                { path: 'details/:id', loadComponent: () => import('./adjustments/components/details/details.component').then(m => m.AdjustmentsDetailsComponent) }
            ]
        },
        { 
            path: 'transactions',
            children: [
                { path: '', loadComponent: () => import('./transactions/components/list/transactions-list.component').then(m => m.TransactionsList) },
                { path: 'add', loadComponent: () => import('./transactions/components/add-edit/add-edit.component').then(m => m.TransactionsAddEditComponent) },
                { path: 'details/:id', loadComponent: () => import('./transactions/components/details/details.component').then(m => m.TransactionsDetailsComponent) }
            ]
        },

        { path: '**', redirectTo: '/notfound' }
    ])],
    exports: [RouterModule]
})
export class PagesRoutingModule { }
