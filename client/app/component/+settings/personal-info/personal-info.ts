import { Component, ChangeDetectorRef} from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { UserApi } from '../../../api/accounting/api/UserApi';
import { AccountApi } from '../../../api/identity/api/AccountApi';
import { OperationModeEnum } from '../../../service/core/core';
import { StorageService, AuthorizationService } from '../../../service/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormValidator } from '../../../service/validators';
// import { DepartmentApi } from '../../../api/accounting/api/DepartmentApi';
import { UserModel } from '../../../api/accounting/model/UserModel';
import { RoleModels } from '../../../service/core/extended-interface';
import { PubSubService, EventType } from '../../../service/pubsub.service';
import { Subscription } from 'rxjs/Subscription';

import * as _ from 'lodash';

@Component({
    selector: 'personal-info',
    templateUrl: './personal-info.html',
    styleUrls: ['./personal-info.scss'],
    providers: [UserApi, AccountApi]
})
export class PersonalInfoComponent {
    subscription: Subscription;
    alert: Object = {};
    currentUser: any;
    userModel: UserModel = {
        code: '',
        name: '',
        email: '',
        phoneNumber: '',
        position: '',
        roles: [{
            id: '',
            name: ''
        }]

    };
    changeEmailModel: any = {
        userId: '',
        verifyCode: '',
        email: '',
        password: ''
    };
    changePasswordModel: any = {
        userId: '',
        oldPassword: '',
        newPassword: ''
    };

    changePhoneNumber: any = {
        userId: '',
        verifyCode: '',
        phoneNumber: '',
        password: ''
    };

    accountForm: FormGroup;
    passwordfocus = false;
    errorMessage = '呀，出现错误了，不妨重新试试';
    public departmentItems: Array<Object> = [];
    isBasicEdit: boolean = false;
    isEmailEdit: boolean = false;
    isPasswordEdit: boolean = false;
    editName: boolean = false;
    existEmail: boolean = false;
    existPhone: boolean = false;
    adminEditUser: boolean = false;
    codeGetted = false;
    regetCode = false;
    countdown = 60;
    hasRegisted = false;
    isPhoneEdit = false;
    e2eVerifyCode;
    constructor(private userApi: UserApi, private accountApi: AccountApi, fb: FormBuilder, private pubSubService: PubSubService,
         private authorizationService: AuthorizationService, private storageService: StorageService, private CDRef:ChangeDetectorRef,
        private router:Router, private location:Location) {
        this.accountForm = fb.group({
            'email': ['', Validators.compose([Validators.required, FormValidator.emailValidator])],
            'verifyCode': ['', Validators.compose([Validators.required])],
            'password': ['', Validators.compose([Validators.required])],
            'phoneNumber': ['', Validators.compose([Validators.required, FormValidator.phoneValidator])],
            'oldPassword': ['', Validators.compose([Validators.required])],
            'newPassword': ['', Validators.compose([Validators.required, FormValidator.hasLetterValidator,
            FormValidator.hasNumberValidator, FormValidator.shortValidator, FormValidator.illegalCharValidator])],
            'confirmPassword': ['', Validators.compose([Validators.required])]
        }, { validator: FormValidator.matchingPasswords('newPassword', 'confirmPassword') });
    }
    ngOnInit() {
        this.currentUser = this.authorizationService.Session.user;
        this.changeEmailModel.userId = this.currentUser.id;
        this.changePasswordModel.userId = this.currentUser.id;
        this.changePhoneNumber.userId = this.currentUser.id;
        console.log(this.currentUser.email);
        if (this.currentUser.email !== null && this.currentUser.email !== '' && this.currentUser.email !== undefined) {
            this.existEmail = true;
        } else {
            this.existEmail = false;
        }
        if (this.currentUser.phoneNumber !== null && this.currentUser.phoneNumber !== '' && this.currentUser.phoneNumber !== undefined) {
            this.existPhone = true;
        } else {
            this.existPhone = false;
        }
    }
    public alertDanger(msg: string) {
        this.alert = { type: 'danger', msg: msg };
    }

    public alertSuccess(msg: string) {
        this.clearAlert();
        setTimeout(() => { this.alert = { type: 'success', msg: msg }; }, 0);
    }

    public clearAlert(): void {
        this.alert = {};
    }
    cancelEditEmail() {
        this.clearAlert();
        this.isEmailEdit = false;
        this.regetCode = false;
        this.codeGetted = false;
        this.changeEmailModel.email = '';
        this.changeEmailModel.verifyCode = '';
        this.changeEmailModel.password = '';
        this.accountForm.controls['email'].markAsUntouched();
        this.accountForm.controls['verifyCode'].markAsUntouched();
        this.accountForm.controls['password'].markAsUntouched();
        this.CDRef.detectChanges();
    }
    cancelEditPassword() {
        this.clearAlert();
        this.isPasswordEdit = false;
        this.changePasswordModel.oldPassword = '';
        this.changePasswordModel.newPassword = '';
        this.changePasswordModel.confirmPassword = '';
        this.accountForm.controls['oldPassword'].markAsUntouched();
        this.accountForm.controls['newPassword'].markAsUntouched();
        this.accountForm.controls['confirmPassword'].markAsUntouched();
        this.CDRef.detectChanges();
    }
    
    cancelEditPhone() {
        this.clearAlert();
        this.hasRegisted = false;
        this.isPhoneEdit = false;
        this.regetCode = false;
        this.codeGetted = false;
        this.changePhoneNumber.phoneNumber = '';
        this.changePhoneNumber.verifyCode = '';
        this.changePhoneNumber.password = '';
        this.accountForm.controls['phoneNumber'].markAsUntouched();
        this.accountForm.controls['verifyCode'].markAsUntouched();
        this.accountForm.controls['password'].markAsUntouched();
        this.CDRef.detectChanges();
    }
    showEditPhone() {
        this.isPhoneEdit = true;
        this.cancelEditEmail();
    }
    
    showEditEmail() {
        this.isEmailEdit = true;
        this.cancelEditPassword();
        this.cancelEditPhone();
    }
    showEditPassword() {
        this.isPasswordEdit = true;
        this.cancelEditEmail();
        this.cancelEditPhone();
    }

    getUserInfo(id) {
        this.userApi.userGet(id)
            .subscribe(
            (data) => {
                data.roles = this.userModel.roles;
                this.userModel = data;
                if (this.userModel.email !== null && this.userModel.email !== '' && this.userModel.email !== undefined) {
                    this.existEmail = true;
                } else {
                    this.existEmail = false;
                }
            },
            (error) => {

            });
    }
    
    getVerifyCode(phoneOrEmail, channel) {
        this.accountApi.accountGet(phoneOrEmail)
            .subscribe(
            data => {
                this.hasRegisted = data.value;
                if ((!this.accountForm.controls['email'].valid || !this.accountForm.controls['phoneNumber'].valid) && this.hasRegisted) {
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
                    this.accountApi.accountSendVerifyCode(phoneOrEmail, channel)
                        .subscribe(
                        boolResultModel => {
                            if (process.env.environment === 'production') {

                            } else {
                                this.e2eVerifyCode = boolResultModel.key;
                            }
                        },
                        error => {
                            this.errorMessage = error;
                            this.alertDanger(this.errorMessage);
                        }
                        );
                }
            }
            );
    }
    refreshUserSession() {
        let userId = this.authorizationService.Session.user.id;
        // this.getUserInfo(userId);
        this.userApi.userGet(userId).subscribe(
            data => {
                data.roles = this.userModel.roles;
                this.userModel = data;
                if (this.userModel.email !== null && this.userModel.email !== '' && this.userModel.email !== undefined) {
                    this.existEmail = true;
                } else {
                    this.existEmail = false;
                }
                let token = this.authorizationService.Session;
                token.user.name = this.userModel.name;
                this.authorizationService.setSession(token);
                let tokens = this.authorizationService.getSession();
                this.pubSubService.publish({
                    type: EventType.CurrentSession,
                    data: tokens
                });

            },
            error => {
                ;
                this.alertDanger(error);
            }
        );
    }
    // save() {
    //     // 权限名验证
    //     if (this.userModel.roles[0].name === '') {
    //         this.isRole = true;
    //         this.alertDanger('请选择角色');
    //         return;
    //     }
    //     // 姓名
    //     if (!this.userModel.name) {
    //         this.alertDanger('请填写姓名');
    //         return;
    //     }
    //     if (this.userModel.department[0]) {
    //         // 如果都符合就去新增或者修改用户
    //         this.editBasicInfo();
    //     } else {
    //         this.alertDanger('请选择部门');
    //         return;
    //     }
    // }

    

    editEmail() {
        this.accountApi.accountChangeEmail(this.changeEmailModel).subscribe(
            data => {
                this.isEmailEdit = false;
                this.currentUser.email = this.changeEmailModel.email;
                let token = this.storageService.getToken();
                token.user.email = this.currentUser.email;
                this.authorizationService.setSession(token);
                this.getUserInfo(this.currentUser.id);
                if (this.existEmail) {
                    // this.refreshUserSession();
                    this.alertSuccess('修改成功');
                } else {
                    this.alertSuccess('添加成功');
                }
            },
            error => {
                this.errorMessage = error;
                this.alertDanger(this.errorMessage);
            }
        );
    }
    editPhoneNumber() {
        this.accountApi.accountChangePhoneNumber(this.changePhoneNumber).subscribe(
            data => {
                this.isPhoneEdit = false;
                this.currentUser.phoneNumber = this.changePhoneNumber.phoneNumber;
                let token = this.storageService.getToken();
                token.user.phoneNumber = this.currentUser.phoneNumber;
                this.authorizationService.setSession(token);
                this.existPhone = true;
                // this.refreshUserSession();
                this.alertSuccess('添加成功');
            },
            error => {
                this.errorMessage = error;
                this.alertDanger(this.errorMessage);
            }
        );
    }

    onpasswordfocus() {
        this.passwordfocus = true;
    }

    editPassword() {
        this.accountApi.accountChangePassword(this.changePasswordModel).subscribe(
            data => {
                this.isPasswordEdit = false;
                this.ngOnInit();
                this.alertSuccess('修改成功');
                this.cancelEditPassword();
            },
            error => {
                this.errorMessage = error;
                this.alertDanger(this.errorMessage);
            }
        );
    }
    // 返回
    back() {
        this.location.back();
    }
    
}
