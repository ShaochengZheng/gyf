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
export class EmployeeApi {
    protected basePath = 'http://guanplus-api-accountingfirm-dev.cn-north-1.eb.amazonaws.com.cn';
    public defaultHeaders: Headers = new Headers();

    constructor(protected http: Http, @Optional()@Inject(ACCOUNTING_BASE_PATH) basePath: string) {
        if (basePath) {
            this.basePath = basePath;
        }
    }

    /**
     * 新增员工
     * 
     * @param employeeModel 
     */
    public employeeCreate (employeeModel: models.EmployeeModel,
      extraHttpRequestParams?: any ): Observable<models.EmployeeModel> {
        const path = this.basePath + '/api/v1/employee';

        let queryParameters = new URLSearchParams();
        let headerParams = this.defaultHeaders;
        // verify required parameter 'employeeModel' is not null or undefined
        if (employeeModel === null || employeeModel === undefined) {
            throw new Error('Required parameter employeeModel was null or undefined' +
              'when calling employeeCreate.');
        }
        let requestOptions: RequestOptionsArgs = {
            method: RequestMethod.Post,
            headers: headerParams,
            search: queryParameters
        };
        requestOptions.body = JSON.stringify(employeeModel);

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
     * 删除
     * 
     * @param id 
     */
    public employeeDelete (id: string,
      extraHttpRequestParams?: any ): Observable<models.BoolResultModel> {
        const path = this.basePath + '/api/v1/employee/${id}'
            .replace('${' + 'id' + '}', String(id));

        let queryParameters = new URLSearchParams();
        let headerParams = this.defaultHeaders;
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined' +
              'when calling employeeDelete.');
        }
        let requestOptions: RequestOptionsArgs = {
            method: RequestMethod.Delete,
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
     * 员工导出
     * 
     */
    public employeeExport (extraHttpRequestParams?: any ): Observable<string> {
        const path = this.basePath + '/api/v1/employee/export';

        let queryParameters = new URLSearchParams();
        let headerParams = this.defaultHeaders;
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
     * 获取单个
     * 
     * @param id 
     */
    public employeeGet (id: string,
      extraHttpRequestParams?: any ): Observable<models.EmployeeModel> {
        const path = this.basePath + '/api/v1/employee/${id}'
            .replace('${' + 'id' + '}', String(id));

        let queryParameters = new URLSearchParams();
        let headerParams = this.defaultHeaders;
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined' +
              'when calling employeeGet.');
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
     * 根据ImportTaskId获取固定资产信息
     * 
     * @param importTaskId 
     */
    public employeeImportHistory (importTaskId: string,
      extraHttpRequestParams?: any ): Observable<Array<models.FixedAssetModel>> {
        const path = this.basePath + '/api/v1/employee/importhistory/${importTaskId}'
            .replace('${' + 'importTaskId' + '}', String(importTaskId));

        let queryParameters = new URLSearchParams();
        let headerParams = this.defaultHeaders;
        // verify required parameter 'importTaskId' is not null or undefined
        if (importTaskId === null || importTaskId === undefined) {
            throw new Error('Required parameter importTaskId was null or undefined' +
              'when calling employeeImportHistory.');
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
     * 获取所有
     * 
     * @param pageIndex 
     * @param pageSize 
     */
    public employeeSearch (pageIndex?: string,
      pageSize?: string,
      extraHttpRequestParams?: any ): Observable<models.PagedResultEmployeeModel> {
        const path = this.basePath + '/api/v1/employee/search';

        let queryParameters = new URLSearchParams();
        let headerParams = this.defaultHeaders;
        if (pageIndex !== undefined) {
            queryParameters.set('pageIndex', String(pageIndex));
        }

        if (pageSize !== undefined) {
            queryParameters.set('pageSize', String(pageSize));
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
     * 修改员工
     * 
     * @param employeeModel 
     */
    public employeeUpdate (employeeModel: models.EmployeeModel,
      extraHttpRequestParams?: any ): Observable<models.EmployeeModel> {
        const path = this.basePath + '/api/v1/employee';

        let queryParameters = new URLSearchParams();
        let headerParams = this.defaultHeaders;
        // verify required parameter 'employeeModel' is not null or undefined
        if (employeeModel === null || employeeModel === undefined) {
            throw new Error('Required parameter employeeModel was null or undefined' +
              'when calling employeeUpdate.');
        }
        let requestOptions: RequestOptionsArgs = {
            method: RequestMethod.Put,
            headers: headerParams,
            search: queryParameters
        };
        requestOptions.body = JSON.stringify(employeeModel);

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
     * 导入
     * 
     */
    public employeeUpload (extraHttpRequestParams?: any ): Observable<models.AttachmentModel> {
        const path = this.basePath + '/api/v1/employee/upload';

        let queryParameters = new URLSearchParams();
        let headerParams = this.defaultHeaders;
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