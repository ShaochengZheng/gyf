/**
 * GuanPlus.AccountingFirm.WebApi
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
import { ACCOUNTING_BASE_PATH }                                         from '../variables';
import 'rxjs/Rx';

/* tslint:disable:no-unused-variable member-ordering */


@Injectable()
export class RoleApi {
    protected basePath = 'http://guanplus-api-accountingfirm-dev.cn-north-1.eb.amazonaws.com.cn';
    public defaultHeaders: Headers = new Headers();

    constructor(protected http: Http, @Optional()@Inject(ACCOUNTING_BASE_PATH) basePath: string) {
        if (basePath) {
            this.basePath = basePath;
        }
    }

    /**
     * 获取用户在某个公司的角色
     * 
     * @param userId 用户id
     * @param companyId 公司id
     */
    public roleGet (userId?: string,
      companyId?: string,
      extraHttpRequestParams?: any ): Observable<Array<models.RoleModel>> {
        const path = this.basePath + '/api/v1/role';

        let queryParameters = new URLSearchParams();
        let headerParams = this.defaultHeaders;
        if (userId !== undefined) {
            queryParameters.set('userId', String(userId));
        }

        if (companyId !== undefined) {
            queryParameters.set('companyId', String(companyId));
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

}
