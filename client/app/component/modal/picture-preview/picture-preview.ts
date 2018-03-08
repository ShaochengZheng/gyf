import { Component, ViewChild, Inject, Optional, Input, Output, EventEmitter } from '@angular/core';
import { StorageService } from '../../../service/core';
import { ACCOUNTING_BASE_PATH } from '../../../api/accounting';
declare var FileSaver: any;

@Component({
    selector: 'gpw-picture-preview-modal',
    templateUrl: './picture-preview.html',
    styleUrls: ['./picture-preview.scss'],
})
export class PicturePreviewModal {
    @ViewChild('modal') public modal;
    @Input() type: string = 'receivable';
    // 图片列表更新
    @Output() update = new EventEmitter();
    cacheImage: Array<any> = [];
    imageshow: boolean = false;
    imgurl: string;
    imgid: string;
    url: string;
    baseUrl: string;
    fileName: string;
    mediaType: string = 'application/octet-stream';
    accountTransactionId: string;
    order: number;
    issava: boolean = false;
    disableDelete: boolean = false;
    constructor(
        private storageService: StorageService, @Optional() @Inject(ACCOUNTING_BASE_PATH) basePath: string) {
        if (basePath) {
            this.baseUrl = basePath;
        }

    }
    /**
     * 图片预览
     * 
     * @param cacheImage 附件list
     * @param id 图片的ID
     * @param accountTransactionId 编辑时这一笔的ID
     * @param disableDelete 是否可以删除
     */
    public show(cacheImage: Array<any>, id: string, accountTransactionId: string, disableDelete?: boolean) {
        console.log(cacheImage, id, accountTransactionId, disableDelete);
        if (cacheImage.length > 0) {
            this.cacheImage = cacheImage;

        } else {

        }
        console.log(accountTransactionId);
        if (disableDelete) {
            this.disableDelete = disableDelete;
        }
        if (accountTransactionId) {
            this.accountTransactionId = accountTransactionId;
            this.issava = true;
        } else {
            this.issava = false;
        }
        this.order = 0;
        for (let i = 0; i < this.cacheImage.length; i++) {
            if (id === this.cacheImage[i].id) {
                this.fileName = this.cacheImage[i].name;
                this.imgurl = this.cacheImage[i].url;
                this.order = i;
                this.imageshow = true;
                this.imgid = id;
            } else {
                // alert('请选择图片');
            }
        }
        this.picturepreview();
        this.modal.show();
    }
    close() {
        this.imageshow = false;
        this.modal.hide();
    }
    ngOnInit() {
    }
    ngOnDestroy() {
    }
    // 删除
    Deleteattachment() {
        let x = this.imgid;
        // 根据ID删除某个图
        for (let i = 0; i < this.cacheImage.length; i++) {
            if (this.cacheImage[i].id === x) {
                this.cacheImage.splice(i, 1);
            }
        }
        // 更新图片列表
        this.update.emit(this.cacheImage);
        // 根据ID删除某个图
        this.close();

    }

    // 下载
    downloadAttachment() {
        console.warn(navigator.userAgent);
        if (this.issava) {
            let token = this.storageService.getToken();

            // Using XMLHttpRequest is a hack until upgrade to RC5.
            let xhr = new XMLHttpRequest();
            let attachmentId = this.imgid;
            // this.url = '/api/v1/account_transaction/' + attachmentId + '/' + this.accountTransactionId + '/watermark';
            this.url = '/api/v1/' + this.type + '/' + attachmentId + '/' + this.accountTransactionId + '/watermark';

            xhr.open('GET', this.baseUrl + this.url, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('Authorization', 'bearer ' + token.access_token);
            xhr.setRequestHeader('company_id', token.user.currentCompany.id);
            xhr.setRequestHeader('accountbook_id', token.currentAccount ? token.currentAccount.id : null);

            xhr.responseType = 'blob';

            // Xhr callback when we get a result back
            // We are not using arrow function because we need the 'this' context
            let that = this;

            xhr.onreadystatechange = function () {
                // If we get an HTTP status OK (200), save the file using fileSaver
                if (xhr.readyState === 4 && xhr.status === 200) {
                    let blob = new Blob([this.response], { type: that.mediaType });
                    // console.log(blob + 'blob');
                    FileSaver.saveAs(blob, that.fileName);
                }
            };

            // Start the Ajax request
            xhr.send();
        } else {
            // 点击直接下载  而不是打开
            let $a = document.createElement('a');
            $a.setAttribute('href', this.imgurl);
            $a.setAttribute('download', '');

            let evObj = document.createEvent('MouseEvents');
            evObj.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, true, false, 0, null);
            $a.dispatchEvent(evObj);
            console.log(this.imgurl);
        }
    }
    // 展示图片
    picturepreview() {
        if (this.issava) {
            let token = this.storageService.getToken();
            // Using XMLHttpRequest is a hack until upgrade to RC5.
            let xhr = new XMLHttpRequest();
            let attachmentId = this.imgid;
            // this.url = '/api/v1/account_transaction/' + attachmentId + '/' + this.accountTransactionId + '/watermark';
            this.url = '/api/v1/' + this.type + '/' + attachmentId + '/' + this.accountTransactionId + '/watermark';
            xhr.open('GET', this.baseUrl + this.url, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('Authorization', 'bearer ' + token.access_token);
            xhr.setRequestHeader('company_id', token.user.currentCompany.id);
            xhr.setRequestHeader('accountbook_id', token.currentAccount ? token.currentAccount.id : null);
            xhr.responseType = 'blob';

            // Xhr callback when we get a result back
            // We are not using arrow function because we need the 'this' context
            // tslint:disable-next-line:no-unused-variable
            let that = this;

            xhr.onload = function () {

                let eleAppend = document.getElementById('imgs');
                if (eleAppend.children.length > 0) {
                    let lis = eleAppend.getElementsByTagName('img');
                    for (let x = 0; x < eleAppend.children.length; x++) {
                        eleAppend.removeChild(lis[x]);

                    }
                }
                if (xhr.status === 200) {
                    let blob = xhr.response;
                    let img = document.createElement('img');
                    img.onload = function (e) {
                        window.URL.revokeObjectURL(img.src); // 清除释放
                    };
                    // img.setAttribute('class', 'picture-preview');
                    img.style.display = 'block';
                    img.style.maxWidth = '100%';
                    img.style.margin = '15px auto';
                    img.style.maxHeight = '600px';

                    img.src = window.URL.createObjectURL(blob);

                    eleAppend.appendChild(img);
                }
            };
            // Start the Ajax request
            xhr.send();
        } else {
            this.imgurl = this.cacheImage[this.order].url;
            console.log(this.imgurl);
        }

    }

    //
    // 上一页
    previous() {

        if (this.order < this.cacheImage.length && this.order >= 1) {
            --this.order;
            this.order = Math.abs(this.order);
            // console.log(this.order);
            this.imgid = this.cacheImage[this.order].id;
            this.picturepreview();
        } else {
            // 又变成到底不能点击了
            // this.order = this.cacheImage.length - 1;
            // console.log(this.order);
            // this.imgid = this.cacheImage[this.order].id;
            // this.picturepreview();
        }
    }
    // 下一页
    next() {
        if (this.order + 1 < this.cacheImage.length) {
            ++this.order;
            this.order = Math.abs(this.order);
            // console.log(this.order);
            this.imgid = this.cacheImage[this.order].id;
            this.picturepreview();
        } else {
            // this.order = 0;
            // console.log(this.order);
            // this.imgid = this.cacheImage[this.order].id;
            // this.picturepreview();
        }

    }

}
