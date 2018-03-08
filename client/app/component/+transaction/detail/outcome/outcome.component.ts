import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { BusinessCategoryApi } from '../../../../api/accounting/api/BusinessCategoryApi';
import { AccountTransactionApi } from '../../../../api/accounting/api/AccountTransactionApi';
import { AccountTransactionTypeEnumModel } from '../../../../api/accounting/model/AccountTransactionTypeEnumModel';
import * as _ from 'lodash';
import { UtilityService } from '../../../../service/core/utility';

import { FormValidator } from '../../../../service/validators';
import { DetailService } from '../../shared/transaction.service';
import { AccountTransactionModels } from '../shared/detail.model';
@Component({
    selector: 'outcome',
    templateUrl: 'outcome.component.html',
    styleUrls: ['./outcome.component.scss'],
})

export class OutcomeComponent {
    @ViewChild('accountDetailsModal') public accountDetailsModal;
    @ViewChild('contactDetailsModal') public contactDetailsModal;
    @ViewChild('upload-attachments') public uploadNotes;
    @ViewChild('picturePreviewModal') public picturePreviewModal;
    @ViewChild('tag') public tag;
    moneyModel: any = '';
    // 上传附件临时储存
    dataList = [];
    // 上传附件类型
    type: string = 'image';
    // 上传附件地址
    upurl: string = '/api/v1/account_transaction/upload';
    // 总金额
    theTotalAmount: number = 0;
    // 初始化对方信息
    initContact: any;
    // 初始化账户
    initBankAccount: any;

    // 单行初始化数据
    transactionLineItem = {
        id: 0,
        amount: 0,
        department: null,
        businessCategory: { id: '', name: '' },
        description: '',
        accountTransactionModel: {},
        order: 0,
        needBusinessCategory: false,
        needDepartment: false,
        needAmount: false
    };

    // 页面modal
    initTransaction = {
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
            value: AccountTransactionTypeEnumModel.ValueEnum.Outcome,
            name: '支出'
        },
        totalAmount: 0,
        accountTransLineItemModels: [{
            id: 0,
            amount: 0,
            department: null,
            businessCategory: { id: '', name: '' },
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
    initaccountId: any;
    initaccountName: any;
    // 联系人列表
    contactList: any;
    // // 表单控制器
    transactionForm: FormGroup;
    // tag临时
    addTagList: any = [];
    // 账期
    minDate: any;
    maxDate: any;
    // 是否来自账户列表
    fromAccountList: boolean = false;
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
        private businessCategoryApi: BusinessCategoryApi, private utilityService: UtilityService,
        private accountTransactionApi: AccountTransactionApi, private activatedRoute: ActivatedRoute,
        private accountTransactionModels: AccountTransactionModels, private ref: ChangeDetectorRef, private router: Router,
        private location: Location) {
        this.refreshFormGroup();

    }

    ngOnInit() {
        this.getAccount();
        this.getContact(true);
        this.getBussinessCategory();
        this.AcquisitionPeriod();
        this.initaccountId = this.activatedRoute.snapshot.params['accountId'];
        this.initaccountName = this.activatedRoute.snapshot.params['accountName'];

    }

    ngAfterViewInit() {
        if (this.initaccountId && this.initaccountName) {
            this.fromAccountList = true;
            this.initBankAccount = [{ id: this.initaccountId, name: this.initaccountName }];
            this.setBankAccount({ id: this.initaccountId, text: this.initaccountName });
        }
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
    getContact(type?) {
        this.detailService.getContact().then(
            contactModel => {
                if (contactModel && type) {
                    for (let i = 0; i < contactModel.length; i++) {
                        if (contactModel[i].name === '(个)其他') {
                            console.warn(contactModel[i]);
                            this.initContact = [{ id: contactModel[i].id, name: contactModel[i].name }];
                            this.transaction.contact = this.initContact[0];
                        }
                    }
                }
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
        const list = this.transaction.accountTransLineItemModels;
        list.push(_.cloneDeep(this.transactionLineItem));
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
        this.businessCategoryApi.businessCategoryGetAll('Outcome')
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


    // 设置账户
    setBankAccount(e) {
        console.log(e);
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

    result(e) {
        console.warn(e);
        this.addAlert(e);
    }

    // 提交前验证
    /**
     *
     * 是否保存参数
     * @param {any} isSave
     *
     * @memberof OutcomeComponent
     */
    validation(isSave: boolean) {
        let check: boolean = true;
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
        // 对方信息this.transaction.contact.id
        if (this.transaction.contact.id.length === 0) {
            this.checkcontact = true;
            this.alertDanger('请填写对方信息！');
            check = false;
            return;
        } else {
            this.checkcontact = false;
        }
        const list = this.transaction.accountTransLineItemModels;
        for (let i = 0; i < this.transaction.accountTransLineItemModels.length; i++) {
            const tempamount: any = list[i].amount;
            if (tempamount === 0 || tempamount === null || tempamount === '0.00') {
                list[i].needAmount = true;
                check = false;
                this.alertDanger('金额不能为0！');
                console.error('amount' + list[i].amount);
                return;
            }
            if (list[i].businessCategory.id.length === 0) {
                list[i].needBusinessCategory = true;
                check = false;
                console.error('businessCategory' + list[i].businessCategory);
            }
        }
        // 保存标签
        this.transaction.tags = this.addTagList;
        // 保存票据
        this.transaction.accountAttachmentModels = this.dataList;
        if (check) {
            this.save(isSave);
        } else {
            this.alertDanger('请填写完整！');
            console.error('请填写完整！');
        }
    }

    // 保存
    save(isSave: boolean) {
        this.accountTransactionApi.accountTransactionPost(this.transaction).subscribe(
            accountTransactionModel => {
                console.log(accountTransactionModel);
                this.alertSuccess('保存成功');

                if (isSave) {
                    this.SaveHistory();
                    this.tag.isSaveNew();
                } else {
                    this.back();
                }
            },
            error => {
                console.log(error);
                this.alertDanger(error);
            }
        );
    }

    // 返回
    back() {
        if (this.fromAccountList) {
            this.router.navigate(['/app/account']);
        } else {
            this.router.navigate(['/app/transaction/list']);

        }
        // this.location.back();
    }

    // 保存历史
    SaveHistory() {
        // 保存时间
        const accountTransDate = this.transaction.accountTransDate;
        // 保存账户
        const bankAccount = this.transaction.bankAccount;
        // 保存对方信息
        const contact = this.transaction.contact;
        // 初始化票据
        this.dataList = [];
        // 初始化标签
        this.addTagList = [];
        // 初始化modal
        this.transaction = _.cloneDeep(this.initTransaction);
        this.transaction.accountTransDate = accountTransDate;
        this.transaction.bankAccount = bankAccount;
        this.transaction.contact = contact;
        this.TotalAmount();
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
            this.getContact(false);
            this.initContact = [{ id: data.id, name: data.name }];
            this.setContact({ id: data.id, text: data.name });
        } else if (type === 'account') {
            this.getAccount();
            this.initBankAccount = [{ id: data.id, name: data.accountName }];
            this.setBankAccount({ id: data.id, text: data.accountName });
        }
        this.TotalAmount();
        this.ref.detectChanges();

        console.warn('创建新账户||联系人后刷新');
        console.warn(data);
        console.warn(type);
    }

    upDataList(e) {
        this.dataList = e;
    }

    // 预览大图
    /**
     *
     *
     * @param {any} itemId
     *
     * @memberof OutcomeComponent
     */
    preview(itemId) {
        if (this.transaction.id || this.transaction.id.length > 5) {
            this.picturePreviewModal.show(this.dataList, itemId, this.transaction.id);
        } else {
            this.picturePreviewModal.show(this.dataList, itemId);
        }
    }

    // 获取账期
    AcquisitionPeriod() {
        this.detailService.AcquisitionPeriod()
            .then(
            (period) => {
                this.minDate = period.minDate;
                this.maxDate = period.maxDate;
                this.transaction.accountTransDate = this.maxDate;
            }
            )
            .catch(
            (error) => {
                console.log(error);
            }
            );
    }
}

