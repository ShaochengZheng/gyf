import { NgModule, ModuleWithProviders } from '@angular/core';
import { Router } from '@angular/router';

import { AccountApi } from '../api/identity/api/AccountApi';
import { CompanyApi } from '../api/identity/api/CompanyApi';
import { RoleApi } from '../api/accounting/api/RoleApi';
import { UserApi } from '../api/accounting/api/UserApi';

import { BankAccountApi } from '../api/accounting/api/BankAccountApi';




import { ACCOUNTING_BASE_PATH } from '../api/accounting';
import { IDENTITY_BASE_PATH } from '../api/identity';
import { MOBILE_WEB_URL } from './core';
import { PubSubService } from './pubsub.service';
import { CookieService } from 'ngx-cookie';
import { HttpModule, Http, XHRBackend, RequestOptions } from '@angular/http';
import {
    StorageService, HttpBaseService, LoaderService, AuthorizationService, UtilityService,
    Config, ExpireGuard, ReserveService, ShareService,
} from './core';

export function httpHelperFactory(xhrBackend: XHRBackend, requestOptions: RequestOptions,
    router: Router, storageService: StorageService, loaderService: LoaderService) {
    return new HttpBaseService(xhrBackend, requestOptions,
        router, storageService, loaderService);
}

let resource = { 'value': process.env.resource };
let identity = { 'value': process.env.identity };
let mobileWebUrl = { 'value': process.env.mobileWeb };

@NgModule({
    imports: [HttpModule]
})
export class ServiceModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: ServiceModule,
            providers: [BankAccountApi, CompanyApi, AccountApi, CookieService, StorageService, LoaderService, UtilityService, Config,
                AuthorizationService, ExpireGuard, ReserveService, PubSubService, RoleApi, ShareService, UserApi,
                { provide: ACCOUNTING_BASE_PATH, useValue: resource.value },
                { provide: IDENTITY_BASE_PATH, useValue: identity.value },
                { provide: MOBILE_WEB_URL, useValue: mobileWebUrl.value },
                {
                    provide: Http,
                    useFactory: httpHelperFactory,
                    deps: [XHRBackend, RequestOptions, Router, StorageService, LoaderService]
                }]
        };
    }
}
