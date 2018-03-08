import { CustomCurrencyPipe } from './currency';
import { AbsolutePipe } from './absolute';
import { CompanyPropertyPipe } from './companyProperty';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

@NgModule({
  imports: [CommonModule],
  declarations: [CustomCurrencyPipe, AbsolutePipe, CompanyPropertyPipe
  ],
  exports: [CustomCurrencyPipe, AbsolutePipe, CompanyPropertyPipe]
})
export class PipeModule {
}
