import {AccountModel} from '../../../api/accounting/model/AccountModel';


/**
 * 科目列表单项
 */
export interface AccountModels extends AccountModel {
    /**
     * 本项金额
     */
    theAmountOfThisItem?: number;
    /**
     * 本项是否是0
     */
    whetherTo0: boolean;
}

/**
 *
 *
 * @export
 * @interface TotalModels
 */
export interface TotalModel {
    /**
     * 期初借方金额
     *
     * @type {number}
     * @memberof TotalModels
     */
    periodInitialDebit: number;
    /**
     * 期初贷方金额
     *
     * @type {number}
     * @memberof TotalModels
     */
    periodInitialCredit: number;

    /**
     *
     * 本期累积借
     * @type {number}
     * @memberof TotalModels
     */
    debit: number;

    /**
     * 本期累积贷
     *
     * @type {number}
     * @memberof TotalModels
     */
    credit: number;

    /**
     *
     * 期末借方金额
     * @type {number}
     * @memberof TotalModels
     */
    periodEndDebit: number;

    /**
     * 期末贷方金额
     *
     * @type {number}
     * @memberof TotalModels
     */
    periodEndCredit: number;

}
export class TotalModels {

    /**
     * 期初借方金额
     *
     * @type {number}
     * @memberof TotalModels
     */
    periodInitialDebit: number = 0;
    /**
     * 期初贷方金额
     *
     * @type {number}
     * @memberof TotalModels
     */
    periodInitialCredit: number = 0;

    /**
     *
     * 本期累积借
     * @type {number}
     * @memberof TotalModels
     */
    debit: number = 0;

    /**
     * 本期累积贷
     *
     * @type {number}
     * @memberof TotalModels
     */
    credit: number = 0;

    /**
     *
     * 期末借方金额
     * @type {number}
     * @memberof TotalModels
     */
    periodEndDebit: number = 0;

    /**
     * 期末贷方金额
     *
     * @type {number}
     * @memberof TotalModels
     */
    periodEndCredit: number = 0;

}

/**
 * 会计首页科目列表
 */
export class AccountBalanceSheets {
    /**
     * 资产项目
     */
    assetItem?: AccountModels[] = [];
    /**
     * 资产总额
     */
    theTotalAssetsOf?: TotalModel = new TotalModels;
    // theTotalAssetsOf?: number = 0;
    /**
     * 资产项目是否为0
     */
    isAssetItemZero?: boolean = true;
    /**
     * 负债项目
     */
    liabilities?: AccountModels[] = [];
    /**
     * 负债总额
     */
    theTotalAmountOfLiabilities?: TotalModel = new TotalModels;
    /**
     * 负债项目是否为0
     */
    isLiabilitiesZero: boolean = true;
    /**
     * 权益项目
     */
    ownersEquity?: AccountModels[] = [];
    /**
     * 权益总额
     */
    totalEquity?: TotalModel = new TotalModels;
    /**
     * 权益项目是否为0
     */
    isOwnersEquityZero: boolean = true;
    /**
     * 收入项目
     */
    incomeProject?: AccountModels[] = [];
    /**
     * 收入合计
     */
    withCombined?: TotalModel = new TotalModels;
    /**
     * 收入是否为0
     */
    isIncomeProjectZero: boolean = true;
    /**
     * 成本项目
     */
    cost?: AccountModels[] = [];
    /**
     * 成本合计
     */
    theCostOfACombined?: TotalModel = new TotalModels;
    /**
     * 成本是否为0
     */
    isCostZero: boolean = true;
    /**
     * 费用项目
     */
    costOfTheProject?: AccountModels[] = [];
    /**
     * 三项费用合计：
     */
    totalCost?: TotalModel = new TotalModels;
    /**
     * 费用是否为0
     */
    isCostOfTheProjectZero: boolean = true;
    /**
     * Total profit and loss
     * 损益合计
     */
    totalProfitAndLoss?: TotalModel = new TotalModels;
    /**
     * Profit and loss items
     * 损益项目
     * @type {AccountModels[]}
     * @memberof AccountBalanceSheets
     */
    profitAndLossItems?: AccountModels[] = [];
    /**
     * 损益显示
     *
     * @type {AccountModels[]}
     * @memberof AccountBalanceSheets
     */
    profitAndLossDisplay?: AccountModels[] = [];


    /**
     * 利润成本项目
     */
    profitCostItem?: AccountModels[] = [];
    /**
     * 利润成本
     */
    theCostOfProfits?: number = 0;
    /**
     * 利润支出项目
     */
    profitsSpending?: AccountModels[] = [];
    /**
     * 利润支出
     */
    spendingOnProfits?: number = 0;
    /**
     * 利润项目
     *
     * @type {number}
     * @memberof AccountBalanceSheets
     */
    profitsItem?: AccountModels[] = [];
    /**
     * 利润
     */
    profits?: number = 0;
    /**
     * 利润是否为0
     */
    isProfitsZero: boolean = true;
    /**
     * 全部为0
     */
    isAllZero: boolean = true;
    /**
     * 总计
     */
    priceTotal?: TotalModel = new TotalModels;


}
