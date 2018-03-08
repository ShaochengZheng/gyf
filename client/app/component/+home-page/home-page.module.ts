/**
 * Created by zishaofei on 2017/4/18.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AlertModule } from 'ngx-bootstrap/alert';
import { ModalModule } from 'ngx-bootstrap/modal';

import { PipeModule } from '../../pipe/pipe.module';
import { WidgetModule } from '../widget/widget.module';
import { SelectModule } from '../widget/select';
import { ModalDialogModule } from '../modal/modal.module';


import { HomePageService } from './shared/home-page.service';
import { ShareService } from '../../service/core/share';
import { AccountApi } from '../../api/accounting/api/AccountApi';
import { AccountBookApi } from '../../api/accounting/api/AccountBookApi';
import { IndexApi } from './../../api/accounting/api/IndexApi';
import { BankAccountApi } from '../../api/accounting/api/BankAccountApi';

import { HomePageRoutingModule } from './home-page.routes';

import { AccountingHomePageComponent } from './accounting-home-page/accounting-home-page.component';
import { AccountBalanceSheets } from './shared/home-page.model';
import { AssistHomePageComponent } from './assist-home-page/assist-home-page.component';
import { CarryForwardModalComponent } from './modal/carry-forward-modal/carry-forward-modal.component';
import { PostingModalComponent } from './modal/posting-modal/posting-modal.component';
import { PostingCancelProvisionModalComponent } from './modal/posting-cancel-provision-modal/posting-cancel-provision-modal.component';
import { AgainCarryForwardModalComponent } from './modal/again-carry-forward-modal/again-carry-forward-modal.component';
import { ModifyStockCashBalanceModalComponent } from './modal/modify-stock-cash-balance-modal/modify-stock-cash-balance-modal.component';
import { BpInputModule } from '../widget/bp-input/bp-input.module';

@NgModule({
	imports: [AlertModule.forRoot(), ModalModule.forRoot(), HomePageRoutingModule, BpInputModule,
		CommonModule, FormsModule, PipeModule, WidgetModule, SelectModule, ModalDialogModule],
	exports: [],
	declarations: [AccountingHomePageComponent,
		AssistHomePageComponent, CarryForwardModalComponent, PostingModalComponent, PostingCancelProvisionModalComponent,
		AgainCarryForwardModalComponent, ModifyStockCashBalanceModalComponent
	],
	providers: [AccountBalanceSheets, HomePageService, AccountApi, ShareService, IndexApi, AccountBookApi, BankAccountApi],
})
export class HomePageModule {
}
