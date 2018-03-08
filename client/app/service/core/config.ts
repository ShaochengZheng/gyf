import { Inject, Optional } from '@angular/core';
import { ACCOUNTING_BASE_PATH } from '../../api/accounting/variables';
import { IDENTITY_BASE_PATH } from '../../api/identity/variables';
import { MOBILE_WEB_URL } from './core';

export class Config {

    author = {
        'name': '',
        'title': '',
        'copyright': function () {
            return '© 北京有序云创技术有限公司 ' + new Date().getFullYear() + ' All Rights Reserved';
        }(),
        'icp': '京ICP备 16001145号-1',
        'version': '2.0.0',
        'supportEmail': 'support@guanplus.com',
        'supportPhone': '400-809-0751'
    };
    apiUrls = { 'identity': '', 'resource': '' };
    mobileWeb = {
        'redirectEnabled': false,
        'url': ''
    };
    idle = {
        'url': 'app',
        time: 900,
    };
    hidePeriod = ['/app/finance/beginningPeriod', '/app/finance/import', '/app/setting/company-billing',
        '/app/setting/contact', '/app/setting/multi-user'];
    hideCompanyInfo = ['/app/setting/company-billing', '/app/setting/multi-user'];
    hideurl: Array<any> = ['/app/company-list', '/app/learn-role-privileges', '/app/setting/contact'];
    // 账套列表navbar 最左边的显示不一样
    hideList: Array<any> = ['/app/company-list'];
    changeCompany: Array<any> = ['/app/company-list'];
    constructor( @Optional() @Inject(IDENTITY_BASE_PATH) identityPath: string,
        @Optional() @Inject(ACCOUNTING_BASE_PATH) accountingPath: string,
        @Optional() @Inject(MOBILE_WEB_URL) mobileAppUrl: string) {
        this.apiUrls.identity = identityPath;
        this.apiUrls.resource = accountingPath;
        this.mobileWeb.url = mobileAppUrl;
    }
}
