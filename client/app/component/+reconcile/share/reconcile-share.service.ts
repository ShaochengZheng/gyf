import { Injectable } from '@angular/core';
import * as moment from 'moment';
import * as _ from 'lodash';

import { AccountTransactionApi } from './../../../api/accounting/api/AccountTransactionApi';
import { BankAccountApi } from './../../../api/accounting/api/BankAccountApi';
import { BankStatementApi } from './../../../api/accounting/api/BankStatementApi';
import { BusinessCategoryApi } from './../../../api/accounting/api/BusinessCategoryApi';
import { AccountTransLineItemApi } from './../../../api/accounting/api/AccountTransLineItemApi';
import { BankTransferApi } from './../../../api/accounting/api/BankTransferApi';

import { ReserveService } from '../../../service/core/reserve';

@Injectable()
export class ReconcileShareService {
    constructor(private bankAccountApi: BankAccountApi, private accountTransApi: AccountTransactionApi,
        private bankStatementApi: BankStatementApi, private businessCategoryApi: BusinessCategoryApi,
        private reserveService: ReserveService, private accountTransLineItemApi: AccountTransLineItemApi,
        private bankTransferApi:BankTransferApi) {

    }
    /**
     * 银行对账单同步交易记录
     * 
     * @param bankStatementSynchronizeModels 
     */
    bankTransferSynchronize(models):Promise<any> {
        return new Promise((resolve, reject) => {
            this.bankTransferApi.bankTransferSynchronize(models).subscribe(
                data => {
                    resolve(data);
                }, error => {
                    reject(error);
                }
            );
        });
    }
    /**
     * 增加银行互转
     * 
     * @param models 
     */
    bankStatementAddBankTransfers(models): Promise<any> {
        return new Promise((resolve, reject) => {
            this.bankStatementApi.bankStatementAddBankTransfers(models).subscribe(
                data => {
                    resolve(data);
                }, error => {
                    reject(error);
                }
            );
        });
    }
    /**
     * 银行对账单同步交易记录-》 生成收支列表
     * 
     * @param bankStatementSynchronizeModels 
     */
    bankStatementSynchronize(model): Promise<any> {
        return new Promise((resolve, reject) => {
            this.bankStatementApi.bankStatementSynchronize(model).subscribe(
                data => {
                    resolve(data);
                }, error => {
                    reject(error);
                }
            );
        });
    }
    /**
     *  删除对账单导入的账户互转
     * 
     * @param ids 
     */
    bankStatementDeleteTransfer(ids): Promise<any> {
        return new Promise((resolve, reject) => {
            this.bankStatementApi.bankStatementDeleteTransfer(ids).subscribe(
                data => {
                    resolve(data);
                }, error => {
                    reject(error);
                }
            );
        });
    }

    /**
     * 补全互转
     * 
     * @param model 
     */
    bankStatementPut(model): Promise<any> {
        return new Promise((resolve, reject) => {
            this.bankStatementApi.bankStatementPut(model).subscribe(
                data => {
                    resolve(data);
                }, error => {
                    reject(error);
                }
            );
        });
    }
    /**
     * 获取银行对账单银行互转列表
     * @param accountId 
     */
    bankStatementGetTransfers(accountId): Promise<any> {
        return new Promise((resolve, reject) => {
            this.bankStatementApi.bankStatementGetTransfers(accountId).subscribe(
                data => {
                    resolve(data);
                }, error => {
                    reject(error);
                }
            );
        });
    }
    /**
     * 获取收入或支持的总计
     * 返回的list数组中，第一个为收入总额，第二个为支出总额
     * @param bankaccountid 银行账户Id
     * @param accountTransactionType 交易类型：0、全部；1、收入；2、支出
     * @param keyword 关键字
     * @param startDate 开始时间
     * @param endDate 结束时间
     * @param tagIds 标签id,以逗号分隔
     * @param carryForwardStatus 结转状态：0、全部或者空；1、未结转；2、已结转
     */
    accountTransLineItemTransactionSum(model): Promise<any> {
        return new Promise((resolve, reject) => {
            this.accountTransLineItemApi.accountTransLineItemTransactionSum(model.bankaccountid,
                model.accountTransactionType, model.keyword, model.startDate, model.endDate, '', '').subscribe(
                data => {
                    resolve(data);
                }, error => {
                    reject(error);
                });
        });
    }

    /**
    *  分页获取交易记录
    * 
    * @param bankaccountid 银行账户Id
    * @param accountTransactionType 交易类型：0、全部；1、收入；2、支出
    * @param keyword 关键字
    * @param money 金额
    * @param startDate 开始日期
    * @param endDate 结束日期
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
    /**
    *  根据id 删除交易记录
    * 
    *  @param id 
    */
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
    // multi-sync 不涉及搜索， 将model放到这里
    searchModel = {
        startDate: '',
        endDate: '',
        keyword: '',
        money: '',
        accountTransactionType: '0',
        statementStatus: 'NoStatement',
        sort: '0',
        pageIndex: '1',
        pageSize: '100000'
    };
    /**
     * 分页获取银行对账单
     * 
     * @param bankAccountId 账号id，必传
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @param keyWord 关键字
     * @param money 金额
     * @param accountTransactionType 交易类型：0、全部；1、收入；2、支出
     * @param statementStatus 对账状态：0或者空字符串&#x3D;全部；1&#x3D;未对账；2&#x3D;已经对账
     * @param sort 对账单排序&#x3D;空或者0：对账单的交易日期升序；1：对账单的交易日期降序
     * @param pageIndex 页数索引
     * @param pageSize 页数大小
     */
    bankStatementSearch(id): Promise<any> {
        return new Promise((resolve, reject) => {
            this.bankStatementApi.bankStatementSearch(id, this.searchModel.startDate, this.searchModel.endDate,
                this.searchModel.keyword, this.searchModel.money, this.searchModel.accountTransactionType,
                this.searchModel.statementStatus, this.searchModel.sort,
                this.searchModel.pageIndex, this.searchModel.pageSize)
                .subscribe(
                data => {
                    let tempList = _.cloneDeep(data.list);
                    // console.log('《--bankStatementSearch---》',data);
                    if (tempList !== null) {
                        let syncRecordIds = '';
                        tempList.forEach(element => {
                            syncRecordIds = syncRecordIds + element.id + ',';
                        });
                        let count = String(syncRecordIds).length - 1;
                        syncRecordIds = String(syncRecordIds).substring(0, count);
                        // console.log('《--bankStatementSearch---》', syncRecordIds);
                        resolve(syncRecordIds);
                    }
                }, error => {
                    reject(error);
                });
        })
    }

    /**
     * 获取交易类别
     * @param type  'Income'  'Outcome'
     * @param transfer boolean false -> 没有银行互转， true -> 有银行互转
     */
    getBussinessCategory(type): Promise<any> {
        return this.getBussinessCategoryByBool(type, false);
    }
    getBussinessCategoryByBool(type, transfer): Promise<any> {
        return new Promise((resolve, reject) => {
            this.businessCategoryApi.businessCategoryGetAll(type, transfer)
                .subscribe(
                data => {
                    let list: any = data;
                    let dataList = [];
                    let dataPush = [];
                    let children = [];
                    let tempList = [];
                    console.log('<--getBussinessCategory--->', data, type);
                    _.forEach(list, item => {
                        if (item.level === 1) {
                            if (item.display === true) {
                                if (item.name === '账户转入' || item.name === '账户转出') {
                                    dataList.push({
                                        id: item.id, text: item.name,
                                        children: [{ id: item.id, text: item.name }]//{ id: 'businessCategory', text: '+新增类别' }
                                    });
                                } else {
                                    dataList.push({
                                        id: item.id, text: item.name,
                                        children: []//{ id: 'businessCategory', text: '+新增类别' }
                                    });
                                }
                            }
                            // if (item.businessCategoryType.value === 'Outcome' && item.display === true) {
                            //     if (item.name === '账户转出') {
                            //         console.log('账户互转');
                            //         dataList.push({
                            //             id: item.id, text: item.name,
                            //             children: [{id: item.id, text: item.name}]//{ id: 'businessCategory', text: '+新增类别' }
                            //         });
                            //     } else {
                            //         dataList.push({
                            //             id: item.id, text: item.name,
                            //             children: []//{ id: 'businessCategory', text: '+新增类别' }
                            //         });
                            //     }
                            // }

                        } else {
                            children.push(item);
                        }
                    });
                    _.forEach(children, item => {
                        let index;
                        index = _.findIndex(dataList, o => o.id === item.parentBusinessCategory.id);
                        if (index !== -1) {
                            dataList[index].children.push({ id: item.id, text: item.name });
                        }
                        // if (item.businessCategoryType.value === 'Income') {
                        //     index = _.findIndex(dataList, o => o.id === item.parentBusinessCategory.id);
                        //     if (index !== -1) {
                        //         dataList[index].children.push({ id: item.id, text: item.name });
                        //     }
                        // }
                        // if (item.businessCategoryType.value === 'Outcome') {
                        //     index = _.findIndex(dataList, o => o.id === item.parentBusinessCategoryModelId);
                        //     if (index !== -1) {
                        //         dataList[index].children.push({ id: item.id, text: item.name });
                        //     }
                        // }

                    });
                    // this.incomeBCList = ilist;
                    // this.outcomeBCList = olist;
                    resolve(dataList);
                },
                error => {
                    console.log('error', error);
                    reject(error);
                }
                );
        });

    }
    // 获取银行账户
    /**
     *  顶部导航银行对账余额和记录余额
     *  id 当前账户id
     */
    bankSearch(id) {
        console.log('<----获取银行账户---->bankSearch');
        this.bankAccountApi.bankAccountGetAll()
            .subscribe(
            data => {
                let index = _.findIndex(data, (item) => {
                    return item.id === id;
                });
                this.reserveService.currentAccount = data[index];
            },
            error => {
                console.log('error', error);
            }
            );
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


}