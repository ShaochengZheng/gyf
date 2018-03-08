import { Component, OnInit } from '@angular/core';
import { AuthorizationService } from '../../../service/core';
import { Router } from '@angular/router';

@Component({
  selector: 'browser-alert',
  templateUrl: './browser-alert.html',
  styleUrls: ['./browser-alert.scss']
})
export class BrowserAlert implements OnInit {
  browserUserAgent;
  version;
  isShow: boolean = false;
  browserUrl = ['https://www.baidu.com/s?wd=chrome&rsv_spt=1&rsv_iqid=0xca96b19b00150d62&issp=1&f=8&rsv_bp=0&rsv_idx=2&ie=utf-8&tn=baiduhome_pg&rsv_enter=1&rsv_sug3=4&rsv_sug1=4&rsv_sug7=101',
    'https://support.apple.com/zh-cn/safari',
    'http://ie.sogou.com/',
    'http://chrome.360.cn'];

  contains = ['为实现更加安全、流畅、稳定的工作体验，管有方推荐您使用右侧浏览器，点击图标可直接下载哦！',
    '为实现更加安全、流畅、稳定的工作体验，管有方建议您升级浏览器版本，点击图标可直接升级哦！'];
  contain = this.contains[0];

  constructor(private authorizationService: AuthorizationService, private router: Router) {

    this.browserUserAgent = this.authorizationService.DetectionUAObj().browser;
    this.version = this.authorizationService.DetectionUAObj().version;
    let arr = this.version.split('.');
    let versionNum = Number(arr[0]);
    console.log('version---->', arr);
    if (this.browserUserAgent === 'chrome') { // || this.browserUserAgent === 'firefox'
      if (versionNum < 45) {
        this.isShow = true;
        this.contain = this.contains[1];
      } else {
        this.isShow = false;
      }
    } else if (this.browserUserAgent === 'safari') {
      if (versionNum < 537) {
        this.isShow = true;
        this.contain = this.contains[1];
      } else {
        this.isShow = false;
      }
    } else {
      this.isShow = true;
      this.contain = this.contains[0];
    }
    console.log(this.browserUserAgent, versionNum);
  }

  ngOnInit() {
  }
  browserDownload(value) {
    // if (value === 1) {
    //   window.open(this.browserUrl[1], '_blank');
    // }else if (value === 2) {
    //   window.open(this.browserUrl[1], '_blank');
    // }else if (value === 3) {
    //   window.open(this.browserUrl[2], '_blank');
    // }else if (value === 4) {
    //   window.open(this.browserUrl[3], '_blank');
    // }
  }

}
