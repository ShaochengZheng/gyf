import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { PaginationModule } from 'ngx-bootstrap/pagination';
import { AlertModule } from 'ngx-bootstrap/alert';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ModalModule } from 'ngx-bootstrap/modal';

import { ModalDialogModule } from '../modal/modal.module';
import { ChartModule } from 'primeng/components/chart/chart';

import { PipeModule } from '../../pipe/pipe.module';
import { DirectiveModule } from '../../directive/directive.module';
import { SelectModule } from '../widget/select';
import { WidgetModule } from '../widget/widget.module';
import { DatepickerModule } from '../widget/datepicker/datepicker.module';
import { ServiceModule } from '../../service/service.module';

import { AccountApi } from '../../api//accounting/api/AccountApi';
import { BankAccountApi } from '../../api/accounting/api/BankAccountApi';
import { ContactApi } from '../../api/accounting/api/ContactApi';
import { BusinessCategoryApi } from '../../api/accounting/api/BusinessCategoryApi';
import { TagApi } from '../../api/accounting/api/TagApi';
import { AccountTransactionApi } from '../../api/accounting/api/AccountTransactionApi';
import { AccountBookSettingApi } from '../../api/accounting/api/AccountBookSettingApi';

import { AccountTransactionModels } from './detail/shared/detail.model';
import { TransactionRoutingModule } from './transaction.routes';
import { ListComponent } from './list/list.component';
import { DetailComponent } from './detail/tab-details/detail.component';
import { OutcomeComponent } from './detail/outcome/outcome.component';
import { IncomeComponent } from './detail/income/income.component';
import { DetailService } from './shared/transaction.service';
import { EditIncomeComponent } from './detail/edit-income/edit-income.component';
import { EditOutcomeComponent } from './detail/edit-outcome/edit-outcome.component';
import { AccountTransfersComponent } from './detail/accountTransfers/accountTransfers.component';
import { EditAccountTransfersComponent } from './detail/edit-accountTransfers/edit-accountTransfers.component';
import { ShareService } from '../../service/core/share';
import { IsTransaction } from './isTransaction';
import { TagModule } from '../widget/tag/tag.module';
import { DownloadModule } from '../widget/download/download.moudle';
import { ConfirmWidgetModule } from '../widget/confirm/confirm.moudle';
import { BpInputModule } from '../widget/bp-input/bp-input.module';
import { UploadAttachmentsMoudule } from '../widget/upload-attachments/upload-attachments.module';


@NgModule({
	imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpModule, PaginationModule.forRoot(), SelectModule, WidgetModule, TagModule, BpInputModule,
		DatepickerModule.forRoot(), AlertModule.forRoot(), TooltipModule.forRoot(), TransactionRoutingModule, DownloadModule, ConfirmWidgetModule, UploadAttachmentsMoudule,
		ModalModule.forRoot(), ServiceModule.forRoot(), ModalDialogModule, ChartModule, PipeModule, DirectiveModule],
	declarations: [ListComponent, DetailComponent, OutcomeComponent, IncomeComponent, EditIncomeComponent,
		EditOutcomeComponent, AccountTransfersComponent, EditAccountTransfersComponent],
	exports: [ListComponent, DetailComponent, OutcomeComponent, IncomeComponent, EditIncomeComponent,
		EditOutcomeComponent, AccountTransfersComponent, EditAccountTransfersComponent],
	providers: [IsTransaction, AccountApi, AccountTransactionModels, DetailService, BankAccountApi,
		ContactApi, BusinessCategoryApi, TagApi, AccountBookSettingApi, AccountTransactionApi, ShareService]
})
export class TransactionModule {
}
