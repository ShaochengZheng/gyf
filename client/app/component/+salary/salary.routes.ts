import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SalarySheetComponent } from './salary-sheet/salary/salary-sheet.component';
import { LabourSheetComponent } from './salary-sheet/labour/labour-sheet.component';
import { StuffComponent } from './stuff/stuff.component';
import { StuffListComponent } from './stuff/stuff-list.component';
import { StuffImportComponent } from './stuff/import/stuff-import.component';
import { SalaryComponent } from './salary-sheet/salary.component';
import { SalaryRouterRecordComponent } from './salary-record/record.component';
import { SalaryRecordComponent } from './salary-record/salary/salary-record.component';
import { LabourRecordComponent } from './salary-record/labour/labour-record.component';
import { IsSalary } from './isSalary';
/**
 * Created by lishidi on 2017/3/28.
 */
const routes: Routes = [
    {
        path: '',
        redirectTo: 'stuff-list',
        pathMatch: 'full'
    },
    {
        path: 'stuff',
        component: StuffComponent,
        canActivate: [IsSalary],

    },
    {
        path: 'stuff-list',
        component: StuffListComponent,
        canActivate: [IsSalary],
    },
    {
        path: 'stuff-import',
        component: StuffImportComponent,
        canActivate: [IsSalary],
    },
    {
        path: 'salary-sheet',
        component: SalaryComponent,
        canActivate: [IsSalary],
        children: [
            {
                path: '',
                redirectTo: 'salary',
                pathMatch: 'full'
            },
            {
                path: 'salary',
                component: SalarySheetComponent
            },
            {
                path: 'labour',
                component: LabourSheetComponent
            }
        ]
    },
    {
        path: 'salary-record',
        component: SalaryRouterRecordComponent,
        canActivate: [IsSalary],
        children: [
            {
                path: '',
                redirectTo: 'salary',
                pathMatch: 'full'
            },
            {
                path: 'salary',
                component: SalaryRecordComponent
            },
            {
                path: 'labour',
                component: LabourRecordComponent
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
export class SalaryRoutingModule {
}
