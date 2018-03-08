import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

import { BusinessCategoryApi } from '../../../../api/accounting/api/BusinessCategoryApi';
import { AccountTransactionApi } from '../../../../api/accounting/api/AccountTransactionApi';
import { AccountTransactionTypeEnumModel } from '../../../../api/accounting/model/AccountTransactionTypeEnumModel';
import { UtilityService } from '../../../../service/core/utility';

import * as _ from 'lodash';

import { FormValidator } from '../../../../service/validators';
import { DetailService } from '../../shared/transaction.service';
import { AccountTransactionModels } from '../shared/detail.model';
@Component({
	selector: 'edit-income',
	templateUrl: 'edit-income.component.html',
	styleUrls: ['./edit-income.component.scss'],
})

export class EditIncomeComponent {
	@ViewChild('accountDetailsModal') public accountDetailsModal;
	@ViewChild('contactDetailsModal') public contactDetailsModal;
	@ViewChild('upload-attachments') public uploadNotes;
	@ViewChild('picturePreviewModal') public picturePreviewModal;
	// 上传附件临时储存
	dataList = [];
	// 上传附件类型
	type: string = 'image';
	// 上传附件地址
	upurl: string = '/api/v1/account_transaction/upload';

	// 初始化账户
	initBankAccount: any;
	// 初始化对方信息
	initContact: any;
	// 总金额
	theTotalAmount: number = 0;
	// 接收的ID
	initID: string;
	// 单行初始化数据
	transactionLineItem = {
		id: 0,
		amount: null,
		department: null,
		businessCategory: { id: '', name: '' },
		businessCategorys: [{ id: '', text: '' }],
		description: '',
		accountTransactionModel: {},
		order: 0,
		needBusinessCategory: false,
		needDepartment: false,
		needAmount: false
	};

	// 页面modal
	initTransaction = {
		lock: true,
		id: '',
		number: '',
		accountTransDate: this.getTodayDate(),
		contact: {
			id: '',
			name: ''
		},
		bankAccount: {
			id: '',
			name: ''
		},
		entityType: {
			value: AccountTransactionTypeEnumModel.ValueEnum.Income,
			name: '支出'
		},
		totalAmount: 0,
		accountTransLineItemModels: [{
			id: 0,
			amount: null,
			department: null,
			businessCategory: { id: '', name: '' },
			businessCategorys: [{ id: '', text: '' }],
			description: '',
			accountTransactionModel: {},
			order: 0,
			needBusinessCategory: false,
			needDepartment: false,
			needAmount: false
		}],
		tags: [{
			id: '',
			value: '',
			isDefault: null
		}],
		accountAttachmentModels: [{
			id: '',
			value: '',
			isDefault: null
		}]
	};
	transaction = _.cloneDeep(this.initTransaction);
	// 验证时间
	checkaccountTransDate: boolean = false;
	// 验证账户
	checkbankAccount: boolean = false;
	// 验证对方信息
	checkcontact: boolean = false;
	// 类别列表
	bussinessCategoryList = [];
	// 账户列表
	accountList: any;
	// 联系人列表
	contactList: any;
	// // 表单控制器
	transactionForm: FormGroup;
	// tag临时
	addTagList: any = [];
	// 账期
	minDate: any;
	maxDate: any;
	// 弹窗提示
	alert = {};

	public alertSuccess(msg: string) {
		this.alert = {};
		setTimeout(() => {
			this.alert = { type: 'success', msg: msg };
		}, 0);
		this.cleanAlert();

	}

	public alertDanger(msg: string) {
		this.alert = {};
		setTimeout(() => {
			this.alert = { type: 'danger', msg: msg };
		}, 0);
		this.cleanAlert();

	}

	public addAlert(alert: Object): void {
		this.alert = {};
		this.alert = alert;
		this.cleanAlert();
	}
	public cleanAlert() {
		setTimeout(() => {
			this.alert = {};
		}, 10000);
	}

	constructor(private formBuilder: FormBuilder, private detailService: DetailService,
		private businessCategoryApi: BusinessCategoryApi, private router: Router, private utilityService: UtilityService,
		private accountTransactionApi: AccountTransactionApi, private accountTransactionModels: AccountTransactionModels,
		private ref: ChangeDetectorRef,
		private activatedRoute: ActivatedRoute, private location: Location) {
		this.refreshFormGroup();

	}

	ngOnInit() {
		this.getAccount();
		this.getContact();
		this.getBussinessCategory();
		this.initID = this.activatedRoute.snapshot.params['id'];
		if (this.initID) {
			this.accountTransactionGet();
		} else {
			console.error('ID不存在');

		}
		this.AcquisitionPeriod();

		// this.getBussinessCategory();
	}

	// // 引入表单验证
	refreshFormGroup() {
		this.transactionForm = this.formBuilder.group({
			'accountTransDate': ['', Validators.compose([Validators.required, FormValidator.invalidDateFormat])],
			'contact': ['', FormValidator.selectRequireValidator],
			'bankAccount': ['', FormValidator.selectRequireValidator]
		});
	}


    /**
     * 获取全部账户列表
     *
     */
	getAccount() {
		this.detailService.getAccount().then(
			bankAccountModel => {
				this.accountList = bankAccountModel;
			},
			error => {
				console.error(error);
				this.alertDanger(error);

			}
		);
	}

    /**
     * 获取全部联系人列表
     *
     */
	getContact() {
		this.detailService.getContact().then(
			contactModel => {
				this.contactList = contactModel;
			},
			error => {
				this.alertDanger(error);

			}
		);
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

	// 新增行
	newItem() {
		if (this.transaction.lock) {

		} else {
			const list = this.transaction.accountTransLineItemModels;
			list.push(_.cloneDeep(this.transactionLineItem));
		}

	}

	// 删除行
	deleteItem(data, i) {
		const list = this.transaction.accountTransLineItemModels;
		if (list && list.length < 1) {
			this.newItem();
		} else {
			list.splice(i, 1);
		}
	}

	// 按照收支类型返回指定类型下的所有交易明细类
	getBussinessCategory() {
		this.businessCategoryApi.businessCategoryGetAll('Income')
			.subscribe(
			data => {
				const list: any = data;
				const dataPush = [];
				const children = [];
				_.forEach(list, item => {
					if (item.level === 1) {
						dataPush.push({
							id: item.id,
							text: item.name,
							children: []
						});
					} else {
						children.push(item);
					}
				});
				_.forEach(children, item => {
					let index;
					index = _.findIndex(dataPush, o => o.id === item.parentBusinessCategory.id);
					if (index !== -1) {
						dataPush[index].children.push({ id: item.id, text: item.name });
					}
				});
				this.bussinessCategoryList = dataPush;
				this.ref.detectChanges();
			},
			error => {
				console.log('error', error);
				this.alertDanger(error);

			}
			);
	}


	// 设置类别
	setTheCategory(e, i) {
		console.log(e);
		if (this.transaction.accountTransLineItemModels) {
			this.transaction.accountTransLineItemModels[i].businessCategorys[0].id = e.id;
			this.transaction.accountTransLineItemModels[i].businessCategorys[0].text = e.text;
			this.transaction.accountTransLineItemModels[i].businessCategory = { id: e.id, name: e.text };
			console.log(this.transaction.accountTransLineItemModels[i].businessCategory);
		} else {
			console.error(this.transaction);

		}

	}

	// 设置账户
	setBankAccount(e) {
		if (e.id === 'account') {
			this.accountDetailsModal.show();
			this.initBankAccount = [{ id: '', name: '' }];
			this.ref.detectChanges();
		} else {
			this.transaction.bankAccount.id = e.id;
			this.transaction.bankAccount.name = e.text;
		}


	}
	// 设置对方信息
	setContact(e) {
		if (e.id === 'contact') {
			this.contactDetailsModal.show();
			this.initContact = [{ id: '', name: '' }];
			this.transaction.contact.id = '';
			this.transaction.contact.name = '';
			this.ref.detectChanges();
		} else {
			this.transaction.contact.id = e.id;
			this.transaction.contact.name = e.text;
		}
		console.log(e);

	}


	// 提交前验证
	validation() {
		let check: boolean = true;
		console.log(this.transaction.accountTransDate);
		// 记账日期
		if (this.transaction.accountTransDate.length === 0) {
			this.checkaccountTransDate = true;
			this.alertDanger('请填写记账日期！');
			check = false;
			return;
		} else {
			this.checkaccountTransDate = false;
		}
		// 交易账户
		if (this.transaction.bankAccount.name.length === 0) {
			this.checkbankAccount = true;
			this.alertDanger('请填写交易账户！');
			check = false;
			return;
		} else {
			this.checkbankAccount = false;
		}
		// 对方信息
		if (this.transaction.contact.name.length === 0) {
			this.checkcontact = true;
			this.alertDanger('请填写对方信息！');
			check = false;
			return;
		} else {
			this.checkcontact = false;
		}
		const list = this.transaction.accountTransLineItemModels;
		for (let i = 0; i < list.length; i++) {
			if (list[i].amount === '0.00' || list[i].amount === 0 || list[i].amount === null) {
				list[i].needAmount = true;
				check = false;
				this.alertDanger('金额不能为0');
				return;
			}
			if (list[i].businessCategory.id.length === 0) {
				// list[i].businessCategory.name = list[i].businessCategorys[0].text;
				// list[i].businessCategory.id = list[i].businessCategorys[0].id;
				list[i].needBusinessCategory = true;
				check = false;
			}
		}
		console.log('aaa');
		this.transaction.accountTransLineItemModels = list;
		// 保存标签
		this.transaction.tags = this.addTagList;
		// 保存票据
		this.transaction.accountAttachmentModels = this.dataList;
		if (check) {
			this.save();
		} else {
			this.alertDanger('请填写完整！');
		}
	}

	// 保存
	save() {
		console.log(this.transaction);
		this.accountTransactionApi.accountTransactionPut(this.transaction).subscribe(
			accountTransactionModel => {
				console.log(accountTransactionModel);
				this.alertSuccess('保存成功');
				this.router.navigate(['/app/transaction/list']);

			},
			error => {
				console.log(error);
				this.alertDanger(error);
			}
		);
	}
	// 返回
	back() {
		this.location.back();
	}

	// 进页面获取数据

	accountTransactionGet() {
		this.accountTransactionApi.accountTransactionGet(this.initID).subscribe(
			accountTransactionModel => {
				const temp: any = accountTransactionModel;
				this.initContact = [{ id: temp.contact.id, name: temp.contact.name }];
				this.initBankAccount = [{ id: temp.bankAccount.id, name: temp.bankAccount.name }];
				temp.accountTransDate = temp.accountTransDate.substr(0, 10);
				_.forEach(temp.accountTransLineItemModels, item => {
					item.businessCategorys = item.businessCategory ?
						[{ id: item.businessCategory.id, text: item.businessCategory.name }] : null;
				});
				this.transaction = temp;
				if (this.transaction.tags) {
					this.addTagList = this.transaction.tags;
				}
				if (accountTransactionModel.accountAttachmentModels) {
					this.dataList = this.replaceTheURL(accountTransactionModel.accountAttachmentModels);

				}
				this.TotalAmount();

			},
			error => {
				console.log(error);
				this.alertDanger(error);

			}
		);

	}

	// 计算总金额
	TotalAmount() {
		this.theTotalAmount = 0;
		for (let i = 0; i < this.transaction.accountTransLineItemModels.length; i++) {
			this.transaction.accountTransLineItemModels[i].amount =
				this.utilityService.reverseFormat(this.transaction.accountTransLineItemModels[i].amount);
			this.theTotalAmount += Number(this.transaction.accountTransLineItemModels[i].amount);
		}
	}

    /**
     * 创建新账户||联系人后刷新
     *
     * @param {any} data
     * @param {any} type
     *
     * @memberof IncomeComponent
     */
	newItemAdded(data, type) {
		if (type === 'contact') {
			this.getContact();
			this.initContact = [{ id: data.id, name: data.name }];
			this.setContact({ id: data.id, text: data.name });
		} else if (type === 'account') {
			this.getAccount();
			this.initBankAccount = [{ id: data.id, name: data.accountName }];
			this.setBankAccount({ id: data.id, text: data.accountName });
		}
		this.ref.detectChanges();

		console.warn('创建新账户||联系人后刷新');
		console.warn(data);
		console.warn(type);
	}


	// 预览大图
	preview(itemId) {
		if (this.transaction.id || this.transaction.id.length > 5) {
			this.picturePreviewModal.show(this.dataList, itemId, this.transaction.id);
		} else {
			this.picturePreviewModal.show(this.dataList, itemId);
		}
	}

	upDataList(e) {
		this.dataList = e;
	}

	// 替换URL
	replaceTheURL(data) {

		const temp: Array<any> = data;
		// 匹配最后一个小数点后面的内容 加上—_s 再去替换
		const re = /\.[^\.]+\s*?$/i;
		for (let i = 0; temp.length > i; i++) {

			const e = temp[i].url.match(re);
			const f = '_s' + e[0];
			// let b = this.cacheImage[0].url.replace(re, f);
			temp[i].surl = temp[i].url.replace(re, f);

		}
		// 替换URL

		for (let i = 0; i < temp.length; i++) {
			this.dataList.push(temp[i]);
		}
		return temp;
	}

	result(e) {
		this.alert = {};
		this.addAlert(e);
	}
	// 获取账期
	AcquisitionPeriod() {
		this.detailService.AcquisitionPeriod()
			.then(
			(period) => {
				this.minDate = period.minDate;
				this.maxDate = period.maxDate;
			}
			)
			.catch(
			(error) => {
				console.log(error);
			}
			);
	}


}
