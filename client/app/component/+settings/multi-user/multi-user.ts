import {
    Component, ViewChild, ChangeDetectorRef,
    ChangeDetectionStrategy, OnInit, AfterViewInit
} from '@angular/core';
import { Router } from '@angular/router';

import { UserApi } from '../../../api/accounting/api/UserApi';
import { ConfirmEventTypeEnum } from '../../widget/confirm/confirm';
import { UpdateUserStatusModel } from '../../../api/accounting/model/UpdateUserStatusModel';
import { StorageService, AuthorizationService } from '../../../service/core';
import * as _ from 'lodash';

@Component({
    selector: 'gpw-multi-user',
    templateUrl: './multi-user.html',
    styleUrls: ['./multi-user.scss'],
    providers: [UserApi]
})
export class MultiUserComponent implements OnInit, AfterViewInit {
    // 停用确认
    @ViewChild('stopConfirm') public stopConfirm;
    // 重新启用
    @ViewChild('reinviteConfirm') public reinviteConfirm;
    // 邀请
    @ViewChild('inviteUserModal') public inviteUserModal;
    // 重发链接
    @ViewChild('reSendConfirm') public reSendConfirm;

    itemList: Array<Object> = [
        { id: '1', text: '会计' },
        { id: '2', text: '助理' }];

    currentItem: any;
    dataList = [];
    pageIndex: number = 1;
    pageSize: number = 1;
    recordCount: number = 0;
    maxSize: number = 10;
    searchModel = {
        pageIndex: '1',
        pageSize: '10'
    };
    isable: boolean = true;
    isInvite: boolean = false;
    noDataList: boolean = false;

    constructor(private ref: ChangeDetectorRef, private userApi: UserApi, private authorizationService: AuthorizationService,
        private storageService: StorageService, private router: Router) {
    }

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


    search() {
        this.dataList = [];
        this.userApi.userSearch(this.searchModel.pageIndex,
            this.searchModel.pageSize)
            .subscribe(
            (data) => {
                this.pageIndex = data.pageIndex;
                this.recordCount = data.recordCount;
                this.pageSize = data.pageSize;
                let dataTemp = _.cloneDeep(data);
                // reorder admin position
                if (this.recordCount === 0) {
                    this.isInvite = true;
                    this.noDataList = true;
                } else {
                    this.noDataList = false;
                    this.dataList = dataTemp.list;
                    let i = 0;
                    this.dataList.forEach(element => {
                        element.isEnable === 'N' ? i++ : 0;
                    });
                    if (this.dataList.length <= 1) {
                        this.isInvite = true;
                    } else {
                        this.isInvite = i >= 1 ? true : false;
                    }
                }
                setTimeout(() => this.ref.markForCheck(), 10);
                console.log('<---currentUser---->', (data));
            }, (error) => {
                this.alertDanger(error);
            });
    }

    ngOnInit() {

    }
    ngAfterViewInit() {
        this.search();
    }

    editUser(i) {
        let item = this.dataList[i];
        this.stopConfirm.message = '是否停用此用户，并邀请其他用户？';
        this.stopConfirm.otherText = '是,稍后邀请';
        this.stopConfirm.confirmText = '是';
        this.stopConfirm.cancelText = '否';
        this.stopConfirm.show();
        this.currentItem = item;
    }
    stopUser(event) {
        console.log('<stop user>', event);
        if (event === ConfirmEventTypeEnum.Confirm) {
            this.suerToStopAndInvite(true);
        } else if (event === ConfirmEventTypeEnum.Other) {
            this.suerToStopAndInvite(false);
        }
    }

    // account：会计 ／／ assistant:助理 ／／ both 二选一
    whichTypeCanInvite(): string {
        let gotAssist = false;
        let gotAccount = false;
        if (this.recordCount === 0) {
            return 'both';
        } else {
            this.dataList.forEach(element => {
                if (element.roles[0].name === '会计') {
                    if (element.isEnable === 'N') {
                        gotAccount = false;
                    } else {
                        gotAccount = true;
                    }
                } else if (element.roles[0].name === '助理') {
                    if (element.isEnable === 'N') {
                        gotAssist = false;
                    } else {
                        gotAssist = true;
                    }
                }
            });
            if (!gotAccount && !gotAssist) {
                return 'both';
            } else if (!gotAccount) {
                return 'account';
            } else if (!gotAssist) {
                return 'assistant';
            } else { //不存在这种情况
                return 'none';
            }
        }
    }
    inviteUser() {
        this.inviteUserModal.modalTitle = '邀请用户';
        this.inviteUserModal.confirmText = '确定邀请';
        this.inviteUserModal.type = this.whichTypeCanInvite();
        this.inviteUserModal.isSetting = true;
        this.inviteUserModal.show();
    }

    openReinviteModal(i) {
        let item = this.dataList[i];
        this.reinviteConfirm.title = '确认重新启用';
        this.reinviteConfirm.message = '确定对此用户重新启用吗？';
        this.reinviteConfirm.show();
        this.currentItem = item;
    }
    //启用会计助理写在里面
    reinvite(event) {
        if (event === ConfirmEventTypeEnum.Confirm) {
            this.sureToReuse();
        }
        setTimeout(() => this.ref.markForCheck(), 10);

    }
    // 重新启用
    sureToReuse() {
        let typeEmu = this.currentItem.roles[0].name === '会计' ? UpdateUserStatusModel.RoleEnum.Account : UpdateUserStatusModel.RoleEnum.Assistant;

        let userStatus = {
            userId: this.currentItem.id,
            companyId: '',
            accountBookId: this.storageService.getToken().currentAccount.id,
            isEnable: 'Y',
            role: typeEmu
        };
        this.userApi.userUpdateUserStatus(userStatus)
            .subscribe(
            (data) => {
                console.log('---------=>data', data, this.currentItem);
                if (this.isManager()) {
                    this.addLocalStorage();
                    this.router.navigate(['/app/company-list']);
                    return;
                }
                this.alertSuccess('用户启用成功');
                this.search();
            }, (error) => {
                console.log('---------=>error', error);
                this.alertDanger(error);
            });
    }
    suerToStopAndInvite(invite: boolean) {
        let typeEmu = this.currentItem.roles[0].name === '会计' ? UpdateUserStatusModel.RoleEnum.Account : UpdateUserStatusModel.RoleEnum.Assistant;

        let userStatus = {
            userId: this.currentItem.id,
            companyId: '',
            accountBookId: this.storageService.getToken().currentAccount.id,
            role: typeEmu,
            isEnable: 'N'
        };
        this.userApi.userUpdateUserStatus(userStatus)
            .subscribe(
            (data) => {
                console.log('---------=>data', data, this.currentItem);

                this.alertSuccess('用户停用成功');
                if (this.isManager()) {
                    this.cutLocalStorage();
                    this.router.navigate(['/app/company-list']);
                    return;
                }
                if (invite) {
                    this.inviteUserModal.modalTitle = '邀请用户';
                    this.inviteUserModal.confirmText = '确定邀请';
                    let type = this.currentItem.roles[0].name === '会计' ? 'account' : 'assistant';
                    this.inviteUserModal.type = type;
                    this.inviteUserModal.isSetting = true;
                    this.inviteUserModal.show();
                }
                this.search();
                setTimeout(() => this.ref.markForCheck(), 10);
            }, (error) => {
                console.log('---------=>error', error);
                this.alertDanger(error);
            });
    }
    // 当管理员停用自己的时候 需要更新localStorage
    cutLocalStorage() {
        let role = this.currentItem.roles[0].name === '会计' ? 'Account' : 'Assistant';
        let token = this.authorizationService.getSession();
        let roles = _.cloneDeep(token.user.currentRole);
        let roleList = [];
        if (roles) {
            roles.forEach(element => {
                if (element !== role) {
                    roleList.push(element);
                }
            });
        }
        console.log('<--cut--->', roleList);
        localStorage.setItem('currentRole', JSON.stringify(roleList));
    }
    // 当管理员启用自己的时候 需要更新localStorage
    addLocalStorage() {
        let role = this.currentItem.roles[0].name === '会计' ? 'Account' : 'Assistant';
        let token = this.authorizationService.getSession();
        let roleList = _.cloneDeep(token.user.currentRole);
        if (roleList) {
            roleList.push(role);
        }
        console.log('<--cut--->', roleList);
        localStorage.setItem('currentRole', JSON.stringify(roleList));
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
            if (isManager && token.user.id === this.currentItem.id) {
                return true;
            } else {
                return false;
            }
        } else {
            console.log('<获取角色出错>');
            return false;
        }
    }
    result(resultObj) {
        console.log('<++++++>', resultObj, (resultObj));
        this.isInvite = true;
        this.search();
        this.addAlert(resultObj);
    }
    //重发邀请
    reSendInvite(i) {
        let item = this.dataList[i];
        this.reSendConfirm.title = '确认重发邀请';
        this.reSendConfirm.message = '确定对此用户重新发送邀请链接？';
        this.reSendConfirm.show();
        this.currentItem = item;
    }
    //重发邀请链接
    reSend(event) {
        if (event === ConfirmEventTypeEnum.Confirm) {
            this.reSendUrl();
        }
    }
    //重发邀请链接
    reSendUrl() {
        this.userApi.userInvite(this.currentItem)
            .subscribe(
            (data) => {
                this.alertSuccess('重发邀请成功！');
                this.search();
            },
            (error) => {
                console.log('-----inviteUser----=>error', (error));
                this.alertDanger(error);
            });
    }
    // public pageChanged(event: any): void {
    //     this.searchModel.pageIndex = event.page;
    //     this.search();
    // };

}
