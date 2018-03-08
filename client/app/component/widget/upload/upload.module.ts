/**
 * Created by wzm on 2017/7/10.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UploadWidget } from './upload';

@NgModule({
    imports: [CommonModule, FormsModule, ReactiveFormsModule, ModalModule.forRoot()],
    declarations: [UploadWidget],
    exports: [UploadWidget]
})
export class UploadWidgetModule {
}
