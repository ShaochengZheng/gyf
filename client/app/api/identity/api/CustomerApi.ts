/**
 * GuanPlus.Identity.WebApi
 *
 * OpenAPI spec version: v1
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Http, Headers, RequestOptionsArgs, Response, URLSearchParams,
  RequestMethod } from '@angular/http';
import { Injectable, Inject, Optional }  from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as models from '../model/models';
import { IDENTITY_BASE_PATH }                                         from '../variables';
import 'rxjs/Rx';

/* tslint:disable:no-unused-variable member-ordering */


@Injectable()
export class CustomerApi {
    protected basePath = 'http://guanplus-api-identity-dev.cn-north-1.eb.amazonaws.com.cn';
    public defaultHeaders: Headers = new Headers();

    constructor(protected http: Http, @Optional()@Inject(IDENTITY_BASE_PATH) basePath: string) {
        if (basePath) {
            this.basePath = basePath;
        }
    }

    /**
     * 客户绑定
     * 
     * @param openId 
     * @param token 
     * @param phoneNumber 
     * @param verifyCode 
     */
    public customerBind (openId: string,
      token: string,
      phoneNumber: string,
      verifyCode: string,
      extraHttpRequestParams?: any ): Observable<models.CustomerCheckModel> {
        const path = this.basePath + '/api/v1/customer/bind';

        let queryParameters = new URLSearchParams();
        let headerParams = this.defaultHeaders;
        // verify required parameter 'openId' is not null or undefined
        if (openId === null || openId === undefined) {
            throw new Error('Required parameter openId was null or undefined' +
              'when calling customerBind.');
        }
        // verify required parameter 'token' is not null or undefined
        if (token === null || token === undefined) {
            throw new Error('Required parameter token was null or undefined' +
              'when calling customerBind.');
        }
        // verify required parameter 'phoneNumber' is not null or undefined
        if (phoneNumber === null || phoneNumber === undefined) {
            throw new Error('Required parameter phoneNumber was null or undefined' +
              'when calling customerBind.');
        }
        // verify required parameter 'verifyCode' is not null or undefined
        if (verifyCode === null || verifyCode === undefined) {
            throw new Error('Required parameter verifyCode was null or undefined' +
              'when calling customerBind.');
        }
        if (openId !== undefined) {
            queryParameters.set('openId', String(openId));
        }

        if (token !== undefined) {
            queryParameters.set('token', String(token));
        }

        if (phoneNumber !== undefined) {
            queryParameters.set('phoneNumber', String(phoneNumber));
        }

        if (verifyCode !== undefined) {
            queryParameters.set('verifyCode', String(verifyCode));
        }

        let requestOptions: RequestOptionsArgs = {
            method: RequestMethod.Post,
            headers: headerParams,
            search: queryParameters
        };

        return this.http.request(path, requestOptions)
            .map((response: Response) => {
                if (response.status === 204) {
                    return undefined;
                } else {
                    return response.json();
                }
            });
    }

    /**
     * 客户绑定
     * 
     * @param openId 
     * @param token 
     * @param phoneNumber 
     */
    public customerCancleBind (openId: string,
      token: string,
      phoneNumber: string,
      extraHttpRequestParams?: any ): Observable<models.BoolResultModel> {
        const path = this.basePath + '/api/v1/customer/canclebind';

        let queryParameters = new URLSearchParams();
        let headerParams = this.defaultHeaders;
        // verify required parameter 'openId' is not null or undefined
        if (openId === null || openId === undefined) {
            throw new Error('Required parameter openId was null or undefined' +
              'when calling customerCancleBind.');
        }
        // verify required parameter 'token' is not null or undefined
        if (token === null || token === undefined) {
            throw new Error('Required parameter token was null or undefined' +
              'when calling customerCancleBind.');
        }
        // verify required parameter 'phoneNumber' is not null or undefined
        if (phoneNumber === null || phoneNumber === undefined) {
            throw new Error('Required parameter phoneNumber was null or undefined' +
              'when calling customerCancleBind.');
        }
        if (openId !== undefined) {
            queryParameters.set('openId', String(openId));
        }

        if (token !== undefined) {
            queryParameters.set('token', String(token));
        }

        if (phoneNumber !== undefined) {
            queryParameters.set('phoneNumber', String(phoneNumber));
        }

        let requestOptions: RequestOptionsArgs = {
            method: RequestMethod.Post,
            headers: headerParams,
            search: queryParameters
        };

        return this.http.request(path, requestOptions)
            .map((response: Response) => {
                if (response.status === 204) {
                    return undefined;
                } else {
                    return response.json();
                }
            });
    }

    /**
     * 检查客户绑定
     * 
     * @param openId 
     * @param token 
     */
    public customerCheck (openId: string,
      token: string,
      extraHttpRequestParams?: any ): Observable<models.CustomerCheckModel> {
        const path = this.basePath + '/api/v1/customer/check';

        let queryParameters = new URLSearchParams();
        let headerParams = this.defaultHeaders;
        // verify required parameter 'openId' is not null or undefined
        if (openId === null || openId === undefined) {
            throw new Error('Required parameter openId was null or undefined' +
              'when calling customerCheck.');
        }
        // verify required parameter 'token' is not null or undefined
        if (token === null || token === undefined) {
            throw new Error('Required parameter token was null or undefined' +
              'when calling customerCheck.');
        }
        if (openId !== undefined) {
            queryParameters.set('openId', String(openId));
        }

        if (token !== undefined) {
            queryParameters.set('token', String(token));
        }

        let requestOptions: RequestOptionsArgs = {
            method: RequestMethod.Get,
            headers: headerParams,
            search: queryParameters
        };

        return this.http.request(path, requestOptions)
            .map((response: Response) => {
                if (response.status === 204) {
                    return undefined;
                } else {
                    return response.json();
                }
            });
    }

    /**
     * 客户绑定
     * 
     * @param accountBookId 
     */
    public customerGetOpenId (accountBookId: string,
      extraHttpRequestParams?: any ): Observable<string> {
        const path = this.basePath + '/api/v1/customer/getopenid';

        let queryParameters = new URLSearchParams();
        let headerParams = this.defaultHeaders;
        // verify required parameter 'accountBookId' is not null or undefined
        if (accountBookId === null || accountBookId === undefined) {
            throw new Error('Required parameter accountBookId was null or undefined' +
              'when calling customerGetOpenId.');
        }
        if (accountBookId !== undefined) {
            queryParameters.set('accountBookId', String(accountBookId));
        }

        let requestOptions: RequestOptionsArgs = {
            method: RequestMethod.Post,
            headers: headerParams,
            search: queryParameters
        };

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
