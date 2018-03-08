import { Component, OnInit } from '@angular/core';
import { ChartService } from './../shared/chart.service';
import { AccountApi } from './../../../api/accounting/api/AccountApi';
import { GeneralChartSettingModel } from './../../../api/accounting/model/GeneralChartSettingModel';

import * as _ from 'lodash';

@Component({
  selector: 'app-vat-payment',
  templateUrl: './vat-payment.component.html',
  styleUrls: ['./vat-payment.component.scss', '../sharedStyle.component.scss']
})
/**
 * 增值税纳税申报表附列资料（二）
 * @Scleo
 */
export class VatPaymentComponent implements OnInit {

  monthList = [
    { month: '1月', number: 1, isExist: false },
    { month: '2月', number: 2, isExist: false },
    { month: '3月', number: 3, isExist: false },
    { month: '4月', number: 4, isExist: false },
    { month: '5月', number: 5, isExist: false },
    { month: '6月', number: 6, isExist: false },
    { month: '7月', number: 7, isExist: false },
    { month: '8月', number: 8, isExist: false },
    { month: '9月', number: 9, isExist: false },
    { month: '10月', number: 10, isExist: false },
    { month: '11月', number: 11, isExist: false },
    { month: '12月', number: 12, isExist: false }
  ];
  isChecked: any; // 点击月份样式效果
  // 搜索条件
  searchObject: any = {
    year: new Date().getFullYear(),
    month: 0,
  };

  vatPayment: any;
  constructor(private chartService: ChartService, private accountApi: AccountApi) { }

  ngOnInit() {
    this.getAccountPeriod();
  }

  // 获取返回账期
  getAccountPeriod() {
    this.accountApi.accountAccountPeriod()
      .subscribe(
      accountPeriodModel => {
        console.log('返回账期======>>>>', JSON.stringify(accountPeriodModel));
        if (accountPeriodModel) {
          this.searchObject.year = accountPeriodModel.currentYear;
          this.searchObject.month = accountPeriodModel.currentMonth;
          this.search();
          accountPeriodModel.accountHistoryPeriods.forEach((AccountHistoryPeriodModel, index) => {
            if (Number(this.searchObject.year) === Number(AccountHistoryPeriodModel.year)) {
              const tempList = AccountHistoryPeriodModel.months;
              if (tempList && tempList.length > 0) {
                tempList.forEach(item => {
                  const ind = this.monthList.findIndex((value) => value.number === item);
                  this.monthList[ind].isExist = true;
                });
                if (this.searchObject.month > 0) {
                  const initIndex = this.monthList.findIndex((value) => value.number === this.searchObject.month);
                  this.isChecked = initIndex;
                }
              }
            }
          });
        } else {
          console.log('');
        }
      },
      (error) => {
        console.log(error);
      });
  }
  /**
   * 金额焦点失去
   */
  amountBlur(index) {
    console.log('amountBlur', index);
    const item = this.vatPayment.details[index];
    if (item) {
      this.updateChart(item);
    }
  }
  /**
   * 更新表数据
   * @param item
   */
  updateChart(item) {
    console.log('updateChart', item);
    // 准备model
    const model: GeneralChartSettingModel = {
      chartName: GeneralChartSettingModel.ChartNameEnum.DetailsForInputValueAddedTax,
      order: item.order,
      value: item.taxAccount,
      accountPeriodYear: this.searchObject.year,
      accountPeriodMonth: this.searchObject.month
    };
    this.chartService.postVatGenerate(model).then(data => {
      console.log(data);
      // 更新成功，刷新数据
      if (data) {
        this.search();
      }
    }).catch(error => {
      console.log(error);
    });
  }

  // 月份搜索
  monthSearch(item, index) {
    this.isChecked = index;
    this.searchObject.month = item.number;
    this.search();
    console.log('月份搜索！！！');
  }

  search() {
    this.chartService.getVatPayment(this.searchObject.year, this.searchObject.month)
      .then(data => {
        this.vatPayment = _.cloneDeep(data);
      })
      .catch(error => {

      });
  }
}
