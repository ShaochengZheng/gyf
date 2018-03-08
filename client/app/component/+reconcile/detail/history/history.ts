import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { FormValidator } from '../../../../service/validators';
import { ReserveService } from '../../../../service/core';
import { ReconcileDetailComponent } from '../detail';
import { AccountTransactionApi } from '../../../../api/accounting/api/AccountTransactionApi';
import { AccountTransLineItemApi } from '../../../../api/accounting/api/AccountTransLineItemApi';
import { BankAccountApi } from '../../../../api/accounting/api/BankAccountApi';
import { StatementAttachmentApi } from '../../../../api/accounting/api/StatementAttachmentApi';
import { BankStatementApi } from '../../../../api/accounting/api/BankStatementApi';
import { ConfirmWidget, ConfirmEventTypeEnum } from '../../../widget/confirm/confirm';
import { ReconcileShareService } from '../../share/reconcile-share.service';


@Component({
    selector: 'recon-history',
    templateUrl: './history.html',
    styleUrls: ['./history.scss'],
    providers: [AccountTransactionApi, AccountTransLineItemApi, BankAccountApi,
        StatementAttachmentApi, BankStatementApi, ReconcileShareService]
})
export class ReconcileHistoryComponent {

    @ViewChild('newTransactionModal') public newTransactionModal;
    @ViewChild('confirmWidget') public confirmWidget: ConfirmWidget;
    @ViewChild('confirmWidget2') public confirmWidget2: ConfirmWidget;
    @ViewChild('cancelModal') public cancelModal: ConfirmWidget;
    account = { id: '', name: '', amount: 0 };
    dataList = [];
    noDataList: boolean = false;
    subdataList = [];
    externalItems = {
        createdOn: null,
        statementRecords: null
    };
    searchModel = {
        bankaccountid: '',
        accountTransactionType: '',
        keyword: '',
        startDate: '',
        endDate: '',
        pageIndex: '1',
        pageSize: '10'
    };
    totalAmountByPage = { income: 0, outcome: 0 };
    pageIndex: number = 1;
    pageSize: number = 10;
    recordCount: number = 0;
    maxSize: number = 5;
    currentItem: any;
    statementAttachmentIds: Array<string> = [];
    bankStatementIds: Array<string> = [];
    bankAccoutList: Array<Object> = [];
    transactionType = null;
    searchForm: FormGroup;
    delItem: any;
    isSifting: boolean = false;

    isMulti: boolean = true;

    public disabled: boolean = false;
    public status: { isopen: boolean } = { isopen: false };

    public alerts: any = [];
    public alertSuccess(msg: string) {
        this.clearAlert();
        this.alerts = [{ type: 'success', msg: msg }];
        this.alerts = this.alerts.map((alert: any) => Object.assign({}, alert));
        this.ref.detectChanges();
    }
    public alertDanger(msg: string) {
        this.clearAlert();
        this.alerts = [{ type: 'danger', msg: msg }];
        this.alerts = this.alerts.map((alert: any) => Object.assign({}, alert));
        // setTimeout(() => { this.alert = { type: 'danger', msg: msg };}, 0 );
        this.ref.detectChanges();
    }
    public addAlert(alert: Object): void {
        this.clearAlert();
        this.alerts = [alert];
    }
    public clearAlert(): void {
        this.alerts = [];
    }

    constructor(private router: Router, private fb: FormBuilder, private route: ActivatedRoute, private location: Location,
        private accountTransactionApi: AccountTransactionApi, private statementAttachmentApi: StatementAttachmentApi,
        private bankAccoutApi: BankAccountApi, private accountTransLineItemApi: AccountTransLineItemApi, private reserveService: ReserveService,
        private bankStatementApi: BankStatementApi, private reconcileDetailComponent: ReconcileDetailComponent, private ref: ChangeDetectorRef,
        private reconcileService: ReconcileShareService) {
        this.searchForm = fb.group({
            'startDate': ['', Validators.compose([Validators.required, FormValidator.invalidDateFormat])],
            'endDate': ['', Validators.compose([Validators.required, FormValidator.invalidDateFormat])],
        });

    }
    ngOnInit(): void {
        this.account.id = this.route.snapshot.params['id'];
        this.searchModel.bankaccountid = this.route.snapshot.params['id'];
        this.account.name = this.route.snapshot.params['name'] ? decodeURI(this.route.snapshot.params['name']) : '';
        this.search();
        this.bankSearch();
    }

    selectedAccount(item: any): void {
        this.searchModel.bankaccountid = item.id;
        this.search();
    }
    searchBlur() {
        // when etartDate is greater than endDate
        if (this.searchModel.startDate > this.searchModel.endDate) this.searchModel.endDate = this.searchModel.startDate;
        // if (this.searchModel.startDate && this.searchModel.endDate) {
        this.searchModel.pageIndex = '1';
        this.search();
        this.clearAlert();
        // } else {
        //     this.alertDanger('开始和结束日期不能为空！');
        // }
    }
    // 分页获取交易记录
    search() {
        this.statementAttachmentApi.statementAttachmentHistory(this.searchModel.bankaccountid, this.searchModel.startDate,
            this.searchModel.endDate, this.searchModel.pageIndex, this.searchModel.pageSize)
            .subscribe(
            data => {
                this.dataList = data.list;
                if (this.dataList === null || this.dataList.length === 0) {
                    this.noDataList = true;
                } else {
                    this.noDataList = false;
                    // data.list.forEach(element => {
                    //     if(element.statementStatus.name !== '已对账'){
                    //         this.isMulti = false;
                    //     }
                    // });
                }
                this.pageIndex = data.pageIndex;
                this.pageSize = data.pageSize;
                this.recordCount = data.recordCount;
            }, error => {
                this.alertDanger(error);
            }
            );
        // 实时刷新银行对账余额和管＋记录余额
        // this.reconcileDetailComponent.getCurrentAccount();
        this.getCurrentAccount();
    }

    // 获取银行账户
    bankSearch() {
        // this.bankAccoutApi.bankAccountGetAll()
        //     .subscribe(
        //     data => {
        //         let i = 0;
        //         let temp = [];
        //         if (this.account.id) {
        //             let index = _.findIndex(data, item => item.id === this.account.id);
        //             this.account.amount = data[index].beginBalance;
        //         }
        //         if (data) {
        //             for (i = 0; i < data.length; i++) {
        //                 temp[i] = ({ id: data[i].id, text: data[i].accountName });
        //             }
        //         }
        //         temp.unshift({ id: null, text: '全部账户' });
        //         this.bankAccoutList = temp;

        //     },  error => {
        //         console.log('error', error);
        //     } );
    }

    openDeleteModal(item, num) {
        if (num === 1) {
            this.currentItem = item;
            let id = item.id;
            this.statementAttachmentIds = [id];
            this.confirmWidget.message = '确认删除此条上传记录吗？';
            this.confirmWidget.show();
        }
        if (num === 2) {
            this.currentItem = item;
            let id = item.id;
            this.bankStatementIds = [id];
            this.confirmWidget2.message = '确认删除此条对账单记录吗？';
            this.confirmWidget2.show();

        }

    }

    openCancelModal(item) {
        this.currentItem = item;
        this.bankStatementIds = [item.id];
        let cancelMessage = '确认撤销此条交易的对账吗？';
        this.cancelModal.message = cancelMessage;
        this.cancelModal.show();
    }

    // 根据id 撤销对账
    // cancel(event) {
    //     if (event === ConfirmEventTypeEnum.Confirm) {
    //         this.bankStatementApi.bankStatementDelete(this.bankStatementIds)
    //             .subscribe(
    //             (data) => {
    //                 this.alertSuccess('撤销成功！');
    //                 this.search();
    //             },
    //             (error) => {
    //                 ;
    //                 this.alertDanger(error);
    //             }
    //             );
    //     }
    // }

    // 根据id 删除导入记录
    delete(event) {
        if (event === ConfirmEventTypeEnum.Confirm) {
            this.statementAttachmentApi.statementAttachmentDelete(this.statementAttachmentIds)
                .subscribe(
                (data) => {
                    this.alertSuccess('删除成功！');
                    this.search();
                    this.getCurrentAccount();
                },
                (error) => {
                    this.alertDanger(error);
                }
                );
        }
    }

    // 根据id 删除导入记录的每一个子项
    delete2(event) {
        if (event === ConfirmEventTypeEnum.Confirm) {
            this.bankStatementApi.bankStatementDelete(this.bankStatementIds)
                .subscribe(
                (data) => {
                    this.alertSuccess('删除成功！');
                    // this.search();
                    // setTimeout(() => { this.toggleSub(this.delItem); }, 5000);
                    let index = this.delItem.bankStatementModels.indexOf(this.currentItem);
                    this.dataList[this.dataList.indexOf(this.delItem)].bankStatementModels.splice(index, 1);
                    this.getCurrentAccount();
                },
                (error) => {
                    this.alertDanger(error);
                }
                );
        }
    }
    toggleSub(item) {
        this.dataList.forEach(element => {
            if (element === item) {
                element.showSubtable = !element.showSubtable;
                this.delItem = item;
            } else {
                element.showSubtable = false;
            }
        });
    }

    public pageChanged(event: any): void {
        this.searchModel.pageIndex = event.page;
        this.search();
    };

    toggleSifting() {
        this.isSifting = !this.isSifting;
    }

    records() {
        let id = this.account.id;
        if (this.location.path().indexOf('details') === -1) {
            this.router.navigate(['/app/reconcile/details/records', { id: id }]);
        } else {
            this.router.navigate(['/app/reconcile/detail/records', { id: id }]);
        }
    }

    // 顶部余额
    getCurrentAccount() {
        if (this.account.id) {
            console.log('<----获取银行账户---->bankSearch');
            this.reconcileService.bankSearch(this.account.id);
            //     this.bankAccoutApi.bankAccountGetAll()
            //         .subscribe(
            //         data => {
            //             let index = _.findIndex(data, (item) => {
            //                 return item.id === this.account.id;
            //             });
            //             this.reserveService.currentAccount = data[index];
            //             // this.caculateBalance();
            //         }, error => {
            //             console.log('error', error);
            //         });
        }
    }
    // 对账更能去掉了 -》 现在是同步
    reconcile() {
        //
        this.router.navigate(['/app/reconcile/multi-sync',
            { id: this.account.id }]);
        // let id = this.account.id;
        // if (this.location.path().indexOf('details') === -1) {
        //     this.router.navigate(['/app/reconcile/details', { id: id , isReconcile: true}]);
        // } else {
        //     this.router.navigate(['/app/reconcile/detail', { id: id, isReconcile: true }]);
        // }
    }
    import() {
        this.router.navigate(['/app/reconcile/import', {id: this.account.id, where: 'history'}]);
    }
}


