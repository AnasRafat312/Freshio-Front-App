import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [RouterModule.forChild([
        // Dashboard (Home)
        { path: 'home', loadChildren: () => import('./home/home.module').then(m => m.HomeModule)},
        { path: 'dashboard', redirectTo: 'home', pathMatch: 'full' },
        
        // Freshio System Routes
        { 
            path: 'items',
            children: [
                { path: '', loadComponent: () => import('./items/components/list/items-list.component').then(m => m.ItemsList) },
                { path: 'add', loadComponent: () => import('./items/components/add-edit/add-edit.component').then(m => m.ItemsAddEditComponent) },
                { path: 'edit/:id', loadComponent: () => import('./items/components/add-edit/add-edit.component').then(m => m.ItemsAddEditComponent) },
                { path: 'details/:id', loadComponent: () => import('./items/components/details/details.component').then(m => m.ItemsDetailsComponent) }
            ]
        },
        { 
            path: 'inventory',
            children: [
                { path: '', loadComponent: () => import('./inventory/components/list/inventory-list.component').then(m => m.InventoryList) }
            ]
        },
        { 
            path: 'entities',
            children: [
                { path: '', loadComponent: () => import('./entities/components/list/entities-list.component').then(m => m.EntitiesList) },
                { path: 'add', loadComponent: () => import('./entities/components/add-edit/add-edit.component').then(m => m.EntitiesAddEditComponent) },
                { path: 'edit/:id', loadComponent: () => import('./entities/components/add-edit/add-edit.component').then(m => m.EntitiesAddEditComponent) },
                { path: 'details/:id', loadComponent: () => import('./entities/components/details/details.component').then(m => m.EntitiesDetailsComponent) }
            ]
        },
        { 
            path: 'purchases',
            children: [
                { path: '', loadComponent: () => import('./purchases/components/list/purchases-list.component').then(m => m.PurchasesList) },
                { path: 'add', loadComponent: () => import('./purchases/components/add-edit/add-edit.component').then(m => m.PurchasesAddEditComponent) },
                { path: 'edit/:id', loadComponent: () => import('./purchases/components/add-edit/add-edit.component').then(m => m.PurchasesAddEditComponent) },
                { path: 'details/:id', loadComponent: () => import('./purchases/components/details/details.component').then(m => m.PurchasesDetailsComponent) }
            ]
        },
        { 
            path: 'sales-orders',
            children: [
                { path: '', loadComponent: () => import('./sales-orders/components/list/sales-orders-list.component').then(m => m.SalesOrdersList) },
                { path: 'add', loadComponent: () => import('./sales-orders/components/add-edit/add-edit.component').then(m => m.SalesOrdersAddEditComponent) },
                { path: 'edit/:id', loadComponent: () => import('./sales-orders/components/add-edit/add-edit.component').then(m => m.SalesOrdersAddEditComponent) },
                { path: 'details/:id', loadComponent: () => import('./sales-orders/components/details/details.component').then(m => m.SalesOrdersDetailsComponent) }
            ]
        },
        { 
            path: 'orders-dashboard',
            children: [
                { path: '', loadComponent: () => import('./orders-dashboard/orders-dashboard.component').then(m => m.OrdersDashboardComponent) }
            ]
        },
        { 
            path: 'customers-report',
            children: [
                { path: '', loadComponent: () => import('./customers-report/customers-report.component').then(m => m.CustomersReportComponent) }
            ]
        },
        { 
            path: 'stock-shortages',
            children: [
                { path: '', loadComponent: () => import('./stock-shortages/components/report/stock-shortages-report.component').then(m => m.StockShortagesReport) }
            ]
        },
        { 
            path: 'waste',
            children: [
                { path: '', loadComponent: () => import('./waste/components/list/waste-list.component').then(m => m.WasteList) },
                { path: 'add', loadComponent: () => import('./waste/components/add-edit/add-edit.component').then(m => m.WasteAddEditComponent) },
                { path: 'details/:id', loadComponent: () => import('./waste/components/details/details.component').then(m => m.WasteDetailsComponent) }
            ]
        },
        { 
            path: 'delivery-routes',
            children: [
                { path: '', loadComponent: () => import('./delivery-routes/components/list/delivery-routes-list.component').then(m => m.DeliveryRoutesList) },
                { path: 'add', loadComponent: () => import('./delivery-routes/components/add-edit/add-edit.component').then(m => m.DeliveryRoutesAddEditComponent) },
                { path: 'details/:id', loadComponent: () => import('./delivery-routes/components/details/details.component').then(m => m.DeliveryRoutesDetailsComponent) }
            ]
        },
        { 
            path: 'invoices',
            children: [
                { path: 'preview/:orderId', loadComponent: () => import('./invoices/components/invoice-preview/invoice-preview.component').then(m => m.InvoicePreview) }
            ]
        },

        // Keep Users and Roles for system management
        { 
            path: 'users',
            children: [
                { path: '', loadComponent: () => import('./users/components/list/users-list.component').then(m => m.Users) },
                { path: 'add', loadComponent: () => import('./users/components/add-edit/add-edit.component').then(m => m.UsersAddEditComponent) },
                { path: 'edit/:id', loadComponent: () => import('./users/components/add-edit/add-edit.component').then(m => m.UsersAddEditComponent) },
                { path: 'details/:id', loadComponent: () => import('./users/components/details/details.component').then(m => m.UsersDetailsComponent) }
            ]
        },
        { path: 'privilege', loadChildren: () => import('./privilege/privilege.module').then(m => m.PrivilegeModule)},
        { path: 'roles', loadChildren: () => import('./roles/roles/roles.module').then(m => m.RolesModule)},

        { path: '**', redirectTo: '/notfound' }
    ])],
    exports: [RouterModule]
})
export class PagesRoutingModule { }
