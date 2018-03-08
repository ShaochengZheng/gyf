import { Component, OnInit, AfterViewInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { FinanceService } from '../../shared/finance.service';
import { AuthorizationService } from '../../../../service/core';

import { AccountPeriodModel } from '../../../../api/accounting/model/AccountPeriodModel';
import { ConfirmWidget, ConfirmEventTypeEnum } from '../../../widget/confirm/confirm';
import { CalculatorComponent } from '../../calculator/calculator';

import * as moment from 'moment';
import * as _ from 'lodash';

@Component({
	selector: 'new-voucher',
	templateUrl: 'edit-voucher.component.html',
	styleUrls: ['./edit-voucher.component.scss'],
	providers: [FinanceService]
})

export class EditVoucherComponent implements OnInit, AfterViewInit {
	@ViewChild('contactDetailsModal') public contactDetailsModal;
	@ViewChild('upload-attachments') public uploadNotes;
	@ViewChild('picturePreviewModal') public picturePreviewModal;
	@ViewChild('confirmWidget') public confirmWidget: ConfirmWidget;
	@ViewChild('cancelModal') public cancelModal: ConfirmWidget;
	@ViewChild('nextSaveModel') public nextSaveModel: ConfirmWidget;
	@ViewChild('calculator') public calculator: CalculatorComponent;
	subjectsList = [];
	contactsList: Array<Object> = [];
	currentIndex: number; // 当前页索引
	voucherTemp:any;//是否编辑过比较缓存
	searchParams: any;
	pageLength: number;
	nextModalSubject: any;
	voucherListModel = {
		accountedOn: this.getTodayDate(),
		journalEntryNumber: '',
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
	// 借记总额
	debitTotal: number = 0;
	// 贷记总额
	creditTotal: number = 0;
	// 金额大写的字符串
	outputCharacters: string = '';
	outputCharactersStatus: boolean = false;
	// 弹出提示框
	alert = {};
	// 显示表格
	displayTbody: boolean = true;
	// 当前会计科目
	currentSubject = [];
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
	lineIndex: number = 0;
	// 上传附件临时储存
	dataList = [];
	// 上传附件类型
	type: string = 'image';
	// 上传附件地址
	upurl: string = '/api/v1/journal/upload';
	minDate: any = '';
	maxDate: any = '';
	// 当前账套状态
	currentStatus: any;
	constructor(private financeService: FinanceService, private authorizationService: AuthorizationService,
		private router: Router, private route: ActivatedRoute, private changRef: ChangeDetectorRef, private location: Location) {
		this.currentStatus = this.authorizationService.getCurrentAccountStatus();
		this.router = router;

		if (router.events.subscribe) {
			router.events.debounceTime(300).subscribe(() => {
				this.ngOnInit();
			});
		}
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
	// 获取当前日期
	public getTodayDate() {
		let date = new Date();
		let seperator = '-';
		let year = date.getFullYear();
		let month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
		let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
		let currentdate: any = year + seperator + month + seperator + day;
		return currentdate;
	}

	ngOnInit() {
		this.getAllSubjects();
		this.getAllContact();
		this.accountAccountPeriod();
		this.blurCaculateSum();
		this.searchParams = this.route.snapshot.params;
		this.currentIndex = Number(this.route.snapshot.params['index'] || this.route.snapshot.params['pageIndex']);
		this.search(this.route.snapshot.params);
			// this.currentIndex = this.editVoucherService.pageToIndex(params['pageIndex'], params['pageSize'], params['index']);
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
				this.voucherList.journalEntryLineItemModels[this.lineIndex].contactName =
					this.voucherList.journalEntryLineItemModels[this.lineIndex].contact[0].text;
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
				this.minDate = this.accountPeriod.currentYear + '-' + this.accountPeriod.currentMonth + '-1';
				let day = new Date(this.accountPeriod.currentYear, this.accountPeriod.currentMonth, 0);
				this.maxDate = this.accountPeriod.currentYear + '-' + this.accountPeriod.currentMonth + '-' + day.getDate();
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
				this.voucherList.journalEntryLineItemModels[i].account.id = '';
				this.changRef.detectChanges();
				return;
			} else {
				this.voucherList.journalEntryLineItemModels[i].account.id = e.id;
				this.voucherList.journalEntryLineItemModels[i].subjectName = e.text;
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
				this.voucherList.journalEntryLineItemModels[i].contactName = e.text;
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
		if (this.debitTotal.toFixed(2) === this.creditTotal.toFixed(2)) {
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

	newItem() {
		if (this.voucherList.sourceType === 'AutomaticGeneration' || this.currentStatus !== 'InProgress' || this.voucherList.lock === true) {
			return;
		}
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
			}
		}

	}
	deleteItem(data, i) {
		let list = this.voucherList.journalEntryLineItemModels;
		list.splice(i, 1);
		this.blurCaculateSum();
	}

	// 改变状态
	changeType(type, i) {
		if (this.voucherList.sourceType === 'AutomaticGeneration' || this.currentStatus !== 'InProgress' || this.voucherList.lock === true) {
			return;
		}
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
					this.voucherList.journalEntryLineItemModels[i].debitAmountList = this.transfer(this.voucherList.journalEntryLineItemModels[i].debitAmount);
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
					this.voucherList.journalEntryLineItemModels[i].creditAmountList = this.transfer(this.voucherList.journalEntryLineItemModels[i].creditAmount);
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
	// 搜索凭证
	search(searchparams) {
		const params = _.pick(searchparams, ['year', 'month', 'keyword', 'type']);
		params['pageIndex'] = this.currentIndex;
		params['pageSize'] = '1';
		this.financeService.getVoucher(params)
			.then( voucherModelList => {
				const voucherModel = voucherModelList['list'][0];
				const data = voucherModel.journalEntryLineItemModels;
				if (voucherModel.attachmentModels !== null) {
					this.dataList = this.financeService.replaceTheURL(voucherModel.attachmentModels);
				}
				voucherModel.accountedOn = moment(voucherModel.accountedOn).format('L');
				let str = '00000' + voucherModel.journalEntryNumber;
				voucherModel.journalEntryNumber = str.substring(str.length - 4, str.length);
				this.voucherTemp = _.cloneDeep(voucherModel);
				for (let i = 0; i < data.length; i++) {
					if (data[i].debitCreditType === 'Debit') {
						data[i].debitAmount = (data[i].amount).toString(); //
						data[i].debitAmountList = this.transfer((data[i].amount).toString()); //
						data[i].creditAmount = ''.toString(); //
						data[i].creditAmountList = ['', '', '', '', '', '', '', '', '', '', '']; //
					}
					if (data[i].debitCreditType === 'Credit') {
						data[i].debitAmount = ''.toString(); //
						data[i].debitAmountList = ['', '', '', '', '', '', '', '', '', '', '']; //
						data[i].creditAmount = (data[i].amount).toString(); //
						data[i].creditAmountList = this.transfer((data[i].amount).toString()); //
					}
					if (data[i].contact) {
						data[i].contact = [{id: data[i].contact.id, text: data[i].contact.name}];
						data[i].contactName = data[i].contact[0].text;
					} else {
						data[i].contact = {id: '', text: ''};
						data[i].contactName = '';
					}
					data[i].subject = [{id: data[i].account.id, text: data[i].account.id + '—' + data[i].account.name}];
					data[i].subjectName = data[i].subject[0].text;
					data[i].debitstatus = true;
					data[i].creditstatus = true;
					data[i].needAccountCode = false;
					data[i].needSummary = false;
				}
				this.voucherList = voucherModel;
				console.log(this.voucherList);
				this.blurCaculateSum();
				this.pageLength = voucherModelList.recordCount;
			})
			.catch(
			error => {
				this.displayTbody = false;
				console.log(error);
				this.alertDanger(error);
			});
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
	// 修改凭证
	addNewVoucher(model, type) {
	 return	this.financeService.journalEntryModify(model)
			.then(
			data => {
				this.router.navigate(['/app/finance/voucher']);
				return true;
			})
			.catch(
			error => {
				this.alertDanger(error);
				return false;
			}
			);
	}
	// 新增联系人
	openConfirmModal() {
		if (this.voucherList.entityId === null && this.voucherList.lock === false &&
			this.voucherList.sourceType !== 'AutomaticGeneration' && this.voucherList.lock === false) {
			const deleteMessage = '还未保存凭证，是否继续退出？';
			this.confirmWidget.message = deleteMessage;
			this.confirmWidget.title = '提醒';
			this.confirmWidget.show();
		} else {
			this.router.navigate(['/app/finance/voucher']);
		}
	}
	// 更新附件
	upDataList(e) {
		this.dataList = e;
		this.voucherList.attachmentModels = this.dataList;
		this.voucherList.attachmentCount = this.voucherList.attachmentModels.length;
	}
	// 提交保存
	submit(type) {
		const list = this.toSaveFormat(type);
		return	this.addNewVoucher(list, type);
	}
	// 保存格式转换
	toSaveFormat (type) {
		if (this.debitTotal !== this.creditTotal) {
			this.alertDanger('借贷不平衡，请检查');
			return;
		}
		if (!this.voucherList.accountedOn) {
			this.alertDanger('请选择记账日期');
			return;
		}
		if (this.voucherList.journalEntryLineItemModels.length === 0) {
			this.alertDanger('未填写凭证明细');
			return;
		}
		if (this.voucherList.attachmentModels && this.voucherList.attachmentModels.length === 0) {
			// delete this.voucherList.attachmentModels;
		} else {
			this.voucherList.attachmentModels = this.dataList;
		}
		if (this.voucherList)
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
				}
				if (!item.account.id || item.account.id === '') {
					item.needAccountCode = true;
				}
			});
		const list = _.cloneDeep(this.voucherList);
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
				// delete list.journalEntryLineItemModels[i].contact;
				list.journalEntryLineItemModels[i].contact = null;
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
			delete list.journalEntryLineItemModels[i].subjectName;
			delete list.journalEntryLineItemModels[i].contactName;
		}
		return list;
	}
	// 退出
	quit(event) {
		if (event === ConfirmEventTypeEnum.Confirm) {
			this.location.back();
		}
	}
	// 预览
	preview(itemId) {
		this.picturePreviewModal.show(this.dataList, itemId);
	}
	// 打印
	printDiv() {
		const obj = document.getElementById('printDiv');
		const newWindow = window.open('/app/finance/editvoucher', '_blank'); // 打印窗口要换成页面的url
		const docStr = obj.innerHTML;
		newWindow.document.write(docStr);
		newWindow.document.close();
		newWindow.print();
		newWindow.close();
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
	// 跳转
	redirect(entityType, entityId) {
		if (entityType === 'Income') {
			this.router.navigate(['/app/transaction/detail/editIncome', { id: entityId }]);
		}
		if (entityType === 'Outcome') {
			this.router.navigate(['/app/transaction/detail/editOutcome', { id: entityId }]);
		}
		if (entityType === 'Input') {
			this.router.navigate(['/app/invoice/tab/edit-input-invoice', { id: entityId }]);
		}
		if (entityType === 'Output') {
			this.router.navigate(['/app/invoice/tab/edit-output-invoice', { id: entityId }]);
		}
		if (entityType === 'Banktransfer') {
			this.router.navigate(['/app/transaction/detail/editaccountTransfers', { id: entityId }]);
		}
	}
	nextVoucher(index) {
		if (!this.toSaveFormat('') ) {
			return
		}
		// 深比较 是否修改
		if (!_.isEqual(this.toSaveFormat(''), this.voucherTemp)) {
			if (!this.nextModalSubject) {
				this.nextModalSubject = this.nextSaveModel.show(index);
				this.nextModalSubject.subscribe({
					next : (item) => {
						if (item.status === 1) {
							this.financeService.journalEntryModify(this.toSaveFormat(''))
                                .then(
									data => {
										return true;
									})
                                .catch(
									error => {
										this.alertDanger(error);
										return false;
									}
								).then((v) => {
								if (v) {
									this.currentIndex = item.val;
									this.toNext(index);
								}
							});
						}else if (item.status === 3) {
							this.currentIndex = item.val;
							this.toNext(index);
						}
					}
				});
			}else {
				this.nextSaveModel.show(index);
			}
		}else {
			this.toNext(index);
			// this.search(this.searchParams);
		}
	}
	toNext(index) {
		this.currentIndex = index;
		const params = _.pick(this.searchParams, ['year', 'month', 'keyword', 'type']);
		params['pageIndex'] = this.currentIndex;
		params['pageSize'] = '1';
		const link: any[] = ['/app/finance/editvoucher', params];
		this.router.navigate(link);
	}

}
