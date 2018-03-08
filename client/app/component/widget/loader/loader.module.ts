/**
 * Created by wzm on 2017/7/7.
 */
import { NgModule } from '@angular/core';

import { LoaderWidget } from './loader';

@NgModule({
    declarations: [LoaderWidget],
    exports: [LoaderWidget]
})
export class LoaderModule {
}
