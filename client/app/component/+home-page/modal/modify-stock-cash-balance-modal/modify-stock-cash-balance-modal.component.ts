import { CashBalanceApi } from '../../../../api/accounting/api/CashBalanceApi';
import { Component, ViewChild, OnInit, Output, EventEmitter } from '@angular/core';
import { AmountModel } from '../../../../api/accounting/model/AmountModel';
import { UtilityService } from '../../../../service/core/utility';

@Component({
	selector: 'modify-stock-cash-balance-modal',
	templateUrl: 'modify-stock-cash-balance-modal.component.html',
	styleUrls: ['./modify-stock-cash-balance-modal.component.scss'],
	providers: [CashBalanceApi],
})

export class ModifyStockCashBalanceModalComponent implements OnInit {
	@ViewChild('modal') public modal;
	@Output() success = new EventEmitter();

	// alert
	alert = {};
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
	//   alert
	// tslint:disable-next-line:member-ordering
	amountModel: AmountModel = {
		name: '',
		totalAmount: 0,
		count: 0
	};
	constructor(private cashBalanceApi: CashBalanceApi, private utilityService: UtilityService) {

	}
	ngOnInit() { }
	public show(totalAmount) {
		this.amountModel.totalAmount = totalAmount;
		this.modal.show();
	}

	public close() {
		this.modal.hide();
	}
	save() {
		this.amountModel.totalAmount = this.utilityService.reverseFormat(this.amountModel.totalAmount);
		this.cashBalanceApi.cashBalancePut(this.amountModel).subscribe(
			boolResultModel => {
				this.success.emit('');
				this.close();
			},
			error => {
				this.alertDanger(error);
			}
		);
	}
}
