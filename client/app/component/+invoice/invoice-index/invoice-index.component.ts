import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';

import { InvoiceService } from '../shared/invoice.service';
@Component({
	selector: 'invoice-index',
	templateUrl: 'invoice-index.component.html',
	styleUrls: ['invoice-index.component.scss'],
	providers: []
})

export class InvoiceIndexComponent implements OnInit {

	// 弹出提示框
	alert = {};
	searchInputObject = {
		tagIds: '',
		entityType: 'INPUTINVOICE',
		invoiceType: '',
		invoiceStatus: '',
		keyword: '',
		startDate: '',
		endDate: '',
		pageIndex: '1',
		pageSize: '10'
	};
	searchInputModel = _.cloneDeep(this.searchInputObject);
	searchOutputObject = {
		tagIds: '',
		entityType: 'OUTPUTINVOICE',
		invoiceType: '',
		invoiceStatus: '',
		keyword: '',
		startDate: '',
		endDate: '',
		pageIndex: '1',
		pageSize: '10'
	};
	searchOutputModel = _.cloneDeep(this.searchOutputObject);
	inputInvoiceList = [];
	inputTotal = 0;
	inputRate = 0;
	outputInvoiceList = [];
	outputTotal = 0;
	outputRate = 0;
	constructor(private invoiceService: InvoiceService) {
		this.searchInputInvoice();
		this.searchOutputInvoice();
	}
	public alertSuccess(msg: string) {
		this.clearAlert();
		setTimeout(() => {
			this.alert = { type: 'success', msg: msg };
		}, 0);
	}

	public alertDanger(msg: string) {
		this.clearAlert();
		setTimeout(() => {
			this.alert = { type: 'danger', msg: msg };
		}, 0);
	}

	public addAlert(alert: Object): void {
		this.clearAlert();
		this.alert = alert;
	}

	public clearAlert(): void {
		this.alert = {};
	}

	ngOnInit() { }

	searchInputInvoice() {
		this.invoiceService.getAllItem(this.searchInputModel)
			.then(
			inputinvoiceItemModel => {
				this.inputInvoiceList = inputinvoiceItemModel.list;
				let otherAmountTotal = 0;
				for (let i = 0; i < this.inputInvoiceList.length; i++) {
					this.inputTotal += this.inputInvoiceList[i].amount;
					if (this.inputInvoiceList[i].businessCategory.name === '固定资产') {
						otherAmountTotal += this.inputInvoiceList[i].amount;
					}
				}
				this.inputRate = Math.round((otherAmountTotal / this.inputTotal) * 100);
			})
			.catch(
			error => {
				this.alertDanger(error);
			}
			);
	}

	searchOutputInvoice() {
		this.invoiceService.getAllItem(this.searchOutputModel)
			.then(
			outputinvoiceItemModel => {
				this.outputInvoiceList = outputinvoiceItemModel.list;
				let otherAmountTotal = 0;
				for (let i = 0; i < this.outputInvoiceList.length; i++) {
					this.outputTotal += this.outputInvoiceList[i].amount;
					otherAmountTotal += this.outputInvoiceList[i].amount * this.outputInvoiceList[i].taxRate;
				}
				this.outputRate = Math.round((otherAmountTotal / this.outputTotal) * 100);
			})
			.catch(
			error => {
				this.alertDanger(error);
			}
			);
	}
}
