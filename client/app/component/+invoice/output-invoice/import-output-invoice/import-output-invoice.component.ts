import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { InvoiceService } from '../../shared/invoice.service';
import { InvoiceApi } from '../../../../api/accounting/api/InvoiceApi';
import { ImportApi } from '../../../../api/accounting/api/ImportApi';
import { AuthorizationService } from '../../../../service/core';
import { ConfirmWidget, ConfirmEventTypeEnum } from '../../../widget/confirm/confirm';
import { AccountPeriodModel } from '../../../../api/accounting/model/AccountPeriodModel';

@Component({
	selector: 'import-output-invoice',
	templateUrl: 'import-output-invoice.component.html',
	styleUrls: ['import-output-invoice.component.scss'],
	providers: [InvoiceApi, ImportApi]
})

export class ImportOutputInvoiceComponent implements OnInit {
	@ViewChild('confirmWidget') public confirmWidget: ConfirmWidget;
	uploadExcel: string = '/api/v1/import/import_Invoice';
	type: string = 'file';
	labelText: string = '上传文件';
	alert: Object = {};
	showDetail: boolean = false;
	showImportPage: boolean = true;
	historyFiles: any = [];
	outputInvoiceItemList: any = [];
	currentItem: any;
	currentItemName: any;
	currentItemTime: any;
	accountPeriod: AccountPeriodModel = {
		currentMonth: 0,
		currentYear: 0,
		accountHistoryPeriods: [{
			year: 0,
			months: []
		}
		]
	};
	enableDelete: boolean = true;
	// 是否是一般纳税人
	isGeneralTaxpayer: boolean = false;
	constructor(private invoiceService: InvoiceService, private route: ActivatedRoute, private router: Router, private invoiceApi: InvoiceApi,
		private importApi: ImportApi, private authorizationService: AuthorizationService) {
		this.accountAccountPeriod();
		if (this.authorizationService.Session.currentAccount.companyProperty === 'GeneralTaxpayer') {
			this.isGeneralTaxpayer = true;
		} else {
			this.isGeneralTaxpayer = false;
		}
	}

	ngOnInit() {
		this.gethistory();
	}

	public alertSuccess(msg: string) {
		this.clearAlert();
		setTimeout(() => { this.alert = { type: 'success', msg: msg }; }, 0);
	}

	public alertDanger(msg: string) {
		this.clearAlert();
		setTimeout(() => { this.alert = { type: 'danger', msg: msg }; }, 0);
	}

	public addAlert(alert: Object): void {
		this.clearAlert();
		setTimeout(() => { this.alert = alert; }, 0);
	}

	public clearAlert(): void {
		this.alert = {};
	}

	clickCancel() {
		this.router.navigate(['/app/salary']);
	}
	// 展示导入详情
	goDetail(item) {
		this.showDetail = true;
		this.currentItemName = item.fileName;
		this.currentItemTime = item.createdOn;
		this.invoiceApi.invoiceImportHistory(item.id).subscribe(
			data => {
				this.outputInvoiceItemList = data;
			},
			error => {
				this.alertDanger(error);
			}
		);

	}
	// 展示上传页面
	showImport() {
		this.showDetail = false;
	}


	successExcel(id) {
		this.router.navigate(['/app/invoice/output-invoice']);

	}
	gethistory() {
		this.importApi.importHistory('import_invoice').subscribe(
			data => {
				this.historyFiles = data;
			},
			error => {
				this.alertDanger(error);
			}
		);
	}
	resultExcel(resultObj) {
		this.addAlert(resultObj);
	}
	delete(event) {
		if (event === ConfirmEventTypeEnum.Confirm) {
			if (Number(this.outputInvoiceItemList[0].recordDate.toString().substring(5, 7)) !== this.accountPeriod.currentMonth) {
				this.alertDanger('该数据不在当前账期内，无法删除');
				return;
			}
			this.invoiceApi.invoiceBatchDelete(this.currentItem.id).subscribe(
				data => {
					this.showDetail = false;
					this.alertSuccess('导入记录删除成功');
					this.gethistory();
				},
				error => {
					this.alertDanger(error);
				}
			);
		}
	}
	// 删除确认
	openDeleteModal(item) {
		this.currentItem = item;
		const deleteMessage = '删除导入历史对应的导入数据同时会被删除，确定删除吗？';
		this.confirmWidget.message = deleteMessage;
		this.confirmWidget.show();
	}
	// 获取当前账期
	accountAccountPeriod() {
		this.invoiceService.getAccountPeriod()
			.then(
			accountPeriodModel => {
				this.accountPeriod = accountPeriodModel;
			}
			)
			.catch(
			error => {
				this.alertDanger(error);
			}
			);
	}
}
