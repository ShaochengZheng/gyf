
import { Router } from '@angular/router';
import { Component, OnInit, NgZone, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';

import { SalaryService } from './../../shared/salary.service';
import { ShareService } from './../../../../service/core/share';
import { UtilityService } from './../../../../service/core/utility';

import * as _ from 'lodash';
import * as moment from 'moment';

@Component({
  selector: 'labour-sheet',
  templateUrl: 'labour-sheet.component.html',
  styleUrls: ['./labour-sheet.component.scss', './../../shared/salary.component.scss'],
})

export class LabourSheetComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('confirmWidget') public confirmWidget;
  @ViewChild('asyncStuff') public asyncStuff;
  labourModel: any = {};
  // 会计期间年
  accountYear: any;
  // 会计期间月
  accountMonth: any;
  // 当前年月
  currentYearMonth: any;
  // 会计期间年月
  peroidYearMonth: any;
  //
  noData: boolean = false;
  // 锁定
  isLock: boolean = true;
  // 提示框 显示内容
  confirmMsg: string = '生成本月劳务表后，您对员工基本信息的修改将不再同步到劳务表中，修改将会在下个会计期间生效。';
  // 确认提示框 按钮文本
  confirmBtn: string = '确认生成';
  // 提示框，删除操作符
  delFlag: boolean = false;
  // 当前选择的员工model
  currentStuff;
  currentIndex;
  alert = {};
  constructor(private zone: NgZone, private router: Router, private salaryService: SalaryService,
    private shareService: ShareService, private utilService: UtilityService) {

  }

  ngOnInit() {
    console.log('labour-sheet.component.ts => go init');
    this.salaryService.getAccountPeriod().then(data => {
      this.peroidYearMonth = this.currentYearMonth =
        moment().set({ 'year': data.currentYear, 'month': data.currentMonth - 1 }).format('YYYY-MM');
      console.log('salarysheet', this.peroidYearMonth, this.currentYearMonth);
      this.searchLabourList(data.currentYear, data.currentMonth);
    });
  }

  ngAfterViewInit() {

  }

  searchLabourList(year, month) {
    console.log('labour-sheet.component.ts => go viewinit');
    this.salaryService.getSalaryList(year, month, 'N').then(data => {
      this.labourModel = _.cloneDeep(data);
      this.noData = false;
      if (!this.labourModel.employeePayrolls || this.labourModel.employeePayrolls.length < 1) {
        this.noData = true;
      }
      this.isLock = data.lock;
      console.log('labourModel =>', JSON.stringify(data));
    }).catch(err => {
      this.noData = true;
      console.log('err', JSON.stringify(err));
    });
  }

  /**
   * 求纵向和
   */
  calculateSum() {
    const temp = _.cloneDeep(this.labourModel);
    this.labourModel = this.salaryService.calculateLabourSum(temp);
  }

  /**
   * 含税额改变事件
   * @param index
   * @param item
   */
  taxLaborChange(index, e) {
    const item = this.labourModel.employeePayrolls[index];
    console.log('taxLaborChange', index, e, JSON.stringify(item));
    item.totalSalary = Number(e);
    item.incomeTax = this.salaryService.calculateIncludePTax(item.totalSalary);
    item.nettSalary = Number(item.totalSalary) - Number(item.incomeTax);
    this.labourModel.employeePayrolls[index] = item;
    this.calculateSum();

  }

  /**
   *  不含税额改变事件
   * @param index
   * @param item
   */
  taxRealLaborChange(index, e) {
    const item = this.labourModel.employeePayrolls[index];
    console.log('taxRealLaborChange', index, e, JSON.stringify(item));
    item.nettSalary = Number(item.nettSalary);
    item.totalSalary = this.salaryService.cacuWithTaxLabor(item.nettSalary);
    item.incomeTax = Number(item.totalSalary) - Number(item.nettSalary);
    this.labourModel[index] = item;
    this.calculateSum();
  }

  selected(date) {
    const dYM = this.currentYearMonth = this.salaryService.getYearMonth(date);
    if (dYM === this.peroidYearMonth) {
      this.isLock = false;
    } else {
      this.isLock = true;
    }
    this.searchLabourList(dYM.split('-')[0], dYM.split('-')[1]);
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
      this.calculateSum();
    }
  }

  /**
   * 生成劳务表
   */
  saveSalary(flag) {
    console.log('saveSalary', JSON.stringify(this.labourModel));
    this.salaryService.generateLabour(this.labourModel, flag).then(data => {
      // console.log('生成工资表=>', JSON.stringify(data));
      if (flag) {
        this.alertSuccess('本月劳务单已生成！');
        this.router.navigate(['/app/salary/salary-record/labour']);
      } else {
        this.alertSuccess('本月劳务单已临时保存！');
        this.router.navigate(['/app/salary/salary-sheet/labour']);
      }
    }).catch(err => {
      this.alertDanger(err);
      console.log('生成工资表错误=>', JSON.stringify(err));
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
    this.confirmMsg = '生成本月劳务表后，您对员工基本信息的修改将不再同步到劳务表中，修改将会在下个会计期间生效。';
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
    const temp = this.labourModel;
    this.salaryService.cacheStuff(this.currentStuff);
    temp.employeePayrolls.splice(this.currentIndex, 1);
    this.labourModel = this.salaryService.calculateLabourSum(temp);
    // this.labourModel = this.salaryService.caculateSalarySum(temp);
  }
  /**
   * 导入同步员工
   */
  openAsyncStuff() {
    if (this.currentYearMonth) {
      const year = this.currentYearMonth.split('-')[0];
      const month = this.currentYearMonth.split('-')[1];
      this.asyncStuff.show(year, month, 'N');
    }
  }
  /**
   * 导入完成
   */
  importDone(eve) {
    console.log('importDone', eve);
    if (eve && eve.length > 0) {
      let templist = this.labourModel.employeePayrolls;
      templist = templist.concat(eve);
      this.labourModel.employeePayrolls = templist;
      this.calculateSum();
    }
  }

  ngOnDestroy() {
    console.log('ngOnDestroy clear cache');
    this.salaryService.clearCache();
  }
}
