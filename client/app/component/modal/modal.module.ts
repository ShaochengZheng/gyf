import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AlertModule } from 'ngx-bootstrap/alert';
import { TabsModule } from 'ngx-bootstrap';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { DatepickerModule } from '../widget/datepicker/datepicker.module';

import { SelectModule } from '../widget/select';
import { WidgetModule } from '../widget/widget.module';
import { DirectiveModule } from '../../directive/directive.module';
import { RouterModule } from '@angular/router';
import { PipeModule } from '../../../app/pipe/pipe.module';
import { PicturePreviewModal } from './picture-preview/picture-preview';


import {
    PersonalInfoModalComponent, InviteUserNewModal, InviteCustomerModal,
    ContactDetailsModal, AccountDetailsModal
} from './';

@NgModule({
    imports: [CommonModule, FormsModule, ReactiveFormsModule, ModalModule.forRoot(), DatepickerModule.forRoot(), TooltipModule.forRoot(),
        AlertModule.forRoot(), SelectModule, TabsModule.forRoot(), WidgetModule, DirectiveModule,
        RouterModule, PipeModule],
    declarations: [PersonalInfoModalComponent, InviteUserNewModal,
        ContactDetailsModal, AccountDetailsModal, PicturePreviewModal, InviteCustomerModal
    ],
    exports: [PersonalInfoModalComponent, InviteUserNewModal, InviteCustomerModal,
        ContactDetailsModal, AccountDetailsModal, PicturePreviewModal]
})
export class ModalDialogModule {
}
