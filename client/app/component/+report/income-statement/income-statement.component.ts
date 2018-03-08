import { Component, OnInit } from '@angular/core';

import { ChartApi } from '../../../api/accounting/api/ChartApi';
import { AccountApi } from '../../../api/accounting/api/AccountApi';

import * as _ from 'lodash';


@Component({
	selector: 'income-statement',
	templateUrl: './income-statement.component.html',
	styleUrls: ['./income-statement.component.scss', '../sharedStyle.component.scss'],
	providers: [ChartApi, AccountApi],
})
export class IncomeStatementComponent implements OnInit {

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
	dataList: any = {};
	taxDate: any = ''; // 税款所属期
	// 搜索条件
	searchObject: any = {
		year: '',
		month: 0,
	};
	searchModel = _.cloneDeep(this.searchObject);

	constructor(private chartApi: ChartApi, private accountApi: AccountApi) {
	}

	ngOnInit() {
		console.log('IncomeStatementComponent');
		this.getAccountPeriod();
	}

	// 获取返回账期
	getAccountPeriod() {
		this.accountApi.accountAccountPeriod()
			.subscribe(
			accountPeriodModel => {
				console.log('返回账期======>>>>', JSON.stringify(accountPeriodModel));
				if (accountPeriodModel) {
					this.searchModel.year = accountPeriodModel.currentYear;
					this.searchModel.month = accountPeriodModel.currentMonth;
					this.search();
					let tempList = accountPeriodModel.accountHistoryPeriods[0].months;
					if (tempList && tempList.length > 0) {
						_.forEach(tempList, item => {
							let index = this.monthList.findIndex((value) => value.number === item);
							this.monthList[index].isExist = true;
						});
						if (this.searchModel.month > 0) {
							let initIndex = this.monthList.findIndex((value) => value.number === this.searchModel.month);
							this.isChecked = initIndex;
						}
					}
				} else {
					console.log('该年没有往来明细报表');
				}
			},
			(error) => {
				;
				console.log(error);
			});
	}

	// 搜索
	search() {
		console.log('利润表search!!!!');
		this.chartApi.chartProfit(this.searchModel.year, this.searchModel.month)
			.subscribe(
			cashProfitChartModel => {
				this.dataList = cashProfitChartModel;
				_.forEach(this.dataList.details, item => {
					if (item.number === 5 || item.number === 6 || item.number === 7 || item.number === 8
						|| item.number === 9 || item.number === 10 || item.number === 13
						|| item.number === 16 || item.number === 17 || item.number === 26 || item.number === 27
						|| item.number === 28 || item.number === 29) {
						item.paddingLeft = true;
					}
					if (item.number === 1 || item.number === 21 || item.number === 30 || item.number === 32) {
						item.weight = true;
					}
				});
				// let lastDate = moment().set({ 'year': this.dataList.year, 'month': this.dataList.month });
				// this.taxDate = moment(lastDate).date(lastDate.daysInMonth()).format('YYYY-MM-DD');
				console.log('列表搜索===》》》', cashProfitChartModel);
			},
			error => {
				console.log(error);
			}
			);
	}

	// 月份搜索
	monthSearch(item, index) {
		this.isChecked = index;
		this.searchModel.month = item.number;
		this.search();
		console.log('月份搜索！！！');
	}

}
