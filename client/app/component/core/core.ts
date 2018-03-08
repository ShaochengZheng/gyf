import { Component, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthorizationService } from '../../service/core/authorization';
import { StorageService } from '../../service/core/storage';
import { Sidebar } from './sidebar/sidebar';
import { PubSubService, EventType } from '../../service/pubsub.service';
declare var $: any;
import { SplitButtonModule } from 'primeng/primeng';


@Component({
    selector: 'app',
    host: {
        '[class.app]': 'true',
        id: 'app'
    },
    templateUrl: './core.html',
    styleUrls: ['./core.scss'],
    providers: [Sidebar]
})
export class Core implements AfterViewInit {
    config: any;
    $el: any;
    changeDirection: boolean = false;
    // 账套列表navbar 最左边的显示不一样
    hideOne: boolean = false;

    // 当前浏览器信息
    browser: string = '';
    items = [{
        label: 'Update', icon: 'fa-refresh', command: () => {
            this.update();
        }
    },
    {
        label: 'Delete', icon: 'fa-close', command: () => {
            this.delete();
        }
    },
    { label: 'Angular.io', icon: 'fa-link', url: 'http://angular.io' },
    { label: 'Theming', icon: 'fa-paint-brush', routerLink: ['/theming'] }
    ];

    status: string;
    hideArrow: boolean = false;

    constructor(private router: Router, private el: ElementRef, private route: ActivatedRoute, private authorizationService: AuthorizationService,
        private storageService: StorageService, private sidebar: Sidebar, private pubSubService: PubSubService) {
        router.events.debounceTime(1).distinctUntilChanged().subscribe(() => (this.hide()));
        this.config = authorizationService.Config;
    }

    save() {
    }

    update() {
    }

    delete() {
    }

    ngAfterViewInit() {
        this.browser = this.authorizationService.DetectionUA();
        $(document).ready(() => {
            $('sidebar').hover(() => {
                this.changeDirection = true;
                $('#page-wrapper').css({
                    'margin-left': '220px',
                    'transition': 'margin-left 0.15s',
                    '-moz-transition': 'margin-left 0.15s',
                    '-webkit-transition': 'margin-left 0.15s'
                });
            },
                () => {
                    this.changeDirection = false;
                    this.pubSubService.publish({
                        type: EventType.hideChild,
                        data: true
                    });
                    $('#page-wrapper').css({
                        'margin-left': '60px',
                        'transition': 'margin-left 0.25s',
                        '-moz-transition': 'margin-left 0.25s',
                        '-webkit-transition': 'margin-left 0.25s'
                    });
                });
        });
    }

    /**
     * 隐藏侧边栏
     * 
     * 
     * @memberof Core
     */
    hide() {
        let token = this.authorizationService.getSession();
        if (token) {
            let pathname = location.pathname.split(';');
            // 如果只是管理员的话
            if (token.user.currentRole && token.user.currentRole.indexOf('Manager') > -1 && token.user.currentRole.length === 1) {
                if ((this.config.hideCompanyInfo.indexOf(pathname[0]) > -1)) {
                    $('#page-wrapper').css('margin', '0');
                }
            } else {
                // 如果 期初账未启用，那么隐藏侧边栏，否则显示侧边栏；
                // 如果期初账启用了就不能隐藏侧边栏了,所以它单独判断
                if (this.config.hidePeriod.indexOf(pathname[0]) > -1 && (token.currentAccount.status === 'BeginningInit'
                    || token.currentAccount.status === undefined || token.currentAccount.status === null)) {
                    $('#page-wrapper').css('margin', '0');
                } else {
                    $('#page-wrapper').css('margin', '');
                }
            }
            // 如果是账套列表，隐藏侧边栏
            // 账套列表navbar 最左边的显示不一样
            if (this.config.hideList.indexOf(pathname[0]) > -1) {
                this.hideOne = true;
                $('#page-wrapper').css('margin', '0');
                console.log('this.config.hideList', this.config.hideList);
                console.log('this.hideOnelsd', this.hideOne);
            } else {
                this.hideOne = false;
            }

        }


    }


}
