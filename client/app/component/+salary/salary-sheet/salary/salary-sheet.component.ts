import { SalaryModel } from './../../shared/salary.model';
import { Router } from '@angular/router';
import { Component, OnInit, NgZone, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';

import { AccountPeriodModel } from './../../../../api/accounting/model/AccountPeriodModel';
import { SalaryService } from './../../shared/salary.service';
import { PayrollModel } from './../../../../api/accounting/model/PayrollModel';

import * as _ from 'lodash';
import * as moment from 'moment';

@Component({
  selector: 'salary-sheet',
  templateUrl: 'salary-sheet.component.html',
  styleUrls: ['./salary-sheet.component.scss', './../../shared/salary.component.scss']
})

export class SalarySheetComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('confirmWidget') public confirmWidget;
  @ViewChild('asyncStuff') public asyncStuff;
  currentYearMonth: any;
  peroidYearMonth: any;
  salaryModel: SalaryModel = {
    sumPerformance: 0
  };

  // 弹出框显示信息
  confirmMsg: string = '生成本月工资表后，您对员工基本信息的修改将不再同步到工资表中，修改将会在下个会计期间生效';
  // 确认提示框 按钮文本
  confirmBtn: string = '确认生成';
  // 提示框，删除操作符
  delFlag: boolean = false;
  // 当前选择的员工model
  currentStuff;
  currentIndex;
  // 工资表model
  payrollModel: PayrollModel = {};
  // region end 纵向求和变量
  isEdit: boolean = true;
  // 是否锁定操作
  isLock: boolean = true;
  alert = {};
  noData: boolean = false;
  // 会计期间
  accountPeroid: AccountPeriodModel = this.salaryService.accountPeroid;

  constructor(private zone: NgZone, private router: Router, private salaryService: SalaryService) {

  }

  ngOnInit() {
    this.salaryService.clearCache(); // 防止意外退出后 还留有缓存
    this.salaryService.getAccountPeriod()
      .then(data => {
        console.log('salarysheet', data);
        this.peroidYearMonth = this.currentYearMonth =
          moment().set({ 'year': data.currentYear, 'month': data.currentMonth - 1 }).format('YYYY-MM');
        console.log('salarysheet', this.peroidYearMonth, this.currentYearMonth);
        this.searchSalary(data.currentYear, data.currentMonth);
      })
      .catch(err => {
        console.log('salarysheet error', err);
      });
  }

  ngAfterViewInit() {

  }

  /**
   * 获取工资表
   * @param year 会计年
   * @param month 会计月
   */
  searchSalary(year, month) {
    this.salaryService.getSalaryList(year, month, 'Y').then(data => {
      if (!data) { return; }
      this.salaryModel = _.cloneDeep(data);
      this.noData = false;
      if (!this.salaryModel.employeePayrolls || this.salaryModel.employeePayrolls.length < 1) {
        this.noData = true;
      }
      this.isLock = data.lock;
      console.log('bbb=>', JSON.stringify(data), this.isLock, this.noData);
    }).catch(err => {
      this.salaryModel.employeePayrolls = [];
      this.noData = true;
      console.error(err);
    });
  }

  /**
   * 求纵向和
   */
  caculateSum() {
    console.log('开始了');
    const temp = this.salaryModel;
    // console.log(temp);
     this.salaryModel = this.salaryService.caculateSalarySum(temp);
  }

  selected(date) {
    const dYM = this.currentYearMonth = this.salaryService.getYearMonth(date);
    if (dYM === this.peroidYearMonth) {
      this.isLock = false;
    } else {
      this.isLock = true;
    }
    this.searchSalary(dYM.split('-')[0], dYM.split('-')[1]);
  }

  /**
   * 跟踪变化
   * @param index 角标
   * @param item
   */
  trackBySalaryStuffs(index: number, item) {
    return index;
  }

  keyPressHandler(event) {
    if (event.charCode === 13) {
      this.caculateSum();
    }
  }

  /**
   * 生成本月工资表
   */
  saveSalary(flag) {
    console.log('saveSalary');
    this.salaryService.generateSalary(this.salaryModel, flag).then(data => {
      if (flag) {
        this.alertSuccess('本月工资单已生成！');
        this.router.navigate(['/app/salary/salary-record']);
      } else {
        this.alertSuccess('本月工资单已临时保存！');
        this.router.navigate(['/app/salary/salary-sheet']);
      }
    }).catch(err => {
      console.error(err);
      this.alertDanger(err);
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

  /**
   * 提醒
   */
  warnGenerate() {
    this.delFlag = false;
    // 弹出框显示信息
    this.confirmMsg = '生成本月工资表后，您对员工基本信息的修改将不再同步到工资表中，修改将会在下个会计期间生效';
    // 确认提示框 按钮文本
    this.confirmBtn = '确认生成';
    this.confirmWidget.show();
  }

  /**
   * 确认modal 返回信息
   */
  confirmEvn(e) {
    console.log(e);
    if (e === 2) { return; }
    if (this.delFlag) {
      this.delStuff();
    } else {
      this.saveSalary(true);
    }
  }

  /**
   * 删除提示
   */
  openConfirmModal(item, index) {
    console.log('openConfirmModal', item, index);
    this.delFlag = true;
    this.confirmBtn = '是';
    this.confirmMsg = '是否移出该员工？' + item.name;
    this.currentStuff = item;
    this.currentIndex = index;
    this.confirmWidget.show();
  }

  /**
   * 移出员工 并临时缓存
   */
  delStuff() {
    const temp = this.salaryModel;
    this.salaryService.cacheStuff(this.currentStuff);
    temp.employeePayrolls.splice(this.currentIndex, 1);
    this.salaryModel = this.salaryService.caculateSalarySum(temp);
  }
  /**
   * 导入同步员工
   */
  openAsyncStuff() {
    if (this.currentYearMonth) {
      const year = this.currentYearMonth.split('-')[0];
      const month = this.currentYearMonth.split('-')[1];
      this.asyncStuff.show(year, month, 'Y');
    }
  }
  /**
   * 导入完成
   */
  importDone(eve) {
    console.log('importDone', eve);
    if (eve && eve.length > 0) {
      let templist = this.salaryModel.employeePayrolls;
      templist = templist.concat(eve);
      this.salaryModel.employeePayrolls = templist;
      this.caculateSum();
    }
  }

  ngOnDestroy() {
    console.log('ngOnDestroy clear cache');
    this.salaryService.clearCache();
  }
}
