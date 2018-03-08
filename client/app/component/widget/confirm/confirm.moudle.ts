/**
 * Created by wzm on 2017/7/7.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ConfirmWidget } from './confirm';

@NgModule({
    imports: [CommonModule, ModalModule.forRoot()],
    declarations: [ConfirmWidget],
    exports: [ConfirmWidget]
})
export class ConfirmWidgetModule {

}
