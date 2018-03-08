import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

import { BankStatementApi } from '../../../api/accounting/api/BankStatementApi';
// import { DepartmentApi } from '../../../api/accounting/api/DepartmentApi';
import { BusinessCategoryApi } from '../../../api/accounting/api/BusinessCategoryApi';
import { ContactApi } from '../../../api/accounting/api/ContactApi';
import { UserApi } from '../../../api/accounting/api/UserApi';
import { AuthorizationService } from '../../../service/core';
import * as _ from 'lodash';

import * as moment from 'moment';

import { ReconcileShareService } from './../share/reconcile-share.service';

@Component({
    templateUrl: 'multi-sync.component.html',
    selector: 'gpw-multi-sync',
    styleUrls: ['multi-sync.component.scss'],
    providers: [BankStatementApi, BusinessCategoryApi, ContactApi, UserApi, ReconcileShareService]
})
export class MultiSyncComponent {
    @ViewChild('contactDetailsModal') public contactDetailsModal;
    // @ViewChild('departmentDetailsModal') public departmentDetailsModal;
    // @ViewChild('businessCategoryModal') public businessCategoryModal;
    isInit = true;
    ids = '';
    account = { id: '', name: '', amount: 0 };
    contact = { id: '', text: '' };
    alert: Object = {};
    dataList: any = [];
    contactList = [];
    departmentList = [];
    outcomeBCList = [];
    incomeBCList = [];
    lineIndex: number = 0;
    initTransaction = {
        id: '',
        number: '',
        accountTransDate: '',
        contact: null,
        bankAccount: null,
        entityType: {
            value: null,
            name: ''
        },
        amount: null,
        description: '',
        department: null,
        businessCategory: null,
    };
    addTransactionInfo = {
        bankStatementId: '',
        accountTransactionModel: {
            accountTransDate: '',
            contact: {
                id: '',
            },
            bankAccount: {
                id: '',
            },
            totalAmount: 0,
            accountTransLineItemModels: [{
                accountTransDate: '',
                amount: null,
                department: null,
                businessCategory: null,
                description: '',
            }]
        }
    };
    accountTransferModel = {
        id: '',
        bankStatementId: '',
        bankAccount: {
            id: '',
            name: ''
        },
        toBankAccount: {
            id: '',
            name: ''
        },
        amount: 0,
        transationDateTime: '',
        businessCategory: {
            id: '',
        },
        toTransferId: '',
        summary: ''
    }
    // 银行账户列表
    accountList = [];
    minDate: any;
    maxDate: any;

    noData: boolean = true;
    public alertSuccess(msg: string) {
        this.clearAlert();
        msg = msg === undefined ? '' : msg;
        setTimeout(() => { this.alert = { type: 'success', msg: msg }; }, 0);
    }

    public alertDanger(msg: string) {
        this.clearAlert();
        msg = msg === undefined ? '' : msg;
        setTimeout(() => { this.alert = { type: 'danger', msg: msg }; }, 0);
    }

    public addAlert(alert: Object): void {
        this.clearAlert();
        this.alert = alert;
    }

    public clearAlert(): void {
        this.alert = {};
    }

    constructor(private fb: FormBuilder, private route: ActivatedRoute, private router: Router,
        private bankStatementApi: BankStatementApi, private ref: ChangeDetectorRef,
        private contactApi: ContactApi, private userApi: UserApi, private bussinessCategoryApi: BusinessCategoryApi,
        private location: Location, private authorizationService: AuthorizationService, private reconService: ReconcileShareService) {

    }

    getContact(flag) {
        this.contactApi.contactGetAll().subscribe(
            data => {
                let dataPush = [];
                _.forEach(data, item => {
                    dataPush.push({ id: item.id, text: item.name });
                    if (item.isDefault && item.name === '(个)其他') {
                        this.contact = { id: item.id, text: item.name };
                    }
                });
                dataPush.unshift({ id: 'contact', text: '+新增往来单位/个人' });
                this.contactList = dataPush;
                if (flag && !this.noData) {
                    _.forEach(this.dataList, item => {
                        item.transaction.contact = [this.contact];
                    });
                }
                this.ref.detectChanges();
            },
            error => {
                console.log('error', error);
            }
        );
    }
    // 
    getAccountAll(id) {
        this.reconService.getAccountAll().then(
            data => {
                this.accountList = [];
                _.forEach(data, item => {
                    if (item.id !== id) {
                        let model = { id: item.id, text: item.accountName };
                        this.accountList.push(model);
                    }
                });
                console.log('getAccountAll', this.accountList);
                this.ref.detectChanges();
            }, error => {
                console.log('getAccountAll->error', error);
            }
        );
    }


    kgetBussinessCategory() {
        this.getInCome();
        this.getOutCome();
        // this.ref.detectChanges();
    }
    getInCome() {
        this.reconService.getBussinessCategoryByBool('Income', true).then(
            data => {
                this.incomeBCList = data;

                console.log('<---kgetBussinessCategory-->Income', data);
            }, error => {
                // this.showError(error);
            }
        );
    }
    getOutCome() {
        this.reconService.getBussinessCategoryByBool('Outcome', true).then(
            data => {
                this.outcomeBCList = data;
                console.log('<---kgetBussinessCategory-->Outcome', data);
            }, error => {
                // this.showError(error);
            }
        );
    }


    ngOnInit() {
        if (this.route.snapshot.params['id']) {
            this.account.id = this.route.snapshot.params['id'];
        }
        // if (this.route.snapshot.params['syncRecordIds']) {
        //     this.ids = this.route.snapshot.params['syncRecordIds'];
        // }
        this.getContact(true);
        this.kBankStatementSearch();
        this.kgetBussinessCategory();
        this.reconService.bankSearch(this.account.id);
        this.getAccountAll(this.account.id);
    }
    // 获取对账单列表，搜索需要的model 在service里面
    kBankStatementSearch() {
        this.reconService.bankStatementSearch(this.account.id).then(
            data => {
                console.log('<----kBankStatementSearch>', data);
                this.ids = data;
                this.getdata();
            }, error => {
                console.log('<----kBankStatementSearch>', error);
            }
        );
    }
    // 获取列表数据
    getdata() {
        // let ids = 'e6177615-0809-4e7e-bb5b-9372e34ec450,97dca22a-26b5-4196-8528-fb76cde6e7f8,69c56f36-50f9-4b18-9cdb-436365dcc478';
        this.dataList = [];
        let model = { id: '', name: this.ids };
        this.bankStatementApi.bankStatementGet(model)
            .subscribe(
            (bankStatements) => {
                if (bankStatements === null || bankStatements === []) {
                    this.noData = true;
                    return;
                }
                this.noData = false;
                _.forEach(bankStatements, (item) => {
                    let iscontact = true;
                    let transaction = _.cloneDeep(this.initTransaction);
                    let tempData: any = item;
                    tempData.transaction = transaction;
                    tempData.transaction.amount = item.debit ? item.debit : item.credit;
                    // tempData.transaction.accountTransDate = item.accountTransDate.toString().substr(0, 10);
                    tempData.transaction.accountTransDate = moment(item.accountTransDate).format('YYYY-MM-DD');
                    this.getPeroidDateArea(tempData.transaction.accountTransDate);
                    tempData.transaction.description = item.description;
                    if (tempData.toAccountName) {
                        _.forEach(this.contactList, (c) => {
                            if (c.text === tempData.toAccountName) {
                                tempData.transaction.contact = [c];
                                iscontact = false;
                            }
                        });
                    }
                    if (iscontact) {
                        tempData.transaction.contact = [this.contact];
                    }
                    tempData.isTransfer = false;
                    this.dataList.push(tempData);
                    this.ref.detectChanges();
                });

            }, (error) => {
                this.alertDanger(error);
            });
    }
    // 时间选择限制在会计区间
    getPeroidDateArea(date) {
        let year = moment(date).year();
        let month = moment(date).month();
        const newdate = moment(new Date()).year(year).month(month);
        this.minDate = moment(newdate).date(1).format('YYYY-MM-DD');
        this.maxDate = moment(newdate).date(newdate.daysInMonth()).format('YYYY-MM-DD');
        // console.log('minDate', this.minDate, this.maxDate, date);
    }

    back() {
        // this.location.back();
        this.router.navigate(['/app/reconcile/detail/history', { id: this.account.id, type: 'bill' }]);
    }
    cancelsync(item, index) {
        this.dataList.splice(index, 1);
        if (this.dataList.length === 0) {
            this.location.back();
        }
    }

    selected(item, index, businessCategoryType) {
        console.log('selected', index, item);
        this.lineIndex = index;
        if (businessCategoryType === 'contact') {
            this.dataList[index].transaction.contact = [item];
            this.ref.detectChanges();
            if (item.id === 'contact') {
                this.dataList[index].transaction.contact = [];
                this.newContact();
            }
        } else if (businessCategoryType === 'Outcome' || businessCategoryType === 'Income') {
            this.dataList[index].transaction.businessCategory = [item];
            let temp = _.cloneDeep(this.dataList[index]);
            console.log('selected', temp);
            if (item.text === '账户转入' || item.text === '账户转出') {
                temp.isTransfer = true;
                temp.account = null;
            } else {
                temp.isTransfer = false;
            }
            this.dataList[index] = temp;
            console.log('selected', index, temp);
            // item.parent ? this.newBusinessCategory(businessCategoryType, item.parent) : this.newBusinessCategory();

        }

    }
    

    newBusinessCategory(businessCategoryType?: any, categoryInit?: any) {

        //暂时
        // this.businessCategoryModal.show(businessCategoryType, categoryInit);
    }
    newContact() {
        this.contactDetailsModal.show();
    }
    // 没有新增部门
    // newDepartment() {
    //     this.departmentDetailsModal.show();
    // }

    newItemAdded(data, type) {
        let obj = null;
        let name = data.name || data.accountName;
        if (data && data.id && name) {
            obj = [{ id: data.id, name: name }];
        }
        switch (type) {

            case 'businessCategory':
                this.dataList[this.lineIndex].transaction.businessCategory = [{ id: obj[0].id, text: obj[0].name }];
                break;
            // case 'department':
            //     this.dataList[this.lineIndex].transaction.department = [{ id: obj[0].id, text: obj[0].name }];
            //     break;
            case 'contact':
                this.dataList[this.lineIndex].transaction.contact = [{ id: obj[0].id, text: obj[0].name }];
                break;
            default:
                break;
        }
        this.ref.detectChanges();
    }

    result(resultObj, type) {
        switch (type) {
            case 'businessCategory':
                this.kgetBussinessCategory();
                break;
            // case 'department':
            // this.getDepartment();
            // break;
            case 'contact':
                this.getContact(false);
                break;
            default:
                break;
        }

        this.addAlert(resultObj);
    }

    save() {
        let commenList = [];
        let transferData = [];
        _.forEach(this.dataList, item => {
            if (item.isTransfer) {
                transferData.push(item);
            } else {
                commenList.push(item);
            }

        });
        let transList = this.interChangeCheck(transferData);
        if (transList.length > 0) {
            this.bankStatementAddBankTransfers(transList);
            this.commenMulti(commenList, false);
        } else {
            this.commenMulti(commenList, true);
        }

    }
    // 
    /**
     *  账户互转数据检查 返回值 是拼接后的 账户互转数据
     * @param data 账户互转的数据 
     */
    interChangeCheck(data): Array<any> {
        let interList = [];
        if (data.length > 0) {
            _.forEach(data, item => {
                if (item.account === null) {
                    item.account = { id: 'error' };
                    return;
                }
                let inter = _.cloneDeep(this.accountTransferModel);
                inter.bankStatementId = item.id;
                inter.transationDateTime = item.transaction.accountTransDate;
                inter.amount = item.transaction.amount;
                inter.bankAccount.id = this.account.id;
                inter.businessCategory.id = item.transaction.businessCategory[0].id;
                inter.summary = item.transaction.description;
                if (item.account && item.account[0] && item.account[0].id) {
                    inter.toBankAccount.id = item.account[0].id
                    if (this.account.id) {
                        interList.push(inter);
                    } else {
                        this.alertDanger('银行账户错误');
                        return;
                    }
                }
            });
        }
        return interList;
    }
    // 账户互转接口调用
    bankStatementAddBankTransfers(modelList) {
        this.reconService.bankStatementAddBankTransfers(modelList).then(
            data => {
                console.log('bankStatementAddBankTransfers', data);
                this.router.navigate(['/app/reconcile/account-interchange', { id: this.account.id, target:'account-trans' }]);
            }, error => {
                this.alertDanger(error);
                this.ngOnInit();
            }
        );
    }
    // 非账户互转 请求接口
    commenMulti(data, isNavigate) {
        if (data.length < 0) {
            return;
        }
        this.isInit = false;
        let r = false;
        let requstdata = [];
        _.forEach(data, item => {
            let re = _.cloneDeep(this.addTransactionInfo);
            re.bankStatementId = item.id;
            re.accountTransactionModel.accountTransDate = item.transaction.accountTransDate;
            re.accountTransactionModel.totalAmount = item.transaction.amount;
            //对方信息
            if (item.transaction.contact && item.transaction.contact[0] && item.transaction.contact[0].id) {
                re.accountTransactionModel.contact = { id: item.transaction.contact[0].id };
                //类别
                if (item.transaction.businessCategory && item.transaction.businessCategory[0] && item.transaction.businessCategory[0].id) {
                    re.accountTransactionModel.accountTransLineItemModels[0].businessCategory = { id: item.transaction.businessCategory[0].id };
                    //id
                    if (this.account.id) {
                        re.accountTransactionModel.bankAccount = { id: this.account.id };
                        re.accountTransactionModel.accountTransLineItemModels[0].description = item.transaction.description;
                        re.accountTransactionModel.accountTransLineItemModels[0].accountTransDate = item.transaction.accountTransDate;
                        re.accountTransactionModel.accountTransLineItemModels[0].amount = item.transaction.amount;
                        requstdata.push(re);
                    } else {
                        this.alertDanger('银行账户错误');
                        r = true;
                        return;
                    }
                } else {
                    item.transaction.businessCategory = { id: 'error' };
                    r = true;
                }
            } else {
                item.transaction.contact = { id: 'error' };
                r = true;
            }
        });
        if (requstdata.length <= 0) {
            return;
        }
        if (!r || requstdata.length > 0) {
            this.bankStatementApi.bankStatementSynchronize(requstdata)
                .subscribe(
                returndata => {
                    // this.location.back();
                    if (isNavigate) {
                        this.router.navigate(['/app/reconcile/detail/history', { id: this.account.id, isReconcile: true, type: 'bill' }]);
                    }
                },
                error => {
                    // let message = error;
                    this.alertDanger(error);
                }
                );
        }
    }

    //错误提示
    showError(error) {
        this.alertDanger(error);
    }

}

// export class MultiSyncComponent {
//     ngOnInit() {
//         console.log('MultiSync!!!!!');
//     }
// }
