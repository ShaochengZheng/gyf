import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {FinanceService} from './../shared/finance.service';
import {ShareService} from '../../../service/core/share';
import * as _ from 'lodash';

@Component({
    selector: 'app-account-detail',
    templateUrl: './account-detail.component.html',
    styleUrls: ['./account-detail.component.scss'],
})
export class AccountDetailComponent implements OnInit {


    model = {
        accountCategoryId: '',
        year: '',
        month: '',
        isCurrentPeriod: true
    };
    noData: boolean = true;
    searchModel = _.cloneDeep(this.model);

    itemList: Array<Object> = [];
    accountCage;
    yearList = [];
    monthList = [];
    dataList = [];
    isScreenShow: boolean = false;
    // 默认值
    defaultACI = [];
    defaultYear = [];
    defaultMonth = [];

    public alerts: any = [];

    public alertSuccess(msg: string) {
        this.clearAlert();
        this.alerts = [{type: 'success', msg: msg}];
        this.alerts = this.alerts.map((alert: any) => Object.assign({}, alert));
        this.ref.detectChanges();
        // setTimeout(() => { this.alert = { type: 'success', msg: msg }; }, 0);
    }

    public alertDanger(msg: string) {
        this.clearAlert();
        this.alerts = [{type: 'danger', msg: msg}];
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

    constructor(private shareService: ShareService, private financeService: FinanceService, private ref: ChangeDetectorRef) {
    }

    ngOnInit() {
        // this.search();
        this.getAllSubjects();
        this.accountAccountPeriod();
    }

    //  获取所有科目
    getAllSubjects() {
        this.financeService.getAllSubjectsForDetail('Y').then(
            data => {
                this.itemList = _.cloneDeep(data);
                if (this.itemList) {
                    let temp = this.itemList[0];
                    this.defaultACI = [{id: data[0].id, text: data[0].text}];
                    if (this.defaultMonth[0] && this.defaultYear[0]) {
                        this.selected(temp, 'type');
                    }
                    console.log('<----->', temp, data[0].text);
                    this.ref.detectChanges();
                }
                console.log('<------getAllSubjects-------->', data);
            }, error => {
                console.log('<------getAllSubjects-------->', error);
                this.alertDanger(error);
            });
    }

    // 获取对账区间
    accountAccountPeriod() {
        this.shareService.accountAccountPeriod(false).then(
            accountPeriodModel => {
                if (accountPeriodModel) {
                    this.yearList = accountPeriodModel.YearList;
                    let currentYear = accountPeriodModel.currentYear;
                    this.defaultYear = [{id: 'year', text: currentYear}];

                    this.monthList = accountPeriodModel.MonthsToList;
                    let currentMonth = accountPeriodModel.currentMonth;
                    this.defaultMonth = [{id: 'month', text: currentMonth}];

                    this.searchModel.year = String(currentYear);
                    this.searchModel.month = String(currentMonth);
                    if (this.defaultACI[0]) {
                        this.selected(this.defaultACI[0], 'type');
                    }
                }
                console.log('<----->', this.defaultMonth, this.defaultYear);
            },
            error => {
                console.log(error);
            }
        );
    }

    // 获取对应年费的对账期间
    getMonthsToList(year) {
        this.shareService.getMonthsToList(Number(year)).then(
            accountPeriodModel => {
                this.monthList=accountPeriodModel.MonthsToList;
                this.searchModel.month = accountPeriodModel.MonthsToList[0].text;
                this.defaultMonth = [{id: 'month', text: this.searchModel.month}];
                this.search();
            }
        );
    }

    // 获取明细账
    search() {
        if (this.searchModel.accountCategoryId === '') {
            return;
        }
        this.financeService.getDetailAccount(this.searchModel).then(
            data => {
                if (data === null) {
                    this.noData = true;
                    return;
                } else {
                    this.noData = false;
                }
                this.dataList = _.cloneDeep(data);
                this.dataList.forEach(item => {
                    // 借
                    if (item.balanceDirection === 'Debit') {
                        item.balanceText = '借';
                    } else {
                        item.balanceText = '贷';
                    }
                    if (item.journalNumber) {
                        let str = '00000' + item.journalNumber;
                        item.journalNumber = '记-' + str.substring(str.length - 4, str.length);
                    }
                    item.accountCage = this.accountCage;
                });
                console.log('<------getDetailAccount-------->', data);
            }, error => {
                console.log('<------getDetailAccount-------->', error);
            });
    }

    // 各种选择框- 并搜索
    selected(e, type) {
        if (type === 'type') {
            this.searchModel.accountCategoryId = e.id;
            let accountCategory = e.text;
            if (String(accountCategory).includes('—')) {
                let length = String(accountCategory).length;
                accountCategory = String(accountCategory).substr(1, length - 1);
            }
            this.accountCage = accountCategory;
            this.search();

        } else if (type === 'year') {
            this.searchModel.year = e.text;
            this.getMonthsToList(this.searchModel.year);
        } else {
            // month
            this.searchModel.month = e.text;
            this.search();

        }
    }

    radioClick(TOF: boolean) {
        this.searchModel.isCurrentPeriod = TOF;
        this.search();
    }

    showScreenBoard() {
        this.isScreenShow = !this.isScreenShow;
    }
    // 导出
    export() {
        this.financeService.accountExportAccount(this.searchModel,true).then(
            data => {
                console.log(data);

                let elemIF = document.createElement('iframe');
                elemIF.src = data;
                elemIF.style.display = 'none';
                document.body.appendChild(elemIF);
                this.alertSuccess('导出成功');
            },error => {
                this.alertDanger(error);
            }
        );
    }

}
