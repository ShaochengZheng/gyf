import { Component, OnInit, ElementRef, OnDestroy, AfterViewInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { AuthorizationService } from '../../../service/core';
import { CompanyApi } from '../../../api/identity/api/CompanyApi';
import { AccountBookApi } from '../../../api/accounting/api/AccountBookApi';

import { PubSubService, EventType } from '../../../service/pubsub.service';
import { Subscription } from 'rxjs/Subscription';
import * as _ from 'lodash';
declare var jQuery: any;

@Component({
    selector: 'sidebar',
    styleUrls: ['./sidebar.scss'],
    templateUrl: './sidebar.html',
    providers: [CompanyApi, AccountBookApi]
})
export class Sidebar implements OnInit, OnDestroy, AfterViewInit {
    @Input('changeDirection') change: boolean = false;
    currentUser: any;
    $el: any;
    financeChildShow: boolean = true;
    invoiceChildShow: boolean = true;
    urlSub: any;
    config: any;
    companyName: any;
    sidebarshow: boolean = true;

    navChildShow: boolean = true;
    transactionChildShow: boolean = true;
    salaryChildShow: boolean = true;
    reportChildShow: boolean = true;
    fixedAssetChildShow: boolean = true;
    // 是否显示
    //  * 收支 transaction
    isTransaction: boolean = true;
    // * 发票 invoice
    isInvoice: boolean = true;
    // * 工资 salary
    isSalary: boolean = true;
    // * 固定资产 fixed-assets
    isFixedAssets: boolean = true;
    // * 财务 finance
    isFinance: boolean = true;
    // * 账户 account
    isAccount: boolean = true;
    // * 报表 reports
    isReports: boolean = true;
    // * 各种表
    //  * 设置 setting
    isSetting: boolean = true;
    // * 管理员 判断
    isManager: boolean = false;
    token;
    goAssist: boolean = false;
    goAccount: boolean = true;
    subscription: Subscription;

    display: boolean = true;
    // 隐藏导入期初的按钮
    hideBeginP: boolean = true;
    // 
    constructor(el: ElementRef, private router: Router, private pubSubService: PubSubService,
        private authorizationService: AuthorizationService,
        private location: Location, private companyApi: CompanyApi, private accountBookApi: AccountBookApi) {
        this.config = authorizationService.Config;
        this.$el = jQuery(el.nativeElement);
        this.router = router;

        this.token = this.authorizationService.getSession();
        if (this.token) {
            if (_.includes(this.token.user.currentRole, 'Account')) {
                this.isFinance = false;
            } else {
                this.isFinance = true;
            }
        };
        if (this.token.currentAccount && this.token.currentAccount.status !== 'InProgress') {
            this.display = false;
        } else {
            this.display = true;
        }
        if (router.events.subscribe) {
            router.events.debounceTime(1).distinctUntilChanged().subscribe(() =>
                (this.hideMenu(), this.getpermission(), this.hideChild(), this.init()));
        }

    }



    ngAfterViewInit(): void {
        jQuery('body').click((event) => {
            if (this.$el.find('#sidebar').hasClass('in')) {
                this.hideMenu();
            }
        });
        let child = document.getElementById('side-menu-child');
        child.style.height = jQuery(window).height() + 'px';
        window.onresize = function () {
            /*调整窗口自动调整宽度*/
            jQuery(window).resize(function () {
                child.style.height = jQuery(window).height() + 'px';
                // var w = jQuery(window).width();
            });
        };
    }

    ngOnDestroy(): void {
        // this.urlSub.unsubscribe();
        jQuery('body').unbind('click');
    }

    ngOnInit(): void {
        let role = localStorage.getItem('role');
        this.initOnCompanyChange();
        this.checkIsManager();
         this.getAccountPeriod();
        // this.checkAccountStatus();
    }

    /**
     * 监测当前 人的身份是否是 管理员
     */
    checkIsManager() {
        let roles = this.token.user.currentRole;
        if (roles) {
            roles.forEach(element => {
                if (element === 'Manager') {
                    this.isManager = true;
                };
            });
        }
    }
    initOnCompanyChange() {
        if (this.pubSubService.pub$.subscribe) {
            this.subscription = this.pubSubService.pub$.subscribe(event => {
                // 切换账套
                if (event.type === EventType.SwitchAccount) {
                    this.go();
                };
                if (event.type === EventType.hideChild) {
                    this.hideChild();
                    this.init();
                };
                if (event.type === EventType.Rollback) {
                    this.getAccountPeriod();
                };
            });
        }
    }
    public init() {
        this.transactionChildShow = true;
        this.invoiceChildShow = true;
        this.reportChildShow = true;
        this.financeChildShow = true;
        this.salaryChildShow = true;
        this.fixedAssetChildShow = true;
    }

    public navChildToggle() {
        this.navChildShow = false;
    }

    public hideChild() {
        this.navChildShow = true;
    }
    transactionChildToggle() {
        this.init();
        this.navChildToggle();
        this.transactionChildShow = !this.transactionChildShow;
        let childrenWidth = document.getElementById('children');
        childrenWidth.style.width = 678 + 'px';
    }
    reportChildToggle() {
        this.init();
        this.navChildToggle();
        this.reportChildShow = !this.reportChildShow;
        let childrenWidth = document.getElementById('children');
        if (this.token.user.currentRole && ((this.token.user.currentRole.indexOf('Account') > -1
            && this.token.user.currentRole.indexOf('Assistant') > -1))||this.token.user.currentRole.indexOf('Account') > -1) {
            childrenWidth.style.width = 678 + 'px';

        } else {
            childrenWidth.style.width = 339 + 'px';
        }

    }
    salaryChildToggle() {
        this.init();
        this.navChildToggle();
        this.changeWidth();
        this.salaryChildShow = !this.salaryChildShow;
    }
    financeChildToggle() {
        this.init();
        this.navChildToggle();
        this.changeWidth();
        this.financeChildShow = !this.financeChildShow;
    }
    invoiceChildToggle() {
        this.init();
        this.navChildToggle();
        this.changeWidth();
        this.invoiceChildShow = !this.invoiceChildShow;
    }
    fixedAssetChildToggle() {
        this.init();
        this.navChildToggle();
        this.changeWidth();
        this.fixedAssetChildShow = !this.fixedAssetChildShow;
    }

    changeWidth() {
        let childrenWidth = document.getElementById('children');
        childrenWidth.style.width = 339 + 'px';
    }

    hideMenu() {
        this.change = false;
        if (window.screen.width <= 768) {
            this.$el.find('#sidebar').collapse('hide');
        }
        let pathname = location.pathname.split(';');
        if (this.config.hideurl.indexOf(pathname) > -1) {
            this.sidebarshow = false;
        } else {
            this.sidebarshow = true;
        }
    }

    go() {
        this.token = this.authorizationService.getSession();
        if (this.token && this.token.user) {
            if (this.token.user.currentRole && this.token.user.currentRole.indexOf('Account') > -1
                && this.token.user.currentRole.indexOf('Assistant') > -1) {
                if (this.token.currentAccount && this.token.currentAccount.status === 'InProgress') {
                    this.goAssist = true;
                } else {
                    this.goAssist = false;
                }
            } else if (this.token.user.currentRole && this.token.user.currentRole.indexOf('Account') > -1) {
                this.goAssist = false;
            } else {
                this.goAssist = true;
            }
            if (this.token.currentAccount && this.token.currentAccount.status !== 'InProgress') {
                this.display = false;
            } else {
                this.display = true;
            }

        }

    }
    // 获得权限
    getpermission() {
        //  * 收支 transaction
        this.isTransaction = this.authorizationService.getpermission('transaction');
        // * 发票 invoice
        this.isInvoice = this.authorizationService.getpermission('invoice');
        // * 工资 salary
        this.isSalary = this.authorizationService.getpermission('salary');
        // * 固定资产 fixed-assets
        this.isFixedAssets = this.authorizationService.getpermission('fixed-assets');
        // * 财务 finance
        this.isFinance = this.authorizationService.getpermission('finance');
        // * 账户 account
        this.isAccount = this.authorizationService.getpermission('account');
        // * 报表 reports
        // this.isReports = this.authorizationService.getpermission('reports');
        // * 设置 setting
        // this.isSetting = this.authorizationService.getpermission('setting');
        this.go();
    }
    // 获取期初年月
    getAccountPeriod() {
        if (this.authorizationService.Session && this.authorizationService.Session.currentAccount &&
            this.authorizationService.Session.currentAccount !== null
            && this.authorizationService.Session.currentAccount.id) {
            this.accountBookApi.accountBookGet_1(this.authorizationService.Session.currentAccount.id)
                .subscribe(
                accountBookModel => {
                    // 更新帐套状态
                    this.authorizationService.updateCurrentAccount(accountBookModel);
                    let currentDate = accountBookModel.currentDate;
                    let tempDate: any = accountBookModel.openingDate;
                    let enableTime = tempDate.toString().substr(0, 7);
                    if (enableTime !== currentDate.toString().substr(0, 7)) {
                        this.hideBeginP = false;
                    } else {
                        this.hideBeginP = true;
                    };
                    if (accountBookModel.status.toString() === 'InProgress') {
                        this.display = true;
                    } else {
                        this.display = false;
                    }
                },
                (error) => {
                    console.log(error);
                });
        }
    }
}
