import { Component, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertComponent } from 'ngx-bootstrap';

import { UploadWidget } from '../../widget/upload';
import { BankAccountApi } from '../../../api/accounting/api/BankAccountApi';
import { BankAccountModel } from '../../../api/accounting/model/BankAccountModel';
import { StatementAttachmentApi } from '../../../api/accounting/api/StatementAttachmentApi';

import * as _ from 'lodash';


@Component({
    selector: 'reconcile-import',
    templateUrl: './import.html',
    styleUrls: ['./import.scss'],
    providers: [BankAccountApi, StatementAttachmentApi]
})
export class ReconcileImportComponent implements OnInit {
    @ViewChild('modal') public modal;
    account: any = { id: '', accountName: '' };
    uploadUrl: string;
    uploadFile: any;
    fileName: any = '未选择文件';
    alert: Object = {};
    initAccount: BankAccountModel = {
        bankAccountType: null,
        bankName: null,
        subbranch: '',
        accountNumber: '',
        accountName: '',
        accountCode: '',
        beginDate: null,
        beginBalance: null,
        currentBalance: null,
        description: ''
    };
    which;
    currentAccount: BankAccountModel = _.cloneDeep(this.initAccount);
    constructor(private route: ActivatedRoute, private router: Router, private statementAttachmentApi: StatementAttachmentApi,
        private bankAccountApi: BankAccountApi) { }

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

    ngOnInit() {
        let temp = this.route.snapshot.params['id'];
        this.which = this.route.snapshot.params['where'];
        if (temp) {
            console.log('this.id', temp);
            this.account.id = this.route.snapshot.params['id'];
            this.bankAccountApi.bankAccountGet_2(this.account.id)
                .subscribe(
                (data) => {
                    this.currentAccount = data;
                    console.log('this.currentAccount', this.currentAccount);
                    // this.account.name = this.currentAccount.accountName;
                    // let tempDate: any = this.currentAccount.beginDate.toString().substr(0, 10);
                    // this.currentAccount.beginDate = tempDate;
                },
                (error) => {
                }
                );
        }

        this.uploadUrl = '/api/v1/statement_attachment/' + this.account.id + '/upload';
    }

    public show() {
        this.modal.show();
    }
    public hide() {
        this.modal.hide();
    }

    result(resultObj) {
        this.addAlert(resultObj);
    }

    successData(data) {
        console.log('data')
        this.router.navigate(['/app/reconcile/match', { id: this.account.id }]);
        localStorage.setItem('importedReconcileData', data);
    }

    importedFiles(event) {
        this.uploadFile = event.target.files[0];
        this.fileName = this.uploadFile ? this.uploadFile.name : '未选择文件';
    }
    clickCancel() {
        if (this.which === 'list') {
            this.router.navigate(['/app/transaction/list']);
        } else if (this.which === 'assist') {
            this.router.navigate(['/app/home-page/assist']);
        } else if (this.which === 'history') {
            this.router.navigate(['/app/reconcile/detail/history', { id: this.account.id, type: 'bill' }]);
        } else {
            this.router.navigate(['/app/account']);
        }
    }
}

