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
 * 凭证子项Model
 */
export interface JournalEntryLineItemModel {
    /**
     * Id
     */
    id?: string;

    /**
     * 金额
     */
    amount?: number;

    /**
     * 科目
     */
    account?: models.IdNameModel;

    /**
     * 借贷类型
     */
    debitCreditType?: string;

    /**
     * 摘要
     */
    summary?: string;

    /**
     * 联系人
     */
    contact?: models.IdNameModel;

    /**
     * 显示顺序
     */
    order?: number;

}
