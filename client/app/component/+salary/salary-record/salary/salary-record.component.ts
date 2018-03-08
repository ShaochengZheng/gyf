import { Router } from '@angular/router';
import { Component, OnInit, AfterViewInit } from '@angular/core';

import { SalaryService } from './../../shared/salary.service';

import * as _ from 'lodash';
import * as moment from 'moment';
@Component({
    selector: 'salary-record',
    templateUrl: 'salary-record.component.html',
    styleUrls: ['./salary-record.component.scss', './../../shared/salary.component.scss']
})

export class SalaryRecordComponent implements OnInit, AfterViewInit {

    salaryModel: any = {};
    defaultDate: any;
    noData: boolean = false;

    pTaxBalance: number;
    pFundBalance: number;
    pSocialBalance: number;
    salaryBalance: number;
    constructor(private salaryService: SalaryService, private router: Router) {

    }

    ngOnInit() {
        this.salaryService.getAccountPeriod().then(data => {
            this.searchSalaryList(data.currentYear, data.currentMonth);
            this.defaultDate = moment().set({ 'year': data.currentYear, 'month': data.currentMonth - 1 }).format('YYYY-MM');
        });
    }

    ngAfterViewInit() {

    }

    searchSalaryList(year, month) {
        this.salaryService.getSalaryList(year, month, 'Y')
            .then(data => {
                this.noData = false;
                this.salaryModel = _.cloneDeep(data);
                if (this.salaryModel.status === 'N') {
                    this.salaryModel.employeePayrolls = [];
                }
                if (!this.salaryModel.employeePayrolls || this.salaryModel.employeePayrolls.length < 1) {
                    this.noData = true;
                }
                this.salaryBalance = Math.abs(Number(data.sumPSalary) - Number(data.wages));
                this.pSocialBalance = Math.abs(Number(data.sumPSocialSecurity) + Number(data.sumCSocialSecurity)
                    - Number(data.socialSecurity));
                this.pFundBalance = Math.abs(Number(data.sumPProvidenetFund) + Number(data.sumCProvidentFund)
                    - Number(data.accumulationFund));
                this.pTaxBalance = Math.abs(Number(data.sumPTax) - Number(data.incomeTax));
                console.log('salaryModel=>', JSON.stringify(this.salaryModel));
            }).catch(err => {
                this.noData = true;
                console.log('err=>', JSON.stringify(err));
            });
    }
    /**
     * 日期选择事件
     * @param e 日期
     */
    selected(e) {
        console.log(e);
        let dYM = this.salaryService.getYearMonth(e);
        this.searchSalaryList(dYM.split('-')[0], dYM.split('-')[1]);
    }
}
