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
 * 联系人
 */
export interface ContactModel {
    /**
     * 联系人id
     */
    id?: string;

    /**
     * 联系人类型
     */
    entityTypeCode?: string;

    /**
     * 联系人性质
     */
    contactType?: models.ContactTypeEnumModel;

    /**
     * 用户id-系统用户
     */
    userid?: string;

    /**
     * 名称
     */
    name?: string;

    /**
     * 账户编号
     */
    accountNumber?: string;

    /**
     * 账号名称
     */
    accountName?: string;

    /**
     * 联系人名称
     */
    contactName?: string;

    /**
     * 电话号码
     */
    phoneNumber?: string;

    /**
     * 职位
     */
    position?: string;

    /**
     * 电子邮件
     */
    email?: string;

    /**
     * 期初日期
     */
    beginDate?: Date;

    /**
     * 是否是默认
     */
    isDefault?: boolean;

    /**
     * 辅助核算余额
     */
    auxiliaryBusinessAccountingBalance?: models.AuxiliaryBusinessAccountingBalanceModel;

    /**
     * 操作动作
     */
    actions?: models.ActionsEnumModel;

    /**
     * 导入excel中对应的行数
     */
    importRow?: number;

    /**
     * ImportTaskId
     */
    importTaskId?: string;

    /**
     * 是否是导入
     */
    isImport?: string;

}
