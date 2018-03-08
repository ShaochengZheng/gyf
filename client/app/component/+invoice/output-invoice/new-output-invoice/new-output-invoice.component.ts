import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import * as _ from 'lodash';
import { Router } from '@angular/router';
import * as moment from 'moment';

import { InvoiceService } from '../../shared/invoice.service';
import { InvoiceTypeEnumModel } from '../../../../api/accounting/model/InvoiceTypeEnumModel';
import { InvoiceStatusEnumModel } from '../../../../api/accounting/model/InvoiceStatusEnumModel';
import { DepartmentTypeEnumModel } from '../../../../api/accounting/model/DepartmentTypeEnumModel';
import { AccountPeriodModel } from '../../../../api/accounting/model/AccountPeriodModel';
import { AuthorizationService } from '../../../../service/core';
import { UtilityService } from '../../../../service/core/utility';

import { ConfirmWidget, ConfirmEventTypeEnum } from '../../../widget/confirm/confirm';

@Component({
	selector: 'new-output-invoice',
	templateUrl: 'new-output-invoice.component.html',
	styleUrls: ['new-output-invoice.component.scss'],
	providers: [InvoiceService]
})

export class NewOutputInvoiceComponent implements OnInit {
	@ViewChild('contactDetailsModal') public contactDetailsModal;
	@ViewChild('upload-attachments') public uploadNotes;
	@ViewChild('picturePreviewModal') public picturePreviewModal;
	@ViewChild('confirmWidget') public confirmWidget: ConfirmWidget;
	@ViewChild('cancelModal') public cancelModal: ConfirmWidget;
	@ViewChild('tag') public tag;
	// 弹出提示框
	alert = {};
	// 显示税率
	displayTax: boolean = false;
	// 部门性质
	departmentTypeList = [
		{ id: DepartmentTypeEnumModel.ValueEnum.Sales, text: '销售部门' },
		{ id: DepartmentTypeEnumModel.ValueEnum.Management, text: '管理部门' }];
	// 发票类型列表
	invoiceTypeList = [
		{ id: InvoiceTypeEnumModel.ValueEnum.General, text: '普票' },
		{ id: InvoiceTypeEnumModel.ValueEnum.Professional, text: '专票' },
		{ id: InvoiceTypeEnumModel.ValueEnum.None, text: '无票' }];
	// 税率列表
	taxRateList = [];
	// 发票状态列表
	invoiceStatusList = [{ id: InvoiceStatusEnumModel.ValueEnum.Self, text: '税控自开' },
	{ id: InvoiceStatusEnumModel.ValueEnum.Other, text: '税务代开' }];
	// 默认发票列表
	defaultinvoiceStatus = [{ id: InvoiceStatusEnumModel.ValueEnum.Self, text: '税控自开' }];
	// 默认发票
	defaultinvoiceType = [{ id: InvoiceTypeEnumModel.ValueEnum.General, text: '普票' }];
	// 默认联系人
	defaultContact = [];
	// 开票类别列表
	businessCategoryStatusList = [];
	// 往来列表
	contactsList = [];
	// 自定义的model
	invoiceModel = {
		totalAmount: 0,
		recordType: { value: 'OutputInvoice', name: '' },
		invoiceType: { value: '', name: '' },
		invoiceStatus: { value: '', name: '' },
		invoiceItemModels: [
			{
				businessCategory: { id: '', name: '' },
				departmentType: { value: '', name: '' },
				inputTaxCategory: null, // 进项税类别
				amount: 0,
				taxRate: 0.00,
				taxRatePercent: [],
				description: '',
				taxAmount: 0,
				amountWithoutTax: 0,
				needBusinessCategory: false,
				needDepartmentType: false,
				needtaxRate: false,
				needAmount: false,
			}
		],
		contact: { id: '', name: '' },
		tags: [],
		attachmentModels: [],
		recordDate: '0000-00-00',
		invoiceNumber: ''
	};
	invoice: any = _.cloneDeep(this.invoiceModel);
	// 子项model
	invoiceItemModel = {
		businessCategory: { id: '', name: '' },
		departmentType: { value: '', name: '' },
		inputTaxCategory: null, // 进项税类别
		amount: 0,
		taxRate: 0.00,
		taxRatePercent: [],
		description: '',
		taxAmount: 0,
		amountWithoutTax: 0,
		needBusinessCategory: false,
		needDepartmentType: false,
		needtaxRate: false,
		needAmount: false,
	};
	invoiceItem = _.cloneDeep(this.invoiceItemModel);
	accountPeriod: AccountPeriodModel = {
		currentMonth: 0,
		currentYear: 0,
		accountHistoryPeriods: [{
			year: 0,
			months: []
		}
		]
	};
	needRecordDate: boolean = false;
	needInvoiceType: boolean = false;
	needInvoiceStatus: boolean = false;
	needContact: boolean = false;
	// tag临时
	addTagList: any = [];
	// 上传附件临时储存
	dataList = [];
	// 上传附件类型
	type: string = 'image';
	// 上传附件地址
	upurl: string = '/api/v1/invoice/upload';
	minDate: any = '';
	maxDate: any = '';
	// 合计金额
	totalAmount: number = 0;
	needInvoiceNumber = false;
	// 是否是一般纳税人
	isGeneralTaxpayer: boolean = false;
	constructor(private invoiceService: InvoiceService, private router: Router, private changRef: ChangeDetectorRef,
		private utilityService: UtilityService,
		private authorizationService: AuthorizationService) {
		this.getAllContact(true);
		this.getAllBusiness();
		this.accountAccountPeriod();
		if (this.authorizationService.Session.currentAccount.companyProperty === 'GeneralTaxpayer') {
			this.isGeneralTaxpayer = true;
			this.taxRateList = [{ id: 0.05, text: '5%' }, { id: 0.06, text: '6%' }, { id: 0.11, text: '11%' }
				, { id: 0.13, text: '13%' }, { id: 0.17, text: '17%' }];
		} else {
			this.isGeneralTaxpayer = false;
			this.taxRateList = [{ id: 0.03, text: '3%' }, { id: 0.05, text: '5%' }, { id: 0.06, text: '6%' }, { id: 0.11, text: '11%' }
				, { id: 0.13, text: '13%' }, { id: 0.17, text: '17%' }];
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
	ngOnInit() {
		this.invoice.invoiceType = { value: this.defaultinvoiceType[0].id, name: this.defaultinvoiceType[0].text };
		this.invoice.invoiceStatus = { value: this.defaultinvoiceStatus[0].id, name: this.defaultinvoiceStatus[0].text };
	}
	// 弹出新增联系人对话框
	newContact() {
		this.contactDetailsModal.show();
	}
	// 联系人新增结果，失败或者成功
	result(resultObj) {
		setTimeout(() => {
			this.addAlert(resultObj);
		}, 10);
	}
	check() {
		if (this.invoice.invoiceNumber === '') {
			this.needInvoiceNumber = false;
		}
	}
	// 新增联系人并附值
	newItemAdded(data, type) {
		let obj = null;
		const name = data.name || data.accountName;
		if (data && data.id && name) {
			obj = [{ id: data.id, text: name }];
		}
		this.getAllContact(false);
		// tslint:disable-next-line:switch-default
		switch (type) {
			case 'contact':
				this.defaultContact = obj;
				this.invoice.contact.id = obj[0].id;
				this.invoice.contact.name = obj[0].text;
				const temp = _.cloneDeep(this.invoice);
				this.invoice = temp;
				break;
		}
	}
	// 显示单价和税额
	displayDetail() {
		this.displayTax = !this.displayTax;
	}
	// 下拉框选择事件
	selected(e, type, i) {
		if (type === 'invoiceType') {
			this.invoice.invoiceType = { value: e.id, name: e.text };
			if (e.id === InvoiceTypeEnumModel.ValueEnum.General || e.id === InvoiceTypeEnumModel.ValueEnum.Professional) {
				this.invoiceStatusList = [
					{ id: InvoiceStatusEnumModel.ValueEnum.Self, text: '税控自开' },
					{ id: InvoiceStatusEnumModel.ValueEnum.Other, text: '税务代开' }];
				this.defaultinvoiceStatus = [];
				this.invoice.invoiceStatus = null;
			} else {
				this.invoiceStatusList = [{ id: InvoiceStatusEnumModel.ValueEnum.None, text: '未开发票' }];
				this.defaultinvoiceStatus = [{ id: InvoiceStatusEnumModel.ValueEnum.None, text: '未开发票' }];
				this.invoice.invoiceStatus = { value: InvoiceStatusEnumModel.ValueEnum.None, name: '未开发票' };
			}
			this.needInvoiceType = false;
		}
		if (type === 'invoiceStatus') {
			this.invoice.invoiceStatus = { value: e.id, name: e.text };
			this.needInvoiceStatus = false;
		}
		if (type === 'contact') {
			this.needContact = false;
			if (e.id === 'contact') {
				this.invoice.contact = { id: '', name: '' };
				this.defaultContact = [];
				this.changRef.detectChanges();
				this.newContact();
			} else {
				this.invoice.contact.id = e.id;
				this.invoice.contact.name = e.text;
			}
		}
		if (type === 'businessCategory') {
			this.invoice.invoiceItemModels[i].businessCategory = { id: e.id, name: e.text };
			this.invoice.invoiceItemModels[i].needBusinessCategory = false;
		}
		if (type === 'department') {
			this.invoice.invoiceItemModels[i].departmentType = { value: e.id, name: e.text };
			this.invoice.invoiceItemModels[i].needDepartmentType = false;
		}
		if (type === 'taxRate') {
			this.invoice.invoiceItemModels[i].taxRate = e.id;
			this.calculate(i);
		}
	}
	// 计算单价和税额
	calculate(i) {
		console.log(i);
		this.invoice.invoiceItemModels[i].amount = this.utilityService.reverseFormat(this.invoice.invoiceItemModels[i].amount);
		const list = this.invoice.invoiceItemModels[i];
		list.needAmount = false;
		if (list.amount === 0 || list.amount === '-') {
			list.taxAmount = 0;
			list.amountWithoutTax = 0;
		} else {
			list.taxAmount = Number(((list.amount - list.amount / (1 + list.taxRate))).toFixed(2));
			list.amountWithoutTax = Number((list.amount - list.taxAmount).toFixed(2));
		}
		this.blurCaculateSum();
	}
	// 获取所有联系人
	getAllContact(isAdd) {
		this.invoiceService.getAllContacts()
			.then(
			contactModel => {
				console.log(JSON.stringify(contactModel));
				this.contactsList = contactModel;
				if (isAdd === false) {

				} else {
					for (let i = 0; i < this.contactsList.length; i++) {
						if (this.contactsList[i].text === '(个)内部代表') {
							this.defaultContact = [{ id: this.contactsList[i].id, text: this.contactsList[i].text }];
							this.invoice.contact.id = this.defaultContact[0].id;
							this.invoice.contact.name = this.defaultContact[0].text;
							return;
						}
					}
				}

			})
			.catch(
			error => {
				this.alertDanger(error);
			}
			);
	}
	// 新增行
	newItem() {
		const list = this.invoice.invoiceItemModels;
		list.push(_.cloneDeep(this.invoiceItemModel));
	}
	// 删除子项
	deleteItem(data, i) {
		const list = this.invoice.invoiceItemModels;
		if (list && list.length < 1) {
			this.newItem();
		} else {
			list.splice(i, 1);
		}
		this.blurCaculateSum();
	}
	clearText(i) {
		this.invoice.invoiceItemModels[i].taxRate = 0;
		this.invoice.invoiceItemModels[i].taxRatePercent = '';
	}
	// 快捷键设置
	tab(e, i) {
		if (e.keyCode) {
			if (i === this.invoice.invoiceItemModels.length - 1) {
				if (e.keyCode === 9) {
					this.newItem();
				}
				if (e.keyCode === 13) {
					this.submit('');
				}
			}
		}
	}
	// 验证
	vertify() {
		let status = true;
		if (this.invoice.recordDate === undefined) {
			status = false;
		}
		if (this.invoice.invoiceType.value === '') {
			status = false;
			this.needInvoiceType = true;
		}
		if (this.isGeneralTaxpayer === true && this.invoice.invoiceType.value !== InvoiceTypeEnumModel.ValueEnum.None
			&& this.invoice.invoiceNumber === '') {
			status = false;
			this.needInvoiceNumber = true;
		}
		if (!this.invoice.invoiceStatus || this.invoice.invoiceStatus.value === '') {
			status = false;
			this.needInvoiceStatus = true;
		}
		if (!this.invoice.contact || this.invoice.contact.id === 'contact' || this.invoice.contact.id === '') {
			status = false;
			this.needContact = true;
		}
		const list = this.invoice.invoiceItemModels;
		for (let i = 0; i < list.length; i++) {
			if (list[i].taxRate < 0.03) {
				status = false;
				list[i].needtaxRate = true;
			}
			if (list[i].amount === 0 || list[i].amount === '0.00' || list[i].amount === '') {
				status = false;
				list[i].needAmount = true;
			}
			if (list[i].businessCategory.id.length === 0) {
				status = false;
				list[i].needBusinessCategory = true;
			}
			if (list[i].departmentType.value.length === 0) {
				status = false;
				list[i].needDepartmentType = true;
			}
		}
		return status;

	}
	// 提交保存
	submit(type) {
		if (!this.vertify()) {
			this.alertDanger('请完善相关信息');
			return;
		}
		this.invoice.tags = this.addTagList;
		this.invoice.attachmentModels = this.dataList;
		this.invoice.totalAmount = this.totalAmount;
		this.addNewInvoice(type);
	}
	// 获取所有类别
	getAllBusiness() {
		this.invoiceService.getAllBusiness('outputinvoice')
			.then(
			businessModel => {
				this.businessCategoryStatusList = businessModel;
			})
			.catch(
			error => {
				this.alertDanger(error);
			}
			);
	}
	upDataList(e) {
		this.dataList = e;
	}
	// 新增开票
	addNewInvoice(type) {
		const list = this.invoice.invoiceItemModels;
		for (let i = 0; i < list.length; i++) {
			delete list[i].taxRatePercent;
			delete list[i].taxAmount;
			delete list[i].amountWithoutTax;
			delete list[i].needBusinessCategory;
			delete list[i].needDepartmentType;
			delete list[i].needtaxRate;
		}
		this.invoiceService.newInvoice(this.invoice)
			.then(
			invoiceModel => {
				if (type === '') {
					this.router.navigate(['/app/invoice/output-invoice']);
				} else {
					this.alertSuccess('保存成功');
					const recordDate = this.invoice.recordDate;
					this.invoice.invoiceItemModels = [];
					this.invoice.invoiceItemModels.push(_.cloneDeep(this.invoiceItemModel));
					this.invoice.recordDate = recordDate;
					this.dataList = [];
					this.addTagList = [];
					this.totalAmount = 0;
					this.tag.isSaveNew();
				}
			})
			.catch(
			error => {
				this.alertDanger(error);
			}
			);
	}
	// 返回到开票列表
	quit(event) {
		if (event === ConfirmEventTypeEnum.Confirm) {
			this.router.navigate(['/app/invoice/output-invoice']);
		}
	}
	preview(itemId) {
		this.picturePreviewModal.show(this.dataList, itemId);
	}
	openConfirmModal() {
		const deleteMessage = '还未保存开票，是否继续退出？';
		this.confirmWidget.message = deleteMessage;
		this.confirmWidget.title = '提醒';
		this.confirmWidget.show();
	}
	// 获取当前账期
	accountAccountPeriod() {
		this.invoiceService.getAccountPeriod()
			.then(
			accountPeriodModel => {
				this.accountPeriod = accountPeriodModel;
				this.minDate = this.accountPeriod.currentYear + '-' + this.accountPeriod.currentMonth + '-1';
				const day = new Date(this.accountPeriod.currentYear, this.accountPeriod.currentMonth, 0);
				this.maxDate = this.accountPeriod.currentYear + '-' + this.accountPeriod.currentMonth + '-' + day.getDate();
				this.invoice.recordDate = moment(this.maxDate).format('L');
			})
			.catch(
			error => {
				this.alertDanger(error);
			}
			);
	}
	// 求合计金额
	blurCaculateSum() {
		this.totalAmount = 0;
		for (let i = 0; i < this.invoice.invoiceItemModels.length; i++) {
			if (this.invoice.invoiceItemModels[i].amount.length > 0) {
				this.invoice.invoiceItemModels[i].needAmount = false;
			}
			this.totalAmount += Number(this.invoice.invoiceItemModels[i].amount);
		}
	}
}
