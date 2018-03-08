import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StorageService } from '../../../../service/core/storage';
import { AccountApi } from '../../../../api/identity/api/AccountApi';
import { ActiveUser } from '../../../../api/identity/model/ActiveUser';
import { FormValidator } from '../../../../service/validators';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { AuthorizationService } from '../../../../service/core';

@Component({
    selector: 'link-setpw',
    host: {
        class: 'gray-lightest-bg full-height'
    },
    templateUrl: './link-setpw.html',
    styleUrls: ['./link-setpw.scss'],
    providers: [AccountApi]
})
export class LinkSetPasswordComponent {
    passwordfocus = false;
    setPwForm: FormGroup;
    params: any;
    companyId: string;
    userId: string;
    submitAttemp: boolean = false;
    user: any = {
        id: '',
        phoneNumber: '',
        email: ''
    };
    activeUserModel: ActiveUser = {
        userId: '',
        companyId: '',
        newPassword: ''
    };
    alert: Object = {};
    constructor(fb: FormBuilder, private location: Location, private router: Router, private activatedRoute: ActivatedRoute,
        private accountApi: AccountApi, private storageService: StorageService, private authorizationService: AuthorizationService) {
        this.setPwForm = fb.group({
            'password': ['', Validators.compose([Validators.required, FormValidator.hasLetterValidator,
            FormValidator.hasNumberValidator, FormValidator.shortValidator, FormValidator.illegalCharValidator])],
            'confirmPassword': ['', Validators.compose([Validators.required])]
        }, { 'validator': FormValidator.matchingPasswords('password', 'confirmPassword') });
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

    ngOnInit() {


        this.activeUserModel.companyId = this.activatedRoute.snapshot.params['companyId'];
        this.activeUserModel.userId = this.activatedRoute.snapshot.params['userId'];
        this.checkUrl();
    }


    onpasswordfocus() {
        this.passwordfocus = true;
    }


    activateUser() {
        this.submitAttemp = true;
        console.log(this.activeUserModel);
        if (this.setPwForm.valid) {
            console.log(this.setPwForm.valid);
            this.accountApi.accountActiveUser(this.activeUserModel)
                .subscribe(
                (data) => {
                    this.alertSuccess('设置密码成功！请使用手机号登录');
                    setTimeout(() => { this.router.navigate(['/login']); }, 3000);
                },
                (error) => {
                    this.alertDanger('哎呀！出了点问题，不妨再试试');
                });
        }
    }
    // 检查链接可用
    checkUrl() {
        this.accountApi.accountIsActivated(this.activeUserModel.userId, this.activeUserModel.companyId, 'GuanYouZhang')
            .subscribe(
            (data) => {

                // 设置token
                let temp = data;
                temp.user.companies = null;
                this.authorizationService.activation(temp);
            },
            (error) => {
                this.alertDanger(error);
            });
    }

}
