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
 * 银行账户
 */
export interface BankAccountModel {
    /**
     * id
     */
    id?: string;

    /**
     * 银行账户类型
     */
    bankAccountType?: models.BankAccountTypeEnumModel;

    /**
     * 开户银行名称
     */
    bankName?: string;

    /**
     * 支行名称
     */
    subbranch?: string;

    /**
     * 账户编号
     */
    accountNumber?: string;

    /**
     * 账号名称
     */
    accountName?: string;

    /**
     * 账号编码
     */
    accountCode?: string;

    /**
     * 货币
     */
    currency?: models.CurrencyEnumModel;

    /**
     * 开始记账日期
     */
    beginDate?: Date;

    /**
     * 开始记账前余额
     */
    beginBalance?: number;

    /**
     * 对账单开始记账前余额
     */
    bankStatementBalance?: number;

    /**
     * 当前余额
     */
    currentBalance?: number;

    /**
     * 当前已经对账余额
     */
    currentBankStatementBalance?: number;

    /**
     * 描述
     */
    description?: string;

    /**
     * 是否是默认的
     */
    isDefault?: string;

    /**
     * 科目（关联科目-初始化分配）
     */
    account?: models.IdNameModel;

    /**
     * 操作动作
     */
    actions?: models.ActionsEnumModel;

    /**
     * 未同步银行对账单数目
     */
    noStatementAccunt?: number;

    /**
     * 未同步银行互转数目
     */
    noTransStatemenAccount?: number;

}
