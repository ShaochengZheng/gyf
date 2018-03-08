import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SelectComponent } from './select';
import { HighlightPipe } from './select-pipes';
import { OffClickDirective } from './off-click';
import { PipeModule } from '../../../pipe/pipe.module';

@NgModule({
  imports: [CommonModule, PipeModule],
  declarations: [SelectComponent, HighlightPipe, OffClickDirective],
  exports: [SelectComponent, HighlightPipe, OffClickDirective]
})
export class SelectModule {
}
