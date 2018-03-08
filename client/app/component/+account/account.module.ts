import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { Angulartics2Module } from 'angulartics2';
import { TabsModule } from 'ngx-bootstrap';

import { BankAccountApi } from './../../api/accounting/api/BankAccountApi';
import { BankStatementApi } from './../../api/accounting/api/BankStatementApi';
import { AccountTransactionApi } from './../../api/accounting/api/AccountTransactionApi';

import { AlertModule } from 'ngx-bootstrap/alert';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { DatepickerModule } from '../widget/datepicker/datepicker.module';

import { AccountComponent } from './account.component';
import { WidgetModule } from '../widget/widget.module';
import { ModalDialogModule } from '../modal/modal.module';
import { PipeModule } from '../../pipe/pipe.module';
import { DirectiveModule } from '../../directive/directive.module';
import { AccountRoutingModule } from './account.routes';
import { AccountService } from './share/account.service';
import { ConfirmWidgetModule } from '../widget/confirm/confirm.moudle';


@NgModule({
    imports: [CommonModule, FormsModule, ReactiveFormsModule, DatepickerModule.forRoot(), ConfirmWidgetModule,
        AlertModule.forRoot(), TabsModule.forRoot(), TooltipModule.forRoot(), ModalDialogModule, WidgetModule,
        Angulartics2Module, PipeModule, DirectiveModule, AccountRoutingModule],
    declarations: [AccountComponent],
    exports: [AccountComponent],
    providers: [BankAccountApi, BankStatementApi, AccountTransactionApi, AccountService]
})
export class AccountModule {
}
