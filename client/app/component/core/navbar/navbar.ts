import { Component, ElementRef, NgZone, OnInit, ViewChild, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthorizationService, LoaderService } from '../../../service/core';
import { AccountApi } from '../../../api/identity/api/AccountApi';
import { LetterApi } from '../../../api/identity/api/LetterApi';
import { PubSubService, EventType } from '../../../service/pubsub.service';
import { Subscription } from 'rxjs/Subscription';
import { StorageService } from '../../../../app/service/core/storage';
import { AccountBookApi } from '../../../api/accounting/api/AccountBookApi';


@Component({
    selector: 'navbar',
    styleUrls: ['./navbar.scss'],
    templateUrl: './navbar.html',
    providers: [AccountApi, LetterApi, AccountBookApi]
})
export class Navbar implements OnInit {
    // 账套列表navbar 最左边的显示不一样
    @Input('hideOne') hideLeft: boolean;
    @ViewChild('personalInfoModal') public personalInfoModal;
    @ViewChild('displayLettersModal') public displayLettersModal;
    currentUser: any;
    daysLeft;
    userId: string;
    hiednav: boolean = false;
    companyId: string;
    config: any;
    alert: Object = {};
    companyName: string;
    companies: Array<any>;
    subscription: Subscription;
    isShow: boolean = false;
    showQuickEntry: boolean = false;
    calendarElement: any;
    hasNewLetter: boolean = false;
    isExpired: boolean = false;
    session: any;
    currentCompanyName: string;
    messageBody: any;
    messageItem: any;
    currentAccountBookName: any;
    // 通过token获取用户角色
    token;
    accountShow: boolean = true;

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
        this.alert = alert;
    }

    public clearAlert(): void {
        this.alert = {};
    }


    constructor(private accountBookApi: AccountBookApi, private el: ElementRef, private router: Router,
        private route: ActivatedRoute, private zone: NgZone,
        private authorizationService: AuthorizationService, private accountApi: AccountApi,
        private letterApi: LetterApi, private pubSubService: PubSubService,
        private storageService: StorageService, public loaderService: LoaderService) {
        this.config = authorizationService.Config;
        this.router = router;
        // if (router.events.subscribe) {
        //     router.events.subscribe(() => (this.getCompanyList()));
        // }
    }
    // 获取账套列表，从localstorage
    // 只显示前5个公司
    getCompanyList() {
        if (localStorage.getItem('fiveCompanies') !== 'undefined') {
            this.companies = JSON.parse(localStorage.getItem('fiveCompanies'));
        }
    }

    ngOnInit() {
         this.getsession();
        // this.initOnCompanyChange();
        this.getCurrentCompanyName();
        this.loaderService.enable(true);
    }

    getCurrentCompanyName() {
        this.currentCompanyName = this.session.user.currentCompany.companyName;
    }
    go() {
        this.router.navigate(['app/company-list']);
    }
    getsession() {
        this.session = this.authorizationService.getSession();
    }
    initOnCompanyChange() {
        if (this.pubSubService.pub$.subscribe) {
            this.subscription = this.pubSubService.pub$.subscribe(event => {
                // 切换账套
                if (event.type === EventType.SwitchAccount) {
                    this.getCompanyList();
                    // 修改当前账套信息, 重新从localstorage 获得当前账套信息
                } else if (event.type === EventType.CurrentAccountUpdate) {
                    this.getCompanyList();
                    this.getsession();
                } else if (event.type === EventType.CurrentSession) {
                    this.getsession();
                }
            });
        }
    }

    /**
     * 切换账套,更换AccountBookID 和navbar 显示的公司名称
     * @param item 要切换的公司信息
     */
    switchAccount(item) {
        this.pubSubService.publish({
            type: EventType.SwitchAccount,
            data: ''
        });
        this.authorizationService.getAcountBookRoles(item).then((data) => {
            // location.reload();
            switch (data) {
                case 'canManagerAssist':
                    this.router.navigate(['app/setting/company-billing']);
                    break;
                case 'canAccount':
                    this.pubSubService.publish({
                        type: EventType.SwitchHomePageAccount,
                        data: ''
                    });

                    this.router.navigate(['app/home-page/accounting']);
                    break;
                case 'canAssistAccount':
                    this.pubSubService.publish({
                        type: EventType.SwitchHomePageAssist,
                        data: ''
                    });
                    this.router.navigate(['app/home-page/assist']);
                    break;
                case 'cannotAccount':
                    this.pubSubService.publish({
                        type: EventType.SwitchBeginningPeriod,
                        data: ''
                    });

                    this.router.navigate(['app/finance/beginningPeriod']);
                    break;
                case 'canAssist':
                    this.pubSubService.publish({
                        type: EventType.SwitchHomePageAssist,
                        data: ''
                    });
                    this.router.navigate(['app/home-page/assist']);
                    break;
                case 'cannotAssist':
                    this.alertDanger('期初账还未设置，您不能进入该账套，请联系会计设置期初账');
                    break;
                case 'manager':
                    this.pubSubService.publish({
                        type: EventType.SwitchCompanyBilling,
                        data: ''
                    });
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

    ExitSystem() {
        // 先去删除token
        this.authorizationService.logout();
        localStorage.removeItem('fiveCompanies');
        this.router.navigate(['/login/']);
    }


    // 弹出个人信息框
    personalInfoShow() {
        this.personalInfoModal.show();
    }
}

