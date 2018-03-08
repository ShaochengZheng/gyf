import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WidgetModule } from '../widget/widget.module';
import { DatepickerModule } from '../widget/datepicker/datepicker.module';
import { SelectModule } from '../widget/select';
import { AlertModule } from 'ngx-bootstrap/alert';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ModalDialogModule } from '../modal/modal.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { GrowlModule } from 'primeng/primeng';
import { PipeModule } from '../../pipe/pipe.module';
import { DirectiveModule } from '../../directive/directive.module';
import { ConfirmWidgetModule } from '../widget/confirm/confirm.moudle';
import { UploadWidgetModule } from '../widget/upload/upload.module';
import {
    ReconcileIndexComponent, ReconcileMatchComponent, ReconcileImportComponent,
    ReconcileDetailComponent, ReconcileHistoryComponent, 
    ReconcileRecordsComponent, MultiSyncComponent, AccountInterchangeComponent
} from './';

import { AccountTransComponent } from './detail/account-trans/account-trans.component';
import { DownloadModule } from './../widget/download/download.moudle';

import { ReconclieRoutingModule } from './reconcile.routes';

import { BusinessCategoryApi } from '../../api/accounting/api/BusinessCategoryApi';
import { AccountTransactionApi } from '../../api/accounting/api/AccountTransactionApi';
import { BankAccountApi } from '../../api/accounting/api/BankAccountApi';
import { BankStatementApi } from '../../api/accounting/api/BankStatementApi';
import { AccountTransLineItemApi } from './../../api/accounting/api/AccountTransLineItemApi';
import { BankTransferApi } from './../../api/accounting/api/BankTransferApi';

import { InterchangeModal } from './modal/interchange-modal/interchange-modal';
// import { SelectComponent } from './../widget/select/select';


@NgModule({
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, WidgetModule, ReconclieRoutingModule, DownloadModule, UploadWidgetModule,
        DatepickerModule.forRoot(), SelectModule, AlertModule.forRoot(), PaginationModule.forRoot(), ConfirmWidgetModule,
        ModalDialogModule, ModalModule.forRoot(), TooltipModule.forRoot(), GrowlModule, PipeModule,
        DirectiveModule],
    declarations: [ReconcileIndexComponent, ReconcileMatchComponent, ReconcileImportComponent,
        ReconcileDetailComponent, ReconcileHistoryComponent, 
        ReconcileRecordsComponent, MultiSyncComponent, AccountTransComponent,
         AccountInterchangeComponent , InterchangeModal],
    exports: [ReconcileIndexComponent, ReconcileMatchComponent, ReconcileImportComponent,
        ReconcileDetailComponent, ReconcileHistoryComponent, 
        ReconcileRecordsComponent, MultiSyncComponent, AccountTransComponent, 
        AccountInterchangeComponent],
    providers: [BusinessCategoryApi, AccountTransactionApi, BankAccountApi, BankStatementApi, AccountTransLineItemApi, BankTransferApi]

})
export class ReconcileModule {
}
