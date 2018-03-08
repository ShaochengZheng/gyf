import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

import { AccountBookSettingStatusEnumModel } from './../../../api/accounting/model/AccountBookSettingStatusEnumModel';
import { AccountBookForCarryModel } from './../shared/finance.model';
import { ShareService } from './../../../service/core/share';
import { Select } from './../../../service/core/extended-interface';
import { FinanceService } from './../shared/finance.service';
import { AuthorizationService } from '../../../service/core';

@Component({
  selector: 'app-carry-forward',
  templateUrl: './carry-forward.component.html',
  styleUrls: ['./carry-forward.component.scss']
})
export class CarryForwardComponent implements OnInit {

  alert = {};
  yearList: Array<Select> = [];
  noData: boolean = false;
  accountBookModel: AccountBookForCarryModel[] = [];
  currentSelect: Array<any> = [{ id: '', text: new Date().getFullYear() }];
  year: any;
  showBtn: boolean = false;
  token: any = '';
  constructor(private authorizationService: AuthorizationService, private financeService: FinanceService,
    private router: Router, private shareService: ShareService) {
    this.token = this.authorizationService.getSession();
  }

  ngOnInit() {
    this.getAccountPeroid();
    this.getCarryForwardList(this.currentSelect[0].text);
  }

  /**
   * 获取当前账套会计区间信息
   */
  getAccountPeroid() {
    this.shareService.accountAccountPeriod()
      .then(data => {
        console.log(data);
        this.yearList = data.YearList;
        this.year = data.currentYear;
      })
      .catch(error => {
        console.log(error);
      });
  }

  /**
   * 获取账套信息
   */
  getCarryForwardList(year) {
    this.financeService.getCarryForwardList(year)
      .then(data => {
        this.noData = false;
        this.accountBookModel = data;
        if (data === null || data.length <= 0) {
          this.noData = true;
        }
      })
      .catch(error => {
        this.noData = true;
      });
  }

  /**
   * 年选择
   */
  selectYear(e) {
    console.log(e);
    this.getCarryForwardList(e.text);
  }
  /**
   * 显示按钮块
   */
  show(item) {
    console.log('show', item);
    if (!item) return;
    if (item.status.value !== AccountBookSettingStatusEnumModel.ValueEnum.Done) {
      this.showBtn = true;
    }
  }
  /**
   *  隐藏按钮块
   */
  hide() {
    console.log('hide');
    this.showBtn = false;
  }
  /**
   * 点击结转按钮事件
   */
  showAlert(item) {
    console.log('showAlert', item);
  }

  /**
   * 结转&再次结转
   */
  postingCarryForward(item) {
    this.financeService.carryForwardAccount()
      .then(data => {
        this.alertSuccess('结转成功');
        this.sendWechatMessage(item);
        this.ngOnInit();
      })
      .catch(error => {
        this.alertDanger(error);
      });
  }
  /**
   * 给微信用户发送模板消息
   */
  sendWechatMessage(item) {
    console.log('item' + JSON.stringify(item));
    console.log('item' + JSON.stringify(this.token));
    this.financeService.getWeChatOpenId(this.token.currentAccount.id)
      .then(
      data => {
        console.log(data);
        if (data) {
          let model = {
            openid: data,
            taxNumber: this.token.currentAccount.taxNumber,
            taxName: this.token.currentAccount.name,
            accountPeriod: item.accountPeriodYear + '年' + item.accountPeriodMonth + '月'
          };
          this.financeService.sendMessage(model)
            .then(data => {
              console.log(data);
            });
        }
      });
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

  goList(item) {
    let status = item.status.value;
    if (status !== 'InProgress' && status !== 'CarryForward') {
      this.router.navigate(['/app/finance/carry-forward/list', { year: this.year, month: item.accountPeriodMonth, status: status }]);
    }
  }
}
