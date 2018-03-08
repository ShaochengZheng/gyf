import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { Calendar } from './calendar/calendar';
import { PushNotificationComponent } from './notification/notification';
import { IdlePopoverComponent } from './idle-Popover/idle-Popover.component';

@NgModule({
    imports: [CommonModule, FormsModule, ReactiveFormsModule, TooltipModule.forRoot(), ModalModule.forRoot()],
    declarations: [Calendar, IdlePopoverComponent,
        PushNotificationComponent],
    exports: [Calendar, IdlePopoverComponent,
        PushNotificationComponent]
})
export class WidgetModule {
}
