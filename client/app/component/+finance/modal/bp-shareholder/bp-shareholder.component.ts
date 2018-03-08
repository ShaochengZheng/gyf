/**
 * 1、传递科目的ID，期初的年月，用来获取该条信息的科目信息
 * 2、通过科目ID获取可能分配过的信息
 * 3、有可能下载模版或者导入信息
 * 4、点击保存
 */

import { Component, OnInit, Output, EventEmitter, ViewChild, Optional, Inject } from '@angular/core';

import { ACCOUNTING_BASE_PATH } from '../../../../api/accounting';
import { StorageService } from '../../../../service/core';
import { ShareholderApi } from '../../../../api/accounting/api/ShareholderApi';
import { AccountApi } from '../../../../api/accounting/api/AccountApi';
import { ImportApi } from '../../../../api/accounting/api/ImportApi';
import { ShareholderModel } from '../../../../api/accounting/model/ShareholderModel';
import { ActionsEnumModel } from '../../../../api/accounting/model/ActionsEnumModel';

declare var $: any;
import * as _ from 'lodash';
@Component({
    templateUrl: './bp-shareholder.component.html',
    selector: 'gpw-bp-shareholder',
    styleUrls: ['./bp-shareholder.component.scss','../../finance.component.scss'],
    providers: [ShareholderApi, AccountApi, ImportApi]
})

export class BPShareholderComponent implements OnInit {
    @Output() success = new EventEmitter();
    @Output() result = new EventEmitter();

    @ViewChild('modal') public modal;
    // uploadExcel: string = '';
    // type: string = 'file';
    // labelText: string = '';

    assignId: any; // 根据ID获取的所有股东信息
    shareholdLists: ShareholderModels[] = [];
    tempDelShareholdLists: ShareholderModels[] = [];
    endingBalance: any = 0; // 期末余额
    year: any; // 为了获取该数据的科目
    month: any; // 为了获取该数据的科目
    tempAccountInfo: any; // 临时保存科目信息
    totalProportion: number = 0; // 投资比例总和
    totalAmount: number = 0; // 初始余额总和
    setIncludesShareProportion: number = 0; // 设置中的股东比例总和
    noAssignShareProportion: number = 0; // 不包含分配股东的比例总和
    redColor: any = false;
    isPosting: boolean = false; // 是否过完账

    uploadUrl: string; // 导入的路径
    uploadFileName: any; // 导入的文件名
    fileTypes: any = ['.xls', '.xlsx']; // 导入文件格式
    baseUrl: string;
    listener: any;
    template: string = '';

    initShareholderModel = {
        id: '',
        name: '',
        amount: null,
        shareProportion: 0,
        account: null,
    };
    formData;

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
        private shareholderApi: ShareholderApi, private accountApi: AccountApi, private importApi: ImportApi) {
        if (baseUrl) {
            this.baseUrl = baseUrl;
        }
    }

    ngOnInit() {
        this.uploadUrl = '';
    }

    public show(item, date, isPosting) {
        this.assignId = item.id;
        this.isPosting = isPosting;
        this.year = date.split('-')[0];
        this.month = date.split('-')[1];
        if (item.balanceDirection.value === 'Debit') {
            this.endingBalance = item.periodEndDebit;
        } else if (item.balanceDirection.value === 'Credit') {
            this.endingBalance = item.periodEndCredit;
        }
        this.getShareProportionTotal();
        this.getAccountInfo();
        this.modal.show();
        this.uploadUrl = '/api/v1/import/import_ShareHolder';
        this.template = '../../../../assets/template/股东.xlsx';
        // this.labelText = '导入股东';
    }

    public onHide() {
        this.clearAlert();
        this.shareholdLists = [];
        this.tempDelShareholdLists = [];
        this.assignId = '';
        this.year = '';
        this.month = '';
        this.redColor = false;
        this.endingBalance = 0;
        this.uploadFileName = '';
        this.uploadUrl = '';
        this.template = '';
        this.totalAmount = 0;
        // this.isPosting = false;
    }

    // 获取账套股东投资比例合计
    getShareProportionTotal() {
        this.shareholderApi.shareholderGetShareProportionTotal()
            .subscribe(
            amountModel => {
                this.setIncludesShareProportion = Math.round((amountModel.totalAmount * 100) * 100) / 100;
                this.totalProportion = this.setIncludesShareProportion;
            },
            (error) => {
                console.log(error);
            });
    }

    // 跟进年月ID获取分配的科目信息
    getAccountInfo() {
        this.accountApi.accountGet_1(0, 0, this.assignId)
            .subscribe(
            accountModel => {
                console.log(accountModel);
                const subject: any = accountModel;
                this.tempAccountInfo = { id: subject.id, name: subject.name };
                this.getAssignInfo();
            },
            (error) => {
                console.log(error);
            });
    }

    // 获取已经分配过的信息
    getAssignInfo() {
        this.totalAmount = 0;
        this.shareholderApi.shareholderGet(this.assignId)
            .subscribe(
            shareholderModel => {
                console.log(shareholderModel);
                if (shareholderModel && shareholderModel.length > 0) {
                    let tempShareProportion: number = 0;
                    _.forEach(shareholderModel, item => {
                        item.shareProportion = Math.round((item.shareProportion * 100) * 100) / 100;
                        tempShareProportion = tempShareProportion + Number(item.shareProportion);
                        this.totalAmount += item.amount;
                        this.shareholdLists.push(item);
                    });
                    this.noAssignShareProportion = this.setIncludesShareProportion - tempShareProportion;
                } else {
                    this.totalAmount = this.endingBalance;
                    this.initShareholderModel.account = this.tempAccountInfo;
                    this.initShareholderModel.amount = this.endingBalance;
                    // 定义临时对象，是为了model隐藏时初始化新增数据
                    const tempObj: any = _.cloneDeep(this.initShareholderModel);
                    this.shareholdLists.push(tempObj);
                }
            },
            (error) => {
                console.log(error);
            });
    }

    // 保存分配的信息
    saveAssignInfo() {
        this.clearAlert();
        console.log(JSON.stringify(this.shareholdLists));
        let needDataFlag: boolean = false;
        console.log(this.totalProportion);
        // if (this.totalProportion > 100) {
        //     this.redColor = true;
        //     return;
        // }
        if (this.shareholdLists) {
            _.forEach(this.shareholdLists, item => {
                if (!item.name) {
                    item.needName = true;
                    needDataFlag = true;
                } else {
                    item.needName = false;
                }
                if ((!item.amount && item.amount !== 0) || item.amount < 0) {
                    item.needAmount = true;
                    needDataFlag = true;
                } else {
                    item.needAmount = false;
                }
                // if (!item.shareProportion && item.shareProportion !== 0) {
                //     item.needShareProportion = true;
                //     needDataFlag = true;
                // } else {
                //     item.needShareProportion = false;
                // }
            });
            if (needDataFlag) {
                return;
            }
        }
        // 删除的数据只是更改了actions的value变量的值，保存的时候要提交给后台的
        const dataList = _.cloneDeep(this.shareholdLists);
        _.forEach(this.tempDelShareholdLists, item => {
            dataList.push(item);
        });
        _.forEach(dataList, item => {
            item.shareProportion = Number((item.shareProportion / 100).toFixed(4));
        });
        this.shareholderApi.shareholderBatchUpdate(dataList)
            .subscribe(
            boolResultModel => {
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

    // 新增股东
    newShareholderItem() {
        this.shareholdLists.push({
            id: '',
            name: null,
            amount: 0,
            shareProportion: 0,
            account: this.tempAccountInfo,
        });
    }

    // 删除股东
    delShareholderItem(index) {
        this.totalProportion = this.totalProportion - Number(this.shareholdLists[index].shareProportion);
        if (this.shareholdLists[index].id) {
            this.shareholdLists[index].actions = { value: ActionsEnumModel.ValueEnum.Delete, name: '' };
            this.shareholdLists[index].amount = 0;
            this.shareholdLists[index].shareProportion = 0;
            this.tempDelShareholdLists.push(this.shareholdLists[index]);
        }
        this.shareholdLists.splice(index, 1);
        // console.log('del=====>>>>', JSON.stringify(this.tempDelShareholdLists));
    }

    // 跟踪ngFor中item
    trackByFn(index: number, item) {
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
                if (this.uploadFileName.name.substring(this.uploadFileName.name.length - item.length) === item) {
                    isValidType = true;
                }
            });
            if (!isValidType) {
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
        // console.log('urlll====>', this.baseUrl + this.uploadUrl);
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
                $('#uploadShareholderBtn').val('');
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
                        return;
                    }
                    if (count > 7) {

                        clearInterval(this.listener);
                        this.openError(sid);
                        this.formData = new FormData();
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
        this.shareholderApi.shareholderImportHistory(e).subscribe(
            shareholderModel => {
                // console.log(shareholderModel);
                const tempShareholderModel: any = shareholderModel;
                if (tempShareholderModel) {
                    _.forEach(tempShareholderModel, item => {
                        item.account = this.tempAccountInfo;
                        item.shareProportion = Math.round((item.shareProportion * 100) * 100) / 100;
                        this.totalProportion = this.totalProportion + Number(item.shareProportion);
                        this.shareholdLists.push(item);
                    });
                }
                if (this.shareholdLists && this.shareholdLists.length > 0 && !this.shareholdLists[0].id) {
                    this.shareholdLists.splice(0, 1);
                }
                // console.log(this.shareholdLists);
            },
            (error) => {
                this.alertDanger(error);
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

    // 投资金额
    onChangeAmount(e, item) {
        if (e) {
            const re = /^[-]?((\d+)|(\d+\.\d+))$/;
            const isRe = re.test(e.target.value);
            if (isNaN(parseFloat(e.target.value)) || !isRe) {
                e.target.value = '0.00';
                item.amount = e.target.value;
            } else {
                item.amount = e.target.value.replace(/-/, '');
                e.target.value = this.formatMoney(e.target.value);
            }
        }
        // if (isNaN(parseFloat(e.target.value))) {
        //     e.target.value = '';
        //     item.amount = '';
        // }else {
        //     e.target.value = e.target.value.replace(/-/, '');
        //     item.amount = this.toDecimal(e.target.value);
        //     e.target.value = item.amount;
        // }
    }

    // 投资百分比
    onChange(e, item) {
        this.totalProportion = this.noAssignShareProportion;
        this.redColor = false;
        if (isNaN(parseFloat(e.target.value))) {
            e.target.value = '';
            item.shareProportion = '';
        } else {
            e.target.value = e.target.value.replace(/-/, '');
            // item.shareProportion = (((parseFloat(e.target.value) || 0) * 100) / 100).toFixed(2);
            item.shareProportion = this.toDecimal(e.target.value);
            e.target.value = item.shareProportion;
        }
        // tslint:disable-next-line:no-shadowed-variable
        _.forEach(this.shareholdLists, item => {
            this.totalProportion = this.totalProportion + Number(item.shareProportion);
        });
        // console.log(e.target.value, '&&&&&&&&&&', item.shareProportion, '========', isNaN(parseFloat(e.target.value)));
    }

    // 将浮点数四舍五入，取小数点后2位
    toDecimal(x) {
        let f: any = parseFloat(x);
        if (isNaN(f)) {
            return;
        }
        f = (Math.round(x * 100) / 100).toFixed(2);
        return f;
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

    calculateShareholdLists() {
        this.totalAmount = _.reduce(this.shareholdLists, function (result, item) {
            return result + Number(item.amount);
        }, 0);
        return this.totalAmount;
    }


}

/**
 * 股东列表
 */
interface ShareholderModels extends ShareholderModel {
    needName?: boolean;
    needAmount?: boolean;
    needShareProportion?: boolean;
}
