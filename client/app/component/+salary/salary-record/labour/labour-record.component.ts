import { Component, OnInit } from '@angular/core';

import { SalaryService } from './../../shared/salary.service';
import { ShareService } from './../../../../service/core/share';

import * as _ from 'lodash';
import * as moment from 'moment';
@Component({
    selector: 'labour-record',
    templateUrl: 'labour-record.component.html',
    styleUrls: ['./labour-record.component.scss', './../../shared/salary.component.scss'],
})

export class LabourRecordComponent implements OnInit {

    // region start 纵向求和变量
    sumLaborCost: number = 0;
    sumPTax: number = 0;
    sumRealLaborCost: number = 0;
    // region end 纵向求和变量

    bankLabour: number = 50000;
    labourBalance: number = 0;
    labourModel: any = {};

    currentYearMonth: any;
    noData: boolean = false;
    defaultDate: any;
    wageBalance: number;
    constructor(private salaryService: SalaryService, private shareService: ShareService) {

    }

    ngOnInit() {
        this.salaryService.getAccountPeriod().then(data => {
            this.defaultDate = moment().set({ 'year': data.currentYear, 'month': data.currentMonth - 1 }).format('YYYY-MM');
            this.searchLabourList(data.currentYear, data.currentMonth);
        });
    }

    /**
     * 获取劳务表记录
     * @param year 年
     * @param month 月
     */
    searchLabourList(year, month) {
        this.salaryService.getSalaryList(year, month, 'N')
            .then(data => {
                this.noData = false;
                this.labourModel = _.cloneDeep(data);
                if (this.labourModel.status === 'N') {
                    this.labourModel.employeePayrolls = [];
                }
                if (!this.labourModel.employeePayrolls || this.labourModel.employeePayrolls.length < 1) {
                    this.noData = true;
                }
                this.wageBalance = Math.abs(data.sumRealLaborCost - data.wages);
                console.log(this.labourModel);
            }).catch(err => {
                this.noData = true;
                console.log(err);
            });
    }
    /**
     * 日期选择事件
     * @param e 日期
     */
    selected(e) {
        console.log(e);
        let dYM = this.salaryService.getYearMonth(e);
        this.searchLabourList(dYM.split('-')[0], dYM.split('-')[1]);
    }
}
