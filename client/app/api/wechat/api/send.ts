import { Http, Headers, RequestOptionsArgs, Response, URLSearchParams } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';

/* tslint:disable:no-unused-variable member-ordering */


@Injectable()
export class WeChatApi {
    public defaultHeaders: Headers = new Headers();

    constructor(protected http: Http) {

    }

    public sent(model, extraHttpRequestParams?: any): Observable<any> {
        const path = '/jiezhuan';

        let queryParameters = new URLSearchParams();
        let headerParams = this.defaultHeaders;
        // verify required parameter 'invoiceModel' is not null or undefined
        if (model === null || model === undefined) {
            throw new Error('Required parameter invoiceModel was null or undefined' +
                'when calling invoiceCreate.');
        }
        let requestOptions: RequestOptionsArgs = {
            method: 'Post',
            headers: headerParams,
            search: queryParameters
        };
        requestOptions.body = JSON.stringify(model);

        return this.http.request(path, requestOptions)
            .map((response: Response) => {
                if (response.status === 204) {
                    return undefined;
                } else {
                    return response.json();
                }
            });
    }
}
