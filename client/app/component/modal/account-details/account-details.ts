import {
    Component, ViewChild, Output, ChangeDetectionStrategy,
    EventEmitter, OnInit, ViewChildren, ElementRef, ChangeDetectorRef
} from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import * as _ from 'lodash';
import * as moment from 'moment';

import { CurrencyEnumModel } from '../../../api/accounting/model/CurrencyEnumModel';
import { BankAccountTypeEnumModel } from '../../../api/accounting/model/BankAccountTypeEnumModel';
import { BankAccountModel } from '../../../api/accounting/model/BankAccountModel';
import { BankAccountApi } from '../../../api/accounting/api/BankAccountApi';
import { FormValidator } from '../../../service/validators';


@Component({
    templateUrl: './account-details.html',
    selector: 'gpw-account-details-modal',
    styleUrls: ['./account-details.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class AccountDetailsModal implements OnInit {

    public bankTypeItems: Array<Object> =
    [{ id: 'DebitCard', text: '借记卡' }, { id: 'CreditCard', text: '信用卡' }];
    // @ViewChildren('bankInput') public bankInput;
    // @ViewChildren('bankInput2') public bankInput2;
    // @ViewChildren('bankInput3') public bankInput3;
    // @ViewChildren('bankInput4') public bankInput4;
    @ViewChild('modal') public modal;
    @Output() success = new EventEmitter();
    @Output() result = new EventEmitter();
    accountType: BankAccountTypeEnumModel[];
    initAccount: any = {
        bankAccountType: { value: BankAccountTypeEnumModel.ValueEnum.Bank },
        bankName: null,
        subbranch: '',
        accountNumber: '',
        accountName: '',
        accountCode: '',
        currency: { value: CurrencyEnumModel.ValueEnum.CNY },
        beginDate: null,
        beginBalance: 0,
        bankStatementBalance: null,
        currentBalance: null,
        description: ''
    };
    account: any = _.cloneDeep(this.initAccount);

    showTab: boolean = false;
    submitAttempt = false;
    clearHint = false;
    numShow: number = 0;
    isAccount: number = 1;
    isEdit: boolean = false;
    isBlank: boolean = false;

    public alerts: any = [];
    public alertSuccess(msg: string) {
        this.clearAlert();
        this.alerts = [{ type: 'success', msg: msg }];
        this.alerts = this.alerts.map((alert: any) => Object.assign({}, alert));
        this.ref.detectChanges();
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

    accountForm: FormGroup;
    accountForm2: FormGroup;
    accountForm3: FormGroup;
    accountForm4: FormGroup;
    accountForm5: FormGroup;
    accountForm6: FormGroup;
    accountForm7: FormGroup;
    accountForm8: FormGroup;
    bankTyep: AbstractControl;
    refreshFormGroup() {
        this.accountForm = this.fb.group({
            'accountName': ['', Validators.required],
            // 'bankName': ['', Validators.required],
            // 'subbranch': ['', Validators.required],
            // 'bankStatementBalance': ['', Validators.compose([Validators.required, FormValidator.amountValidatorAllowZero])],
            'beginBalance': ['', Validators.compose([Validators.required])],
            'beginDate': ['', Validators.compose([Validators.required, FormValidator.invalidDateFormat])]
        });
        this.accountForm2 = this.fb.group({
            'accountName2': ['', Validators.required],
            'beginBalance2': ['', Validators.compose([Validators.required])],
            'beginDate2': ['', Validators.compose([Validators.required, FormValidator.invalidDateFormat])]
        });
        this.accountForm3 = this.fb.group({
            // 'accountName3': ['', Validators.required],
            'beginBalance3': ['', Validators.compose([Validators.required])],
            'beginDate3': ['', Validators.compose([Validators.required, FormValidator.invalidDateFormat])]
        });
        this.accountForm4 = this.fb.group({
            // 'accountName4': ['', Validators.required],
            'beginBalance4': ['', Validators.compose([Validators.required])],
            'beginDate4': ['', Validators.compose([Validators.required, FormValidator.invalidDateFormat])]
        });
        this.accountForm5 = this.fb.group({
            'accountName5': ['', Validators.required],
            // 'bankName5': ['', Validators.required],
            // 'subbranch5': ['', Validators.required],
            // 'bankStatementBalance5': ['', Validators.compose([Validators.required, FormValidator.amountValidatorAllowZero])],
            'beginBalance5': ['', Validators.compose([Validators.required])],
            'beginDate5': ['', Validators.compose([Validators.required, FormValidator.invalidDateFormat])]
        });
        this.accountForm6 = this.fb.group({
            'accountName6': ['', Validators.required],
            'beginBalance6': ['', Validators.compose([Validators.required])],
            'beginDate6': ['', Validators.compose([Validators.required, FormValidator.invalidDateFormat])]
        });
        this.accountForm7 = this.fb.group({
            'accountName7': ['', Validators.required],
            'beginBalance7': ['', Validators.compose([Validators.required])],
            'beginDate7': ['', Validators.compose([Validators.required, FormValidator.invalidDateFormat])]
        });
        this.accountForm8 = this.fb.group({
            'accountName8': ['', Validators.required],
            'beginBalance8': ['', Validators.compose([Validators.required])],//, FormValidator.amountValidator
            'beginDate8': ['', Validators.compose([Validators.required, FormValidator.invalidDateFormat])]
        });
    }
    constructor(private el: ElementRef, private fb: FormBuilder, private bankAccountApi: BankAccountApi,
        private ref: ChangeDetectorRef) {
        console.log(el);
        this.refreshFormGroup();

    }
    onShown() {
        // if (this.bankInput.first) {
        //     this.bankInput.first.nativeElement.focus();
        // }
    }

    ngOnInit() {
        // this.showTab = false;
        this.clearHint = false;
        this.account = _.cloneDeep(this.initAccount);
    }
    inputAccountName(args) {
        console.log('weichatName', args);
        this.account.accountName = args;
    }


    /**
     *  account.account 不为空，系期初添加 不可删除，且余额和日期不能编辑
     *  account.account 为空，系账户添加，可删除，初始余额日期必须在会计区间
     * 
     */
    public show(account?: BankAccountModel) {
        this.clearHint = false;

        if (account) {
            let tempDate: any;
            if (account.beginDate) {
                tempDate = account.beginDate.toString().substr(0, 10);
            }

            let tempBalance: any = account.beginBalance === null ? 0 : account.beginBalance.toFixed(2);
            this.account = account;
            this.account.beginDate = tempDate;
            this.account.beginBalance = tempBalance;

            let bankStatementBalance: any = this.account.bankStatementBalance === null ? 0 : this.account.bankStatementBalance.toFixed(2);
            this.account.bankStatementBalance = bankStatementBalance;

            this.showTab = false;
            // if (this.account.account === null) {
            //     this.isEdit = true;
            //     console.log('<---->', this.account);
            // }
        } else {

            // this.account = _.cloneDeep(this.initAccount);
            let currentPeriod = localStorage.getItem('currentPeriod').substr(0, 7) + '-01';

            console.log('<----->', this.account, currentPeriod, moment(currentPeriod).toDate());
            this.account.beginDate = moment(moment(currentPeriod).toDate()).format('YYYY-MM-DD');

            this.showTab = true;
        }
        this.isBlank = false;
        this.modal.show();
        console.log('<><<>><', this.showTab, account);
        this.ref.detectChanges();
    }
    // 初始化-tab
    initSet(bankAccountTypeValue: BankAccountTypeEnumModel.ValueEnum, isAccount?: number) {

        this.isAccount = isAccount;
        // if (isAccount === 1 && this.bankInput.first) {
        //     this.bankInput.first.nativeElement.focus();
        // }
        // if (isAccount === 2 && this.bankInput2.first) {
        //     this.bankInput2.first.nativeElement.focus();
        // }
        // if (isAccount === 3 && this.bankInput3.first) {
        //     this.bankInput3.first.nativeElement.focus();
        // }
        // if (isAccount === 4 && this.bankInput4.first) {
        //     this.bankInput4.first.nativeElement.focus();
        // }

        if (this.account.bankAccountType.value !== bankAccountTypeValue) {
            this.account = _.cloneDeep(this.initAccount);
            let currentPeriod = localStorage.getItem('currentPeriod').substr(0, 7) + '-01';

            console.log('<----->', currentPeriod, moment(currentPeriod).toDate());
            this.account.beginDate = moment(moment(currentPeriod).toDate()).format('YYYY-MM-DD');
            this.clearHint = false;
            this.isBlank = false;
        }
        // 给支付宝和微信默认账户名
        // if (isAccount === 4) {
        //     this.account.accountName = '支付宝';
        // } else if (isAccount === 3) {
        //     this.account.accountName = '微信';
        // } else {
        //     this.account.accountName = '';
        // }
        this.account.bankAccountType.value = bankAccountTypeValue;
        console.log('>---<', this.isAccount, this.account.bankAccountType.value, this.account.accountName);

    }

    close() {
        this.modal.hide();
        this.clearAlert();
        this.showTab = false;
        this.clearHint = false;
        this.isBlank = false;
    }
    public selected(item: any): void {
        this.account.bankAccountType = { value: item.id };
    }
    suitAccountName() {
        if (this.isAccount === 3 && this.account.accountName === '') {
            this.account.accountName = '微信';
        } else if (this.isAccount === 4 && this.account.accountName === '') {
            this.account.accountName = '支付宝';
        }
    }
    save() {
        this.suitAccountName();
        this.clearHint = true;
        this.submitAttempt = true;
        this.account.currency = { value: CurrencyEnumModel.ValueEnum.CNY };
        let str = String(this.account.accountName).replace(' ', '');
        do {
            str = String(str).replace(' ', '');
        } while (String(str).includes(' '));


        if (str === null || str === undefined || str === '') {
            // this.clearHint = false;
            this.isBlank = true;
            return;
        } else {
            this.isBlank = false;
        }
        if (this.account.id) {
            let temp: any = this.account.bankAccountType.value;
            if (temp === 'Bank' && !this.accountForm5.valid) {
                return;
            }
            // 适配搜狗浏览器 bankStatementBalance = null 可以保存bug
            // if (temp === 'Bank' && this.account.bankStatementBalance === null) {
            //     return;
            // }
            if (temp === 'WeChat' && !this.accountForm6.valid) {
                return;
            }
            if (temp === 'Cash' && !this.accountForm7.valid) {
                return;
            }
            if (temp === 'Alipay' && !this.accountForm8.valid) {
                return;
            }
            let accountTemp = _.cloneDeep(this.account);
            this.bankAccountApi.bankAccountPut(accountTemp)
                .subscribe(
                (data) => {
                    this.close();
                    let resultObj = {
                        type: 'success',
                        msg: '修改账户成功！'
                    };
                    this.result.emit(resultObj);
                    this.account = _.cloneDeep(this.initAccount);
                },
                (error) => {
                    this.alertDanger(error);
                }
                );
        } else {
            let temp = _.cloneDeep(this.account);
            if (this.isAccount === 1 && !this.accountForm.valid) {
                return;
            }
            // 适配搜狗浏览器 bankStatementBalance = null 可以保存bug
            // if (this.isAccount === 1 && this.account.bankStatementBalance === null) {
            //     return;
            // }
            if (this.isAccount === 2 && !this.accountForm2.valid) {
                return;
            }
            if (this.isAccount === 3 && !this.accountForm3.valid) {
                return;
            }
            if (this.isAccount === 4 && !this.accountForm4.valid) {
                return;
            }
            this.bankAccountApi.bankAccountPost(temp)
                .subscribe(
                (data) => {
                    this.close();
                    let resultObj = {
                        type: 'success',
                        msg: '新增账户成功！',
                        data: data
                    };
                    this.result.emit(resultObj);
                    this.success.emit(data);
                    this.account = _.cloneDeep(this.initAccount);
                }, (error) => {
                    this.alertDanger(error);
                });
        }

    }

    keyPressHandler(event) {
        if (event.charCode === 13) {
            this.save();
        }
    }

}
