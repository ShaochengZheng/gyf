import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { EmployeeApi } from '../../../../api/accounting/api/EmployeeApi';


@Component({
    selector: 'stuff-import',
    templateUrl: 'stuff-import.component.html',
    styleUrls: ['./stuff-import.component.scss'],
    providers: [EmployeeApi]
})

export class StuffImportComponent implements OnInit {
    uploadExcel: string = '/api/v1/import/import_Employee';
    type: string = 'file';
    labelText: string = '上传文件';
    alert: Object = {};
    showDetail: boolean = false;
    constructor(private route: ActivatedRoute, private router: Router, private employeeApi: EmployeeApi) { }

    ngOnInit() {
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

    successExcel(id) {
        console.log('data4:00excel', id);
        if (id) {
            this.router.navigate(['/app/salary/stuff-list']);
        }
    }

    resultExcel(resultObj) {
        this.addAlert(resultObj);
    }


    clickCancel() {
        this.router.navigate(['/app/salary/stuff-list']);
    }
}
