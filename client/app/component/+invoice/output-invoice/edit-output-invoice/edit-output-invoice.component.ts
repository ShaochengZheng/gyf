import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import * as _ from 'lodash';
import * as moment from 'moment';

import { InvoiceService } from '../../shared/invoice.service';
import { InvoiceTypeEnumModel } from '../../../../api/accounting/model/InvoiceTypeEnumModel';
import { InvoiceStatusEnumModel } from '../../../../api/accounting/model/InvoiceStatusEnumModel';
import { AccountPeriodModel } from '../../../../api/accounting/model/AccountPeriodModel';
import { AuthorizationService } from '../../../../service/core';
import { UtilityService } from '../../../../service/core/utility';
import { ConfirmWidget, ConfirmEventTypeEnum } from '../../../widget/confirm/confirm';

@Component({
	selector: 'edit-output-invoice',
	templateUrl: 'edit-output-invoice.component.html',
	styleUrls: ['edit-output-invoice.component.scss'],
	providers: [InvoiceService]
})

export class EditOutputInvoiceComponent implements OnInit {
	@ViewChild('contactDetailsModal') public contactDetailsModal;
	@ViewChild('upload-attachments') public uploadNotes;
	@ViewChild('picturePreviewModal') public picturePreviewModal;
	@ViewChild('confirmWidget') public confirmWidget: ConfirmWidget;
	@ViewChild('cancelModal') public cancelModal: ConfirmWidget;
	// 弹出提示框
	alert = {};
	// 显示税率
	displayTax: boolean = false;
	// 部门性质
	departmentTypeList = [{ id: 'Sales', text: '销售部门' }, { id: 'Management', text: '管理部门' }];
	// 税率列表
	taxRateList = [];
	// 发票类型列表
	invoiceTypeList = [{ id: InvoiceTypeEnumModel.ValueEnum.General, text: '普票' },
	{ id: InvoiceTypeEnumModel.ValueEnum.Professional, text: '专票' },
	{ id: InvoiceTypeEnumModel.ValueEnum.None, text: '无票' }];
	// 发票状态列表
	invoiceStatusList = [{ id: InvoiceStatusEnumModel.ValueEnum.Self, text: '税控自开' },
	{ id: InvoiceStatusEnumModel.ValueEnum.Other, text: '税务代开' }];
	// 开票类别列表
	businessCategoryStatusList: Array<Object> = [];
	// 往来列表
	contactsList: Array<Object> = [];
	// 自定义的model
	invoiceModel = {
		number: 0,
		totalAmount: 0,
		recordType: { value: 'OutputInvoice', name: '' },
		invoiceType: { value: '', name: '' },
		invoiceStatus: { value: '', name: '' },
		invoiceItemModels: [
			{
				businessCategory: [],
				departmentType: [],
				inputTaxCategory: null, // 进项税类别
				amount: '0.00',
				taxRate: 0,
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
		tags: [],
		contact: {
			id: '',
			name: ''
		},
		lock: false,
		recordDate: this.getTodayDate(),
		attachmentModels: [],
		invoiceNumber: ''
	};
	invoice: any = _.cloneDeep(this.invoiceModel);
	// 子项model
	invoiceItemModel = {
		businessCategory: [],
		departmentType: [],
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
	// 默认发票列表
	defaultinvoiceStatus = [];
	// 默认发票
	defaultinvoiceType = [];
	// 默认联系人
	defaultContact = [];
	minDate: any = '';
	maxDate: any = '';
	taxTateSettting: number = 0;
	// 合计金额
	totalAmount: number = 0;
	needInvoiceNumber = false;
	// 是否是一般纳税人
	isGeneralTaxpayer: boolean = false;
	constructor(private invoiceService: InvoiceService, private router: Router, private route: ActivatedRoute,
		private changRef: ChangeDetectorRef, private utilityService: UtilityService,
		private authorizationService: AuthorizationService
		, private location: Location) {
		this.getAllContact();
		this.getAllBusiness();
		this.accountAccountPeriod();
		if (this.route.snapshot.params['id']) {
			this.search(this.route.snapshot.params['id']);
		} else {
			this.router.navigate(['/login']);
		}
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

	// 获取当前日期
	public getTodayDate() {
		const date = new Date();
		const seperator = '-';
		const year = date.getFullYear();
		const month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
		const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
		const currentdate: any = year + seperator + month + seperator + day;
		return currentdate;
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
		this.getAllContact();
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
			this.invoice.invoiceItemModels[i].businessCategory = [{ id: e.id, name: e.text }];
			this.invoice.invoiceItemModels[i].needBusinessCategory = false;
		}
		if (type === 'department') {
			this.invoice.invoiceItemModels[i].departmentType = [{ value: e.id, name: e.text }];
			this.invoice.invoiceItemModels[i].needDepartmentType = false;
		}
		if (type === 'taxRate') {
			this.invoice.invoiceItemModels[i].taxRate = e.id;
			this.calculate(i);
		}
	}
	// 计算单价和税额
	calculate(i) {
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
	getAllContact() {
		this.invoiceService.getAllContacts()
			.then(
			contactModel => {
				this.contactsList = contactModel;
			})
			.catch(
			error => {
				this.alertDanger(error);
			}
			);
	}
	// 新增行
	newItem() {
		if (this.invoice.lock === true) {
			return;
		}
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
			if (!list[i].businessCategory || list[i].businessCategory.length === 0) {
				status = false;
				list[i].needBusinessCategory = true;
			}
			if (!list[i].departmentType || list[i].departmentType.length === 0) {
				status = false;
				list[i].needDepartmentType = true;
			}
		}
		return status;

	}
	upDataList(e) {
		this.dataList = e;
	}
	// 提交保存
	submit(type) {
		if (!this.vertify()) {
			this.alertDanger('请完善相关信息');
			return;
		}
		if (type === '') {
			this.invoice.attachmentModels = this.dataList;
			this.invoice.tags = this.addTagList;
			this.invoice.totalAmount = this.totalAmount;
			const list = this.invoice.invoiceItemModels;
			for (let i = 0; i < list.length; i++) {
				delete list[i].taxRatePercent;
				delete list[i].taxAmount;
				delete list[i].amountWithoutTax;
				delete list[i].needBusinessCategory;
				delete list[i].needDepartmentType;
				delete list[i].needtaxRate;
				if (list[i].businessCategory[0]) {
					list[i].businessCategory = { id: list[i].businessCategory[0].id, name: list[i].businessCategory[0].text };
					list[i].departmentType = { value: list[i].departmentType[0].id, name: list[i].departmentType[0].text };
				}
			}
			console.log(this.invoice);
			this.modifyNewInvoice(this.invoice);
		} else {

		}
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
	// 修改开票
	modifyNewInvoice(model) {
		this.invoiceService.modifyInvoice(model)
			.then(
			invoiceModel => {
				this.router.navigate(['/app/invoice/output-invoice']);
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
			this.location.back();
		}
	}
	// 根据ID搜索开票
	search(id) {
		this.invoiceService.getInvoiceById(id)
			.then(
			invoiceModel => {
				if (invoiceModel.tags !== null) {
					this.addTagList = invoiceModel.tags;
				}
				if (invoiceModel.attachmentModels !== null) {
					this.dataList = this.invoiceService.replaceTheURL(invoiceModel.attachmentModels);
				}
				this.invoice = invoiceModel;
				this.defaultContact = [{ id: this.invoice.contact.id, text: this.invoice.contact.name }];
				this.defaultinvoiceStatus = [{ id: this.invoice.invoiceStatus.value, text: this.invoice.invoiceStatus.name }];
				this.defaultinvoiceType = [{ id: this.invoice.invoiceType.value, text: this.invoice.invoiceType.name }];
				this.blurCaculateSum();
			})
			.catch(
			error => {
				this.alertDanger(error);
			}
			);
	}
	// 图片预览
	preview(itemId) {
		console.log(JSON.stringify(this.dataList));
		this.picturePreviewModal.show(this.dataList, itemId);
	}
	// 退出提示
	openConfirmModal() {
		if (this.invoice.lock === false) {
			const deleteMessage = '还未保存开票，是否继续退出？';
			this.confirmWidget.message = deleteMessage;
			this.confirmWidget.title = '提醒';
			this.confirmWidget.show();
		} else {
			this.location.back();
		}
	}
	// 获取当前账期
	accountAccountPeriod() {
		this.invoiceService.getAccountPeriod()
			.then(
			accountPeriodModel => {
				this.accountPeriod = accountPeriodModel;
				if (this.invoice.lock !== true) {
					this.minDate = this.accountPeriod.currentYear + '-' + this.accountPeriod.currentMonth + '-1';
					const day = new Date(this.accountPeriod.currentYear, this.accountPeriod.currentMonth, 0);
					this.maxDate = this.accountPeriod.currentYear + '-' + this.accountPeriod.currentMonth + '-' + day.getDate();
					this.invoice.recordDate = moment(this.maxDate).format('L');

				}
			}
			)
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
