import { Component, OnInit, Output, EventEmitter, ViewChild, Optional, Inject } from '@angular/core';

import { ACCOUNTING_BASE_PATH } from '../../../../api/accounting';
import { StorageService } from '../../../../service/core';
import { AccountApi } from '../../../../api/accounting/api/AccountApi';
import { ContactApi } from '../../../../api/accounting/api/ContactApi';
import { ImportApi } from '../../../../api/accounting/api/ImportApi';
import { ContactModel } from '../../../../api/accounting/model/ContactModel';
import { AuxiliaryBusinessAccountingTypeEnumModel } from '../../../../api/accounting/model/AuxiliaryBusinessAccountingTypeEnumModel';
import { ContactTypeEnumModel } from '../../../../api/accounting/model/ContactTypeEnumModel';
import { ActionsEnumModel } from '../../../../api/accounting/model/ActionsEnumModel';
import { FinanceService } from './../../shared/finance.service';

declare var $: any;
import * as _ from 'lodash';
@Component({
    templateUrl: './bp-contacts.component.html',
    selector: 'gpw-bp-contacts',
    styleUrls: ['./bp-contacts.component.scss', '../../finance.component.scss'],
    providers: [AccountApi, ContactApi, ImportApi]
})

export class BPContactsComponent implements OnInit {
    @Output() success = new EventEmitter();
    @Output() result = new EventEmitter();

    @ViewChild('modal') public modal;
    uploadUrl: string; // 导入的路径
    uploadFileName: any; // 导入的文件名
    fileTypes: any = ['.xls', '.xlsx']; // 导入文件格式
    baseUrl: string;
    listener: any;
    template: string = '';

    /**
     * 四种分配往来
     * 'Receivable', 'Payable', 'OtherReceivable', 'OtherPayable'
     */
    title: string = ''; // 分配的标题名称
    contactFlag = ''; // 用来接受是哪种往来进来了
    endingBalance: any = 0; // 期末余额
    totalOpeningBalance: number = 0; // 金额总和
    assignId: any; // 根据ID获取的所有对方信息
    contactModelLists: ContactModels[] = [];
    tempDelContactLists: ContactModels[] = [];
    isPosting: boolean = false; // 是否过完账
    isExistItem: boolean = false; // 判断是否删除已存在的往来信息
    isHideItem: boolean = true; // 显示或隐藏按钮
    count: number = 0; // 来存储新增了几行
    defaultContactType: any = [{ id: 'Company', text: '单位' }];
    contactNatureLists = [
        { id: 'Company', text: '单位' },
        { id: 'Personal', text: '个人' },
        // { id: 'Employee', text: '员工', disabled: true},
    ]; // 部门性质
    contactNatureLists1 = [
        { id: 'Employee', text: '员工', disabled: true },
    ]; // 部门性质

    defautContactList: Array<any> = [];
    formData;
    initContactModel = {
        contactType: { id: 'Company', text: '单位' },
        name: '',
        auxiliaryBusinessAccountingBalance: {
            id: null,
            openingBalance: 0,
            auxiliaryBusinessAccountingType: null
        },
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

    constructor( @Optional() @Inject(ACCOUNTING_BASE_PATH) baseUrl: string, private storageService: StorageService,
        private accountApi: AccountApi, private contactApi: ContactApi, private importApi: ImportApi,
        private financeService: FinanceService) {
        if (baseUrl) {
            this.baseUrl = baseUrl;
        }
    }

    ngOnInit() {
    }

    public show(item, isPosting) {
        $('#uploadContactsrBtn').val('');
        this.assignId = item.id;
        this.isPosting = isPosting;
        console.log(this.assignId);
        this.contactFlag = item.accountAssignType.value;
        if (item.balanceDirection.value === 'Debit') {
            this.endingBalance = item.periodEndDebit;
        } else if (item.balanceDirection.value === 'Credit') {
            this.endingBalance = item.periodEndCredit;
        }
        // console.log('contact show', this.uploadExcel);

        this.modal.show();
        switch (this.contactFlag) {
            case 'Receivable':
                this.title = '应收账款－单位';
                this.initContactModel.auxiliaryBusinessAccountingBalance.auxiliaryBusinessAccountingType
                    = { value: AuxiliaryBusinessAccountingTypeEnumModel.ValueEnum.Receivable, name: '' };
                this.uploadUrl = '/api/v1/import/import_Receivable';
                this.template = '../../../../assets/template/应收账款.xlsx';
                // this.labelText = '导入应收';
                break;
            case 'Payable':
                this.title = '应付账款－单位';
                this.initContactModel.auxiliaryBusinessAccountingBalance.auxiliaryBusinessAccountingType
                    = { value: AuxiliaryBusinessAccountingTypeEnumModel.ValueEnum.Payable, name: '' };
                this.uploadUrl = '/api/v1/import/import_Payable';
                this.template = '../../../../assets/template/应付账款.xlsx';
                // this.labelText = '导入应付';
                break;
            case 'OtherReceivable':
                this.title = '临时借出资金';
                this.initContactModel.auxiliaryBusinessAccountingBalance.auxiliaryBusinessAccountingType
                    = { value: AuxiliaryBusinessAccountingTypeEnumModel.ValueEnum.OtherReceivable, name: '' };
                this.uploadUrl = '/api/v1/import/import_OtherReceivable';
                this.template = '../../../../assets/template/临时借出.xlsx';
                // this.labelText = '导入临时借出';
                break;
            case 'OtherPayable':
                this.title = '临时借入款';
                this.initContactModel.auxiliaryBusinessAccountingBalance.auxiliaryBusinessAccountingType
                    = { value: AuxiliaryBusinessAccountingTypeEnumModel.ValueEnum.OtherPayable, name: '' };
                this.uploadUrl = '/api/v1/import/import_OtherPayable';
                this.template = '../../../../assets/template/临时借入.xlsx';
                // this.labelText = '导入临时借入';
                break;
            default:
                break;
        }

        this.getAssignInfo();

    }


    public onHide() {
        this.clearAlert();
        this.title = '';
        this.contactFlag = '';
        this.endingBalance = 0;
        this.totalOpeningBalance = 0;
        this.contactModelLists = [];
        this.tempDelContactLists = [];
        this.assignId = '';
        this.uploadFileName = '';
        this.uploadUrl = '';
        $('#uploadContactsrBtn').css({
            'cursor': 'pointer'
        });
        $('.file').css({
            'opacity': 1,
            'background': '#D0EEFF',
            'border-color': '#99D3F5',
            'color': '#1E88C7',
        });
        this.isExistItem = false;
        this.isHideItem = true;
        this.count = 0;
        // this.isPosting = false;
    }

    // 获取已经分配过的信息
    getAssignInfo() {
        this.totalOpeningBalance = 0;
        this.financeService.getDistContact(this.contactFlag).then(
            data => {
                const tempContactModel: any = data;
                if (tempContactModel) {
                    // 清空默认列表址
                    const tempDefault = [];
                    _.forEach(tempContactModel, item => {

                        if (!item.auxiliaryBusinessAccountingBalance) {
                            item.auxiliaryBusinessAccountingBalance = {
                                auxiliaryBusinessAccountingType:
                                this.initContactModel.auxiliaryBusinessAccountingBalance.auxiliaryBusinessAccountingType,
                                id: null,
                                openingBalance: 0,
                            };
                        }
                        if (item.contactType) {
                            if (item.contactType.value === ContactTypeEnumModel.ValueEnum.Company) {
                                item.contactType = [{
                                    id: 'Company', text: '单位'
                                }];
                            } else if (item.contactType.value === ContactTypeEnumModel.ValueEnum.Personal) {
                                item.contactType = [{
                                    id: 'Personal', text: '个人'
                                }];
                            } else if (item.contactType.value === ContactTypeEnumModel.ValueEnum.Employee) {
                                item.isEmployee = true;
                                item.contactType = [{
                                    id: 'Employee', text: '员工'
                                }];
                            }
                        }
                        if (item.isDefault) {
                            // item.auxiliaryBusinessAccountingBalance.openingBalance = 0;
                            tempDefault.push(item);
                        }
                        this.contactModelLists.push(item);
                        this.countOpeningBalance();
                    });
                    this.defautContactList = tempDefault;
                } else {
                    this.totalOpeningBalance = this.endingBalance;
                    this.initContactModel.auxiliaryBusinessAccountingBalance.openingBalance = this.endingBalance;
                    // 定义临时对象，是为了model隐藏时初始化新增数据
                    const tempObj: any = _.cloneDeep(this.initContactModel);
                    this.contactModelLists.push(tempObj);
                }
            }).catch(err => {

            });
    }

    // 保存分配的信息
    saveAssignInfo() {
        this.clearAlert();
        this.checkRepeat();
        let needDataFlag: boolean = false;
        // let keyMap = {};
        console.log(this.contactModelLists);
        if (this.contactModelLists) {
            const tempData: any = this.contactModelLists;
            _.forEach(tempData, item => {
                if (!item.contactType || item.contactType.length === 0) {
                    item.needContactType = true;
                    needDataFlag = true;
                } else {
                    item.needContactType = false;
                }
                if (!item.name) {
                    item.needName = true;
                    needDataFlag = true;
                } else {
                    item.needName = false;
                }
                if (!item.auxiliaryBusinessAccountingBalance.openingBalance
                    && item.auxiliaryBusinessAccountingBalance.openingBalance !== 0) {
                    item.needOpeningBalance = true;
                    needDataFlag = true;
                } else {
                    item.needOpeningBalance = false;
                }
                if (item.repeated) {
                    needDataFlag = true;
                    this.alertDanger('信息重复');
                }
            });
            if (needDataFlag) {
                return;
            }
        }
        // 删除的数据只是更改了actions的value变量的值，保存的时候要提交给后台的
        const dataList: any = _.cloneDeep(this.contactModelLists);
        // _.forEach(this.tempDelContactLists, item => {
        //     dataList.push(item);
        // });
        _.forEach(dataList, item => {
            if (item.contactType.constructor === Array) {
                item.contactType = {
                    value: item.contactType[0].id,
                    name: item.contactType[0].text,
                };
            } else {
                item.contactType = {
                    value: item.contactType.id,
                    name: item.contactType.text,
                };
            }
        });
        console.log(JSON.stringify(dataList));
        this.save(dataList);
    }

    /**
     * 发送服务器更新数据
     * @param data 列表数据
     */
    save(data) {
        this.contactApi.contactBatchUpdate(data)
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

    // 临时借出资金分配 新增
    newContactItem() {
        ++this.count;
        this.contactModelLists.push({
            contactType: this.defaultContactType,
            name: '',
            auxiliaryBusinessAccountingBalance: {
                id: null,
                openingBalance: 0,
                auxiliaryBusinessAccountingType: this.initContactModel.auxiliaryBusinessAccountingBalance.auxiliaryBusinessAccountingType
            },
        });
        if (this.count > 0) {
            $('#uploadContactsrBtn').css({
                'cursor': 'not-allowed'
            });
            $('.file').css({
                'opacity': 0.65,
                'background': '#AADFFD',
                'border-color': '#78C3F3',
                'color': '#004974',
            });
        }
        console.log(this.contactModelLists);
    }

    // 临时借出资金分配 删除
    delContactItem(index) {
        // if (this.contactModelLists[index].id) {
        //     this.contactModelLists[index].actions = { value: ActionsEnumModel.ValueEnum.Delete, name: '' };
        //     this.contactModelLists[index].auxiliaryBusinessAccountingBalance.openingBalance = 0;
        //     this.tempDelContactLists.push(this.contactModelLists[index]);
        //     this.isExistItem = true;
        // } else {
        //     --this.count;
        // }
        this.contactModelLists.splice(index, 1);
        if (this.isExistItem || this.count > 0) {
            $('#uploadContactsrBtn').css({
                'cursor': 'not-allowed'
            });
            $('.file').css({
                'opacity': 0.65,
                'background': '#AADFFD',
                'border-color': '#78C3F3',
                'color': '#004974',
            });
        } else {
            $('#uploadContactsrBtn').css({
                'cursor': 'pointer'
            });
            $('.file').css({
                'opacity': 1,
                'background': '#D0EEFF',
                'border-color': '#99D3F5',
                'color': '#1E88C7',
            });
        }
        this.countOpeningBalance();
        // console.log('del=====>>>>', JSON.stringify(this.tempDelContactLists));
    }

    // 跟踪ngFor中item
    trackByFn1(index: number, item) {
        return index;
    }

    // 选择文件后，点击确定直接导入文件
    importedFiles(event) {
        this.uploadFileName = event.target.files[0];
        this.uploadFile();
        console.log('uploadFileName======>', this.uploadFileName);
    }

    // 下载模版
    downloadTemplate() {

    }

    /*------------------------导入文件方法 start-------------------------*/
    uploadFile() {
        // verify if the file type is valid
        if (this.fileTypes) {
            let isValidType: boolean = false;
            _.forEach(this.fileTypes, (item) => {
                console.log(this.uploadFileName.name,
                    this.uploadFileName.name.substring(this.uploadFileName.name.length - item.length), item);
                if (this.uploadFileName.name.substring(this.uploadFileName.name.length - item.length) === item) {
                    console.log(this.uploadFileName.name,
                        this.uploadFileName.name.substring(this.uploadFileName.name.length - item.length), item);
                    isValidType = true;
                }
            });
            if (!isValidType) {
                const resultObj = {
                    type: 'danger',
                    msg: '文件格式不正确!'
                };
                setTimeout(() => {
                    this.addAlert(resultObj);
                }, 10);
                return;
            }
        }
        const formData = new FormData();
        formData.append('file', this.uploadFileName);
        const token = this.storageService.getToken();
        console.log('urlll====>', this.baseUrl + this.uploadUrl);
        $.ajax({
            url: this.baseUrl + this.uploadUrl,
            type: 'POST',
            beforeSend: (xhr) => {
                xhr.setRequestHeader('Authorization', 'bearer ' + token.access_token);
                xhr.setRequestHeader('company_id', token.user.currentCompany.id);
                xhr.setRequestHeader('accountbook_id', token.currentAccount ? token.currentAccount.id : '');
                xhr.setRequestHeader('account_id', this.assignId);
            },
            data: formData,
            mimeType: 'multipart/form-data',
            contentType: false,
            cache: false,
            processData: false,
            success: (data, textStatus, jqXHR) => {
                // console.log('data4:00excelLLLLL', data);
                const temp = JSON.parse(data);
                this.getFile(temp.id);
                $('#uploadContactsrBtn').val('');
            },
            error: (jqXHR, textStatus, errorThrown) => {
                const resultObj = {
                    type: 'danger',
                    msg: JSON.parse(jqXHR.responseText).errors[0]
                };
                setTimeout(() => {
                    this.addAlert(resultObj);
                }, 10);
            }
        });
    }

    // 获取上传的数据ID

    public getFile(sid) {
        this.clearAlert();
        let count = 0;
        // console.log('id', sid);
        this.listener = setInterval(() => {
            count++;
            this.importApi.importGet(sid).toPromise().then(data => {
                // console.log('getFIle=>', data);
                if (data.taskStatus === 'Success') {
                    clearInterval(this.listener);
                    const resultObj = {
                        type: 'success',
                        msg: '导入文件已成功保存'
                    };
                    setTimeout(() => {
                        this.addAlert(resultObj);
                    }, 10);
                    this.successUpload(sid);
                } else {
                    if (data.importErrorMsg) {
                        const resultObj = {
                            type: 'danger',
                            msg: data.importErrorMsg
                        };
                        setTimeout(() => {
                            this.addAlert(resultObj);
                        }, 10);
                        clearInterval(this.listener);
                        this.formData = new FormData();
                        return null;
                    }
                    if (count > 7) {
                        clearInterval(this.listener);
                        this.openError(sid);
                        this.formData = new FormData();
                        return null;
                    }
                }
            }).catch(err => {
                const resultObj = {
                    type: 'danger',
                    msg: '哎呀，出问题了，请重新试试吧'
                };
                setTimeout(() => {
                    this.addAlert(resultObj);
                }, 10);
                clearInterval(this.listener);
            });
        }, 2000);
    }


    // 在新窗口中打开错误表格

    openError(sid) {
        this.clearAlert();
        this.importApi.importExport(sid).subscribe(
            data => {
                const resultObj = {
                    type: 'danger',
                    msg: '请从表格查看错误原因'
                };
                setTimeout(() => {
                    this.addAlert(resultObj);
                }, 10);
                const elemIF = document.createElement('iframe');
                elemIF.src = data;
                elemIF.style.display = 'none';
                document.body.appendChild(elemIF);
                this.formData = new FormData();
            },
            error => {
                console.log(error);
                const resultObj = {
                    type: 'danger',
                    msg: error
                };
                setTimeout(() => {
                    this.addAlert(resultObj);
                }, 10);
                this.formData = new FormData();
            }
        );
    }

    // 获取上传数据
    successUpload(e) {
        this.contactApi.contactImportHistory(e).subscribe(
            contactModel => {
                const tempContactModel: any = contactModel;
                if (tempContactModel) {
                    _.forEach(tempContactModel, item => {
                        const fIndex = this.contactModelLists.findIndex(cont => {
                            console.log('find', cont.contactType, item.contactType);
                            return cont.name === item.name && cont.contactType[0].id === item.contactType.value;
                        });
                        if (fIndex > -1) {
                            this.contactModelLists[fIndex].auxiliaryBusinessAccountingBalance.openingBalance =
                                item.auxiliaryBusinessAccountingBalance.openingBalance;
                        } else {
                            if (!item.auxiliaryBusinessAccountingBalance) {
                                item.auxiliaryBusinessAccountingBalance = {
                                    auxiliaryBusinessAccountingType:
                                    this.initContactModel.auxiliaryBusinessAccountingBalance.auxiliaryBusinessAccountingType,
                                    id: null,
                                    openingBalance: 0,
                                };
                            }
                            if (item.contactType.value === ContactTypeEnumModel.ValueEnum.Company) {
                                item.contactType = [{
                                    id: 'Company', text: '单位'
                                }];
                            } else if (item.contactType.value === ContactTypeEnumModel.ValueEnum.Personal) {
                                item.contactType = [{
                                    id: 'Personal', text: '个人'
                                }];
                            }
                            // else if (item.contactType.value === ContactTypeEnumModel.ValueEnum.Employee) {
                            //     item.contactType = [{
                            //         id: 'Employee', text: '员工'
                            //     }];
                            // }
                            if (item.name === '其他' || item.name === '内部代表') {
                                item.isdefault = true;
                            }
                            this.contactModelLists.push(item);
                            this.countOpeningBalance();
                        }
                    });
                }
                console.log(contactModel);
            },
            (error) => {
                this.alertDanger(error);
            });

    }

    /*------------------------导入文件方法 end-------------------------*/

    oldVal(e) {
        e.target.value = e.target.value.replace(/,/g, '');
        e.target.value = e.target.value.replace(/￥/g, '');
        if (e.target.value === '-' || e.target.value === '0' || e.target.value === '0.00' || isNaN(parseFloat(e.target.value))) {
            e.target.value = '';
        }
    }

    countOpeningBalance(e?, item?) {
        if (e) {
            const re = /^[-]?((\d+)|(\d+\.\d+))$/;
            const isRe = re.test(e.target.value);
            if (isNaN(parseFloat(e.target.value)) || !isRe) {
                e.target.value = '0.00';
                item.auxiliaryBusinessAccountingBalance.openingBalance = e.target.value;
            } else {
                item.auxiliaryBusinessAccountingBalance.openingBalance = e.target.value;
                e.target.value = this.formatMoney(e.target.value);
            }
        }
        this.totalOpeningBalance = 0;
        _.forEach(this.contactModelLists, item1 => {
            this.totalOpeningBalance += Number(item1.auxiliaryBusinessAccountingBalance.openingBalance);
        });
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

    // 重置按钮
    resetting() {
        this.totalOpeningBalance = 0;
        this.contactModelLists = _.cloneDeep(this.defautContactList);
        if (this.contactModelLists) {
            _.forEach(this.contactModelLists, item => {
                item.auxiliaryBusinessAccountingBalance.openingBalance = 0;
            });
        }
    }

    /**
     * 检查是否有重复的条目
     * @param item 条目
     * @param eve 选择的事件
     */
    checkRepeat() {
        // if (item && item.name) {
        const templist: any = _.cloneDeep(this.contactModelLists);
        const tempStore = {};
        _.forEach(templist, temp => {
            temp.name = temp.name.trim();
            if (tempStore[temp.name + temp.contactType[0].id]) {
                temp.repeated = true;
            } else {
                temp.repeated = false;
                tempStore[temp.name + temp.contactType[0].id] = temp;
            }
        });
        this.contactModelLists = _.cloneDeep(templist);
        // }
    }
}

/**
 * 往来列表
 */
interface ContactModels extends ContactModel {
    needContactType?: boolean;
    needName?: boolean;
    needOpeningBalance?: boolean;
    isdefault?: boolean;
    isEmployee?: boolean;
    isHide?: boolean;
}
