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
export class PartnerAccountApi {
    protected basePath = 'http://guanplus-api-identity-dev.cn-north-1.eb.amazonaws.com.cn';
    public defaultHeaders: Headers = new Headers();

    constructor(protected http: Http, @Optional()@Inject(IDENTITY_BASE_PATH) basePath: string) {
        if (basePath) {
            this.basePath = basePath;
        }
    }

    /**
     * 检查公司是否存在
     * 
     * @param partnerCompanyId 
     */
    public partnerAccountCheckCompany (partnerCompanyId: string,
      extraHttpRequestParams?: any ): Observable<models.CheckCompanyResultModel> {
        const path = this.basePath + '/api/v1/partner_account/${partnerCompanyId}/check_company'
            .replace('${' + 'partnerCompanyId' + '}', String(partnerCompanyId));

        let queryParameters = new URLSearchParams();
        let headerParams = this.defaultHeaders;
        // verify required parameter 'partnerCompanyId' is not null or undefined
        if (partnerCompanyId === null || partnerCompanyId === undefined) {
            throw new Error('Required parameter partnerCompanyId was null or undefined' +
              'when calling partnerAccountCheckCompany.');
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
     * 钉钉绑定已有管家账号
     * 
     * @param linkPartnerModel 
     */
    public partnerAccountLinkPartner (linkPartnerModel: models.LinkPartnerModel,
      extraHttpRequestParams?: any ): Observable<models.TokenModel> {
        const path = this.basePath + '/api/v1/partner_account/link_partner';

        let queryParameters = new URLSearchParams();
        let headerParams = this.defaultHeaders;
        // verify required parameter 'linkPartnerModel' is not null or undefined
        if (linkPartnerModel === null || linkPartnerModel === undefined) {
            throw new Error('Required parameter linkPartnerModel was null or undefined' +
              'when calling partnerAccountLinkPartner.');
        }
        let requestOptions: RequestOptionsArgs = {
            method: RequestMethod.Post,
            headers: headerParams,
            search: queryParameters
        };
        requestOptions.body = JSON.stringify(linkPartnerModel);

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
     * 钉钉登陆
     * 
     * @param partner 
     */
    public partnerAccountPartnerLogin (partner: models.PartnerLoginModel,
      extraHttpRequestParams?: any ): Observable<models.TokenModel> {
        const path = this.basePath + '/api/v1/partner_account/partner_login';

        let queryParameters = new URLSearchParams();
        let headerParams = this.defaultHeaders;
        // verify required parameter 'partner' is not null or undefined
        if (partner === null || partner === undefined) {
            throw new Error('Required parameter partner was null or undefined' +
              'when calling partnerAccountPartnerLogin.');
        }
        let requestOptions: RequestOptionsArgs = {
            method: RequestMethod.Post,
            headers: headerParams,
            search: queryParameters
        };
        requestOptions.body = JSON.stringify(partner);

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
     * 钉钉注册
     * 
     * @param partner 
     */
    public partnerAccountPartnerRegister (partner: models.PartnerRegisterModel,
      extraHttpRequestParams?: any ): Observable<models.TokenModel> {
        const path = this.basePath + '/api/v1/partner_account/partner_register';

        let queryParameters = new URLSearchParams();
        let headerParams = this.defaultHeaders;
        // verify required parameter 'partner' is not null or undefined
        if (partner === null || partner === undefined) {
            throw new Error('Required parameter partner was null or undefined' +
              'when calling partnerAccountPartnerRegister.');
        }
        let requestOptions: RequestOptionsArgs = {
            method: RequestMethod.Post,
            headers: headerParams,
            search: queryParameters
        };
        requestOptions.body = JSON.stringify(partner);

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
