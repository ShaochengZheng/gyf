import {
  Component, ViewChild, Output, EventEmitter,
  Input, ViewChildren, ChangeDetectorRef, OnInit
} from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';

import * as _ from 'lodash';

// import { DepartmentApi } from '../../../../api/accounting/api/DepartmentApi';
import { UserApi } from '../../../api/accounting/api/UserApi';
import { UserModel } from '../../../api/accounting/model/UserModel';
import { RoleModel } from '../../../api/accounting/model/RoleModel';

import { StorageService, AuthorizationService } from '../../../service/core';
import { FormValidator } from '../../../service/validators';
import { AccountBookApi } from '../../../api/accounting/api/AccountBookApi';


@Component({
  selector: 'gpw-invite-customer-modal',
  templateUrl: './invite-customer.html',
  styleUrls: ['./invite-customer.scss'],
  providers: [UserApi]
})
export class InviteCustomerModal implements OnInit {

  @Input() modalTitle: string = '填写信息';
  @Input() confirmText: string = '确定';
  // true 是在停用替换，false 是邀请
  @Input() isReplace: boolean = true;
  @Input() modalContent: string = '是否替换当前用户？';
  @Input() companyId;

  public departmentItems: Array<Object> = [];
  @ViewChild('modal') public modal;
  @ViewChildren('input') public input;
  @Output() success = new EventEmitter();
  @Output() result = new EventEmitter();

  initUser: UserModel = {
    // id: '',
    code: '',
    name: '',
    phoneNumber: '',
    accountBookId: '',
    roles: [{
      id: '',
      name: '',
      roleType: RoleModel.RoleTypeEnum.Customer,
      isEnabled: true
    }],
  };

  user: any = _.cloneDeep(this.initUser);

  alert: Object = {};
  isRole: boolean = false;
  inviteUserForm: FormGroup;
  phoneNumber: AbstractControl;
  name: AbstractControl;
  submitAttempt = false;
  clearHint = false;
  update = false;
  disablePhoneEmail = false;

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
    this.alert = alert;
  }

  public clearAlert(): void {
    this.alert = {};
  }

  onShown() {
    // this.input.first.nativeElement.focus();
  }

  constructor(fb: FormBuilder, private router: Router, private userApi: UserApi, private chDr: ChangeDetectorRef,
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

  }

  public show(user?) {
    this.clearData();
    this.clearAlert();

    if (user) {
      this.user.name = user.name;
      this.user.phoneNumber = user.phoneNumber;
    }
    console.log('<---show--->', (this.user));
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
    this.clearHint = false;
    this.submitAttempt = false;
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
    // if (this.user.id) {
    //   this.assignUser();
    // } else {
    //   this.inviteUser();
    // }
    this.inviteCustomer();
  }
  //邀请客户联系人
  inviteCustomer() {
    let customer = {
      accountBookId: this.companyId,
      customerName: this.user.name,
      customerPhone: this.user.phoneNumber
    }
    this.accountBookApi.accountBookUpdateCustomer(customer)
      .subscribe(
      data => {
        console.log('-----inviteCustomer----=>data', (data));
        this.modal.hide();
        let resultObj = {
          type: 'success',
          msg: '添加用户成功！'
        };
        this.result.emit(resultObj);
        this.success.emit(data);
      }, error => {
        ;
        this.alertDanger(error);
      }
      );
  }
  // inviteUser() {
  //   this.userApi.userInvite(this.user)
  //     .subscribe(
  //     (data) => {
  //       console.log('-----inviteUser----=>data', (data));
  //       this.close();
  //       let resultObj = {
  //         type: 'success',
  //         msg: '添加用户成功！'
  //       };
  //       this.result.emit(resultObj);
  //       this.success.emit(data);
  //     },
  //     (error) => {
  //       console.log('-----inviteUser----=>error', (error));
  //       ;
  //       this.alertDanger(error);
  //     });
  // }
  // assignUser() {
  //   // 如果邀请的用户是已存在的，则role 需要 重新判断
  //   let role = AccountBookAssignModel.RoleEnum.Customer;
  //   let accountBookModel = [{
  //     accountBookId: this.companyId,
  //     userId: this.user.id,
  //     role: role
  //   }];
  //   this.accountBookApi.accountBookAssign(accountBookModel)
  //     .subscribe(
  //     (data) => {
  //       console.log('---assignUser------=>data', (data));
  //       let resultObj = {
  //         type: 'success',
  //         msg: '添加用户成功！'
  //       };
  //       this.result.emit(resultObj);
  //       this.success.emit(data);
  //       this.close();
  //     }, (error) => {
  //       console.log('----assignUser-----=>error', (error));
  //       ;
  //       this.alertDanger(error);
  //     });
  // }


}