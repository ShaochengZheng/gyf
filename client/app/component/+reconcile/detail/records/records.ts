import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertModule } from 'ngx-bootstrap/alert';
import { Calendar } from '../../../widget/calendar/calendar';
import { FormValidator } from '../../../../service/validators';
import { ReserveService } from '../../../../service/core';
import { ReconcileDetailComponent } from '../detail';
import { ReconcileIndexComponent } from '../../recon-index';
import * as _ from 'lodash';
import { Location } from '@angular/common';


import { BankAccountApi } from '../../../../api/accounting/api/BankAccountApi';
import { BankStatementApi } from '../../../../api/accounting/api/BankStatementApi';
import { ConfirmWidget, ConfirmEventTypeEnum } from '../../../widget/confirm/confirm';
import { ReconcileShareService } from '../../share/reconcile-share.service';

declare var $: any;
@Component({
    selector: 'recon-records',
    templateUrl: './records.html',
    styleUrls: ['./records.scss'],
    providers: [BankAccountApi, BankStatementApi, ReconcileShareService]
})
export class ReconcileRecordsComponent {

    @ViewChild('newTransactionModal') public newTransactionModal;
    @ViewChild('confirmWidget') public confirmWidget: ConfirmWidget;
    @ViewChild('cancelModal') public cancelModal: ConfirmWidget;
    account = { id: '', name: '', amount: 0 };
    dataList = [];
    noDataList: boolean = false;
    searchModel = {
        bankaccountid: '',
        accountTransactionType: null,
        keyword: '',
        money: '',
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
    transactionType = null;
    stateStatus = '';
    remark = '没找到';
    isSifting: boolean = false;
    bankStatementIds: Array<string> = [];

    searchForm: FormGroup;
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

    constructor(private location: Location, private fb: FormBuilder, private route: ActivatedRoute, private router: Router,
        private reserveService: ReserveService, private bankAccountApi: BankAccountApi, private bankStatementApi: BankStatementApi,
        private reconcileDetailComponent: ReconcileDetailComponent, private ref: ChangeDetectorRef,
        private reconcileShareService: ReconcileShareService, private reconcileIndexComponent: ReconcileIndexComponent) {
        this.searchForm = fb.group({
            'startDate': ['', Validators.compose([Validators.required, FormValidator.invalidDateFormat])],
            'endDate': ['', Validators.compose([Validators.required, FormValidator.invalidDateFormat])],
        });

    }
    ngOnInit(): void {
        if (this.route.snapshot.params['id']) {
            this.account.id = this.route.snapshot.params['id'];
        } else {
            this.account.id = this.location.path().split(';')[1].split('=')[1];
        }
        this.account.name = this.route.snapshot.params['name'] ? decodeURI(this.route.snapshot.params['name']) : '';
        this.search();
    }

    selectedAccount(item: any): void {
        this.searchModel.bankaccountid = item.id;
        this.search();
    }
    searchBlur() {
        // when etartDate is greater than endDate
        if (this.searchModel.startDate > this.searchModel.endDate) this.searchModel.endDate = this.searchModel.startDate;
        this.search();
    }
    // enter 搜索
    keyPressHandler(event) {
        console.log('<-keyPressHandler-->', event);
        if (event.charCode === 13) {
            this.search();
        }
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
    search() {
        this.bankStatementApi.bankStatementSearch(this.account.id, this.searchModel.startDate, this.searchModel.endDate,
            this.searchModel.keyword, this.searchModel.money, this.transactionType, '', '', this.searchModel.pageIndex, this.searchModel.pageSize)
            .subscribe(
            data => {
                // console.log('data', data);
                this.dataList = data.list;
                if (this.dataList === null || this.dataList.length === 0) {
                    this.noDataList = true;
                } else {
                    this.noDataList = false;
                    data.list.forEach(element => {
                        if (element.statementStatus.name !== '已对账') {
                            this.isMulti = false;
                        }
                    });
                }
                this.pageIndex = data.pageIndex;
                this.pageSize = data.pageSize;
                this.recordCount = data.recordCount;
                // this.ref.detectChanges();
            },
            error => {
                console.log(error);
                this.alertDanger(error);
            }
            );
        // 实时刷新银行对账余额和管＋记录余额
        // this.reconcileDetailComponent.getCurrentAccount();
        // 
        // this.reconcileIndexComponent.bankSearch();
        this.getCurrentAccount();
    }

    openDeleteModal(item) {
        this.currentItem = item;
        let id = item.id;
        this.bankStatementIds = [id];
        this.confirmWidget.message = '确认删除此条对账单记录吗？';
        this.confirmWidget.show();
    }

    openCancelModal(item) {
        this.currentItem = item;
        this.bankStatementIds = [item.id];
        let cancelMessage = '确认撤销此条交易的对账吗？';
        this.cancelModal.message = cancelMessage;
        this.cancelModal.show();
    }

    // 根据id 撤销对账
    cancel(event) {
        if (event === ConfirmEventTypeEnum.Confirm) {
            this.bankStatementApi.bankStatementDelete(this.bankStatementIds)
                .subscribe(
                (data) => {
                    this.alertSuccess('撤销成功！');
                    this.search();
                },
                (error) => {
                    this.alertDanger(error);
                }
                );
        }
    }

    // 根据id 删除
    delete(event) {
        if (event === ConfirmEventTypeEnum.Confirm) {
            this.bankStatementApi.bankStatementDelete(this.bankStatementIds)
                .subscribe(
                (data) => {
                    this.alertSuccess('删除成功！');
                    this.search();
                    this.getCurrentAccount();
                    this.reconcileShareService.bankSearch(this.account.id);
                },
                (error) => {
                    this.alertDanger(error);
                });
        }
    }

    public toggled(open: boolean): void {
    }

    public toggleDropdown($event: MouseEvent): void {
        $event.preventDefault();
        $event.stopPropagation();
        this.status.isopen = !this.status.isopen;
    }

    public pageChanged(event: any): void {
        this.searchModel.pageIndex = event.page;
        this.search();
    };

    toggleSifting() {
        this.isSifting = !this.isSifting;
    }

    public clearnSearchForm() {
        let temp: any = this.searchModel;
        this.searchModel = {
            bankaccountid: '',
            accountTransactionType: null,
            keyword: '',
            money: '',
            startDate: '',
            endDate: '',
            pageIndex: '1',
            pageSize: '10'
        };
        $('#All').click();
    }

    history() {
        let id = this.account.id;
        if (this.location.path().indexOf('details') === -1) {
            this.router.navigate(['/app/reconcile/details/history', { id: id }]);
        } else {
            this.router.navigate(['/app/reconcile/detail/history', { id: id }]);
        }
    }
    //顶部余额
    getCurrentAccount() {
        if (this.account.id) {
            console.log('<----获取银行账户---->bankSearch');
            this.reconcileShareService.bankSearch(this.account.id);
            // this.bankAccountApi.bankAccountGetAll()
            //     .subscribe(
            //     data => {
            //         let index = _.findIndex(data, (item) => {
            //             return item.id === this.account.id;
            //         });
            //         this.reserveService.currentAccount = data[index];
            //         // this.caculateBalance();
            //     }, error => {
            //         console.log('error', error);
            //     });
        }
    }

    //对账更能去掉了 -》 现在是同步
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
}

