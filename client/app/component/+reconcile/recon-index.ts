import { Component, OnInit, ElementRef, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Location } from '@angular/common';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';

import * as _ from 'lodash';

import { BankAccountApi } from '../../api/accounting/api/BankAccountApi';
import { AccountTransactionApi } from '../../api/accounting/api/AccountTransactionApi';
import { BankAccountModel } from '../../api/accounting/model/BankAccountModel';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReserveService } from '../../service/core';
import { AuthorizationService } from '../../service/core';
import { PubSubService, EventType } from '../../service/pubsub.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'setting',
    templateUrl: './recon-index.html',
    styleUrls: ['./recon-index.scss'],
    providers: [AccountTransactionApi]
})
export class ReconcileIndexComponent implements OnInit {

    subscription: Subscription;
    account: any = { id: '', accountName: '', type: '' };
    dataList: BankAccountModel[] = [];
    bankList: Array<Object> = [];
    cashList: Array<Object> = [];

    wechatList: Array<Object> = [];

    alipayList: Array<Object> = [];

    showBank: boolean;
    guanplusBalance: number = 0;
    initAccount: BankAccountModel = {
        bankAccountType: null,
        bankName: null,
        subbranch: '',
        accountNumber: '',
        accountName: '',
        accountCode: '',
        beginDate: null,
        beginBalance: null,
        currentBalance: null,
        description: '',
        currentBankStatementBalance: null
    };
    transactionSearchModel = {
        bankaccountid: '',
        accountTransactionType: null,
        money: '',
        keyword: '',
        startDate: '',
        endDate: '',
        includeChildren: '',
        statementStatus: null,
        matchMoney: null,
        pageIndex: '1',
        pageSize: '100000'
    };
    currentAccount: BankAccountModel = _.cloneDeep(this.initAccount);
    status: any;

    constructor(private el: ElementRef, private ref: ChangeDetectorRef, private location: Location, private router: Router, private pubSubService: PubSubService,
        private route: ActivatedRoute, private bankAccountApi: BankAccountApi, private authorizationService: AuthorizationService,
        private accountTransactionApi: AccountTransactionApi, private reserveService: ReserveService) {

        router.events.subscribe((val) => {
            if (val instanceof NavigationEnd) {
                let url = this.location.path();
                if (url.indexOf('records') !== -1 || url.indexOf('history') !== -1) {
                    this.status = '查看银行对账单';
                } else if (url.indexOf('import') !== -1) {
                    this.status = '导入银行对账单';
                } else if (url.indexOf('transaction') !== -1) {
                    this.status = '查看此账户交易记录';
                } else {
                    this.status = '对账';
                }
            }
        });
    }

    ngOnInit(): void {
        if (this.route.snapshot.params['id']) {
            this.account.id = this.route.snapshot.params['id'];
        } else {
            this.account.id = this.location.path().split(';')[1].split('=')[1];
        }

        this.bankSearch();
        this.bankSearchAll();
        this.currentBankStatementBalanceChange();

        console.log('<---ReconcileIndexComponent--->');
    }

    // 当导入账单成功后，调用其刷新银行对账余额
    currentBankStatementBalanceChange() {
        if (this.pubSubService.pub$.subscribe) {
            this.subscription = this.pubSubService.pub$.subscribe(event => {
                if (event.data === 'currentBankStatementBalance') {
                    this.ngOnInit();
                }
            });
        }
    }

    changeAccount(id) {
        if (this.location.path().indexOf('details') === -1) {
            this.router.navigate(['/app/reconcile/details/transaction', { id: id }]);
        } else {
            this.router.navigate(['/app/reconcile/detail/transaction', { id: id }]);
        }
        this.refreshAccount();
    }

    refreshAccount() {
        setTimeout(() => {
            if (this.route.snapshot.params['id']) {
                this.account.id = this.route.snapshot.params['id'];
            } else {
                this.account.id = this.location.path().split(';')[1].split('=')[1];
            }
            this.bankSearch();
        }, 0);
    }

    // 获取银行账户
    bankSearch() {
        this.bankAccountApi.bankAccountGetAll()
            .subscribe(
            data => {
                let index = _.findIndex(data, (item) => {
                    return item.id === this.account.id;
                });
                this.account = data[index];
                if (this.account.bankAccountType.name !== '银行') {
                    this.showBank = false;
                } else {
                    this.showBank = true;
                }
                console.log('<----获取银行账户---->bankSearch', data);
                this.currentAccount = data[index];
                this.reserveService.currentAccount = data[index];
                // this.caculateBalance();
            },
            error => {
                console.log('error', error);
            }
            );
    }

    // 获取所有银行账户
    bankSearchAll() {
        // this.bankAccountApi.bankAccountGet('cash')
        //     .subscribe(
        //     (data) => {
        //         this.cashList = data.list;
        //         console.log('this.cashList', this.cashList);
        //     },
        //     (error) => {
        //     }
        //     );
        // this.bankAccountApi.bankAccountGet('bank')
        //     .subscribe(
        //     (data) => {
        //         this.bankList = data.list;
        //         console.log('this.bankList', this.bankList);

        //     },
        //     (error) => {
        //     }
        //     );
        // this.bankAccountApi.bankAccountGet('wechat')
        //     .subscribe(
        //     (data) => {
        //         this.wechatList = data.list;
        //         console.log('this.wechatList', this.wechatList);

        //     },
        //     (error) => {
        //     }
        //     );
        // this.bankAccountApi.bankAccountGet('alipay')
        //     .subscribe(
        //     (data) => {
        //         this.alipayList = data.list;
        //         console.log('this.alipayList', this.alipayList);

        //     },
        //     (error) => {
        //     }
        //     );
    }

    caculateBalance() {
        // this.bankBalance = this.currentAccount.beginBalance;
        let balanceTemp = this.currentAccount.beginBalance;
        // 计算管＋记录余额
        this.accountTransactionApi.accountTransactionSearch(this.account.id, this.transactionSearchModel.accountTransactionType,
            this.transactionSearchModel.keyword, this.transactionSearchModel.money, this.transactionSearchModel.startDate,
            this.transactionSearchModel.endDate, this.transactionSearchModel.includeChildren,
            this.transactionSearchModel.statementStatus, this.transactionSearchModel.matchMoney,
            this.transactionSearchModel.pageIndex, this.transactionSearchModel.pageSize)
            .subscribe(
            data => {
                let transactionDataList = data.list;
                let originalTransactionDataList = _.cloneDeep(transactionDataList);
                _.forEach(originalTransactionDataList, item => {
                    let type: any = item.entityType.value;
                    type === 'Income' ? balanceTemp = balanceTemp + item.totalAmount :
                        balanceTemp = balanceTemp - item.totalAmount;
                });
                this.guanplusBalance = balanceTemp;
                this.ref.detectChanges();
            },
            error => {
                console.log(error);
            }
            );
        // 计算银行对账余额
        // this.bankSearchModel.pageSize = '100000';
        // this.bankStatementApi.bankStatementSearch(this.account.id,this.bankSearchModel.startDate, this.bankSearchModel.endDate,
        //     this.bankSearchModel.keyword, this.bankSearchModel.money, this.bankSearchModel.accountTransactionType,
        //     this.bankSearchModel.pageIndex, this.bankSearchModel.pageSize)
        //     .subscribe(
        //     data => {
        //         console.log('detail data', data);
        //         let bankDataList = data.list;
        //         let originalBankDataList = _.cloneDeep(bankDataList);
        //         _.forEach(originalBankDataList, item => {
        //             this.bankBalance = parseFloat((this.bankBalance + item.debit - item.credit).toFixed(2));

        //         });
        //     },
        //     error => {
        //         console.log(error);
        //     }
        //     );

    }

    reconcile() {
        let id = this.account.id;
        if (this.location.path().indexOf('details') === -1) {
            this.router.navigate(['/app/reconcile/details', { id: id, isReconcile: true }]);
        } else {
            this.router.navigate(['/app/reconcile/detail', { id: id, isReconcile: true }]);
        }
    }

}


