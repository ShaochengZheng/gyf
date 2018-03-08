import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as _ from 'lodash';

import { FinanceService } from '../shared/finance.service';
import { AuthorizationService } from '../../../service/core';
import { AccountPeriodModel } from '../../../api/accounting/model/AccountPeriodModel';
import { ConfirmWidget, ConfirmEventTypeEnum, ConfirmEventCheckTypeEnum } from '../../widget/confirm/confirm';
import { WeChatApi } from '../../../api/wechat/api/send';

@Component({
	selector: 'voucher',
	templateUrl: 'voucher.component.html',
	styleUrls: ['./voucher.component.scss'],
	providers: [FinanceService, WeChatApi]

})

export class VoucherComponent implements OnInit {
	@ViewChild('confirmWidget') public confirmWidget: ConfirmWidget;
	@ViewChild('cancelModal') public cancelModal: ConfirmWidget;
	// 科目列表
	subjectsList = [];
	// 凭证列表
	journalEntryList = [];
	searchObject = {
		year: 0,
		month: 0,
		keyword: '',
		pageIndex: '1',
		pageSize: '10',
		type: ''
	};
	searchModel = _.cloneDeep(this.searchObject);
	// 弹出提示框
	alert = {};
	// 分页导航
	pageIndex: number = 1;
	pageSize: number = 1;
	recordCount: number = 0;
	maxSize: number = 5;
	// 年份列表
	yearList = [];
	// 月份列表
	monthList = [];
	// 默认年
	defaultYear = [];
	// 默认月
	defaultMonth = [];
	// 当前账期
	accountPeriod: AccountPeriodModel = {
		currentMonth: 0,
		currentYear: 0,
		accountHistoryPeriods: [{
			year: 0,
			months: []
		}
		]
	};
	isSifting: boolean = false;
	totalDebitAmount: Number = 0;
	totalCreditAmount: Number = 0;
	// 借记总额
	debitTotal: number = 0;
	// 贷记总额
	creditTotal: number = 0;
	// 金额大写的字符串
	outputCharacters: string = '';
	outputCharactersStatus: boolean = false;
	// 凭证列表
	voucherList: any = [];
	currentItem: any;
	// 无数据展示
	noDataDisplay: boolean = false;
	browserUserAgent: string;

	url: string = '';
	isOrder = false;
	currentStatus: any;
	constructor(private financeService: FinanceService, private authorizationService: AuthorizationService,
		private router: Router, private weChatApi: WeChatApi) {
		this.accountAccountPeriod();
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

	public addAlert(alert: Object): void {
		this.clearAlert();
		this.alert = alert;
	}

	public clearAlert(): void {
		this.alert = {};
	}

	ngOnInit() {

	}
	// 整理编号
	journalEntryOrder() {
		this.financeService.journalEntryOrder(this.searchModel.year, this.searchModel.month)
			.then(
			voucher => {
				this.alertSuccess(this.accountPeriod.currentYear.toString() + '年' + this.accountPeriod.currentMonth.toString() + '月的凭证编号已经重新编制');
				this.search();
			}
			)
			.catch(
			error => {
				this.alertDanger(error);
			});
	}

	// 翻页待处理
	public pageChanged(event: any): void {
		this.searchModel.pageIndex = event.page;
		this.search();
	}
	// 下拉框选择事件
	selected(e, type) {
		if (type === 'year') {
			this.searchModel.year = e.text;
			this.search();
		} else {
			this.searchModel.month = e.text;
			this.search();
		}
	}
	searchConditions() {
		this.searchModel.pageIndex = '1';
		this.pageIndex = 1;
		this.search();
	}
	toggleSifting() {
		this.isSifting = !this.isSifting;
	}
	// 凭证查询
	search() {
		this.currentStatus = this.authorizationService.getCurrentAccountStatus();
		this.url = '/api/v1/journal/' + this.searchModel.year + '/' + this.searchModel.month + '/export';
		this.financeService.getVoucher(this.searchModel)
			.then(
			voucherModel => {
				if (voucherModel.list.length > 0) {
					_.forEach(voucherModel.list, item => {
						let totalDebitAmount: number = 0;
						let totalCreditAmount: number = 0;
						for (let i = 0; i < item.journalEntryLineItemModels.length; i++) {
							item.journalEntryLineItemModels[i].subject = item.journalEntryLineItemModels[i].account.id + '-' +
								item.journalEntryLineItemModels[i].account.name;
							if (item.journalEntryLineItemModels[i].debitCreditType === 'Debit') {
								item.journalEntryLineItemModels[i].debitAmount = item.journalEntryLineItemModels[i].amount;
								item.journalEntryLineItemModels[i].creditAmount = null;
								totalDebitAmount += item.journalEntryLineItemModels[i].amount;
								item.totalDebitAmount = totalDebitAmount;
							} else {
								if (item.journalEntryLineItemModels[i].debitCreditType === 'Credit') {
									item.journalEntryLineItemModels[i].creditAmount = item.journalEntryLineItemModels[i].amount;
									item.journalEntryLineItemModels[i].debitAmount = null;
									totalCreditAmount += item.journalEntryLineItemModels[i].amount;
									item.totalCreditAmount = totalCreditAmount;
								}
							}
						}
						const str = '00000' + item.journalEntryNumber;
						item.journalEntryNumber = str.substring(str.length - 4, str.length);
					});
					this.pageIndex = voucherModel.pageIndex;
					this.pageSize = voucherModel.pageSize;
					this.recordCount = voucherModel.recordCount;
					this.journalEntryList = _.cloneDeep(voucherModel.list);
					this.noDataDisplay = false;
				} else {
					this.noDataDisplay = true;
					this.journalEntryList = [];
				}

			}
			)
			.catch(
			error => {
				this.alertDanger(error);
			}
			);
	}
	// 删除子项凭证
	delete(event) {
		if (event === ConfirmEventTypeEnum.Confirm) {
			this.financeService.deleteVoucher(this.currentItem.id)
				.then(
				voucher => {
					this.alertSuccess('凭证删除成功');
					this.journalEntryList = [];
					if (this.isOrder === true) {
						this.journalEntryOrder();
					} else {
						this.search();
					}
				}
				)
				.catch(
				error => {
					this.alertDanger(error);
				});
		}
	}
	confirm(event) {
		if (event === ConfirmEventTypeEnum.Confirm) {
			this.journalEntryOrder();
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
				this.defaultYear.push({ id: 'year', text: this.accountPeriod.currentYear.toString() });
				this.defaultMonth.push({ id: 'month', text: this.accountPeriod.currentMonth.toString() });
				for (let i = 0; i < this.accountPeriod.accountHistoryPeriods.length; i++) {
					for (let n = 0; n < this.accountPeriod.accountHistoryPeriods[i].months.length; n++) {
						this.monthList.push({ id: n, text: this.accountPeriod.accountHistoryPeriods[i].months[n].toString() });
					}
					this.yearList.push({ id: i, text: this.accountPeriod.accountHistoryPeriods[i].year.toString() });
				}
				this.searchModel.year = this.accountPeriod.currentYear;
				this.searchModel.month = this.accountPeriod.currentMonth;
				this.search();
			}
			)
			.catch(
			error => {
				this.alertDanger(error);
			}
			);
	}
	// 打开删除确认框
	openDeleteModal(item) {
		this.currentItem = item;
		const deleteMessage = '您确定要删除该凭证吗？';
		this.confirmWidget.message = deleteMessage;
		this.confirmWidget.orderNumber = true;
		this.confirmWidget.show();
	}
	// 清除搜索条件
	clear() {
		this.searchModel = _.cloneDeep(this.searchObject);
		this.searchModel.year = this.accountPeriod.currentYear;
		this.searchModel.month = this.accountPeriod.currentMonth;
		this.defaultYear = [{ id: 'year', text: this.accountPeriod.currentYear.toString() }];
		this.defaultMonth = [{ id: 'month', text: this.accountPeriod.currentMonth.toString() }];
		this.search();
	}

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

	sendWeChat() {
		// this.weChatApi.sent()
		// .subscribe(
		// 	data=>{
		// 		console.log(data);
		// 	}
		// )
	}
	order(e) {
		if (e === ConfirmEventCheckTypeEnum.True) {
			this.isOrder = true;
		} else {
			this.isOrder = false;
		}
		console.log(this.isOrder);
	}
	getRouteParams(item, index) {
		const params = {
			index: (Number(this.searchModel.pageIndex) - 1) * Number(this.searchModel.pageSize) + Number(index) + 1,
			year: this.searchModel.year,
			month: this.searchModel.month,
			keyword: this.searchModel.keyword,
			type: this.searchModel.type
		};
		return params;
	}
	/**
	 * 导出
	 */
	export() {
		this.financeService.exportVoucher(this.searchModel).then(
			data => {
				const url: any = data;
				const elemIF = document.createElement('iframe');
				elemIF.src = url;
				elemIF.style.display = 'none';
				document.body.appendChild(elemIF);
				this.alertSuccess('导出成功');
			}).catch(error => {
				this.alertDanger(error);
			});
	}
}
