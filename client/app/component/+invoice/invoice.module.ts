import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AlertModule } from 'ngx-bootstrap/alert';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ProgressbarModule } from 'ngx-bootstrap';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ModalModule } from 'ngx-bootstrap/modal';
import { WidgetModule } from '../widget/widget.module';
import { SelectModule } from '../widget/select';
import { ModalDialogModule } from '../modal/modal.module';
import {
    InvoiceComponent, InputInvoiceComponent, OutputInvoiceComponent, InvoiceIndexComponent, NewOutputInvoiceComponent, EditOutputInvoiceComponent,
    NewInputInvoiceComponent, EditInputInvoiceComponent, TabComponent, ImportOutputInvoiceComponent, DeductionComponent
} from './';
import { ImportDeduComponent } from './deduction/import-dedu/import-dedu.component';
import { ChartModule } from 'primeng/components/chart/chart';
import { PipeModule } from '../../pipe/pipe.module';
import { DirectiveModule } from '../../directive/directive.module';
import { InvoiceRoutingModule } from './invoice.routes';
import { DatepickerModule } from '../widget/datepicker/datepicker.module';
import { ConfirmWidgetModule } from '../widget/confirm/confirm.moudle';
import { UploadAttachmentsMoudule } from '../widget/upload-attachments/upload-attachments.module';

import { ShareService } from '../../service/core/share';

import { InvoiceApi } from '../../api/accounting/api/InvoiceApi';
import { InvoiceItemApi } from '../../api/accounting/api/InvoiceItemApi';
import { InvoiceService } from './shared/invoice.service';
import { ContactApi } from '../../api/accounting/api/ContactApi';
import { BusinessCategoryApi } from '../../api/accounting/api/BusinessCategoryApi';
import { TagApi } from '../../api/accounting/api/TagApi';
import { IsInvoice } from './isInvoice';
import { AccountApi } from '../../api/accounting/api/AccountApi';
import { TaxApi } from '../../api/accounting/api/TaxApi';
import { TagModule } from '../widget/tag/tag.module';
import { BpInputModule } from '../widget/bp-input/bp-input.module';


import { ImportApi } from '../../api/accounting/api/ImportApi';
import { AccountBookSettingApi } from '../../api/accounting/api/AccountBookSettingApi';
@NgModule({
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, InvoiceRoutingModule, TagModule, ConfirmWidgetModule, BpInputModule,
        AlertModule.forRoot(), TooltipModule.forRoot(), ModalModule.forRoot(), ModalDialogModule, PaginationModule, UploadAttachmentsMoudule,
        ChartModule, PipeModule, DirectiveModule, ProgressbarModule.forRoot(), SelectModule, WidgetModule, DatepickerModule],
    declarations: [InvoiceComponent, InputInvoiceComponent, OutputInvoiceComponent, InvoiceIndexComponent, NewOutputInvoiceComponent,
        EditOutputInvoiceComponent,
        NewInputInvoiceComponent, EditInputInvoiceComponent, TabComponent, ImportOutputInvoiceComponent, DeductionComponent,
        ImportDeduComponent],
    exports: [InvoiceComponent, InputInvoiceComponent, OutputInvoiceComponent, InvoiceIndexComponent, NewOutputInvoiceComponent,
        EditOutputInvoiceComponent,
        NewInputInvoiceComponent, EditInputInvoiceComponent, TabComponent, ImportOutputInvoiceComponent, DeductionComponent,
        ImportDeduComponent],
    providers: [IsInvoice, InvoiceApi, InvoiceItemApi, InvoiceService, ContactApi, BusinessCategoryApi, TagApi, AccountApi, TaxApi,
     ShareService, ImportApi,AccountBookSettingApi],
})
export class InvoiceModule {

}
