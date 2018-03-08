import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FinanceService } from './../shared/finance.service';
import { ShareService } from '../../../service/core/share';

import * as _ from 'lodash';

@Component({
  selector: 'app-general-ledger',
  templateUrl: './general-ledger.component.html',
  styleUrls: ['./general-ledger.component.scss']
})
export class GeneralLedgerComponent implements OnInit {

  model = {
    accountCategoryId: '',
    year: '2017',
  };
  noData: boolean = true;
  searchModel = _.cloneDeep(this.model);

  itemList: Array<Object> = [];
  accountCage;
  yearList = [];
  dataList = [];
  isScreenShow: boolean = false;
  defaultACI = [];
  defaultYear = [];

  public alerts: any = [];
  public alertSuccess(msg: string) {
    this.clearAlert();
    this.alerts = [{ type: 'success', msg: msg }];
    this.alerts = this.alerts.map((alert: any) => Object.assign({}, alert));
    this.ref.detectChanges();
    // setTimeout(() => { this.alert = { type: 'success', msg: msg }; }, 0);
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

  constructor(private ref: ChangeDetectorRef, private shareService: ShareService, private financeService: FinanceService) { }

  ngOnInit() {
    // this.search();
    this.getAllSubjects();
    this.accountAccountPeriod();
  }
  // 获取所有科目
  getAllSubjects() {
    this.financeService.getAllSubjectsForDetail('Y').then(
      data => {
        this.itemList = _.cloneDeep(data);
        if (this.itemList) {
          let temp = this.itemList[0];
          this.defaultACI = [{ id: data[0].id, text: data[0].text }];
          if (this.defaultYear[0]) {
            this.selected(temp, 'type');
          }
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
          this.defaultYear = [{ id: 'year', text: currentYear }];

          this.searchModel.year = String(currentYear);
          if (this.defaultACI[0]) {
            this.selected(this.defaultACI[0], 'type');
          }
        }
        console.log('<----->', this.defaultYear);
      },
      error => {
        console.log(error);
      }
    );
  }
  // 获取明细账
  search() {
    this.financeService.getGeneralLedger(this.searchModel).then(
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
          // item.credit = item.credit === 0 ? 
        });
        console.log('<------getDetailAccount-------->', data);
      }, error => {
        console.log('<------getDetailAccount-------->', error);
      });
  }
  selected(e, type) {
    console.log(e);
    if (type === 'type') {
      this.searchModel.accountCategoryId = e.id;
      let accountCategory = e.text;
      if (String(accountCategory).includes('—')) {
        let length = String(accountCategory).length;
        accountCategory = String(accountCategory).substr(1, length - 1);
      }
      this.accountCage = accountCategory;
    } else if (type === 'year') {
      this.searchModel.year = e.text;
    }
    this.search();
  }

  showScreenBoard() {
    this.isScreenShow = !this.isScreenShow;
  }
  // 导出
  export() {
    let expModel = {
      year: this.searchModel.year,
      month: '0',
      isCurrentPeriod: false
    }
    this.financeService.accountExportAccount(expModel, false).then(
      data => {
        console.log(data);

        let elemIF = document.createElement('iframe');
        elemIF.src = data;
        elemIF.style.display = 'none';
        document.body.appendChild(elemIF);
        this.alertSuccess('导出成功');
      }, error => {
        this.alertDanger(error);
      }
    );
  }

}