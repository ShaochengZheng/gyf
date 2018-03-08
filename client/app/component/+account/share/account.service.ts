import { Injectable } from '@angular/core';
import * as moment from 'moment';
import * as _ from 'lodash';

import { AccountTransactionApi } from './../../../api/accounting/api/AccountTransactionApi';
import { BankAccountApi } from './../../../api/accounting/api/BankAccountApi';
import { BankStatementApi } from './../../../api/accounting/api/BankStatementApi';

@Injectable()
export class AccountService {
    constructor(private bankAccountApi: BankAccountApi, private accountTransApi: AccountTransactionApi,
                private bankStatementApi:BankStatementApi) {

    }

    getAccountAll(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.bankAccountApi.bankAccountGetAll().subscribe(
                data => {
                    resolve(data);
                }, error => {
                    reject(error);
                }
            )
        });
    }
    /**
     * 分页获取交易记录
     * 
     * @param bankaccountid 银行账户Id
     * @param accountTransactionType 交易类型：0、全部；1、收入；2、支出
     * @param keyword 关键字
     * @param money 金额
     * @param startDate 开始时间
     * @param endDate 结束时间
     * @param includeChildren 是否带子项Y/N
     * @param statementStatus 对账状态：0或者空字符串&#x3D;全部；1&#x3D;未对账；2&#x3D;已经对账
     * @param matchMoney 匹配金额
     * @param pageIndex 页数索引
     * @param pageSize 页数大小
     */
    getAccoutTrans(model): Promise<any> {
        return new Promise((resolve, reject) => {
            this.accountTransApi.accountTransactionSearch(model.bankaccountid, model.accountTransactionType,
                model.keyword, model.money, model.startDate, model.endDate, model.includeChildren,
                model.statementStatus, model.matchMoney, model.pageIndex, model.pageSize).subscribe(
                data => {
                    resolve(data);
                }, error => {
                    reject(error);
                });
        });
    }
    deleteAccountTransById(id): Promise<any> {
        return new Promise((resolve, reject) => {
            this.accountTransApi.accountTransactionDelete(id).subscribe(
                data => {
                    resolve(data);
                }, error => {
                    reject(error);
                }
            )
        });
    }
    /**
     * 分页获取银行对账单
     * 
     * @param bankAccountId 账号id，必传
     * @param startDate 开始时间
     * @param endDate 结束时间
     * @param keyWord 关键字
     * @param money 金额
     * @param accountTransactionType 交易类型：0、全部；1、收入；2、支出
     * @param statementStatus 对账状态：0或者空字符串&#x3D;全部；1&#x3D;未对账；2&#x3D;已经对账
     * @param sort 对账单排序&#x3D;空或者0：对账单的交易日期升序；1：对账单的交易日期降序
     * @param pageIndex 页数索引
     * @param pageSize 页数大小
     */
    getBankStatement(model): Promise<any> {
        return new Promise((resolve, reject ) => {
            this.bankStatementApi.bankStatementSearch(model.bankaccountid,model.startDate, model.endDate,
                model.keyword, model.money,  model.accountTransactionType, model.statementStatus,
                model.sort  , model.pageIndex, model.pageSize).subscribe(
                data => {

                }, error => {

                }
            );
        });
    }
}
