import { UtilityService } from './../../../service/core/utility';
import { FormValidator } from './../../../service/validators';
import { EmployeeModel } from './../../../api/accounting/model/EmployeeModel';
import { EmployeeStatusEnumModel } from './../../../api/accounting/model/EmployeeStatusEnumModel';
import { DepartmentTypeEnumModel } from './../../../api/accounting/model/DepartmentTypeEnumModel';
import { PersonalAccountTypeEnumModel } from './../../../api/accounting/model/PersonalAccountTypeEnumModel';
import { GenderEnumModel } from './../../../api/accounting/model/GenderEnumModel';
import { SalaryService } from './../shared/salary.service';

import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

import * as _ from 'lodash';
import * as moment from 'moment';


@Component({
    selector: 'stuff',
    templateUrl: 'stuff.component.html',
    styleUrls: ['./stuff.component.scss'],
    providers: [SalaryService]
})

export class StuffComponent implements OnInit {

    public sexList: any = [{ id: GenderEnumModel.ValueEnum.Male, text: '男' }, { id: GenderEnumModel.ValueEnum.Female, text: '女' }];
    public specialList: any = [{ id: 'Y', text: '是' }, { id: 'N', text: '否' }];
    public stuffList: any = [{ id: 'Y', text: '是' }, { id: 'N', text: '否' }];
    public nationalList: any = [{ id: 'CN', text: '中国' }, { id: 'OTHER', text: '非中国' }];
    public householdList: any = [
        { id: PersonalAccountTypeEnumModel.ValueEnum.Agricultural, text: '农业' },
        { id: PersonalAccountTypeEnumModel.ValueEnum.NonAgricultural, text: '非农业' }];
    public dpTypeList: Array<Object> = [
        { id: DepartmentTypeEnumModel.ValueEnum.Sales, text: '销售部门' },
        { id: DepartmentTypeEnumModel.ValueEnum.Management, text: '管理部门' }];
    public stuStatusList: Array<any> = [
        { id: EmployeeStatusEnumModel.ValueEnum.Normal, text: '正常' },
        { id: EmployeeStatusEnumModel.ValueEnum.Leave, text: '离职' }];

    alert: Object = {};

    selectNational;
    selectSex;
    selectStuStatus;
    selectStastus;
    selecthouseHold;
    selectDpType;
    selectIsSpecial;

    isFund: boolean = false;
    isSocial: boolean = false;
    submitForm: boolean = false;
    hasSocial: boolean = true;

    invalidEdicalCare: boolean = false;
    invalidUnemployment: boolean = false;
    invalidPension: boolean = false;

    stuffForm: FormGroup;
    stuff: EmployeeModel = {
        id: null,
        number: '',
        name: '',
        position: '',
        idNo: '',
        birthDate: this.getTodayDate(),
        joinedDate: this.getTodayDate(),
        national: {
            id: 'CN',
            name: ''
        },
        departmentType: { value: DepartmentTypeEnumModel.ValueEnum.None, name: '' },
        hasSocialSecurity: false,
        gender: { value: GenderEnumModel.ValueEnum.None, name: '' },

        companyName: '',
        accountNature: { value: PersonalAccountTypeEnumModel.ValueEnum.Agricultural, name: '农业' },
        phoneNumber: '',
        email: '',
        remainsElderly: 'N',
        hasHousingFund: false,
        status: { value: EmployeeStatusEnumModel.ValueEnum.Normal, name: '' },
        contractType: 'Y',
        address: '',
        pEdicalCare: 0,
        pUnemployment: 0,
        pPension: 0,
        bankType: '',
        bankAccount: '',
    };
    // formControls region start
    stuffNumber: AbstractControl;
    stuffName: AbstractControl;
    stuffNational: AbstractControl;
    idNo: AbstractControl;
    birthDate: AbstractControl;
    stuffSex: AbstractControl;
    joinedDate: AbstractControl;
    departmentType: AbstractControl;
    position: AbstractControl;
    isStuff: AbstractControl;
    shareCapital: AbstractControl;
    isSpecial: AbstractControl;
    stuffStatus: AbstractControl;
    phoneNumber: AbstractControl;
    email: AbstractControl;
    address: AbstractControl;
    companyName: AbstractControl;
    houseHold: AbstractControl;
    bankName: AbstractControl;
    bankAccount: AbstractControl;
    baseSalary: AbstractControl;
    positionSalary: AbstractControl;
    medicalInsuranceBase: AbstractControl;
    oldAgeInsuranceBase: AbstractControl;
    providentFundBase: AbstractControl;
    pProvidentFund: AbstractControl;
    pEdicalCare: AbstractControl;
    pPension: AbstractControl;
    pUnemployment: AbstractControl;
    cEdicalCare: AbstractControl;
    cPension: AbstractControl;
    cUnemployment: AbstractControl;
    cProvidentFund: AbstractControl;
    cFertility: AbstractControl;
    cWorkInjury: AbstractControl;
    // formControls region end


    title: string = '新增';
    constructor(private salaryService: SalaryService, private fBuilder: FormBuilder, private router: Router,
        private actRoute: ActivatedRoute, private utilService: UtilityService, private location: Location
    ) {
        this.stuffForm = this.fBuilder.group({
            'stuffNumber': ['', Validators.nullValidator],
            'stuffName': ['', Validators.required],
            'stuffNational': ['', Validators.required],
            'idNo': ['', Validators.required],
            'birthDate': ['', Validators.nullValidator],
            'stuffSex': ['', Validators.nullValidator],
            'joinedDate': ['', Validators.nullValidator],
            'departmentType': ['', Validators.nullValidator],
            'position': ['', Validators.nullValidator],
            'isStuff': ['', Validators.required],
            'shareCapital': ['', Validators.nullValidator],
            'isSpecial': ['', Validators.nullValidator],
            'stuffStatus': ['', Validators.nullValidator],
            'phoneNumber': ['', FormValidator.phoneValidator],
            'email': ['', FormValidator.emailValidator],
            'address': ['', Validators.nullValidator],
            'companyName': ['', Validators.nullValidator],
            'houseHold': ['', Validators.nullValidator],
            'bankName': ['', Validators.nullValidator],
            'bankAccount': ['', Validators.nullValidator],
            'baseSalary': ['', Validators.nullValidator],
            'positionSalary': ['', Validators.nullValidator],
            'medicalInsuranceBase': ['', Validators.nullValidator],
            'oldAgeInsuranceBase': ['', Validators.nullValidator],
            'providentFundBase': ['', Validators.nullValidator],
            'pEdicalCare': ['', Validators.compose([FormValidator.amountValidatorAllowZero])],
            'pProvidentFund': ['', Validators.nullValidator],
            'pPension': ['', Validators.compose([FormValidator.amountValidatorAllowZero])],
            'cEdicalCare': ['', Validators.nullValidator],
            'pUnemployment': ['', Validators.compose([FormValidator.amountValidatorAllowZero])],
            'cProvidentFund': ['', Validators.nullValidator],
            'cFertility': ['', Validators.nullValidator],
            'cWorkInjury': ['', Validators.nullValidator],
            'cPension': ['', Validators.nullValidator],
            'cUnemployment': ['', Validators.nullValidator]
        });
        this.initFormControl();
    }

    initFormControl() {
        this.stuffNumber = this.stuffForm.controls['stuffNumber'];
        this.stuffName = this.stuffForm.controls['stuffName'];
        this.stuffNational = this.stuffForm.controls['stuffNational'];
        this.idNo = this.stuffForm.controls['idNo'];
        this.birthDate = this.stuffForm.controls['birthDate'];
        this.stuffSex = this.stuffForm.controls['stuffSex'];
        this.joinedDate = this.stuffForm.controls['joinedDate'];
        this.departmentType = this.stuffForm.controls['departmentType'];
        this.position = this.stuffForm.controls['position'];
        this.isStuff = this.stuffForm.controls['isStuff'];
        this.shareCapital = this.stuffForm.controls['shareCapital'];
        this.isSpecial = this.stuffForm.controls['isSpecial'];
        this.stuffStatus = this.stuffForm.controls['stuffStatus'];
        this.phoneNumber = this.stuffForm.controls['phoneNumber'];
        this.email = this.stuffForm.controls['email'];
        this.address = this.stuffForm.controls['address'];
        this.companyName = this.stuffForm.controls['companyName'];
        this.houseHold = this.stuffForm.controls['houseHold'];
        this.bankName = this.stuffForm.controls['bankName'];
        this.bankAccount = this.stuffForm.controls['bankAccount'];
        this.baseSalary = this.stuffForm.controls['baseSalary'];
        this.positionSalary = this.stuffForm.controls['positionSalary'];
        this.medicalInsuranceBase = this.stuffForm.controls['medicalInsuranceBase'];
        this.oldAgeInsuranceBase = this.stuffForm.controls['oldAgeInsuranceBase'];
        this.providentFundBase = this.stuffForm.controls['providentFundBase'];
        this.pProvidentFund = this.stuffForm.controls['pProvidentFund'];
        this.pEdicalCare = this.stuffForm.controls['pEdicalCare'];
        this.pPension = this.stuffForm.controls['pPension'];
        this.pUnemployment = this.stuffForm.controls['pUnemployment'];
        this.cPension = this.stuffForm.controls['cPension'];
        this.cEdicalCare = this.stuffForm.controls['cEdicalCare'];
        this.cUnemployment = this.stuffForm.controls['cUnemployment'];
        this.cProvidentFund = this.stuffForm.controls['cProvidentFund'];
        this.cFertility = this.stuffForm.controls['cFertility'];
        this.cWorkInjury = this.stuffForm.controls['cWorkInjury'];

    }

    ngOnInit() {
        const id = this.actRoute.snapshot.params['id'];
        console.log('ngOninit =>', id);
        if (id) {
            this.title = '详情';
            this.getStuff(id);
        }
    }

    showSocial() {
        this.stuff.hasSocialSecurity = !this.stuff.hasSocialSecurity;
    }

    showFund() {
        this.stuff.hasHousingFund = !this.stuff.hasHousingFund;
    }

    back() {
        this.location.back();
    }

    /**
     * 保存
     */
    save() {
        // this.stuff.number = this.stuffNumber;
        this.invalidIsStuffSocial();
        // console.log(JSON.stringify(this.stuffForm));
        if (!this.stuffForm.valid || this.invalidPension || this.invalidEdicalCare || this.invalidUnemployment) {
            this.submitForm = true;
            return;
        }
        this.submitForm = false;
        console.log('selectNational', JSON.stringify(this.nationalList));
        console.log('save salary =>', JSON.stringify(this.stuff));
        const model = _.cloneDeep(this.stuff);
        if (this.stuff.id) {
            this.salaryService.editEmployeeById(model).then(data => {
                this.alertSuccess('修改成功');
                // this.location.back();this.router.navigate(['/app/salary/stuff-list']);
                this.back();
            }).catch(err => {
                console.log(err);
                this.alertDanger(err);
            });
        } else {
            this.salaryService.createEmployee(model).then(data => {
                this.alertSuccess('添加成功');
                this.router.navigate(['/app/salary/stuff-list']);
                //
            }).catch(err => {
                console.log(err);
                this.alertDanger(err);
            });
        }

    }
    /**
     * 验证是雇员的情况，个人三项社保为必填
     */
    invalidIsStuffSocial() {
        this.invalidPension = false;
        this.invalidUnemployment = false;
        this.invalidEdicalCare = false;
        if (this.hasSocial) {
            if (this.stuff.pEdicalCare === null || this.stuff.pEdicalCare === undefined) {
                this.invalidEdicalCare = true;
            }
            if (this.stuff.pUnemployment === null || this.stuff.pUnemployment === undefined) {
                this.invalidUnemployment = true;
            }
            if (this.stuff.pPension === null || this.stuff.pPension === undefined) {
                this.invalidPension = true;
            }
        }
    }

    getStuff(id) {
        this.salaryService.getEmployeeById(id).then(data => {
            console.log('getStuff =>', JSON.stringify(data));
            const temp: any = _.cloneDeep(data);
            temp.birthDate = moment(temp.birthDate).format('YYYY-MM-DD');
            temp.joinedDate = moment(temp.joinedDate).format('YYYY-MM-DD');
            this.stuff = temp;
            this.parseData(data);
        }).catch(err => {
            console.log(JSON.stringify(err));
        });
    }
    /**
     * 解析数据
     */
    parseData(data: EmployeeModel) {
        if (!data) { return; }
        if (data.national) {
            this.selectNational = [{ id: data.national.id, text: data.national.name }];
        }
        this.hasSocial = data.hasSocialSecurity;
        this.selectStastus = [this.getItemObj(this.stuffList, data.contractType)];
        this.selectDpType = [{ id: data.departmentType.value, text: data.departmentType.name }];
        this.selectIsSpecial = [this.getItemObj(this.specialList, data.remainsElderly)];
        this.selecthouseHold = [{ id: data.accountNature.value, text: data.accountNature.name }];
        this.selectSex = [{ id: data.gender.value, text: data.gender.name }];
        this.selectStuStatus = [{ id: data.status.value, text: data.status.name }];
        console.log('parseData =>', JSON.stringify(this.selectNational), JSON.stringify(this.selectStastus));
    }

    /**
     * 获取集合中的
     * @param targets 目标集合
     * @param id ID
     */
    getItemObj(targets: Array<any>, id) {
        console.log('id=>', id);
        if (!id) { return; }
        return _.find(targets, (item) => { console.log('itemm=>', JSON.stringify(item)); return item.id === id; });
    }

    selected(e, type) {
        if (type === 'national') {// 国籍
            this.stuff.national = { id: e.id, name: e.text };
        } else if (type === 'sex') {// 性别
            this.stuff.gender = { value: e.id, name: e.text };
        } else if (type === 'department') {// 部门性质
            this.stuff.departmentType = { value: e.id, name: e.text };
        } else if (type === 'isStuff') {// 是否雇员
            this.modityCheckbox(e.id);
            this.stuff.contractType = e.id;
        } else if (type === 'isSpecial') {// 是否残疾
            this.stuff.remainsElderly = e.id;
        } else if (type === 'status') {// 在职状态
            this.stuff.status = { value: e.id, name: e.text };
        } else if (type === 'household') {// 户口
            this.stuff.accountNature = { value: e.id, name: e.text };
        }
        console.log('selected', e, type);
    }

    public getTodayDate(): any {

        return moment(new Date()).format('YYYY-MM-DD');
    }
    /**
     * 更改checkbox 状态
     */
    modityCheckbox(flag) {
        if (flag === 'Y') {
            this.hasSocial = true;
            this.stuff.hasSocialSecurity = true;
        } else {
            this.hasSocial = false;
            this.stuff.hasSocialSecurity = false;
            this.stuff.hasHousingFund = false;
        }
    }

    /**
     * 成功提示
     * @param msg 提示信息
     */
    alertSuccess(msg) {
        this.clearAlert();
        setTimeout(() => {
            this.alert = { msg: msg, type: 'success' };
        }, 0);
    }
    /**
     * 错误提示
     * @param msg 提示信息
     */
    alertDanger(msg) {
        this.clearAlert();
        console.log(msg);
        setTimeout(() => {
            this.alert = { msg: msg, type: 'danger' };
        }, 0);
    }

    clearAlert() {
        this.alert = {};
    }

}


