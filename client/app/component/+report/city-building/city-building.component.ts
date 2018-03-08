import { AccountApi } from './../../../api/accounting/api/AccountApi';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ChartService } from './../shared/chart.service';
import { MbuildingModel } from './../shared/mbuilding.model';

import * as _ from 'lodash';

@Component({
  selector: 'app-city-building',
  templateUrl: './city-building.component.html',
  styleUrls: ['./city-building.component.scss', '../sharedStyle.component.scss'],
  providers: [ChartService]
})
export class CityBuildingComponent implements OnInit, AfterViewInit {


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

  cityModel: MbuildingModel = {
    itemModels: []
  };
  constructor(private chartService: ChartService, private accountApi: AccountApi) {

  }



  ngOnInit() {
    console.log('BalanceSheetComponent');
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
          this.search('Month');
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

  ngAfterViewInit() {

  }

  // 搜索
  search(type) {
    if (this.chartService.isGenernal()) {
      this.searchGenernal();
    } else {
      this.searchSmall(type);
    }
  }

  // 一般纳税人
  searchGenernal() {

    this.chartService.getGenernalBuildingTax(this.searchObject.year, this.searchObject.month)
      .then(data => {
        // data.itemModels
        console.log(data);
        this.cityModel = _.cloneDeep(data);
      })
      .catch(error => {
        console.log(error);
      });
  }
  // 小规模
  searchSmall(type) {
    this.chartService.getBuildingTax(type)
      .then(data => {
        // data.itemModels
        console.log(data);
        this.cityModel = _.cloneDeep(data);
      })
      .catch(error => {
        console.log(error);
      });
  }

  // 月份搜索
  monthSearch(item, index) {
    this.isChecked = index;
     this.searchObject.month = item.number;
    this.search('Month');
    console.log('月份搜索！！！');
  }
}
