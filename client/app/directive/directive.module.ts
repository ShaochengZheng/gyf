import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ExpireDirective, ExpireThreeMonthDirective } from './expire';
import { AdimDirective } from './role';
import { CountingDirective } from './role';
import { AssitantDirective } from './role';
import { LockinDirective, LockTaxDirective } from './lockin.directive';


@NgModule({
    imports: [CommonModule],
    declarations: [ExpireDirective, ExpireThreeMonthDirective, AdimDirective, CountingDirective, AssitantDirective,
        LockinDirective, LockTaxDirective
    ],
    exports: [ExpireDirective, ExpireThreeMonthDirective, LockinDirective, AdimDirective, CountingDirective,
        AssitantDirective, LockTaxDirective]
})
export class DirectiveModule {
}
