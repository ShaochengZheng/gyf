

/**
 * Created by gaoyuan on 2017/4/5.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AlertModule } from 'ngx-bootstrap/alert';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { ModalModule } from 'ngx-bootstrap/modal';
import { PipeModule } from '../../pipe/pipe.module';
import { WidgetModule } from '../widget/widget.module';
import { SelectModule } from '../widget/select';
import { ModalDialogModule } from '../modal/modal.module';
import { DirectiveModule } from '../../directive/directive.module';
import { DownloadModule } from '../widget/download/download.moudle';
import { ConfirmWidgetModule } from '../widget/confirm/confirm.moudle';
import { CalculatorModule } from './calculator/calculator.module';
import { BpInputModule } from '../widget/bp-input/bp-input.module';
import { UploadAttachmentsMoudule } from '../widget/upload-attachments/upload-attachments.module';


import { AccountBalanceComponent } from './account-balance/account-balance.component';
import { BeginningPeriodComponent } from './beginning-period/beginning-period.component';
import { FinanceComponent } from './finance.component';
import { VoucherComponent } from './voucher/voucher.component';
import { FinanceRoutingModule } from './finance.routes';
import { NewVoucherComponent } from './voucher/new-voucher/new-voucher.component';
import { EditVoucherComponent } from './voucher/edit-voucher/edit-voucher.component';
import { AccountDetailComponent } from './account-detail/account-detail.component';
import { GeneralLedgerComponent } from './general-ledger/general-ledger.component';
import { CarryVoucherListComponent } from './carry-forward/list/cv-list.component';
import { ImportComponent } from './import/import';

import { ShareService } from '../../service/core/share';
import { AccountBookSettingApi } from './../../api/accounting/api/AccountBookSettingApi';
import { FinanceService } from './shared/finance.service';
import { AccountApi } from '../../api/accounting/api/AccountApi';
import { ContactApi } from '../../api/accounting/api/ContactApi';
import { JournalEntryApi } from '../../api/accounting/api/JournalEntryApi';
import { DatepickerModule } from '../widget/datepicker/datepicker.module';
import { IsFinance } from './isFinance';
import { CarryForwardComponent } from './carry-forward/carry-forward.component';
import { PostingApi } from './../../api/accounting/api/PostingApi';
import { CustomerApi } from '../../api/identity/api/CustomerApi';
import { WeChatApi } from '../../api/wechat/api/send';

import { BPAddBankAccountComponent } from './modal/bp-addBankAccount/bp-addBankAccount.component';
import { BPAssetsComponent } from './modal/bp-assets/bp-assets.component';
import { BPContactsComponent } from './modal/bp-contacts/bp-contacts.component';
import { BPShareholderComponent } from './modal/bp-shareholder/bp-shareholder.component';


@NgModule({
	imports: [AlertModule.forRoot(), ModalModule.forRoot(), CommonModule, DatepickerModule, FormsModule, FinanceRoutingModule, DownloadModule,
		CalculatorModule, UploadAttachmentsMoudule, PipeModule, WidgetModule, TooltipModule, SelectModule, PaginationModule, DirectiveModule,
		ModalDialogModule, ConfirmWidgetModule, BpInputModule],
	exports: [],
	declarations: [FinanceComponent, AccountBalanceComponent, BeginningPeriodComponent, VoucherComponent, NewVoucherComponent,
		EditVoucherComponent, ImportComponent, CarryForwardComponent, AccountDetailComponent, GeneralLedgerComponent, CarryVoucherListComponent,
		BPAddBankAccountComponent, BPContactsComponent, BPAssetsComponent, BPShareholderComponent
	],
	providers: [IsFinance, FinanceService, AccountApi, ContactApi, JournalEntryApi, ShareService, AccountBookSettingApi, PostingApi,
		CustomerApi, WeChatApi],
})
export class FinanceModule { }
