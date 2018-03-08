import {
    Component, ViewEncapsulation, ViewContainerRef,
    AfterViewInit, OnInit, ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { Angulartics2 } from 'angulartics2';

import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';

import { Angulartics2BaiduAnalytics } from './app/service/providers/angulartics2BaiduAnalytics';
import { AuthorizationService } from './app/service/core';
import { StorageService } from './app/service/core/storage';

declare var $: any;
declare var Chart: any;
// 获取NODE环境变量
let isProduction = { 'value': process.env.environment };

@Component({
    selector: 'guanplus-app',
    templateUrl: './app.html',
    styleUrls: ['./styles/application.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [Angulartics2BaiduAnalytics]
})
export class App implements AfterViewInit, OnInit {
    @ViewChild('sessionExpiredModal') public sessionExpiredModal;
    // @ViewChild('requestDemo') public requestDemo;
    viewContainerRef: ViewContainerRef;
    config: any;
    isShow: boolean = false;
    alert: Object = {};

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


    public constructor(viewContainerRef: ViewContainerRef, angulartics2: Angulartics2, private storageService: StorageService,
        angulartics2BaiduAnalytics: Angulartics2BaiduAnalytics, router: Router, private authorizationService: AuthorizationService,
        private idle: Idle) {
        router.events.debounceTime(500).distinctUntilChanged().subscribe(() => (this.idlerun(), this.ishomePage()));
        this.config = authorizationService.Config;
        this.viewContainerRef = viewContainerRef;
        if (isProduction.value === 'production') {
            angulartics2.developerMode(false);
        } else {
            angulartics2.developerMode(true);
        }
    }

    ngOnInit() {
        // 如果没有运行idle 启动idle 防止用户硬刷新
        if (!this.idle.isRunning()) {
            this.setupIdle();
        }
        Chart.defaults.global.defaultFontFamily =
            'Tahoma, Arial, Helvetica, "Microsoft YaHei New", "Microsoft Yahei",' +
            '"微软雅黑", SimSun, STXihei, "华文细黑", sans-serif';
        Chart.defaults.global.defaultFontSize = 14;
    }
    // 开始超时检测
    setupIdle() {
        console.log('开始超时检测');
        // 设置超时时间
        this.idle.setIdle(this.config.idle.time);
        // 设置超时之后多长时间不活动  0为禁用
        this.idle.setTimeout(0);
        // 设置默认的打断超时 默认点击、滚动、等都是
        this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);
        // 启动监视
        this.idle.watch();
        // 超时之后
        this.idle.onIdleStart.subscribe(() => {
            this.sessionExpiredModal.show();
            // console.error('超时退出');
            // this.authorizationService.logout();
        });
    }

    // 停止
    stopidle() {
        console.log('停止超时检测');
        this.idle.stop();
    }

    ngAfterViewInit() {
        // 这是干啥的？
        $(document).ready(function () {
            // Full height
            function fixHeight() {
                let heightWithoutNavbar = $('body > #wrapper').height() - 61;
                $('.sidebard-panel').css('min-height', heightWithoutNavbar + 'px');
                let navbarHeigh = $('nav.navbar-default').height();
                let wrapperHeigh = $('#page-wrapper').height();

                if (navbarHeigh > wrapperHeigh) {
                    $('#page-wrapper').css('min-height', navbarHeigh + 'px');
                }

                if (navbarHeigh < wrapperHeigh) {
                    $('#page-wrapper').css('min-height', $(window).height() + 'px');
                }

                if ($('body').hasClass('fixed-nav')) {
                    $('#page-wrapper').css('min-height', $(window).height() - 60 + 'px');
                }
            }

            $(window).bind('load resize scroll', function () {
                if (!$('body').hasClass('body-small')) {
                    fixHeight();
                }
            });

            setTimeout(function () {
                fixHeight();
            });
        });
    };
    // 是否开启超时
    idlerun() {
        // let pathname = location.pathname.split('/');
        let pathname = location.pathname;
        if (this.config.idle.url.indexOf(pathname[1]) > -1) {
            this.ngOnInit();
        } else {
            this.stopidle();
        }
    }
    // 是否在首页
    ishomePage() {
        if (location.pathname) {
            let pathname = location.pathname.split('/');
            if (pathname.length > 2) {
                this.isShow = false;
            } else if (pathname[1] === 'app') {
                this.isShow = true;
            } else {
                this.isShow = false;
            }

        }
        setTimeout(() => { this.isRequestDemo(false); }, 0);

    }
    // 是否显示申请演示
    isRequestDemo(isShow) {

        if (isShow) {
            // this.requestDemo.show();
        } else {
            let session = this.storageService.getToken();
            if (session !== null) {
                if (session.user.isDisplayDemo !== 'N' && this.isShow) {
                    // this.requestDemo.show();
                }
            }
        }

    }
}
