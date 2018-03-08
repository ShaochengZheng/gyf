import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import * as _ from 'lodash';

import { AuthorizationService } from '../../../../service/core';
import { InvoiceService } from '../../shared/invoice.service';
import { AccountPeriodModel } from '../../../../api/accounting/model/AccountPeriodModel';
import { InvoiceTypeEnumModel } from '../../../../api/accounting/model/InvoiceTypeEnumModel';
import { InvoiceStatusEnumModel } from '../../../../api/accounting/model/InvoiceStatusEnumModel';
import { ConfirmWidget, ConfirmEventTypeEnum } from '../../../widget/confirm/confirm';
import { UtilityService } from '../../../../service/core/utility';

@Component({
	selector: 'edit-input-invoice',
	templateUrl: 'edit-input-invoice.component.html',
	styleUrls: ['edit-input-invoice.component.scss'],
	providers: [InvoiceService]
})

export class EditInputInvoiceComponent implements OnInit {
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
	// 开票类别列表
	businessCategoryStatusList: Array<Object> = [];
	// 专票开票类别列表
	professionalBusiness = [];
	// 往来列表
	contactsList: Array<Object> = [];
	// 发票类型列表
	invoiceTypeList = [
		{ id: InvoiceTypeEnumModel.ValueEnum.General, text: '普票' },
		{ id: InvoiceTypeEnumModel.ValueEnum.Professional, text: '专票' }];
	// 默认发票
	defaultinvoiceType = [{ id: InvoiceTypeEnumModel.ValueEnum.General, text: '普票' }];
	// 税率列表
	taxRateList = [];
	//  进项税类别
	businessTaxWithCategory = [];
	// 自定义的model
	invoiceModel = {
		number: 0,
		totalAmount: 0,
		recordType: { value: 'InputInvoice', name: '' },
		invoiceType: { value: InvoiceTypeEnumModel.ValueEnum.None, name: '无票' },
		invoiceStatus: { value: InvoiceStatusEnumModel.ValueEnum.None, name: '未开发票' },
		invoiceItemModels: [
			{
				businessCategory: [],
				taxCategory: [],
				inputTaxCategory: [],
				departmentType: [],
				amount: 0,
				taxRate: 0.03,
				taxRatePercent: [{ id: 0.03, text: '3%' }],
				description: '',
				taxAmount: 0,
				amountWithoutTax: 0,
				needBusinessCategory: false,
				needInputTaxCategory: false,
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
		attachmentModels: [],
		lock: false,
		recordDate: this.getTodayDate(),
		invoiceNumber: ''
	};
	invoice: any = _.cloneDeep(this.invoiceModel);
	// 子项model
	invoiceItemModel = {
		businessCategory: [],
		taxCategory: [],
		inputTaxCategory: [],
		departmentType: [],
		amount: 0,
		taxRate: 0.03,
		taxRatePercent: [{ id: 0.03, text: '3%' }],
		description: '',
		taxAmount: 0,
		amountWithoutTax: 0,
		needBusinessCategory: false,
		needInputTaxCategory: false,
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
	needContact: boolean = false;
	// tag临时
	addTagList: any = [];
	// 上传附件临时储存
	dataList = [];
	// 上传附件类型
	type: string = 'image';
	// 上传附件地址
	upurl: string = '/api/v1/invoice/upload';
	// 默认联系人
	defaultContact = [];
	minDate: any = '';
	maxDate: any = '';
	// 合计金额
	totalAmount: number = 0;
	needInvoiceNumber = false;
	needInvoiceType: boolean = false;
	// 是否是一般纳税人
	isGeneralTaxpayer: boolean = false;
	// 是否显示进项税
	isDisplayBusinessTaxWithCategory: boolean = false;
	// 默认的进项税类别
	defaultTaxCategory = [];
	constructor(private invoiceService: InvoiceService, private router: Router, private route: ActivatedRoute,
		private utilityService: UtilityService,
		private changRef: ChangeDetectorRef, private location: Location, private authorizationService: AuthorizationService) {
		this.taxGetBusinessTaxWithCategory();
		this.getAllContact();
		this.accountAccountPeriod();
		if (this.route.snapshot.params['id']) {
			this.search(this.route.snapshot.params['id']);
		} else {
			this.router.navigate(['/login']);
		}
		if (this.authorizationService.Session.currentAccount.companyProperty === 'GeneralTaxpayer') {
			this.isGeneralTaxpayer = true;
		} else {
			this.isGeneralTaxpayer = false;
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
	check() {
		if (this.invoice.invoiceNumber !== '') {
			this.needInvoiceNumber = false;
		}
	}
	// 显示单价和税额
	displayDetail() {
		this.displayTax = !this.displayTax;
	}
	// 下拉框选择事件
	selected(e, type, i) {
		if (type === 'invoiceType') {
			const data = this.businessCategoryStatusList;
			this.businessCategoryStatusList = [];
			this.invoice.invoiceType = { value: e.id, name: e.text };
			this.needInvoiceType = false;
			if (e.id === InvoiceTypeEnumModel.ValueEnum.Professional) {
				this.isDisplayBusinessTaxWithCategory = true;
				this.filterBusiness(data, true);
			} else {
				this.isDisplayBusinessTaxWithCategory = false;
				this.getAllBusiness();
			}
			this.changRef.detectChanges();
			for (let n = 0; n < this.invoice.invoiceItemModels.length; n++) {
				this.invoice.invoiceItemModels[n].taxCategory = this.filterCategory(this.invoice.invoiceItemModels[n].taxRate);
			}
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
			this.invoice.invoiceItemModels[i].inputTaxCategory = null;
			this.invoice.invoiceItemModels[i].taxCategory = [];
			this.invoice.invoiceItemModels[i].taxCategory = this.filterCategory(e.id);
		}
		if (type === 'taxCategory') {
			this.invoice.invoiceItemModels[i].inputTaxCategory = [{ id: e.id, name: e.text }];
			this.invoice.invoiceItemModels[i].needInputTaxCategory = false;
		}
	}
	// 计算单价和税额
	calculate(i) {
		this.invoice.invoiceItemModels[i].amount = this.utilityService.reverseFormat(this.invoice.invoiceItemModels[i].amount);
		const list = this.invoice.invoiceItemModels[i];
		list.needAmount = false;
		if (list.amount === 0) {
			return;
		} else {
			list.taxAmount = Number(((list.amount - list.amount / (1 + list.taxRate))).toFixed(2));
			list.amountWithoutTax = Number((list.amount - list.taxAmount).toFixed(2));
		}
		this.blurCaculateSum();
	}
	// 根据税率筛选进项税类别
	filterCategory(tax) {
		const datatemp = [];
		for (let x = 0; x < this.businessTaxWithCategory.length; x++) {
			if (tax === this.businessTaxWithCategory[x].taxVal) {
				for (let y = 0; y < this.businessTaxWithCategory[x].inputTaxCategory.length; y++) {
					datatemp.push({
						id: this.businessTaxWithCategory[x].inputTaxCategory[y].id,
						text: this.businessTaxWithCategory[x].inputTaxCategory[y].name
					});
				}
				if (tax === 0.03) {
					this.defaultTaxCategory = datatemp;
				}
				return datatemp;
			}
		}
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
	// 获取所有类别
	getAllBusiness() {
		this.invoiceService.getAllBusiness('inputinvoice')
			.then(
			businessModel => {
				if (this.invoice.invoiceType.value === 'Professional') {
					this.filterBusiness(businessModel, true);
				} else {
					this.businessCategoryStatusList = businessModel;
				}
			})
			.catch(
			error => {
				this.alertDanger(error);
			}
			);
	}
	// 快捷键
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
	// 新增行
	newItem() {
		if (this.invoice.lock === true) {
			return;
		}
		const list = this.invoice.invoiceItemModels;
		this.invoiceItemModel.taxCategory = this.defaultTaxCategory;
		list.push(_.cloneDeep(this.invoiceItemModel));
		console.log(this.defaultTaxCategory);
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
	//  验证
	vertify() {
		let status = true;
		if (this.invoice.recordDate === undefined) {
			status = false;
		}
		if (this.invoice.invoiceType.value === 'Professional' && this.invoice.invoiceNumber === '') {
			status = false;
			this.needInvoiceNumber = true;
		}
		if (!this.invoice.contact || this.invoice.contact.id === 'contact' || this.invoice.contact.id === '') {
			status = false;
			this.needContact = true;
		}
		const list = this.invoice.invoiceItemModels;
		for (let i = 0; i < list.length; i++) {
			if (list[i].amount === 0 || list[i].amount === '0.00' || list[i].amount === '') {
				status = false;
				list[i].needAmount = true;
			}
			if (!list[i].businessCategory || list[i].businessCategory.length === 0) {
				status = false;
				list[i].needBusinessCategory = true;
			}
			if (this.isGeneralTaxpayer === true && this.invoice.invoiceType.value === 'Professional' &&
				(!list[i].inputTaxCategory || list[i].inputTaxCategory === null)) {
				status = false;
				list[i].needInputTaxCategory = true;
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
			this.invoice.tags = this.addTagList;
			this.invoice.totalAmount = this.totalAmount;
			this.invoice.attachmentModels = this.dataList;
			const list = this.invoice.invoiceItemModels;
			for (let i = 0; i < list.length; i++) {
				delete list[i].taxAmount;
				delete list[i].amountWithoutTax;
				delete list[i].taxCategory;
				delete list[i].needBusinessCategory;
				delete list[i].needDepartmentType;
				delete list[i].needInputTaxCategory;
				delete list[i].needAmount;
				delete list[i].needtaxRate;
				if (list[i].businessCategory[0]) {
					list[i].businessCategory = { id: list[i].businessCategory[0].id, name: list[i].businessCategory[0].text };
					list[i].departmentType = { value: list[i].departmentType[0].id, name: list[i].departmentType[0].text };
				}
				if (this.invoice.invoiceType.value === 'Professional' && list[i].inputTaxCategory[0]) {
					list[i].inputTaxCategory = { id: list[i].inputTaxCategory[0].id, name: list[i].inputTaxCategory[0].text };
				} else if (this.isGeneralTaxpayer === false) {
					list[i].inputTaxCategory = null;
					list[i].taxRate = 0;
				} else {
					list[i].inputTaxCategory = null;
				}
			}
			// 当从专票改成普票后，清空发票号
			if (this.invoice.invoiceNumber !== '' && this.invoice.invoiceType.value !== 'Professional') {
				this.invoice.invoiceNumber = '';
			}
			this.modifyNewInvoice(this.invoice);
		}
	}
	// 修改开票
	modifyNewInvoice(model) {
		this.invoiceService.modifyInvoice(model)
			.then(
			invoiceModel => {
				this.router.navigate(['/app/invoice/input-invoice']);
			})
			.catch(
			error => {
				this.alertDanger(error);
			}
			);
	}
	// 返回到收票列表
	quit(event) {
		if (event === ConfirmEventTypeEnum.Confirm) {
			this.location.back();
		}
	}
	// 根据ID搜索发票
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
				this.defaultinvoiceType = [{ id: this.invoice.invoiceType.value, text: this.invoice.invoiceType.name }];
				if (this.invoice.invoiceType.value === 'Professional') {
					this.isDisplayBusinessTaxWithCategory = true;
				} else {
					this.isDisplayBusinessTaxWithCategory = false;
				}
				for (let i = 0; i < this.invoice.invoiceItemModels.length; i++) {
					this.invoice.invoiceItemModels[i].taxCategory = this.filterCategory(this.invoice.invoiceItemModels[i].taxRate);
				}
				this.getAllBusiness();
				this.blurCaculateSum();
			})
			.catch(
			error => {
				this.alertDanger(error);
			}
			);
	}
	preview(itemId) {
		this.picturePreviewModal.show(this.dataList, itemId);
	}
	openConfirmModal() {
		if (this.invoice.lock === false) {
			const deleteMessage = '还未保存收票，是否继续退出？';
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
	// 获取进项税类别和税率
	taxGetBusinessTaxWithCategory() {
		this.invoiceService.getBusinessTax('GetInvoice')
			.then(
			model => {
				this.businessTaxWithCategory = model;
				this.taxRateList = [];
				for (let i = 0; i < this.businessTaxWithCategory.length; i++) {
					this.taxRateList.push({
						id: this.businessTaxWithCategory[i].taxVal, text: (this.businessTaxWithCategory[i].taxVal * 100).toString() + '%'
					});
				}
				this.invoice.invoiceItemModels[0].taxCategory = this.filterCategory(0.03);
			}
			)
			.catch(
			error => {
				this.alertDanger(error);
			}
			);
	}
	// 筛选当发票类型是专票的时候的类别
	filterBusiness(data, type) {
		this.invoiceService.filterBusiness(data, type)
			.then(
			list => {
				// 编辑时，如果从普票到专票改变，如果子项的类别含下列选项时，则被清空
				for (let i = 0; i < this.invoice.invoiceItemModels.length; i++) {
					if (this.invoice.invoiceItemModels[i].businessCategory.length !== 0 &&
						(this.invoice.invoiceItemModels[i].businessCategory[0].text === '劳务费' ||
							this.invoice.invoiceItemModels[i].businessCategory[0].text === '行政罚款' ||
							this.invoice.invoiceItemModels[i].businessCategory[0].text === '税务滞纳金' ||
							this.invoice.invoiceItemModels[i].businessCategory[0].text === '印花税' ||
							this.invoice.invoiceItemModels[i].businessCategory[0].text === '残保金' ||
							this.invoice.invoiceItemModels[i].businessCategory[0].text === '减免税款')) {
						this.invoice.invoiceItemModels[i].businessCategory = [];
					}
				}
				this.professionalBusiness = list;
			}
			)
			.catch(
			error => {
				this.alertDanger(error);
			}
			);
	}
}
