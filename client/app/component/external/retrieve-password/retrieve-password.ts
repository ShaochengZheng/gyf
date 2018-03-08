import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { FormValidator } from '../../../service/validators';
import { AccountApi } from '../../../api/identity/api/AccountApi';
import { ForgetPasswordModel } from '../../../api/identity/model/ForgetPasswordModel';



@Component({
    selector: 'retrieve-password',
    host: {
        class: 'gray-lightest-bg full-height'
    },
    templateUrl: './retrieve-password.html',
    styleUrls: ['./retrieve-password.scss']
})
export class RetrievePasswordComponent {
    @Input() placeholder: Array<string> = ['请输入手机号', '新密码', '确认新密码'];
    forgetPasswordModel: ForgetPasswordModel = {
        phoneOrEmail: '',
        password: '',
        verifyCodeMessage: '',
    };

    myForm: FormGroup;
    codeGetted = false;
    regetCode = false;
    inputBlur = false;
    hasRegisted = true;
    passwordfocus = false;
    verifyCode: string;
    errorMessage = '啊呀，出现错误了，不妨重新试试';
    countdown = 60;
    alert: Object = {};
    transmittedName: string;
    source: string;
    constructor(private route: ActivatedRoute, private router: Router, fb: FormBuilder,
        private accountApi: AccountApi) {
        this.myForm = fb.group({
            'phoneOrEmail': ['', Validators.compose([Validators.required, FormValidator.phoneValidator])],
            'vericode': ['', Validators.compose([Validators.required])],
            'password': ['', Validators.compose([Validators.required, FormValidator.hasLetterValidator,
            FormValidator.hasNumberValidator, FormValidator.shortValidator, FormValidator.illegalCharValidator])],
            'confirmPassword': ['', Validators.compose([Validators.required])]
        }, { validator: FormValidator.matchingPasswords('password', 'confirmPassword') });
    }
    ngOnInit() {
        this.source = this.route.snapshot.params['source'];
        if (this.source === 'dingding') {
            this.placeholder = ['钉钉账号', '设置密码', '确认密码'];
        }
        this.transmittedName = this.route.snapshot.params['name'] ? this.route.snapshot.params['name'] : '';
        if (this.transmittedName === undefined || this.transmittedName === 'undefined' || this.transmittedName === '') {
            this.transmittedName = '';

        } else {
            this.myForm.value.phoneOrEmail = this.transmittedName;
            this.blur();
        }
    }
    public alertDanger(msg: string) {
        this.alert = { type: 'danger', msg: msg };
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
                    this.hasRegisted = data.value;

                },
                error => {
                }
                );
        }
    }
    enter() {
        this.inputBlur = false;
        this.hasRegisted = true;
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
                if (!this.myForm.controls['phoneOrEmail'].valid || !this.hasRegisted) {
                    this.inputBlur = true;
                    return;
                } else {
                    this.codeGetted = true;
                    let that = this;
                    let setCountdown = setInterval(
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

                    this.accountApi.accountSendVerifyCode(this.myForm.value.phoneOrEmail, 'FORGETPASSWORD')
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
            } );
    }


    onSubmit() {
        this.forgetPasswordModel.phoneOrEmail = this.myForm.value.phoneOrEmail;
        this.forgetPasswordModel.password = this.myForm.value.password;
        this.forgetPasswordModel.verifyCodeMessage = this.myForm.value.vericode;
        console.log(JSON.stringify(this.myForm.value));
        this.accountApi.accountForgetPassword(this.forgetPasswordModel)
            .subscribe(
            data => {
                console.log(data);
                this.router.navigate(['/login']);
            },
            error => {
                this.errorMessage = error;
                this.alertDanger(this.errorMessage);
            }
            );
    }
}
