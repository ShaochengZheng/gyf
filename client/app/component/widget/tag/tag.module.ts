import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';


import { TagComponent } from './tag.component';



@NgModule({
    imports: [CommonModule, FormsModule, ReactiveFormsModule, TooltipModule.forRoot(), ModalModule.forRoot()],
    declarations: [TagComponent],
    exports: [TagComponent]
})
export class TagModule {
}
