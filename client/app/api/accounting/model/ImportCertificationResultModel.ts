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

import * as models from './models';

/**
 * 导入认证清单的返回值Model
 */
export interface ImportCertificationResultModel {
    /**
     * 导入的认证清单中未在系统中找到的发票号的条数
     */
    noFindInvoiceNumberList?: Array<number>;

    /**
     * 导入的认证清单中发票号匹配，但是税额不匹配的条数
     */
    noCheckTaxList?: Array<number>;

    /**
     * 导入成功的条数
     */
    successNumberList?: Array<number>;

}
