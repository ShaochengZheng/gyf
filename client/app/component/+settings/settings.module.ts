import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertModule } from 'ngx-bootstrap/alert';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { DatepickerModule } from '../widget/datepicker/datepicker.module';
import { ModalDialogModule } from '../modal/modal.module';
import { WidgetModule } from '../widget/widget.module';
import { BpInputModule } from '../widget/bp-input/bp-input.module';
import { SelectModule } from '../widget/select';
import { DirectiveModule } from '../../directive/directive.module';
import { PipeModule } from '../../pipe/pipe.module';
import {
    SettingComponent, MultiUserComponent, DepartmentComponent,
    ContactComponent, BusinessCategoryComponent,
    PersonalInfoComponent, CompanyBillingComponent, ContactsImportComponent

} from './';
import { SettingsRoutingModule } from './settings.routes';
import { IsSetting } from './isSetting';
import { PartnerSetComponent } from './partner-set/partner-set';
import { TaxRateComponent } from './tax-rate/tax-rate';
import { DownloadModule } from '../widget/download/download.moudle';
import { ConfirmWidgetModule } from '../widget/confirm/confirm.moudle';
import { UploadWidgetModule } from '../widget/upload/upload.module';

import { PartnerDetailModal } from './modal/partner-detail/partner-detail';


@NgModule({
    imports: [CommonModule, FormsModule, ReactiveFormsModule, SettingsRoutingModule, AlertModule.forRoot(),
        DownloadModule, ConfirmWidgetModule, BpInputModule,
        PaginationModule.forRoot(), DatepickerModule.forRoot(), SelectModule, ModalDialogModule, WidgetModule, UploadWidgetModule,
        TooltipModule.forRoot(), DirectiveModule, PipeModule, ModalModule.forRoot()],
    declarations: [SettingComponent, MultiUserComponent, DepartmentComponent,
        ContactComponent, BusinessCategoryComponent, PersonalInfoComponent, CompanyBillingComponent, ContactsImportComponent,
        PartnerSetComponent, TaxRateComponent, PartnerDetailModal
    ],
    exports: [SettingComponent,
        MultiUserComponent, DepartmentComponent, ContactComponent, BusinessCategoryComponent, TaxRateComponent,
        PersonalInfoComponent, SettingsRoutingModule, CompanyBillingComponent, ContactsImportComponent, PartnerSetComponent
    ],
    providers: [IsSetting]
})
export class SettingsModule {
}
