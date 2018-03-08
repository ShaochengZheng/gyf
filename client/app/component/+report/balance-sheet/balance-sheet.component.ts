import { Component, OnInit } from '@angular/core';

import { ChartApi } from '../../../api/accounting/api/ChartApi';
import { AccountApi } from '../../../api/accounting/api/AccountApi';

import * as _ from 'lodash';

@Component({
	selector: 'balance-sheet',
	templateUrl: './balance-sheet.component.html',
	styleUrls: ['./balance-sheet.component.scss', '../sharedStyle.component.scss'],
	providers: [ChartApi, AccountApi],
})
export class BalanceSheetComponent implements OnInit {

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
	]
	isChecked: any; // 点击月份样式效果
	dataList: any = {};
	taxDate: any = ''; // 税款所属期
	// 搜索条件
	searchObject: any = {
		year: '',
		month: 0,
	};
	searchModel = _.cloneDeep(this.searchObject);
	balance1 = 0;
	balance2 = 0;
	constructor(private chartApi: ChartApi, private accountApi: AccountApi) { }

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
		console.log('资产负债表search!!!!');
		this.chartApi.chartAssets(this.searchModel.year, this.searchModel.month)
			.subscribe(
			assetsChartModel => {
				this.dataList = assetsChartModel;
				let leftOpeningBalance = 0;
				let leftEndingBalance = 0;
				let reftOpeningBalance = 0;
				let rightEndingBalance = 0;
				for (let i = 0; i < this.dataList.details.length; i++) {
					if (this.dataList.details[i].left.number === 30) {
						leftOpeningBalance = this.dataList.details[i].left.openingBalance;
						leftEndingBalance = this.dataList.details[i].left.endingBalance;
						console.log(leftOpeningBalance);
						console.log(leftEndingBalance);
					};
					if (this.dataList.details[i].right.number === 53) {
						reftOpeningBalance = this.dataList.details[i].right.openingBalance;
						rightEndingBalance = this.dataList.details[i].right.endingBalance;
						console.log(reftOpeningBalance);
						console.log(rightEndingBalance);
					}
					this.balance1 = leftOpeningBalance - reftOpeningBalance;
					this.balance2 = leftEndingBalance - rightEndingBalance;
				}
				let day = new Date(this.dataList.year, this.dataList.month, 0);
				this.taxDate = this.dataList.year + '-' + this.dataList.month + '-' + day.getDate();
				console.log('列表搜索===》》》', assetsChartModel);
			},
			error => {
				console.log(error);
			}
			);
	}

	// 月份搜索
	monthSearch(item, index) {
		console.log('monthSearch', item, index);
		this.isChecked = index;
		this.searchModel.month = item.number;
		this.search();
		console.log('月份搜索！！！');
	}

}
