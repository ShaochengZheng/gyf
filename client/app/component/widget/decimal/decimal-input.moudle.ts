/**
 * Created by wzm on 2017/7/7.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { DecimalInputComponent } from './decimal-input';

@NgModule({
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    declarations: [DecimalInputComponent],
    exports: [DecimalInputComponent]
})
export class DecimalInputModule {
}
