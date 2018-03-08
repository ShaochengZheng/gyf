import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import * as _ from 'lodash';

import { ReconcileShareService } from './../share/reconcile-share.service';


@Component({
  selector: 'app-account-interchange',
  templateUrl: './account-interchange.component.html',
  styleUrls: ['./account-interchange.component.scss'],
  providers: [ReconcileShareService]
})
export class AccountInterchangeComponent implements OnInit {
  @ViewChild('interchangeModal') public interchangeModal;
  dataList = [];
  blank = '未找到对方账户中的匹配信息，请确定对方账户中是否存在对应互转信息！';
  currentId;
  noData: boolean = false;
  // 有匹配数据 可以进行生成收支
  canSave = false;
  bankStatementSynchronizeModels = {
    fromBankStatementTransferId: '',
    toBankStatementTransferId: '',
    bankTransferModel: {
      id: '', // 不传
      number: '', // 不传
      accountTransDate: '',
      fromBankAccount: {
        id: '',
        name: ''
      },
      toBankAccount: {
        id: '',
        name: ''
      },
      transferAmount: 0,
      description: '',
      tags: [{
        id: '',
        value: '',
        isDefault: null
      }],
      // accountAttachmentModels: [{
      //   id: '',
      //   value: '',
      //   isDefault: null
      // }]
    }
  }
  // 判断关闭跳转方向
  target: any;

  alert: Object = {};
  public alertSuccess(msg: string) {
    this.clearAlert();
    msg = msg === undefined ? '' : msg;
    setTimeout(() => { this.alert = { type: 'success', msg: msg }; }, 0);
  }

  public alertDanger(msg: string) {
    this.clearAlert();
    msg = msg === undefined ? '' : msg;
    setTimeout(() => { this.alert = { type: 'danger', msg: msg }; }, 0);
  }

  public addAlert(alert: Object): void {
    this.clearAlert();
    this.alert = alert;
  }

  public clearAlert(): void {
    this.alert = {};
  }

  constructor(private reconcileShareService: ReconcileShareService, private route: ActivatedRoute,
    private router: Router, private location: Location, private ref: ChangeDetectorRef) {

  }

  ngOnInit() {
    this.target = this.route.snapshot.params['target'];
    this.currentId = this.route.snapshot.params['id'];
    if (this.currentId !== undefined) {
      this.bankStatementGetTransfers();
    }
  }

  bankStatementGetTransfers() {
    this.canSave = false;
    this.reconcileShareService.bankStatementGetTransfers(this.currentId).then(
      data => {
        console.log('bankStatementGetTransfers', data);
        this.dataList = _.cloneDeep(data);
        if (this.dataList.length <= 0) {
          this.noData = true;
        }
        _.forEach(data, item => {
          if (item.toAccount !== null) {
            this.canSave = true;
          }
        });

        this.ref.detectChanges();
      }, error => {
        console.log('error', error);
      }
    );
  }
  filerTheData(): Array<any> {
    let models = [];
    _.forEach(this.dataList, item => {
      if (item.toAccount === null) {
        return;
      }
      let model = _.cloneDeep(this.bankStatementSynchronizeModels);
      model.fromBankStatementTransferId = item.currentAccount.id;
      model.toBankStatementTransferId = item.toAccount.id;
      model.bankTransferModel.accountTransDate = item.currentAccount.transationDateTime;
      if (item.currentAccount.businessCategory.name === '账户转出') {
        model.bankTransferModel.fromBankAccount = item.currentAccount.bankAccount;
        model.bankTransferModel.toBankAccount = item.currentAccount.toBankAccount;
        model.bankTransferModel.description = item.currentAccount.summary;
      } else {
        model.bankTransferModel.fromBankAccount = item.currentAccount.toBankAccount;
        model.bankTransferModel.toBankAccount = item.currentAccount.bankAccount;
        model.bankTransferModel.description = item.toAccount === null ? '' : item.toAccount.summary;
      }
      model.bankTransferModel.transferAmount = item.currentAccount.amount;
      models.push(model);
    });
    return models;
  }
  save() {
    let models = this.filerTheData();
    console.log('account-interchange', models);
    this.reconcileShareService.bankTransferSynchronize(models).then(
      data => {
        console.log('bankStatementSynchronize', data);
        // this.router.navigate(['/app/transaction/list']);
        this.router.navigate(['/app/reconcile/detail/account-trans', { id: this.currentId, type: 'account' }]);
      }, error => {
        console.log('error', error);
        this.alertDanger(error);
      }
    );
  }
  back() {
    if (this.target !== undefined) {
      this.router.navigate(['/app/reconcile/detail/account-trans', { id: this.currentId, type: 'account' }]);
    } else {
      this.location.back();
    }
  }
  delete(item) {
    let ids = [];
    if(item.toAccount !== null){
      ids = [item.currentAccount.id, item.toAccount.id]
    }else {
      ids = [item.currentAccount.id];
    }
    this.reconcileShareService.bankStatementDeleteTransfer(ids).then(
      data => {
        console.log('bankStatementDeleteTransfer', data);
        this.bankStatementGetTransfers();
      }, error => {
        console.log('error', error);
        this.alertDanger(error);
      }
    );
  }
  edit(item) {
    this.interchangeModal.show(item);
  }
  result(args) {

  }
  editSucess(args) {
    this.bankStatementGetTransfers();
  }
}
