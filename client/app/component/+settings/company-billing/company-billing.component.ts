import {
    Component, OnInit, AfterViewInit, OnDestroy,
    ChangeDetectorRef, NgZone, ViewChild
} from '@angular/core';

import { AccountBookApi } from '../../../api/accounting/api/AccountBookApi';
import { AccountBookModel } from '../../../api/accounting/model/AccountBookModel';
import { OrderApi } from '../../../api/identity/api/OrderApi';
import { CompanyApi } from '../../../api/identity/api/CompanyApi';
import { IndustryApi } from '../../../api/identity/api/IndustryApi';
import { InvoiceApi } from '../../../api/identity/api/InvoiceApi';
import { RegionApi } from '../../../api/accounting/api/RegionApi';
import { ConfirmEventTypeEnum } from '../../widget/confirm/confirm';
import { StorageService, AuthorizationService } from '../../../service/core';
import { UtilityService } from '../../../service/core/utility';
import * as _ from 'lodash';
import { ActivatedRoute } from '@angular/router';
import { PubSubService, EventType } from '../../../service/pubsub.service';
import { Subscription } from 'rxjs/Subscription';
import * as moment from 'moment';


declare var $: any;
@Component({
    selector: 'gpw-company-billing',
    templateUrl: './company-billing.component.html',
    styleUrls: ['./company-billing.component.scss'],
    providers: [CompanyApi, IndustryApi, RegionApi, OrderApi, InvoiceApi, AccountBookApi],

})

export class CompanyBillingComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild('confirmWidget') public confirmModal;
    // 管理员
    isManager: boolean = false;
    // 会计
    isAccount: boolean = false;
    // 助理
    isAssist: boolean = false;
    startDate = '';

    companyModel: any = {
        id: '',
        name: '',
        legalPersonName: '',
        registeredCapital: null,
        serviceDeadline: null,
        beginDate: null,
        taxNumber: '',
        companyProperty: null,
        industry: {
            id: '',
            name: '',
        },
        openingDate: null,
        status: null,
        address: {
            street: '',
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
        }
    };
    company: any = _.cloneDeep(this.companyModel);

    address: any = {
        street: '',
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
    };
    invoice: any = {
        title: '',
        amount: 0,
        orderIds: [],
        invoiceTypeCode: 'vat_general',
        requestedBy: ''
    };
    provinceList: Array<Object>;
    cityList: Array<Object>;
    districtList: Array<Object>;
    currentUser: any;
    public companyTypes: any =
    [{ id: 'SmallScale', text: '小规模纳税人' },
    { id: 'GeneralTaxpayer', text: '一般纳税人' }];
    currentType: any;

    industryList: any;
    beforeApi: boolean = true;
    firstTime: boolean = true;
    iseditcompany: boolean = false;
    isinvoice: boolean = false;
    orderList: any = [];
    dataList: any = [];
    clearHint = false;
    pageIndex: number = 1;
    pageSize: number = 10;
    recordCount: number = 0;
    maxSize: number = 5;
    companyaddress: string = '';
    isshowOrderList: boolean = true;
    openingDateEdit: boolean = false;
    companyHistory: any;
    subscription: Subscription;
    // 编辑前 启用账套日期
    originOpeningDate;
    // 编辑后的账套model
    afterCompany;


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

    constructor(private route: ActivatedRoute, private accountBookApi: AccountBookApi,
        private invoiceApi: InvoiceApi, private industryApi: IndustryApi,
        private orderApi: OrderApi, private companyApi: CompanyApi, private regionApi: RegionApi,
        private utilityService: UtilityService, private authorizationService: AuthorizationService, private pubSubService: PubSubService,
        private storageService: StorageService, private ref: ChangeDetectorRef, private zone: NgZone) {
        this.currentUser = this.authorizationService.Session.user;
    }

    public editCompany() {
        this.getIndustry();
        this.getAddress();
        this.companyHistory = _.cloneDeep(this.company);
        this.iseditcompany = true;
        this.ref.detectChanges();
    }
    public canceleditCompany() {
        this.company = _.cloneDeep(this.companyHistory);
        this.iseditcompany = false;
        this.clearAlert();
        this.firstTime = true;
        // this.getCompanyInfo(this.currentUser.currentCompany.id);
    }
    // 拼装 公司地址
    public getcompanyaddress() {
        this.companyaddress = '';
        console.log(this.company.address);
        if (this.company.address) {
            if (this.company.address.province && this.company.address.province[0] && this.company.address.province[0].text) {
                this.companyaddress += this.company.address.province[0].text;
            }
            if (this.company.address.city && this.company.address.city[0] && this.company.address.city[0].text) {
                this.companyaddress += this.company.address.city[0].text;
            }
            if (this.company.address.area && this.company.address.area[0] && this.company.address.area[0].text) {
                this.companyaddress += this.company.address.area[0].text;
            }
            if (this.company.address.street) {
                this.companyaddress += this.company.address.street;
            }
        }
        console.log(this.companyaddress);
    }
    public editInvoice() {
        this.isinvoice = true;


    }
    public cancelInvoice() {
        this.clearHint = false;
        this.isinvoice = false;
        this.clearAlert();
        this.orderList = [];
        this.getOrderList();
        this.dataList = [];
        this.invoice = {
            title: '',
            amount: 0,
            orderIds: [],
            invoiceTypeCode: 'vat_general',
            requestedBy: ''
        };

    }


    ngOnInit() {
        let token = this.authorizationService.getSession();
        let roles = _.cloneDeep(token.user.currentRole);
        if (roles) {
            roles.forEach(element => {
                if (element === 'Manager') {
                    this.isManager = true;
                } else if (element === 'Account') {
                    this.isAccount = true;
                } else if (element === 'Assistant') {
                    this.isAssist = true;
                }
            });
        }


        let accountId = this.storageService.getToken().currentAccount.id;
        this.zone.run(() => {
            this.getAccountInfo(accountId);
        });
        this.initOnCompanyChange();
        // this.getOrderList();
        // this.hasInvoice();
    }

    initOnCompanyChange() {
        if (this.pubSubService.pub$.subscribe) {
            this.subscription = this.pubSubService.pub$.subscribe(event => {
                // 切换账套
                if (event.type === EventType.SwitchCompanyBilling) {
                    this.switch();
                    console.count('监听次数：');
                }
            });
        }
    }
    // 管理员可编辑
    switch() {
        let token = this.authorizationService.getSession();
        console.log('tokenlishidi0523', token);
        let roles = _.cloneDeep(token.user.currentRole);
        if (roles) {
            roles.forEach(element => {
                if (element === 'Manager') {
                    this.isManager = true;
                } else if (element === 'Account') {
                    this.isAccount = true;
                } else if (element === 'Assistant') {
                    this.isAssist = true;
                }
            });
        }
        let accountId = this.storageService.getToken().currentAccount.id;
        this.zone.run(() => {
            this.getAccountInfo(accountId);
        });

    }
    /**
     * 更新token中账套名称
     * @param data -> 获取账套信息的数据 来更新token和navBar
     */
    setToken(data) {
        // 更新token中账套名称
        let token = this.storageService.getToken();
        token.currentAccount.name = data.name;
        let fiveAccounts: any = JSON.parse(localStorage.getItem('fiveCompanies'));
        let index = _.findIndex(fiveAccounts, function (item: any) { return item.id === data.id; });
        fiveAccounts[index] = data;
        localStorage.setItem('fiveCompanies', JSON.stringify(fiveAccounts));

        let newFive = localStorage.getItem('fiveCompanies');
        console.log('newFive', newFive);
        this.pubSubService.publish({
            type: EventType.CurrentAccountUpdate,
            data: ''
        });
        this.authorizationService.setSession(token);
        console.log('latest tokenlishidid', this.storageService.getToken());
    }
    //获取账套信息
    getAccountInfo(accountId) {
        this.accountBookApi.accountBookGet_1(accountId)
            .subscribe(
            (data) => {
                this.company = _.cloneDeep(data);
                // 更新token中账套名称
                this.setToken(data);
                if (data.industry) {
                    this.company.industry = [{ id: data.industry.id, text: data.industry.name }];
                }else {
                    this.company.industry = [];
                }
                // this.companyTypes.forEach(element => {
                //     if (element.id === this.company.companyProperty) {
                //         this.currentType = element.name;
                //     }
                // });
                this.currentType = this.company.companyProperty === AccountBookModel.CompanyPropertyEnum.SmallScale ? '小规模纳税人' : '一般纳税人';
                if (!this.company.address) {
                    this.company['address'] = this.address;
                } else {
                    this.company.address.province = this.company.address.province ?
                        [{ id: this.company.address.province.id, text: this.company.address.province.name }] : [];
                    this.company.address.city = this.company.address.city ?
                        [{ id: this.company.address.city.id, text: this.company.address.city.name }] : [];
                    this.company.address.area = this.company.address.area ?
                        [{ id: this.company.address.area.id, text: this.company.address.area.name }] : [];
                    if (this.company.address.province !== [] && this.company.address.province.length > 0) {
                        this.setCityList(this.company.address.province[0]);
                    }
                    if (this.company.address.city !== [] && this.company.address.city.length > 0) {
                        this.setDistrictList(this.company.address.city[0]);
                    }
                }
                // moment(this.company.businessEndDate).format('YYYY-MM-DD');
                this.company.serviceDeadline = this.adjustDate(this.company.serviceDeadline);
                this.company.openingDate = this.adjustDate(this.company.openingDate);
                this.originOpeningDate = this.company.openingDate;
                this.company.currentDate = this.adjustDate(this.company.currentDate);
                this.company.beginDate = this.adjustDate(this.company.beginDate);
                this.beforeApi = false;
                this.openingDateEdit = this.company.beginningNavigation.value === 'BeginningInit' ? true : false;
                this.getcompanyaddress();
                setTimeout(() => this.ref.markForCheck(), 10);
                console.log('<===accountid===>data', this.address, data, this.company, data.beginningNavigation.value);
            }, (error) => {
                console.log('<===accountid===>error', accountId, JSON.stringify(error));
                this.alertDanger(error);
            });
    }
    // 适配时间
    adjustDate(date): any {
        if (date === null) {
            return '';
        } else {
            return moment(date).format('YYYY-MM-DD');
        }
    }

    ngAfterViewInit() {
        let l = this.route.snapshot.params['location'];
        if (l) {
            $('html,body').animate({ scrollTop: $('#box').offset().top }, 1000);
            this.authorizationService.updateCurrentCompanyInfo();
        }
    }
    // 行业
    getIndustry() {
        this.industryApi.industryGetAll()
            .subscribe(
            data => {
                let i = 0;
                let temp = [];
                let dataTemp: any = data;
                for (i = 0; i < data.length; i++) {
                    temp[i] = ({ id: dataTemp[i].code, text: data[i].name });
                }
                this.industryList = temp;

            },
            error => {
                console.log('error', error);
            });
    }

    hasInvoice() {
        this.invoiceApi.invoiceSearch(this.currentUser.currentCompany.id).subscribe(
            data => {
                console.log(data);
                if (data.recordCount > 0) {
                    if (data.list[0].title) {
                        this.invoice.title = data.list[0].title;
                    }

                } else {
                    this.invoice.title = this.currentUser.currentCompany.companyName;
                }
            });

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
                this.alertDanger(error);
                console.log('error', error);
            });
    }
    // 选省-》获取市
    provinceSelect(value) {
        this.company.address.city = [];
        this.company.address.area = [];
        this.cityList = [];
        this.districtList = [];
        this.setCityList(value);
    }
    // 初始化的时候应该获取市数组
    setCityList(value) {
        this.regionApi.regionGet(value.id)
            .subscribe(
            data => {
                console.log('<--provinceSelect-->', value, data);
                let i = 0;
                let temp = [];
                let dataTemp: any = data;
                for (i = 0; i < dataTemp.length; i++) {
                    temp[i] = ({ id: dataTemp[i].code, text: dataTemp[i].name });
                }
                this.cityList = temp;
                // this.ref.detectChanges();
            },
            error => {
                console.log('error', error);
                this.alertDanger(error);
            });
    }
    // 选市-》获取区
    citySelect(value) {
        this.company.address.area = [];
        this.districtList = [];
        this.setDistrictList(value);
    }
    // 初始化的时候应该获取地区数组
    setDistrictList(value) {
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
                this.ref.detectChanges();
            }, error => {
                console.log('error', error);
                this.alertDanger(error);
            });
    }
    //时间选择
    selectedMonth(args, type) {
        this.company.openingDate = moment(args).format('YYYY-MM-DD');
        console.log('<--->', args, type, this.company.openingDate);
        // 
    }
    //#endregion
    // 报存账套信息
    updataAccount() {
        console.log(this.company, this.company.openingDate);

        if (this.company.name === '' || this.company.legalPersonName === '' || this.company.beginDate === null || this.company.currentDate === null ||
            this.company.openingDate === null || this.company.beginDate === '' || this.company.currentDate === '' ||
            this.company.openingDate === '' ||
            this.company.taxNumber === '' || this.company.companyProperty === null || this.company.industry === null) {
            return;
        }
        // 注册资本小于等于零是，直接置为空
        if (this.company.registeredCapital <= 0) {
            this.company.registeredCapital = null;
        }
        let companyTemp = _.cloneDeep(this.company);
        companyTemp.industry = { id: this.company.industry[0].id, name: this.company.industry[0].text };
        if (this.company.address.province && this.company.address.province[0]) {
            companyTemp.address.province = { id: this.company.address.province[0].id, name: this.company.address.province[0].text };
        } else {
            companyTemp.address.province = null;
        }
        if (this.company.address.city && this.company.address.city[0]) {
            companyTemp.address.city = { id: this.company.address.city[0].id, name: this.company.address.city[0].text };
        } else {
            companyTemp.address.city = null;
        }
        if (this.company.address.area && this.company.address.area[0]) {
            companyTemp.address.area = { id: this.company.address.area[0].id, name: this.company.address.area[0].text };
        } else {
            companyTemp.address.area = null;
        }

        console.log(this.company, this.address, companyTemp);
        // 启用期初账-》直接保存账套信息
        this.saveCompanyInfo(companyTemp);

        // if (this.company.beginningNavigation.value !== 'Enabled') {
        //     /**
        //      *  如果启用账套日期改到晚于当前会计区间 或者不修改 -》不弹框
        //      *  您已经录入的期初信息晚于此月份，继续更改将清空所有的期初信息，是否继续【是】【否】
        //      *  如果编辑了启用账套日期 && 没有启用期初账-》先保存启用账套日期
        //      */
        //     let currentPeriod = localStorage.getItem('currentPeriod').substr(0, 7);
        //     currentPeriod = currentPeriod + '-01';
        //     console.log('<-------->', currentPeriod, companyTemp.openingDate);

        //     if (moment(currentPeriod).isSameOrBefore(moment(companyTemp.openingDate)) ||
        //         moment(this.originOpeningDate).isSame(moment(companyTemp.openingDate))) {
        //         this.saveCompanyInfo(companyTemp);
        //     } else {
        //         this.afterCompany = _.cloneDeep(companyTemp);
        //         this.confirmModal.show();
        //         this.confirmModal.title = '提示';
        //         this.confirmModal.confirmText = '是';
        //         this.confirmModal.cancelText = '否';
        //     }
        // } else {
        //     //启用期初账-》直接保存账套信息
        //     this.saveCompanyInfo(companyTemp);
        // }
    }
    // 更改启用账套日期 弹窗回调
    resault(event) {
        if (event === ConfirmEventTypeEnum.Confirm) {
            let date = moment(this.company.openingDate).format('YYYY-MM-DD');
            let year = Number(date.substring(0, 4));
            let month = Number(date.substring(5, 7));
            console.log(year, month);
            this.accountBookApi.accountBookPutOpeningDate(year, month).subscribe(
                data => {
                    this.saveCompanyInfo(this.afterCompany);
                }, error => {
                    this.alertDanger(error);
                }
            );
        } else {
            this.afterCompany.openingDate = this.originOpeningDate;
            this.saveCompanyInfo(this.afterCompany);
        }
    }
    //保存账套信息
    saveCompanyInfo(companyTemp) {
        this.accountBookApi.accountBookPut(companyTemp)
            .subscribe(
            (data) => {
                this.alertSuccess('修改账套信息成功！');
                this.beforeApi = true;
                this.firstTime = true;
                this.getAccountInfo(data.id);
                this.iseditcompany = false;
                // this.refreshCompanySession();
                console.log('<---updataAccount---->data', JSON.stringify(data));
            }, (error) => {
                console.log('<---updataAccount---->error', JSON.stringify(error));
                this.alertDanger(error);
            });
    }

    refreshCompanySession() {
        let companyId = this.authorizationService.Session.user.currentCompany.id;
        this.companyApi.companyGetCompany(companyId).subscribe(
            data => {
                let token = this.storageService.getToken();
                token.user.currentCompany = data;
                let fiveAccounts: any = JSON.parse(localStorage.getItem('fiveCompanies'));
                let index = _.findIndex(fiveAccounts, function (item: any) { return item.id === data.id; });
                fiveAccounts[index] = data;
                localStorage.setItem('fiveCompanies', fiveAccounts);

                let newFive = localStorage.getItem('fiveCompanies');
                console.log('newFive', newFive);

                this.authorizationService.setSession(token);
                console.log('latest token', this.storageService.getToken());
            }, error => {
                this.alertDanger(error);
            }
        );
    }


    getOrderList() {
        this.orderApi.orderSearch(this.currentUser.currentCompany.id, this.pageIndex.toString(), this.pageSize.toString())
            .subscribe(
            data => {
                this.orderList = [];
                _.forEach(data.list, (item) => {
                    let tempData: any = item;
                    tempData.selected = false;
                    this.orderList.push(tempData);
                });
                this.pageIndex = data.pageIndex;
                this.pageSize = data.pageSize;
                this.recordCount = data.recordCount;
                if (this.recordCount === 0) {
                    this.isshowOrderList = false;
                }
            }, error => {
                console.log('error', error);
            });
    }

    triggerSelection(item) {
        if (!item.selected) {
            this.dataList.pop(item);
        } else {
            this.dataList.push(item);
        }
        let tempAmont = 0;
        _.forEach(this.dataList, (forEachItem) => {
            tempAmont += forEachItem.nettAmount;
            if (this.invoice.orderIds.indexOf(forEachItem.id) <= -1) {
                this.invoice.orderIds.push(forEachItem.id);
            }
        });
        this.invoice.amount = tempAmont;
    }

    createInvoice() {
        this.clearHint = true;
        this.invoice.requestedBy = this.currentUser.id;
        if (this.dataList.length === 0 || this.invoice.amount === 0) {
            this.alertDanger('开票金额不能为0');
        } else {
            if (this.invoice.title) {
                this.invoiceApi.invoiceCreate(this.invoice)
                    .subscribe(
                    data => {
                        this.alertSuccess('申请开发票成功');
                        this.cancelInvoice();
                    }, error => {
                        this.alertDanger(error);
                    });
            }
        }
    }

    public pageChanged(event: any): void {
        this.pageIndex = event.page;
        this.getOrderList();
    };

    ngOnDestroy() {
    this.ref.detach(); // try this
    // this.authObserver.unsubscribe(); // for me I was detect changes inside "subscribe" so was enough for me to just unsubscribe;
  }

}
