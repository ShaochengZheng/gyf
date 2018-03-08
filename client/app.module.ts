import { NgModule, enableProdMode, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

const fundebug: any = require('fundebug-javascript');

import { HttpModule } from '@angular/http';
import { AlertModule } from 'ngx-bootstrap/alert';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ChartModule } from 'primeng/components/chart/chart';
import { Angulartics2Module } from 'angulartics2';
import { NgIdleModule } from '@ng-idle/core';
import { CookieModule } from 'ngx-cookie';
import { App } from './app';
import { routing } from './app.routes';
import { SelectModule } from './app/component/widget/select';
import { DatepickerModule } from './app/component/widget/datepicker/datepicker.module';

import { ExternalPageModule } from './app/component/external/external.module';
import { WidgetModule } from './app/component/widget/widget.module';
import { CoreModule } from './app/component/core/core.module';
import { ModalDialogModule } from './app/component/modal/modal.module';
import { DirectiveModule } from './app/directive/directive.module';
import { ServiceModule } from './app/service/service.module';
import { LoaderModule } from './app/component/widget/loader/loader.module';

import { Angulartics2BaiduAnalytics } from './app/service/providers/angulartics2BaiduAnalytics';

const isProduction = { 'value': process.env.environment };

if (isProduction.value === 'production') {
    enableProdMode();
}
if (isProduction.value === 'production') {
    fundebug.apikey = 'dc0c1ef8bc98f2051aa348bc1dcb346eb53667cbf8999aa2414a959f79a98724';

} else {
    fundebug.apikey = '3006c7db1df6c6c78e1061c6f7dddb7d2bc52ffae5c6f25304afe36fe54b4907';

}
export class FundebugErrorHandler implements ErrorHandler {
    handleError(err: any): void {
        console.error(err);
        fundebug.notifyError(err.originalError);
    }
}

@NgModule({
    imports: [CookieModule.forRoot(), BrowserModule.withServerTransition({
        appId: 'toh-universal'
    }), FormsModule, HttpModule, ReactiveFormsModule,
    AlertModule.forRoot(), TooltipModule.forRoot(), ChartModule, SelectModule, TabsModule.forRoot(),
    PaginationModule.forRoot(), DatepickerModule.forRoot(), ExternalPageModule, ServiceModule.forRoot(),
        WidgetModule, Angulartics2Module.forRoot([Angulartics2BaiduAnalytics]), ModalDialogModule, CoreModule,
        routing, DirectiveModule, NgIdleModule.forRoot(), LoaderModule],       // module dependencies
    declarations: [App],    // components and directives
    bootstrap: [App],  // root component
    providers: [{ provide: ErrorHandler, useClass: FundebugErrorHandler }]
})
export class AppModule {
}
