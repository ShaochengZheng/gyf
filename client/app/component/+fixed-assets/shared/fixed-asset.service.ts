import { InvoiceTypeEnumModel } from './../../../api/accounting/model/InvoiceTypeEnumModel';
import { Injectable } from '@angular/core';
import { AssetCategoryModel, MFixedAssetModel, ValidateModel } from './fixed-asset.model';
import { SourceTypeEnumModel } from './../../../api/accounting/model/SourceTypeEnumModel';
import {
    AccountBookSettingApi, TagApi, TaxApi, ContactApi, FixedAssetApi, DepreciationCategoryApi
} from './../../../api/accounting/api/api';

import { ShareService } from './../../../service/core/share';

import * as moment from 'moment';
import * as _ from 'lodash';

@Injectable()
export class FixedAssetService {

    defaultDate: any = '';
    currentYear: any = '';
    currentMonth: any = '';
    taxContainer: any = {};
    constructor(private tagApi: TagApi, private faApi: FixedAssetApi, private dcateApi: DepreciationCategoryApi,
        private contactApi: ContactApi, private shareService: ShareService, private taxApi: TaxApi,
        private accountSetApi: AccountBookSettingApi) {
        this.shareService.accountAccountPeriod()
            .then(data => {
                this.currentYear = data.currentYear;
                this.currentMonth = data.currentMonth;
                this.defaultDate = this.getDefautDate(data.currentYear, data.currentMonth);
            }).catch(error => {

            });
    }

    /**
     * 新增固定资产 ／ 无形资产
     * @param model 固定资产 model.assetType=== FixedAssets  无形资产 model.assetType=== IntangibleAssets
     */
    saveFixed(model: any) {
        return new Promise((resolve, reject) => {
            this.faApi.fixedAssetPost(model).subscribe(
                data => {
                    resolve(data);
                }, error => {
                    reject(error);
                }
            );
        });
    }
    /**
     * 编辑固定资产 ／ 无形资产
     * @param model 固定资产 model.assetType=== FixedAssets  无形资产 model.assetType=== IntangibleAssets
     */
    updateAsser(model: any) {
        return this.faApi.fixedAssetPut(model).toPromise();
    }

    /**
     * 获取固定资产详情
     * @param id 源id
     */
    getFixedDetailById(id): Promise<MFixedAssetModel> {
        return new Promise((resolve, reject) => {
            this.faApi.fixedAssetGet_1(id).subscribe(
                data => {
                    console.log(data);
                    // resolve(data);
                    const temp: any = _.cloneDeep(data);
                    const model: MFixedAssetModel = { currentCatory: [], currentContact: [], currentDepartment: [], fixedAsset: {} };
                    if (temp.contact) {
                        model.currentContact = [{ id: temp.contact.id, text: temp.contact.name }];
                    }
                    if (temp.depreciationCategory) {
                        model.currentCatory = [{ id: temp.depreciationCategory.id, text: temp.depreciationCategory.name }];
                    }

                    if (temp.departmentType) {
                        model.currentDepartment = [{ id: temp.departmentType.value, text: temp.departmentType.name }];
                    }

                    if (temp.inputTaxType) {
                        model.currentTaxCategory = [{ id: temp.inputTaxType.id, text: temp.inputTaxType.name }];
                    }

                    if (temp.invoiceType) {
                        model.currentInvoiceType = [{ id: temp.invoiceType.value, text: temp.invoiceType.name }];
                    }

                    if (temp.taxRate) {
                        model.currentTax = [{ id: temp.taxRate, text: Number(temp.taxRate) * 100 + '%' }];
                    }
                    model.addTagList = temp.tags;
                    model.attachmentList = temp.accountAttachmentModels;

                    temp.purchasingDate = moment(temp.purchasingDate).format('L');
                    model.isEditable = this.isInPeroidDate(temp.purchasingDate);
                    model.fixedAsset = _.cloneDeep(temp);
                    console.log('getAsset', model);
                    resolve(model);
                },
                err => {
                    reject(err);
                });
        });
    }

    /**
     * 分页获取固定资产
     * @param assetTypeEnum
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @param minAmount 原值小值
     * @param maxAmount 原值大值
     * @param depreciationCategoryId 分类id
     * @param keyword 关键字
     * @param qty 数量
     * @param status 状态
     * @param tags 标签
     * @param pageIndex 页数索引
     * @param pageSize 页数大小
     */
    searchFixedAssets(model: any) {
        return new Promise((resolve, reject) => {
            this.faApi.fixedAssetSearch(model.assetTypeEnum, model.startDate, model.endDate, model.minAmount, model.maxAmount,
                model.depreciationCategoryId, model.keyword, model.qty, model.status, model.tagIds, model.pageIndex,
                model.pageSize).subscribe(
                data => {
                    const temp: any = _.cloneDeep(data);
                    if (temp.list) {
                        temp.list.forEach(item => {
                            if (item.sourceType.value === SourceTypeEnumModel.ValueEnum.Manual) {
                                item.isManual = true;
                            }
                        });
                    }
                    console.log(temp);
                    resolve(temp);
                }, error => {
                    // console.log(error);
                    // let msg = error;
                    reject(error);
                });
        });
    }

    /**
     * 获取列表合计
     * @param assetTypeEnum
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @param minAmount 原值小值
     * @param maxAmount 原值大值
     * @param depreciationCategoryId 分类id
     * @param keyword 关键字
     * @param qty 数量
     * @param status 状态
     * @param tags 标签
     */
    getAssetsSum(model: any): Promise<number> {
        return new Promise((resolve, reject) => {
            this.faApi.fixedAssetFixedAssetSum(model.assetTypeEnum, model.startDate, model.endDate, model.minAmount, model.maxAmount,
                model.depreciationCategoryId, model.keyword, model.qty, model.status, model.tagIds).subscribe(
                data => {
                    if (data) {
                        const sum: any = data[0].name;
                        resolve(sum);
                    } else {
                        reject('获取数据失败');
                    }
                }, error => {
                    // console.log(error);
                    // let msg = error;
                    reject(error);
                });
        });

    }

    /**
     * 根据id删除固定资产
     * @param id
     */
    deletFiedAssetsById(id) {
        return new Promise((resolve, reject) => {
            this.faApi.fixedAssetDelete(id).subscribe(
                data => {
                    resolve(data);
                }, error => {
                    // console.log(error
                    // );
                    // let msg = error;
                    reject(error);
                }
            );
        });
        // return this.faApi.fixedAssetDelete(id).toPromise();
    }
    /**
     * 获取资产分类
     * @param type 资产类型 固定 FixedAssets 无形 IntangibleAssets
     */
    getAssetCategory(type: any): Promise<AssetCategoryModel[]> {
        // return this.dcateApi.depreciationCategoryGet(type).toPromise();
        return new Promise((resolve, reject) => {
            this.dcateApi.depreciationCategoryGet(type).subscribe(
                data => {
                    const tempList: AssetCategoryModel[] = [];
                    for (let i = 0; i < data.length; i++) {
                        const item: any = data[i];
                        item.text = item.name;
                        tempList.push(item);
                    }
                    resolve(tempList);
                }, err => {
                    reject(err);
                });
        });
    }

    /**
     *  获取往来联系人
     */
    getContactList(): Promise<any[]> {
        return new Promise((resolve, reject) => {
            this.contactApi.contactGetAll().subscribe(
                data => {
                    const tempList = [{ id: '0', text: '+新增往来' }];
                    _.forEach(data, item => {
                        tempList.push({ id: item.id, text: item.name });
                    });
                    resolve(tempList);
                },
                err => {
                    reject(err);
                });
        });
    }
    /**
     * 获取默认联系人 内部代表
     * @param list 往来列表
     */
    getDefaultContact(list: Array<any>): Array<any> {
        if (!list) { return []; }
        let rValue;
        list.forEach(item => {
            if (item.text === '(个)内部代表') {
                rValue = item;
            }
        });
        return [rValue];
    }

    /**
     * 获取默认时间 当前
     */
    getDefaultDate() {
        const date: any = moment(new Date()).format('YYYY-MM-DD');
        return date;
    }


    /**
     * 计算月折旧额
     * @param amount 折旧金额
     * @param category 折旧分类
     * @param type 固定财产/无形资产
     *
     */
    caculateMonthAmount(amount, category, type) {
        const accountCate = category;
        console.log('caculateMonthAmount=>', amount, category, type);
        if (amount === 0) {
            return 0;
        }
        if (category === null || category === undefined) {
            return 0;
        }
        let monthDepreciate;
        if (type === 'Fixed') {
            // monthDepreciate = (amount * (1 - accountCate.residualRate) / (accountCate.lifespan * 12)).toFixed(2);
            monthDepreciate = this.caculateMonthAmount_1(amount, accountCate.residualRate, accountCate.lifespan, 'Fixed');
        } else {
            // monthDepreciate = (amount / (accountCate.lifespan * 12)).toFixed(2);
            monthDepreciate = this.caculateMonthAmount_1(amount, null, accountCate.lifespan, 'Intangible');
        }
        console.log('caculateMonthAmount=>', amount, category, monthDepreciate);
        return monthDepreciate;
    }
    /**
     * 计算税额
     * @param amount
     * @param tax
     */
    caculateTax(amount, tax) {
        return Number((amount * Number(tax)).toFixed(2));
    }

    /**
     * 计算价税金额
     * @param amount
     * @param tax
     */
    caculateExclTax(amount, tax) {
        return Number((amount / (1 + Number(tax))).toFixed(2));
    }

    /**
     * 计算月折旧额
     * @param amount
     * @param residualRate
     * @param lisfspan
     * @param type  Fixed 固定资产分类 Intangible 无形资产
     */
    caculateMonthAmount_1(amount, residualRate, lifespan, type) {
        if (amount === 0) {
            return 0;
        }
        let monthDepreciate;
        if (!lifespan || lifespan === 0) {
            return 0;
        }
        if (type === 'Fixed') {
            monthDepreciate = (amount * (1 - residualRate) / (lifespan)).toFixed(2);
        } else {
            monthDepreciate = (amount / (lifespan)).toFixed(2);
        }
        return monthDepreciate;
    }

    /**
     * 获取所有标签
     * @param start 从第几个开始
     * @param size 取几个
     * @param lastRequest 是否取剩下所有的
     */
    getAllTags(): Promise<any[]> {
        return new Promise((resolve, reject) => {
            this.tagApi.tagSearch(0, 10, true).subscribe(
                data => {
                    if (data === null || data === undefined) {
                        data = [];
                    }
                    resolve(data);
                }, error => {
                    reject(error);
                });
        });
    }
    /**
     * 计算已折旧月
     * @param depreDate 折旧日期
     */
    calculateDepredMonth(depreDate) {
        let currentDate: any = new Date();
        if (localStorage.getItem('currentPeriod')) {
            currentDate = localStorage.getItem('currentPeriod'); // 当前会计期间
        }
        if (moment(depreDate).isSameOrAfter(moment(currentDate))) { // 如果开始折旧日期 跟当前会计期间相等 返回 已折旧月 = 0
            return 0;
        }
        const currentMonth = moment(currentDate).month() + 1; // 会计期间月
        const currentYear = moment(currentDate).year();   // 会计期间年
        const depreMonth = moment(depreDate).month() + 1; // 开始折旧月
        const depreYear = moment(depreDate).year();   // 开始折旧年
        console.log(localStorage.getItem('currentPeriod'));
        const yearDeviation = Math.abs(depreYear - currentYear); // 年差额 绝对值
        /**
         * 有以下情况：
         *  1.同年，
         *      折旧月 = 当前会计期间月 - 开始折旧月
         *  2.不同年
         *      （年差额 - 1）* 12 + （ 12 -开始折旧月 ）+ 当前会计期间月
         */
        console.log('calculateDepredMonth =>', yearDeviation, currentMonth, depreMonth, currentYear, depreYear);
        if (yearDeviation === 0) {// 同年
            if (currentMonth === depreMonth) {
                return 1;
            }
            return Math.abs(currentMonth - depreMonth);
        } else {
            return (yearDeviation - 1) * 12 + (12 - depreMonth) + currentMonth;
        }
    }
    /**
     * 计算折旧结束日期
     * @param depreDate 开始折旧日期
     * @param lifespan 折旧期
     */
    getEndDate(depreDate, lifespan) {
        const years = (lifespan / 12).toFixed(0);
        const year = moment(depreDate).year() + Number(years);
        console.log('getenddate =>', years, year);
        return moment(depreDate).set('year', year);
    }

    /**
     * TODO 待优化 想一个更好的方法
     * 表单规则验证
     * @param model
     */
    getFormValid(model: any): ValidateModel {
        console.log('getFormValid', model);
        const validtor: ValidateModel = {
            dateValid: false,
            bookDateValid: false,
            contactValid: false,
            nameValid: false,
            departmentValid: false,
            qulityValid: false,
            categoryValid: false,
            amountValid: false,
            taxValid: false,
            taxCategoryValid: false,
            invoiceNumberValid: false,
            invoiceTypeValid: false,
            valid: false
        };

        if (!model) {
            return validtor;
        }
        const hidden = model.currentInvoiceType[0].id === InvoiceTypeEnumModel.ValueEnum.General;
        if (!model.fixedAsset.purchasingDate || model.fixedAsset.purchasingDate === '') {
            validtor.dateValid = true;
        }

        if (model.fixedAsset.originalPrice === 0 || model.fixedAsset.originalPrice === '0.00') {
            validtor.amountValid = true;
        }

        if (model.fixedAsset.qty <= 0) {
            validtor.qulityValid = true;
        }

        if (model.fixedAsset.name === null || model.fixedAsset.name === undefined) {
            validtor.nameValid = true;
        }

        if (model.currentCatory === null || model.currentCatory === undefined) {
            validtor.categoryValid = true;
        }

        if (!model.currentContact || !model.currentContact[0]) {
            validtor.contactValid = true;
        }

        if (hidden) {
            validtor.taxValid = false;
            validtor.invoiceNumberValid = false;
            validtor.taxCategoryValid = false;
        } else {
            if (model.currentTax === null || model.currentTax === undefined) {
                validtor.taxValid = true;
            }
            if (!model.fixedAsset.invoiceNumber || model.fixedAsset.invoiceNumber === '') {
                validtor.invoiceNumberValid = true;
            }
            if (model.currentTaxCategory === null || model.currentTaxCategory === undefined) {
                validtor.taxCategoryValid = true;
            }
        }

        // TODO 待优化 想一个更好的方法
        if (validtor.amountValid || validtor.bookDateValid || validtor.categoryValid || validtor.contactValid || validtor.dateValid
            || validtor.departmentValid || validtor.invoiceNumberValid || validtor.invoiceNumberValid || validtor.invoiceTypeValid
            || validtor.nameValid || validtor.qulityValid || validtor.taxCategoryValid || validtor.taxValid) {
            validtor.valid = true;
        } else {
            validtor.valid = false;
        }
        // validtor
        return validtor;
    }
    /**
     * 验证器
     */
    validtor(data): boolean {
        if (!data) {
            return true;
        }
        // 数字验证
        if (data instanceof Number) {
            if (data <= 0) {
                return true;
            }
        }
        return false;
    }

    /**
     * 转换附件URL
     */
    formatAttachmentURL(data: Array<any>) {
        if (data === null || data === undefined) {
            return [];
        }
        const temp: Array<any> = data;
        const templist = [];
        // 匹配最后一个小数点后面的内容 加上—_s 再去替换
        const re = /\.[^\.]+\s*?$/i;
        for (let i = 0; temp.length > i; i++) {
            const item = temp[i];
            const e = item.url.match(re);
            const f = '_s' + e[0];
            // let b = this.cacheImage[0].url.replace(re, f);
            item.surl = item.url.replace(re, f);
            templist.push(item);
        }
        return templist;
    }

    /**
     * 获取会计区间可选日期
     * @param currentPeroid 当前会计区间
     */
    getPeroidDateArea(year, month) {
        const date = moment(new Date()).year(year).month(month - 1);
        console.log('getPeroidDateArea', date.daysInMonth());
        const minDate = moment(date).date(1).format('YYYY-MM-DD');

        const maxDate = moment(date).date(date.daysInMonth()).format('YYYY-MM-DD');
        this.defaultDate = maxDate;
        console.log('minDate', minDate, maxDate);
        return { minDate: minDate, maxDate: maxDate };
    }
    /**
     * 业务单是否在当前会计区间
     */
    isInPeroidDate(date): boolean {
        console.log('isInPeroidDate', date, this.currentMonth, this.currentYear);
        const year = moment(date).year();
        const month = moment(date).month() + 1;
        if (year === this.currentYear && month === this.currentMonth) {
            return true;
        }
        return false;
    }
    /**
     * 获取固定／无形资产税率类别
     * @param type FixedAssets 固定资产 IntangibleAssets 无形资产
     */
    getBusinessTax(type): Promise<Array<any>> {
        return new Promise((resolve, reject) => {
            this.taxApi.taxGetBusinessTaxWithCategory(type).subscribe(
                data => {
                    console.log('getBusinessTax', data);
                    resolve(this.getTaxList(data));
                }, error => {
                    console.log('getBusinessTax error', error);
                }
            );
        });
    }
    /**
     * 根据税率获取相应的类别
     * @param taxVal
     */
    getTaxCategoryByTax(taxVal) {
        const temp = this.taxContainer[taxVal];
        const templist = [];
        if (temp) {
            temp.inputTaxCategory.forEach(item => {
                templist.push({ id: item.id, text: item.name });
            });
        }
        return templist;
    }
    /**
     * 整理固定／无形资产提交data
     * @param data 资产model
     */
    getAssetModel(data): any {
        if (!data) { return undefined; }
        const model: MFixedAssetModel = _.cloneDeep(data);

        if (model.addTagList && model.addTagList.length > 0) {
            model.fixedAsset.tags = model.addTagList;
        }
        if (model.attachmentList && model.attachmentList.length > 0) {
            model.fixedAsset.accountAttachmentModels = model.attachmentList;
        }
        // 发票类型
        if (model.currentInvoiceType) {
            model.fixedAsset.invoiceType = { value: model.currentInvoiceType[0].id, name: model.currentInvoiceType[0].text };
            if (model.currentInvoiceType[0].id === InvoiceTypeEnumModel.ValueEnum.General) {
                model.fixedAsset.invoiceNumber = '';
                model.fixedAsset.tax = 0;
                model.fixedAsset.taxRate = 0;
                model.fixedAsset.exclusiveOfTax = 0;
                model.fixedAsset.inputTaxType = null;
                model.currentTaxCategory = null;
            }
        }
        // 进销税类别
        if (model.currentTaxCategory) {
            model.fixedAsset.inputTaxType = { id: model.currentTaxCategory[0].id, name: model.currentTaxCategory[0].text };
        }
        // 资产分类
        if (model.currentCatory) {
            model.fixedAsset.depreciationCategory = { id: model.currentCatory[0].id, name: model.currentCatory[0].text };
        }
        // 对方信息
        if (model.currentContact && model.currentContact.length > 0) {
            model.fixedAsset.contact = { id: model.currentContact[0].id, name: model.currentContact[0].text };
        }
        // 部门性质
        if (model.currentDepartment) {
            model.fixedAsset.departmentType = { value: model.currentDepartment[0].id, name: model.currentDepartment[0].text };
        }
        console.log(model);
        return model.fixedAsset;
    }

    /**
     * 请求当前会计期间
     */
    requestPeroidDate(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.accountSetApi.accountBookSettingGet().subscribe(
                accountBookSettingModel => {
                    const period: any =
                        this.getPeroidDateArea(accountBookSettingModel.accountPeriodYear, accountBookSettingModel.accountPeriodMonth);
                    resolve(period);
                },
                error => {
                    reject(error);
                }
            );
        });
    }

    /**
     * 获取税率列表
     * @param arr 原始数据
     */
    private getTaxList(arr: Array<any>): Array<any> {
        this.taxContainer = [];
        if (!arr) {
            return [];
        }
        const templist = [];
        arr.forEach(item => {
            if (!this.taxContainer[item.taxVal]) {
                this.taxContainer[item.taxVal] = item;
            }
            templist.push({ id: item.taxVal, text: item.taxVal * 100 + '%' });
        });
        return templist;
    }

    /**
     * 获取当前会计区间默认 记账日
     */
    private getDefautDate(year, month) {
        const date = moment(new Date()).year(year).month(month - 1);
        return moment(date).date(date.daysInMonth()).format('YYYY-MM-DD');
    }


}
