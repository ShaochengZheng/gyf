import { UtilityService } from './../../../service/core/utility';
import { AccountPeriodModel } from './../../../api/accounting/model/AccountPeriodModel';
import { AccountApi } from './../../../api/accounting/api/AccountApi';
import { SalaryModel, LabourModel } from './salary.model';
import { PayrollApi } from './../../../api/accounting/api/PayrollApi';
import { EmployeeApi } from './../../../api/accounting/api/EmployeeApi';
import { Injectable, NgZone } from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import { STORAGE_KEY } from './constant';


/**
 *
 * 薪资模块 API service
 * @author Scleo
 */

@Injectable()
export class SalaryService {

    accountPeroid: AccountPeriodModel;

    constructor(private employeeApi: EmployeeApi, private payrollApi: PayrollApi, private zone: NgZone,
        private accountApi: AccountApi, private utilService: UtilityService) {
        this.getAccountPeriod()
            .then(
            data => {
                this.accountPeroid = data;
            }).catch(err => {

            });
    }
    /**
     * 创建员工
     * @param model 员工model
     */
    createEmployee(model) {
        return this.employeeApi.employeeCreate(model).toPromise();
    }
    /**
     * 获取员工列表
     * @param searchModel 查询model
     */
    getAllEmployee(searchModel: any) {
        return this.employeeApi.employeeSearch(searchModel.pageIndex, searchModel.pageSize).toPromise();
    }
    /**
     * 删除员工
     * @param id 员工Id
     */
    deleteEmployee(id) {
        return this.employeeApi.employeeDelete(id).toPromise();
    }

    /**
     * 获取单个员工
     * @param id 员工ID
     */
    getEmployeeById(id) {
        return new Promise((resolve, reject) => {
            this.employeeApi.employeeGet(id).subscribe(data => {
                if (data.birthDate === null || data.birthDate === undefined) {
                    data.birthDate = new Date();
                }
                resolve(data);
            }, error => {
                reject(error);
            });
        });
    }
    /**
     * 编辑员工信息
     * @param model
     */
    editEmployeeById(model) {
        return new Promise((resolve, reject) => {
            this.employeeApi.employeeUpdate(model).subscribe(data => {
                // if (data.birthDate === null || data.birthDate === undefined) {
                //     data.birthDate = new Date();
                // }
                resolve(data);
            }, error => {
                reject(error);
            });
        });
    }
    /**
     * 获取工资表需要导入的员工／
     */
    getImportStuffForSalary(year, month, contactType): Promise<Array<any>> {
        return new Promise((resolve, reject) => {
            this.payrollApi.payrollImport(year, month, contactType).subscribe(
                data => {
                    const templist: Array<any> = _.cloneDeep(data);
                    templist.forEach(e => {
                        e.selected = false;
                    });
                    resolve(templist);
                }, error => {
                    reject(error);
                }
            );
        });
    }
    /**
     * 获取工资／劳务表
     * @param year
     * @param month 月
     * @param contactType Y 工资表 N 劳务表
     */
    getSalaryList(year, month, contactType): any {
        return new Promise((resovle, reject) => {
            this.payrollApi.payrollGet(year, month, contactType).subscribe(data => {
                let tempModel: any = _.cloneDeep(data);
                // tempModel.loc
                if (contactType === 'Y') {
                    tempModel = this.caculateSalarySum(tempModel);
                } else {
                    tempModel = this.calculateLabourSum(tempModel);
                }
                resovle(tempModel);
            }, err => {
                reject(err);
            });
        });
        // return this.payrollApi.payrollGet(year, month, contactType).toPromise();
    }

    /**
     * 生成工资单
     * @param model 工资单
     * @param flag
     */
    generateSalary(model, flag) {
        return this.payrollApi.payrollGenerate(model, flag).toPromise();
    }
    /**
     * 生成劳务表
     * @param model 劳务model
     * @param flag
     */
    generateLabour(model, flag) {
        return this.payrollApi.payrollGenerateLabor(model, flag).toPromise();
    }
    /**
     *  获得当前会计区间
     */
    getAccountPeriod() {
        return this.accountApi.accountAccountPeriod().toPromise();
    }
    /**
     * 反算含税劳务费
     * @param amount 不含税劳务费
     */
    cacuWithTaxLabor(amount): number {
        console.log('instanceof=>', amount instanceof Number);
        let labor = amount;
        console.log('labor', labor);
        if (labor <= 0) {
            return 0;
        }
        // 此处公式 开始
        if (labor <= 800) {//
            return labor;
        } else if (labor <= 3360) {
            labor = (labor / 0.8) - 200;
        } else if (labor > 3360 && labor <= 21000) {
            labor = labor / 0.84;
        } else if (labor > 21000 && labor <= 49500) {
            labor = (labor - 2000) / 0.76;
        } else if (labor > 49500) {
            labor = (labor - 7000) / 0.68;
        }
        console.log('calculate labor=>', labor);
        return parseFloat(labor.toFixed(2));
    }
    /**
     * 计算劳务个人所得税
     * @param amount 含税额
     */
    calculateIncludePTax(amount) {
        if (!amount) {
            return 0;
        }
        const deduct = this.caculateCostDeduct(amount);
        const caculateAmount = this.caculateTaxable(amount, deduct);
        let percentTax = 0;
        if (caculateAmount >= 20000 && caculateAmount < 50000) {
            percentTax = (caculateAmount * 0.2) + (caculateAmount - 20000) * 0.2 * 0.5;
        } else if (caculateAmount >= 50000) {
            percentTax = (caculateAmount * 0.2) + (30000 * 0.2 * 0.5) + (caculateAmount - 50000) * 0.2;
        } else {
            percentTax = caculateAmount * 0.2;
        }
        return parseFloat(percentTax.toFixed(2));
    }
    /**
     * 计算费用扣除数
     * @param amount 含税额
     */
    caculateCostDeduct(amount): number {
        amount = Number(amount);
        if (isNaN(amount) || amount < 4000) {
            return 800;
        }
        return amount * 0.2;
    }

    /**
     * 计算应纳税所得额
     * @param amount 含税额
     * @param costDed 费用扣除数
     */
    caculateTaxable(amount, costDed): number {
        if (amount < 800) {
            return 0;
        }
        return Number(amount) - Number(costDed);
    }

    /**
     * 计算劳务个人所得税
     * @param amount 不含税额
     */
    calculatePTax(amount): number {
        if (!amount) {
            return undefined;
        }
        let ptax = 0;
        const deductTax = this.calculateDeductTax(amount);
        const taxSalary = amount - deductTax;
        if (taxSalary <= 0) {
            return undefined;
        }
        if (taxSalary <= 800) {//  扣除数0
            return ptax;
        } else if (taxSalary > 800 && taxSalary <= 20000) {// [800~20000)区间税率 20%
            ptax = taxSalary * 0.2;
        } else if (taxSalary > 20000 && taxSalary <= 50000) {// [20000-50000)区间税率 30%  扣除2000
            ptax = (taxSalary * 0.3) - 2000;
        } else if (taxSalary > 50000) {  // [50000-)区间税率 40%  扣除7000
            ptax = (taxSalary * 0.4) - 7000;
        }
        console.log('getTax =>', ptax);
        return ptax;
    }

    /**
     * 计算可抵扣税
     * @param taxAmount 含税额
     */
    calculateDeductTax(taxAmount) {
        const tAmount = Number(taxAmount);
        if (tAmount <= 800) { return 0; }
        if (tAmount > 800 && tAmount <= 4000) { return 800; }
        return tAmount * 0.2;
    }


    /**
     * 计算合计工资
     * @param item 员工工资信息
     */
    getTotalSalary(item): number {
        if (!item) { return 0; }
        return Number(item.baseSalary) +
            Number(item.positionSalary) +
            Number(item.mealAllowance) +
            Number(item.travelAllowance) +
            Number(item.otherAllowance) +
            Number(item.bonus) +
            Number(item.meritPay) +
            Number(item.adjustWages);
    }

    /**
     * 计算工资个人所得税
     * @param item 员工工资信息
     */
    getPTax(item): number {
        if (!item) { return undefined; }
        let ptax = 0;
        let base = 3500;
        if (item.national && item.national.id !== 'CN') {
            base = 4800;
        }
        const taxSalary =
            Number(item.totalSalary) -
            Number(item.pEdicalCare) -
            Number(item.pPension) -
            Number(item.pUnemployment) -
            Number(item.pProvidentFund) - base;

        if (taxSalary <= 0) { return 0; }
        if (taxSalary <= 1500) {// 不超过1500 部分税率 3% 扣除数0
            ptax = (taxSalary * 0.03);
        } else if (taxSalary > 1500 && taxSalary <= 4500) {// [1500~4500) 部分税率 10% 扣除数105
            ptax = (taxSalary * 0.1) - 105;
        } else if (taxSalary > 4500 && taxSalary <= 9000) {// [4500-9000) 部分税率 20% 扣除数555
            ptax = (taxSalary * 0.2) - 555;
        } else if (taxSalary > 9000 && taxSalary <= 35000) {// [9000-35000) 部分税率 25% 1055
            ptax = (taxSalary * 0.25) - 1005;
        } else if (taxSalary > 35000 && taxSalary <= 55000) {// [35000-55000) 部分税率 30% 2755
            ptax = (taxSalary * 0.30) - 2755;
        } else if (taxSalary > 55000 && taxSalary <= 80000) {// [55000-80000) 部分税率 35% 5505
            ptax = (taxSalary * 0.35) - 5505;
        } else if (taxSalary > 80000) {// [80000-) 部分税率 45% 13505
            ptax = (taxSalary * 0.45) - 13505;
        }
        return ptax;
    }
    /**
     * 计算工资个人实际得到工资
     * @param item 员工工资信息
     */
    getActualSalary(item): number {
        if (!item) { return 0; }
        const temp = Number(item.totalSalary) -
            Number(item.pEdicalCare) -
            Number(item.pPension) -
            Number(item.pUnemployment) -
            Number(item.pProvidentFund) -
            Number(item.incomeTax);
        if (temp < 0) {
            return 0;
        }
        return temp;
    }
    /**
     * 计算工资人力成本
     * @param item 员工工资信息
     */
    getHumanCost(item): number {
        if (!item) { return 0; }
        return Number(item.totalSalary) +
            Number(item.cEdicalCare) +
            Number(item.cPension) +
            Number(item.cUnemployment) +
            Number(item.cFertility) +
            Number(item.cWorkInjury) +
            Number(item.cProvidentFund);
    }

    /**
     * 求纵向和
     */
    calculateLabourSum(model: LabourModel) {
        if (!model) { return; }

        const temp = _.cloneDeep(model);
        this.clearLaourSum(temp);
        const tempList = [];
        const tempSalarys = _.cloneDeep(temp.employeePayrolls);
        for (let i = 0; i < tempSalarys.length; i++) {
            const item = tempSalarys[i];
            temp.sumLaborCost += Number(item.totalSalary);
            temp.sumPTax += Number(item.incomeTax);
            temp.sumRealLaborCost += Number(item.nettSalary);
            // 求纵向和 region end
            tempList.push(item);
        }
        temp.employeePayrolls = tempList;
        return temp;
    }
    /**
     * 清空劳务总和
     */
    clearLaourSum(model: LabourModel) {
        if (!model) { return; }
        model.sumLaborCost = 0;
        model.sumPTax = 0;
        model.sumRealLaborCost = 0;
        return model;
    }

    /**
     * 求和计算
     * @param model 工资单model
     */
    caculateSalarySum(model: SalaryModel): SalaryModel {
        const self = this;
        const tempModel = _.cloneDeep(model);
        self.resetSalarySum(tempModel);
        const tempList = [];
        const tempSalarys = _.cloneDeep(tempModel.employeePayrolls);
        for (let i = 0; i < tempSalarys.length; i++) {
            const item = tempSalarys[i];
            item.totalSalary = self.getTotalSalary(item);
            item.incomeTax = self.getPTax(item);
            item.nettSalary = self.getActualSalary(item);
            item.laborCost = self.getHumanCost(item);
            // 求纵向和 region start
            tempModel.sumBasicSalary += Number(item.baseSalary);
            tempModel.sumPosiSalary += Number(item.positionSalary);
            tempModel.sumFoodSubsidy += Number(item.mealAllowance);
            tempModel.sumTransSubsidy += Number(item.travelAllowance);
            tempModel.sumOtherSubsidy += Number(item.otherAllowance);
            tempModel.sumBonus += Number(item.bonus);
            tempModel.sumPerformance += Number(item.meritPay);
            tempModel.sumChangeSalary += Number(item.adjustWages);
            tempModel.sumTotalSalary += Number(item.totalSalary);
            // 个人社保
            // tempModel.sumPSocialSecurity += Number(item.pSocialSecurity);
            tempModel.sumPMedical += Number(item.pEdicalCare);
            tempModel.sumPOldage += Number(item.pPension);
            tempModel.sumPUnemployment += Number(item.pUnemployment);

            tempModel.sumPProvidenetFund += Number(item.pProvidentFund);
            tempModel.sumPTax += Number(item.incomeTax);
            tempModel.sumPSalary += Number(item.nettSalary);
            // 公司社保
            // tempModel.sumCSocialSecurity += Number(item.cSocialSecurity);
            tempModel.sumCMedical += Number(item.cEdicalCare);
            tempModel.sumCOldage += Number(item.cPension);
            tempModel.sumCUnemployment += Number(item.cUnemployment);
            tempModel.sumCMaternity += Number(item.cFertility);
            tempModel.sumCWorkInjury += Number(item.cWorkInjury);

            tempModel.sumCProvidentFund += Number(item.cProvidentFund);
            tempModel.sumHumanCost += Number(item.laborCost);
            // 求纵向和 region end
            tempList.push(item);
        }
        tempModel.employeePayrolls = tempList;
        return tempModel;
    }
    /**
     * 重置model
     */
    resetSalarySum(model: SalaryModel) {
        model.sumBasicSalary = 0;
        model.sumPosiSalary = 0;
        model.sumFoodSubsidy = 0;
        model.sumTransSubsidy = 0;
        model.sumOtherSubsidy = 0;
        model.sumBonus = 0;
        model.sumPerformance = 0;
        model.sumChangeSalary = 0;
        model.sumTotalSalary = 0;
        // 个人社保
        model.sumPMedical = 0;
        model.sumPOldage = 0;
        model.sumPUnemployment = 0;
        model.sumPProvidenetFund = 0;
        model.sumPTax = 0;
        model.sumPSalary = 0;
        // 公司社保
        model.sumCMedical = 0;
        model.sumCOldage = 0;
        model.sumCUnemployment = 0;
        model.sumCMaternity = 0;
        model.sumCWorkInjury = 0;

        model.sumCProvidentFund = 0;
        model.sumHumanCost = 0;
        return model;
    }

    /**
     * 默认当前月减1
     */
    getDefautYM() {
        let year = moment(new Date()).year();
        let mon = moment(new Date()).month();
        console.log(mon);
        // 默认显示当前月减1
        if (mon === 0) {
            year = year - 1;
            mon = 12;
        }
        return year + '-' + mon;
    }

    /**
     * 获取默认年
     */
    getDefaultYear() {
        let year = moment(new Date()).year();
        const mon = moment(new Date()).month();
        // 默认显示当前月减1
        if (mon === 0) {
            year = year - 1;
        }
        return year;
    }

    /**
     * 获取默认月
     */
    getDefaultMonth() {
        return moment(new Date()).month();
    }

    /**
     * 格式化日期
     * @param e 日期
     * @param format 格式
     */
    getYearMonth(e) {
        if (!e) { return; }
        const year = moment(e).year();
        const month = moment(e).month();
        console.log('getYearMonth', year, month);
        return moment().set({ 'year': year, 'month': month }).format('YYYY-MM');
    }

    /**
     *
     * @param year 会计年
     * @param month 会计月
     * @param date 选择日期
     */
    disableGentate(year, month, date) {
        const peroidDate = moment().set({ 'year': year, 'month': month }).format('YYYY-MM');
        const selDate = this.getYearMonth(date);
        return peroidDate === selDate;
    }
    /**
     * 缓存员工
     */
    cacheStuff(stuff: any) {
        let temp = [stuff];
        console.log('cacheStuff', temp);
        if (localStorage.getItem(STORAGE_KEY.STUFF)) {
            const cache = JSON.parse(localStorage.getItem(STORAGE_KEY.STUFF));
            temp = this.duplingCheck(temp, cache);
        }
        localStorage.setItem(STORAGE_KEY.STUFF, JSON.stringify(temp));
    }

    /**
     * 缓存未导入的员工
     */
    cacheImport(data) {
        localStorage.setItem(STORAGE_KEY.STUFF_IMPORT, JSON.stringify(data));
    }

    /**
     * 获取缓存的员工
     */
    getCacheStuff(key): Array<any> {
        console.log('getCacheStuff', localStorage.getItem(key));
        return localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : undefined;
    }
    /**
     * 清空员工缓存
     */
    clearCache() {
        localStorage.removeItem(STORAGE_KEY.STUFF);
        localStorage.removeItem(STORAGE_KEY.STUFF_IMPORT);
    }
    /**
     * 去重数组
     * @param target1 查重数据
     * @param target2
     */
    duplingCheck(target1: Array<any>, target2: Array<any>) {
        if (!target1) { target1 = []; }// 避免异常
        if (!target2) { target2 = []; }
        let dup = target2.concat(target1);
        const unique = {};
        dup.forEach(function (item) {
            if (item && item.employeeId) {
                unique[item.employeeId] = item;
            }
        });
        console.log('unique->', unique);
        console.log('object->', Object.keys(unique));
        dup = Object.values(unique).map((u) => {
            return u;
        });
        console.log(JSON.stringify(dup));
        return dup;
    }

    /**
     * 全选
     * @param checked 选中状态
     * @param target 目标集合
     */
    selectAll(checked, target): Array<any> {
        if (!target) { return; }
        const templist = target;
        templist.forEach(e => {
            e.selected = checked;
        });
        return templist;
    }

    /**
     * 单选
     * @param target 目标集合
     * @param i 角标
     */
    selectOne(target, i) {
        if (!target) { return; }
        const templist = target;
        templist[i].selected = !templist[i].selected;
        return templist;
    }
}
