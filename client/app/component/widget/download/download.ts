import { Component, Input, Optional, Inject, Output, EventEmitter } from '@angular/core';
import { StorageService } from '../../../service/core';
import {
    Http, Headers, RequestOptionsArgs, Response, URLSearchParams,
    RequestMethod
} from '@angular/http';
import 'rxjs/Rx';


import { ACCOUNTING_BASE_PATH } from '../../../api/accounting';
import { AuthorizationService } from '../../../service/core';
declare var FileSaver: any;

@Component({
    selector: 'download',
    templateUrl: 'download.html'
})
export class DownloadWidget {
    @Input() url: string;
    @Input() isdisabled: boolean;
    @Output() confirmEvent = new EventEmitter<any>();
    isDisabled: boolean = false;
    browserUserAgent: string;

    baseUrl: string;
    constructor( @Optional() @Inject(ACCOUNTING_BASE_PATH) baseUrl: string,
        private storageService: StorageService, private http: Http, private authorizationService: AuthorizationService) {
        this.browserUserAgent = this.authorizationService.DetectionUA();
        if (baseUrl) {
            this.baseUrl = baseUrl;
        }
    }
    ngOnInit() {
        console.log('download ngOnInit', this.url, this.isdisabled);

        //                            _ooOoo_  
        //                           o8888888o  
        //                           88" . "88  
        //                           (| -_- |)  
        //                            O\ = /O  
        //                        ____/`---'\____  
        //                      .   ' \\| |// `.  
        //                       / \\||| : |||// \  
        //                     / _||||| -:- |||||- \  
        //                       | | \\\ - /// | |  
        //                     | \_| ''\---/'' | |  
        //                      \ .-\__ `-` ___/-. /  
        //                   ___`. .' /--.--\ `. . __  
        //                ."" '< `.___\_<|>_/___.' >'"".  
        //               | | : `- \`.;`\ _ /`;.`/ - ` : | |  
        //                 \ \ `-. \_ __\ /__ _/ .-` / /  
        //         ======`-.____`-.___\_____/___.-`____.-'======  
        //                            `=---='  
        //  
        //         .............................................  
        //                  佛祖保佑             永无BUG 
        //                  奇葩转换             类型不明
    }

    downloadFile() {
        const path = this.baseUrl + this.url;
        let queryParameters = new URLSearchParams();
        let header: Headers = new Headers();
        let headerParams = header;
        let requestOptions: RequestOptionsArgs = {
            method: RequestMethod.Get,
            headers: headerParams,
            search: queryParameters
        };
        return this.http.request(path, requestOptions)
            .map((response: Response) => response.json())
            .toPromise()
            .then(data => {
                let elemIF = document.createElement('iframe');
                elemIF.src = data;
                elemIF.style.display = 'none';
                document.body.appendChild(elemIF);
            },
            error => {
                throw error;
            });
    }
}
