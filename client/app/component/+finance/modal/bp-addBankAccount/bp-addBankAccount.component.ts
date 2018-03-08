import { Component, OnInit, Output, EventEmitter, ViewChild, Optional, Inject } from '@angular/core';

import { ACCOUNTING_BASE_PATH } from '../../../../api/accounting';
import { StorageService } from '../../../../service/core';
import { BankAccountApi } from '../../../../api/accounting/api/BankAccountApi';
import { AccountApi } from '../../../../api/accounting/api/AccountApi';
import { BankAccountTypeApi } from '../../../../api/accounting/api/BankAccountTypeApi';
import { BankAccountModel } from '../../../../api/accounting/model/BankAccountModel';
import { ActionsEnumModel  } from '../../../../api/accounting/model/ActionsEnumModel';

declare var $: any;
import * as _ from 'lodash';
@Component({
    templateUrl: './bp-addBankAccount.component.html',
    selector: 'gpw-bp-addBankAccount',
    styleUrls: ['./bp-addBankAccount.component.scss'],
    providers: [BankAccountApi, AccountApi, BankAccountTypeApi]
})

export class BPAddBankAccountComponent implements OnInit {
    @Output() success = new EventEmitter();
    @Output() result = new EventEmitter();

    @ViewChild('modal') public modal;

    title: string = ''; // 分配的标题名称
    accountFlag: any;
    assignId: any; // 根据ID获取的所有股东信息
    bankAcconutLists: BankAccountModels[] = [];
    tempDelAcconutLists: BankAccountModels[] = [];
    endingBalance: any = 0; // 期末余额
    initBalanceDate: any; // 初始余额日期
    year: any; // 为了获取该数据的科目
    month: any; // 为了获取该数据的科目
    tempAccountInfo: any; // 临时保存科目信息
    tempBankAccountTypeInfo: any; // 临时保存银行类型信息
    isPosting: boolean = false; // 是否过完账
    totalBeginBalance: number = 0; // 初始余额总和
    defaultAccountName: string = ''; // 默认账户名称

    uploadUrl: string; // 导入的路径
    uploadFileName: any; // 导入的文件名
    fileTypes: any = ['.xls', '.xlsx']; // 导入文件格式
    baseUrl: string;
    fileName: string;

    initBankAccountModel = {
        id: '',
        bankAccountType: null,
        bankName: '',
        subbranch: '',
        accountNumber: '',
        accountName: '',
        accountCode: '',
        currency: null,
        // beginDate: new Date(),
        beginBalance: null,
        currentBalance: 0,
        currentBankStatementBalance: 0,
        description: '',
        account: null,
    };

    alert = {}; // 弹出提示框

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

    constructor(@Optional()@Inject(ACCOUNTING_BASE_PATH) baseUrl: string, private storageService: StorageService,
        private bankAccountApi: BankAccountApi, private accountApi: AccountApi, private bankAccountTypeApi: BankAccountTypeApi) {
        if (baseUrl) {
            this.baseUrl = baseUrl;
        }
    }

    ngOnInit() {
        // console.log('welcome to assign beginning of the period!');
        this.uploadUrl = '';
    }

    public show(item, date, isPosting) {
        console.log(JSON.stringify(item));
        this.isPosting = isPosting;
        this.accountFlag = item.name;
        this.initBalanceDate = date.toString().substr(0, 10);
        this.year = date.split('-')[0];
        this.month = date.split('-')[1];
        this.assignId = item.id;
        switch (this.accountFlag) {
            case '银行':
                this.title = '银行';
                this.getBankAcconutTye('Bank');
                break;
            case '支付宝':
                this.title = '支付宝';
                this.defaultAccountName = '支付宝';
                this.getBankAcconutTye('Alipay');
                break;
            case '微信':
                this.title = '微信';
                this.defaultAccountName = '微信';
                this.getBankAcconutTye('WeChat');
                break;
            default:
                break;
        }
        if (item.balanceDirection.value === 'Debit') {
            this.endingBalance = item.periodEndDebit;
        }else if (item.balanceDirection.value === 'Credit') {
            this.endingBalance = item.periodEndCredit;
        }
        this.getAccountInfo();
        this.modal.show();
    }

    public onHide() {
        this.clearAlert();
        this.assignId = '';
        this.year = '';
        this.month = '';
        this.endingBalance = 0;
        this.totalBeginBalance = 0;
        this.bankAcconutLists = [];
        this.tempDelAcconutLists = [];
        this.uploadFileName = '';
        this.uploadUrl = '';
        this.title = '';
        this.defaultAccountName = '';
        // this.isPosting = false;
    }

    // 获取银行账户类型
    getBankAcconutTye(num) {
        this.bankAccountTypeApi.bankAccountTypeGet()
            .subscribe(
            bankAccountTypeModel => {
                console.log('=============', bankAccountTypeModel, num);
                _.forEach(bankAccountTypeModel, item => {
                    if (item.id === num) {
                        this.tempBankAccountTypeInfo = {value: item.id, name: item.name} ;
                    }
                });
                console.log(this.tempBankAccountTypeInfo);
            },
            (error) => {
                console.log(error);
            });
    }

    // 由年、月、ID获取该条数据的分配科目信息
    getAccountInfo() {
        console.log(this.year, this.month, this.assignId);
        this.accountApi.accountGet_1(0, 0, this.assignId)
            .subscribe(
            accountModel => {
                console.log(accountModel);
                const subject: any = accountModel;
                this.tempAccountInfo = {id: subject.id, name: subject.name};
                this.getAssignInfo();
            },
            (error) => {
                console.log(error);
            });
    }

    // 获取已经分配过的信息
    getAssignInfo() {
        this.totalBeginBalance = 0;
        this.bankAccountApi.bankAccountGet(this.assignId)
            .subscribe(
            bankAccountModel => {
                console.log(bankAccountModel);
                if (bankAccountModel) {
                    _.forEach(bankAccountModel, item => {
                        this.totalBeginBalance += item.beginBalance;
                        this.bankAcconutLists.push(item);
                    });
                }else {
                    this.totalBeginBalance = this.endingBalance;
                    this.initBankAccountModel.bankAccountType = this.tempBankAccountTypeInfo;
                    this.initBankAccountModel.account = this.tempAccountInfo;
                    this.initBankAccountModel.beginBalance = this.endingBalance;
                    this.initBankAccountModel.accountName = this.defaultAccountName;
                    // 定义临时对象，是为了model隐藏时初始化新增数据
                    const tempObj: any = _.cloneDeep(this.initBankAccountModel);
                    this.bankAcconutLists.push(tempObj);
                    console.log('init======>', this.bankAcconutLists);
                    // this.bankAcconutLists.push(this.initBankAccountModel);
                }
                // console.log(this.bankAcconutLists);
            },
            (error) => {
                console.log(error);
            });
    }

    // 保存分配的信息
    saveAssignInfo() {
        this.clearAlert();
        // console.log('dd');
        let needDataFlag: boolean = false;
        if (this.bankAcconutLists) {
            _.forEach(this.bankAcconutLists, item => {
                if (!item.accountName) {
                    item.needAccountName = true;
                    needDataFlag = true;
                }else {
                    item.needAccountName = false;
                }
                if (!item.beginBalance && item.beginBalance !== 0) {
                    item.needBeginBalance = true;
                    needDataFlag = true;
                }else {
                    item.needBeginBalance = false;
                }
            });
            if (needDataFlag) {
                return;
            }
        }

        // 删除的数据只是更改了actions的value变量的值，保存的时候要提交给后台的
        const dataList = _.cloneDeep(this.bankAcconutLists);
        _.forEach(this.tempDelAcconutLists, item => {
            dataList.push(item);
        });

        console.log(JSON.stringify(dataList));

        this.bankAccountApi.bankAccountBatchUpdate(dataList)
            .subscribe(
            boolResultModel => {
                console.log(boolResultModel);
                const resultObj = {
                    type: 'success',
                    msg: '分配成功！'
                };
                this.result.emit(resultObj);
                this.modal.hide();
            },
            (error) => {
                this.alertDanger(error);
            });
    }

    // 选择文件后，点击确定直接导入文件
    importedFiles(event) {
        this.uploadFileName = event.target.files[0];
        console.log('uploadFileName======>', this.uploadFileName);
    }

    // 下载模版
    downloadTemplate() {

    }

    // 添加银行账户 新增
    newBankAccountItem() {
        this.bankAcconutLists.push({
            id: '',
            bankAccountType: this.tempBankAccountTypeInfo,
            bankName: '',
            subbranch: '',
            accountNumber: '',
            accountName: this.defaultAccountName,
            accountCode: '',
            currency: null,
            // beginDate: new Date(),
            beginBalance: 0,
            currentBalance: 0,
            currentBankStatementBalance: 0,
            description: '',
            account: this.tempAccountInfo,
        });
    }


    // 添加银行账户 删除
    delBankAccountItem(index) {
        // if (this.bankAcconutLists.length === 1) return;
        if (this.bankAcconutLists[index].id) {
            this.bankAcconutLists[index].actions = {value: ActionsEnumModel.ValueEnum.Delete, name: ''};
            this.bankAcconutLists[index].beginBalance = 0;
            this.tempDelAcconutLists.push(this.bankAcconutLists[index]);
        }
        this.bankAcconutLists.splice(index, 1);
        this.count();
        console.log('del=====>>>>', JSON.stringify(this.tempDelAcconutLists));
    }


    /*------------------------导入文件方法 start-------------------------*/
    uploadFile() {
        // verify if the file type is valid
        if (this.fileTypes) {
            let isValidType: boolean = false;
            _.forEach(this.fileTypes, (item) => {
                if (this.uploadFileName.name.substring(this.uploadFileName.name.length - item.length) === item) {
                    isValidType = true;
                }
            });
            if (!isValidType) {
                // tslint:disable-next-line:no-shadowed-variable
                const resultObj = {
                        type: 'danger',
                        msg: '文件格式不正确!'
                    };
                this.result.emit(resultObj);
                return;
            }
        }
        const formData = new FormData();
        formData.append('file', this.uploadFileName);
        const token = this.storageService.getToken();
        let resultObj: any = {};

        $.ajax({
                url: this.baseUrl + this.uploadUrl,
                type: 'POST',
                beforeSend: (xhr) => {
                    xhr.setRequestHeader('Authorization', 'bearer ' + token.access_token);
                    xhr.setRequestHeader('company_id', token.user.currentCompany.id);
                    xhr.setRequestHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(this.uploadFileName.name));
                },
                data: formData,
                mimeType: 'multipart/form-data',
                contentType: false,
                cache: false,
                processData: false,
                success: (data, textStatus, jqXHR) => {
                    resultObj = {
                        type: 'success',
                        msg: '上传成功！'
                    };
                    // this.result.emit(resultObj);
                    // this.success.emit(data);
                },
                error: (jqXHR, textStatus, errorThrown) => {
                    resultObj = {
                        type: 'danger',
                        msg: JSON.parse(jqXHR.responseText).errors[0]
                        // msg: '上传失败！'
                    };
                    // this.result.emit(resultObj);
                }
            });
    }
    /*------------------------导入文件方法 end-------------------------*/

    oldVal(e) {
        console.log(e);
        e.target.value = e.target.value.replace(/,/g, '');
        e.target.value = e.target.value.replace(/￥/g, '');
        if (e.target.value === '-' || e.target.value === '0' || e.target.value === '0.00' || isNaN(parseFloat(e.target.value))) {
            e.target.value = '';
        }
    }

    count(e?, item?) {
        if (e) {
            const re = /^[-]?((\d+)|(\d+\.\d+))$/;
            const isRe = re.test(e.target.value);
            if (isNaN(parseFloat(e.target.value)) || !isRe) {
                e.target.value = '0.00';
                item.beginBalance = e.target.value;
            }else {
                item.beginBalance = e.target.value;
                e.target.value = this.formatMoney(e.target.value);
            }
        }
        this.totalBeginBalance = 0;
        _.forEach(this.bankAcconutLists, item1 => {
            this.totalBeginBalance += Number(item1.beginBalance);
        });
        console.log('能行吗？？？？', item.beginBalance, e);
    }

    // 货币格式化
    formatMoney(numbers, places?, thousand?, decimal?) {
        numbers = numbers || 0;
        places = !isNaN(places = Math.abs(places)) ? places : 2;
        thousand = thousand || ',';
        decimal = decimal || '.';
        let i: any;
        let j: any;
        const negative = numbers < 0 ? '-' : '';
        i = parseInt(numbers = Math.abs(+numbers || 0).toFixed(places), 10) + '';
        j = (j = i.length) > 3 ? j % 3 : 0;
        return negative + (j ? i.substr(0, j) + thousand : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thousand) +
            (places ? decimal + Math.abs(numbers - i).toFixed(places).slice(2) : '');
    }

}

/**
 * 银行列表
 */
interface BankAccountModels extends BankAccountModel {
    needAccountName?: boolean;
    needBeginBalance?: boolean;
}
