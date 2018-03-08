import { Component, OnInit } from '@angular/core';

import { AccountApi } from '../../../api/accounting/api/AccountApi';
import { AccountModels } from '../shared/finance.model';
import { FinanceService } from '../shared/finance.service';
import { ShareService } from '../../../service/core/share';
import { AccountPeriodModels } from '../../../service/core/extended-interface';


@Component({
	selector: 'account-balance',
	templateUrl: 'account-balance.component.html',
	styleUrls: ['./account-balance.component.scss']
})

export class AccountBalanceComponent implements OnInit {
	// 是否显示搜索
	isSearch: boolean = true;
	// 类型
	periodType: string = 'Month';

	// 年
	year: any = this.shareService.year;
	// 月
	month: any = this.shareService.month;
	// 默认月
	defaultMonth: any;
	// 默认年
	defaultYear: any;
	// 年列表
	yearsList: any;
	// 月列表
	monthsToList: any;
	// 是否显示列表
	isTableShow: boolean = false;
	// 是否展开子项
	childShow: boolean = true;
	// 科目余额余额表时间
	accountPeriodModel: AccountPeriodModels;
	// total 合计金额
	total: any;
	// 导出地址
	exportAddress: string = `/api/v1/account/${this.year}/${this.month}/export`;
	accountModels: AccountModels[];
	constructor(private accountApi: AccountApi, private financeService: FinanceService, private shareService: ShareService) {

	}
	ngOnInit() {
		this.accountAccountPeriod();
	}
	setURL() {
		this.exportAddress = `/api/v1/account/${this.year}/${this.month}/export?periodType=${this.periodType}`;
	}
	// 设置月份 再去获取数据
	setTheMonth(e) {
		this.month = e.text;
		this.accountGet();
		this.setURL();
	}
	// 设置年份
	setTheYear(e) {
		this.year = e.text;
		this.accountAccountPeriod();
	}
	// 是否显示子项
	isChildShow(item) {
		const list = this.accountModels;
		for (let i = 0, len = this.accountModels.length; i < len; i++) {
			const code = list[i].code;
			// 如果code中包含当前的code 证明是本项的子项 改变其显示状态
			if (code.indexOf(item.code) === 0) {
				// 如果是自身 就不改变
				if (code === item.code) {

				} else {
					// 如果箭头指向为true  箭头为收起 改变其所有箭头为收齐 并隐藏此项
					if (item.directionOfArrow && item.directionOfArrow === true) {
						list[i].isExpansion = true;
						list[i].directionOfArrow = false;
						// 否则 改变其所有箭头为展开 并显示此项
					} else {
						list[i].isExpansion = false;
						list[i].directionOfArrow = true;

					}
				}

				// 改变箭头方向
				list[i].directionOfArrow = !list[i].directionOfArrow;
			}
		}
	}
	// 查询余额表
	accountGet() {
		this.setURL();
		this.financeService.accountGet(this.year, this.month, this.periodType)
			.then(
			temp => {
				console.warn(temp);
				const accountModel = temp.accountModels;
				this.total = temp.total;
				if (accountModel && accountModel.length > 0) {
					this.accountModels = accountModel;
					for (let i = 0; i < accountModel.length; i++) {
						if (accountModel[i].whetherTo0) {
						} else {
							this.isTableShow = false;
						}
					}
				} else {
					this.isTableShow = true;
				}
				console.log(accountModel);
			}
			)
			.catch(
			error => {
				console.error(error);
				this.isTableShow = true;

			}
			);
	}
	// 获取科目余额表时间
	accountAccountPeriod() {
		this.shareService.accountAccountPeriod().then(
			accountPeriodModel => {
				this.year = accountPeriodModel.currentYear;
				this.month = accountPeriodModel.currentMonth;
				this.yearsList = accountPeriodModel.YearList;
				this.monthsToList = accountPeriodModel.MonthsToList;
				this.defaultYear = [{ id: this.year, text: this.year }];
				this.defaultMonth = [{ id: this.month, text: this.month }];
				this.accountGet();
				this.setURL();


			},
			error => {
				console.error(error);
			}
		);
	}
	// 清空
	// empty() {
	// 	this.accountAccountPeriod();
	// 	this.periodType = 'Month';
	// 	this.setURL();
	// }

}
