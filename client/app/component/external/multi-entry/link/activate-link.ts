import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { AccountApi } from '../../../../api/identity/api/AccountApi';
import { AuthorizationService } from '../../../../service/core';
import { StorageService } from '../../../../service/core/storage';
import { LoginModel } from '../../../../api/identity/model/LoginModel';

@Component({
    selector: 'activate-link',
    host: {
        class: 'gray-lightest-bg full-height'
    },
    templateUrl: './activate-link.html',
    styleUrls: ['./activate-link.scss'],
    providers: [AccountApi, StorageService]

})
export class ActivateLinkComponent {
    model: any = {
        userId: '',
        companyId: '',
        newPassword: ''
    };
    confirmURL: boolean = false;
    confirmActivation: boolean;

    constructor(private location: Location, private accountApi: AccountApi, private router: Router,
        private storageService: StorageService, private authorizationService: AuthorizationService) {

    };
    ngOnInit() {
        this.model.userId = this.getUrlParam('userId');
        this.model.companyId = this.getUrlParam('companyId');
        this.checkUrl();

        // console.log(this.model);


    }
    // 获取url参数 之后直接激活账户 
    getUrlParam(key) {
        let path = this.location.path();
        if (path.indexOf('%') >= 0) {// 为了解决手机邀请连接问题
            path = path.split('%')[0];
        }
        if (path.indexOf('?') >= 0) {
            let params = path.split('?')[1];
            let paramsObj: Object = {};
            let paramList = params.split('&');
            paramList.forEach(element => {
                let id = element.split('=')[0];
                let value = element.split('=')[1];
                paramsObj[id] = value;
            });
            // console.log(paramsObj);
            return paramsObj[key];
        } else {
            return null;
        }
    }
    // 检查链接可用并激活
    checkUrl() {
        this.accountApi.accountIsActivated(this.model.userId, this.model.companyId, 'GuanYouZhang')
            .subscribe(
            (data) => {

                // 设置token
                let temp = data;
                temp.user.companies = null;

                if (temp.user.isActivated) {
                    this.confirmURL = true;
                    this.authorizationService.setSession(temp);

                    // 激活账户
                    this.accountApi.accountActiveExistUser(this.model).subscribe(
                        (activeData) => {
                            this.authorizationService.switchCompany(this.model.companyId);
                        },
                        (error) => {

                        }
                    );
                } else {
                    this.router.navigate(['/link-setpw', { userId: this.model.userId, companyId: this.model.companyId }]);
                }
            },
            (error) => {
                this.confirmURL = false;
            });
    }

}
