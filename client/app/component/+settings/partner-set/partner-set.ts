import { Object } from './../../../api/identity/model/Object';
import { Component, ViewChild, OnInit, ChangeDetectorRef } from '@angular/core';
import * as _ from 'lodash';
// import { DepartmentApi } from '../../../api/accounting/api/DepartmentApi';
// import { DepartmentModel } from '../../../api/accounting/model/DepartmentModel';
import { OperationModeEnum } from '../../../service/core/core';
import { StorageService, AuthorizationService } from '../../../service/core';
import { ShareholderApi } from '../../../api/accounting/api/ShareholderApi';
import { ShareholderModel } from '../../../api/accounting/model/ShareholderModel';
import { ConfirmEventTypeEnum } from '../../widget/confirm/confirm';

@Component({
  selector: 'app-partner-set',
  templateUrl: './partner-set.html',
  styleUrls: ['./partner-set.scss'],
  providers: [ShareholderApi]
})
export class PartnerSetComponent implements OnInit {

  @ViewChild('partnerDetailModal') public partnerDetailModal;
  @ViewChild('confirmWidget') public confirmWidget;

  pageIndex: number = 1;
  pageSize: number = 1;
  recordCount: number = 0;
  maxSize: number = 10;
  deleteMessage: string = '您确认要删除股东吗？';
  dataList = [];
  noDataList: boolean = false;
  currentPartner: ShareholderModel;
  searchModel = {
    keyword: '',
    pageIndex: '1',
    pageSize: '10'
  };
  shareCountAll: number = 0;
  lessThenShare: boolean = false;

  constructor(private partner: ShareholderApi, private ref: ChangeDetectorRef, private storage: StorageService,
    private author: AuthorizationService) {

  }
  getPartnerList() {
    console.log('<---getPartnerList---->', this.author.Session.user.id);
    this.partner.shareholderSearch()
      .subscribe(
      (data) => {
        this.shareCountAll = 0;
        console.log('<---getPartnerList---->data', JSON.stringify(data));
        if (data.list === null || data.list === [] || data.recordCount === 0) {
          this.noDataList = true;
          this.dataList = [];
        } else {
          this.noDataList = false;
          this.dataList = data.list;
          this.dataList.forEach(element => {
            this.shareCountAll = this.shareCountAll + element.shareProportion;
            element.amount = String(Number(element.amount) /10000);
            if (element.account !== null) {
              element.isEdit = false;
            } else {
              element.isEdit = true;
            }

          });
          this.lessThenShare = this.shareCountAll < 1 ? true : false;
        }
        setTimeout(() => this.ref.markForCheck(), 10);
      }, (error) => {
        console.log('<---getPartnerList---->error', JSON.stringify(error));
      });
  }

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
  // 新建
  newDepartment() {
    this.partnerDetailModal.operation = OperationModeEnum.New;
    this.partnerDetailModal.shareCountAll = this.shareCountAll;
    this.partnerDetailModal.show();
  }
  // 编辑
  editDepartment(item) {

    let tempItem = _.cloneDeep(item);
    this.partnerDetailModal.operation = OperationModeEnum.Update;
    this.partnerDetailModal.shareCountAll = this.shareCountAll;
    this.partnerDetailModal.show(tempItem);
  }

  ngOnInit(): void {
    this.clearAlert();
    this.getPartnerList();
  }

  openDeleteModal(item) {
    console.log('<----openDeleteModal--->', item);
    this.confirmWidget.show();
    this.currentPartner = item;
  }

  delete(event) {
    console.log('<----delete--->', event);
    if (event === ConfirmEventTypeEnum.Confirm) {
      this.partner.shareholderDelete(this.currentPartner.id)
        .subscribe(
        (data) => {
          this.alertSuccess('删除成功！');
          this.getPartnerList();
        },
        (error) => {
          ;
          this.alertDanger(error);
        });
    }

  }
  // model 返回结果
  result(resultObj) {
    console.log('result', resultObj);
    this.addAlert(resultObj);
    this.getPartnerList();
  }
  public pageChanged(event: any): void {
    this.searchModel.pageIndex = event.page;
    this.getPartnerList();
  };


}