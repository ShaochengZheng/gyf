import { Component, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertComponent } from 'ngx-bootstrap';

import { StorageService } from '../../../../service/core';
import { UploadWidget } from '../../../widget/upload';
import { DownloadWidget } from '../../../widget/download';

import { ContactApi } from '../../../../api/accounting/api/ContactApi';
import { ContactModel } from '../../../../api/accounting/model/ContactModel';

import * as _ from 'lodash';


@Component({
    selector: 'contacts-import',
    templateUrl: './importContacts.component.html',
    styleUrls: ['./importContacts.component.scss'],
    providers: [ContactApi]
})
export class ContactsImportComponent implements OnInit {
    @ViewChild('modal') public modal;
    uploadUrl: string;
    uploadFile: any;
    fileName: any = '未选择文件';
    alert: Object = {};
    attachmenId: any;
    constructor(private route: ActivatedRoute, private router: Router,
        private storageService: StorageService, private contactApi: ContactApi) { }

    public alertSuccess(msg: string) {
        this.clearAlert();
        setTimeout(() => { this.alert = { type: 'success', msg: msg }; }, 1000);
    }

    public alertDanger(msg: string) {
        this.clearAlert();
        setTimeout(() => { this.alert = { type: 'danger', msg: msg }; }, 1000);
    }

    public addAlert(alert: Object): void {
        this.clearAlert();
        setTimeout(() => { this.alert = alert; }, 0);
    }

    public clearAlert(): void {
        this.alert = {};
    }

    ngOnInit() {
        this.uploadUrl = '/api/v1/contact/upload';
    }

    result(resultObj) {
        this.addAlert(resultObj);
    }

    successData(data) {
        data = JSON.parse(data);
        if (data === null) {
            this.router.navigate(['/app/setting']);
        }
        if (data && data.id && data.id !== null) {
            this.attachmenId = data.id;
            this.modal.show();
        }
    }
    reImport() {
        this.modal.hide();
    }

    importedFiles(event) {
        this.uploadFile = event.target.files[0];
        this.fileName = this.uploadFile ? this.uploadFile.name : '未选择文件';
    }
    quit() {
        this.alertDanger('您已取消往来单位／个人信息导入');
        this.router.navigate(['/app/setting']);
    }
}
