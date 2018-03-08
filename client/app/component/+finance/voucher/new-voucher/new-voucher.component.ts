import { Component, OnInit, AfterViewInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

import { FinanceService } from '../../shared/finance.service';
import { AuthorizationService } from '../../../../service/core';

import { AccountPeriodModel } from '../../../../api/accounting/model/AccountPeriodModel';
import { ConfirmWidget, ConfirmEventTypeEnum } from '../../../widget/confirm/confirm';
import { CalculatorComponent } from '../../calculator/calculator';

import * as _ from 'lodash';
import * as moment from 'moment';

@Component({
    selector: 'new-voucher',
    templateUrl: 'new-voucher.component.html',
    styleUrls: ['./new-voucher.component.scss'],
    providers: [FinanceService]
})

export class NewVoucherComponent implements OnInit, AfterViewInit {
    @ViewChild('contactDetailsModal') public contactDetailsModal;
    @ViewChild('upload-attachments') public uploadNotes;
    @ViewChild('picturePreviewModal') public picturePreviewModal;
    @ViewChild('confirmWidget') public confirmWidget: ConfirmWidget;
    @ViewChild('cancelModal') public cancelModal: ConfirmWidget;
    @ViewChild('calculator') public calculator: CalculatorComponent;
    subjectsList: Array<Object> = [];
    contactsList: Array<Object> = [];
    voucherListModel = {
        accountedOn: '',
        journalEntryNumber: 0,
        description: '',
        attachmentCount: 0,
        user: {
            id: this.authorizationService.Session.user.id,
            name: this.authorizationService.Session.user.name
        },
        source: '',
        isAccountPosting: '',
        journalEntryLineItemModels: [
            {
                amount: 0,
                debitAmount: '', //
                debitAmountList: [], //
                creditAmount: '', //
                creditAmountList: [], //
                account: {
                    id: '',
                    name: ''
                },
                debitCreditType: '',
                summary: '',
                contact: [],
                subject: [],
                debitstatus: true, //
                creditstatus: true, //
                needAccountCode: false,
                needSummary: false //
            },
            {
                amount: 0,
                debitAmount: '',
                debitAmountList: [],
                creditAmount: '',
                creditAmountList: [],
                account: {
                    id: '',
                    name: ''
                },
                debitCreditType: '',
                summary: '',
                contact: [],
                subject: [],
                debitstatus: true,
                creditstatus: true,
                needAccountCode: false,
                needSummary: false
            }
        ],
        attachmentModels: []
    };
    voucherList: any = _.cloneDeep(this.voucherListModel);
    journalEntryLineItemModels = {
        amount: 0,
        debitAmount: '',
        debitAmountList: [],
        creditAmount: '',
        creditAmountList: [],
        account: {
            id: '',
            name: ''
        },
        debitCreditType: '',
        summary: '',
        contact: [],
        debitstatus: true,
        creditstatus: true,
        needAccountCode: false,
        needSummary: false
    };
    invaildDate: boolean = false;
    // 借记总额
    debitTotal: number = 0;
    // 贷记总额
    creditTotal: number = 0;
    lineIndex: number = 0;
    // 金额大写的字符串
    outputCharacters: string = '';
    outputCharactersStatus: boolean = false;
    // 弹出提示框
    alert = {};
    // 年份列表
    yearList = [];
    // 月份列表
    monthList = [];
    defaultYear = [];
    defaultMonth = [];
    accountPeriod: AccountPeriodModel = {
        currentMonth: 0,
        currentYear: 0,
        accountHistoryPeriods: [{
            year: 0,
            months: []
        }
        ]
    };
    // 上传附件临时储存
    dataList = [];
    // 上传附件类型
    type: string = 'image';
    // 上传附件地址
    upurl: string = '/api/v1/journal/upload';
    minDate: any = '';
    maxDate: any = '';
    constructor(private financeService: FinanceService, private authorizationService: AuthorizationService,
        private router: Router, private changRef: ChangeDetectorRef) {
    }
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

    public addAlert(alert: any): void {
        this.clearAlert();
        setTimeout(() => {
            this.alert = { type: alert.type, msg: alert.msg };
        }, 0);
    }

    public clearAlert(): void {
        this.alert = {};
    }

    ngOnInit() {
        this.getAllSubjects();
        this.getAllContact();
        this.accountAccountPeriod();
        this.blurCaculateSum();
    }
    ngAfterViewInit() {

    }
    newContact() {
        this.contactDetailsModal.show();
    }
    result(resultObj) {
        setTimeout(() => {
            this.addAlert(resultObj);
        }, 10);
    }
    // 新增联系人
    newItemAdded(data, type) {
        let obj = null;
        let name = data.name || data.accountName;
        if (data && data.id && name) {
            obj = [{ id: data.id, name: name }];
        }
        // tslint:disable-next-line:switch-default
        switch (type) {
            case 'contact':
                this.voucherList.journalEntryLineItemModels[this.lineIndex].contact = [{
                    id: obj[0].id,
                    text: obj[0].name
                }];
                this.contactsList.push({
                    id: obj[0].id,
                    text: obj[0].name
                });
                let temp = _.cloneDeep(this.voucherList.journalEntryLineItemModels);
                this.voucherList.journalEntryLineItemModels = temp;
                break;
        }
    }
    // 获取当前账期
    accountAccountPeriod() {
        this.financeService.getAccountPeriod()
            .then(
            accountPeriodModel => {
                this.accountPeriod = accountPeriodModel;
                this.defaultYear = [];
                this.defaultMonth = [];
                this.monthList = [];
                this.defaultYear.push({ id: '1', text: this.accountPeriod.currentYear.toString() });
                this.defaultMonth.push({ id: '1', text: this.accountPeriod.currentMonth.toString() });
                for (let i = 0; i < this.accountPeriod.accountHistoryPeriods.length; i++) {
                    for (let n = 0; n < this.accountPeriod.accountHistoryPeriods[i].months.length; n++) {
                        this.monthList.push({ id: n, text: this.accountPeriod.accountHistoryPeriods[i].months[n].toString() });
                    }
                }
                this.getVoucherNumber(this.accountPeriod.currentYear, this.accountPeriod.currentMonth);
                // this.minDate = new Date(this.accountPeriod.currentYear, this.accountPeriod.currentMonth - 1, 0);
                // this.maxDate = new Date(this.minDate.getTime() - minusDate).getDate();
                this.minDate = this.accountPeriod.currentYear + '-' + this.accountPeriod.currentMonth + '-1';
                let day = new Date(this.accountPeriod.currentYear, this.accountPeriod.currentMonth, 0);
                this.maxDate = this.accountPeriod.currentYear + '-' + this.accountPeriod.currentMonth + '-' + day.getDate();
                this.voucherList.accountedOn = moment(this.maxDate).format('L');
            }
            )
            .catch(
            error => {
                this.alertDanger(error);
            }
            );
    }
    // 下拉列表选择
    selected(e, type, i) {
        this.lineIndex = i;
        if (type === 'account') {
            if (e.id === '0000' || e.disabled === true) {
                this.voucherList.journalEntryLineItemModels[i].subject = null;
                this.changRef.detectChanges();
                return;
            } else {
                this.voucherList.journalEntryLineItemModels[i].account.id = e.id;
                this.voucherList.journalEntryLineItemModels[i].needAccountCode = false;
            }
        }
        if (type === 'contact') {
            if (e.id === 'contact') {
                this.voucherList.journalEntryLineItemModels[i].contact = null;
                this.changRef.detectChanges();
                this.newContact();
                return;
            } else {
                this.voucherList.journalEntryLineItemModels[i].contact = e;
            }

        }
    }
    // 求合计金额
    blurCaculateSum() {
        this.debitTotal = 0;
        this.creditTotal = 0;
        for (let i = 0; i < this.voucherList.journalEntryLineItemModels.length; i++) {
            this.debitTotal += Number(this.voucherList.journalEntryLineItemModels[i].debitAmount);
            this.creditTotal += Number(this.voucherList.journalEntryLineItemModels[i].creditAmount);
        }
        if (this.debitTotal === this.creditTotal) {
            this.outputCharactersStatus = false;
            this.convertCurrency();
        } else {
            this.outputCharactersStatus = true;
            this.outputCharacters = '借贷不平衡';
        }

    }
    // 金额转大写
    convertCurrency() {
        let maximumNumber = 99999999999.99;  // 最大值
        // 定义转移字符
        let CN_ZERO = '零';
        let CN_ONE = '壹';
        let CN_TWO = '贰';
        let CN_THREE = '叁';
        let CN_FOUR = '肆';
        let CN_FIVE = '伍';
        let CN_SIX = '陆';
        let CN_SEVEN = '柒';
        let CN_EIGHT = '捌';
        let CN_NINE = '玖';
        let CN_TEN = '拾';
        let CN_HUNDRED = '佰';
        let CN_THOUSAND = '仟';
        let CN_TEN_THOUSAND = '万';
        let CN_HUNDRED_MILLION = '亿';
        let CN_DOLLAR = '元';
        let CN_TEN_CENT = '角';
        let CN_CENT = '分';
        let CN_INTEGER = '整';
        let CN_MINUS = '负';
        // 初始化验证:
        let integral, decimal, parts, minunsPart;
        let digits, radices, bigRadices, decimals;
        let zeroCount;
        let i, p, d;
        let quotient, modulus;
		let amountString = this.debitTotal;
		amountString = Number(amountString.toString().replace(/,/g, ''));
		amountString = Number(amountString.toString().replace(/^0+/, ''));
		if (amountString > maximumNumber) {
			this.alertDanger('总金额过大，请拆分凭证');
			return;
		}
		 this.outputCharacters = '';
		 minunsPart = amountString.toString().split('-');
		 if (minunsPart.length > 1) {
            this.outputCharacters += CN_MINUS;
            amountString = Number((amountString.toString()).replace('-', '0'));
        }
		parts = amountString.toString().split('.');
		if (parts.length > 1) {
			integral = parts[0];
			decimal = parts[1];
			decimal = decimal.substr(0, 2);
		} else {
			integral = parts[0];
			decimal = '';
		}
        digits = new Array(CN_ZERO, CN_ONE, CN_TWO, CN_THREE, CN_FOUR, CN_FIVE, CN_SIX, CN_SEVEN, CN_EIGHT, CN_NINE);
        radices = new Array('', CN_TEN, CN_HUNDRED, CN_THOUSAND);
        bigRadices = new Array('', CN_TEN_THOUSAND, CN_HUNDRED_MILLION);
        decimals = new Array(CN_TEN_CENT, CN_CENT);
        if (Number(integral) > 0) {
            zeroCount = 0;
            for (i = 0; i < integral.length; i++) {
                p = integral.length - i - 1;
                d = integral.substr(i, 1);
                quotient = p / 4;
                modulus = p % 4;
                if (d === '0') {
                    zeroCount++;
                } else {
                    if (zeroCount > 0) {
                        this.outputCharacters += digits[0];
                    }
                    zeroCount = 0;
                    this.outputCharacters += digits[Number(d)] + radices[modulus];
                }
                if (modulus === 0 && zeroCount < 4) {
                    this.outputCharacters += bigRadices[quotient];
                }
            }
            this.outputCharacters += CN_DOLLAR;
        }
        // 包含小数部分处理逻辑
        if (decimal !== '') {
            for (i = 0; i < decimal.length; i++) {
                d = decimal.substr(i, 1);
                if (d !== '0') {
                    this.outputCharacters += digits[Number(d)] + decimals[i];
                }
            }
        }
        // 确认并返回最终的输出字符串
        if (this.outputCharacters === '') {
            this.outputCharacters = CN_ZERO + CN_DOLLAR;
        }
        if (decimal === '') {
            this.outputCharacters += CN_INTEGER;
        }
    }
    // 快捷键
    tab(e, type, i) {
        if (e.keyCode) {
            console.log(e.keyCode);
            if (i === this.voucherList.journalEntryLineItemModels.length - 1) {
                if (e.keyCode === 9) {
                    if (type === 'debit') {
                        if (this.voucherList.journalEntryLineItemModels[i].debitAmount.length > 0 &&
                            this.voucherList.journalEntryLineItemModels[i].creditAmount.length === 0) {
                            this.newItem();
                        }
                    } else {
                        if (this.voucherList.journalEntryLineItemModels[i].creditAmount.length > 0 &&
                            this.voucherList.journalEntryLineItemModels[i].debitAmount.length === 0) {
                            this.newItem();
                        }
                    }
                }
                if (e.keyCode === 13) {
                    this.changeStatus(type, i);
                    if (type === 'debit') {
                        if (this.voucherList.journalEntryLineItemModels[i].debitAmount.length > 0 &&
                            this.voucherList.journalEntryLineItemModels[i].creditAmount.length === 0) {
                            this.submit('');
                        }
                    } else {
                        if (this.voucherList.journalEntryLineItemModels[i].creditAmount.length > 0 &&
                            this.voucherList.journalEntryLineItemModels[i].debitAmount.length === 0) {
                            this.submit('');
                        }
                    }
                }
            };
            if (e.keyCode !== 9 && e.keyCode !== 13) {
                if (type === 'debit') {
                    if (this.voucherList.journalEntryLineItemModels[i].creditAmount.length > 0) {
                        this.voucherList.journalEntryLineItemModels[i].creditAmount = '';
                        this.voucherList.journalEntryLineItemModels[i].creditAmountList = [];
                    }
                }
                if (type === 'credit') {
                    if (this.voucherList.journalEntryLineItemModels[i].debitAmount.length > 0) {
                        this.voucherList.journalEntryLineItemModels[i].debitAmount = '';
                        this.voucherList.journalEntryLineItemModels[i].debitAmountList = [];
                    }
                }
            };
            if (e.keyCode === 187) {
                let balance = 0;
                if (type === 'debit') {
                    balance = this.creditTotal - this.debitTotal;
                    this.voucherList.journalEntryLineItemModels[i].debitAmount = 0;
                    this.voucherList.journalEntryLineItemModels[i].debitAmount = balance;
                }
                if (type === 'credit') {
                    balance = this.debitTotal - this.creditTotal;
                    this.voucherList.journalEntryLineItemModels[i].creditAmount = 0;
                    this.voucherList.journalEntryLineItemModels[i].creditAmount = balance;
                }
            };
        }
    }
    // 新增行
    newItem() {
        this.blurCaculateSum();
        let list = this.voucherList.journalEntryLineItemModels;
        list.push(_.cloneDeep(this.journalEntryLineItemModels));
        let seq = this.voucherList.journalEntryLineItemModels.length;
        if (Number(this.debitTotal) > Number(this.creditTotal)) {
            this.voucherList.journalEntryLineItemModels[seq - 1].creditAmount = this.debitTotal - this.creditTotal;
            this.changeStatus('credit', seq - 1);
        };
        if (Number(this.debitTotal) < Number(this.creditTotal)) {
            this.voucherList.journalEntryLineItemModels[seq - 1].debitAmount = this.creditTotal - this.debitTotal;
            this.changeStatus('debit', seq - 1);
        };
        for (let n = 1; n < this.voucherList.journalEntryLineItemModels.length; n++) {
            if (n === this.voucherList.journalEntryLineItemModels.length - 1) {
                this.voucherList.journalEntryLineItemModels[n].summary = this.voucherList.journalEntryLineItemModels[n - 1].summary;
            };
        }

    }
    // 删除行
    deleteItem(data, i) {
        let list = this.voucherList.journalEntryLineItemModels;
        if (list && list.length < 2) {
            this.newItem();
        } else {
            list.splice(i, 1);
        }
        this.blurCaculateSum();
    }
    // 改变状态
    changeType(type, i) {
        if (type === 'debit') {
            this.voucherList.journalEntryLineItemModels[i].debitstatus = false;
            setTimeout(() => {
                document.getElementById('debitAmount').focus();
            }, 200);
            // }

        }
        if (type === 'credit') {
            this.voucherList.journalEntryLineItemModels[i].creditstatus = false;
            setTimeout(() => {
                document.getElementById('creditAmount').focus();
            }, 200);
            // }
        }
    }
    // 格式转换
    transfer(amount) {
        let beforePoint;
        let afterPoint;
        let amountList = [];
        beforePoint = amount.toString().split('.')[0];
        afterPoint = amount.toString().split('.')[1];
        if (beforePoint.length <= 9) {
            for (let x = 0; x < 9 - beforePoint.length; x++) {
                amountList.push('');
            }
            for (let y = 0; y < beforePoint.length; y++) {
                amountList.push(beforePoint.charAt(y));
            }
            if (afterPoint === undefined) {
                if (beforePoint.length !== 0) {
                    amountList.push(0);
                    amountList.push(0);
                }
            } else {
                if (afterPoint.length === 1) {
                    amountList.push(afterPoint.charAt(0));
                    amountList.push(0);
                }
                if (afterPoint.length > 1) {
                    for (let n = 0; n < 2; n++) {
                        amountList.push(afterPoint.charAt(n));
                    }
                }
            }
            return amountList;
        } else {
            this.alertDanger('小数点前最多可输入9位数字');
            return false;
        }
    }
    // 改变状态
    changeStatus(type, i) {
        if (type === 'debit') {
            if (this.transfer(this.voucherList.journalEntryLineItemModels[i].debitAmount)) {
                if (this.voucherList.journalEntryLineItemModels[i].debitAmount !== 0 &&
                    this.voucherList.journalEntryLineItemModels[i].debitAmount !== '' &&
                    this.voucherList.journalEntryLineItemModels[i].debitAmount !== '0' &&
                    this.voucherList.journalEntryLineItemModels[i].debitAmount !== '0.00') {
                    this.voucherList.journalEntryLineItemModels[i].debitAmount =
                        (Number(this.voucherList.journalEntryLineItemModels[i].debitAmount).toFixed(2)).toString();
                    this.voucherList.journalEntryLineItemModels[i].debitAmountList =
                        this.transfer(this.voucherList.journalEntryLineItemModels[i].debitAmount);
                } else {
                    this.voucherList.journalEntryLineItemModels[i].debitAmount = '';
                    this.voucherList.journalEntryLineItemModels[i].debitAmountList = [];
                }
                this.voucherList.journalEntryLineItemModels[i].debitstatus = true;
            } else {
                return;
            }
        }
        if (type === 'credit') {
            console.log('12345678:' + this.voucherList.journalEntryLineItemModels[i].creditAmount);
            if (this.transfer(this.voucherList.journalEntryLineItemModels[i].creditAmount)) {
                if (this.voucherList.journalEntryLineItemModels[i].creditAmount !== 0 &&
                    this.voucherList.journalEntryLineItemModels[i].creditAmount !== '' &&
                    this.voucherList.journalEntryLineItemModels[i].creditAmount !== '0' &&
                    this.voucherList.journalEntryLineItemModels[i].creditAmount !== '0.00') {
                    this.voucherList.journalEntryLineItemModels[i].creditAmount =
                        (Number(this.voucherList.journalEntryLineItemModels[i].creditAmount).toFixed(2)).toString();
                    this.voucherList.journalEntryLineItemModels[i].creditAmountList =
                        this.transfer(this.voucherList.journalEntryLineItemModels[i].creditAmount);
                } else {
                    this.voucherList.journalEntryLineItemModels[i].creditAmount = '';
                    this.voucherList.journalEntryLineItemModels[i].creditAmountList = [];
                }
                this.voucherList.journalEntryLineItemModels[i].creditstatus = true;
            } else {
                return;
            }
        }
        this.blurCaculateSum();
    }
    // 获取所有的会计科目
    getAllSubjects() {
        this.financeService.getAllSubjects()
            .then(
            accountModel => {
                this.subjectsList = accountModel;
            }
            )
            .catch(
            error => {
                this.alertDanger(error);
            }
            );
    }
    // 获取所有联系人
    getAllContact() {
        this.financeService.getAllContacts()
            .then(
            contactModel => {
                console.log(JSON.stringify(contactModel));
                this.contactsList = contactModel;
            })
            .catch(
            error => {
                this.alertDanger(error);
            }
            );
    }
    // 获取凭证编号
    getVoucherNumber(year, month) {
        this.financeService.getVoucherNumber(year, month)
            .then(
            voucherModel => {
                this.voucherList.journalEntryNumber = voucherModel;
            })
            .catch(
            error => {
                this.alertDanger(error);
            }
            );
    }
    // 新增凭证
    addNewVoucher(model, type) {
        this.financeService.addNewVoucher(model)
            .then(
            data => {
                this.alertSuccess(data);
                if (type === 'add') {
                    let accountedOn = this.voucherList.accountedOn;
                    this.voucherList = {};
                    this.voucherList = _.cloneDeep(this.voucherListModel);
                    this.voucherList.accountedOn = accountedOn;
                    this.dataList = [];
                    // this.accountAccountPeriod();
                    this.blurCaculateSum();
                    this.getVoucherNumber(this.accountPeriod.currentYear, this.accountPeriod.currentMonth);
                } else {
                    this.router.navigate(['/app/finance/voucher']);
                }
            })
            .catch(
            error => {
                this.alertDanger(error);
                return false;
            }
            );
    }
    // 更新凭证列表
    upDataList(e) {
        this.dataList = e;
        this.voucherList.attachmentModels = this.dataList;
        this.voucherList.attachmentCount = this.voucherList.attachmentModels.length;
    }
    // 提交保存
    submit(type) {
        if (this.debitTotal !== this.creditTotal) {
            this.alertDanger('借贷不平衡，请检查');
            return;
        }
        if (!this.voucherList.accountedOn) {
            this.alertDanger('请选择制单时间');
            return;
        }
        if (this.voucherList.attachmentModels && this.voucherList.attachmentModels.length === 0) {
            delete this.voucherList.attachmentModels;
        }
        if (this.voucherList) {
            _.forEach(this.voucherList.journalEntryLineItemModels, item => {
                if (item.debitAmount.length > 0) {
                    item.amount = Number(item.debitAmount);
                    item.debitCreditType = 'Debit';
                }
                if (item.creditAmount.length > 0) {
                    item.amount = Number(item.creditAmount);
                    item.debitCreditType = 'Credit';
                }
                if (!item.summary) {
                    item.needSummary = true;
                } else {
                    item.needSummary = false;
                }
                if (!item.account.id || item.account.id === '') {
                    item.needAccountCode = true;
                } else {
                    item.needAccountCode = false;
                }
            });
        }
        let list = _.cloneDeep(this.voucherList);
        for (let i = 0; i < list.journalEntryLineItemModels.length; i++) {
            if (list.journalEntryLineItemModels[i].summary.length === 0) {
                this.alertDanger('请填写摘要');
                return;
            }
            if (list.journalEntryLineItemModels[i].needAccountCode) {
                this.alertDanger(' 请选择会计科目');
                return;
            }
            if (list.journalEntryLineItemModels[i].amount === 0) {
                this.alertDanger('请填写借贷金额');
                return;
            }
            if (list.journalEntryLineItemModels[i].contact.id === '' ||
                list.journalEntryLineItemModels[i].contact[0] === undefined ||
                list.journalEntryLineItemModels[i].contact[0].id === 'contact') {
                delete list.journalEntryLineItemModels[i].contact;
            } else {
                list.journalEntryLineItemModels[i].contact = {
                    id: list.journalEntryLineItemModels[i].contact[0].id,
                    name: list.journalEntryLineItemModels[i].contact[0].text
                };
            }
            list.journalEntryLineItemModels[i].needSummary = false;
            delete list.journalEntryLineItemModels[i].debitAmount;
            delete list.journalEntryLineItemModels[i].debitAmountList;
            delete list.journalEntryLineItemModels[i].creditAmount;
            delete list.journalEntryLineItemModels[i].creditAmountList;
            delete list.journalEntryLineItemModels[i].debitstatus;
            delete list.journalEntryLineItemModels[i].creditstatus;
            delete list.journalEntryLineItemModels[i].needSummary;
            delete list.journalEntryLineItemModels[i].needAccountCode;
            delete list.journalEntryLineItemModels[i].subject;
        }
        console.log('list:90909009090909' + JSON.stringify(list));
        this.addNewVoucher(list, type);
    }
    // 退出
    quit(event) {
        if (event === ConfirmEventTypeEnum.Confirm) {
            this.router.navigate(['/app/finance/voucher']);
        }
    }
    // 附件预览
    preview(itemId) {
        this.picturePreviewModal.show(this.dataList, itemId);
    }
    // 未保存提示框
    openConfirmModal() {
        let deleteMessage = '还未保存凭证，是否继续退出？';
        this.confirmWidget.message = deleteMessage;
        this.confirmWidget.title = '提醒';
        this.confirmWidget.show();
    }

    copySummary(i) {
        console.log(i);
        if (i !== 0) {
            return;
        }
        for (let n = 1; n < this.voucherList.journalEntryLineItemModels.length; n++) {
            if (this.voucherList.journalEntryLineItemModels[0].summary.length > 0) {
                this.voucherList.journalEntryLineItemModels[n].summary = this.voucherList.journalEntryLineItemModels[0].summary;
            }
        }
    }
    display() {
        this.calculator.display = true;
        this.calculator.addListen();
    }
}
