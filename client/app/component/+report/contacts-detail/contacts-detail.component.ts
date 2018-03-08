import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import * as _ from 'lodash';

import { ChartApi } from '../../../api/accounting/api/ChartApi';
import { AccountApi } from '../../../api/accounting/api/AccountApi';

@Component({
    selector: 'contacts-detail',
    templateUrl: './contacts-detail.component.html',
    styleUrls: ['./contacts-detail.component.scss', '../sharedStyle.component.scss'],
	providers: [ChartApi, AccountApi],
})
export class ContactsDetailComponent implements OnInit {

	// 0 1 2 3 应收 应付 其他应收 其他应付
    isSifting: boolean = false;
	type: any = '0'; // 默认显示应收列表
	isChecked: any; // 点击月份样式效果
	searchNodata: any = false;
	dataList: any;
	pageIndex: number = 1;
    pageSize: number = 10;
    recordCount: number = 0;
	maxSize: number = 5;
	monthList = [
		{month: '1月', number: 1, isExist: false},
		{month: '2月', number: 2, isExist: false},
		{month: '3月', number: 3, isExist: false},
		{month: '4月', number: 4, isExist: false},
		{month: '5月', number: 5, isExist: false},
		{month: '6月', number: 6, isExist: false},
		{month: '7月', number: 7, isExist: false},
		{month: '8月', number: 8, isExist: false},
		{month: '9月', number: 9, isExist: false},
		{month: '10月', number: 10, isExist: false},
		{month: '11月', number: 11, isExist: false},
		{month: '12月', number: 12, isExist: false}
	]
	// 搜索条件
    searchObject: any = {
		keyword: '',
		year: '',
		month: 0,
      	type: '0',
		pageIndex: '1',
		pageSize: '10'
	};
	searchModel = _.cloneDeep(this.searchObject);

	constructor(private ref: ChangeDetectorRef, private chartApi: ChartApi, private accountApi: AccountApi) {
    }

    ngOnInit() {
		console.log('ContactsDetailComponent');
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
				}else {
					console.log('该年没有往来明细报表');
				}
            },
            (error) => {
                ;
                console.log(error);
            });
    }

	// 列表搜索
	search() {
		this.searchNodata = false;
		console.log('search!!!!');
		this.chartApi.chartContactChart(this.searchModel.year, this.searchModel.month, this.searchModel.type,
			this.searchModel.keyword, this.searchModel.pageIndex, this.searchModel.pageSize)
			.subscribe(
			pagedResultContactChartModel => {
				this.dataList = pagedResultContactChartModel.list;
				if (this.dataList.length === 0) {
					this.searchNodata = true;
				}
				this.pageIndex = pagedResultContactChartModel.pageIndex;
				this.pageSize = pagedResultContactChartModel.pageSize;
				this.recordCount = pagedResultContactChartModel.recordCount;
				this.ref.detectChanges();
				console.log('列表搜索===》》》', pagedResultContactChartModel);
			},
			error => {
				console.log(error);
			}
			);
	}

	// 切换tab
	tabSelected(flag) {
		this.pageIndex = 1;
		this.pageSize = 10;
		this.recordCount = 0;
		this.type = flag;
		this.searchModel.type = this.type;
		this.getAccountPeriod();
		console.log(flag);
	}

	// 月份搜索
	monthSearch(item, index) {
		this.isChecked = index;
		this.searchModel.month = item.number;
		this.search();
		console.log('月份搜索！！！');
	}

	// 分页
	public pageChanged(event: any): void {
        this.searchModel.pageIndex = event.page;
        this.search();
    };

	// 隐藏和显示筛选
    toggleSifting() {
		this.isSifting = !this.isSifting;
	}

}
