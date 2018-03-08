import { Component, ViewChild, Output, EventEmitter, Input, ViewChildren, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';

import * as _ from 'lodash';

// import { DepartmentApi } from '../../../api/accounting/api/DepartmentApi';
import { UserApi } from '../../../api/accounting/api/UserApi';
import { UserModel } from '../../../api/accounting/model/UserModel';
import { RoleModel } from '../../../api/accounting/model/RoleModel';
import { AccountBookAssignModel } from '../../../api/accounting//model/AccountBookAssignModel'

import { OperationModeEnum } from '../../../service/core/core';
import { StorageService, AuthorizationService } from '../../../service/core';
import { FormValidator } from '../../../service/validators';
import { RoleModels } from '../../../service/core/extended-interface';
import { AccountBookApi } from '../../../api/accounting/api/AccountBookApi';


@Component({
    selector: 'gpw-invite-user-new-modal',
    templateUrl: './invite-user-new.html',
    styleUrls: ['./invite-user-new.scss'],
    providers: [UserApi, AccountBookApi]
})
export class InviteUserNewModal {
    @Input() modalTitle: string = '选择/邀请用户';
    @Input() confirmText: string = '确定选择';
    // account：会计 ／／ assistant:助理 ／／ both 二选一
    @Input() type: string;
    @Input() isSetting: boolean = false;
    //
    @Input() modalContent: string = '是否替换当前用户？';
    @Input() companyId: string;

    public departmentItems: Array<Object> = [];
    @ViewChild('modal') public modal;
    @ViewChildren('input') public input;
    @Output() success = new EventEmitter();
    @Output() result = new EventEmitter();

    userList: any = [];
    nameItems: Array<Object> = [{ id: 'contact', text: '+新增用户' }];
    names = [];
    currentName: any = [];

    roleList: Array<Object> = [
        { id: '1', text: '会计' },
        { id: '2', text: '助理' }];
    roles = [{ id: '1', text: '会计' }];
    initUser: UserModel = {
        id: '',
        code: '',
        name: '',
        phoneNumber: '',
        accountBookId: '',
        roles: [{
            id: '',
            name: '',
            roleType: RoleModel.RoleTypeEnum.Account,
            isEnabled: true
        }],
    };

    user: any = _.cloneDeep(this.initUser);

    isRole: boolean = false;
    inviteUserForm: FormGroup;
    phoneNumber: AbstractControl;
    name: AbstractControl;
    submitAttempt = false;
    clearHint = false;
    update = false;
    newInput: boolean = false;
    disablePhoneEmail = false;
    exactRole: boolean = false;
    placeRole: string = '会计';

    public alerts: any = [];
    public alertSuccess(msg: string) {
        this.clearAlert();
        this.alerts = [{ type: 'success', msg: msg }];
        this.alerts = this.alerts.map((alert: any) => Object.assign({}, alert));
        this.ref.detectChanges();
        // setTimeout(() => { this.alert = { type: 'success', msg: msg }; }, 0);
    }
    public alertDanger(msg: string) {
        this.clearAlert();
        this.alerts = [{ type: 'danger', msg: msg }];
        this.alerts = this.alerts.map((alert: any) => Object.assign({}, alert));
        // setTimeout(() => { this.alert = { type: 'danger', msg: msg };}, 0 );
        this.ref.detectChanges();
    }
    public addAlert(alert: Object): void {
        this.clearAlert();
        this.alerts = [alert];
    }
    public clearAlert(): void {
        this.alerts = [];
    }

    onShown() {
        // this.input.first.nativeElement.focus();
    }

    constructor(fb: FormBuilder, private router: Router, private userApi: UserApi, private ref: ChangeDetectorRef,
        private accountBookApi: AccountBookApi, private authorizationService: AuthorizationService, private storageService: StorageService) {
        this.inviteUserForm = fb.group({
            'phoneNumber': ['', Validators.compose([Validators.required, FormValidator.phoneValidator])],
            'name': ['', Validators.required],
        });
        this.phoneNumber = this.inviteUserForm.controls['phoneNumber'];
        this.name = this.inviteUserForm.controls['name'];

    }

    ngOnInit() {
        if (this.storageService.getToken().currentAccount) {
            this.companyId = this.storageService.getToken().currentAccount.id;
        }
        this.names = [];

    }
    // 获取所有用户
    getAllUsers() {
        this.userApi.userGetAll()
            .subscribe(
            (data) => {
                this.userList = _.cloneDeep(data);
                if (this.userList !== null) {
                    let tempName = [];
                    _.forEach(this.userList, (item) => {
                        tempName.push({ id: item.id, text: item.name });
                    });
                    tempName.unshift({ id: 'contact', text: '+新增用户' });
                    this.nameItems = tempName;
                    console.log('this.getAllUsers.<----->', (data), (this.nameItems));
                }
            }, (error) => {
                this.alertDanger(error);
            });

    }
    // 清除姓名
    removedName(args) {
        this.user.name = '';
        this.user.phoneNumber = '';
        this.user.id = '';
        this.names = [];
    }
    // 选择姓名
    selectedName(args) {
        console.log('<----selectedName--->', args);
        // this.names = [{ id: args.id, text: args.name }];
        if (args.id === 'contact') {
            this.newInput = true;
            this.user.name = '';
            this.user.phoneNumber = '';
            this.user.id = '';
            this.ref.detectChanges();
            // this.newUser();
        } else {
            _.forEach(this.userList, (item) => {
                if (item.id === args.id) {
                    this.user.name = item.name;
                    this.user.phoneNumber = item.phoneNumber;
                    this.user.id = item.id;
                    console.log('<----selectedName--->item', (this.user), (item));
                }
            });
        }
    }
    selectedRole(args) {
        if (args.name === '会计') {
            this.type = 'account';
            this.user.roles[0].roleType = RoleModel.RoleTypeEnum.Account;
        } else {
            this.type = 'assistant';
            this.user.roles[0].roleType = RoleModel.RoleTypeEnum.Assistant;
        }
    }

    public show(user?) {
        // this.clearData();
        this.clearAlert();
        this.getAllUsers();
        // if (this.isReplace) {
        //     this.user = user;
        // }
        this.names = [];
        if (this.type === 'account') {
            this.exactRole = true;
            this.placeRole = '会计';
            this.user.roles[0].roleType = RoleModel.RoleTypeEnum.Account;
        } else if (this.type === 'assistant') {
            this.exactRole = true;
            this.placeRole = '助理';
            this.user.roles[0].roleType = RoleModel.RoleTypeEnum.Assistant;
        } else {// both
            this.type = 'account';
            this.exactRole = false;
            this.placeRole = '';
        }


        console.log('<---show--->', this.user);
        if (this.storageService.getToken().currentAccount) {
            this.storageService.getToken().currentAccount.id;
        }
        this.modal.show();
    }

    close() {
        this.clearData();
        this.modal.hide();
        this.clearAlert();
    }
    // 清除数据
    clearData() {
        this.user = _.cloneDeep(this.initUser);
        // this.names = [{ id: '', text: '' }];
        this.newInput = false;
        // this.roleList = [];
        this.clearHint = false;
        this.inviteUserForm.reset();
        this.ref.detectChanges();
    }
    // 反选姓名
    phoneNumberInput(args) {
        let temp;
        if (String(args).length === 11) {
            _.forEach(this.userList, (item) => {
                if (item.phoneNumber === args) {
                    temp = item;
                }
            });
        }
        console.log('<---->phoneNumberInput', args, temp);
        if (temp !== undefined) {
            if (this.newInput && temp.id) {
                this.user.name = temp.name;
                this.user.phoneNumber = temp.phoneNumber;
                this.user.id = temp.id;
                return;
            }
        }
        if (!this.newInput) {
            if (temp !== undefined) {
                this.user.name = temp.name;
                this.user.phoneNumber = temp.phoneNumber;
                this.user.id = temp.id;
                this.names = [{ id: temp.id, text: temp.name }];
                console.log('<----phoneNumberInput--->item', (this.user), (temp), this.names, this.newInput);
                this.ref.detectChanges();
            } else {
                this.user.name = '';
                this.user.id = '';
                this.names = [{ id: '', text: '' }];
            }
        }
    }

    isEmail(value) {
        let regEmail = /^\S+@\S+\.\S+$/;
        if (value && value.match(regEmail)) {
            return true;
        } else {
            return false;
        }
    }
    isPhoneNumber(value) {
        let regPhone = /^1\d{10}$/;
        if (value && value.match(regPhone)) {
            return true;
        } else {
            return false;
        }
    }
    // 保存
    save() {
        this.clearHint = true;
        this.submitAttempt = true;
        console.log((this.user.phoneNumber), this.inviteUserForm.valid, this.user.name, (this.user));

        if (!this.user.name || !this.user.phoneNumber || (this.user.phoneNumber && !this.inviteUserForm.valid)) return;

        this.user.accountBookId = this.companyId;
        console.log('<---save-->', (this.user));
        if (this.user.id) {
            this.assignUser();
        } else {
            this.inviteUser();
        }
    }
    // 不存在的用户-》邀请
    inviteUser() {
        this.userApi.userInvite(this.user)
            .subscribe(
            (data) => {
                console.log('-----inviteUser----=>data', (data));
                this.close();
                let resultObj = {
                    type: 'success',
                    msg: '邀请用户成功！'
                };
                this.result.emit(resultObj);
                this.success.emit(data);
            },
            (error) => {
                console.log('-----inviteUser----=>error', (error));
                this.alertDanger(error);
            });
    }
    // 存在的用户-》 分配
    assignUser() {
        // 如果邀请的用户是已存在的，则role 需要 重新判断
        let role = this.type === 'account' ? AccountBookAssignModel.RoleEnum.Account : AccountBookAssignModel.RoleEnum.Assistant;
        let accountBookModel = [{
            accountBookId: this.companyId,
            userId: this.user.id,
            role: role
        }];
        this.accountBookApi.accountBookAssign(accountBookModel)
            .subscribe(
            (data) => {
                console.log('---assignUser------=>data', (data));
                let resultObj = {
                    type: 'success',
                    msg: '分配用户成功！'
                };
                this.result.emit(resultObj);
                this.success.emit(data);
                if (this.isManager() && this.isSetting) {
                    this.router.navigate(['/app/company-list']);
                    return;
                }
                this.close();
            }, (error) => {
                console.log('----assignUser-----=>error', (error));
                this.alertDanger(error);
            });
    }
    // 当管理员操作自己(会计或助理)的时候，跳到首页
    isManager(): boolean {

        let token = this.authorizationService.getSession();
        let roles = _.cloneDeep(token.user.currentRole);
        let isManager = false;
        if (roles) {
            roles.forEach(element => {
                if (element === 'Manager') {
                    isManager = true;
                }
            });
            if (isManager && token.user.id === this.user.id) {
                return true;
            } else {
                return false;
            }
        } else {
            console.log('<获取角色出错>');
            return false;
        }
    }
    // //停用并邀请用户
    // saveAndNow() {
    //     this.isReplace = false;
    //     this.newInput = false;

    //     this.modalTitle = '邀请用户';
    // }
    // //停用用户-》邀请用户
    // sureToReplace() {
    //     let userStatus = {
    //         userId: this.user.id,
    //         companyId: '',
    //         accountBookId: this.companyId,
    //         isEnable: 'N'
    //     };
    //     this.userApi.userUpdateUserStatus(userStatus)
    //         .subscribe(
    //         (data) => {
    //             console.log('---------=>data', data, this.user);
    //             this.clearData();
    //             this.modalTitle = '邀请用户';
    //         }, (error) => {
    //             console.log('---------=>error', error);
    //             ;
    //             this.alertDanger(error);
    //         });
    // }
    // saveAndLater() {
    //     let userStatus = {
    //         userId: this.user.id,
    //         companyId: '',
    //         accountBookId: this.companyId,
    //         isEnable: 'N'
    //     };
    //     this.userApi.userUpdateUserStatus(userStatus)
    //         .subscribe(
    //         (data) => {
    //             console.log('---------=>data', (data));
    //             this.modal.hide();
    //             let resultObj = {
    //                 type: 'success',
    //                 msg: '停用用户成功！'
    //             };
    //             this.result.emit(resultObj);
    //             this.success.emit(data);
    //         }, (error) => {
    //             console.log('---------=>error', (error));
    //             ;
    //             this.alertDanger(error);
    //         });
    // }


    // 设置角色
    setrole(id, name) {
        this.user.roles[0].id = id;
        this.user.roles[0].name = name;
        this.isRole = false;
        console.log(id);
        console.log(name);
    }
}
