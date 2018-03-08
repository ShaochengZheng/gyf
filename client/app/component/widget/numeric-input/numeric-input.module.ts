import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NumericInputComponent } from './numeric-input.component';

@NgModule({
  imports: [
    FormsModule, ReactiveFormsModule, CommonModule
  ],
  declarations: [NumericInputComponent],
  exports: [NumericInputComponent]
})
export class NumericInputModule { }
