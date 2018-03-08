import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import * as _ from 'lodash';

import { FormValidator } from '../../../service/validators';
import { StorageService } from '../../../service/core/storage';
import { AccountApi } from '../../../api/identity/api/AccountApi';
import { RegisterModel } from '../../../api/identity/model/RegisterModel';
import { AuthorizationService } from '../../../service/core';

@Component({
    selector: 'register',
    host: {
        class: 'gray-lightest-bg full-height'
    },
    templateUrl: './register.html',
    styleUrls: ['./register.scss']
})
export class RegisterComponent implements OnInit {
    registerModel: RegisterModel = {
        displayName: '',
        phoneOrEmail: '',
        password: '',
        verifyCode: '',
        source: null,
        campaign: '',
        keyword: '',
        refereeId: '',
        companyName: '',
        code: ''
    };
    verifyCode: string;
    transmittedName: string;
    passwordfocus = false;
    codeGetted = false;
    regetCode = false;
    countdown = 60;
    inputBlur = false;
    hasRegisted = false;
    errorMessage = '呀，出现错误了，不妨重新试试';
    alert: Object = {};
    myForm: FormGroup;

    appCode: string;
    displayInviteCode: boolean = false;
    constructor(private router: Router, fb: FormBuilder, private accountApi: AccountApi,
        private route: Router, private location: Location, private storageService: StorageService,
        private authorizationService: AuthorizationService, private activatedRoute: ActivatedRoute) {
        this.myForm = fb.group({
            'username': ['', Validators.compose([Validators.required, Validators.maxLength(16)])],
            'companyName': ['', Validators.compose([Validators.required, Validators.maxLength(50)])],
            'phoneOrEmail': ['', Validators.compose([Validators.required,
            FormValidator.phoneValidator])],
            'vericode': ['', Validators.compose([Validators.required])],
            'password': ['', Validators.compose([Validators.required,
            FormValidator.hasLetterValidator,
            FormValidator.hasNumberValidator, FormValidator.shortValidator,
            FormValidator.illegalCharValidator])],
            'appCode': ['', Validators.required]
            // 'policy': ['', Validators.compose([Validators.required])],
        });
    }
    public alertDanger(msg: string) {
        this.clearAlert();
        setTimeout(() => {
            this.alert = { type: 'danger', msg: msg };
        }, 0);
    }

    public clearAlert(): void {
        this.alert = {};
    }

    ngOnInit() {
        this.getCid();
        this.registerModel.refereeId = this.activatedRoute.snapshot.params['RefereeId'];
        this.registerModel.code = this.activatedRoute.snapshot.params['Code'];
        this.transmittedName = this.activatedRoute.snapshot.params['name'] ? this.activatedRoute.snapshot.params['name'] : '';
        if (this.transmittedName === undefined || this.transmittedName === 'undefined' || this.transmittedName === '') {
            this.transmittedName = '';
        } else {
            this.myForm.value.phoneOrEmail = this.transmittedName;
            this.blur();
        }
    }

    getCid() {
        const cid = this.getUrlParam('cid') ? this.getUrlParam('cid') : null;
        const cookie1 = this.storageService.getStringToken('cookie1');
        const cookie2 = this.storageService.getStringToken('cookie2');
        this.registerModel.keyword = cookie1 ? cookie1 : null;
        // this.registerModel.campaign = cid ? cid : (cookie2 ? cookie2 : null);
        this.registerModel.campaign = cookie2 ? cookie2 : (cid ? cid : null);
    }

    getUrlParam(key) {
        if (this.location.path().indexOf('?') >= 0) {
            const params = this.location.path().split('?')[1];
            const paramsObj: Object = {};
            const paramList = params.split('&');
            paramList.forEach(element => {
                const id = element.split('=')[0];
                const value = element.split('=')[1];
                paramsObj[id] = value;
            });
            console.log(paramsObj);
            return paramsObj[key];
        } else {
            return null;
        }
    }

    blur() {
        if (!this.myForm.controls['phoneOrEmail'].valid) {
            this.inputBlur = true;
            return;
        } else {
            // check if the account has been registed
            this.accountApi.accountGet(this.myForm.value.phoneOrEmail)
                .subscribe(
                data => {
                    console.log('register', data);
                    this.hasRegisted = data.value;
                },
                error => {
                    console.log('register error', error);
                }
                );
        }
    }
    enter() {
        this.inputBlur = false;
        this.hasRegisted = false;
    }

    onpasswordfocus() {
        this.passwordfocus = true;
    }

    getVerifyCode() {
        if (!this.myForm.value.phoneOrEmail) {
            return;
        }
        this.accountApi.accountGet(this.myForm.value.phoneOrEmail)
            .subscribe(
            data => {
                this.hasRegisted = data.value;
                if (!this.myForm.controls['phoneOrEmail'].valid || this.hasRegisted) {
                    this.inputBlur = true;
                    return;
                } else {
                    this.codeGetted = true;
                    const that = this;
                    const setCountdown = setInterval(
                        function () {
                            that.countdown--;
                            if (that.countdown <= 0) {
                                clearInterval(setCountdown);
                                that.countdown = 60;
                                that.codeGetted = false;
                                that.regetCode = true;
                            }
                        }, 1000
                    );

                    this.accountApi.accountSendVerifyCode(this.myForm.value.phoneOrEmail, 'REGISTER')
                        .subscribe(
                        boolResultModel => {
                            console.log(boolResultModel);

                            console.log(process.env.environment);
                            if (process.env.environment === 'production') {

                            } else {
                                this.verifyCode = boolResultModel.key;
                            }
                        },
                        error => {
                            this.errorMessage = error;
                            this.alertDanger(this.errorMessage);
                        }
                        );
                }
            },
            error => {
            }
            );
    }


    onSubmit() {
        this.registerModel.displayName = this.myForm.value.username;
        this.registerModel.phoneOrEmail = this.myForm.value.phoneOrEmail;
        this.registerModel.password = this.myForm.value.password;
        this.registerModel.verifyCode = this.myForm.value.vericode;
        this.registerModel.companyName = this.myForm.value.companyName;

        this.registerModel.appCode = this.myForm.value.appCode;

        this.accountApi.accountRegister(this.registerModel)
            .subscribe(
            data => {
                const dataTemp: any = _.cloneDeep(data);
                dataTemp.user.companies = null;
                this.authorizationService.activation(dataTemp);
                const session = this.storageService.getToken();
                console.log('login =>', JSON.stringify(session));
                session.role = 'Manager';
                this.authorizationService.setSession(session);
                this.router.navigate(['create-ways']);
            },
            error => {
                this.errorMessage = error;
                this.alertDanger(this.errorMessage);
            }
            );
    }

    check() {
        this.appCode = '';
        if (this.displayInviteCode) {
            this.displayInviteCode = false;
        } else {
            this.displayInviteCode = true;
        }
    }
}
