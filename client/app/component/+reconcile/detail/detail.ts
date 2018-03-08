import { Component, OnInit, ElementRef, OnDestroy, AfterViewInit } from '@angular/core';
import { Location } from '@angular/common';

import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import { BankAccountApi } from '../../../api/accounting/api/BankAccountApi';
import { AccountTransactionApi } from '../../../api/accounting/api/AccountTransactionApi';
import { BankStatementApi } from '../../../api/accounting/api/BankStatementApi';
import { BankAccountModel } from '../../../api/accounting/model/BankAccountModel';

declare var jQuery: any;

@Component({
    selector: 'reconcile-detail',
    templateUrl: './detail.html',
    styleUrls: ['./detail.scss'],
    providers: [AccountTransactionApi, BankStatementApi]
})
export class ReconcileDetailComponent implements OnInit, OnDestroy, AfterViewInit {
    $el: any;
    urlSub: any;
    account: any = { id: '' };
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
        description: ''
    };
    currentAccount: BankAccountModel = _.cloneDeep(this.initAccount);
    showBank: boolean = true;
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
    bankSearchModel = {
        startDate: '',
        endDate: '',
        money: '',
        keyword: '',
        accountTransactionType: null,
        pageIndex: '1',
        pageSize: '10'
    };
    bankBalance: number = 0;
    guanplusBalance: number = 0;
    display: string;
    activeTab: string;
    isReconcile: boolean;
    isRecords: boolean;

    constructor(private el: ElementRef, private location: Location, private router: Router,
        private bankStatementApi: BankStatementApi,
        private route: ActivatedRoute, private bankAccountApi: BankAccountApi,
        private accountTransactionApi: AccountTransactionApi) {
        this.$el = jQuery(el.nativeElement);
    }

    ngOnInit(): void {
        let id = this.route.snapshot.params['id'];
        if (id !== undefined) {
            this.account.id = id;
        } else {
            this.account.id = this.location.path().split(';')[1].split('=')[1];
        }
        // if (this.route.snapshot.params['isReconcile']) {
        //     this.isReconcile = this.route.snapshot.params['isReconcile'];
        // } else {
        //     this.isReconcile = false;
        // }
        // if (this.location.path().indexOf('history') !== -1) {
        //     this.isRecords = false;
        // } else {
        //     this.isRecords = true;
        // }

        // let type = this.route.snapshot.params['type'];
        // if (type) {
        //     console.log('<------>',type);
        //     if (type === 'bill') {
        //         this.router.navigate(['/app/reconcile/detail/records', { id: this.account.id }]);
        //     }
        //     if (type === 'account') {
        //         this.router.navigate(['/app/reconcile/detail/account-trans', { id: this.account.id }]);
        //     }
        // } else {
        //     console.log('no type<------>');
        // }

        if (this.location.path().indexOf('cash') !== -1) {
            this.showBank = false;
        } else {
            this.showBank = true;
        }

        // this.bankSearch();
        // this.urlSub = this.router.events.subscribe((event) => {
        //     if (event instanceof NavigationEnd) {
        //         if (this.route.snapshot.params['isReconcile']) {
        //             this.isReconcile = this.route.snapshot.params['isReconcile'];
        //         } else {
        //             this.isReconcile = false;
        //         }
        //         this.changeTabItem(this.location);
        //         this.activeTab = this.location.path().split(';')[0].split('/').pop();
        //     }
        // });
        // this.getCurrentAccount();
        // fix navTab active error
        // this.activeTab = this.location.path().split(';')[0].split('/').pop();
        // console.log('<------>', this.location.path(), this.activeTab);
    }
    // 获取当前账户
    getCurrentAccount() {
        if (this.account.id) {
            this.bankAccountApi.bankAccountGet_1(this.account.id)
                .subscribe(
                (data) => {
                    this.currentAccount = data;
                    if (this.currentAccount.bankAccountType.name !== '银行') {
                        this.showBank = false;
                    } else {
                        this.showBank = true;
                    }
                    this.caculateBalance();
                },
                (error) => {
                });
        }
    }

    // 获取银行账户
    bankSearch() {
        // this.bankAccountApi.bankAccountGetAll()
        //     .subscribe(
        //     data => {
        //         console.log(data);
        //         let index = _.findIndex(data, (item) => {
        //             return item.id === this.account.id;
        //         });
        //         this.account = data[index];
        //         console.log('account', this.account);
        //     },
        //     error => {
        //         console.log('error', error);
        //     }
        //     );
    }


    caculateBalance() {
        // // this.bankBalance = this.currentAccount.beginBalance;
        // let balanceTemp = this.currentAccount.beginBalance;
        // // 计算管＋记录余额
        // this.accountTransactionApi.accountTransactionSearch(this.account.id, this.transactionSearchModel.accountTransactionType,
        //     this.transactionSearchModel.keyword, this.transactionSearchModel.money, this.transactionSearchModel.startDate,
        //     this.transactionSearchModel.endDate, this.transactionSearchModel.includeChildren,
        //     this.transactionSearchModel.statementStatus, this.transactionSearchModel.matchMoney,
        //     this.transactionSearchModel.pageIndex, this.transactionSearchModel.pageSize)
        //     .subscribe(
        //     data => {
        //         let transactionDataList = data.list;
        //         let originalTransactionDataList = _.cloneDeep(transactionDataList);
        //         _.forEach(originalTransactionDataList, item => {
        //             let type: any = item.entityType.value;
        //             type === 'Income' ? balanceTemp = balanceTemp + item.totalAmount :
        //                 balanceTemp = balanceTemp - item.totalAmount;
        //         });
        //         this.guanplusBalance = balanceTemp;
        //     },
        //     error => {
        //         console.log(error);
        //     }
        //     );
        // // 计算银行对账余额
        // this.bankSearchModel.pageSize = '100000';
        // this.bankStatementApi.bankStatementSearch(this.account.id, this.bankSearchModel.startDate, this.bankSearchModel.endDate,
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


    changeTabItem(location): void {
        let url = location.path().replace('details', 'detail');
        let $newActiveLink = this.$el.find('a[href="' + url.split(';')[0] + ';id=' + this.account.id + '"]');
        this.$el.find('.nav-item .active').removeClass('active');
        $newActiveLink.addClass('active');
    }

    ngAfterViewInit(): void {
        this.changeTabItem(this.location);
    }

    ngOnDestroy(): void {
        // this.urlSub.unsubscribe();
    }
}

