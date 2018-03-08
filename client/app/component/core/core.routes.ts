import { Routes } from '@angular/router';
import { Core } from './core';
import { AuthorizationService } from '../../service/core';
export const coreRoutes: Routes = [
    {
        path: '',
        redirectTo: '/app/home-page/accounting',
        pathMatch: 'full'
    },
    {
        path: 'app',
        component: Core,
        canActivate: [AuthorizationService],
        canActivateChild: [AuthorizationService],
        children:
        [
            {
                path: '',
                redirectTo: 'home-page',
                pathMatch: 'full'
            },
            {
                path: 'home-page',
                loadChildren: '../+home-page/home-page.module#HomePageModule',
            },

            {
                path: 'company-list',
                loadChildren: '../+company-list/company-list.module#CompanyListModule'
            },
            {
                path: 'setting',
                loadChildren: '../+settings/settings.module#SettingsModule',
            },

            {
                path: 'reconcile',
                loadChildren: '../+reconcile/reconcile.module#ReconcileModule',
            },
            {
                path: 'account',
                loadChildren: '../+account/account.module#AccountModule',
            },
            {
                path: 'transaction',
                loadChildren: '../+transaction/transaction.module#TransactionModule',
            },

            {
                path: 'reports',
                loadChildren: '../+report/report.module#ReportModule',
            },

            {
                path: 'salary',
                loadChildren: '../+salary/salary.module#SalaryModule'
            },
            {
                path: 'finance',
                loadChildren: '../+finance/finance.module#FinanceModule'
            },
            {
                path: 'invoice',
                loadChildren: '../+invoice/invoice.module#InvoiceModule'
            },
            {
                path: 'fixed-assets',
                loadChildren: '../+fixed-assets/fixed-assets.module#FixedAssetsModule'
            }
        ]
    }
];
