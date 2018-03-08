import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AlertModule } from 'ngx-bootstrap/alert';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ModalModule } from 'ngx-bootstrap/modal';
import { WidgetModule } from '../widget/widget.module';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ModalDialogModule } from '../modal/modal.module';
import { SelectModule } from '../../component/widget/select';
import { DatepickerModule } from '../widget/datepicker/datepicker.module';
import { UploadAttachmentsMoudule } from '../widget/upload-attachments/upload-attachments.module';
import {
    ExternalFooterComponent, LoginComponent, RegisterComponent, InvalidLinkComponent,
    LinkSetPasswordComponent, CreateCompanyComponent,
    ExternalNavComponent, RetrievePasswordComponent,
} from './';
import { CreateWaysComponent } from './create-ways/create-ways.component';
import { BrowserAlertModule } from '../widget/browser-alert/browser-alert.module';


import { ActivateLinkComponent } from '../../component/external/multi-entry/link/activate-link';

@NgModule({
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, ModalModule.forRoot(), WidgetModule, BrowserAlertModule, UploadAttachmentsMoudule,
        AlertModule.forRoot(), DatepickerModule.forRoot(), TooltipModule.forRoot(), TabsModule.forRoot(), PaginationModule.forRoot(),
        SelectModule, ModalDialogModule],
    declarations: [LoginComponent, ExternalFooterComponent, RegisterComponent,
        InvalidLinkComponent, LinkSetPasswordComponent, CreateWaysComponent,
        ExternalNavComponent, RetrievePasswordComponent, CreateCompanyComponent,
        ActivateLinkComponent],
    exports: [LoginComponent, RegisterComponent, InvalidLinkComponent, CreateCompanyComponent,
        LinkSetPasswordComponent, ExternalNavComponent, RetrievePasswordComponent, CreateWaysComponent,
        ActivateLinkComponent],
})
export class ExternalPageModule {
}
