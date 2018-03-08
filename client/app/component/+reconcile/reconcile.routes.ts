import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthorizationService } from '../../service/core/authorization';
import { ExpireGuard } from '../../service/core/expire-guard';

import { ReconcileIndexComponent } from './recon-index';
import { ReconcileHistoryComponent } from './detail/history/history';
import { ReconcileRecordsComponent } from './detail/records/records';
import { ReconcileImportComponent } from './import/import';
import { ReconcileMatchComponent } from './match/match';
import { ReconcileDetailComponent } from './detail/detail';
import { MultiSyncComponent } from './multi-sync/multi-sync.component';
import { AccountTransComponent } from './detail/account-trans/account-trans.component';
import { AccountInterchangeComponent } from './account-interchange/account-interchange.component';


const routes: Routes = [

    {
        path: '',
        component: ReconcileIndexComponent,
        canActivate: [ExpireGuard],
        children: [
            {
                path: '',
                redirectTo: 'account',
                pathMatch: 'full'
            },
            // {
            //     path: 'account',
            //     component: AccountComponent
            // },
            {
                path: 'recon-index', // 
                component: ReconcileIndexComponent
            },
            {
                path: 'import',
                component: ReconcileImportComponent
            },
            {
                path: 'match',
                component: ReconcileMatchComponent
            },
            {
                path: 'multi-sync',
                component: MultiSyncComponent
            },
            {
                path: 'account-interchange',
                component: AccountInterchangeComponent
            },
            {
                path: 'reconcile',
                component: ReconcileIndexComponent
            },
            {
                path: 'detail',
                component: ReconcileDetailComponent,
                children: [
                    // {
                    //     path: '',
                    //     redirectTo: 'reconcile',
                    //     pathMatch: 'full'
                    // },
                    // {
                    //     path: 'reconcile',
                    //     component: ReconcileIndexComponent,
                    // },
                    // {
                    //     path: 'account',
                    //     loadChildren: '../+account/account.module#AccountModule',
                    //     canActivate: [AuthorizationService]
                    // },
                    {
                        path: 'records', 
                        component: ReconcileRecordsComponent,
                    },
                    {
                        path: 'history',
                        component: ReconcileHistoryComponent
                    },
                    {
                        path: 'account-trans',
                        component: AccountTransComponent,
                    }
                ]
            },
            {
                path: 'details',
                component: ReconcileDetailComponent,
                children: [
                    {
                        path: 'account-trans', // 
                        component: AccountTransComponent,
                        // loadChildren: '../+transaction/transaction.module#TransactionModule',
                        // canActivate: [AuthorizationService]
                    },
                    {
                        path: 'records',
                        component: ReconcileRecordsComponent,
                    },
                    {
                        path: 'history',
                        component: ReconcileHistoryComponent
                    },
                ]
            }
        ]
    },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [
        RouterModule
    ]
})
export class ReconclieRoutingModule { }

