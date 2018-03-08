import { Component, OnInit } from '@angular/core';

import { ChartService } from './../shared/chart.service';
import { VATModel } from '../../../api/accounting/model/VATModel';

import * as _ from 'lodash';
@Component({
	selector: 'valueAdded-report',
	templateUrl: 'valueAdded-report.component.html',
	styleUrls: ['./valueAdded-report.component.scss'],
	providers: [ChartService]
})

export class ValueAddedReportComponent implements OnInit {
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
	isChecked: any; // 点击月份样式
	startDate: any;
	endDate: any;
	vatModel: VATModel = {
		taxNumber: '',
		taxPlayer: '',
		taxRate: 0,
		vatItemModels: [
			{
				rowNum: 0,
				dutiableArtical: 0,
				dutiableService: 0,
				yearToDayDutiableArtical: 0,
				yearToDayDutiableService: 0
			},
			{
				rowNum: 0,
				dutiableArtical: 0,
				dutiableService: 0,
				yearToDayDutiableArtical: 0,
				yearToDayDutiableService: 0
			},
			{
				rowNum: 0,
				dutiableArtical: 0,
				dutiableService: 0,
				yearToDayDutiableArtical: 0,
				yearToDayDutiableService: 0
			},
			{
				rowNum: 0,
				dutiableArtical: 0,
				dutiableService: 0,
				yearToDayDutiableArtical: 0,
				yearToDayDutiableService: 0
			},
			{
				rowNum: 0,
				dutiableArtical: 0,
				dutiableService: 0,
				yearToDayDutiableArtical: 0,
				yearToDayDutiableService: 0
			},
			{
				rowNum: 0,
				dutiableArtical: 0,
				dutiableService: 0,
				yearToDayDutiableArtical: 0,
				yearToDayDutiableService: 0
			},
			{
				rowNum: 0,
				dutiableArtical: 0,
				dutiableService: 0,
				yearToDayDutiableArtical: 0,
				yearToDayDutiableService: 0
			},
			{
				rowNum: 0,
				dutiableArtical: 0,
				dutiableService: 0,
				yearToDayDutiableArtical: 0,
				yearToDayDutiableService: 0
			},
			{
				rowNum: 0,
				dutiableArtical: 0,
				dutiableService: 0,
				yearToDayDutiableArtical: 0,
				yearToDayDutiableService: 0
			},
			{
				rowNum: 0,
				dutiableArtical: 0,
				dutiableService: 0,
				yearToDayDutiableArtical: 0,
				yearToDayDutiableService: 0
			},
			{
				rowNum: 0,
				dutiableArtical: 0,
				dutiableService: 0,
				yearToDayDutiableArtical: 0,
				yearToDayDutiableService: 0
			},
			{
				rowNum: 0,
				dutiableArtical: 0,
				dutiableService: 0,
				yearToDayDutiableArtical: 0,
				yearToDayDutiableService: 0
			},
			{
				rowNum: 0,
				dutiableArtical: 0,
				dutiableService: 0,
				yearToDayDutiableArtical: 0,
				yearToDayDutiableService: 0
			},
			{
				rowNum: 0,
				dutiableArtical: 0,
				dutiableService: 0,
				yearToDayDutiableArtical: 0,
				yearToDayDutiableService: 0
			},
			{
				rowNum: 0,
				dutiableArtical: 0,
				dutiableService: 0,
				yearToDayDutiableArtical: 0,
				yearToDayDutiableService: 0
			},
			{
				rowNum: 0,
				dutiableArtical: 0,
				dutiableService: 0,
				yearToDayDutiableArtical: 0,
				yearToDayDutiableService: 0
			},
			{
				rowNum: 0,
				dutiableArtical: 0,
				dutiableService: 0,
				yearToDayDutiableArtical: 0,
				yearToDayDutiableService: 0
			},
			{
				rowNum: 0,
				dutiableArtical: 0,
				dutiableService: 0,
				yearToDayDutiableArtical: 0,
				yearToDayDutiableService: 0
			},
			{
				rowNum: 0,
				dutiableArtical: 0,
				dutiableService: 0,
				yearToDayDutiableArtical: 0,
				yearToDayDutiableService: 0
			}

		]
	};
	constructor(private chartService: ChartService) {
		this.search('Month');
	}
	ngOnInit() {
		//console.log('BalanceSheetComponent');
	}

	// 搜索
	search(type) {
		this.chartService.getVat(type)
			.then(
			data => {
				this.vatModel = data;
			})
			.catch(
			error => {
				// ;
				// this.alertDanger(error);
			}
			);
	}

	statusSelect(type) {
		this.search(type)
	}

}