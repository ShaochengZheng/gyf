import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountApi } from '../../../api/accounting/api/AccountApi';
import { AccountBookApi } from '../../../api/accounting/api/AccountBookApi';
import { AuthorizationService } from '../../../service/core';
@Component({
    selector: 'beginning-import',
    templateUrl: 'import.html',
    styleUrls: ['./import.scss'],
    providers: [AccountBookApi]
})

export class ImportComponent implements OnInit {
    uploadExcel: string = '/api/v1/import/import_Account';
    type: string = 'file';
    labelText: string = '上传文件';
    alert: Object = {};
    showDetail: boolean = false;
    accountBookId: any; // 账套ID
    display: boolean = true;
    constructor(private authorizationService: AuthorizationService, private route: ActivatedRoute,
        private router: Router, private accountApi: AccountApi, private accountBookApi: AccountBookApi) {
        this.getAccountPeriod();
    }

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
            this.router.navigate(['/app/finance/beginningPeriod', { msg: '导入成功' }]);
        }
    }

    resultExcel(resultObj) {
        this.addAlert(resultObj);
    }


    clickCancel() {
        this.router.navigate(['/app/finance/beginningPeriod']);
    }

    // 获取期初年月
    getAccountPeriod() {
        this.accountBookApi.accountBookGet_1(this.authorizationService.Session.currentAccount.id)
            .subscribe(
            accountBookModel => {
                let currentDate = accountBookModel.currentDate;
                let tempDate: any = accountBookModel.openingDate;
                let enableTime = tempDate.toString().substr(0, 7);
                if (enableTime !== currentDate.toString().substr(0, 7)) {
                    this.display = false;
                }
            },
            (error) => {
                console.log(error);
            });
    }


}
