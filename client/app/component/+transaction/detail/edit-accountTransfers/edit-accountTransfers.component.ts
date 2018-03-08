import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { UtilityService } from '../../../../service/core/utility';

import { BankTransferApi } from '../../../../api/accounting/api/BankTransferApi';
import { FormValidator } from '../../../../service/validators';
import { DetailService } from '../../shared/transaction.service';
@Component({
	selector: 'edit-accountTransfers',
	templateUrl: 'edit-accountTransfers.component.html',
	styleUrls: ['./edit-accountTransfers.component.scss'],
	providers: [BankTransferApi],

})

export class EditAccountTransfersComponent implements OnInit {
	@ViewChild('accountDetailsModal') public accountDetailsModal;
	@ViewChild('upload-attachments') public uploadNotes;
	@ViewChild('picturePreviewModal') public picturePreviewModal;
	transactionForm: FormGroup;
	// 初始化资金来源
	fromBankAccounts = [];
	// 初始化资金流向
	toBankAccounts = [];
	// 是否是资金来源
	isFromBankAccounts: boolean = true;
	// 上传附件临时储存
	dataList = [];
	// 上传附件类型
	type: string = 'image';
	// 上传附件地址
	upurl: string = '/api/v1/account_transaction/upload';
	// 账户列表
	accountList: any;
	// 提交用modal
	bankTransferModel = {
		id: '',
		number: '',
		accountTransDate: this.getTodayDate(),
		fromBankAccount: {
			id: '',
			name: ''
		},
		toBankAccount: {
			id: '',
			name: ''
		},
		transferAmount: 0,
		description: '',
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
	// tag临时
	addTagList: any;
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


	constructor(private formBuilder: FormBuilder, private bankTransferApi: BankTransferApi, private location: Location,
		private utilityService: UtilityService,
		private detailService: DetailService, private router: Router, private activatedRoute: ActivatedRoute, private ref: ChangeDetectorRef) {
		this.refreshFormGroup();

	}


	ngOnInit() {
		this.getAccount();
		const id = this.activatedRoute.snapshot.params['id'];
		if (id) {
			this.bankTransferGet(id);
		} else {
			this.alertDanger('参数错误');
		}
		console.log(id);
		this.AcquisitionPeriod();


	}

	// 引入表单验证
	refreshFormGroup() {
		this.transactionForm = this.formBuilder.group({
			'accountTransDate': ['', Validators.compose([Validators.required, FormValidator.invalidDateFormat])],
			'transferAmount': ['', Validators.compose([Validators.required])],
			'fromBankAccount': ['', FormValidator.selectRequireValidator],
			'toBankAccount': ['', FormValidator.selectRequireValidator]
		});
	}

    /**
     * 修改银行互转
     *
     * @param bankTransferModel
     */
	bankTransferPost() {
		this.bankTransferApi.bankTransferUpdate(this.bankTransferModel).subscribe(
			bankTransferModel => {
				this.alertSuccess('保存成功');
				console.log(bankTransferModel);
				this.router.navigate(['/app/transaction/list']);
			},
			error => {
				console.error(error);
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

    /**
     * 获取银行互转
     *
     * @param id
     */
	bankTransferGet(id) {
		this.bankTransferApi.bankTransferGet(id).subscribe(
			bankTransferModel => {
				const temp: any = bankTransferModel;
				temp.accountTransDate = temp.accountTransDate.substr(0, 10);
				this.fromBankAccounts = [{ id: temp.fromBankAccount.id, name: temp.fromBankAccount.name }];
				this.toBankAccounts = [{ id: temp.toBankAccount.id, name: temp.toBankAccount.name }];
				this.addTagList = temp.tags;
				if (temp.accountAttachmentModels) {
					this.dataList = this.replaceTheURL(temp.accountAttachmentModels);
				}
				this.bankTransferModel = temp;
			},
			error => {
				console.error(error);
				this.alertDanger(error);

			}
		);
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

	// 流向
	setFlow(e, type) {
		if (e.id === 'account') {
			if (type === 'from') {
				this.accountDetailsModal.show();
				this.fromBankAccounts = [{ id: '', name: '' }];
				this.bankTransferModel.fromBankAccount = { id: '', name: '' };
				this.ref.detectChanges();
				this.isFromBankAccounts = true;
			} else if (type === 'to') {
				this.accountDetailsModal.show();
				this.toBankAccounts = [{ id: '', name: '' }];
				this.bankTransferModel.toBankAccount = { id: '', name: '' };
				this.ref.detectChanges();
				this.isFromBankAccounts = false;
			} else {
				console.error('类型？');
			}

		} else {
			if (type === 'from') {
				this.bankTransferModel.fromBankAccount = { id: e.id, name: e.text };
			} else if (type === 'to') {
				this.bankTransferModel.toBankAccount = { id: e.id, name: e.text };

			} else {
				console.error('类型？');
			}
		}
		console.log(e);
		console.log(type);
	}

	// 验证
	validation() {
		// 记账日期
		if (this.bankTransferModel.accountTransDate === undefined || this.bankTransferModel.accountTransDate.length === 0) {
			this.alertDanger('请填写记账日期！');
			return;
		}
		if (this.bankTransferModel.fromBankAccount.id === '' || this.bankTransferModel.toBankAccount.id === '') {
			this.alertDanger('账户不能为空');
			return;
		}

		if (this.bankTransferModel.fromBankAccount.id === this.bankTransferModel.toBankAccount.id) {
			this.alertDanger('账户不能相同');
			return;
		}
		if (this.bankTransferModel.fromBankAccount.id === '' ||
			this.bankTransferModel.toBankAccount.id === '') {
			this.alertDanger('请选择账户');
			return;
		}
		this.bankTransferModel.tags = this.addTagList;
		this.bankTransferModel.accountAttachmentModels = this.dataList;
		this.bankTransferModel.transferAmount = this.utilityService.reverseFormat(this.bankTransferModel.transferAmount);
		const temp: any = this.bankTransferModel.transferAmount;
		if (temp === '0.00' || temp === 0 || temp === null) {
			this.alertDanger('金额不能为0');
		} else {
			this.bankTransferPost();

		}

	}


	// 预览大图
	preview(itemId) {
		this.picturePreviewModal.show(this.dataList, itemId);
	}

	result(e) {
		this.alert = {};
		this.addAlert(e);
	}

	upDataList(e) {
		this.dataList = e;
	}
	// 返回
	back() {
		this.location.back();
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
		return temp;

	}
	// 获取账期
	AcquisitionPeriod() {
		this.detailService.AcquisitionPeriod()
			.then(
			(period) => {
				this.minDate = period.minDate;
				this.maxDate = period.maxDate;
			})
			.catch(
			(error) => {
				console.log(error);
			});
	}
	newItemAdded(e) {
		console.error(e);
		this.getAccount();
		if (this.isFromBankAccounts) {
			this.fromBankAccounts = [{ id: e.id, name: e.accountName }];
			this.setFlow({ id: e.id, text: e.accountName }, 'from');
		} else {
			this.toBankAccounts = [{ id: e.id, name: e.accountName }];
			this.setFlow({ id: e.id, text: e.accountName }, 'to');
		}
		this.ref.detectChanges();
	}
}
