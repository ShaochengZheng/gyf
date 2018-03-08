import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

import { AccountApi } from '../../../api/accounting/api/AccountApi';
import { AccountBalanceSheets, AccountModels } from './home-page.model';
import { AccountModel } from '../../../api/accounting/model/AccountModel';
import { AccountTypeEnumModel } from '../../../api/accounting/model/AccountTypeEnumModel';
import { IndexApi } from '../../../api/accounting/api/IndexApi';
import { AccountBookApi } from '../../../api/accounting/api/AccountBookApi';

import { BankAccountApi } from '../../../api/accounting/api/BankAccountApi';
import * as _ from 'lodash';

@Injectable()
export class HomePageService {
    accountBalanceSheets: AccountBalanceSheets;

    constructor(private indexApi: IndexApi, private accountApi: AccountApi, private accountBalanceSheet: AccountBalanceSheets,
        private bankAccountApi: BankAccountApi,
        private accountBookApi: AccountBookApi) {
        this.accountBalanceSheets = _.cloneDeep(this.accountBalanceSheet);
    }


    /**
     * 查询会计首页科目余额表
     *
     * @param {any} year
     * @param {any} month
     * @param {any} [periodType]
     * @returns {Promise<AccountModel[]>}
     *
     * @memberof HomePageService
     */
    accountGet(year, month, periodType?): Promise<any> {
        return new Promise((resolve, reject) => {
            this.accountApi.accountGet(year, month, periodType).toPromise().then(
                accountModel => {
                    // tslint:disable-next-line:no-console
                    console.time('首页科目余额表运算时间');
                    // 防止后台给null
                    if (accountModel === null) {
                        reject(new Error('未能获取'));
                        return;
                    }
                    this.accountBalanceSheets = _.cloneDeep(this.accountBalanceSheet);
                    const temp: any = accountModel;
                    const accountModels: AccountModels[] = temp;
                    for (let i = 0, x = accountModels.length; i < x; i++) {
                        if (accountModels[i].level === '1') {
                            // 是否都是0
                            if (accountModels[i].credit + accountModels[i].debit === 0 &&
                                accountModels[i].periodEndCredit === 0 && accountModels[i].periodEndDebit ===
                                0 && accountModels[i].periodInitialCredit === 0 &&
                                accountModels[i].periodInitialDebit === 0) {
                                accountModels[i].whetherTo0 = true;

                            } else {
                                // 总的是否都是0
                                this.accountBalanceSheets.isAllZero = false;
                            }
                            // 总计
                            this.total(this.accountBalanceSheets.priceTotal, accountModels[i]);
                            // 本项合计金额
                            accountModels[i].theAmountOfThisItem = accountModels[i].periodEndCredit +
                                accountModels[i].periodEndDebit + accountModels[i].periodInitialCredit +
                                accountModels[i].periodInitialDebit + accountModels[i].credit + accountModels[i].debit;
                            if (accountModels[i].accountType.value === AccountTypeEnumModel.ValueEnum.None) {
                                // 无类型
                                console.error('无类型');
                            } else if (accountModels[i].accountType.value === AccountTypeEnumModel.ValueEnum.Assets) {
                                // 第一大类
                                // 添加资产 资产总额＝1类总额
                                this.accountBalanceSheets.assetItem.push(accountModels[i]);
                            } else if (accountModels[i].accountType.value === AccountTypeEnumModel.ValueEnum.Liability) {
                                // 第二大类
                                // 添加负债 负债总额＝2类相加
                                this.accountBalanceSheets.liabilities.push(accountModels[i]);
                            } else if (accountModels[i].accountType.value === AccountTypeEnumModel.ValueEnum.OwnersEquity) {
                                // 第三大类
                                // 添加权益
                                this.accountBalanceSheets.ownersEquity.push(accountModels[i]);
                            } else if (accountModels[i].accountType.value === AccountTypeEnumModel.ValueEnum.Cost) {
                                // 第四大类
                                // 添加成本=4类总额
                                this.accountBalanceSheets.cost.push(accountModels[i]);
                            } else if (accountModels[i].accountType.value === AccountTypeEnumModel.ValueEnum.ProfitAndLoss) {
                                // 第五大类
                                // 添加权益
                                // this.accountBalanceSheets.ownersEquity.push(accountModel[i]);
                            } else {
                                console.error('给个类型呗');
                            }
                        }

                    }
                    const accountModelsLength = accountModels.length;
                    // 收入项目 收入合计＝5001+5051
                    for (let i = 0; i < accountModelsLength; i++) {
                        if (accountModels[i].level === '1') {
                            if (accountModels[i].code === '5001' || accountModels[i].code === '5051') {
                                // 收入项目 收入合计＝5001+5051
                                console.log(accountModels[i].code);
                                this.accountBalanceSheets.incomeProject.push(accountModels[i]);
                            }
                        }
                    }

                    // 利润成本项目＝5001+5051＋5111＋5301
                    for (let i = 0; i < accountModelsLength; i++) {
                        if (accountModels[i].level === '1') {
                            if (accountModels[i].code === '5001' || accountModels[i].code === '5051' ||
                                accountModels[i].code === '5111' || accountModels[i].code === '5301') {
                                // 利润成本项目＝5001+5051＋5111＋5301
                                this.accountBalanceSheets.profitCostItem.push(accountModels[i]);
                            }
                        }
                    }
                    // 费用合计＝5601+5602+5603+5403
                    for (let i = 0; i < accountModelsLength; i++) {
                        if (accountModels[i].level === '1') {
                            if (accountModels[i].code === '5601' || accountModels[i].code === '5602' || accountModels[i].code === '5403' ||
                                accountModels[i].code === '5603') {
                                // 费用合计＝5601+5602+5603
                                this.accountBalanceSheets.costOfTheProject.push(accountModels[i]);
                            }
                        }
                    }
                    // 利润支出项目＝5401+5402＋5403+5601+5602＋5603+5711+5801
                    for (let i = 0; i < accountModelsLength; i++) {
                        if (accountModels[i].level === '1') {
                            if (accountModels[i].code === '5401' || accountModels[i].code === '5402' ||
                                accountModels[i].code === '5403' || accountModels[i].code === '5601' || accountModels[i].code === '5602' ||
                                accountModels[i].code === '5603' || accountModels[i].code === '5711' || accountModels[i].code === '5801') {
                                // 利润支出项目＝5401+5402＋5403+5601+5602＋5603+5711+5801
                                this.accountBalanceSheets.profitsSpending.push(accountModels[i]);

                            }
                        }
                    }
                    // profitAndLossItems 损益合计项目=5001+5051+5111+5301+5401+5402+5403+5601+5602+5603+5711+5801
                    // profitAndLossDisplay 损益显示项目 =5711+5801
                    for (let i = 0; i < accountModelsLength; i++) {
                        if (accountModels[i].level === '1') {
                            // tslint:disable-next-line:max-line-length
                            if (accountModels[i].code === '5001' || accountModels[i].code === '5051' || accountModels[i].code === '5111' || accountModels[i].code === '5301' || accountModels[i].code === '5401' || accountModels[i].code === '5402' || accountModels[i].code === '5403' || accountModels[i].code === '5601' || accountModels[i].code === '5602' || accountModels[i].code === '5603' || accountModels[i].code === '5711' || accountModels[i].code === '5801') {
                                this.accountBalanceSheets.profitAndLossItems.push(accountModels[i]);
                            }
                            if (accountModels[i].code === '5711' || accountModels[i].code === '5801') {
                                this.accountBalanceSheets.profitAndLossDisplay.push(accountModels[i]);
                            }
                            // this.mergeItem(accountModels[i], ['5001', '5051', '5111', '5301',
                            // '5401', '5402', '5403', '5601', '5602', '5603', '5700', '5801'],
                            // this.accountBalanceSheets.profitAndLossItems);
                        }
                    }


                    // 资产总额
                    for (let i = 0; i < this.accountBalanceSheets.assetItem.length; i++) {
                        // 期末借贷相加
                        this.total(this.accountBalanceSheets.theTotalAssetsOf, this.accountBalanceSheets.assetItem[i]);
                        // 是否都是0
                        if (this.accountBalanceSheets.assetItem[i].credit + this.accountBalanceSheets.assetItem[i].debit === 0 &&
                            this.accountBalanceSheets.assetItem[i].periodEndCredit === 0 &&
                            this.accountBalanceSheets.assetItem[i].periodEndDebit === 0
                            && this.accountBalanceSheets.assetItem[i].periodInitialCredit === 0 &&
                            this.accountBalanceSheets.assetItem[i].periodInitialDebit === 0) {
                        } else {
                            this.accountBalanceSheets.isAssetItemZero = false;
                        }
                    }

                    // 负债总额
                    for (let i = 0; i < this.accountBalanceSheets.liabilities.length; i++) {
                        this.total(this.accountBalanceSheets.theTotalAmountOfLiabilities, this.accountBalanceSheets.liabilities[i]);
                        // 是否都是0
                        if (this.accountBalanceSheets.liabilities[i].credit + this.accountBalanceSheets.liabilities[i].debit === 0 &&
                            this.accountBalanceSheets.liabilities[i].periodEndCredit === 0 &&
                            this.accountBalanceSheets.liabilities[i].periodEndDebit === 0 &&
                            this.accountBalanceSheets.liabilities[i].periodInitialCredit === 0
                            && this.accountBalanceSheets.liabilities[i].periodInitialDebit === 0) {
                        } else {
                            this.accountBalanceSheets.isLiabilitiesZero = false;
                        }
                    }
                    // 权益总额
                    for (let i = 0; i < this.accountBalanceSheets.ownersEquity.length; i++) {
                        this.total(this.accountBalanceSheets.totalEquity, this.accountBalanceSheets.ownersEquity[i]);
                        // 是否都是0
                        if (this.accountBalanceSheets.ownersEquity[i].credit + this.accountBalanceSheets.ownersEquity[i].debit === 0 &&
                            this.accountBalanceSheets.ownersEquity[i].periodEndCredit === 0 &&
                            this.accountBalanceSheets.ownersEquity[i].periodEndDebit === 0 &&
                            this.accountBalanceSheets.ownersEquity[i].periodInitialCredit === 0 &&
                            this.accountBalanceSheets.ownersEquity[i].periodInitialDebit === 0) {
                        } else {
                            this.accountBalanceSheets.isOwnersEquityZero = false;
                        }
                    }
                    // 收入总额
                    for (let i = 0; i < this.accountBalanceSheets.incomeProject.length; i++) {
                        // 收入合计＝5001+5051
                        this.total(this.accountBalanceSheets.withCombined, this.accountBalanceSheets.incomeProject[i]);

                        // 是否都是0
                        if (this.accountBalanceSheets.incomeProject[i].credit + this.accountBalanceSheets.incomeProject[i].debit === 0 &&
                            this.accountBalanceSheets.incomeProject[i].periodEndCredit === 0 &&
                            this.accountBalanceSheets.incomeProject[i].periodEndDebit === 0 &&
                            this.accountBalanceSheets.incomeProject[i].periodInitialCredit === 0 &&
                            this.accountBalanceSheets.incomeProject[i].periodInitialDebit === 0) {
                        } else {
                            this.accountBalanceSheets.isIncomeProjectZero = false;
                        }
                    }
                    // 成本总额
                    for (let i = 0; i < this.accountBalanceSheets.cost.length; i++) {
                        // 成本合计＝5401+5402
                        this.total(this.accountBalanceSheets.theCostOfACombined, this.accountBalanceSheets.cost[i]);
                        // 是否都是0
                        if (this.accountBalanceSheets.cost[i].credit + this.accountBalanceSheets.cost[i].debit === 0 &&
                            this.accountBalanceSheets.cost[i].periodEndCredit === 0 &&
                            this.accountBalanceSheets.cost[i].periodEndDebit === 0 &&
                            this.accountBalanceSheets.cost[i].periodInitialCredit === 0 &&
                            this.accountBalanceSheets.cost[i].periodInitialDebit === 0) {
                        } else {
                            this.accountBalanceSheets.isCostZero = false;
                        }
                    }
                    // 费用合计
                    for (let i = 0; i < this.accountBalanceSheets.costOfTheProject.length; i++) {
                        if (this.accountBalanceSheets.costOfTheProject[i].code === '5403') {
                        } else {
                            this.total(this.accountBalanceSheets.totalCost, this.accountBalanceSheets.costOfTheProject[i]);
                            // 费用合计＝5601+5602+5603    不包括5403
                            // 是否都是0
                            if (this.accountBalanceSheets.costOfTheProject[i].credit === 0 &&
                                this.accountBalanceSheets.costOfTheProject[i].debit === 0 &&
                                this.accountBalanceSheets.costOfTheProject[i].periodEndCredit === 0 &&
                                this.accountBalanceSheets.costOfTheProject[i].periodEndDebit === 0 &&
                                this.accountBalanceSheets.costOfTheProject[i].periodInitialCredit === 0 &&
                                this.accountBalanceSheets.costOfTheProject[i].periodInitialDebit === 0) {
                            } else {
                                this.accountBalanceSheets.isCostOfTheProjectZero = false;
                            }
                        }

                    }
                    //  损益合计=收入+成本+费用合计
                    for (let i = 0; i < this.accountBalanceSheets.profitAndLossItems.length; i++) {
                        this.total(this.accountBalanceSheets.totalProfitAndLoss, this.accountBalanceSheets.profitAndLossItems[i]);
                        // 是否都是0
                        if (this.accountBalanceSheets.profitAndLossItems[i].credit === 0 &&
                            this.accountBalanceSheets.profitAndLossItems[i].debit === 0 &&
                            this.accountBalanceSheets.profitAndLossItems[i].periodEndCredit === 0 &&
                            this.accountBalanceSheets.profitAndLossItems[i].periodEndDebit === 0 &&
                            this.accountBalanceSheets.profitAndLossItems[i].periodInitialCredit === 0 &&
                            this.accountBalanceSheets.profitAndLossItems[i].periodInitialDebit === 0) {
                        } else {
                            this.accountBalanceSheets.isCostOfTheProjectZero = false;
                        }
                    }


                    // 利润成本
                    for (let i = 0; i < this.accountBalanceSheets.profitCostItem.length; i++) {
                        // 利润成本项目＝5001+5051＋5111＋5301 theCostOfProfits
                        this.accountBalanceSheets.theCostOfProfits +=
                            (this.accountBalanceSheets.profitCostItem[i].periodEndCredit +
                                this.accountBalanceSheets.profitCostItem[i].periodEndDebit);

                    }
                    // 利润支出
                    for (let i = 0; i < this.accountBalanceSheets.profitsSpending.length; i++) {
                        // 利润支出项目＝5401+5402＋5403+5601+5602＋5603+5711+5801
                        this.accountBalanceSheets.spendingOnProfits +=
                            (this.accountBalanceSheets.profitsSpending[i].periodEndCredit +
                                this.accountBalanceSheets.profitsSpending[i].periodEndDebit);

                    }
                    // 利润
                    this.accountBalanceSheets.profits =
                    this.accountBalanceSheets.theCostOfProfits - this.accountBalanceSheets.spendingOnProfits;
                    if (this.accountBalanceSheets.profits === 0) {
                        this.accountBalanceSheets.isProfitsZero = true;
                    } else {
                        this.accountBalanceSheets.isProfitsZero = false;
                    }
                    // tslint:disable-next-line:no-console
                    console.timeEnd('首页科目余额表运算时间');

                    resolve(this.accountBalanceSheets);
                },
                error => {
                    console.error(error);
                    reject(error);
                }
            );
        });
    }
    /**
     * 计算合计
     */
    total(x, y) {
        x.periodInitialDebit += y.periodInitialDebit;
        x.periodInitialCredit += y.periodInitialCredit;
        x.debit += y.debit;
        x.credit += y.credit;
        x.periodEndDebit += y.periodEndDebit;
        x.periodEndCredit += y.periodEndCredit;
    }
    /**
     * 合并项目  性能不好  再想想
     * @param arr
     * @param code
     * @param x
     */
    // mergeItem(arr, code, x) {
    //     if (_.indexOf(code, arr.code) > 0) {
    //         x.push(arr);
    //     }
    // }
    /**
     * 都是0？ 性能不好  再想想
     */
    // bothForZero(x, y): boolean {
    //     if (x.credit === 0 &&
    //         x.debit === 0 &&
    //         x.periodEndCredit === 0 &&
    //         x.periodEndDebit === 0 &&
    //         x.periodInitialCredit === 0 &&
    //         x.periodInitialDebit === 0) {
    //         if (y) {
    //             return true;
    //         } else {
    //             return false;
    //         }
    //     } else {
    //         return false;
    //     }
    // }
    /**
     * 获取首页数据
     *
     * @returns {Promise<any[]>}
     *
     * @memberof HomePageService
     */
    getHomePageData(): Promise<any[]> {
        return new Promise((resolve, reject) => {
            this.indexApi.indexGet().subscribe(
                amountModel => {
                    resolve(amountModel);
                }, error => {
                    reject(error);
                }
            );
        });
    }

    /**
     * 获取工人状态
     *
     */
    getAssistStatus(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.accountBookApi.accountBookGetWorkerFlow().subscribe(
                data => {
                    resolve(data);
                }, error => {
                    reject(error);
                }
            );
        });
    }

    /**
     * 设置工人状态
     *
     * @param status
     */
    setAssistStatus(status): Promise<any> {
        return new Promise((resolve, reject) => {
            this.accountBookApi.accountBookSetWorkerStatus(status).subscribe(
                data => {
                    resolve(data);
                }, error => {
                    reject(error);
                }
            );
        });
    }

    // 获取账期
    getAccountPeriod() {
        return new Promise((resolve, reject) => {
            this.accountApi.accountAccountPeriod().toPromise().then(
                accountPeriodModel => {
                    console.log('accountPeriodModel:' + JSON.stringify(accountPeriodModel));
                    resolve(accountPeriodModel);
                },
                error => {
                    reject(error);
                    console.error(error);
                }
            );
        });
    }
    /**
     * 获取所有账户的钱
     *
     */
    bankAccountGetAll(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.bankAccountApi.bankAccountGetAll().subscribe(
                bankAccountModel => {
                    const bankAccountdate: Array<any> = bankAccountModel.map((bankAccount) => {
                        const temp = {
                            currentBalance: bankAccount.currentBalance,
                            currentBankStatementBalance: bankAccount.currentBankStatementBalance,
                            accountName: bankAccount.accountName
                        };
                        return temp;
                    });
                    resolve(bankAccountdate);
                },
                error => {
                    console.error(error);
                    reject(error);
                }
            );
        });
    }
}
