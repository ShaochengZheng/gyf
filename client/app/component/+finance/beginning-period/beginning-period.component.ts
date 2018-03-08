import { Component, OnInit, ViewChild } from '@angular/core';
// import { ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { PubSubService, EventType } from '../../../service/pubsub.service';
import { Subscription } from 'rxjs/Subscription';

import { AccountApi } from '../../../api/accounting/api/AccountApi';
import { AccountBookApi } from '../../../api/accounting/api/AccountBookApi';
import { FixedAssetApi } from '../../../api/accounting/api/FixedAssetApi';
import { UtilityService } from '../../../service/core/utility';
import { StorageService } from '../../../service/core/storage';
import { AccountModel } from '../../../api/accounting/model/AccountModel';
import { AuthorizationService } from '../../../service/core/authorization';
import { AccountBookBeginningNavigationEnumModel } from '../../../api/accounting/model/AccountBookBeginningNavigationEnumModel';
import { ConfirmWidget, ConfirmEventTypeEnum } from '../../widget/confirm/confirm';

import { BPAddBankAccountComponent } from '../modal/bp-addBankAccount/bp-addBankAccount.component';
import { BPAssetsComponent } from '../modal/bp-assets/bp-assets.component';
import { BPContactsComponent } from '../modal/bp-contacts/bp-contacts.component';
import { BPShareholderComponent } from '../modal/bp-shareholder/bp-shareholder.component';


import * as _ from 'lodash';
import * as moment from 'moment';
declare var $: any;


@Component({
    selector: 'beginning-period',
    templateUrl: 'beginning-period.component.html',
    styleUrls: ['beginning-period.component.scss'],
    providers: [AccountApi, AccountBookApi, FixedAssetApi],
    // changeDetection: ChangeDetectionStrategy.OnPush
})

export class BeginningPeriodComponent implements OnInit {
    @ViewChild('bPAddBankAccount') public bPAddBankAccount;
    @ViewChild('bPAssets') public bPAssets;
    // @ViewChild('bPAR') public bPAR;
    @ViewChild('bPShareholder') public bPShareholder;
    @ViewChild('bPContacts') public bPContacts;
    @ViewChild('isSecondLoad') public isSecondLoad: ConfirmWidget;
    @ViewChild('dateError') public dateError: ConfirmWidget;
    @ViewChild('fixedValidaterError') public fixedValidaterError: ConfirmWidget;

    // 试算平衡 期初金额借贷
    bpAmountBorrow: any = 0;
    bpAmountLoan: any = 0;
    // 试算平衡 本期金额借贷
    periodAmountBorrow: any = 0;
    periodAmountLoan: any = 0;
    // 试算平衡 期初金额借贷
    periodEndAmountBorrow: any = 0;
    periodEndAmountLoan: any = 0;

    inputTempVal: any; // 保存输入框中的变量
    accountBookId: any; // 账套ID
    isEnableBP: any = false; // 是否启用期初账
    flag: boolean = false;

    // 是否可编辑
    isEdit = false;

    // 账本启用时间 年月
    yearList: Array<Object> = [{ id: '1', text: '2015' }, { id: '2', text: '2016' }, { id: '3', text: '2017' }];
    monthList: Array<Object> = [{ id: '1', text: '1' }, { id: '2', text: '2' }, { id: '3', text: '3' }];

    // 修改账套启用日期
    modifyYear: any;
    modifyMonth: any;
    tempDate: any;
    enableTime: any;

    // dataList: AccountModels[];
    dataList: any = [];
    inputId: any;
    isPosting: boolean = false; // 是否过账
    subscription: Subscription;

    alert = {}; // 弹出提示框

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
        this.alert = alert;
    }

    public clearAlert(): void {
        this.alert = {};
    }


    constructor(private activeRoute: ActivatedRoute, private router: Router, private accountApi: AccountApi,
        private utilityService: UtilityService, private accountBookApi: AccountBookApi, private fixedAssetApi: FixedAssetApi,
        private storageService: StorageService, private authorizationService: AuthorizationService,
        private pubSubService: PubSubService) {
        if (this.storageService.getToken()) {
            this.accountBookId = this.storageService.getToken().currentAccount.id;
        }
    }

    ngOnInit() {
        this.getSubjects();
        this.getAccountPeriod();
        if (this.activeRoute.snapshot.params['msg']) {
            this.alertSuccess(this.activeRoute.snapshot.params['msg']);
        }
        this.initOnCompanyChange();
    }

    initOnCompanyChange() {
        if (this.pubSubService.pub$.subscribe) {
            this.subscription = this.pubSubService.pub$.subscribe(event => {
                // 切换账套
                if (event.type === EventType.SwitchBeginningPeriod) {
                    this.serch();
                }
            });
        }
    }
    // 在navbar上切换公司时，刷新期初账数据
    serch() {
        this.getSubjects();
        this.getAccountPeriod();
        if (this.activeRoute.snapshot.params['msg']) {
            this.alertSuccess(this.activeRoute.snapshot.params['msg']);
        }
    }

    // 查询科目编码和科目名称
    getSubjects() {
        this.bpAmountBorrow = 0;
        this.bpAmountLoan = 0;
        this.periodAmountBorrow = 0;
        this.periodAmountLoan = 0;
        this.periodEndAmountBorrow = 0;
        this.periodEndAmountLoan = 0;
        this.accountApi.accountGet()
            .subscribe(
            accountModel => {
                console.log('======>>>>', JSON.stringify(accountModel.length));
                this.dataList = accountModel;
                if (this.dataList) {
                    _.forEach(this.dataList, item => {
                        item.tabindex = -1;
                        if (item.code.slice(0, 1) === '5') {
                            item.isProfitLoss = true;
                        }
                    });
                    this.trialBalance();
                }
                this.isBalance();
            },
            (error) => {
                console.log(error);
            });
    }

    // 期初导入
    go() {
        let isLoad = false;
        for (let i = 0; i < this.dataList.length; i++) {
            if (this.dataList[i].periodInitialDebit !== 0 || this.dataList[i].periodInitialCredit !== 0 ||
                this.dataList[i].debit !== 0 || this.dataList[i].credit !== 0 ||
                this.dataList[i].periodEndDebit !== 0 || this.dataList[i].periodEndCredit !== 0) {
                isLoad = true;
                break;
            }
        }
        if (isLoad) {
            this.isSecondLoad.title = '警告';
            this.isSecondLoad.message = '您已经为部分科目输入了余额。如果您继续，该信息将会丢失!';
            this.isSecondLoad.confirmText = '继续导入';
            this.isSecondLoad.show();
        } else {
            this.router.navigate(['app/finance/import']);
        }
        // this.router.navigate(['app/finance/import']);
    }

    // 继续导入
    continueLoad(event) {
        if (event === ConfirmEventTypeEnum.Confirm) {
            // for (let i = 0; i < this.dataList.length; i++) {
            //     this.dataList[i].periodInitialDebit = 0;
            //     this.dataList[i].periodInitialCredit = 0;
            //     this.dataList[i].debit = 0;
            //     this.dataList[i].credit = 0;
            //     this.dataList[i].periodEndDebit = 0;
            //     this.dataList[i].periodEndCredit = 0;
            // }
            // this.accountApi.accountBatch(this.dataList)
            //     .subscribe(
            //     accountModel => {
            //         this.router.navigate(['app/finance/import']);
            //     },
            //     (error) => {
            //         this.alertDanger(error);
            //     });
            this.accountBookApi.accountBookReset()
                .subscribe(
                boolResultModel => {
                    this.router.navigate(['app/finance/import']);
                },
                (error) => {
                    this.alertDanger(error);
                });
        }
    }

    // 获取期初年月
    getAccountPeriod() {
        this.accountBookApi.accountBookGet_1(this.accountBookId)
            .subscribe(
            accountBookModel => {
                const currentDate = accountBookModel.currentDate;
                this.tempDate = accountBookModel.openingDate;
                this.enableTime = this.tempDate.toString().substr(0, 7);
                this.modifyYear = this.tempDate.split('-')[0];
                this.modifyMonth = this.tempDate.split('-')[1];
                if (accountBookModel.beginningNavigation.value === AccountBookBeginningNavigationEnumModel.ValueEnum.Enabled) {
                    this.isEnableBP = true;
                }
                if (this.enableTime !== currentDate.toString().substr(0, 7)) {
                    this.isPosting = true;
                }
                // this.defaultYear = [{ id: '1', text: this.tempDate.split('-')[0] }];
                // this.defaultMonth = [{ id: '2', text: this.tempDate.split('-')[1] }];
                // console.log('账套======>>>>', JSON.stringify(accountBookModel));
            },
            (error) => {
                console.log(error);
            });
    }

    // 展开科目的子集
    expansion(item) {
        item.isExpansion = !item.isExpansion;
        const list: any = this.dataList;
        _.forEach(list, listItem => {
            if (listItem.code.indexOf(item.code) === 0 && listItem.code !== item.code) {
                listItem.show = item.isExpansion ? true : false;
                if (listItem.hasChildren) {
                    listItem.isExpansion = false;
                }
            }
        });
    }

    // 跟踪ngFor中item
    trackByFn(index: number, item) {
        return index;
    }

    oldVal(e) {
        e.target.value = e.target.value.replace(/,/g, '');
        e.target.value = e.target.value.replace(/￥/, '');
        // console.log('oldVal===>>>', e.target.value, parseFloat(e.target.value), isNaN(parseFloat(e.target.value)));
        if (e.target.value === '-' || e.target.value === '0' || e.target.value === '0.00' || isNaN(parseFloat(e.target.value))) {
            e.target.value = '';
        }
        this.inputTempVal = (((parseFloat(e.target.value) || 0) * 100) / 100).toFixed(2);
    }

    // 根据input框输入的值计算相关数值
    caculateSum(code, item, index, e) {
        // let re = /^(\d*\.)?\d+$/;
        const re = /^[-]?((\d+)|(\d+\.\d+))$/;
        const isRe = re.test(e.target.value);
        if (isNaN(parseFloat(e.target.value)) || !isRe) {
            e.target.value = '';
        }
        // index中，1、2分别代表本年期初金额借、贷；3、4分别代表本年累计金额借、贷
        const balanceDirection = item.balanceDirection.value; // 余额方向
        let codeLength: any;
        let fatherCodeNum: any;
        let fatherCodeIndex: any;
        let tempIndex: any;
        let levels: any;
        if (code) {
            codeLength = code.length;
            if (codeLength >= 4) {
                fatherCodeNum = code.substring(0, codeLength - 2);
                fatherCodeIndex = this.dataList.findIndex((value) => value.code === fatherCodeNum);
                tempIndex = this.dataList.findIndex((value) => value.code === fatherCodeNum);
                levels = item.level;
                // console.log(codeLength, fatherCodeNum, levels);
                // console.log('before====>', fatherCodeIndex, tempIndex);
                switch (index) {
                    case 1:
                        item.periodInitialDebit = (((parseFloat(e.target.value) || 0) * 100) / 100).toFixed(2);
                        for (let i = 0; i < levels - 1; i++) {
                            if (this.dataList[fatherCodeIndex].parentAccount.id) {
                                this.dataList[fatherCodeIndex].periodInitialDebit =
                                    ((this.dataList[fatherCodeIndex].periodInitialDebit || 0) * 100 +
                                        (item.periodInitialDebit - this.inputTempVal || 0) * 100) / 100;
                                this.calculateBPBalance(fatherCodeIndex, balanceDirection);
                                fatherCodeIndex = this.dataList.findIndex((value) =>
                                    value.id === this.dataList[fatherCodeIndex].parentAccount.id);
                            } else {
                                this.dataList[fatherCodeIndex].periodInitialDebit =
                                    ((this.dataList[fatherCodeIndex].periodInitialDebit || 0) * 100 +
                                        (item.periodInitialDebit - this.inputTempVal || 0) * 100) / 100;
                                this.calculateBPBalance(fatherCodeIndex, balanceDirection);
                            }
                        }
                        break;
                    case 2:
                        item.periodInitialCredit = (((parseFloat(e.target.value) || 0) * 100) / 100).toFixed(2);
                        for (let i = 0; i < levels - 1; i++) {
                            if (this.dataList[fatherCodeIndex].parentAccount.id) {
                                this.dataList[fatherCodeIndex].periodInitialCredit =
                                    ((this.dataList[fatherCodeIndex].periodInitialCredit || 0) * 100 +
                                        (item.periodInitialCredit - this.inputTempVal || 0) * 100) / 100;
                                this.calculateBPBalance(fatherCodeIndex, balanceDirection);
                                fatherCodeIndex = this.dataList.findIndex((value) =>
                                    value.id === this.dataList[fatherCodeIndex].parentAccount.id);
                            } else {
                                this.dataList[fatherCodeIndex].periodInitialCredit =
                                    ((this.dataList[fatherCodeIndex].periodInitialCredit || 0) * 100 +
                                        (item.periodInitialCredit - this.inputTempVal || 0) * 100) / 100;
                                this.calculateBPBalance(fatherCodeIndex, balanceDirection);
                            }
                        }
                        break;
                    case 3:
                        item.debit = (((parseFloat(e.target.value) || 0) * 100) / 100).toFixed(2);
                        for (let i = 0; i < levels - 1; i++) {
                            if (this.dataList[fatherCodeIndex].parentAccount.id) {
                                this.dataList[fatherCodeIndex].debit =
                                    ((this.dataList[fatherCodeIndex].debit || 0) * 100 + (item.debit - this.inputTempVal || 0) * 100) / 100;
                                this.calculateBPBalance(fatherCodeIndex, balanceDirection);
                                fatherCodeIndex = this.dataList.findIndex((value) =>
                                    value.id === this.dataList[fatherCodeIndex].parentAccount.id);
                            } else {
                                this.dataList[fatherCodeIndex].debit =
                                    ((this.dataList[fatherCodeIndex].debit || 0) * 100 + (item.debit - this.inputTempVal || 0) * 100) / 100;
                                this.calculateBPBalance(fatherCodeIndex, balanceDirection);
                            }
                        }
                        if (item.isProfitLoss) {
                            item.credit = item.debit;
                            // console.log('after====>', fatherCodeIndex, tempIndex);
                            for (let i = 0; i < levels - 1; i++) {
                                if (this.dataList[tempIndex].parentAccount.id) {
                                    this.dataList[tempIndex].credit =
                                        ((this.dataList[tempIndex].credit || 0) * 100 + (item.credit - this.inputTempVal || 0) * 100) / 100;
                                    this.calculateBPBalance(tempIndex, balanceDirection);
                                    tempIndex = this.dataList.findIndex((value) =>
                                        value.id === this.dataList[tempIndex].parentAccount.id);
                                } else {
                                    this.dataList[tempIndex].credit =
                                        ((this.dataList[tempIndex].credit || 0) * 100 + (item.credit - this.inputTempVal || 0) * 100) / 100;
                                    this.calculateBPBalance(tempIndex, balanceDirection);
                                }
                            }
                        }
                        break;
                    case 4:
                        item.credit = (((parseFloat(e.target.value) || 0) * 100) / 100).toFixed(2);
                        for (let i = 0; i < levels - 1; i++) {
                            if (this.dataList[fatherCodeIndex].parentAccount.id) {
                                this.dataList[fatherCodeIndex].credit =
                                    ((this.dataList[fatherCodeIndex].credit || 0) * 100
                                        + (item.credit - this.inputTempVal || 0) * 100) / 100;
                                this.calculateBPBalance(fatherCodeIndex, balanceDirection);
                                fatherCodeIndex = this.dataList.findIndex((value) =>
                                    value.id === this.dataList[fatherCodeIndex].parentAccount.id);
                            } else {
                                this.dataList[fatherCodeIndex].credit =
                                    ((this.dataList[fatherCodeIndex].credit || 0) * 100 +
                                        (item.credit - this.inputTempVal || 0) * 100) / 100;
                                this.calculateBPBalance(fatherCodeIndex, balanceDirection);
                            }
                        }
                        if (item.isProfitLoss) {
                            item.debit = item.credit;
                            for (let i = 0; i < levels - 1; i++) {
                                if (this.dataList[tempIndex].parentAccount.id) {
                                    this.dataList[tempIndex].debit =
                                        ((this.dataList[tempIndex].debit || 0) * 100 + (item.debit - this.inputTempVal || 0) * 100) / 100;
                                    this.calculateBPBalance(tempIndex, balanceDirection);
                                    tempIndex = this.dataList.findIndex((value) =>
                                        value.id === this.dataList[tempIndex].parentAccount.id);
                                } else {
                                    this.dataList[tempIndex].debit =
                                        ((this.dataList[tempIndex].debit || 0) * 100 + (item.debit - this.inputTempVal || 0) * 100) / 100;
                                    this.calculateBPBalance(tempIndex, balanceDirection);
                                }
                            }
                        }
                        break;
                    default:
                        break;
                }
            }
            if (balanceDirection === 'Debit') {
                item.periodEndDebit = ((item.periodInitialDebit || 0) * 100 + (item.debit || 0) * 100 - (item.credit || 0) * 100) / 100;
            } else if (balanceDirection === 'Credit') {
                item.periodEndCredit = ((item.periodInitialCredit || 0) * 100 + (item.credit || 0) * 100 - (item.debit || 0) * 100) / 100;
            }
        }
        this.bpAmountBorrow = 0;
        this.bpAmountLoan = 0;
        this.periodAmountBorrow = 0;
        this.periodAmountLoan = 0;
        this.periodEndAmountBorrow = 0;
        this.periodEndAmountLoan = 0;
        this.trialBalance();
        if (isRe && e.target.value !== '0.00') {
            e.target.value = this.formatMoney(e.target.value);
        } else {
            e.target.value = '0.00';
        }
        switch (index) {
            case 1:
                item.isPDebit = false;
                break;
            case 2:
                item.isPCredit = false;
                break;
            case 3:
                item.isDebit = false;
                break;
            case 4:
                item.isCredit = false;
                break;
            default:
                break;
        }
    }

    // 计算期初余额
    calculateBPBalance(index, balanceDirection) {
        if (balanceDirection === 'Debit') {
            this.dataList[index].periodEndDebit =
                ((this.dataList[index].periodInitialDebit || 0) * 100 +
                    (this.dataList[index].debit || 0) * 100 - (this.dataList[index].credit || 0) * 100) / 100;
        } else if (balanceDirection === 'Credit') {
            this.dataList[index].periodEndCredit =
                ((this.dataList[index].periodInitialCredit || 0) * 100 +
                    (this.dataList[index].credit || 0) * 100 - (this.dataList[index].debit || 0) * 100) / 100;
        }
    }

    // 计算试算平衡
    trialBalance() {
        _.forEach(this.dataList, (item) => {
            if (!item.hasChildren) {
                this.bpAmountBorrow = (((parseFloat(this.bpAmountBorrow) || 0) * 100 +
                    (item.periodInitialDebit || 0) * 100) / 100).toFixed(2);
                this.bpAmountLoan = (((parseFloat(this.bpAmountLoan) || 0) * 100 + (item.periodInitialCredit || 0) * 100) / 100).toFixed(2);
                this.periodAmountBorrow = (((parseFloat(this.periodAmountBorrow) || 0) * 100 + (item.debit || 0) * 100) / 100).toFixed(2);
                this.periodAmountLoan = (((parseFloat(this.periodAmountLoan) || 0) * 100 + (item.credit || 0) * 100) / 100).toFixed(2);
                this.periodEndAmountBorrow = (((parseFloat(this.periodEndAmountBorrow) || 0) * 100 +
                    (item.periodEndDebit || 0) * 100) / 100).toFixed(2);
                this.periodEndAmountLoan = (((parseFloat(this.periodEndAmountLoan) || 0) * 100 +
                    (item.periodEndCredit || 0) * 100) / 100).toFixed(2);
            }
        });
    }

    // 打开删除分配的modal
    openAssignModal(item) {
        this.clearAlert();
        switch (item.accountAssignType.value) {
            case 'BankAccount': case 'Alipay': case 'WeChat':
                this.bPAddBankAccount.show(item, this.tempDate, this.isPosting);
                break;
            case 'Receivable': case 'Payable': case 'OtherReceivable': case 'OtherPayable':
                this.bPContacts.show(item, this.isPosting);
                break;
            case 'FixedAssets': case 'IntangibleAssets':
                this.bPAssets.show(item, this.isPosting, this.isEnableBP);
                break;
            case 'Shareholder':
                this.bPShareholder.show(item, this.tempDate, this.isPosting);
                break;
            default:
                break;
        }
    }

    // 编辑
    edit() {
        this.isEdit = true;
        _.forEach(this.dataList, item => {
            if (!item.hasChildren) {
                item.tabindex = 0;
            }
        });
    }

    // 保存
    save() {
        this.isEdit = false;
        _.forEach(this.dataList, item => {
            if (!item.hasChildren) {
                item.tabindex = -1;
            }
        });
        if (!this.isEnableBP) {
            // 没有启用期初账
            this.accountBookApi.accountBookPutOpeningDate(this.modifyYear, this.modifyMonth)
                .subscribe(
                boolResultModel => {
                    this.batchSubject(this.dataList);
                },
                (error) => {
                    this.alertDanger(error);
                    this.enableTime = this.tempDate.toString().substr(0, 7);
                    this.modifyYear = this.tempDate.split('-')[0];
                    this.modifyMonth = this.tempDate.split('-')[1];
                });
        } else {
            // 启用期初账后
            this.accountApi.accountBatch(this.dataList)
                .subscribe(
                accountModel => {
                    this.saveAfter();
                },
                (error) => {
                    this.alertDanger(error);
                });
        }

    }

    // 批量保存科目余额数据
    batchSubject(data) {
        this.accountApi.accountBatch(data)
            .subscribe(
            accountModel => {
                this.alertSuccess('保存成功');
            },
            (error) => {
                this.alertDanger(error);
            });
    }

    // 保存后调用启用期初账的API
    saveAfter() {
        let message: any = '';
        this.flag = false;
        this.accountBookApi.accountBookEnable()
            .subscribe(
            boolResultModel => {
                if (boolResultModel.fixedValidater.fixedDifference !== 0 &&
                    boolResultModel.fixedValidater.intangibleAssetsDifference !== 0) {
                    message = '对您的固定资产及无形资产进行测算，折旧金额与期初余额存在差异，将自动生成当期凭证一张，可去凭证列表查询。'
                        + '固定差额为：' + boolResultModel.fixedValidater.fixedDifference + '；'
                        + '无形差额为：' + boolResultModel.fixedValidater.intangibleAssetsDifference;
                    this.bpFixedAlert(message);
                } else if (boolResultModel.fixedValidater.fixedDifference !== 0) {
                    message = '对您的固定资产进行测算，折旧金额与期初余额存在差异，将自动生成当期凭证一张，可去凭证列表查询。'
                        + '固定差额为：' + boolResultModel.fixedValidater.fixedDifference;
                    this.bpFixedAlert(message);
                } else if (boolResultModel.fixedValidater.intangibleAssetsDifference !== 0) {
                    message = '对您的无形资产进行测算，折旧金额与期初余额存在差异，将自动生成当期凭证一张，可去凭证列表查询。'
                        + '无形差额为：' + boolResultModel.fixedValidater.intangibleAssetsDifference;
                    this.bpFixedAlert(message);
                }
                this.alertSuccess('保存成功');
                console.log('启用期初账后调用的Api===》》》', JSON.stringify(boolResultModel));
            },
            (error) => {
                this.alertDanger(error);
            });
    }

    // 启用期初账顺序，先比较日期，后调用启用期初账API
    enableBP() {
        let message: any = '';
        this.flag = false;
        this.fixedAssetApi.fixedAssetCheckBeginningDate(this.modifyYear, this.modifyMonth)
            .subscribe(
            boolResultModel => {
                // console.log('比较启用期初账日期===》》》', JSON.stringify(boolResultModel));
                if (boolResultModel.value) {
                    message = '抱歉，期初账启用不成功！原因：固定资产/无形资产日期与账套启用日期冲突。';
                    this.bpAlert(message);
                } else {
                    this.enableBP1();
                }
            },
            (error) => {
                this.alertDanger(error);
            });
    }

    enableBP1() {
        let message: any = '';
        _.forEach(this.dataList, item => {
            item.isAssign = '';
        });
        this.flag = false;
        this.accountBookApi.accountBookEnable()
            .subscribe(
            boolResultModel => {
                if (boolResultModel.trialBalance) {
                    let assignFlag = false;
                    const tempNoAssignList = [];
                    _.forEach(boolResultModel.apportionBalances, item => {
                        if (!item.apportionBalance) {
                            assignFlag = true;
                            tempNoAssignList.push(item.accountAssignType);
                        }
                    });
                    if (assignFlag) {
                        _.forEach(tempNoAssignList, item => {
                            const index = this.dataList.findIndex((value) => value.accountAssignType.value === item);
                            this.dataList[index].isAssign = item;
                        });
                        message = '抱歉，期初账启用不成功！原因：期初分配不平衡，已在页面中使用红框标注。';
                        this.bpAlert(message);
                        // this.alertDanger('期初账分配不平衡，红框标识为待分配科目');
                    } else {
                        if (boolResultModel.fixedValidater.fixedDifference !== 0 &&
                            boolResultModel.fixedValidater.intangibleAssetsDifference !== 0) {
                            message = '对您的固定资产及无形资产进行测算，折旧金额与期初余额存在差异，将自动生成当期凭证一张，可去凭证列表查询。'
                                + '固定差额为：' + boolResultModel.fixedValidater.fixedDifference + '；'
                                + '无形差额为：' + boolResultModel.fixedValidater.intangibleAssetsDifference;
                            this.bpFixedAlert(message);
                            this.flag = true;
                        } else if (boolResultModel.fixedValidater.fixedDifference !== 0) {
                            message = '对您的固定资产进行测算，折旧金额与期初余额存在差异，将自动生成当期凭证一张，可去凭证列表查询。'
                                + '固定差额为：' + boolResultModel.fixedValidater.fixedDifference;
                            this.bpFixedAlert(message);
                            this.flag = true;
                        } else if (boolResultModel.fixedValidater.intangibleAssetsDifference !== 0) {
                            message = '对您的无形资产进行测算，折旧金额与期初余额存在差异，将自动生成当期凭证一张，可去凭证列表查询。'
                                + '无形差额为：' + boolResultModel.fixedValidater.intangibleAssetsDifference;
                            this.bpFixedAlert(message);
                            this.flag = true;
                        } else {
                            // 更新token的期初账设置状态
                            const token = this.authorizationService.getSession();
                            if (token && token.currentAccount) {// 启用期初账后，状态改变了，本地存储也需要改变。
                                token.currentAccount.beginningNavigation.value = 'Enabled';
                                token.currentAccount.status = 'InProgress';
                                this.authorizationService.setSession(token);
                                this.authorizationService.getSession();
                                console.log('tokenbp', this.authorizationService.getSession());
                                const fiveAccounts: any = JSON.parse(localStorage.getItem('fiveCompanies'));
                                const index = _.findIndex(fiveAccounts,
                                    function (item: any) { return item.id === token.currentAccount.id; });
                                if (index >= 0) {
                                    fiveAccounts[index].status = 'InProgress';
                                    localStorage.setItem('fiveCompanies', JSON.stringify(fiveAccounts));
                                    const newFive = localStorage.getItem('fiveCompanies');
                                    console.log('newFive', newFive);
                                    this.pubSubService.publish({
                                        type: EventType.CurrentAccountUpdate,
                                        data: ''
                                    });
                                }
                                this.alertSuccess('启用期初账成功');
                                if (token.user.currentRole && token.user.currentRole.indexOf('Account') > -1 &&
                                    token.user.currentRole.indexOf('Assistant') > -1) {
                                    this.router.navigate(['app/home-page/assist']);
                                } else {
                                    this.router.navigate(['app/home-page/accounting']);
                                }
                            }
                        }
                    }
                } else {
                    message = '抱歉，期初账启用不成功！原因：期初账试算不平衡。';
                    this.bpAlert(message);
                }
            },
            (error) => {
                this.alertDanger(error);
            });
    }

    // 期初账提示
    bpAlert(message) {
        this.dateError.default = false;
        this.dateError.title = '启用期初账提示';
        this.dateError.message = message;
        this.dateError.show();
    }
    // 期初账固定/无形资产提示
    bpFixedAlert(message) {
        this.fixedValidaterError.confirmText = '自动生成';
        this.fixedValidaterError.cancelText = '手动生成';
        this.fixedValidaterError.title = '启用期初账提示';
        this.fixedValidaterError.message = message;
        this.fixedValidaterError.show();
    }

    // 启用固定资产报错，model框处理
    fixedValidaterErrorPrompt(event) {
        if (event === ConfirmEventTypeEnum.Confirm) {
            this.accountBookApi.accountBookEnable(true)
                .subscribe(
                boolResultModel => {
                    this.dateErrorPrompt();
                },
                (error) => {
                    this.alertDanger(error);
                });
        }
        // else if (event === ConfirmEventTypeEnum.Cancel) {

        // }
    }

    dateErrorPrompt() {
        if (this.flag) {
            // 更新token的期初账设置状态
            const token = this.authorizationService.getSession();
            if (token && token.currentAccount) {// 启用期初账后，状态改变了，本地存储也需要改变。
                token.currentAccount.beginningNavigation.value = 'Enabled';
                token.currentAccount.status = 'InProgress';
                this.authorizationService.setSession(token);
                this.authorizationService.getSession();
                console.log('tokenbp', this.authorizationService.getSession());
                const fiveAccounts: any = JSON.parse(localStorage.getItem('fiveCompanies'));
                const index = _.findIndex(fiveAccounts, function (item: any) { return item.id === token.currentAccount.id; });
                if (index >= 0) {
                    fiveAccounts[index].status = 'InProgress';
                    localStorage.setItem('fiveCompanies', JSON.stringify(fiveAccounts));
                    const newFive = localStorage.getItem('fiveCompanies');
                    console.log('newFive', newFive);
                    this.pubSubService.publish({
                        type: EventType.CurrentAccountUpdate,
                        data: ''
                    });
                }
                this.alertSuccess('启用期初账成功');
                if (token.user.currentRole && token.user.currentRole.indexOf('Account') > -1 &&
                    token.user.currentRole.indexOf('Assistant') > -1) {
                    this.router.navigate(['app/home-page/assist']);
                } else {
                    this.router.navigate(['app/home-page/accounting']);
                }
            }
        }
    }

    result(resultObj) {
        _.forEach(this.dataList, item => {
            item.isAssign = '';
        });
        this.isBalance();
        this.clearAlert();
        setTimeout(() => {
            this.addAlert(resultObj);
        }, 10);
    }

    // 货币格式化
    formatMoney(numbers, places?, thousand?, decimal?) {
        numbers = numbers || 0;
        places = !isNaN(places = Math.abs(places)) ? places : 2;
        thousand = thousand || ',';
        decimal = decimal || '.';
        let i: any;
        let j: any;
        const negative = numbers < 0 ? '-' : '';
        i = parseInt(numbers = Math.abs(+numbers || 0).toFixed(places), 10) + '';
        j = (j = i.length) > 3 ? j % 3 : 0;
        return negative + (j ? i.substr(0, j) + thousand : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thousand) +
            (places ? decimal + Math.abs(numbers - i).toFixed(places).slice(2) : '');
    }

    // span标签与input标签的切换
    inputSwitch(item, index) {
        if (this.isEdit && !item.hasChildren) {
            this.inputId = 'isClick';
            setTimeout(() => {
                $('#isClick').removeAttr('readonly');
                document.getElementById('isClick').focus();

            }, 10);
            switch (index) {
                case 1:
                    item.isPDebit = true;
                    if (item.periodInitialDebit === 0) {
                        item.periodInitialDebit = '';
                    }
                    break;
                case 2:
                    item.isPCredit = true;
                    if (item.periodInitialCredit === 0) {
                        item.periodInitialCredit = '';
                    }
                    break;
                case 3:
                    item.isDebit = true;
                    if (item.debit === 0) {
                        item.debit = '';
                    }
                    break;
                case 4:
                    item.isCredit = true;
                    if (item.credit === 0) {
                        item.credit = '';
                    }
                    break;
                default:
                    break;
            }
        }
    }

    // 判断分配是否平衡
    isBalance() {
        this.accountBookApi.accountBookApportionBalanceValidation()
            .subscribe(
            accountBookEnableResultModel => {
                const tempNoAssignList = [];
                _.forEach(accountBookEnableResultModel.apportionBalances, item => {
                    if (!item.apportionBalance) {
                        tempNoAssignList.push(item.accountAssignType);
                    }
                });
                if (tempNoAssignList.length > 0) {
                    _.forEach(tempNoAssignList, item => {
                        const index = this.dataList.findIndex((value) => value.accountAssignType.value === item);
                        this.dataList[index].isAssign = item;
                    });
                }
            },
            (error) => {
                this.alertDanger(error);
            });
    }

    selected(date) {
        this.modifyYear = moment(date).year();
        this.modifyMonth = moment(date).month() + 1;
    }

}


/**
 * 科目列表
 */
interface AccountModels extends AccountModel {
    isExpansion?: boolean;
    show?: boolean;
    isAssign?: string;
    isPDebit?: boolean;
    isPCredit?: boolean;
    isDebit?: boolean;
    isCredit?: boolean;
    tabindex?: number;
    isProfitLoss?: boolean; // 是否是损益科目
}
