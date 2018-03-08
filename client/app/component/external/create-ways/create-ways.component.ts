import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AccountBookApi } from '../../../api/accounting/api/AccountBookApi';

@Component({
	selector: 'create-ways',
	host: {
		class: 'gray-lightest-bg full-height'
	},
	templateUrl: 'create-ways.component.html',
	styleUrls: ['../create-company/create-company.component.scss'],
	providers: [AccountBookApi]
})

export class CreateWaysComponent {
	uploadUrl: string;
	uploadExcel: string;
	firstType: string;
	secondType: string;
	alert: Object = {};
	showback: boolean = false;

	constructor(private router: Router, private route: ActivatedRoute, private accountBookApi: AccountBookApi) {

	}

	ngOnInit() {
		this.showback = this.route.snapshot.params['showback'];
		this.uploadUrl = '/api/v1/accountbook/upload';
		this.firstType = 'license';
		this.secondType = 'company';
		this.uploadExcel = '/api/v1/import/import_Company';
	}

	switch() {
		this.router.navigate(['/create-company']);
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

	successData(tempData) {
		console.log('data4:00', tempData);
		localStorage.setItem('uploadLicenseData', tempData);
		this.router.navigate(['/create-company']);
	}


	successExcel(id) {
		console.log('data4:00excel', id);
		this.accountBookApi.accountBookImportHistory(id).subscribe(
			data => {
				console.log('datasuccessExcel', data);
				this.router.navigate(['/app/company-list']);
			},
			error => {

			}
		);
	}

	result(resultObj) {
		this.addAlert(resultObj);
	}
	resultExcel(resultObj) {
		this.addAlert(resultObj);
	}
}
