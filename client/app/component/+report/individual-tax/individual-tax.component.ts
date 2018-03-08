import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';

import { ChartService } from './../shared/chart.service';
import { AccountPeriodModel } from '../../../api/accounting/model/AccountPeriodModel';

@Component({
	selector: 'individual-tax',
	templateUrl: 'individual-tax.component.html',
	styleUrls: ['./individual-tax.component.scss', '../sharedStyle.component.scss'],
	providers: [ChartService]
})

export class IndividualTaxComponent implements OnInit {
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
	individualList = [];
	accountPeriod: AccountPeriodModel = {
		currentMonth: 0,
		currentYear: 0,
		accountHistoryPeriods: [{
			year: 0,
			months: []
		}
		]
	};
	// 搜索条件
	searchObject: any = {
		keyword: '',
		year: new Date().getFullYear(),
		month: 0,
		type: '0',
		pageIndex: '1',
		pageSize: '10'
	};
	// 默认年
	defaultYear = [];
	// 年份列表
	yearList = [];
	searchModel = _.cloneDeep(this.searchObject);
	url: string = '/api/v1/chart/iit/export';
	constructor(private chartService: ChartService) {

		this.accountAccountPeriod();
	}
	ngOnInit() {

	}

	// 搜索
	search() {
		this.chartService.getIndividuaTax(this.searchModel)
			.then(
			data => {
				this.individualList = data;
				console.log(data);
				this.setQueryParameters();
			}
			)
	}
	// 下拉框选择事件
	selected(e, type) {
		if (type === 'year') {
			this.searchModel.year = e.text;
			for (let i = 0; i < this.accountPeriod.accountHistoryPeriods.length; i++) {
				if (e.text === this.accountPeriod.accountHistoryPeriods[i].year) {
					this.searchModel.year = this.accountPeriod.accountHistoryPeriods[i].months[0];
					let tempList = this.accountPeriod.accountHistoryPeriods[i].months;
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
				}
			}
			this.search();
		}
	}
	// 获取当前账期
	accountAccountPeriod() {
		this.chartService.getAccountPeriod()
			.then(
			accountPeriodModel => {
				this.accountPeriod = accountPeriodModel;
				if (accountPeriodModel) {
					this.defaultYear = [];
					this.yearList = [];
					this.defaultYear.push({ id: 'year', text: this.accountPeriod.currentYear.toString() });
					this.searchModel.year = this.accountPeriod.currentYear;
					this.searchModel.month = this.accountPeriod.currentMonth;
					this.search();
					for (let i = 0; i < this.accountPeriod.accountHistoryPeriods.length; i++) {
						this.yearList.push({ id: i, text: this.accountPeriod.accountHistoryPeriods[i].year.toString() });
					}
					let tempList = this.accountPeriod.accountHistoryPeriods[0].months;
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
					this.search();
				} else {

				}
			}
			)
			.catch(
			error => {
			}
			)
	}

	// 月份搜索
	monthSearch(item, index) {
		this.isChecked = index;
		this.searchModel.month = item.number;
		this.search();
		console.log('月份搜索！！！');
	}

	setQueryParameters() {
		this.url = '/api/v1/chart/iit/export?year=' + this.searchModel.year + '&month=' + this.searchModel.month;
	}
}