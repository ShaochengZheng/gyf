/**
 * Created by zishaofei on 2017/2/7.
 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
    SettingComponent, MultiUserComponent, DepartmentComponent,
    ContactComponent, BusinessCategoryComponent, TaxRateComponent,
    PersonalInfoComponent, CompanyBillingComponent, ContactsImportComponent, PartnerSetComponent,

} from './';
import { IsSetting } from './isSetting';

const routes: Routes = [
    {
        path: 'personal-info',
        component: PersonalInfoComponent,
        canActivate: [IsSetting],
    },
    {
        path: '',
        redirectTo: 'company-billing',
        pathMatch: 'full'
    },
    {
        path: '',
        component: SettingComponent,
        canActivate: [IsSetting],
        children: [
            {
                path: 'contact',
                component: ContactComponent,
            },
            {
                path: 'import-contacts',
                component: ContactsImportComponent,
            },
            {
                path: 'business-category',
                component: BusinessCategoryComponent,
            },
            {
                path: 'department',
                component: DepartmentComponent
            },
            {
                path: 'multi-user',
                component: MultiUserComponent
            },
            {
                path: 'company-billing',
                component: CompanyBillingComponent
            }, {
                path: 'partner-set',
                component: PartnerSetComponent
            }, {
                path: 'tax-rate',
                component: TaxRateComponent
            },
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
export class SettingsRoutingModule {
}

