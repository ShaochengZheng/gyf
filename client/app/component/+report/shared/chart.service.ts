import { CompanyModel } from './../../../api/identity/model/CompanyModel';
import { MbuildingModel } from './mbuilding.model';
import { Injectable } from '@angular/core';


import { ChartApi } from './../../../api/accounting/api/ChartApi';
import { AccountApi } from '../../../api/accounting/api/AccountApi';

import { DeductionOfInputTaxModel, VATModel, BuildingTaxModel } from '../../../api/accounting/model/models';
import { AuthorizationService } from './../../../service/core/authorization';

import * as _ from 'lodash';
import * as moment from 'moment';

@Injectable()
export class ChartService {

    constructor(private chartApi: ChartApi, private accountApi: AccountApi, private authorService: AuthorizationService) {

    }

    isGenernal() {
        const token = this.authorService.getSession();
        if (token && token.currentAccount) {
            return token.currentAccount.companyProperty === CompanyModel.CompanyTypeEnum.GeneralTaxpayer;
        }
        return false;
    }

    /**
     * 获取一版纳税人城建税报表信息
     * @param type 月份,季度
     */
    getGenernalBuildingTax(year, month): Promise<BuildingTaxModel> {
        return new Promise((resolve, reject) => {
            this.chartApi.chartBuildingTax_1(year, month).subscribe(
                data => {
                    const temp: MbuildingModel = data;
                    resolve(temp);
                }, error => {
                    reject(error);
                }
            );
        });
    }

    /**
     * 获取城建税报表信息
     * @param type 月份,季度
     */
    getBuildingTax(type): Promise<BuildingTaxModel> {
        return new Promise((resolve, reject) => {
            this.chartApi.chartBuildingTax(type).subscribe(
                data => {
                    const temp: MbuildingModel = data;
                    // if (temp.itemModels) {
                    //     for (let i = 0; i < temp.itemModels.length; i++) {
                    //         let item = temp.itemModels[i];
                    //         if (!temp.sumAmountOfDuePaid) {
                    //             temp.sumAmountOfDuePaid = 0;
                    //         }
                    //         if (!temp.sumBusinessTax) {
                    //             temp.sumBusinessTax = 0;
                    //         }
                    //         if (!temp.sumCoumptionTax) {
                    //             temp.sumCoumptionTax = 0;
                    //         }
                    //         if (!temp.sumDutiableTax) {
                    //             temp.sumDutiableTax = 0;
                    //         }
                    //         if (!temp.sumExpessVAT) {
                    //             temp.sumExpessVAT = 0;
                    //         }
                    //         if (!temp.sumGeneralVAT) {
                    //             temp.sumGeneralVAT = 0;
                    //         }
                    //         if (!temp.sumReductionCode) {
                    //             temp.sumReductionCode = 0;
                    //         }
                    //         if (!temp.sumIncomeRelief) {
                    //             temp.sumIncomeRelief = 0;
                    //         }
                    //         if (!temp.sumPaidTax) {
                    //             temp.sumPaidTax = 0;
                    //         }
                    //         if (!temp.sumSum) {
                    //             temp.sumSum = 0;
                    //         }
                    //         if (!temp.sumTaxRate) {
                    //             temp.sumTaxRate = 0;
                    //         }
                    //         temp.sumAmountOfDuePaid += item.amountOfDuePaid;
                    //         temp.sumBusinessTax += item.businessTax;
                    //         temp.sumCoumptionTax += item.coumptionTax;
                    //         temp.sumDutiableTax += item.dutiableTax;
                    //         temp.sumExpessVAT += item.expessVAT;
                    //         temp.sumGeneralVAT += item.generalVAT;
                    //         temp.sumReductionCode += item.reductionCode;
                    //         temp.sumIncomeRelief += item.incomeRelief;
                    //         temp.sumPaidTax += item.paidTax;
                    //         temp.sumSum += item.sum;
                    //         temp.sumTaxRate += item.taxRate;
                    //     }
                    // }
                    resolve(temp);
                }, error => {
                    reject(error);
                }
            );
        });
    }

    // 增值税报表数据
    getVat(type): Promise<VATModel> {
        return new Promise((resolve, reject) => {
            this.chartApi.chartValueAddedTax(type).toPromise().then(
                data => {

                    resolve(data);
                },
                error => {
                    reject(error);
                    console.error(error);
                }
            );
        });
    }
    // 固定资产报表数据
    getFixedAssetReport(year, month): Promise<VATModel> {
        return new Promise((resolve, reject) => {
            this.chartApi.chartExcludingImmovableProperties(year, month).toPromise().then(
                data => {

                    resolve(data);
                },
                error => {
                    reject(error);
                    console.error(error);
                }
            );
        });
    }
    // 一般纳税人增值税报表数据
    getGeneraVat(year, month): Promise<VATModel[]> {
        return new Promise((resolve, reject) => {
            this.chartApi.chartGeneralValueAddedTax(year, month).toPromise().then(
                data => {
                    resolve(data);
                },
                error => {
                    reject(error);
                    console.error(error);
                }
            );
        });
    }
    // 增值税纳税申报表附列资料（一）》（本期销售情况明细）附件一
    getDetailsForCurrentSales(year, month): Promise<VATModel[]> {
        return new Promise((resolve, reject) => {
            this.chartApi.chartDetailsForCurrentSales(year, month).toPromise().then(
                data => {
                    resolve(data);
                },
                error => {
                    reject(error);
                    console.error(error);
                }
            );
        });
    }
    // 个税报表数据
    getIndividuaTax(model): Promise<VATModel[]> {
        return new Promise((resolve, reject) => {
            this.chartApi.chartPersonalTax(model.year, model.month).toPromise().then(
                data => {
                    resolve(data);
                },
                error => {
                    reject(error);
                    console.error(error);
                }
            );
        });
    }
    // 获取账期
    getAccountPeriod() {
        return new Promise((resolve, reject) => {
            this.accountApi.accountAccountPeriod().toPromise().then(
                accountPeriodModel => {
                    console.log('accountPeriodModel:' + JSON.stringify(accountPeriodModel));
                    resolve(accountPeriodModel);
                },
                error => {
                    reject(error);
                    console.error(error);
                }
            );
        });
    }

    /**
     * 增值税纳税申报表附列资料（二）
     */
    getVatPayment(year, month) {
        const projectNames = [
            { name: '（一）认证相符的增值税专用发票', fieldNo: '1=2+3', p48: false, p88: false },
            { name: '其中：本期认证相符且本期申报抵扣', fieldNo: '2', p48: true, p88: false },
            { name: '前期认证相符且本期申报抵扣', fieldNo: '3', p48: false, p88: true },
            { name: '（二）其他扣税凭证', fieldNo: '4=5+6+7+8a+8b', p48: false, p88: false },
            { name: '其中：海关进口增值税专用缴款书', fieldNo: '5', p48: true, p88: false },
            { name: '农产品收购发票或者销售发票', fieldNo: '6', p48: false, p88: true },
            { name: '代扣代缴税收缴款凭证', fieldNo: '7', p48: false, p88: true },
            { name: '加计扣除农产品进项税额', fieldNo: '8a', p48: false, p88: true },
            { name: '其他', fieldNo: '8b', p48: false, p88: true },
            { name: '（三）本期用于购建不动产的扣税凭证', fieldNo: '9', p48: false, p88: false },
            { name: '（四）本期不动产允许抵扣进项税额', fieldNo: '10', p48: false, p88: false },
            { name: '（五）外贸企业进项税额抵扣证明', fieldNo: '11', p48: false, p88: false },
            { name: '当期申报抵扣进项税额合计', fieldNo: '12=1+4-9+10+11', p48: false, p88: false },

            { name: '本期进项税额转出额', fieldNo: '13=14至23之和', p48: false, p88: false },
            { name: '其中：免税项目用', fieldNo: '14', p48: false, p88: false },
            { name: '集体福利、个人消费', fieldNo: '15', p48: true, p88: false },
            { name: '非正常损失', fieldNo: '16', p48: true, p88: false },
            { name: '简易计税方法征税项目用', fieldNo: '17', p48: true, p88: false },
            { name: '免抵退税办法不得抵扣的进项税额', fieldNo: '18', p48: true, p88: false },
            { name: '纳税检查调减进项税额', fieldNo: '19', p48: true, p88: false },
            { name: '红字专用发票信息表注明的进项税额', fieldNo: '20', p48: true, p88: false },
            { name: '上期留抵税额抵减欠税', fieldNo: '21', p48: true, p88: false },
            { name: '上期留抵税额退税', fieldNo: '22', p48: true, p88: false },
            { name: '其他应作进项税额转出的情形', fieldNo: '23', p48: true, p88: false },

            { name: '（一）认证相符的增值税专用发票', fieldNo: '24', p48: false, p88: false },
            { name: '期初已认证相符但未申报抵扣', fieldNo: '25', p48: true, p88: false },
            { name: '本期认证相符且本期未申报抵扣', fieldNo: '26', p48: true, p88: false },
            { name: '期初已认证相符但未申报抵扣', fieldNo: '27', p48: true, p88: false },
            { name: '其中：按照税法规定不允许抵扣', fieldNo: '28', p48: true, p88: false },
            { name: '（二）其他扣税凭证', fieldNo: '29=30至33之和', p48: false, p88: false },
            { name: '其中：海关进口增值税专用缴款书', fieldNo: '30', p48: true, p88: false },
            { name: '农产品收购发票或者销售发票', fieldNo: '31', p48: false, p88: true },
            { name: '代扣代缴税收缴款凭证', fieldNo: '32', p48: false, p88: true },
            { name: '其他', fieldNo: '33', p48: false, p88: true },
            { name: '', fieldNo: '34', p48: false, p88: false },

            { name: '本期认证相符的增值税专用发票', fieldNo: '35', p48: false, p88: false },
            { name: '代扣代缴税额', fieldNo: '36', p48: false, p88: false }
        ];
        return new Promise((resolve, reject) => {
            this.chartApi.chartDetailsForInputValueAddedTax(year, month).subscribe(
                data => {
                    // let startDate = moment(data.startTime) ? moment(data.startTime).format('YYYY-MM-DD') : '';
                    // let endDate = moment(data.endTime) ? moment(data.endTime).format('YYYY-MM-DD') : '';
                    const temp: any = _.cloneDeep(data);
                    // temp.startTime = startDate;
                    // temp.endTime = endDate;
                    temp.details.forEach((item, index) => {
                        const pro = projectNames[index];
                        item.projectName = pro.name;
                        item.fieldNo = pro.fieldNo;
                        item.p88 = pro.p88;
                        item.p48 = pro.p48;
                    });
                    console.log(temp);
                    resolve(temp);
                }, error => {

                });
        });
    }
    /**
     * 获取本期抵扣进项税额结构明细表
     *
     * @param {number} year
     * @param {number} month
     * @returns {Promise<DeductionOfInputTaxModel>}
     * @memberof ChartService
     */
    taxdeduction(year: number, month: number): Promise<any> {
        const names: Array<any> = [
            { name: '合计', indent: 0 },
            { name: '17%税率的进项', indent: 0 },
            { name: '其中：有形动产租赁的进项', indent: 1 },
            { name: '13%税率的进项', indent: 0 },
            { name: '11%税率的进项', indent: 0 },
            { name: '其中：运输服务的进项', indent: 1 },
            { name: '电信服务的进项', indent: 4 },
            { name: '建筑安装服务的进项', indent: 4 },
            { name: '不动产租赁服务的进项', indent: 4 },
            { name: '受让土地使用权的进项', indent: 4 },
            { name: '6%税率的进项', indent: 0 },
            { name: '其中：电信服务的进项', indent: 1 },
            { name: '金融保险服务的进项', indent: 4 },
            { name: '生活服务的进项', indent: 4 },
            { name: '取得无形资产的进项', indent: 4 },
            { name: '5%征收率的进项', indent: 0 },
            { name: '其中：不动产租赁服务的进项', indent: 1 },
            { name: '3%征收率的进项', indent: 0 },
            { name: '其中：货物及加工，修理修配劳务的进项', indent: 1 },
            { name: '运输服务的进项', indent: 4 },
            { name: '电信服务的进项', indent: 4 },
            { name: '建筑安装服务的进项', indent: 4 },
            { name: '金融保险服务的进项', indent: 4 },
            { name: '有形动产租赁服务的进项', indent: 4 },
            { name: '生活服务的进项', indent: 4 },
            { name: '取得无形资产的进项', indent: 4 },
            { name: '减按1.5%征收率的进项', indent: 1 },
            { name: '', indent: 0 },
            { name: '农产品核定扣除进项', indent: 0 },
            { name: '外贸企业进项税额抵扣证明注明的进项', indent: 0 },
            { name: '', indent: 0 },
            { name: '', indent: 0 },

        ];
        return new Promise((resolve, reject) => {
            this.chartApi.chartDeductionOfInputTax(year, month).subscribe(
                deductionOfInputTaxModel => {
                    const data: any = deductionOfInputTaxModel;
                    data.details.forEach((value, index) => {
                        data.details[index].categoryName = names[index].name;
                        data.details[index].indent = names[index].indent;
                    });
                    resolve(data);
                },
                error => {
                    console.error(error);
                    reject(error);
                }
            );
        });
    }
    /**
     * 修改一般纳税人报表金额
     * @param model
     */
    postVatGenerate(model) {
        return new Promise((resole, reject) => {
            this.chartApi.chartUpdateCahrt(model).subscribe(data => {
                resole(data);
            }, error => {
                reject(error);
            });
        });
    }
}

