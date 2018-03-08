import { FormValidator } from './../../../service/validators';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, AbstractControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { StorageService } from '../../../service/core/storage';
import { AuthorizationService } from '../../../service/core';
import { AccountBookApi } from '../../../api/accounting/api/AccountBookApi';
import { UserApi } from '../../../api/accounting/api/UserApi';
import { LoginModel } from '../../../api/identity/model/LoginModel';
import * as _ from 'lodash';

declare var $: any;
@Component({
    selector: 'login',
    // tslint:disable-next-line:use-host-property-decorator
    host: {
        class: 'gray-lightest-bg full-height'
    },
    templateUrl: './login.html',
    styleUrls: ['./login.scss'],
    providers: [AccountBookApi, UserApi]
})
export class LoginComponent {
    loginModel = {
        username: '13581701217',
        password: 'Qq123456',
        application: LoginModel.ApplicationEnum.GuanYouZhang,
    };
    myForm: FormGroup;
    captchaSrc = '/captcha.png';
    name: AbstractControl;
    pass: AbstractControl;
    captcha: AbstractControl;
    validpass3: boolean = false;
    submitAttempt: boolean = false;
    correctCaptcha: boolean = false;
    wrongCaptcha: boolean = false;
    countPass: number;
    errorMessage: string;
    transmittedName: string;
    username: string;
    isCreate: boolean = false;
    token: any;

    alert: Object = {};
    config: any;
    constructor(private userApi: UserApi, private accountBookApi: AccountBookApi, fb: FormBuilder, private router: Router,
        private storageService: StorageService, private authorizationService: AuthorizationService,
        private activatedRoute: ActivatedRoute) {
        // 进入Login删除session
        authorizationService.logout();
        this.config = authorizationService.Config;
        this.myForm = fb.group({
            'name': ['', Validators.compose([Validators.required, FormValidator.phoneValidator])],
            'pass': ['', Validators.required],
            'captcha': ['', Validators.required]
        });
        this.name = this.myForm.controls['name'];
        this.pass = this.myForm.controls['pass'];
        this.captcha = this.myForm.controls['captcha'];
        this.countPass = 0;
        this.errorMessage = '登录失败，用户名／手机错误';
    }


    // 判断帐套列表是否存在
    getCompanyList() {
        console.count('登入获取帐套：');
        this.accountBookApi.accountBookGet()
            .subscribe(
            data => {
                console.log('lishidiinvoice', data);
                //   如果是管理员并且没有帐套存在，则进入创建账套界面
                if (data.list.length === 0) {
                    this.isCreate = true;
                    this.router.navigate(['create-ways']);
                } else {
                    this.isCreate = false;
                    this.router.navigate(['app/company-list']);
                }
            },
            error => {
                console.log('login登入获取帐套', error);
                this.alertDanger(error);
            }
            );
    }
    public alertDanger(msg: string) {
        setTimeout(() => {
            this.alert = { type: 'danger', msg: msg };
        }, 0);
    }

    public clearAlert(): void {
        this.alert = {};
    }

    ngOnInit() {
        this.authorizationService.logout();
        const name = this.activatedRoute.snapshot.params['name'];
        if (name !== '' && name !== undefined && name !== 'undefined') {
            this.transmittedName = name;
            this.myForm.value.name = this.transmittedName;
        }
    }

    // 验证码地址生成
    reloadCaptcha() {
        this.captchaSrc = '/captcha.png?r=' + Math.random();
    }


    // 登入
    save() {

        this.clearAlert();
        this.loginModel.username = this.myForm.value.name.trim();
        this.loginModel.password = this.myForm.value.pass;
        if (!this.loginModel.username || !this.loginModel.password) {
            return;
        }
        if (this.myForm.value.captcha) {
            this.onSubmit();
        }

        this.authorizationService.login(this.loginModel)
            .then(
            l => {
                console.log('l', l);
                this.token = this.authorizationService.getSession();
                this.userApi.userGetRoles().subscribe(
                    roleModel => {

                        if (roleModel && roleModel.length > 0) {
                            const roleList = [];
                            roleModel.forEach((item) => {
                                roleList.push(item.roleType);
                            });
                            console.log('roleList', roleList);
                            console.log('roleList.indexOf', roleList.indexOf('Account'));
                            if (window.screen.width < 768 && this.config.mobileWeb.redirectEnabled) {
                                window.location.href = this.config.mobileWeb.url + '/app';
                            } else if (_.includes(roleList, 'Manager')) {
                                this.setRole('Manager');
                                this.getCompanyList();
                                // 如果是会计进入会计帐套列表
                            } else if (_.includes(roleList, 'Account')) {
                                this.setRole('Account');
                                this.router.navigate(['app/company-list']);
                                // 如果是助理进入助理帐套列表
                            } else if (_.includes(roleList, 'Assistant')) {
                                this.setRole('Assistant');
                                this.router.navigate(['app/company-list']);
                                // 如果被停用了 那么可以进入系统但是看不到数据
                            } else {
                                this.router.navigate(['app/company-list', { list: 'nodata' }]);
                            }
                        } else {
                            console.error('没有对应权限');
                        }
                    },
                    error => {
                        console.error(error);
                        // this.al
                    }
                );
            })
            .catch(req => {
                //  this.errorMessage = JSON.parse(req._body).errors;
                this.alertDanger(req);
                console.log('error', this.errorMessage);
                this.validpass3 = true;
                if (this.errorMessage !== '此用户不存在') {
                    this.countPass++;
                    console.warn(this.countPass);
                }
                if (this.countPass === 3) {
                    this.submitAttempt = true;
                }
            });
    }

    setRole(role) {
        this.token.role = role;
        this.authorizationService.setSession(this.token);
        console.log('this.authorizationService.getSession(this.token)', this.authorizationService.getSession());
    }

    getRoles() {
        this.userApi.userGetRoles().subscribe(
            roleModel => {
                if (roleModel.length > 0) {
                    this.token.user.roleNew = roleModel;
                    this.authorizationService.setSession(this.token);
                    const roleList = roleModel.filter((item => {
                        return item.name;
                    }));
                    console.log('roleList', roleList);
                } else {
                    console.error('没有对应权限');
                }
            },
            error => {
                console.error(error);
            }
        );
    }
    // 验证码
    onSubmit() {
        if (this.myForm.value.captcha.length === 4) {
            this.authorizationService.captcha({ 'captcha': this.myForm.value.captcha })
                .subscribe(
                data => {
                    const status: any = data;
                    if (status.result) {
                        this.correctCaptcha = true;
                        this.wrongCaptcha = false;
                    } else {
                        this.wrongCaptcha = true;
                        this.correctCaptcha = false;
                        this.reloadCaptcha();
                    }
                },
                error => {
                    console.log('error', error);
                    this.router.navigate(['/login']);
                });
        }
    }

    caculateSum() {
        console.log('caculateSum aaaaa=>');
    }

}
