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

export interface InvoiceModel {
    id?: string;

    /**
     * 编号
     */
    number?: string;

    /**
     * 公司Id
     */
    companyId?: string;

    /**
     * 账套id
     */
    accountBookId?: string;

    /**
     * 发票类型
     */
    invoiceType?: models.InvoiceTypeEnumModel;

    /**
     * 发票状态
     */
    invoiceStatus?: models.InvoiceStatusEnumModel;

    /**
     * 交易总金额
     */
    totalAmount?: number;

    /**
     * 记开票;记收票
     */
    recordType?: models.RecordTypeEnumModel;

    /**
     * 往来
     */
    contact?: models.IdNameModel;

    /**
     * 记账日期
     */
    recordDate?: Date;

    /**
     * 是否删除
     */
    isDeleted?: string;

    invoiceItemModels?: Array<models.InvoiceItemModel>;

    /**
     * 标签
     */
    tags?: Array<models.TagModel>;

    /**
     * 流水帐附件
     */
    attachmentModels?: Array<models.AccountAttachmentModel>;

    /**
     * 导入excel中对应的行数
     */
    importRow?: number;

    /**
     * ImportTaskId
     */
    importTaskId?: string;

    /**
     * 固定资产Id
     */
    sourceId?: string;

    /**
     * 是否锁定
     */
    lock?: boolean;

    /**
     * 发票代码
     */
    invoiceCode?: string;

    /**
     * 发票号码
     */
    invoiceNumber?: string;

    /**
     * 认证或者待抵扣转出的时间
     */
    deductTime?: string;

    /**
     * 待抵扣转出的时间
     */
    deductedTime?: Date;

    /**
     * 总税额
     */
    tax?: number;

    /**
     * 抵扣状态
     */
    deductstatus?: string;

}