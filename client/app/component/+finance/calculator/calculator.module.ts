/**
 * Created by wzm on 2017/7/10.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CalculatorComponent } from './calculator';

@NgModule({
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    declarations: [CalculatorComponent],
    exports: [CalculatorComponent]
})
export class CalculatorModule {
}
