import { Component, ViewChild, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, AbstractControl, Validators } from '@angular/forms';

import * as _ from 'lodash';
import * as moment from 'moment';

import { ReconcileShareService } from './../../share/reconcile-share.service';


@Component({
  selector: 'gwp-interchange-modal',
  templateUrl: './interchange-modal.html',
  styleUrls: ['./interchange-modal.scss'],
  providers: [ReconcileShareService]
})
export class InterchangeModal implements OnInit {

  @ViewChild('modal') public modal;
  @Output() success = new EventEmitter();
  @Output() result = new EventEmitter();
  interForm: FormGroup;

  date;
  mark = '这里是备注';
  money = '10000';
  accountList = [];
  account = [];
  // 传过来的数据
  item = null;
  // 是否是转出
  isOut = true;
  minDate: any;
  maxDate: any;
  constructor(fb: FormBuilder, private router: Router, private ref: ChangeDetectorRef,
    private reconcileShareService: ReconcileShareService) {
    this.interForm = fb.group({
      'date': ['', Validators.required]
    })
  }

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
    this.ref.detectChanges();
  }
  public addAlert(alert: Object): void {
    this.clearAlert();
    this.alerts = [alert];
  }
  public clearAlert(): void {
    this.alerts = [];
  }

  ngOnInit() {
    // this.getAccountAll();
  }

  // 
  getAccountAll() {
    this.reconcileShareService.getAccountAll().then(
      data => {
        this.accountList = [];
        _.forEach(data, itemData => {
          if (this.item.currentAccount.bankAccount[0].id === itemData.id) {
            return;
          }
          let model = { id: itemData.id, text: itemData.accountName };
          this.accountList.push(model);
        });
        console.log('getAccountAll', this.accountList);
        this.ref.detectChanges();
      }, error => {
        console.log('getAccountAll->error', error);
      }
    );
  }
  selected(args) {

  }
  public show(item) {
    this.modal.show();
    this.item = _.cloneDeep(item);
    this.item.currentAccount.bankAccount = [{ id: item.currentAccount.bankAccount.id, text: item.currentAccount.bankAccount.name }];
    this.item.currentAccount.toBankAccount = [{ id: item.currentAccount.toBankAccount.id, text: item.currentAccount.toBankAccount.name }];
    this.item.currentAccount.transationDateTime = moment(this.item.currentAccount.transationDateTime).format('YYYY-MM-DD');
    let date = this.item.currentAccount.transationDateTime;
    this.getPeroidDateArea(date);
    this.getAccountAll();
    if (this.item.currentAccount.businessCategory.name === '账户转入') {
      this.isOut = false;
    } else {
      this.isOut = true;
    }
    console.log('show item', this.item);
    this.ref.detectChanges();
  }
  // 时间选择限制在会计区间
  getPeroidDateArea(date) {
    let year = moment(date).year();
    let month = moment(date).month();
    const newdate = moment(new Date()).year(year).month(month);
    this.minDate = moment(newdate).date(1).format('YYYY-MM-DD');
    this.maxDate = moment(newdate).date(newdate.daysInMonth()).format('YYYY-MM-DD');
    // console.log('minDate', this.minDate, this.maxDate, date);
  }

  public close() {
    this.modal.hide();
  }
  save() {
    if (!this.item.currentAccount.transationDateTime) {
      return;
    }
    let model = _.cloneDeep(this.item);
    model.currentAccount.bankAccount = {
      id: this.item.currentAccount.bankAccount[0].id,
      name: this.item.currentAccount.bankAccount[0].text
    };
    model.currentAccount.toBankAccount = {
      id: this.item.currentAccount.toBankAccount[0].id,
      name: this.item.currentAccount.toBankAccount[0].text
    };
    this.reconcileShareService.bankStatementPut([model.currentAccount]).then(
      data => {
        console.log('bankStatementPut', data);
        this.close();
        this.item = null;
        let resultObj = {
          type: 'success',
          msg: '账户互转编辑成功！'
        };
        this.result.emit(resultObj);
        this.success.emit(data);
      }, error => {
        console.log('error', error);
        this.alertDanger(error);
      }
    );
  }
  onShown() {

  }
  keyPressHandler(args) {

  }
}
