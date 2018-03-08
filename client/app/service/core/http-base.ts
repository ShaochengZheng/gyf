import * as _ from 'lodash';

import {
    Http, RequestOptionsArgs, Response, RequestOptions,
    ConnectionBackend, Headers
} from '@angular/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { StorageService } from './storage';
import { LoaderService } from './loader';

export class HttpBaseService extends Http {

    constructor(backend: ConnectionBackend, defaultOptions: RequestOptions,
        private _router: Router, private storageService: StorageService, private loaderService: LoaderService) {
        super(backend, defaultOptions);
    }

    request(url: string, options?: RequestOptionsArgs): Observable<Response> {
        if (!_.endsWith(url, 'check')) {
            this.loaderService.show();
        }

        return this.intercept(super.request(url, this.getRequestOptionArgs(options, url)).share());
    }

    get(url: string, options?: RequestOptionsArgs): Observable<Response> {
        this.loaderService.show();
        return this.intercept(super.get(url, this.getRequestOptionArgs(options)).share());
    }

    post(url: string, body: string, options?: RequestOptionsArgs): Observable<Response> {
        this.loaderService.show();
        return this.intercept(super.post(url, body, this.getRequestOptionArgs(options)).share());
    }

    put(url: string, body: string, options?: RequestOptionsArgs): Observable<Response> {
        this.loaderService.show();
        return this.intercept(super.put(url, body, this.getRequestOptionArgs(options)).share());
    }

    delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
        this.loaderService.show();
        return this.intercept(super.delete(url, this.getRequestOptionArgs(options)).share());
    }

    getRequestOptionArgs(options?: RequestOptionsArgs, url?: string): RequestOptionsArgs {
        if (options == null) {
            options = new RequestOptions();
        }
        if (options.headers == null) {
            options.headers = new Headers();
        }
        // Set Accept Json for Firefox
        options.headers.set('Accept', 'application/json');
        if (_.endsWith(url, 'token')) {
            return options;
        }
        if (options.headers.has('accountbook_id')) {
            options.headers.delete('accountbook_id');
        }
        options.headers.set('Content-Type', 'application/json');
        options.headers.set('Cache-Control', 'no-cache');
        let token = this.storageService.getToken();
        if (token && token.access_token && !_.endsWith(url, 'register') && !_.endsWith(url, 'forget_password')) {
            options.headers.set('Authorization', 'bearer ' + token.access_token);
            // 给角色API开后门
            // let pathname = url.indexOf('api/v1/role');
            if (token.user && token.user.currentCompany && token.user.currentCompany.id) {
                options.headers.set('company_id', token.user.currentCompany.id);
            }


            if (token.currentAccount && token.currentAccount.id) {
                options.headers.set('accountbook_id', token.currentAccount.id);
            }

            // if (!token.accountBookID) {
            //     options.headers.set('accountbook_id', 'c6e7fa01-e3e0-4c40-8485-dbed17ea5d0b');
            // }
        } else {
            console.log('>>>>>>>>??????');
            // this._router.navigate(['/login']);
        }
        return options;
    }
    intercept(observable: Observable<any>): Observable<Response> {
        observable.subscribe(
            res => {
                // debug
                // if (res._body === 'null' || null) {
                //     console.error('没数据');
                // };
                this.loaderService.hide();
            },
            error => this.loaderService.hide()
        );


        return observable.catch((err, source) => {

            this.loaderService.hide();
            if (err.status === 401 && !_.endsWith(err.url, 'token')) {
                console.error('token?')
                this._router.navigate(['/login']);
                return Observable.empty();
            } else {
                console.log('http base', err);
                if (err.status > 400 && err.status <= 500) {
                    if (err.status === 404) {
                        console.error(err);
                        return Observable.throw('服务器离家出走了，请再试一下');

                    } else if (err.status === 412) {
                        console.error(err);
                        // return Observable.throw('参数错误');
                        return Observable.throw(JSON.parse(err._body).errors[0]);
                    } else if (err.status === 500) {
                        console.error(err);
                        return Observable.throw('服务器生病了，请再试一下');
                    } else {
                        console.error(err);
                        return Observable.throw(JSON.parse(err._body).errors[0]);
                    }
                } else {
                    return Observable.throw(err);
                }
            }
        });
    }
}
