import {
    Component, OnInit, ViewChild, Output, Input, OnDestroy,
    EventEmitter, ViewChildren, ChangeDetectorRef
} from '@angular/core';
import { FormBuilder, FormGroup, AbstractControl, Validators } from '@angular/forms';
import { AlertComponent } from 'ngx-bootstrap/alert';

import { FormValidator } from '../../../service/validators';
import * as _ from 'lodash';
import { OperationModeEnum } from '../../../service/core/core';
import { ContactApi } from '../../../api/accounting/api/ContactApi';
import { ContactModel } from '../../../api/accounting/model/ContactModel';
// import { TransactionOpeningBalanceModel } from '../../../api/accounting/model/TransactionOpeningBalanceModel';
import { ContactTypeEnumModel } from '../../../api/accounting/model/ContactTypeEnumModel';
// import { EntityTypeCodeEnumModel } from '../../../api/accounting/model/EntityTypeCodeEnumModel';



@Component({
    templateUrl: './contact-details.html',
    selector: 'gpw-contact-details-modal',
    styleUrls: ['./contact-details.scss'],
    providers: [ContactApi]
})
export class ContactDetailsModal implements OnInit, OnDestroy {
    @Input() operation: OperationModeEnum = OperationModeEnum.New;
    @ViewChild('modal') public modal;
    @ViewChildren('input') public input;
    @Output() success = new EventEmitter();
    @Output() result = new EventEmitter();
    contactType: ContactTypeEnumModel = { value: ContactTypeEnumModel.ValueEnum.None };
    initContact: ContactModel = {
        contactType: this.contactType,
        name: '',
        contactName: '',
        phoneNumber: '',
        accountName: '',
        accountNumber: '',
        // beginDate: null,
        // email: '',
        // transactionOpeningBalanceModels: []
    };
    contact: ContactModel = _.clone(this.initContact);
    isDefault = false;
    contactForm: FormGroup;
    submitAttempt = false;
    name: AbstractControl;
    // prop: AbstractControl;
    phoneNumber: AbstractControl;
    clearHint = false;
    showMore = false;
    beginDate;
    propertyList: Array<Object> = [
        { id: ContactTypeEnumModel.ValueEnum.Company, text: '单位' },
        { id: ContactTypeEnumModel.ValueEnum.Personal, text: '个人' }];
    property = [{ id: ContactTypeEnumModel.ValueEnum.Company, text: '单位' }];
    onlyPerson: boolean = false;
    // transactionOpeningBalanceModelList = [];


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

    constructor(fb: FormBuilder, private contactApi: ContactApi, private ref: ChangeDetectorRef) {
        this.contactForm = fb.group({
            'name': ['', Validators.required],
            'prop': ['', FormValidator.selectRequireValidator],
            'phoneNumber': ['', FormValidator.phoneOrEmailValidator],
            // 'beginDate': ['', Validators.compose([FormValidator.invalidDateFormat])]
        });
        this.name = this.contactForm.controls['name'];
        this.phoneNumber = this.contactForm.controls['phoneNumber'];
    }

    ngOnInit() {
        console.log('123123123');
        this.clearHint = false;
        this.contact = _.cloneDeep(this.initContact);
        // this.initDataPorperty =  { id: '1', text: '单位' };
        // this.TransactionOpeningBalanceModel();
        this.propertyList = [ { id: ContactTypeEnumModel.ValueEnum.Company, text: '单位' },
                            { id: ContactTypeEnumModel.ValueEnum.Personal, text: '个人' }];
    }
    ngOnDestroy() {
        console.log('99999999999');
    }

    onShown() {
        this.input.first.nativeElement.focus();
    }

    public show(contact?: ContactModel) {
        this.clearAlert();
        console.log('<----->', contact);
        this.clearHint = false;
        let tempDate: any;
        if (contact && (this.operation === OperationModeEnum.Update ||
            this.operation === OperationModeEnum.View)) {
            this.isDefault = contact.isDefault;
            if (contact.beginDate) {
                tempDate = contact.beginDate.toString().substr(0, 10);
            } else {
                tempDate === null;
            }
            contact.beginDate = tempDate;
            this.contact = contact;
            this.property = [{ id: this.contact.contactType.value, text: this.contact.contactType.name }];
            if(this.contact.contactType.name === '个人'){
                this.onlyPerson = true;
            }else {
                this.onlyPerson = false;
            }
            // this.transactionOpeningBalanceModelList = contact.transactionOpeningBalanceModels;
            if (!this.contact.hasOwnProperty('phoneNumber')) {
                let temp: any = this.contact;
                temp.phoneNumber = '';
                this.contact = temp;
            }
        } else {
            this.isDefault = false;
            this.contact = _.clone(this.initContact);
            // this.TransactionOpeningBalanceModel();
        }
        this.modal.show();
    }

    close() {
        this.showMore = false;
        this.contact = _.cloneDeep(this.initContact);
        this.modal.hide();
        this.clearAlert();
        // this.ngOnInit();
    }

    save() {
        if (!this.contact.name || (this.contact.phoneNumber && !this.contactForm.valid)) return;
        this.clearHint = true;
        // this.contact.transactionOpeningBalanceModels = this.transactionOpeningBalanceModelList;
        console.log(JSON.stringify(this.contact));
        if (this.property[0].text === '单位') {
            this.contact.contactType.value = ContactTypeEnumModel.ValueEnum.Company;
            this.contact.contactType.name = '单位';
        } else {
            this.contact.contactType.value = ContactTypeEnumModel.ValueEnum.Personal;
            this.contact.contactType.name = '个人';
        }
        if (this.contact.id) {
            this.contactApi.contactPut(this.contact)
                .subscribe(
                (data) => {
                    this.showMore = false;
                    this.modal.hide();
                    let resultObj = {
                        type: 'success',
                        msg: '修改往来单位/个人成功！'
                    };
                    this.result.emit(resultObj);
                    this.success.emit(data);
                },
                (error) => {
                    this.alertDanger(error);
                });
        } else {
            this.contactApi.contactPost(this.contact)
                .subscribe(
                (data) => {
                    console.log(data);
                    this.showMore = false;
                    this.modal.hide();
                    let resultObj = {
                        type: 'success',
                        msg: '新增往来单位/个人成功！',
                    };
                    this.result.emit(resultObj);
                    this.success.emit(data);
                }, (error) => {
                    this.alertDanger(error);
                    console.log('>this is an error<', error);
                    // this.alertDanger('错误');
                });
        }

    }
    showMoreDetails(status) {
        console.log('111');
        if (status === true) {
            this.showMore = true;
        } else {
            this.showMore = false;
        }
    }

    searchBlur() {

    }

    keyPressHandler(event) {
        if (event.charCode === 13) {
            this.save();
        }
    }
    selected(args) {
        console.log('<====>', JSON.stringify(args));
        if (args.text === '个人') {
            this.property = [{ id: 2, text: '个人' }];
            this.onlyPerson = true;
        } else {
            this.property = [{ id: 1, text: '单位' }];
            this.onlyPerson = false;
        }
    }

}
