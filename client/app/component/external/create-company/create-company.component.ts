import { Component, OnInit } from '@angular/core';
import { CreateCompanyService } from './shared/create-company.service';

import { ActivatedRoute, Router } from '@angular/router';
import { AuthorizationService } from '../../../service/core';
import * as _ from 'lodash';

import * as moment from 'moment';
import { AccountBookApi } from '../../../api/accounting/api/AccountBookApi';
import { RegionApi } from '../../../api/accounting/api/RegionApi';
import { IndustryApi } from '../../../api/accounting/api/IndustryApi';
declare var $: any;

@Component({
    selector: 'create-company',
    host: {
        class: 'gray-lightest-bg full-height'
    },
    templateUrl: 'create-company.component.html',
    styleUrls: ['./create-company.component.scss'],
    providers: [CreateCompanyService, IndustryApi, AccountBookApi, RegionApi]
})

export class CreateCompanyComponent implements OnInit {

    config: any;
    browserUserAgent: any;
    isShow: boolean = false;

    createCompanyModel = {
        id: null,
        name: '',
        legalPersonName: '',
        registeredCapital: null,
        address: {
            area: {
                id: '',
                name: '',
            },
            city: {
                id: '',
                name: '',
            },
            province: {
                id: '',
                name: '',
            }
        },
        beginDate: null,
        taxNumber: '',
        companyProperty: '',
        industry: {
            id: '',
            name: ''
        },
        openingDate: new Date(),
        needName: false,
        needlegalPersonName: false,
        needProvince: false,
        needCity: false,
        needArea: false,
        needTaxNumber: false,
        needCompanyProperty: false,
        needBeginDate: false,
        needIndustry: false
    };
    createCompany: any = [];
    companyPropertites: Array<Object> = [
        {
            id: '1',
            text: '小规模纳税人',
            disabled: false
        },
        {
            id: '2',
            text: '一般纳税人',
            disabled: false,
        }];
    dt: any = new Date();
    initDate = _.cloneDeep(this.dt);
    startDate;
    industryList: Array<Object> = [{ id: 1, text: 'data[i].name' }, { id: 2, text: 'data[i].name' }, { id: 3, text: 'data[i].name' }];
    provinceList: Array<Object>;
    cityList: Array<Object>;
    districtList: Array<Object>;
    // 上传的营业执照数据
    licenseData: any;
    alert: Object = {};
    isClick: boolean = false;
    constructor(private route: ActivatedRoute, private regionApi: RegionApi, private authorizationService: AuthorizationService,
        private router: Router, private createCompanyService: CreateCompanyService, private industryApi: IndustryApi,
        private accountBookApi: AccountBookApi) {
        moment.locale('zh-cn');
        this.config = authorizationService.Config;
        this.browserUserAgent = this.authorizationService.DetectionUA();
        if (this.browserUserAgent === 'chrome' || this.browserUserAgent === 'safari' || this.browserUserAgent === 'firefox') {
            this.isShow = false;
        } else {
            this.isShow = true;
        }
        console.log(this.browserUserAgent);

    }

    ngOnInit() {
        this.getAddress();
        console.log('JSOn', this.createCompany);
        this.getIndustryList();
        // 获取localStorage 的营业执照数据
        let dataSave: any = localStorage.getItem('uploadLicenseData');
        this.licenseData = JSON.parse(dataSave);
        localStorage.removeItem('uploadLicenseData');

        if (this.licenseData && this.licenseData.length > 0) {
            let templist = [];
            console.log('getData', dataSave);
            _.forEach(this.licenseData, (item) => {
                let model = _.cloneDeep(this.createCompanyModel);
                model.name = item.name;
                model.legalPersonName = item.person;
                // model.registeredCapital = item.capital;
                // model.address.city = item.address.split()
                // model.industry = item.industry;
                // model.beginDate = item.valid_period;

                console.log('model', model);
                templist.push(model);
            });

            console.log('tempList', templist);

            this.createCompany = templist;

        } else {
            this.initList();
        }

    }

    handleCapital(index, e) {
        let s;
        if (isNaN(e) || !e) {
            let temp = 0;
            s = temp.toFixed(4);
        } else {
            s = e.toFixed(4);
        }
        this.createCompany[index].registeredCapital = s;
        // _.forEach(this.createCompany, item => {
        //     if (item.registeredCapital === e) {
        //         item.registeredCapital = s;
        //     }
        //     if (item.registeredCapital <= 0) {
        //         item.registeredCapital = null;
        //     }
        // });
    }
    ngAfterViewInit() {

        $(document).ready(function () {
            setTableBody();
            $(window).resize(setTableBody);
            $('.table-body').scroll(function () {
                $('.table-header').offset({ left: (-1 * this.scrollLeft) + 30 });
            });
        });

        function setTableBody() {
            $('.table-body').height($('.inner-container').height() - $('.table-header').height());
        }
    }


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
        setTimeout(() => { this.alert = alert; }, 0);
    }

    public clearAlert(): void {
        this.alert = {};
    }

    initList() {
        let temp = _.cloneDeep(this.createCompanyModel);
        this.createCompany.push(temp);
    }


    //#region 公司地址
    getAddress() {
        this.regionApi.regionGet()
            .subscribe(
            data => {
                let i = 0;
                let temp = [];
                let dataTemp: any = data;
                for (i = 0; i < dataTemp.length; i++) {
                    temp[i] = ({ id: dataTemp[i].code, text: dataTemp[i].name });
                }
                this.provinceList = temp;
            },
            error => {
                console.log('error', error);
            }
            );
    }

    provinceSelect(value, i) {


        if (!value) {
            return;
        }
        this.createCompany[i].address.city = null;
        this.createCompany[i].address.area = null;
        this.regionApi.regionGet(value.id)
            .subscribe(
            data => {
                let temp = [];
                let dataTemp: any = data;
                for (let j = 0; j < dataTemp.length; j++) {
                    temp[j] = ({ id: dataTemp[j].code, text: dataTemp[j].name });
                }
                this.cityList = temp;
            },
            error => {
                console.log('error', error);
            }
            );
    }

    citySelect(value) {
        if (!value) {
            return;
        }
        this.regionApi.regionGet(value.id)
            .subscribe(
            data => {
                let i = 0;
                let temp = [];
                let dataTemp: any = data;
                for (i = 0; i < dataTemp.length; i++) {
                    temp[i] = ({ id: dataTemp[i].code, text: dataTemp[i].name });
                }
                this.districtList = temp;
            },
            error => {
                console.log('error', error);
            }
            );
    }
    public getTodayDate() {
        let currentdate: any = moment().format('YYYY-MM-DD');
        return currentdate;
    }
    formatCurrent() {
        let year = new Date().getFullYear();
        let month = new Date().getMonth() + 1;
        let seperator = '-';
        let temp: any = year + seperator + month;
        return temp;
    }

    formatDate(item) {
        let year = item.getFullYear();
        let month = item.getMonth() + 1;
        let seperator = '-';
        let temp: any = year + seperator + month;
        return temp;
    }

    setup() {
        // console.log('lishidi', this.createCompany);
        // let tempList = _.cloneDeep(this.createCompany);
        let isNotFullLine = false;
        // 之所以写2个forEach ,在下面再对 ngselect 的数据处理成后台要求的样子，是因为如果就地处理，那么第二次判断，即使有值也判断不过去了。
        _.forEach(this.createCompany, item => {
            // 判断是否为空，希望找到更好的方法
            if (!item.name) {
                item.needName = true;
                isNotFullLine = true;

            } else {
                item.needName = false;
                isNotFullLine = false;
            }

            if (!item.legalPersonName) {
                item.needLegalPersonName = true;
                isNotFullLine = true;

            } else {
                item.needLegalPersonName = false;
            }
            if (!item.taxNumber) {
                item.needTaxNumber = true;
                isNotFullLine = true;
            } else {
                item.needTaxNumber = false;
            }
            if (item.beginDate) {
                item.needBeginDate = false;
            } else {
                item.needBeginDate = true;
                isNotFullLine = true;
            }
            if (item.industry && item.industry[0] && item.industry[0].text) {
                item.needIndustry = false;
            } else {
                item.needIndustry = true;
                isNotFullLine = true;
            }
            if (item.companyProperty && item.companyProperty[0]) {
                item.needCompanyProperty = false;
            } else {
                item.needCompanyProperty = true;
                isNotFullLine = true;
            }
        });
        if (isNotFullLine) {
            return;
        }

        let dataList = [];
        let tempData = _.cloneDeep(this.createCompany);
        for (let i = 0; i < tempData.length; i++) {
            // tempData[i].companyProperty = 1;
            // console.log('tempData[i].openingDate', tempData[i].openingDate, typeof (tempData[i].openingDate));
            tempData[i].openingDate = moment(tempData[i].openingDate);
            // console.log('tempData.openingDate', tempData[i].openingDate);
            if (tempData[i].address.province && tempData[i].address.province[0]) {
                tempData[i].address.province = { id: tempData[i].address.province[0].id, name: tempData[i].address.province[0].text };
            }
            if (tempData[i].address.city && tempData[i].address.city[0]) {
                tempData[i].address.city = { id: tempData[i].address.city[0].id, name: tempData[i].address.city[0].text };
            }
            if (tempData[i].address.area && tempData[i].address.area[0]) {
                tempData[i].address.area = { id: tempData[i].address.area[0].id, name: tempData[i].address.area[0].text };
            }
            if (tempData[i].beginDate) {
                let tempDate: any = moment(tempData[i].beginDate).format('YYYY-MM-DD');
                tempData[i].beginDate = tempDate;
            }
            if (tempData[i].openingDate) {
                let tempDate: any = moment(tempData[i].openingDate).format('YYYY-MM-DD');
                tempData[i].openingDate = tempDate;
            }
            if (moment(tempData[i].beginDate).isAfter(moment(tempData[i].openingDate), 'month')) {
                this.alertDanger('开始记账月份不能小于成立日期！');
                return;
            }
            if (tempData[i].industry && tempData[i].industry[0] && tempData[i].industry[0].text) {
                tempData[i].industry = { id: tempData[i].industry[0].id, name: tempData[i].industry[0].text };
                dataList.push(tempData[i]);
            }
            if (tempData[i].companyProperty && tempData[i].companyProperty[0] && tempData[i].companyProperty[0].id) {
                tempData[i].companyProperty = tempData[i].companyProperty[0].id;
            }

        }
        tempData = dataList;
        console.log('this.create', tempData);
        this.isClick = true;
        this.accountBookApi.accountBookPost(tempData)
            .subscribe(
            data => {
                console.log('datapost', data);
                this.router.navigate(['/app/company-list']);
                this.isClick = false;
            },
            error => {
                console.log('errorlsd', error);
                this.alertDanger(error);
                this.isClick = false;
            }
            );
    }
    newItem() {
        let temp: any = _.cloneDeep(this.createCompanyModel);
        this.createCompany.push(temp);
    }
    cancel() {

    }
    selected(item, type, index) {
        console.log('lsditem', item);
        // if (type === 'property') {
        //     this.createCompany[index].companyProperty = item.text;
        // }
    }

    back() {
        this.router.navigate(['/create-ways', { showback: true }]);
    }
    delete(data, i) {
        let list = this.createCompany;
        list.splice(i, 1);
        console.log('JSOn11', JSON.stringify(this.createCompany));
        if (list && list.length < 1) {
            this.newItem();
        }
    }

    getIndustryList() {
        this.industryApi.industryGet()
            .subscribe(
            data => {
                console.log('lishidi', data);
                let i = 0;
                let temp = [];
                let dataTemp: any = data;
                for (i = 0; i < dataTemp.length; i++) {
                    temp[i] = ({ id: dataTemp[i].code, text: data[i].name });
                }
                this.industryList = temp;
                console.log('this.industryList', this.industryList);
            },
            error => {
                console.log('error', error);
            }
            );
    }

}
