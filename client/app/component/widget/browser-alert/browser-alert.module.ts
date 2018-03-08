/**
 * Created by wzm on 2017/7/10.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BrowserAlert } from './browser-alert';

@NgModule({
    imports: [CommonModule, ModalModule.forRoot()],
    declarations: [BrowserAlert],
    exports: [BrowserAlert]
})
export class BrowserAlertModule {
}
