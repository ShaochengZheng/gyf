
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';

import { PipeModule } from '../../pipe/pipe.module';
import { SelectModule } from '../widget/select';
import { CompanyListComponent } from './company-list.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { AlertModule } from 'ngx-bootstrap/alert';

import { WidgetModule } from '../widget/widget.module';
import { ModalDialogModule } from '../modal/modal.module';
import { CompanyListRoutingModule } from './company-list.routes';
import { CompanyListService } from './shared/company-list.service';
import { AccountBookApi } from '../../api/accounting/api/AccountBookApi';
import { DatepickerModule } from '../widget/datepicker/datepicker.module';
import { ShareService } from '../../service/core/share';
import { AccountApi } from '../../api/accounting/api/AccountApi';
import { UserApi } from '../../api/accounting/api/UserApi';
import { ConfirmWidgetModule } from '../widget/confirm/confirm.moudle';
import { DownloadModule } from './../widget/download/download.moudle';
// import { InviteCustomerModal } from './modal/invite-customer/invite-customer';


@NgModule({
  imports: [CommonModule, FormsModule, DatepickerModule.forRoot(), ModalModule.forRoot(),
    SelectModule, ModalDialogModule, WidgetModule, ConfirmWidgetModule, DownloadModule,
    AlertModule.forRoot(), TooltipModule.forRoot(), CompanyListRoutingModule, PipeModule],
  declarations: [CompanyListComponent],
  exports: [CompanyListComponent],
  providers: [AccountBookApi, CompanyListService, UserApi, ShareService, AccountApi]
})
export class CompanyListModule {
}
