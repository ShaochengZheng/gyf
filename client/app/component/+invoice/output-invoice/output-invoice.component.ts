import { Component, OnInit, ViewChild } from '@angular/core';
import * as _ from 'lodash';

import { InvoiceService } from '../shared/invoice.service';
import { ConfirmWidget, ConfirmEventTypeEnum } from '../../widget/confirm/confirm';
import { AuthorizationService } from '../../../service/core';
import { InvoiceTypeEnumModel } from '../../../api/accounting/model/InvoiceTypeEnumModel';
import { InvoiceStatusEnumModel } from '../../../api/accounting/model/InvoiceStatusEnumModel';
@Component({
	selector: 'output-invoice',
	templateUrl: 'output-invoice.component.html',
	styleUrls: ['../shared/invoice.scss'],
})

export class OutputInvoiceComponent implements OnInit {
	@ViewChild('confirmWidget') public confirmWidget: ConfirmWidget;
	// 弹出提示框
	alert = {};
	currentItem: any;
	searchObject = {
		tagIds: '',
		entityType: 'OUTPUTINVOICE',
		invoiceType: '',
		invoiceStatus: '',
		invoiceNumber: '',
		taxRate: '',
		keyword: '',
		startDate: '',
		endDate: '',
		pageIndex: '1',
		pageSize: '10'
	};
	searchModel = _.cloneDeep(this.searchObject);
	pageIndex: number = 1;
	pageSize: number = 1;
	recordCount: number = 0;
	maxSize: number = 5;
	isSifting: boolean = false;
	invoiceType = null;
	invoiceStatus = null;
	outputInvoiceItemList = [];
	// 税率列表
	taxRateList = [{ id: 0.05, text: '5%' }, { id: 0.06, text: '6%' }, { id: 0.11, text: '11%' }
		, { id: 0.13, text: '13%' }, { id: 0.17, text: '17%' }];
	// 默认税率
	defaultTaxRate = [];
	// 发票类型列表
	invoiceTypeList = [
		{ id: InvoiceTypeEnumModel.ValueEnum.General, text: '普通发票' },
		{ id: InvoiceTypeEnumModel.ValueEnum.Professional, text: '专用发票' },
		{ id: InvoiceTypeEnumModel.ValueEnum.None, text: '无票' }];
	// 发票状态列表
	invoiceStatusList = [
		{ id: InvoiceStatusEnumModel.ValueEnum.Self, text: '税控自开' },
		{ id: InvoiceStatusEnumModel.ValueEnum.Other, text: '税务代开' },
		{ id: InvoiceStatusEnumModel.ValueEnum.None, text: '未开发票' }];
	tagList = [{ id: '1', value: '11', checked: false }];
	tagLists = [{ id: '1', value: '11', checked: false }];
	displayTags = true;
	// 开票总金额
	balanceOfTotalAmount: {};
	// 是否是一般纳税人
	isGeneralTaxpayer: boolean = false;
	constructor(private invoiceService: InvoiceService, private authorizationService: AuthorizationService) {
		this.searchItem();
		this.getAllTags();
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
		if (this.authorizationService.Session.currentAccount.companyProperty === 'GeneralTaxpayer') {
			this.isGeneralTaxpayer = true;
		} else {
			this.isGeneralTaxpayer = false;
		}
	}
	//  下拉框选择事件
	selected(e, type) {
		if (type === 'invoiceType') {
			this.searchModel.invoiceType = e.id;
		}
		if (type === 'invoiceStatus') {
			this.searchModel.invoiceStatus = e.id;
		}
		if (type === 'taxRate') {
			this.searchModel.taxRate = e.id;
		}
		this.searchItem();
	}
	toggleSifting() {
		this.isSifting = !this.isSifting;
	}
	searchConditions() {
		this.searchModel.pageIndex = '1';
		this.pageIndex = 1;
		this.searchItem();
	}
	// 搜索子项
	searchItem() {
		this.invoiceService.getAllItem(this.searchModel)
			.then(
			outputinvoiceModel => {
				console.log('item 43434343' + JSON.stringify(outputinvoiceModel));
				this.outputInvoiceItemList = outputinvoiceModel.list;
				this.pageIndex = outputinvoiceModel.pageIndex;
				this.pageSize = outputinvoiceModel.pageSize;
				this.recordCount = outputinvoiceModel.recordCount;
				this.searchInvoiceSum();

			})
			.catch(
			error => {
				this.alertDanger(error);
			}
			);
	}
	// 导出
	exportInvoice() {
		this.invoiceService.exportData(this.searchModel)
			.then(
			data => {
				this.alertSuccess('导出成功');
			})
			.catch(
			error => {
				this.alertDanger(error);
			});
	}
	searchInvoiceSum() {
		this.invoiceService.getInvoiceSum(this.searchModel)
			.then(
			sumModel => {
				this.balanceOfTotalAmount = sumModel;
			});
	}
	// 删除子项
	delete(event) {
		if (event === ConfirmEventTypeEnum.Confirm) {
			this.invoiceService.deleteInvoiceItem(this.currentItem.invoiceModel.id, this.currentItem.id)
				.then(
				outputinvoiceModel => {
					this.alertSuccess('删除成功');
					this.searchItem();
				})
				.catch(
				error => {
					this.alertDanger(error);
				}
				);
		}
	}
	// 清除搜索条件
	clear() {
		this.searchModel = {
			tagIds: '',
			entityType: 'OUTPUTINVOICE',
			invoiceType: null,
			invoiceStatus: null,
			invoiceNumber: '',
			taxRate: '',
			keyword: '',
			startDate: '',
			endDate: '',
			pageIndex: '1',
			pageSize: '10'
		};
		this.invoiceType = null;
		this.invoiceStatus = null;
		this.defaultTaxRate = null;
		this.resetTags();
		this.searchItem();
	}
	// 删除确认
	openDeleteModal(item) {
		this.currentItem = item;
		const deleteMessage = '您确定要删除该发票子项吗？';
		this.confirmWidget.message = deleteMessage;
		this.confirmWidget.show();
	}
	// 翻页待处理
	public pageChanged(event: any): void {
		this.searchModel.pageIndex = event.page;
		this.searchItem();
	}
	// 重置tags选中状态
	resetTags() {
		if (this.tagList) {
			const templist = [];
			this.tagList.forEach(item => {
				item.checked = false;
				templist.push(item);
			});
			this.tagList = templist;
		}
	}
	// 获取所有标签
	getAllTags() {
		this.invoiceService.getAllTags()
			.then(data => {
				this.tagLists = _.cloneDeep(data);
				if (this.tagLists) {
					this.tagLists.forEach(item => {
						item.checked = false;
					});
					if (this.tagLists) {
						this.tagList = this.tagLists.slice(0, 10);
					}
				}
				console.log(this.tagLists);
			})
			.catch(error => {
				this.alertDanger(error);
			});
	}
	search_tagToggle(flag: boolean) {
		if (flag) {
			this.tagList = this.tagLists;
		} else {
			if (this.tagLists) {
				this.tagList = this.tagLists.slice(0, 10);
			}
		}
		this.displayTags = !this.displayTags;
	}
	// 标签
	search_tagSearch(item, index) {
		console.log('<--->', item, index);
		if (this.tagList[index].checked) {
			this.tagList[index].checked = false;
			this.tagLists[index].checked = false;
		} else if (!this.tagList[index].checked) {
			this.tagList[index].checked = true;
			this.tagLists[index].checked = true;
		}
		this.setTagsID();
	}
	setTagsID() {
		let ids = '';
		this.tagLists.forEach(item => {
			if (item.checked) {
				ids = ids + item.id + ',';
			}
		});
		if (ids) {
			const count = String(ids).length - 1;
			ids = String(ids).substring(0, count);
			this.searchModel.tagIds = ids;
			console.log('<--setTagsID-->', ids);
		} else {
			this.searchModel.tagIds = '';
		}
		this.searchConditions();
	}
}
