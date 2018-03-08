import { Component, OnInit, Inject, Optional, Output, Input, EventEmitter } from '@angular/core';

import { ACCOUNTING_BASE_PATH } from '../../../api/accounting';
import { StorageService } from '../../../service/core';
import { LoaderService } from '../../../service/core';
import { ImportApi } from '../../../api/accounting/api/ImportApi';
declare var jQuery: any;


@Component({
    selector: 'upload-attachments',
    templateUrl: 'upload-attachments.component.html',
    styleUrls: ['./upload-attachments.component.scss'],
    providers: [ImportApi]
})

export class UploadAttachmentsComponent implements OnInit {
    // 抵扣上传 在component 下载错误文件
    /**
     * exportByOther 不传或者false 控件下载文件
     *  传 true 调用者下载文件
     */
    @Input() exportByOther: boolean = false;
    @Input() createWays: string;
    @Input() type: string;
    //  传入label文字
    @Input() labelText: string;
    //  传入接口地址
    @Input() url: string;
    // 成功返回数据
    @Output() success = new EventEmitter();
    // 附件列表
    @Input() dataList: any = [];
    @Input() disabled: boolean;
    // 返回上传结果（提示信息）
    @Output() results = new EventEmitter();
    @Output() preview = new EventEmitter();
    baseUrl: string;
    fileName: string;
    count: number = 0;
    formData;
    token;
    // url: string;
    numberofAttachments: number = 0;
    listener: any;
    // 有没有去上传
    isUpload: boolean = false;

    constructor( @Optional() @Inject(ACCOUNTING_BASE_PATH) basePath: string, private storageService: StorageService,
        private loaderService: LoaderService, private importApi: ImportApi) {
        if (basePath) {
            this.baseUrl = basePath;
        }
    }

    ngOnInit() {
        this.formData = new FormData();
        this.token = this.storageService.getToken();
        if (!this.dataList) {
            this.dataList = [];
        }
        this.numberofAttachments = this.dataList.length;
    }

    /**
     *
     * 上传excel
     * @param {any} event
     *
     * @memberof UploadAttachmentsComponent
     */
    importedExcel(event) {
        let whetherupload: boolean = true;
        this.formData.append('file', event.target.files[0]);
        // 上传过程
        if (whetherupload && this.url) {
            this.loaderService.show();
            this.request();
        }
        // 上传过程
    }


    /** 上传 excel
     *
     *
     *
     * @memberof UploadAttachmentsComponent
     */
    request() {
        this.isUpload = true;
        jQuery.ajax({
            url: this.baseUrl + this.url,
            type: 'POST',
            beforeSend: (xhr) => {
                xhr.setRequestHeader('Authorization', 'bearer ' + this.token.access_token);
                xhr.setRequestHeader('company_id', this.token.user.currentCompany.id);
                if (this.createWays === 'createWays') {
                } else {
                    xhr.setRequestHeader('accountbook_id', this.token.currentAccount ? this.token.currentAccount.id : '');
                }
            },
            data: this.formData,
            mimeType: 'multipart/form-data',
            contentType: false,
            cache: false,
            processData: false,
            success: (data, textStatus, jqXHR) => {
                let temp = JSON.parse(data);
                this.getFile(temp.id);
                this.clearValue();
                this.formData = new FormData();
                this.loaderService.hide();
            },
            error: (jqXHR, textStatus, errorThrown) => {
                this.loaderService.hide();
                let resultObj = {
                    type: 'danger',
                    msg: JSON.parse(jqXHR.responseText).errors[0]
                };
                this.results.emit(resultObj);
                this.formData = new FormData();
                this.isUpload = false;
            }
        });
    }

    // 获取上传的数据

    public getFile(sid) {
        this.importApi.importGet(sid).toPromise().then(data => {
            this.count++;
            if (data.taskStatus === 'Success') {
                let resultObj = {
                    type: 'success',
                    msg: '保存成功'
                };
                this.count = 0;
                this.isUpload = false;
                this.results.emit(resultObj);
                this.success.emit(sid);
                this.clear();
                this.loaderService.hide();
                this.formData = new FormData();
            } else {
                if (data.importErrorMsg) {
                    let resultObj = {
                        type: 'danger',
                        msg: data.importErrorMsg
                    };
                    this.isUpload = false;
                    this.results.emit(resultObj);
                    this.loaderService.hide();
                    this.count = 0;
                    this.formData = new FormData();
                } else if (this.count > 8) {
                    this.loaderService.hide();
                    this.openError(sid);
                    this.count = 0;
                    this.isUpload = false;
                    this.formData = new FormData();
                } else {
                    setTimeout(() => {
                        this.getFile(sid);
                    }, 2000);
                }
            }
        }).catch(err => {
            let resultObj = {
                type: 'danger',
                msg: '哎呀，出问题了，请重新试试吧'
            };
            this.count = 0;
            this.results.emit(resultObj);
            this.loaderService.hide();
            this.formData = new FormData();
        });
        // }, 2000);
    }


    // 在新窗口中打开错误表格

    openError(sid) {
        this.importApi.importExport(sid).subscribe(
            data => {
                let resultObj = {
                    type: 'danger',
                    msg: '请从表格查看错误原因',
                    id: sid
                };
                
                this.results.emit(resultObj);
                // 单独下载
                if(this.exportByOther){
                    return;
                }
                let elemIF = document.createElement('iframe');
                elemIF.src = data;
                elemIF.style.display = 'none';
                document.body.appendChild(elemIF);
                this.formData = new FormData();
            },
            error => {
                let resultObj = {
                    type: 'danger',
                    msg: error
                };
                this.results.emit(resultObj);
                this.formData = new FormData();

            }
        );
    }

    /**
     * 上传附件
     *
     * @param {any} event
     *
     * @memberof UploadAttachmentsComponent
     */
    importedFiles(event) {
        this.numberofAttachments = this.dataList.length;
        let whetherupload: boolean = true;
        // 图片验证
        let imageType = /^(image\/bmp|image\/gif|image\/jpeg|image\/jpg|image\/png)$/i;
        let l = event.target.files.length;
        if (l <= 0) {
            return;
        }
        for (let i = 0; i < l; i++) {
            if (!imageType.test(event.target.files[i].type)) {
                let resultObj1 = {
                    type: 'danger',
                    msg: '仅支持jpg、jpeg、bmp、gif、png，请重新上传'
                };
                this.results.emit(resultObj1);
                whetherupload = false;
                return;
            }

            if (event.target.files[i].size > 10485760) {
                let resultObj2 = {
                    type: 'danger',
                    msg: '附件超出10M大小，上传失败'
                };
                this.results.emit(resultObj2);
                whetherupload = false;
                return;
            }
            if ((event.target.files.length + this.numberofAttachments) > 9) {
                let resultObj3 = {
                    type: 'danger',
                    msg: '最多上传九个文件'
                };
                this.results.emit(resultObj3);
                whetherupload = false;
                return;
            }
            this.formData.append('file', event.target.files[i]);
        }
        // 图片验证
        // 上传过程
        if (whetherupload) {
            this.loaderService.show();
            this.requestImage();
        }
    }

    /**
     *
     * 上传过程
     *
     * @memberof UploadAttachmentsComponent
     */
    requestImage() {
        this.isUpload = true;
        jQuery.ajax({
            url: this.baseUrl + this.url,
            type: 'POST',
            beforeSend: (xhr) => {
                xhr.setRequestHeader('Authorization', 'bearer ' + this.token.access_token);
                xhr.setRequestHeader('company_id', this.token.user.currentCompany.id);
                xhr.setRequestHeader('accountbook_id', this.token.currentAccount ? this.token.currentAccount.id : '');
            },
            data: this.formData,
            mimeType: 'multipart/form-data',
            contentType: false,
            cache: false,
            processData: false,
            success: (data, textStatus, jqXHR) => {
                // 如果不是上传营业执照就去替换url
                if (this.url !== '/api/v1/accountbook/upload') {
                    data = this.replaceTheURL(data);
                    console.log(data);
                    this.success.emit(this.dataList);
                } else {
                    this.success.emit(data);
                }
                this.loaderService.hide();
                let resultObj = {
                    type: 'success',
                    msg: '上传成功！'
                };
                this.results.emit(resultObj);
                this.clearValue();
                this.formData = new FormData();
                this.isUpload = false;
            },
            error: (jqXHR, textStatus, errorThrown) => {
                this.loaderService.hide();
                let resultObj = {
                    type: 'danger',
                    msg: JSON.parse(jqXHR.responseText).errors[0]
                };
                this.results.emit(resultObj);
                this.formData = new FormData();
                this.isUpload = false;
            }
        });
    }

    // 删除图片
    Deleteattachment(x) {
        // 根据ID删除某个图
        for (let i = 0; i < this.dataList.length; i++) {
            if (this.dataList[i].id === x) {
                this.dataList.splice(i, 1);
            }
        }
        this.success.emit(this.dataList);

    }

    // 查看图片
    displayAttachment(itemId) {
        this.preview.emit(itemId);
    }

    // 替换URL
    replaceTheURL(data) {
        let temp: Array<any> = JSON.parse(data);
        // 匹配最后一个小数点后面的内容 加上—_s 再去替换
        let re = /\.[^\.]+\s*?$/i;
        for (let i = 0; temp.length > i; i++) {

            let e = temp[i].url.match(re);
            let f = '_s' + e[0];
            // let b = this.cacheImage[0].url.replace(re, f);
            temp[i].surl = temp[i].url.replace(re, f);

        }
        // 替换URL
        for (let i = 0; i < temp.length; i++) {
            this.dataList.push(temp[i]);
        }
        return temp;

    }

    // 清除value
    clearValue() {
        jQuery('#fileUploadBtn').val('');
        jQuery('#uploadBtn').val('');
        jQuery('#uploadBtn1').val('');
        jQuery('#uploadBtn2').val('');

    }

    clear() {
        this.url = '';
    }


}
