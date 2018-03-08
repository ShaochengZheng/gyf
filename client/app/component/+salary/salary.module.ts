import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Angulartics2Module } from 'angulartics2';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertModule } from 'ngx-bootstrap/alert';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { PaginationModule } from 'ngx-bootstrap/pagination';


import { WidgetModule } from '../widget/widget.module';
import { ModalDialogModule } from '../modal/modal.module';
import { PipeModule } from '../../pipe/pipe.module';
import { DirectiveModule } from '../../directive/directive.module';


import { AccountApi } from './../../api/accounting/api/AccountApi';
import { EmployeeApi } from './../../api/accounting/api/EmployeeApi';
import { PayrollApi } from './../../api/accounting/api/PayrollApi';
import { ShareService } from './../../service/core/share';
import { DatepickerModule } from '../widget/datepicker/datepicker.module';
import { SelectModule } from '../widget/select';
import { DownloadModule } from '../widget/download/download.moudle';


import { SalaryService } from './shared/salary.service';
import { SalaryRoutingModule } from './salary.routes';
import { SalaryComponent } from './salary-sheet/salary.component';
import { SalaryRouterRecordComponent } from './salary-record/record.component';
import { LabourRecordComponent } from './salary-record/labour/labour-record.component';
import { SalaryRecordComponent } from './salary-record/salary/salary-record.component';
import { StuffComponent } from './stuff/stuff.component';
import { StuffListComponent } from './stuff/stuff-list.component';
import { StuffImportComponent } from './stuff/import/stuff-import.component';
import { LabourSheetComponent } from './salary-sheet/labour/labour-sheet.component';
import { SalarySheetComponent } from './salary-sheet/salary/salary-sheet.component';
import { AsyncStuffComponent } from './async-stuff/async-stuff.component';
import { DecimalDirective } from './stuff/directive/decimal.directive';
import { IsSalary } from './isSalary';
import { DecimalInputModule } from './../widget/decimal/decimal-input.moudle';
import { BpInputModule } from './../widget/bp-input/bp-input.module';
import { ConfirmWidgetModule } from './../widget/confirm/confirm.moudle';
import { UploadAttachmentsMoudule } from '../widget/upload-attachments/upload-attachments.module';
import { NumericInputModule } from './../widget/numeric-input/numeric-input.module';




@NgModule({
    imports: [CommonModule, FormsModule, ReactiveFormsModule, SelectModule, DownloadModule, ConfirmWidgetModule, UploadAttachmentsMoudule,
        AlertModule.forRoot(), DatepickerModule.forRoot(), TooltipModule.forRoot(), ModalDialogModule, WidgetModule, BpInputModule,
        Angulartics2Module, PipeModule, DirectiveModule, SalaryRoutingModule, PaginationModule, ModalModule, DecimalInputModule
        , NumericInputModule],

    declarations: [SalarySheetComponent, StuffComponent, SalaryRouterRecordComponent, StuffListComponent,
        StuffImportComponent, SalaryComponent, LabourSheetComponent, LabourRecordComponent, SalaryRecordComponent,
        AsyncStuffComponent, DecimalDirective
    ],

    exports: [SalarySheetComponent, StuffComponent, SalaryRouterRecordComponent, StuffListComponent, AsyncStuffComponent,
        StuffImportComponent, SalaryComponent, LabourSheetComponent, LabourRecordComponent, SalaryRecordComponent],

    providers: [IsSalary, SalaryService, ShareService, EmployeeApi, PayrollApi, AccountApi]
})
export class SalaryModule {
}
