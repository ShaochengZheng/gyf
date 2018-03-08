import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';

import { ChartApi } from '../../../../api/accounting/api/ChartApi';

@Component({
    selector: 'view-detail',
    templateUrl: './view-detail.component.html',
    styleUrls: ['./view-detail.component.scss'],
	providers: [ChartApi],
})
export class ViewDetailComponent implements OnInit {

	isSifting: boolean = false;
	choiceType: any; // 类型搜索
	searchNodata: any = false;
	companyName: any = '';
	showList: any = {};
	dataList: any = [];
	// 本期期末
	endingReceivable: any = 0;
	endingPayable: any = 0;
	endingOtherReceivable: any = 0;
	endingOtherPayable: any = 0;
	endingTotalAmount: any = 0;
	// 0 1 2 3 应收 应付 其他应收 其他应付
	typeList: any = [
		{id: '', text: '全部'},
		{id: '0', text: '应收'},
		{id: '1', text: '应付'},
		{id: '2', text: '其他应收'},
		{id: '3', text: '其他应付'},
	];

	// 搜索条件
    searchObject = {
		id: '',
		year: 2017,
		month: 4,
		type: null,
		keyword: '',
	};
	searchModel = _.cloneDeep(this.searchObject);

	queryParameters: string = '/api/v1/chart/contact_detail/export';

	constructor(private chartApi: ChartApi, private router: ActivatedRoute) {}

    ngOnInit() {
		this.searchModel.id = this.router.snapshot.params['id'];
		this.searchModel.year = this.router.snapshot.params['year'];
		this.searchModel.month = this.router.snapshot.params['month'];
		this.companyName = this.router.snapshot.params['companyName'];
		console.log('ViewDetailComponent');
		this.search();
	}

	// 列表搜索
	search() {
		this.searchNodata = false;
		this.endingReceivable = 0;
		this.endingPayable = 0;
		this.endingOtherReceivable = 0;
		this.endingOtherPayable = 0;
		this.endingTotalAmount = 0;
		this.chartApi.chartContact(this.searchModel.id, this.searchModel.year, this.searchModel.month, this.searchModel.keyword,
			this.searchModel.type)
			.subscribe(
			contactDetailsModel => {
				this.showList = contactDetailsModel;
				this.dataList = contactDetailsModel.details;
				if (this.dataList.length === 0) {
					this.searchNodata = true;
				}else {
					_.forEach(this.dataList, item => {
						if (item.transactionType === '应收') {
							if (item.debitCreditType === 'Debit') {
								this.endingReceivable += item.amount;
							}else if (item.debitCreditType === 'Credit') {
								this.endingReceivable -= item.amount;
							}
						}
						if (item.transactionType === '应付') {
							if (item.debitCreditType === 'Debit') {
								this.endingPayable -= item.amount;
							}else if (item.debitCreditType === 'Credit') {
								this.endingPayable += item.amount;
							}
						}
						if (item.transactionType === '其他应收') {
							if (item.debitCreditType === 'Debit') {
								this.endingOtherReceivable += item.amount;
							}else if (item.debitCreditType === 'Credit') {
								this.endingOtherReceivable -= item.amount;
							}
						}
						if (item.transactionType === '其他应付') {
							if (item.debitCreditType === 'Debit') {
								this.endingOtherPayable -= item.amount;
							}else if (item.debitCreditType === 'Credit') {
								this.endingOtherPayable += item.amount;
							}
						}
						// this.endingReceivable = item.amount
					});
				}
				this.endingReceivable += this.showList.receivable;
				this.endingPayable += this.showList.payable;
				this.endingOtherReceivable += this.showList.otherReceivable;
				this.endingOtherPayable += this.showList.otherPayable;
				this.endingTotalAmount = this.endingTotalAmount + this.endingReceivable
										+ this.endingOtherReceivable - this.endingPayable - this.endingOtherPayable;
				// console.log('列表搜索===》》》', JSON.stringify(contactDetailsModel));
			},
			error => {
				console.log(error);
			}
			);
			this.setQueryParameters();
	}

	// 选择类型
	selected(item) {
		this.choiceType = item.id;
		this.searchModel.type = this.choiceType;
		this.search();
	}

	// 隐藏和显示筛选
    toggleSifting() {
		this.isSifting = !this.isSifting;
	}

	setQueryParameters() {
        this.queryParameters = this.queryParameters + '?year=' + this.searchModel.year + '&month=' + this.searchModel.month
            + '&keyword=' + this.searchModel.keyword + '&contactId=' + this.searchModel.id;
    }
}
