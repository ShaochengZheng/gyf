import { Component, ViewChild, ChangeDetectorRef, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { FormValidator } from '../../../../service/validators';

import { ReconcileShareService } from '../../share/reconcile-share.service';
import { ConfirmEventTypeEnum } from './../../../widget/confirm/confirm';

import * as _ from 'lodash';


@Component({
  selector: 'app-account-trans',
  templateUrl: './account-trans.component.html',
  styleUrls: ['./account-trans.component.scss'],
  providers: [ReconcileShareService]
})
export class AccountTransComponent implements OnInit {


  @ViewChild('confirmWidget') public confirmModal;

  pageIndex: number = 1;
  pageSize: number = 1;
  recordCount: number = 0;
  maxSize: number = 10;
  dataList: any;
  isScreenShow: boolean = true;
  selectStatus = 'none';
  searchForm: FormGroup;

  noDataList: boolean = true;
  searchNodata: boolean = false;

  model = {
    bankaccountid: '',
    accountTransactionType: '0',
    keyword: '',
    money: '',
    startDate: '',
    endDate: '',
    includeChildren: '',
    statementStatus: '',
    matchMoney: '',
    pageIndex: '1',
    pageSize: '10'
  };
  searchModel = _.cloneDeep(this.model);
  currentItem;
  sumList = [];

  constructor(private fb: FormBuilder, private route: ActivatedRoute,
    private CDRef: ChangeDetectorRef, private router: Router, private reconcileService: ReconcileShareService) {
    this.searchForm = fb.group({
      'startDate': ['', Validators.compose([Validators.required,
      FormValidator.invalidDateFormat])],
      'endDate': ['', Validators.compose([Validators.required,
      FormValidator.invalidDateFormat])]
    });
  }

  public alerts: any = [];
  public alertSuccess(msg: string) {
    this.clearAlert();
    this.alerts = [{ type: 'success', msg: msg }];
    this.alerts = this.alerts.map((alert: any) => Object.assign({}, alert));
    this.CDRef.detectChanges();
  }
  public alertDanger(msg: string) {
    this.clearAlert();
    this.alerts = [{ type: 'danger', msg: msg }];
    this.alerts = this.alerts.map((alert: any) => Object.assign({}, alert));
    // setTimeout(() => { this.alert = { type: 'danger', msg: msg };}, 0 );
    this.CDRef.detectChanges();
  }
  public addAlert(alert: Object): void {
    this.clearAlert();
    this.alerts = [alert];
  }
  public clearAlert(): void {
    this.alerts = [];
  }

  ngOnInit() {
    this.clearAlert();
    let id = this.route.snapshot.params['id'];
    console.log('<--account-trans-->', id);
    if (id) {
      this.model.bankaccountid = id;
      this.searchModel.bankaccountid = id;
      this.search();
    }


  }
  // 获取数据
  search() {
    this.reconcileService.getAccoutTrans(this.searchModel).then(
      data => {
        this.dataList = data.list;
        this.pageIndex = data.pageIndex;
        this.pageSize = data.pageSize;
        this.recordCount = data.recordCount;
        if (this.dataList !== null) {
          this.dataList.forEach(element => {
            if (element.contact === null) {
              element.contact = { name: '' };
            }
            if (element.entityType.value === 'Income') {
              element.income = element.totalAmount;
              element.outcome = null;
            } else {
              element.outcome = element.totalAmount;
              element.income = null;
            }
          });
          console.log('<account--search--->', this.dataList);
          this.noDataList = false;

          this.accountTransLineItemTransactionSum();
        } else {
          this.sumList = [];
          this.noDataList = true;
        }
        this.reconcileService.bankSearch(this.searchModel.bankaccountid);
        this.CDRef.detectChanges();
      }, error => {
        console.log('<--error--->', error);
        this.alertDanger(error);
      });
  }

  // 编辑
  editContact(item) {
    console.log('<---editContact-->', item);
    if (item.sourceId) {
      this.router.navigate(['/app/transaction/detail/editaccountTransfers', { id: item.id }]);
    } else {
      if (item.income !== null) {
        this.router.navigate(['/app/transaction/detail/editIncome', { id: item.id }]);
      } else {
        this.router.navigate(['/app/transaction/detail/editOutcome', { id: item.id }]);
      }
    }

    // '/app/transaction/detail/accountTransfers' 
  }
  // 删除
  openConfirmModal(item) {
    this.confirmModal.title = '提示';
    this.confirmModal.message = '确认删除此收支记录？';
    this.currentItem = item;
    this.confirmModal.show();
  }
  delete(event) {
    if (event === ConfirmEventTypeEnum.Confirm) {
      this.reconcileService.deleteAccountTransById(this.currentItem.id).then(
        data => {
          this.alertSuccess('删除成功');
          this.search();
          this.reconcileService.bankSearch(this.searchModel.bankaccountid);
        }, error => {
          this.alertDanger(error);
        });
    };
  }
  //顶部余额
  getCurrentAccount() {
    this.reconcileService.bankSearch(this.searchModel.bankaccountid);
  }

  public pageChanged(event: any): void {

    this.searchModel.pageIndex = event.page;
    this.search();
  };

  showScreenBoard() {
    this.isScreenShow = !this.isScreenShow;
  }
  //日期
  searchBlur(value) {
    // when etartDate is greater than endDate
    if (this.searchModel.startDate > this.searchModel.endDate) this.searchModel.endDate = this.searchModel.startDate;
    this.searchModel.pageIndex = '1';
    this.search();
  }
  //关键字
  blurkeyWord(value) {
    console.log('<---->', value, this.searchModel.keyword);
    // this.searchModel.keyword = value;
    this.searchModel.pageIndex = '1';
    this.search();

  }
  //类型
  setAccountTransactionType(type) {
    console.log('<--leixing-->', type, this.searchModel);
    this.searchModel.accountTransactionType = type;
    this.searchModel.pageIndex = '1';
    this.search();
  }
  // enter 搜索
  keyPressHandler(event) {
    console.log('<-keyPressHandler-->', event);
    if (event.charCode === 13) {
      this.search();
    }
  }
  // 清空筛选条件
  clearSearchModel() {
    this.searchModel = _.cloneDeep(this.model);
    this.searchModel.pageIndex = '1';
    this.search();
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
  accountTransLineItemTransactionSum() {
    this.reconcileService.accountTransLineItemTransactionSum(this.searchModel).then(
      data => {
        this.sumList = _.cloneDeep(data);
        console.log('accountTransLineItemTransactionSum', data);
      }, error => {
        console.log('accountTransLineItemTransactionSum', error);
      });
  }

}