import { Injectable, NgZone } from '@angular/core';
import { CanActivate, CanActivateChild, CanDeactivate, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Http, Response, URLSearchParams, Headers, RequestOptionsArgs } from '@angular/http';
import { Config } from './config';
import { StorageService } from './storage';
import { AccountApi } from '../../api/identity/api/AccountApi';
import { CompanyApi } from '../../api/identity/api/CompanyApi';
import { RoleApi } from '../../api/accounting/api/RoleApi';
import { UserApi } from '../../api/accounting/api/UserApi';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
export interface CanComponentDeactivate {
    canDeactivate: () => boolean | Observable<boolean>;
}
import * as _ from 'lodash';
@Injectable()
export class AuthorizationService implements CanActivate, CanActivateChild, CanDeactivate<CanComponentDeactivate> {
    // tslint:disable-next-line:variable-name
    Config: any;
    // tslint:disable-next-line:variable-name
    Session: any;

    sessionSubject: any;

    private defaultHeaders: Headers = new Headers();


    constructor(private accountApi: AccountApi, private companyApi: CompanyApi, private zone: NgZone, private roleApi: RoleApi,
        private userApi: UserApi, private storageService: StorageService,
        private router: Router, private http: Http, private config: Config) {
        this.Config = this.config;
        this.Session = this.storageService.getToken();
        this.sessionSubject = new BehaviorSubject(this.Session)
    }

    /**
     *
     *
     * @returns  获取TOKEN
     *
     * @memberof AuthorizationService
     */
    getSession() {
        this.Session = this.storageService.getToken();
        return this.Session;
    }

    /**
     * 设置TOKEN
     *
     * @param {any} token
     *
     * @memberof AuthorizationService
     */
    setSession(token) {
        if (token) {
            // NgZone 做脏检查
            this.zone.run(() => {
                this.storageService.setToken(token);
                this.setUserName(token.user);
                this.Session = this.storageService.getToken();
                this.sessionSubject.next(this.Session)
            });
        }
    }

    /**
     * 返回session Subject
     *
     * @returns {any}
     */
    getSessionSubject(){
        return this.sessionSubject
    }


    /**
     * 权限确定后删除
     * 新用户激活链接用
     * @param {any} token
     *
     * @memberof AuthorizationService
     */
    activation(token) {
        this.setUserName(token.user);
        // console.log('activation 管有方=>', JSON.stringify(token));
        this.storageService.setToken(token);
        this.Session = this.storageService.getToken();
    }

    /**
     * 获取当前帐套状态
     */
    getCurrentAccountStatus() {
        if (this.getSession().currentAccount) {
            return this.getSession().currentAccount.status;
        }
        return '';
    }
    /**
     * 更新当前帐套
     * @param account 帐套信息
     */
    updateCurrentAccount(account) {
        if (this.Session && this.Session.currentAccount) {
            this.Session.currentAccount.status = account.status;
            this.storageService.setToken(this.Session);
        }
    }

    /**
     * 设置用户名，超时用
     *
     * @param {any} name
     *
     * @memberof AuthorizationService
     */
    setUserName(name) {
        // console.log('name');
        // console.log(name);
        // 如果Confirmed均为fales 就要去根据字符判断
        let username = '';
        if (name.phoneNumberComfirmed) {
            username = name.phoneNumber;
        } else if (name.emailConfirmed) {
            username = name.email;
        } else if (name.phoneNumber !== undefined && name.phoneNumber.length > 5) {
            username = name.phoneNumber;
        } else if (name.email !== undefined && name.email.length > 5) {
            username = name.email;
        } else {
            // console.error('未能获取到用户名');
        }

        // 本地储存数据
        localStorage.setItem('name', username);
        // 本地储存数据
    }


    /**
     * 路由守卫 如果没有TOKEN 直接去Login
     *
     * @returns
     *
     * @memberof AuthorizationService
     */
    canActivate() {
        // let aa = this.storageService.getAllCookie();
        this.Session = this.storageService.getToken();
        // console.log('canActivate =>', this.Session);
        if (this.Session && this.Session.user && this.Session.access_token) {

        } else {
            this.router.navigate(['/login']);
            return false;
        }

        return true;
    }

    canActivateChild() {
        return this.canActivate();
    }

    /**
     * 根据companyId切换公司
     *
     * @param {any} companyId
     *
     * @memberof AuthorizationService
     */
    switchCompany(companyId) {
        // return this.accountApi.accountSetCurrentCompany(this.Session.user.id, companyId)
        //     .toPromise().then(
        //     userModel => {
        //         this.Session.user = userModel;
        //         this.setSession(this.Session);
        //     },
        //     error => {
        //         console.log(error);
        //     }
        //     );
    }

    getCompanysList() {
        // let size = '5';
        // this.accountApi.accountGetUserCompanies(this.Session.user.id, size).subscribe(
        //     companyModelArray => {
        //         console.warn(companyModelArray);
        //         return companyModelArray;
        //     },
        //     error => {
        //         console.log(error);
        //     }
        // );
    }

    canDeactivate(component: CanComponentDeactivate): Observable<boolean> | boolean {
        return component.canDeactivate ? component.canDeactivate() : true;
    }

    /**
     * 登陆
     *
     * @param {any} model
     * @param {*} [extraHttpRequestParams]
     * @returns {Promise<any>}
     *
     * @memberof AuthorizationService
     */
    public login(model, extraHttpRequestParams?: any): Promise<any> {
        const path = this.Config.apiUrls.identity + '/api/v1/account/token';

        let queryParameters = new URLSearchParams();
        let headerParams = this.defaultHeaders;
        headerParams.set('Content-Type', 'application/x-www-form-urlencoded');

        // verify required parameter 'model' is set
        if (!model) {
            throw new Error('Missing required parameter model when calling accountRegister');
        }

        let requestOptions: RequestOptionsArgs = {
            method: 'POST',
            headers: headerParams,
            search: queryParameters
        };
        requestOptions.body = this.urlEncode(model);

        return this.http.request(path, requestOptions)
            .map((response: Response) => response.json())
            .toPromise()
            .then(data => {
                this.Session = data;
                // console.log('this.session', this.Session);
                // this.Session.user.companies = null;
                this.setSession(this.Session);
            },
            error => {
                throw error;
            });
    }


    public updateCurrentCompanyInfo() {
        this.companyApi.companyGetCompany(this.Session.user.currentCompany.id).subscribe(
            data => {
                // let companies: any = data;
                // this.Session.user.currentCompany = companies[0];
                // this.Session.user.companies = companies;
                let company: any = data;
                this.Session.user.currentCompany = company;
                this.storageService.setToken(this.Session);
            },
            error => {
            }
        );
    }

    // 检查浏览器版本
    /**
     *
     *
     * @returns {string} 浏览器类型
     *
     * @memberof AuthorizationService
     */
    public DetectionUA(): string {
        let obj = this.DetectionUAObj();
        return obj.browser;
    }
    // 返回一个对象 携带 browser和version
    public DetectionUAObj(): any {

        let userAgent = navigator.userAgent,
            rMsie = /(msie\s|trident\/7)([\w.]+)/,
            rTrident = /(trident)\/([\w.]+)/,
            rFirefox = /(firefox)\/([\w.]+)/,
            rOpera = /(opera).+version\/([\w.]+)/,
            rNewOpera = /(opr)\/(.+)/,
            rChrome = /(chrome)\/([\w.]+)/,
            rSafari = /version\/([\w.]+).*(safari)/,
            rSafari2 = /(safari)\/([\w.]+)/;
        let matchBS, matchBS2;
        let browser;
        let version;
        // tslint:disable-next-line:no-unused-variable
        let ua = userAgent.toLowerCase();
        // tslint:disable-next-line:no-shadowed-variable
        let uaMatch = function (ua) {
            matchBS = rMsie.exec(ua);
            if (matchBS != null) {
                matchBS2 = rTrident.exec(ua);
                if (matchBS2 != null) {
                    switch (matchBS2[2]) {
                        case '4.0':
                            return { browser: 'IE', version: '8' };
                        // break;
                        case '5.0':
                            return { browser: 'IE', version: '9' };
                        // break;
                        case '6.0':
                            return { browser: 'IE', version: '10' };
                        // break;
                        case '7.0':
                            return { browser: 'IE', version: '11' };
                        // break;
                        default:
                            return { browser: 'IE', version: 'undefined' };
                    }
                } else
                    return { browser: 'IE', version: matchBS[2] || '0' };
            }
            matchBS = rFirefox.exec(ua);
            if ((matchBS != null)) {
                return { browser: matchBS[1] || '', version: matchBS[2] || '0' };
            }
            matchBS = rOpera.exec(ua);
            if ((matchBS != null)) {
                return { browser: matchBS[1] || '', version: matchBS[2] || '0' };
            }
            matchBS = rChrome.exec(ua);
            if ((matchBS != null)) {
                matchBS2 = rNewOpera.exec(ua);
                if (matchBS2 == null) return { browser: matchBS[1] || '', version: matchBS[2] || '0' }; else
                    return { browser: 'Opera', version: matchBS2[2] || '0' };
            }
            matchBS = rSafari2.exec(ua);
            // console.log('<safair2>', ua, matchBS);
            if ((matchBS != null)) {
                return { browser: matchBS[1] || '', version: matchBS[2] || '0' };
            }
            // 这个是来监测 version 的-> 也是正确的
            matchBS = rSafari.exec(ua);
            // console.log('<safair>', ua, matchBS);
            if ((matchBS != null)) {
                return { browser: matchBS[2] || '', version: matchBS[1] || '0' };
            }
            if (matchBS != null) {
                return { browser: 'undefined', version: ' browser' };
            }
        };
        let browserMatch = uaMatch(userAgent.toLowerCase());
        if (browserMatch.browser) {
            browser = browserMatch.browser;
            version = browserMatch.version;
        }
        // console.log(browser + version);
        let obj = {
            browser: browser,
            version: version
        };
        return obj;
    }

    /**
     * 验证码
     *
     * @param {any} model
     * @param {*} [extraHttpRequestParams]
     * @returns {Observable<Object>}
     *
     * @memberof AuthorizationService
     */
    public captcha(model, extraHttpRequestParams?: any): Observable<Object> {
        const path = '/api/captcha';

        let queryParameters = new URLSearchParams();

        let headerParams = this.defaultHeaders;
        headerParams.set('Content-Type', 'application/x-www-form-urlencoded');

        // verify required parameter 'model' is set
        if (!model) {
            throw new Error('Missing required parameter model when calling accountRegister');
        }
        let requestOptions: RequestOptionsArgs = {
            method: 'POST',
            headers: headerParams,
            search: queryParameters
        };
        // requestOptions.body = this.urlEncode(model);
        requestOptions.body = model;

        return this.http.request(path, requestOptions)
            .map((response: Response) => response.json());
    }

    // 退出登录
    logout() {
        if (this.Session && this.Session.currentAccount) {
            this.Session.currentAccount.id = null;
        }
        this.storageService.setToken(null);
        this.Session = null; // this.storageService.getToken();
    }

    // 超时退出
    idleOut() {
        let tempSession = this.Session;
        tempSession.access_token = undefined;
        this.storageService.setToken(tempSession);
        this.Session = this.storageService.getToken();

    }


    /**
     * 更具类型获取对应权限
     *
     * @param {any} type
     * 管理员 Manager
     * 会计 Account
     * 助理 Assistant
     *
     * @memberof AuthorizationService
     * 收支 transaction
     * 发票 invoice
     * 工资 salary
     * 固定资产 fixed-assets
     * 财务 finance
     * 账户 account
     * 报表 reports
     * 各种表
     * 设置
     * 各种设置
     *
     */

    public getpermission(type): boolean {
        // console.count('权限获取：');
        let whether: boolean = true;
        let currentRoles = localStorage.getItem('currentRole');
        if (currentRoles && currentRoles !== 'undefined' && currentRoles !== undefined && currentRoles !== null && currentRoles !== 'null') {
            currentRoles = JSON.parse(currentRoles);
            // console.log(currentRoles);
            // console.log(Array.isArray(currentRoles));
            if (currentRoles.length > 0) {
                switch (type) {
                    case 'transaction':
                    case 'invoice':
                    case 'salary':
                    case 'fixed-assets':
                    case 'account':
                        _.forEach(currentRoles, (item) => {
                            if (item === 'Account' || item === 'Assistant')
                                whether = false;
                            // console.log(item);
                        });
                        break;
                    case 'finance':
                        _.forEach(currentRoles, (item) => {
                            if (item === 'Account')
                                whether = false;
                            // console.log(item);
                        });
                        break;
                    default:
                        return true;
                }


            } else {
                // 如果没有权限信息  全部隐藏
                return true;
            }
        } else {
            // 如果没有权限信息  全部隐藏
            return true;
        }

        return whether;

    }
    /**
     * 
     * @param item 根据公司信息返回权限信息，并且更新权限和时期？
     */
    getAcountBookRoles(item): Promise<any> {
        return new Promise((resolve, reject) => {
            this.Session.currentAccount = {
                id: item.id,
                name: item.name,
                beginningNavigation: item.beginningNavigation,
                taxNumber: item.taxNumber,
                status: item.status,
                companyProperty: item.companyProperty
            };
            console.log('2332434343', item);
            this.Session.user.currentRole = [];

            if (item.account && item.account.id === this.Session.user.id) {
                this.Session.user.currentRole.push('Account');
            }
            if (item.assistant && item.assistant.id === this.Session.user.id) {
                this.Session.user.currentRole.push('Assistant');
            }
            if (this.Session.role === 'Manager') {
                this.Session.user.currentRole.push('Manager');
            }
            if (this.Session.user.currentRole.indexOf('Account') > -1 && this.Session.user.currentRole.indexOf('Assistant') > -1) {

                if (item.status === 'BeginningInit') {
                    this.setSession(this.Session);
                    localStorage.setItem('currentRole', JSON.stringify(this.Session.user.currentRole));
                    localStorage.setItem('currentPeriod', item.currentDate);
                    resolve('cannotAccount');
                } else if (item.status === 'InProgress') {
                    this.setSession(this.Session);
                    localStorage.setItem('currentRole', JSON.stringify(this.Session.user.currentRole));
                    localStorage.setItem('currentPeriod', item.currentDate);
                    resolve('canAssistAccount');
                } else {
                    this.setSession(this.Session);
                    localStorage.setItem('currentRole', JSON.stringify(this.Session.user.currentRole));
                    localStorage.setItem('currentPeriod', item.currentDate);
                    resolve('canAccount');
                }
                // 对于会计和助理来说，根据账套状态返回不同的状态
            } else if (this.Session.user.currentRole.indexOf('Account') > -1) {
                if (item.status === 'BeginningInit') {
                    this.setSession(this.Session);
                    localStorage.setItem('currentRole', JSON.stringify(this.Session.user.currentRole));
                    localStorage.setItem('currentPeriod', item.currentDate);
                    resolve('cannotAccount');
                } else {
                    this.setSession(this.Session);
                    localStorage.setItem('currentRole', JSON.stringify(this.Session.user.currentRole));
                    localStorage.setItem('currentPeriod', item.currentDate);
                    resolve('canAccount');
                }
                // 对于会计来说，根据期初状态返回不同的状态
            } else if (this.Session.user.currentRole.indexOf('Assistant') > -1 && this.Session.user.currentRole.indexOf('Manager') > -1) {
                if (item.status === 'BeginningInit') {
                    this.setSession(this.Session);
                    localStorage.setItem('currentRole', JSON.stringify(this.Session.user.currentRole));
                    localStorage.setItem('currentPeriod', item.currentDate);
                    resolve('canManagerAssist');
                } else {
                    this.setSession(this.Session);
                    localStorage.setItem('currentRole', JSON.stringify(this.Session.user.currentRole));
                    localStorage.setItem('currentPeriod', item.currentDate);

                    resolve('canAssist');
                }
                // 对于管理员和助理来说，根据期初状态返回不同的状态，但是如果是期初，跳转到设置页面。
            } else if (this.Session.user.currentRole.indexOf('Assistant') > -1) {
                if (item.status === 'BeginningInit') {
                    this.getSession();
                    console.log('session', this.getSession());
                    resolve('cannotAssist');
                } else {
                    this.setSession(this.Session);
                    localStorage.setItem('currentRole', JSON.stringify(this.Session.user.currentRole));
                    localStorage.setItem('currentPeriod', item.currentDate);

                    resolve('canAssist');
                }
                // 对于助理来说，根据期初状态返回不同的状态，但是如果是期初，不能跳转，并且token 不应该改变。
            } else if (this.Session.user.currentRole.indexOf('Manager') > -1) {
                this.setSession(this.Session);
                // console.log(' this.setSession(this.Session);', this.getSession());
                localStorage.setItem('currentRole', JSON.stringify(this.Session.user.currentRole));
                localStorage.setItem('currentPeriod', item.currentDate);
                // 如果只是管理员，只进入设置页面
                resolve('manager');
            } else {
                reject('出错啦');

            }
        });
    }
    private urlEncode(obj: Object): string {
        let urlSearchParams = new URLSearchParams();
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                urlSearchParams.append(key, obj[key]);
            }
        }
        return urlSearchParams.toString();
    }

}
