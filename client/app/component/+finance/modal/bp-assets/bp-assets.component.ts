import { Component, OnInit, Output, EventEmitter, ViewChild, Optional, Inject } from '@angular/core';

import { ACCOUNTING_BASE_PATH } from '../../../../api/accounting';
import { StorageService } from '../../../../service/core';
import { AccountApi } from '../../../../api/accounting/api/AccountApi';
import { DepreciationCategoryApi } from '../../../../api/accounting/api/DepreciationCategoryApi';
import { FixedAssetApi } from '../../../../api/accounting/api/FixedAssetApi';
import { ImportApi } from '../../../../api/accounting/api/ImportApi';
import { FixedAssetModel } from '../../../../api/accounting/model/FixedAssetModel';
import { DepartmentTypeEnumModel } from '../../../../api/accounting/model/DepartmentTypeEnumModel';
import { ActionsEnumModel } from '../../../../api/accounting/model/ActionsEnumModel';
// import { AssetTypeEnumModel } from '../../../api/accounting/model/AssetTypeEnumModel';

declare var $: any;
import * as _ from 'lodash';
import * as moment from 'moment';

@Component({
    templateUrl: './bp-assets.component.html',
    selector: 'gpw-bp-assets',
    styleUrls: ['./bp-assets.component.scss'],
    providers: [AccountApi, DepreciationCategoryApi, FixedAssetApi, ImportApi]
})

export class BPAssetsComponent implements OnInit {
    @Output() success = new EventEmitter();
    @Output() result = new EventEmitter();

    @ViewChild('modal') public modal;

    title: string = ''; // 分配的标题名称
    assignId: any; // 根据ID获取的所有股东信息
    endingBalance: any = 0; // 期末余额
    assetFlag: any; // 区分是哪种资产
    tempAssetType: any;
    fixedAssetLists: FixedAssetModels[] = [];
    tempDelFixedAssetLists: FixedAssetModels[] = [];
    defaultDepartmentType: any = [{ id: DepartmentTypeEnumModel.ValueEnum.Management, text: '管理部门' }];
    sectorNatureLists = [
        { id: DepartmentTypeEnumModel.ValueEnum.Sales, text: '销售部门' },
        { id: DepartmentTypeEnumModel.ValueEnum.Management, text: '管理部门' },
    ]; // 部门性质
    // fixedOrIntangibleLists = [
    //     {value: AssetTypeEnumModel.ValueEnum.None, text: 'none'},
    //     {value: AssetTypeEnumModel.ValueEnum.FixedAssets, text: 'fixedAssets'},
    //     {value: AssetTypeEnumModel.ValueEnum.IntangibleAssets, text: 'intangibleAssets'},
    // ]; // 固定／无形资产
    fixedTypeLists: any; // 固定资产类别
    lifespan: any;
    residualRate: any;
    minDate: any;
    maxDate: any;
    isPosting: boolean = false; // 是否过完账
    isEnableBPAssets: boolean = false; // 是否启用期初
    totalOriginalPrice: number = 0; // 总额总和

    uploadUrl: string = ''; // 导入的路径
    uploadFileName: any; // 导入的文件名
    fileTypes: any = ['.xls', '.xlsx']; // 导入文件格式
    baseUrl: string;
    // accountId: any = ''; // 通过head传给后台
    listener: any;
    formData;


    initFixedAssetModel = {
        id: '',
        code: '',
        assetType: null,
        number: '',
        name: '',
        depreciationCategory: null,
        lifespan: 10,
        residualRate: 0,
        departmentType: this.defaultDepartmentType,
        originalPrice: 0,
        qty: 1,
        purchasingDate: this.maxDate,
        account: null
    };

    tempAccountInfo: any; // 临时保存科目信息
    template: any;

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
        private accountApi: AccountApi, private depreciationCategoryApi: DepreciationCategoryApi, private fixedAssetApi: FixedAssetApi,
        private importApi: ImportApi) {
        if (baseUrl) {
            this.baseUrl = baseUrl;
        }
    }

    ngOnInit() {
    }

    ngDoCheck() {
       this.totalOriginalPrice = _.reduce(this.fixedAssetLists, (result, item) => {
           return result + Number(item.originalPrice);
       }, 0);
    }

    public show(item, isPosting, isEnableBP) {
        // $('#ui-datepicker-div').css({'display': ''});
        // let UA = navigator.userAgent.toLowerCase();
        // if (UA.indexOf('se') > -1) {
        //     console.log('真的是搜狗吗？？？');
        //     $('#ui-datepicker-div').css({'display': 'fixed !important'});
        // }
        this.formData = new FormData();
        console.log(JSON.stringify(item));
        this.isPosting = isPosting;
        this.isEnableBPAssets = isEnableBP;
        this.assignId = item.id;
        this.modal.show();
        if (item.parentAccount.name === '固定资产') {
            this.assetFlag = item.accountAssignType.value;
            this.title = '固定资产';
            this.tempAssetType = { value: item.accountAssignType.value, name: '固定资产' };
            this.uploadUrl = '/api/v1/import/import_fix';
            this.template = '../../../../assets/template/固定资产.xlsx';
            // this.labelText = '导入固定资产';
        }
        if (item.parentAccount.name === '无形资产') {
            // this.assetFlag = 'IntangibleAssets';
            this.assetFlag = item.accountAssignType.value;
            this.title = '无形资产';
            this.tempAssetType = { value: 'IntangibleAssets', name: '无形资产' };
            this.uploadUrl = '/api/v1/import/import_intangible';
            this.template = '../../../../assets/template/无形资产.xlsx';
            // this.labelText = '导入无形资产';
        }
        if (item.balanceDirection.value === 'Debit') {
            this.endingBalance = item.periodEndDebit;
        } else if (item.balanceDirection.value === 'Credit') {
            this.endingBalance = item.periodEndCredit;
        }
        this.getAccountPeriod();
        this.getAccountInfo();
        this.getFixedAssetType();
    }

    public onHide() {
        this.clearAlert();
        this.endingBalance = 0;
        this.totalOriginalPrice = 0;
        this.assignId = '';
        this.tempAssetType = {};
        this.uploadFileName = '';
        this.uploadUrl = '';
        this.fixedAssetLists = [];
        this.tempDelFixedAssetLists = [];
        this.title = '';
        this.listener = '';
        this.isPosting = false;
        this.isEnableBPAssets = false;
    }

    // 获取返回账期
    getAccountPeriod() {
        this.accountApi.accountAccountPeriod()
            .subscribe(
            accountPeriodModel => {
                console.log('返回账期======>>>>', JSON.stringify(accountPeriodModel));
                if (accountPeriodModel) {
                    this.getPeroidDateArea(accountPeriodModel.currentYear, accountPeriodModel.currentMonth);
                } else {
                    console.log('该年没有往来明细报表');
                }
            },
            (error) => {
                console.log(error);
            });
    }

    // 时间选择限制在会计区间
    getPeroidDateArea(year, month) {
        const date = moment(new Date()).year(year).month(month - 2);
        this.minDate = moment(date).date(1).format('YYYY-MM-DD');

        this.maxDate = moment(date).date(date.daysInMonth()).format('YYYY-MM-DD');
        // console.log('minDate', this.minDate, this.maxDate, date);
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

    // 获取固定资产类别
    getFixedAssetType() {
        this.depreciationCategoryApi.depreciationCategoryGet(this.assetFlag)
            .subscribe(
            depreciationCategoryModel => {
                this.fixedTypeLists = depreciationCategoryModel;
                // this.lifespan = depreciationCategoryModel[0].lifespan;
                // this.residualRate = depreciationCategoryModel[0].residualRate;
                // console.log('获取固定资产类别＝＝＝＝＝', depreciationCategoryModel);
            },
            (error) => {
                console.log(error);
            });
    }

    // 获取已经分配过的信息
    getAssignInfo() {
        this.fixedAssetApi.fixedAssetGet(this.assignId)
            .subscribe(
            fixedAssetModel => {
                // console.log(fixedAssetModel);
                const tempModel: any = fixedAssetModel;
                if (tempModel) {
                    _.forEach(tempModel, item => {
                        item.departmentType = [{ id: item.departmentType.value, text: item.departmentType.name }];
                        item.depreciationCategory = [{ id: item.depreciationCategory.id, name: item.depreciationCategory.name }];
                        item.purchasingDate = moment(item.purchasingDate).format('L');
                        if (this.assetFlag === 'IntangibleAssets') {
                            item.lifespan = item.lifespan / 12;
                        }
                        this.fixedAssetLists.push(item);
                    });
                } else {
                    this.initFixedAssetModel.account = this.tempAccountInfo;
                    this.initFixedAssetModel.assetType = this.tempAssetType;
                    this.initFixedAssetModel.originalPrice = this.endingBalance;
                    this.initFixedAssetModel.purchasingDate = this.maxDate;
                    // 定义临时对象，是为了model隐藏时初始化新增数据
                    const tempObj: any = _.cloneDeep(this.initFixedAssetModel);
                    this.fixedAssetLists.push(tempObj);
                    // this.fixedAssetLists.push(this.initFixedAssetModel);
                }
                // console.log('获取已经分配过的信息===>', this.fixedAssetLists);
            },
            (error) => {
                console.log(error);
            });
    }

    // 下拉框选择
    selected(e, item) {
        if (this.assetFlag === 'FixedAssets') {
            let typeIndex: any;
            typeIndex = this.fixedTypeLists.findIndex((value) => value.id === e.id);
            item.lifespan = this.fixedTypeLists[typeIndex].lifespan;
            item.residualRate = this.fixedTypeLists[typeIndex].residualRate;
        }
    }

    // 保存分配的信息
    saveAssignInfo() {
        this.clearAlert();
        // console.log(JSON.stringify(this.fixedAssetLists));
        let needDataFlag: boolean = false;
        if (this.fixedAssetLists) {
            const tempData: any = this.fixedAssetLists;
            _.forEach(tempData, item => {
                if (!item.departmentType || item.departmentType.length === 0) {
                    item.needDepartmentType = true;
                    needDataFlag = true;
                } else {
                    item.needDepartmentType = false;
                }
                if (!item.depreciationCategory || item.depreciationCategory.length === 0) {
                    item.needDdepreciationCategory = true;
                    needDataFlag = true;
                } else {
                    item.needDdepreciationCategory = false;
                }
                if (!item.name) {
                    item.needName = true;
                    needDataFlag = true;
                } else {
                    item.needName = false;
                }
                if (!item.qty && item.qty !== 0) {
                    item.needQty = true;
                    needDataFlag = true;
                } else {
                    item.needQty = false;
                }
                if (!item.lifespan && item.lifespan !== 0) {
                    item.needLifespan = true;
                    needDataFlag = true;
                } else {
                    item.needLifespan = false;
                }
                if (!item.originalPrice && item.originalPrice !== 0) {
                    item.needOriginalPrice = true;
                    needDataFlag = true;
                } else {
                    item.needOriginalPrice = false;
                }
                if (!item.purchasingDate) {
                    item.needPurchasingDate = true;
                    needDataFlag = true;
                } else {
                    item.needPurchasingDate = false;
                }
            });
            if (needDataFlag) {
                return;
            }
        }

        // 删除的数据只是更改了actions的value变量的值，保存的时候要提交给后台的
        const dataList = _.cloneDeep(this.fixedAssetLists);
        _.forEach(this.tempDelFixedAssetLists, item => {
            dataList.push(item);
        });

        // console.log(JSON.stringify(dataList));
        _.forEach(dataList, item => {
            item.departmentType = {
                value: item.departmentType.value ? item.departmentType.value : item.departmentType[0].id,
                name: item.departmentType.name ? item.departmentType.name : item.departmentType[0].text
            };
            // console.log(item.depreciationCategory);
            if (item.depreciationCategory.constructor === Array) {
                item.depreciationCategory = {
                    id: item.depreciationCategory[0].id,
                    name: item.depreciationCategory[0].text ? item.depreciationCategory[0].text : item.depreciationCategory[0].name
                };
            } else {
                item.depreciationCategory = {
                    id: item.depreciationCategory.id,
                    name: item.depreciationCategory.name
                };
            }
            if (this.assetFlag === 'IntangibleAssets') {
                item.lifespan = item.lifespan * 12;
            }

        });
        console.log(JSON.stringify(dataList));

        this.fixedAssetApi.fixedAssetBatchUpdate(dataList)
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
            error => {
                // console.log('设计开发接口速度恢复健康==》', this.fixedAssetLists);
                this.alertDanger(error);
            });
    }

    // 分配分类 新增
    newAssetItem() {
        this.fixedAssetLists.push({
            id: '',
            code: '',
            assetType: this.tempAssetType,
            number: '',
            name: '',
            depreciationCategory: null,
            lifespan: 10,
            residualRate: 0,
            departmentType: this.defaultDepartmentType,
            originalPrice: 0,
            qty: 1,
            purchasingDate: this.maxDate,
            account: this.tempAccountInfo,
        });
    }

    // 分配分类 删除
    delAssetItem(index) {
        // if (this.fixedAssetLists.length === 1) return;
        if (this.fixedAssetLists[index].id) {
            this.fixedAssetLists[index].actions = { value: ActionsEnumModel.ValueEnum.Delete, name: '' };
            this.fixedAssetLists[index].originalPrice = 0;
            this.tempDelFixedAssetLists.push(this.fixedAssetLists[index]);
        }
        this.fixedAssetLists.splice(index, 1);
        this.countOriginalPrice();
        // console.log('del=====>>>>', JSON.stringify(this.tempDelFixedAssetLists));
    }

    // 跟踪ngFor中item
    trackByFn(index: number, item) {
        return index;
    }

    // 选择文件后，点击确定直接导入文件
    importedFiles(event) {
        this.uploadFileName = event.target.files[0];
        this.uploadFile();
        // console.log('uploadFileName======>', this.uploadFileName);
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
                $('#uploadFixedBtn').val('');
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
                        this.formData = new FormData();
                        clearInterval(this.listener);
                        return;
                    }
                    if (count > 7) {
                        this.openError(sid);
                        this.formData = new FormData();
                        clearInterval(this.listener);
                        return;
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
        // console.log(e);
        this.fixedAssetApi.fixedAssetImportHistory(e).subscribe(
            fixedAssetModel => {
                console.log('data=> ', JSON.stringify(fixedAssetModel[0]));
                const tempModel: any = fixedAssetModel;
                if (tempModel) {
                    _.forEach(tempModel, item => {
                        item.departmentType = [{ id: item.departmentType.value, text: item.departmentType.name }];
                        item.depreciationCategory = [{ id: item.depreciationCategory.id, name: item.depreciationCategory.name }];
                        item.purchasingDate = moment(item.purchasingDate).format('L');
                        item.account = this.tempAccountInfo;
                        this.fixedAssetLists.push(item);
                    });
                    this.countOriginalPrice();
                }
                if (this.fixedAssetLists && this.fixedAssetLists.length > 0 && !this.fixedAssetLists[0].id) {
                    this.fixedAssetLists.splice(0, 1);
                }
            }, err => {
                this.alertDanger(err);
            });
    }


    /*------------------------导入文件方法 end-------------------------*/

    aa() {
        // $('#ui-datepicker-div').css({'display': ''});
        // let UA = navigator.userAgent.toLowerCase();
        // if (UA.indexOf('se') > -1) {
        //     console.log('真的是搜狗吗？？？');
        //     $('#ui-datepicker-div').css({'display': 'fixed !important'});
        // }
    }

    oldVal(e) {
        e.target.value = e.target.value.replace(/,/g, '');
        e.target.value = e.target.value.replace(/￥/g, '');
        if (e.target.value === '-' || e.target.value === '0' || e.target.value === '0.00' || isNaN(parseFloat(e.target.value))) {
            e.target.value = '';
        }
    }

    countOriginalPrice(e?, item?) {
        if (e) {
            const re = /^[-]?((\d+)|(\d+\.\d+))$/;
            const isRe = re.test(e.target.value);
            if (isNaN(parseFloat(e.target.value)) || !isRe) {
                e.target.value = '0.00';
                item.originalPrice = e.target.value;
            }else {
                item.originalPrice = e.target.value;
                e.target.value = this.formatMoney(e.target.value);
            }
        }
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
 * 资产列表
 */
interface FixedAssetModels extends FixedAssetModel {
    needDepartmentType?: boolean;
    needDdepreciationCategory?: boolean;
    needName?: boolean;
    needQty?: boolean;
    needOriginalPrice?: boolean;
    needPurchasingDate?: boolean;
    needLifespan?: boolean;
}
