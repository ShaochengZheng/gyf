import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';

import {AccountApi} from '../../api/accounting/api/AccountApi';
import {AccountPeriodModels, Select} from './extended-interface';

import {BankAccountApi} from '../../api/accounting/api/BankAccountApi';


@Injectable()
export class ShareService {
    // 科目余额表帐期
    accountPeriodModel: AccountPeriodModels;
    // 年
    year: any = new Date().getFullYear();
    // 月
    month: any = new Date().getMonth();
    // 默认月
    defaultMonth = [{id: this.month, text: this.month}];
    // 默认年
    defaultYear = [{id: this.year, text: this.year}];

    constructor(private accountApi: AccountApi, private bankAccountApi: BankAccountApi) {
    }

    /**
     * 获取科目余额表帐期
     *
     * @param {any} [IsCompanyPeriod]
     * @returns {Promise<AccountPeriodModels>}
     *
     * @memberof ShareService
     */
    accountAccountPeriod(isCompanyPeriod?): Promise<AccountPeriodModels> {
        return new Promise((resolve, reject) => {
            this.accountApi.accountAccountPeriod(isCompanyPeriod).subscribe(
                accountPeriodModel => {
                    if (accountPeriodModel === null) {
                        resolve(null);
                        return;
                    }
                    this.year = accountPeriodModel.currentYear;
                    this.month = accountPeriodModel.currentMonth;
                    this.accountPeriodModel = accountPeriodModel;
                    // 初始化加上不然XXXXList没值
                    this.accountPeriodModel.YearList = [{}];
                    this.accountPeriodModel.MonthsToList = [{}];
                    this.getYearList();
                    this.getMonthsToList();
                    resolve(accountPeriodModel);
                },
                error => {
                    reject(error);
                    console.error(error);
                }
            );
        });
    }

    //
    /**
     * 获取年列表
     *
     * @returns
     *
     * @memberof ShareService
     */
    getYearList() {
        // 删了之前加的空值
        if (this.accountPeriodModel.YearList[0].text === undefined || this.accountPeriodModel.YearList[0].text === null) {
            this.accountPeriodModel.YearList.splice(0, 1);
        }
        for (let i = 0; i < this.accountPeriodModel.accountHistoryPeriods.length; i++) {
            let temp: Select = {
                id: i.toString(),
                text: this.accountPeriodModel.accountHistoryPeriods[i].year.toString()
            };
            this.accountPeriodModel.YearList.push(temp);
        }
        console.log(this.accountPeriodModel.YearList);
        return this.accountPeriodModel;
    }

    //
    /**
     *
     * 获取月列表
     * @param {any} [year]
     * @returns
     *
     * @memberof ShareService
     */
    getMonthsToList(year?): Promise<AccountPeriodModels> {
        console.log(year);
        if (year) {

        } else {
            year = new Date().getFullYear();
        }
        return new Promise((resolve, reject) => {
            // 删了之前加的空值
			if (this.accountPeriodModel && this.accountPeriodModel.MonthsToList
				 && this.accountPeriodModel.MonthsToList[0].text === undefined || this.accountPeriodModel.MonthsToList[0].text === null) {
                this.accountPeriodModel.MonthsToList.splice(0, 1);
            }
            this.accountPeriodModel.MonthsToList = [];
            for (let i = 0; i < this.accountPeriodModel.accountHistoryPeriods.length; i++) {
                if (this.accountPeriodModel.accountHistoryPeriods[i].year === Number(year)) {
                    for (let x = 0; x < this.accountPeriodModel.accountHistoryPeriods[i].months.length; x++) {
                        let temp: Select = {
                            id: x.toString(),
                            text: this.accountPeriodModel.accountHistoryPeriods[i].months[x].toString()
                        };
                        this.accountPeriodModel.MonthsToList.push(temp);
                    }
                }
            }
            resolve(this.accountPeriodModel);
        });


    }


    getBankList(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.bankAccountApi.bankAccountGetAll()
                .subscribe(
                    data => {
                        if (data.length > 0) {
                            console.log('accountList', data);
                            let temp = [];
                            let dataTemp: any = data;
                            for (let i = 0; i < dataTemp.length; i++) {
                                temp[i] = ({id: dataTemp[i].id, text: dataTemp[i].accountName});
                            }
                            resolve(temp);
                        }
                    }, error => {
                        reject(error);
                        console.error(error);
                    });
        });
    }

    // 获取银行账户
    getNoCashBank(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.bankAccountApi.bankAccountGetAll()
                .subscribe(
                    data => {
                        if (data.length > 0) {
                            console.log('accountList', data);
                            let temp = [];
                            let dataTemp: any = data;

                            let noCashList = dataTemp.filter((item) => {
                                return item.bankAccountType.value === 'Bank';
                            });
                            console.log('noCashList', noCashList);
                            for (let i = 0; i < noCashList.length; i++) {
                                temp[i] = ({id: noCashList[i].id, text: noCashList[i].accountName});
                            }
                            resolve(temp);
                        }
                    }, error => {
                        reject(error);
                        console.error(error);
                    });
        });
    }


}
