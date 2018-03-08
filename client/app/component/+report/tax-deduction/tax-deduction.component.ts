import { Component, OnInit } from '@angular/core';
import { ChartService } from '../shared/chart.service';
import { ChartApi } from '../../../api/accounting/api/ChartApi';
import { DeductionOfInputTaxModel } from '../../../api/accounting/model/DeductionOfInputTaxModel';
import { AccountApi } from '../../../api/accounting/api/AccountApi';

@Component({
	selector: 'tax-deduction',
	templateUrl: 'tax-deduction.component.html',
	styleUrls: ['./tax-deduction.component.scss', '../sharedStyle.component.scss'],
	providers: [ChartApi]

})

export class TaxDeductionComponent implements OnInit {
	deductionOfInputTaxModel: DeductionOfInputTaxModel;
	// 上面月份导航
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
	year = new Date().getFullYear();
	month = new Date().getMonth();
	constructor(private chartApi: ChartApi, private chartService: ChartService, private accountApi: AccountApi) {

	}
	ngOnInit() {
		this.getAccountPeriod();
	}

	/**
	 * 
	 * 
	 * @memberof TaxDeductionComponent
	 */
	getchartDeductionOfInputTax() {

		this.chartService.taxdeduction(this.year, this.month).then(
			deductionOfInputTaxModel => {
				console.log(deductionOfInputTaxModel);
				this.deductionOfInputTaxModel = deductionOfInputTaxModel;
			}
		).catch(
			error => {
				console.error(`${this.year}:${this.month}本期抵扣进项税额结构明细表数据呢`);
			}
			);

	}
	// 获取返回账期
	getAccountPeriod() {
		this.accountApi.accountAccountPeriod()
			.subscribe(
			accountPeriodModel => {
				console.log('返回账期======>>>>', JSON.stringify(accountPeriodModel));
				if (accountPeriodModel) {
					this.year = accountPeriodModel.currentYear;
					this.month = accountPeriodModel.currentMonth;
					this.getchartDeductionOfInputTax();
					accountPeriodModel.accountHistoryPeriods.forEach((AccountHistoryPeriodModel, index) => {
						if (Number(this.year) === Number(AccountHistoryPeriodModel.year)) {
							let tempList = AccountHistoryPeriodModel.months;
							if (tempList && tempList.length > 0) {
								tempList.forEach(item => {
									let index = this.monthList.findIndex((value) => value.number === item);
									this.monthList[index].isExist = true;
								});
								if (this.month > 0) {
									let initIndex = this.monthList.findIndex((value) => value.number === this.month);
									this.isChecked = initIndex;
								}
							}
						}

					})

				} else {
					console.log('该年没有往来明细报表');
				}
			},
			(error) => {
				console.log(error);
			});
	}
	monthSearch(item, index) {
		this.isChecked = index;
		this.month = item.number;
		this.getchartDeductionOfInputTax();
		console.log('月份搜索！！！');
	}
}
