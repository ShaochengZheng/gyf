import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';



import { BankAccountApi } from '../../../api/accounting/api/BankAccountApi';
import { PostingApi } from '../../../api/accounting/api/PostingApi';
import * as _ from 'lodash';
import * as moment from 'moment';

import { PubSubService, EventType } from '../../../service/pubsub.service';
import { Subscription } from 'rxjs/Subscription';

import { HomePageService } from './../shared/home-page.service';
import { ShareService } from '../../../service/core/share';
import { WorkerStatusEnumModel } from '../../../api/accounting/model/WorkerStatusEnumModel';
import { AccountBookSettingApi } from '../../../api/accounting/api/AccountBookSettingApi';
import { AccountBookSettingStatusEnumModel } from '../../../api/accounting/model/AccountBookSettingStatusEnumModel';
import { AuthorizationService } from '../../../service/core/authorization';
import { JournalEntryApi } from '../../../api/accounting/api/JournalEntryApi';

@Component({
  selector: 'app-assist-home-page',
  templateUrl: './assist-home-page.component.html',
  styleUrls: ['./assist-home-page.component.scss'],
  providers: [BankAccountApi, HomePageService, AccountBookSettingApi, PostingApi, JournalEntryApi],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssistHomePageComponent implements OnInit {

  @ViewChild('accountDetailsModal') public accountDetailsModal;
  noCashList: any = [];
  selectedAccount;
  isAccount: boolean = false;
  isWorkers: boolean = false;
  isBill: boolean = false;
  //银行账面余额
  bookBalance = 0.00;
  //银行对账单余额
  balancePer = 0.00;
  //本期工作已全部完成按钮状态
  finished: boolean = true;
  //是否可以点击
  isInProgress: boolean = true;
  //当前会计区间
  currentPeriod = '';
  subscription: Subscription;

  dataList = [ { name: '银行对账单期末余额', totalAmount: 0 },
              { name: '银行账面期末余额', totalAmount: 0  }];
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

  // 错误提示
  showError(error) {
    this.alertDanger(error);
  }

  constructor(private shareService: ShareService, private bankAccountApi: BankAccountApi, private homePageService: HomePageService,
    private ref: ChangeDetectorRef, private accountBookSettingApi: AccountBookSettingApi, private router: Router,
    private postingApi: PostingApi, private authorizationService: AuthorizationService, private pubSubService: PubSubService,
    private journalEntryApi: JournalEntryApi) {

  }

  ngOnInit() {
    this.currentPeriod = localStorage.getItem('currentPeriod').substr(0, 7);
    this.accountAccountPeriod();
    this.getNoCashBank();
    this.getAssistHomePage();
    this.getAssistHomePageStatus();
    this.accountBookSettingGet();
    this.journalEntryOrder();
    this.initOnCompanyChange();
  }
  // 是否切换账套 
  initOnCompanyChange() {
    if (this.pubSubService.pub$.subscribe) {
      this.subscription = this.pubSubService.pub$.subscribe(event => {
        // 切换账套
        if (event.type === EventType.SwitchHomePageAssist) {
          this.switch();
          console.count('监听次数：');
        }
      });
    }
  }
  // 刷新
  switch() {
    this.currentPeriod = localStorage.getItem('currentPeriod').substr(0, 7);
    this.accountAccountPeriod();
    this.getNoCashBank();
    this.getAssistHomePage();
    this.getAssistHomePageStatus();
    this.accountBookSettingGet();
    this.journalEntryOrder();
  }
  // 获取非现金账户
  getNoCashBank() {
    this.shareService.getNoCashBank().then(
      data => {
        this.noCashList = data;
        console.log('this.noCashList', this.noCashList);
      },
      error => {

      }
    );
  }
  // 获取对账区间
  accountAccountPeriod() {
    this.shareService.accountAccountPeriod(false).then(
      accountPeriodModel => {
        if (accountPeriodModel) {
          let currentYear = accountPeriodModel.currentYear;

          let currentMonth = accountPeriodModel.currentMonth;
          let month = currentMonth < 10 ? '0' + currentMonth : currentMonth;
          this.currentPeriod = currentYear + '-' + month;
        }
      },
      error => {
        console.log(error);
      }
    );
  }

  // 获取首页数据
  getAssistHomePage() {
    this.homePageService.getHomePageData()
      .then(data => {
        this.dataList = _.cloneDeep(data);
        if (this.dataList !== null) {
          console.log('银行账户余额<---->银行对账单余额', data);
          this.dataList.forEach(element => {
            if (element.name === '银行账面期末余额') {
              this.bookBalance = element.totalAmount;
            } else if (element.name === ' 银行对账单期末余额') {
              this.balancePer = element.totalAmount;
            }
          });
        }
        this.ref.detectChanges();
        // setTimeout(() => this.ref.markForCheck(), 10);
      })
      .catch(error => {
        this.showError(error);
      });
  }


  /** 导入 
   * 1->开票明细 2->对账单 3->员工信息 4->发票
   * @param index 
   */
  leadingIn(index) {

    if (index === 1) {
      this.router.navigate(['/app/invoice/import-output-invoice']);
    } else if (index === 2 && this.isAccount === true) {

    } else if (index === 3 && this.isWorkers === true) {
      this.router.navigate(['/app/salary/stuff-import']);
    } else if (index === 4 && this.isBill === true) {

    }
  }
  /** 手工录入
   *  1->开票明细 2->对账单 3->员工信息 4->发票
   * @param index 
   */
  recordManualy(index) {
    console.log('<--recordManualy-->', index);
    if (index === 1) {
      this.router.navigate(['/app/invoice/tab/new-output-invoice']);
    } else if (index === 2 && this.isAccount === true) {
      this.router.navigate(['/app/transaction/detail/Income']);
    } else if (index === 3 && this.isWorkers === true) {
      this.router.navigate(['/app/salary/stuff']);
    } else if (index === 4 && this.isBill === true) {
      this.router.navigate(['/app/invoice/tab/new-input-invoice']);
    }
  }
  /** 没有xxxx
   *  1->开票明细 2->对账单 3->员工信息 4->发票
   * @param index 
   */
  jumpNext(index) {
    if (index === 1) {
      this.isAccount = true;
      this.setAssistHomePageStatus('ImportInvoice');
    } else if (index === 2 && this.isAccount === true) {
      this.isWorkers = true;
      this.setAssistHomePageStatus('ImportBankStatement');
    } else if (index === 3 && this.isWorkers === true) {
      this.isBill = true;
      this.setAssistHomePageStatus('ImportEmployeeInfo');
    } else if (index === 4 && this.isBill === true) {

    }

  }

  /**  
   * 先整理编号 再去 设置账套状态为完成状态
   * 
   * @param year 
   * @param month 
   */
  journalEntryOrder() {
    if (this.finished) {
      return;
    }
    this.isInProgress = true;
    let month = this.currentPeriod.substr(5, 6);
    let year = this.currentPeriod.substr(0, 4);
    console.log('<>-----', Number(year), Number(month));
    this.journalEntryApi.journalEntryOrder(Number(year), Number(month)).subscribe(
      data => {
        this.accountFinished();
      }, error => {
        this.alertDanger(error);
      });
  }
  /**
   * 设置账套状态为完成状态
   * 
   */
  accountFinished() {

    this.postingApi.postingSetting().subscribe(
      data => {
        this.accountBookSettingGet();
        this.finished = true;
        this.isInProgress = true;
        this.alertSuccess('提交审核成功');
        // 判断身份，如果同时是会计跳会计首页
        let token = this.authorizationService.getSession();
        let roles = _.cloneDeep(token.user.currentRole);
        token.currentAccount.status = 'CarryForward';
        this.authorizationService.setSession(token);
        this.pubSubService.publish({
          type: EventType.SwitchAccount,
          data: ''
        });
        if (roles) {
          roles.forEach(element => {
            if (element === 'Account') {
              this.router.navigate(['/app/home-page/accounting']);
            }
          });
        }
      }, error => {
        this.isInProgress = false;
        this.alertDanger(error);
      }
    );
  }
  /** 获取助理首页状态
   *     ImportInvoice = <any> 'ImportInvoice',
   *     ImportBankStatement = <any> 'ImportBankStatement',
   *     ImportEmployeeInfo = <any> 'ImportEmployeeInfo',
   *     WriteInvoice = <any> 'WriteInvoice'
   */

  getAssistHomePageStatus() {
    this.homePageService.getAssistStatus().then(
      data => {
        console.log('<getAssistHomePageStatus--->', data);
        if (data.value) {
          if (data.value === 'ImportInvoice') {
            this.isAccount = false;
            this.isWorkers = false;
            this.isBill = false;
          } else if (data.value === 'ImportBankStatement') {
            this.isAccount = true;
          } else if (data.value === 'ImportEmployeeInfo') {
            this.isAccount = true;
            this.isWorkers = true;
          } else if (data.value === 'WriteInvoice') {
            this.isAccount = true;
            this.isWorkers = true;
            this.isBill = true;
          }
        }
        setTimeout(() => this.ref.markForCheck(), 10);
      }, error => {
        console.log('<getAssistHomePageStatus--->', error);
      }
    );
  }
  // 更新助理首页状态
  setAssistHomePageStatus(status) {
    this.homePageService.setAssistStatus(status).then(
      data => {
        console.log('<getAssistHomePageStatus--->', data);
      }, error => {
        console.log('<getAssistHomePageStatus--->', error);
      }
    );
  }

  // /// 期初设置
  // BeginningInit = 0,
  // /// 进行中
  // InProgress = 1,
  // /// 待结转
  // CarryForward = 2,
  // /// 待过账
  // Posting = 3,
  // /// 完成
  // Done = 4
  accountBookSettingGet() {
    this.accountBookSettingApi.accountBookSettingGet().subscribe(
      accountBookSettingModel => {// 进行中 才可以提交
        console.log('<--accountBookSettingGet-->', accountBookSettingModel)
        if (accountBookSettingModel.status.value === AccountBookSettingStatusEnumModel.ValueEnum.InProgress) {
          this.isInProgress = false;
          this.finished = false;
        } else if (accountBookSettingModel.status.value === AccountBookSettingStatusEnumModel.ValueEnum.CarryForward) {
          this.isInProgress = true;
          this.finished = true;
        } else {
          this.isInProgress = true;
          this.finished = true;
        }
      },
      error => {
        console.error(error);
      }
    )
  }

  // 新建账户
  newAccount() {
    this.accountDetailsModal.show();
  }
  result(resultObj) {
    this.addAlert(resultObj);
    let accountId = resultObj.data.id;
    if (accountId) {
      this.router.navigate(['/app/reconcile/import', { id: accountId, where: 'assist' }]);
    }
  }
}