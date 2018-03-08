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
 * 对账单列匹配Model
 */
export interface StatementColumnMappingModel {
    /**
     * BankStatement表的设计列名
     */
    bankStatementColumn?: Array<models.BankStatementColumnConstModel>;

    /**
     * 列匹配
     */
    columnsMapping?: Array<models.ColumnsMappingModel>;

    datetimeStrings?: Array<models.IdNameModel>;

    /**
     * 对账单附件 Id
     */
    statementAttachmentId?: string;

    /**
     * 账户Id
     */
    bankAccountId?: string;

    /**
     * 附件存储路径
     */
    key?: string;

    /**
     * 附件Id
     */
    attachmentId?: string;

}
