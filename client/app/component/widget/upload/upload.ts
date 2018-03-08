import { Component, Input, Output, EventEmitter, Optional, Inject } from '@angular/core';
import { StorageService } from '../../../service/core';
import { ACCOUNTING_BASE_PATH } from '../../../api/accounting';
import * as _ from 'lodash';
declare var FileSaver: any;
declare var $: any;


@Component({
    selector: 'upload',
    template: `<button type="button" class="btn btn-primary" (click)="uploadFile()" [disabled]="isDisabled || issave"><ng-content></ng-content></button>`
})
export class UploadWidget {
    @Input() url: string;
    @Input() mediaType: string;
    @Input() file: File;
    @Input() isDisabled: boolean = false;
    @Input() fileTypes: string[];
    @Output() success = new EventEmitter();
    @Output() result = new EventEmitter();
    issave: boolean = false;
    baseUrl: string;
    fileName: string;
    token;
    constructor( @Optional() @Inject(ACCOUNTING_BASE_PATH) baseUrl: string, private storageService: StorageService) {
        if (baseUrl) {
            this.baseUrl = baseUrl;
        }
    }

    uploadFile() {
        // verify if the file type is valid
        if (this.fileTypes) {
            let isValidType: boolean = false;
            _.forEach(this.fileTypes, (item) => {
                console.log(this.file.name, this.file.name.substring(this.file.name.length - item.length), item);
                if (this.file.name.substring(this.file.name.length - item.length) === item) {
                    console.log(this.file.name, this.file.name.substring(this.file.name.length - item.length), item);
                    isValidType = true;
                }
            });
            if (!isValidType) {
                let resultObj = {
                    type: 'danger',
                    msg: '文件格式不正确!'
                };
                this.result.emit(resultObj);
                return;
            }
        }
        let formData = new FormData();
        formData.append('file', this.file);
        let token = this.storageService.getToken();
        this.isDisabled = true;
        $.ajax({
            url: this.baseUrl + this.url,
            type: 'POST',
            beforeSend: (xhr) => {
                xhr.setRequestHeader('Authorization', 'bearer ' + token.access_token);
                xhr.setRequestHeader('company_id', token.user.currentCompany.id);
                xhr.setRequestHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(this.file.name));
                xhr.setRequestHeader('accountbook_id', token.currentAccount ? token.currentAccount.id : '');

            },
            data: formData,
            mimeType: 'multipart/form-data',
            contentType: false,
            cache: false,
            processData: false,
            success: (data, textStatus, jqXHR) => {
                let resultObj = {
                    type: 'success',
                    msg: '上传成功！'
                };
                this.result.emit(resultObj);
                this.success.emit(data);
                this.isDisabled = false;
            },
            error: (jqXHR, textStatus, errorThrown) => {
                let resultObj = {
                    type: 'danger',
                    msg: JSON.parse(jqXHR.responseText).errors[0]
                    // msg: '上传失败！'
                };
                this.result.emit(resultObj);
                this.isDisabled = false;
            }
        });
    }
}
