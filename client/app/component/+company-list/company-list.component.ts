import { Component, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { AuthorizationService } from '../../service/core/authorization';
import { CompanyListService } from './shared/company-list.service';
import * as _ from 'lodash';
import { AccountBookApi } from '../../api/accounting/api/AccountBookApi';
import { ConfirmEventTypeEnum } from '../widget/confirm/confirm';
import { UserApi } from '../../api/accounting/api/UserApi';
import { ShareService } from '../../service/core/share';
import { AccountPeriodModels, Select } from '../../service/core/extended-interface';
import { PubSubService, EventType } from '../../service/pubsub.service';
import { PostingApi } from '../../api/accounting/api/PostingApi';
import { PostingModel } from '../../api/accounting/model/PostingModel';
import { GLOBAL_KEY } from './shared/company-key';
declare var $: any;


@Component({
    selector: 'company-list',
    templateUrl: './company-list.component.html',
    styleUrls: ['./company-list.component.scss'],
    providers: [PostingApi]
})

export class CompanyListComponent {
    // 邀请
    @ViewChild('inviteUserNewModal') public inviteUserNewModal;
    @ViewChild('inviteCustomerModal') public inviteCustomerModal;
    // 停用确认
    @ViewChild('stopConfirm') public stopConfirm;
    // 重发链接
    @ViewChild('reSendConfirm') public reSendConfirm;

    period: Array<string> = ['1', '2', '3', '4'];
    public dt: Date = void 0;
    // 测试月份
    searchModel = {
        pageIndex: '1',
        pageSize: '0',
        year: 0,
        month: 0,
        keyword: '',
        status: '',
        assignStatus: 'All'
    };
    url: any = '';
    // 是否显示搜索
    isSearch: boolean = true;
    companyLists: any;
    accountBookNum: number = 0;
    checkAssign: boolean = false;
    showInit: boolean = false;
    showAssign: boolean = false;
    showPosting: boolean = false;
    showCarryForward: boolean = false;
    showInProgress: boolean = false;
    alert: Object = {};
    // 临时替换用户
    currentItem: any;
    // 年
    year: any = this.shareService.year;
    // 月
    month: any = this.shareService.month;
    // 默认月
    defaultMonth: any;
    // 默认年
    defaultYear: any;
    // 年列表
    yearsList: Array<Select> = this.defaultYear;
    // 月列表
    monthsToList: Array<Select> = this.defaultMonth;
    // 科目余额表帐期
    accountPeriodModel: AccountPeriodModels;
    isCompanyPeriod: boolean = true;
    token;
    noData: boolean = false;
    postCount: number = 0;
    postList = [];
    originList: any;
    currentId;

    showSave: boolean;
    showEdit: boolean;
    showPost: boolean;
    companies: any = [];

    accountBookInvoiceModel = [{
        accountBookId: null,
        issueInvoiceAmount: null,
        receiveInvoiceAmount: null,
        year: null,
        month: null
    }];

    assist;
    account;

    selectIndex: number = 0;

    scroll: boolean = false;

    constructor(private shareService: ShareService, private userApi: UserApi, private router: Router, private route: ActivatedRoute,
        private postingApi: PostingApi, private accountBookApi: AccountBookApi, private companyListService: CompanyListService,
        private authorizationService: AuthorizationService, private pubSubService: PubSubService) {
    }

    ngOnInit() {
        this.noData = this.route.snapshot.params['list'] === 'nodata' ? true : false;
        this.getMonthes();
        this.search();
        this.accountAccountPeriod();
        console.log('document.body.clientHeight', document.body.clientHeight);

    }

    public alertSuccess(msg: string) {
        this.clearAlert();
        setTimeout(() => {
            this.alert = { type: 'success', msg: msg };
        }, 0);
    }

    public alertDanger(msg: string) {
        this.clearAlert();
        setTimeout(() => {
            this.alert = { type: 'danger', msg: msg };
        }, 0);
    }

    public addAlert(alert: Object): void {
        this.clearAlert();
        setTimeout(() => {
            this.alert = alert;
        }, 0);
    }

    public clearAlert(): void {
        this.alert = {};
    }


    search() {
        console.count('searchaccount');
        this.token = this.authorizationService.getSession();
        this.currentId = this.token.user.id;
        this.url = 'api/v1/accountbook/export_account_books?year=' + this.searchModel.year + '&month=' +
            this.searchModel.month + '&keyword=' + this.searchModel.keyword + '&status=' +
            this.searchModel.status + '&assignStatus=' + this.searchModel.assignStatus;
        console.log('this.searchModel', this.searchModel, this.currentId, this.token);
        this.companyListService.accountBookGet(this.searchModel.pageIndex, this.searchModel.pageSize, this.searchModel.year,
            this.searchModel.month, this.searchModel.keyword, this.searchModel.status, this.searchModel.assignStatus).then((data) => {
                console.log('lsd', data);
                this.originList = _.cloneDeep(data);
                this.companyLists = _.cloneDeep(data);
                this.companies = data.slice(0, 5);

                this.accountBookNum = this.companyLists.length;
                const height = document.body.clientHeight;
                const scrollNum = Math.floor((height - 204) / 44);
                if (this.accountBookNum >= scrollNum) {
                    $('#company-div').css({
                        'height': scrollNum * 44 + 50
                    });
                    $('.table-scroll > tbody').css({
                        'height': scrollNum * 44,
                        'position': 'absolute',
                        'overflow-y': 'scroll'
                    });
                } else {
                }

                console.log('this.accountBookNum', this.accountBookNum);
                _.forEach(this.companyLists, (item) => {
                    item.showSave = false;
                    item.showPost = false;
                    item.showEdit = false;
                    item.showCarry = false;
                    item.currentDate = item.currentDate.substring(0, 7);
                    if (item.account && this.currentId === item.account.id &&
                        (item.status === 'BeginningInit' || item.status === 'InProgress')) {
                        item.showEdit = true;
                    }
                    // 待过账
                    if (item.account && this.currentId === item.account.id && (item.status === 'Posting')) {
                        this.postCount += 1;
                        this.postList.push(item);

                        item.showPost = true;
                    }
                    // 待结转
                    if (item.account && this.currentId === item.account.id && (item.status === 'CarryForward')) {
                        item.showCarry = true;
                    }
                    if (item.status === 'InProgress') {
                        item.status = '进行中';
                    } else if (item.status === 'BeginningInit') {
                        item.status = '期初';
                    } else if (item.status === 'CarryForward') {
                        item.status = '待结转';
                    } else if (item.status === 'Posting') {
                        item.status = '待过账';
                    } else {
                        item.status = '已完结';
                    }
                });
                console.log('this.showsavelishid', this.companyLists);
            })
            .catch((error) => {
                console.log('errorlsdlsdlsd', error);
            });
    }

    post(item) {
        this.postingApi.postingPosting(item.id).subscribe(
            (postingModel) => {
                if (postingModel.postingStatus === PostingModel.PostingStatusEnum.Success) {
                    this.alertSuccess('成功过账');
                    this.reSearch();
                } else {
                    this.alertDanger(postingModel.message);
                }
            },
            (error) => {
                this.alertDanger(error);
            }
        );
    }

    reSearch() {
        this.checkAssign = false;
        this.searchModel = {
            pageIndex: '1',
            pageSize: '0',
            year: 0,
            month: 0,
            keyword: '',
            status: '',
            assignStatus: 'All'
        };
        this.defaultYear = '';
        this.defaultMonth = '';
        this.monthsToList = null;
        this.search();
    }

    changeSave(type, index) {
        this.companyLists[index].showEdit = true;
        this.companyLists[index].showSave = false;
        if (type === 'save') {
            this.accountBookInvoiceModel[0].accountBookId = this.companyLists[index].id;
            this.accountBookInvoiceModel[0].issueInvoiceAmount = this.companyLists[index].issueInvoiceAmount;
            this.accountBookInvoiceModel[0].receiveInvoiceAmount = this.companyLists[index].receiveInvoiceAmount;
            // let temp = moment(this.companyLists[index].currentDate).format('YYYY-MM-DD');
            this.accountBookInvoiceModel[0].year = this.companyLists[index].currentDate.substring(0, 4);
            this.accountBookInvoiceModel[0].month = this.companyLists[index].currentDate.substring(5, 7);
            this.invoice(index);
        } else {
            this.companyLists[index].issueInvoiceAmount = 0;
            this.companyLists[index].receiveInvoiceAmount = 0;

        }

    }

    changeEdit(i) {
        this.companyLists[i].showEdit = false;
        this.companyLists[i].showSave = true;
    }

    invoice(i) {
        this.accountBookApi.accountBookInvoiceAmount(this.accountBookInvoiceModel)
            .subscribe(
            data => {
                console.log('lishidiinvoice', data);
            },
            error => {
                this.companyLists[i].issueInvoiceAmount = null;
                this.companyLists[i].receiveInvoiceAmount = null;
            }
            );
    }

    // time
    removeYear() {
        this.searchModel.year = 0;
        this.searchModel.month = 0;
        this.search();
    }

    removeMonth() {
        this.searchModel.month = 0;
        this.defaultMonth = [{ id: '', text: '' }];

        this.search();

    }

    setTheMonth(e) {
        this.searchModel.month = e.text;
        this.defaultMonth = [{ id: this.searchModel.month, text: this.searchModel.month }];

        this.search();
    }

    setTheYear(e?) {
        this.searchModel.year = e.text;
        this.shareService.getMonthsToList(Number(e.text)).then(
            accountPeriodModel => {
                this.monthsToList = accountPeriodModel.MonthsToList;
                this.removeMonth();
            }
        );

    }

    getMonthes() {
        const tempPeriod = [];
        const month = new Date().getMonth() + 1;
        for (let i = 1; i <= month; i++) {
            tempPeriod.push(i);
        }
        this.period = tempPeriod.map(function (x) {
            return x + '月';
        });
    }

    selected(item) {
        this.searchModel.year = item.getFullYear();
        this.searchModel.month = item.getMonth() + 1;
        this.search();
    }

    // account：会计 ／／ assistant:助理 ／／ both 二选一
    assignAccount(item, index) {
        console.log('assignAccount index=>', index);
        this.inviteUserNewModal.type = 'account';
        this.inviteUserNewModal.companyId = item.id;
        this.selectIndex = index;
        console.log(this.inviteUserNewModal.isReplace);
        if (item.account) {

            const temp = {
                userId: item.account.id,
                companyId: '',
                accountBookId: item.id,
                role: 'Account',
                isEnable: 'N',
                name: item.account.name,
                phoneNumber: item.account.phoneNumber
            };
            this.currentItem = _.cloneDeep(temp);
            // 没接受邀请，要重发邀请
            if (!item.account.active) {
                console.log('<--分配助理--->', item);
                this.reSendConfirm.title = '操作';
                this.reSendConfirm.message = '当前会计为' + item.account.name + ',' + '电话号码为' + item.account.phoneNumber;
                this.reSendConfirm.otherText = '替换';
                this.reSendConfirm.confirmText = '重发邀请';
                this.reSendConfirm.cancelText = '取消';
                this.reSendConfirm.show();
            } else {
                this.stopConfirm.message = '当前会计为' + item.account.name + ',' + '电话号码为' + item.account.phoneNumber + '是否更换会计？';
                this.stopConfirm.confirmText = '确定更换';
                this.stopConfirm.show();
            }

        } else {
            this.inviteUserNewModal.confirmText = '确定选择';
            this.inviteUserNewModal.show();
        }
    }

    // 分配助理
    assignAssist(item, index) {
        this.inviteUserNewModal.type = 'assistant';
        this.inviteUserNewModal.companyId = item.id;
        this.selectIndex = index;
        console.log(this.inviteUserNewModal.isReplace);
        if (item.assistant) {

            const temp = {
                userId: item.assistant.id,
                companyId: '',
                accountBookId: item.id,
                role: 'Assistant',
                isEnable: 'N',
                name: item.assistant.name,
                phoneNumber: item.assistant.phoneNumber
            };
            this.currentItem = _.cloneDeep(temp);
            // 没接受邀请，要重发邀请
            if (!item.assistant.active) {
                console.log('<--分配助理--->', item);
                this.reSendConfirm.title = '操作';
                this.reSendConfirm.message = '当前助理为' + item.assistant.name + ',' + '电话号码为' + item.assistant.phoneNumber;
                this.reSendConfirm.otherText = '替换';
                this.reSendConfirm.confirmText = '重发邀请';
                this.reSendConfirm.cancelText = '取消';
                this.reSendConfirm.show();
            } else {
                this.stopConfirm.message = '当前助理为' + item.assistant.name + ',' + '电话号码为' + item.assistant.phoneNumber + '是否更换助理？';
                this.stopConfirm.confirmText = '确定更换';
                this.stopConfirm.show();
            }

        } else {
            this.inviteUserNewModal.confirmText = '确定选择';
            this.inviteUserNewModal.show();
        }


    }

    // 确定停用-
    stopUser(event) {
        if (event === ConfirmEventTypeEnum.Confirm) {
            this.stopAndInvite();
        }
    }

    // 停用并邀请
    stopAndInvite() {
        this.userApi.userUpdateUserStatus(this.currentItem)
            .subscribe(
            (data) => {
                console.log('---------=>data', data, this.currentItem, this.selectIndex);
                // this.alertSuccess('用户停用成功');
                if (this.currentItem.role === 'Assistant') {
                    this.companyLists[this.selectIndex].assistant = null;
                    this.originList[this.selectIndex].assistant = null;
                } else if (this.currentItem.role === 'Account') {
                    this.companyLists[this.selectIndex].account = null;
                    this.originList[this.selectIndex].account = null;
                }
                this.inviteUserNewModal.isSetting = false;
                this.inviteUserNewModal.show();
            }, (error) => {
                console.log('---------=>error', error);
                // this.alertDanger(error);
            });
    }

    // 重发邀请还是更换
    reSend(event) {
        console.log('<stop user>', event);
        if (event === ConfirmEventTypeEnum.Confirm) {
            this.reSendUrl();
        } else if (event === ConfirmEventTypeEnum.Other) {
            this.stopAndInvite();
        }
    }

    // 重发邀请
    reSendUrl() {
        const user = {
            id: this.currentItem.userId,
            name: this.currentItem.name,
            phoneNumber: this.currentItem.phoneNumber,
            accountBookId: this.currentItem.accountBookId,
            roles: [{
                roleType: this.currentItem.role,
                isEnabled: true
            }],
        };
        this.userApi.userInvite(user)
            .subscribe(
            (data) => {
                this.alertSuccess('重发邀请成功！');
            },
            (error) => {
                console.log('-----inviteUser----=>error', (error));
                this.alertDanger(error);
            });
    }

    // 分配客户联系人，邀请客户

    assignCustomer(item) {
        this.inviteCustomerModal.companyId = item.id;
        console.log(this.inviteCustomerModal.isReplace, item);
        if (item.customer) {
            this.inviteCustomerModal.modalContent = '当前客户为' + item.customer.name + ',' + '电话号码为' + item.customer.phoneNumber + '是否修改客户联系人？';
            const temp = {
                // id: item.customer.id,
                name: item.customer.name,
                phoneNumber: item.customer.phoneNumber,
                accountBookId: item.customer.accountBookId,
                roles: [{
                    roleType: 4
                }],
            };
            this.inviteCustomerModal.show(temp);
        } else {
            this.inviteCustomerModal.confirmText = '确定选择';
            this.inviteCustomerModal.show();
        }
    }

    showSearch() {
        this.isSearch = !this.isSearch;
    }

    searchBlur() {
        this.search();
    }

    enterCompany(i) {
        // 将前5个公司存起来
        localStorage.setItem('fiveCompanies', JSON.stringify(this.companies));
        this.pubSubService.publish({
            type: EventType.SwitchAccount,
            data: ''
        });

        // this.companyLists
        this.authorizationService.getAcountBookRoles(this.originList[i]).then((data) => {
            console.log('datanavbar', data);
            switch (data) {
                case 'canAccount':
                    localStorage.setItem(GLOBAL_KEY.COMPANYTYPE, JSON.stringify(this.originList[i]));
                    this.router.navigate(['app/home-page/accounting']);
                    break;
                case 'canAssistAccount':
                case 'canAssist':
                    localStorage.setItem(GLOBAL_KEY.COMPANYTYPE, JSON.stringify(this.originList[i]));
                    this.router.navigate(['app/home-page/assist']);
                    break;
                case 'cannotAccount':
                    localStorage.setItem(GLOBAL_KEY.COMPANYTYPE, JSON.stringify(this.originList[i]));
                    this.router.navigate(['app/finance/beginningPeriod']);
                    break;
                case 'cannotAssist':
                    this.alertDanger('期初账还未设置，您不能进入该账套，请进入账套设置期初账');
                    break;
                case 'canManagerAssist':
                case 'manager':
                    localStorage.setItem(GLOBAL_KEY.COMPANYTYPE, JSON.stringify(this.originList[i]));
                    this.router.navigate(['app/setting/company-billing']);
                    break;
                default:
                    return true;
            }
        })
            .catch((error) => {
                console.log('errorlsdlsdlsd', error);
            });
    }

    newItemAdded(item) {
        console.log('itemresult', item);
        this.search();
    }

    result(resultObj) {
        console.log('resultObjlsd', resultObj);
        this.alertSuccess(resultObj.msg);
    }

    resultCustomer(resultObj) {
        this.search();
        this.alertSuccess(resultObj.msg);
    }

    newCustomerAdded(item) {
    }

    changeCheck() {
        this.checkAssign = !this.checkAssign;
        if (this.checkAssign) {
            this.searchModel.assignStatus = 'UnAssign';
        } else {
            this.searchModel.assignStatus = 'All';
        }
        this.search();
    }

    // 科目余额表时间
    accountAccountPeriod() {
        this.shareService.accountAccountPeriod(this.isCompanyPeriod).then(
            accountPeriodModel => {
                if (accountPeriodModel) {
                    this.year = accountPeriodModel.currentYear;
                    this.month = accountPeriodModel.currentMonth;
                    this.accountPeriodModel = accountPeriodModel;
                    this.yearsList = this.accountPeriodModel.YearList;
                }
            },
            error => {
                console.log(error);
            }
        );
    }

    /**
     *
     */
    selectYear(e) {
        console.log(e);
    }
    /**
     * 导出
     */
    export() {
        this.accountBookApi.accountBookExportAccountBooks(
            this.searchModel.year,
            this.searchModel.month,
            this.searchModel.keyword,
            this.searchModel.status,
            this.searchModel.assignStatus).
            subscribe(data => {
                console.log(data);
                const url: any = data;
                const elemIF = document.createElement('iframe');
                elemIF.src = url;
                elemIF.style.display = 'none';
                document.body.appendChild(elemIF);
                this.alertSuccess('导出成功');
            }, error => {
                this.alertDanger(error);
            });
    }
}
