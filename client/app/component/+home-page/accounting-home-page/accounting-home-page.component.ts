import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { AccountApi } from '../../../api/accounting/api/AccountApi';
import { IndexApi } from '../../../api/accounting/api/IndexApi';
import { AccountBookSettingApi } from '../../../api/accounting/api/AccountBookSettingApi';
import { PostingApi } from '../../../api/accounting/api/PostingApi';
import { JournalEntryApi } from '../../../api/accounting/api/JournalEntryApi';
import { PostingModel } from '../../../api/accounting/model/PostingModel';

import { PubSubService, EventType } from '../../../service/pubsub.service';
import { Subscription } from 'rxjs/Subscription';

import { HomePageService } from '../shared/home-page.service';
import { AccountBalanceSheets } from '../shared/home-page.model';
import { ShareService } from '../../../service/core/share';
import { AccountPeriodModels } from '../../../service/core/extended-interface';
import { AuthorizationService } from '../../../service/core/authorization';

@Component({
    selector: 'accounting-home-page',
    templateUrl: 'accounting-home-page.component.html',
    styleUrls: ['./accounting-home-page.component.scss'],
    providers: [AccountBookSettingApi, PostingApi, JournalEntryApi],

})

export class AccountingHomePageComponent implements OnInit {
    @ViewChild('carryForwardModal') public carryForwardModal;
    @ViewChild('postingModal') public postingModal;
    @ViewChild('PostingCancelProvisionModal') public postingCancelProvisionModal;
    @ViewChild('againCarryForwardModal') public againCarryForwardModal;
    @ViewChild('modifyStockCashBalanceModal') public modifyStockCashBalanceModal;


    // 是否显示搜索
    isSearch: boolean = true;
    // 类型
    periodType: string = 'Month';
    // title数据
    amountModel: Array<any>;
    // 是否显示列表
    isTableShow: boolean = false;
    // 年
    year: any = this.shareService.year;
    // 月
    month: any = this.shareService.month;
    // 默认月
    defaultMonth: any;
    // 默认年
    defaultYear: any;
    // 年列表
    yearsList: any;
    // 月列表
    monthsToList: any;
    // 科目余额表
    accountBalanceSheets: AccountBalanceSheets;
    // 科目余额表帐期
    // 结转
    carryForward: string = '结转';
    // 过账
    posting: string = '过账';
    // 是否第一笔账
    whetherFirst: boolean = true;
    // 账套状态
    accountStatus: any;

    accountPeriodModel: AccountPeriodModels;
    subscription: Subscription;


    // alert
    alert = {};

    public alertSuccess(msg: string) {
        this.clearAlert();
        setTimeout(() => {
            this.alert = { type: 'success', msg: msg };
        }, 0);
    }

    public alertDanger(msg: string) {
        this.clearAlert();
        setTimeout(() => {
            this.alert = { type: 'danger', msg: msg };
        }, 0);
    }

    public addAlert(alert: Object): void {
        this.clearAlert();
        setTimeout(() => {
            this.alert = alert;
        }, 0);
    }

    public clearAlert(): void {
        this.alert = {};
    }

    //   alert
    constructor(private accountApi: AccountApi, private homePageService: HomePageService,
        private accountBookSettingApi: AccountBookSettingApi, private journalEntryApi: JournalEntryApi,
        private shareService: ShareService, private indexApi: IndexApi, private router: Router,
        private activatedRoute: ActivatedRoute,
        private postingApi: PostingApi, private authorizationService: AuthorizationService, private pubSubService: PubSubService) {
        this.accountPeriodModel = this.shareService.accountPeriodModel;
    }

    ngOnInit() {
        this.accountAccountPeriod();
        this.getHomePageData();
        this.accountBookSettingGet();
        this.initOnCompanyChange();
    }

    initOnCompanyChange() {
        if (this.pubSubService.pub$.subscribe) {
            this.subscription = this.pubSubService.pub$.subscribe(event => {
                // 切换账套
                if (event.type === EventType.SwitchHomePageAccount) {
                    this.switch();
                    console.count('监听次数：');

                }
            });
        }
    }

    switch() {
        this.accountAccountPeriod();
        this.getHomePageData();
        this.accountBookSettingGet();

    }

    // time
    setTheMonth(e) {
        this.month = e.text;
        this.accountGet();
    }

    setTheYear(e?) {
        console.log(e);
        this.year = e.text;
        this.shareService.getMonthsToList(this.year).then(
            accountPeriodModel => {
                console.log(accountPeriodModel);
                this.accountPeriodModel = accountPeriodModel;
                this.UpdatePeriod(this.accountPeriodModel, true);

            }
        );
    }

    /**
     * 获取当前账套配置信息
     */

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
    accountBookSettingGet(is?) {
        this.accountBookSettingApi.accountBookSettingGet().subscribe(
            accountBookSettingModel => {
                const token = this.authorizationService.getSession();
                // 是不是第一笔账期
                if (accountBookSettingModel.accountBook.openingDate === accountBookSettingModel.accountBook.currentDate) {
                    this.whetherFirst = true;
                } else {
                    this.whetherFirst = false;
                }
                this.accountStatus = accountBookSettingModel.status.value;
                if (token && token.currentAccount && token.currentAccount.status) {
                    token.currentAccount.status = this.accountStatus;
                    this.authorizationService.setSession(token);
                }

                switch (this.accountStatus) {
                    // 未设置期初账
                    case 'BeginningInit':
                        console.log('期初设置  未设置期初账');
                        this.router.navigate(['/app/company-list']);
                        break;
                    // 进行中 尚未结转
                    case 'InProgress':
                        console.log('进行中 尚未结转');
                        this.carryForward = '结转';
                        break;

                    // 待结转 未过账
                    case 'CarryForward':
                        console.log(' 待结转 未过账');
                        this.carryForward = '结转';
                        break;
                    // 已经结转 未过账
                    case 'Posting':
                        console.log('待过账  已经结转 未过账');
                        this.carryForward = '再次结转';
                        break;
                    // 完成结转 过账
                    case 'Done':
                        console.log('完成了');
                        break;
                    // 233 炸了
                    default:
                        console.error('状态炸了');
                        break;
                }
                if (is) {
                    this.go();
                }
            },
            error => {
                console.error(error);
            }
        );
    }

    // 结转modal
    showcarryForwardModal() {
        this.carryForwardModal.show();
    }

    // 过账modal
    showpostingModal() {
        this.postingModal.show();
    }

    // 驳回modal
    showPostingCancelProvisionModal() {
        this.postingCancelProvisionModal.show();
    }

    // 去结转
    toCarryForward() {
        this.postingApi.postingCarryForward().subscribe(
            boolResultModel => {
                this.showcarryForwardModal();
                this.ngOnInit();
                console.log(boolResultModel);
            },
            error => {
                this.alertDanger(error);
                console.error(error);
            }
        );
    }

    // 去过张
    toPosting() {
        const token = this.authorizationService.getSession();
        const accountbookId = this.authorizationService.Session.currentAccount.id;
        this.postingApi.postingPosting(accountbookId).subscribe(
            postingModel => {
                if (postingModel.postingStatus === PostingModel.PostingStatusEnum.Success) {
                    token.currentAccount.status = 'InProgress';
                    this.authorizationService.setSession(token);
                    this.alertSuccess('成功过账');
                    this.pubSubService.publish({
                        type: EventType.SwitchAccount,
                        data: ''
                    });
                    this.accountBookSettingGet(true);
                } else {
                    this.alertDanger(postingModel.message);
                }
                this.ngOnInit();
            },
            error => {
                this.alertDanger(error);
            }
        );
    }

    // 反过账
    postingRollback() {
        const accountbookId = this.authorizationService.Session.currentAccount.id;
        this.postingApi.postingRollback(accountbookId).subscribe(
            postingModel => {
                this.ngOnInit();
                this.alertSuccess('成功反过账');
                this.pubSubService.publish({
                    type: EventType.Rollback,
                    data: ''
                });
            },
            error => {
                this.alertDanger(error);
            }
        );
    }

    // 驳回审核
    postingCancelProvision() {
        const token = this.authorizationService.getSession();
        this.postingApi.postingCancelProvision().subscribe(
            boolResultModel => {

                if (boolResultModel.value === true) {
                    token.currentAccount.status = 'InProgress';
                    this.authorizationService.setSession(token);
                    this.pubSubService.publish({
                        type: EventType.SwitchAccount,
                        data: ''
                    });
                    this.alertSuccess('成功驳回');
                    this.go();

                } else {
                    this.alertDanger('驳回失败');
                }
                this.ngOnInit();

            },
            error => {
                this.alertDanger(error);
            }
        );
    }

    // 再次结转
    againCarryForward() {
        this.againCarryForwardModal.show();
    }

    // 整理编号并结转
    journalEntryOrder() {
        this.journalEntryApi.journalEntryOrder(this.year, this.month).subscribe(
            boolResultModel => {
                this.toCarryForward();
            },
            error => {
            }
        );
    }

    // 修改库存现金余额
    toModifyStockCashBalanceModal() {
        if (this.accountStatus === 'InProgress') {
            this.modifyStockCashBalanceModal.show(this.amountModel[5].totalAmount);

        } else {
            this.alertDanger('结转状态不能进行该操作！');
        }
    }


    /**
     *
     *
     * 查询余额表
     * @memberof AccountingHomePageComponent
     */
    accountGet() {
        // tslint:disable-next-line:no-console
        console.time('获取余额表 用时');
        this.homePageService.accountGet(this.year, this.month, this.periodType)
            .then(
            accountBalanceSheets => {
                // tslint:disable-next-line:no-console
                console.timeEnd('获取余额表 用时');
                if (accountBalanceSheets) {
                    const temp: any = accountBalanceSheets;
                    console.log(accountBalanceSheets);
                    this.accountBalanceSheets = temp;
                    if (temp.isAllZero) {
                        this.isTableShow = true;
                    } else {
                        this.isTableShow = false;

                    }
                } else {
                    this.isTableShow = true;
                }
                console.log(accountBalanceSheets);
            }
            )
            .catch(
            error => {

                console.error(error);
            }
            );
    }

    /**
     *
     *  科目余额表时间
     *
     * @memberof AccountingHomePageComponent
     */
    accountAccountPeriod() {
        this.shareService.accountAccountPeriod().then(
            accountPeriodModel => {
                console.log(accountPeriodModel);
                if (accountPeriodModel) {
                    this.UpdatePeriod(accountPeriodModel);
                }

            },
            error => {
                console.log(error);
            }
        );
    }

    // 更新时间
    UpdatePeriod(accountPeriodModel, setYear?) {

        this.accountPeriodModel = accountPeriodModel;
        this.yearsList = this.accountPeriodModel.YearList;
        this.monthsToList = this.accountPeriodModel.MonthsToList;
        if (setYear) {
            this.month = this.monthsToList[0].text;
            this.defaultMonth = [{ id: this.month, text: this.month }];
            this.defaultYear = [{ id: this.year, text: this.year }];
        } else {
            this.updateDefaultPeriod();
        }
        this.accountGet();

    }

    updateDefaultPeriod() {
        this.year = this.accountPeriodModel.currentYear;
        this.month = this.accountPeriodModel.currentMonth;
        this.defaultYear = [{ id: this.year, text: this.year }];
        this.defaultMonth = [{ id: this.month, text: this.month }];
    }

    /**
     *
     * 查询首页数据
     *
     * @memberof AccountingHomePageComponent
     */
    getHomePageData() {
        this.indexApi.indexGet().subscribe(
            amountModel => {
                this.amountModel = amountModel;
            }, error => {
                console.error(error);
            }
        );
    }

    // 清空
    // empty() {
    // 	this.periodType = 'Month';
    // 	this.accountAccountPeriod();
    // }

    go() {
        const token = this.authorizationService.getSession();
        if (token && token.user) {
            if (token.user.currentRole && token.user.currentRole.indexOf('Account') > -1 &&
                token.user.currentRole.indexOf('Assistant') > -1) {
                if (token.currentAccount && token.currentAccount.status === 'InProgress') {
                    this.router.navigate(['/app/home-page/assist']);
                } else {
                    this.router.navigate(['/app/home-page/accounting']);
                }
            } else if (token.user.currentRole && token.user.currentRole.indexOf('Account') > -1) {
                this.router.navigate(['/app/home-page/accounting']);
            } else {
                this.router.navigate(['/app/home-page/assist']);
            }

        }

    }

}
