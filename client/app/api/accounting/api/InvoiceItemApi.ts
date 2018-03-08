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
export class InvoiceItemApi {
    protected basePath = 'http://guanplus-api-accountingfirm-dev.cn-north-1.eb.amazonaws.com.cn';
    public defaultHeaders: Headers = new Headers();

    constructor(protected http: Http, @Optional()@Inject(ACCOUNTING_BASE_PATH) basePath: string) {
        if (basePath) {
            this.basePath = basePath;
        }
    }

    /**
     * 
     * 
     * @param invoiceId 
     * @param id 
     */
    public invoiceItemDelete (invoiceId: string,
      id: number,
      extraHttpRequestParams?: any ): Observable<any> {
        const path = this.basePath + '/api/v1/invoice_item/${invoiceId}/${id}'
            .replace('${' + 'invoiceId' + '}', String(invoiceId))
            .replace('${' + 'id' + '}', String(id));

        let queryParameters = new URLSearchParams();
        let headerParams = this.defaultHeaders;
        // verify required parameter 'invoiceId' is not null or undefined
        if (invoiceId === null || invoiceId === undefined) {
            throw new Error('Required parameter invoiceId was null or undefined' +
              'when calling invoiceItemDelete.');
        }
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined' +
              'when calling invoiceItemDelete.');
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
     * 导出
     * 
     * @param tagIds 
     * @param entityType 
     * @param invoiceType 
     * @param invoiceStatus 
     * @param invoiceNumber 
     * @param taxRate 
     * @param keyword 
     * @param startDate 
     * @param endDate 
     * @param pageIndex 
     * @param pageSize 
     */
    public invoiceItemInvoiceExport (tagIds?: string,
      entityType?: string,
      invoiceType?: string,
      invoiceStatus?: string,
      invoiceNumber?: string,
      taxRate?: number,
      keyword?: string,
      startDate?: string,
      endDate?: string,
      pageIndex?: string,
      pageSize?: string,
      extraHttpRequestParams?: any ): Observable<string> {
        const path = this.basePath + '/api/v1/invoice_item/export';

        let queryParameters = new URLSearchParams();
        let headerParams = this.defaultHeaders;
        if (tagIds !== undefined) {
            queryParameters.set('tagIds', String(tagIds));
        }

        if (entityType !== undefined) {
            queryParameters.set('entityType', String(entityType));
        }

        if (invoiceType !== undefined) {
            queryParameters.set('invoiceType', String(invoiceType));
        }

        if (invoiceStatus !== undefined) {
            queryParameters.set('invoiceStatus', String(invoiceStatus));
        }

        if (invoiceNumber !== undefined) {
            queryParameters.set('invoiceNumber', String(invoiceNumber));
        }

        if (taxRate !== undefined) {
            queryParameters.set('taxRate', String(taxRate));
        }

        if (keyword !== undefined) {
            queryParameters.set('keyword', String(keyword));
        }

        if (startDate !== undefined) {
            queryParameters.set('startDate', String(startDate));
        }

        if (endDate !== undefined) {
            queryParameters.set('endDate', String(endDate));
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
     * 开票或收票的总计
     * 
     * @param tagIds 
     * @param entityType 
     * @param invoiceType 
     * @param invoiceStatus 
     * @param invoiceNumber 
     * @param taxRate 
     * @param keyword 
     * @param startDate 
     * @param endDate 
     */
    public invoiceItemInvoiceSum (tagIds?: string,
      entityType?: string,
      invoiceType?: string,
      invoiceStatus?: string,
      invoiceNumber?: string,
      taxRate?: number,
      keyword?: string,
      startDate?: string,
      endDate?: string,
      extraHttpRequestParams?: any ): Observable<Array<models.IdNameModel>> {
        const path = this.basePath + '/api/v1/invoice_item/sum';

        let queryParameters = new URLSearchParams();
        let headerParams = this.defaultHeaders;
        if (tagIds !== undefined) {
            queryParameters.set('tagIds', String(tagIds));
        }

        if (entityType !== undefined) {
            queryParameters.set('entityType', String(entityType));
        }

        if (invoiceType !== undefined) {
            queryParameters.set('invoiceType', String(invoiceType));
        }

        if (invoiceStatus !== undefined) {
            queryParameters.set('invoiceStatus', String(invoiceStatus));
        }

        if (invoiceNumber !== undefined) {
            queryParameters.set('invoiceNumber', String(invoiceNumber));
        }

        if (taxRate !== undefined) {
            queryParameters.set('taxRate', String(taxRate));
        }

        if (keyword !== undefined) {
            queryParameters.set('keyword', String(keyword));
        }

        if (startDate !== undefined) {
            queryParameters.set('startDate', String(startDate));
        }

        if (endDate !== undefined) {
            queryParameters.set('endDate', String(endDate));
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
     * 
     * 
     * @param tagIds 
     * @param entityType 
     * @param invoiceType 
     * @param invoiceStatus 
     * @param invoiceNumber 
     * @param taxRate 
     * @param keyword 
     * @param startDate 
     * @param endDate 
     * @param pageIndex 
     * @param pageSize 
     */
    public invoiceItemSearch (tagIds?: string,
      entityType?: string,
      invoiceType?: string,
      invoiceStatus?: string,
      invoiceNumber?: string,
      taxRate?: number,
      keyword?: string,
      startDate?: string,
      endDate?: string,
      pageIndex?: string,
      pageSize?: string,
      extraHttpRequestParams?: any ): Observable<models.PagedResultInvoiceItemModel> {
        const path = this.basePath + '/api/v1/invoice_item/search';

        let queryParameters = new URLSearchParams();
        let headerParams = this.defaultHeaders;
        if (tagIds !== undefined) {
            queryParameters.set('tagIds', String(tagIds));
        }

        if (entityType !== undefined) {
            queryParameters.set('entityType', String(entityType));
        }

        if (invoiceType !== undefined) {
            queryParameters.set('invoiceType', String(invoiceType));
        }

        if (invoiceStatus !== undefined) {
            queryParameters.set('invoiceStatus', String(invoiceStatus));
        }

        if (invoiceNumber !== undefined) {
            queryParameters.set('invoiceNumber', String(invoiceNumber));
        }

        if (taxRate !== undefined) {
            queryParameters.set('taxRate', String(taxRate));
        }

        if (keyword !== undefined) {
            queryParameters.set('keyword', String(keyword));
        }

        if (startDate !== undefined) {
            queryParameters.set('startDate', String(startDate));
        }

        if (endDate !== undefined) {
            queryParameters.set('endDate', String(endDate));
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

}