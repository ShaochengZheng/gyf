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
 * 个税模板
 */
export interface PersonalIncomeTaxModel {
    /**
     * 姓名
     */
    name?: string;

    /**
     * 证件类型
     */
    certificateType?: string;

    /**
     * 证照号码
     */
    iDCardNum?: string;

    /**
     * 所得期间起
     */
    startDate?: Date;

    /**
     * 所得期间止
     */
    endDate?: Date;

    /**
     * 收入额
     */
    incomeSum?: number;

    /**
     * 免税所得
     */
    dutyFree?: number;

    /**
     * 养老 个人
     */
    pRetirementInsurance?: number;

    /**
     * 医疗  个人
     */
    pMedicalInsurance?: number;

    /**
     * 失业 个人
     */
    pUnemploymentInsurance?: number;

    /**
     * 公积金 个人
     */
    pHousingFund?: number;

    /**
     * 允许扣除的税费
     */
    allowedDeductionsTaxes?: number;

    /**
     * 其他
     */
    others?: number;

    /**
     * 允许扣除项目合计
     */
    allowDeductedTotal?: number;

    /**
     * 减除费用
     */
    subtractCost?: number;

    /**
     * 实际捐赠额
     */
    practicalDonate?: number;

    /**
     * 允许列支的捐赠比例
     */
    proportionOfDonationsAllowed?: string;

    /**
     * 准予扣除的捐赠额
     */
    amountOfDonationsToDeducted?: number;

    /**
     * 扣除及减除项目合计
     */
    projectSumWithDeductionSubtract?: number;

    /**
     * 应纳税所得额 == 计税工资
     */
    taxPayable?: number;

    /**
     * 税率
     */
    taxRate?: number;

    /**
     * 速扣数
     */
    quickDeduction?: number;

    /**
     * 应纳税额 == 个人所得税
     */
    personalIncomeTax?: number;

    /**
     * 减免税额
     */
    taxRelief?: number;

    /**
     * 应扣缴税额
     */
    taxShouldBeDeducted?: number;

}
