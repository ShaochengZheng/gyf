import { CommonModule } from '@angular/common';
import { BankAccountApi } from '../../api/accounting/api/BankAccountApi';
import { AccountBookApi } from '../../api/accounting/api/AccountBookApi';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';
import { AlertModule } from 'ngx-bootstrap/alert';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ModalModule } from 'ngx-bootstrap/modal';
import { WidgetModule } from '../widget/widget.module';
import { ModalDialogModule } from '../modal/modal.module';
import { DirectiveModule } from '../../directive/directive.module';
import { BrowserAlertModule } from '../widget/browser-alert/browser-alert.module';
import { Footer, Navbar, Sidebar, Core } from './';

import { SplitButtonModule } from 'primeng/primeng';


@NgModule({
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, HttpModule, BrowserAlertModule,
        AlertModule.forRoot(), SplitButtonModule, TooltipModule.forRoot(), ModalModule.forRoot(), ModalDialogModule,
        WidgetModule, DirectiveModule],
    declarations: [Footer, Navbar, Sidebar, Core],
    exports: [Footer, Navbar, Sidebar, Core],
    providers: [BankAccountApi, AccountBookApi]
})
export class CoreModule {
}
