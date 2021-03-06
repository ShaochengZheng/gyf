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
 * 固定资产
 */
export interface FixedAssetModel {
    /**
     * id
     */
    id?: string;

    /**
     * 凭证编号
     */
    code?: string;

    /**
     * 固定资产类别
     */
    assetType?: models.AssetTypeEnumModel;

    /**
     * 编码
     */
    number?: string;

    /**
     * 折旧方式
     */
    depreciationMethod?: models.DepreciationMethodEnumModel;

    /**
     * 名称
     */
    name?: string;

    /**
     * 折旧类别
     */
    depreciationCategory?: models.IdNameModel;

    /**
     * 往来
     */
    contact?: models.IdNameModel;

    /**
     * 部门性质
     */
    departmentType?: models.DepartmentTypeEnumModel;

    /**
     * 原值
     */
    originalPrice?: number;

    /**
     * 寿命
     */
    lifespan?: number;

    /**
     * 数量
     */
    qty?: number;

    /**
     * 残值率
     */
    residualRate?: number;

    /**
     * 开始折旧日期
     */
    startDepreciationDate?: Date;

    /**
     * 购买日期
     */
    purchasingDate?: Date;

    /**
     * 科目（关联科目-初始化分配）
     */
    account?: models.IdNameModel;

    /**
     * 描述
     */
    description?: string;

    /**
     * 标签
     */
    tags?: Array<models.TagModel>;

    /**
     * 流水帐附件
     */
    accountAttachmentModels?: Array<models.AccountAttachmentModel>;

    /**
     * 操作动作
     */
    actions?: models.ActionsEnumModel;

    /**
     * 状态
     */
    status?: models.FixedAssetDepreciationCategoryStatusEnumModel;

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

    /**
     * 是否锁定
     */
    lock?: boolean;

    /**
     * 数据来源类型
     */
    sourceType?: models.SourceTypeEnumModel;

    /**
     * 发票号
     */
    invoiceNumber?: string;

    /**
     * 税率
     */
    taxRate?: number;

    /**
     * 税额
     */
    tax?: number;

    /**
     * 不含税金额
     */
    exclusiveOfTax?: number;

    /**
     * 进项税类别
     */
    inputTaxType?: models.IdNameModel;

    /**
     * 发票类型
     */
    invoiceType?: models.InvoiceTypeEnumModel;

}
