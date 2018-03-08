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
export class ShareholderApi {
    protected basePath = 'http://guanplus-api-accountingfirm-dev.cn-north-1.eb.amazonaws.com.cn';
    public defaultHeaders: Headers = new Headers();

    constructor(protected http: Http, @Optional()@Inject(ACCOUNTING_BASE_PATH) basePath: string) {
        if (basePath) {
            this.basePath = basePath;
        }
    }

    /**
     * 批量保存
     * 
     * @param shareholderModels 
     */
    public shareholderBatchUpdate (shareholderModels: Array<models.ShareholderModel>,
      extraHttpRequestParams?: any ): Observable<models.BoolResultModel> {
        const path = this.basePath + '/api/v1/shareholder/batch';

        let queryParameters = new URLSearchParams();
        let headerParams = this.defaultHeaders;
        // verify required parameter 'shareholderModels' is not null or undefined
        if (shareholderModels === null || shareholderModels === undefined) {
            throw new Error('Required parameter shareholderModels was null or undefined' +
              'when calling shareholderBatchUpdate.');
        }
        let requestOptions: RequestOptionsArgs = {
            method: RequestMethod.Put,
            headers: headerParams,
            search: queryParameters
        };
        requestOptions.body = JSON.stringify(shareholderModels);

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
     * 根据id删除
     * 
     * @param id 
     */
    public shareholderDelete (id: string,
      extraHttpRequestParams?: any ): Observable<any> {
        const path = this.basePath + '/api/v1/shareholder/${id}'
            .replace('${' + 'id' + '}', String(id));

        let queryParameters = new URLSearchParams();
        let headerParams = this.defaultHeaders;
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined' +
              'when calling shareholderDelete.');
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
     * 获取所有股东
     * 
     * @param accountId 
     */
    public shareholderGet (accountId?: string,
      extraHttpRequestParams?: any ): Observable<Array<models.ShareholderModel>> {
        const path = this.basePath + '/api/v1/shareholder/assign';

        let queryParameters = new URLSearchParams();
        let headerParams = this.defaultHeaders;
        if (accountId !== undefined) {
            queryParameters.set('accountId', String(accountId));
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
     * 获取所有股东
     * 
     */
    public shareholderGetAll (extraHttpRequestParams?: any ): Observable<Array<models.ShareholderModel>> {
        const path = this.basePath + '/api/v1/shareholder/all';

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
     * 获取账套股东投资比例合计
     * 
     */
    public shareholderGetShareProportionTotal (extraHttpRequestParams?: any ): Observable<models.AmountModel> {
        const path = this.basePath + '/api/v1/shareholder/shareproportion_total';

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
     * 根据ImportTaskId获取
     * 
     * @param importTaskId 
     */
    public shareholderImportHistory (importTaskId: string,
      extraHttpRequestParams?: any ): Observable<Array<models.FixedAssetModel>> {
        const path = this.basePath + '/api/v1/shareholder/importhistory/${importTaskId}'
            .replace('${' + 'importTaskId' + '}', String(importTaskId));

        let queryParameters = new URLSearchParams();
        let headerParams = this.defaultHeaders;
        // verify required parameter 'importTaskId' is not null or undefined
        if (importTaskId === null || importTaskId === undefined) {
            throw new Error('Required parameter importTaskId was null or undefined' +
              'when calling shareholderImportHistory.');
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
     * 新增
     * 
     * @param model 
     */
    public shareholderPost (model: models.ShareholderModel,
      extraHttpRequestParams?: any ): Observable<models.ShareholderModel> {
        const path = this.basePath + '/api/v1/shareholder';

        let queryParameters = new URLSearchParams();
        let headerParams = this.defaultHeaders;
        // verify required parameter 'model' is not null or undefined
        if (model === null || model === undefined) {
            throw new Error('Required parameter model was null or undefined' +
              'when calling shareholderPost.');
        }
        let requestOptions: RequestOptionsArgs = {
            method: RequestMethod.Post,
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

    /**
     * 分页获取
     * 
     * @param keyword 
     * @param pageIndex 页数索引
     * @param pageSize 页数大小
     */
    public shareholderSearch (keyword?: string,
      pageIndex?: string,
      pageSize?: string,
      extraHttpRequestParams?: any ): Observable<models.PagedResultShareholderModel> {
        const path = this.basePath + '/api/v1/shareholder/search';

        let queryParameters = new URLSearchParams();
        let headerParams = this.defaultHeaders;
        if (keyword !== undefined) {
            queryParameters.set('keyword', String(keyword));
        }

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
     * 更新
     * 
     * @param model 
     */
    public shareholderUpdate (model: models.ShareholderModel,
      extraHttpRequestParams?: any ): Observable<models.BoolResultModel> {
        const path = this.basePath + '/api/v1/shareholder';

        let queryParameters = new URLSearchParams();
        let headerParams = this.defaultHeaders;
        // verify required parameter 'model' is not null or undefined
        if (model === null || model === undefined) {
            throw new Error('Required parameter model was null or undefined' +
              'when calling shareholderUpdate.');
        }
        let requestOptions: RequestOptionsArgs = {
            method: RequestMethod.Put,
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
