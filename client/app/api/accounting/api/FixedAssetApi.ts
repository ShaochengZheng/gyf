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
export class FixedAssetApi {
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
     * @param fixedAssetModels 
     */
    public fixedAssetBatchUpdate (fixedAssetModels: Array<models.FixedAssetModel>,
      extraHttpRequestParams?: any ): Observable<models.BoolResultModel> {
        const path = this.basePath + '/api/v1/fixed_asset/batch';

        let queryParameters = new URLSearchParams();
        let headerParams = this.defaultHeaders;
        // verify required parameter 'fixedAssetModels' is not null or undefined
        if (fixedAssetModels === null || fixedAssetModels === undefined) {
            throw new Error('Required parameter fixedAssetModels was null or undefined' +
              'when calling fixedAssetBatchUpdate.');
        }
        let requestOptions: RequestOptionsArgs = {
            method: RequestMethod.Post,
            headers: headerParams,
            search: queryParameters
        };
        requestOptions.body = JSON.stringify(fixedAssetModels);

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
     * 验证期初固定资产日期是否正确
     * 
     * @param year year
     * @param month month
     */
    public fixedAssetCheckBeginningDate (year: number,
      month: number,
      extraHttpRequestParams?: any ): Observable<models.BoolResultModel> {
        const path = this.basePath + '/api/v1/fixed_asset/check_date';

        let queryParameters = new URLSearchParams();
        let headerParams = this.defaultHeaders;
        // verify required parameter 'year' is not null or undefined
        if (year === null || year === undefined) {
            throw new Error('Required parameter year was null or undefined' +
              'when calling fixedAssetCheckBeginningDate.');
        }
        // verify required parameter 'month' is not null or undefined
        if (month === null || month === undefined) {
            throw new Error('Required parameter month was null or undefined' +
              'when calling fixedAssetCheckBeginningDate.');
        }
        if (year !== undefined) {
            queryParameters.set('year', String(year));
        }

        if (month !== undefined) {
            queryParameters.set('month', String(month));
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
     * 根据id 删除固定资产
     * 
     * @param id 
     */
    public fixedAssetDelete (id: string,
      extraHttpRequestParams?: any ): Observable<models.BoolResultModel> {
        const path = this.basePath + '/api/v1/fixed_asset/${id}'
            .replace('${' + 'id' + '}', String(id));

        let queryParameters = new URLSearchParams();
        let headerParams = this.defaultHeaders;
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined' +
              'when calling fixedAssetDelete.');
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
     * 导出上传的错误数据
     * 
     * @param attachmentId 附件id
     */
    public fixedAssetExport (attachmentId: string,
      extraHttpRequestParams?: any ): Observable<{}> {
        const path = this.basePath + '/api/v1/fixed_asset/${attachmentId}/export'
            .replace('${' + 'attachmentId' + '}', String(attachmentId));

        let queryParameters = new URLSearchParams();
        let headerParams = this.defaultHeaders;
        // verify required parameter 'attachmentId' is not null or undefined
        if (attachmentId === null || attachmentId === undefined) {
            throw new Error('Required parameter attachmentId was null or undefined' +
              'when calling fixedAssetExport.');
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
     * 计算固定资产或无形资产的总计
     * 
     * @param assetTypeEnum 固定资产类别
     * @param startDate 开始时间
     * @param endDate 结束时间
     * @param minAmount 原值最小值（含）
     * @param maxAmount 原值最大值（含）
     * @param depreciationCategoryId 分类id
     * @param keyword 关键字
     * @param qty 数量
     * @param status 
     * @param tagIds 标签id,以逗号分隔
     */
    public fixedAssetFixedAssetSum (assetTypeEnum: string,
      startDate?: string,
      endDate?: string,
      minAmount?: number,
      maxAmount?: number,
      depreciationCategoryId?: string,
      keyword?: string,
      qty?: number,
      status?: string,
      tagIds?: string,
      extraHttpRequestParams?: any ): Observable<Array<models.IdNameModel>> {
        const path = this.basePath + '/api/v1/fixed_asset/sum';

        let queryParameters = new URLSearchParams();
        let headerParams = this.defaultHeaders;
        // verify required parameter 'assetTypeEnum' is not null or undefined
        if (assetTypeEnum === null || assetTypeEnum === undefined) {
            throw new Error('Required parameter assetTypeEnum was null or undefined' +
              'when calling fixedAssetFixedAssetSum.');
        }
        if (assetTypeEnum !== undefined) {
            queryParameters.set('assetTypeEnum', String(assetTypeEnum));
        }

        if (startDate !== undefined) {
            queryParameters.set('startDate', String(startDate));
        }

        if (endDate !== undefined) {
            queryParameters.set('endDate', String(endDate));
        }

        if (minAmount !== undefined) {
            queryParameters.set('minAmount', String(minAmount));
        }

        if (maxAmount !== undefined) {
            queryParameters.set('maxAmount', String(maxAmount));
        }

        if (depreciationCategoryId !== undefined) {
            queryParameters.set('depreciationCategoryId', String(depreciationCategoryId));
        }

        if (keyword !== undefined) {
            queryParameters.set('keyword', String(keyword));
        }

        if (qty !== undefined) {
            queryParameters.set('qty', String(qty));
        }

        if (status !== undefined) {
            queryParameters.set('status', String(status));
        }

        if (tagIds !== undefined) {
            queryParameters.set('tagIds', String(tagIds));
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
     * 获取固定资产
     * 
     * @param accountId 
     */
    public fixedAssetGet (accountId?: string,
      extraHttpRequestParams?: any ): Observable<Array<models.FixedAssetModel>> {
        const path = this.basePath + '/api/v1/fixed_asset/assign';

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
     * 根据id获取固定资产
     * 
     * @param id 
     */
    public fixedAssetGet_1 (id: string,
      extraHttpRequestParams?: any ): Observable<models.FixedAssetModel> {
        const path = this.basePath + '/api/v1/fixed_asset/${id}'
            .replace('${' + 'id' + '}', String(id));

        let queryParameters = new URLSearchParams();
        let headerParams = this.defaultHeaders;
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined' +
              'when calling fixedAssetGet_1.');
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
     * 导入
     * 
     * @param year 
     * @param month 
     */
    public fixedAssetImport (year: number,
      month: number,
      extraHttpRequestParams?: any ): Observable<models.AttachmentModel> {
        const path = this.basePath + '/api/v1/fixed_asset/import';

        let queryParameters = new URLSearchParams();
        let headerParams = this.defaultHeaders;
        // verify required parameter 'year' is not null or undefined
        if (year === null || year === undefined) {
            throw new Error('Required parameter year was null or undefined' +
              'when calling fixedAssetImport.');
        }
        // verify required parameter 'month' is not null or undefined
        if (month === null || month === undefined) {
            throw new Error('Required parameter month was null or undefined' +
              'when calling fixedAssetImport.');
        }
        if (year !== undefined) {
            queryParameters.set('year', String(year));
        }

        if (month !== undefined) {
            queryParameters.set('month', String(month));
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
     * 根据ImportTaskId获取固定资产信息
     * 
     * @param importTaskId 
     */
    public fixedAssetImportHistory (importTaskId: string,
      extraHttpRequestParams?: any ): Observable<Array<models.FixedAssetModel>> {
        const path = this.basePath + '/api/v1/fixed_asset/importhistory/${importTaskId}'
            .replace('${' + 'importTaskId' + '}', String(importTaskId));

        let queryParameters = new URLSearchParams();
        let headerParams = this.defaultHeaders;
        // verify required parameter 'importTaskId' is not null or undefined
        if (importTaskId === null || importTaskId === undefined) {
            throw new Error('Required parameter importTaskId was null or undefined' +
              'when calling fixedAssetImportHistory.');
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
     * 新增固定资产
     * 
     * @param fixedAssetModel 
     */
    public fixedAssetPost (fixedAssetModel: models.FixedAssetModel,
      extraHttpRequestParams?: any ): Observable<models.FixedAssetModel> {
        const path = this.basePath + '/api/v1/fixed_asset';

        let queryParameters = new URLSearchParams();
        let headerParams = this.defaultHeaders;
        // verify required parameter 'fixedAssetModel' is not null or undefined
        if (fixedAssetModel === null || fixedAssetModel === undefined) {
            throw new Error('Required parameter fixedAssetModel was null or undefined' +
              'when calling fixedAssetPost.');
        }
        let requestOptions: RequestOptionsArgs = {
            method: RequestMethod.Post,
            headers: headerParams,
            search: queryParameters
        };
        requestOptions.body = JSON.stringify(fixedAssetModel);

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
     * 修改固定资产
     * 
     * @param fixedAssetModel 
     */
    public fixedAssetPut (fixedAssetModel: models.FixedAssetModel,
      extraHttpRequestParams?: any ): Observable<models.FixedAssetModel> {
        const path = this.basePath + '/api/v1/fixed_asset';

        let queryParameters = new URLSearchParams();
        let headerParams = this.defaultHeaders;
        // verify required parameter 'fixedAssetModel' is not null or undefined
        if (fixedAssetModel === null || fixedAssetModel === undefined) {
            throw new Error('Required parameter fixedAssetModel was null or undefined' +
              'when calling fixedAssetPut.');
        }
        let requestOptions: RequestOptionsArgs = {
            method: RequestMethod.Put,
            headers: headerParams,
            search: queryParameters
        };
        requestOptions.body = JSON.stringify(fixedAssetModel);

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
     * 分页获取固定资产
     * 
     * @param assetTypeEnum 固定资产类别
     * @param startDate 开始时间
     * @param endDate 结束时间
     * @param minAmount 原值最小值（含）
     * @param maxAmount 原值最大值（含）
     * @param depreciationCategoryId 分类id
     * @param keyword 关键字
     * @param qty 数量
     * @param status 
     * @param tagIds 标签id,以逗号分隔
     * @param pageIndex 页数索引
     * @param pageSize 页数大小
     */
    public fixedAssetSearch (assetTypeEnum: string,
      startDate?: string,
      endDate?: string,
      minAmount?: number,
      maxAmount?: number,
      depreciationCategoryId?: string,
      keyword?: string,
      qty?: number,
      status?: string,
      tagIds?: string,
      pageIndex?: string,
      pageSize?: string,
      extraHttpRequestParams?: any ): Observable<models.PagedResultFixedAssetModel> {
        const path = this.basePath + '/api/v1/fixed_asset/search';

        let queryParameters = new URLSearchParams();
        let headerParams = this.defaultHeaders;
        // verify required parameter 'assetTypeEnum' is not null or undefined
        if (assetTypeEnum === null || assetTypeEnum === undefined) {
            throw new Error('Required parameter assetTypeEnum was null or undefined' +
              'when calling fixedAssetSearch.');
        }
        if (assetTypeEnum !== undefined) {
            queryParameters.set('assetTypeEnum', String(assetTypeEnum));
        }

        if (startDate !== undefined) {
            queryParameters.set('startDate', String(startDate));
        }

        if (endDate !== undefined) {
            queryParameters.set('endDate', String(endDate));
        }

        if (minAmount !== undefined) {
            queryParameters.set('minAmount', String(minAmount));
        }

        if (maxAmount !== undefined) {
            queryParameters.set('maxAmount', String(maxAmount));
        }

        if (depreciationCategoryId !== undefined) {
            queryParameters.set('depreciationCategoryId', String(depreciationCategoryId));
        }

        if (keyword !== undefined) {
            queryParameters.set('keyword', String(keyword));
        }

        if (qty !== undefined) {
            queryParameters.set('qty', String(qty));
        }

        if (status !== undefined) {
            queryParameters.set('status', String(status));
        }

        if (tagIds !== undefined) {
            queryParameters.set('tagIds', String(tagIds));
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
     * 上传附件
     * 
     * @param fixedAssetId 
     */
    public fixedAssetUpload (fixedAssetId: string,
      extraHttpRequestParams?: any ): Observable<Array<models.AccountAttachmentModel>> {
        const path = this.basePath + '/api/v1/fixed_asset/upload/${fixedAssetId}'
            .replace('${' + 'fixedAssetId' + '}', String(fixedAssetId));

        let queryParameters = new URLSearchParams();
        let headerParams = this.defaultHeaders;
        // verify required parameter 'fixedAssetId' is not null or undefined
        if (fixedAssetId === null || fixedAssetId === undefined) {
            throw new Error('Required parameter fixedAssetId was null or undefined' +
              'when calling fixedAssetUpload.');
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
