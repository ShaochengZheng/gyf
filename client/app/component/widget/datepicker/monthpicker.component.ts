import { Component, OnInit, NgZone } from '@angular/core';

import { isBs3 } from 'ngx-bootstrap/utils/ng2-bootstrap-config';
import { DatePickerInnerComponent } from './datepicker-inner.component';
declare var jQuery: any;
@Component({
  selector: 'monthpicker',
  template: `
      <style>
      .title {
        position: relative;

      }

      .input-group{
        display:flex!important;
        position:relative;
        width:100%;
        border-collapse:seperate;

      }
      .input-group-addon{
        white-space: nowrap;
        vertical-align: middle;
        width:initial;
      }
      .conter{
        position: absolute;
        top: 36px;
        z-index:2;
        width: 100%;
        background-color: #ffffff !important;
        white-space:nowrap;
      }

      .month-button{
        background-color: #ffffff;
      }
      .month-button:hover{
        background-color: #5bc0de;
        color: #ffffff!important;
      }
      .conter-li{
        flex: 1;
        background-color: #ffffff;
      }
      .active{
          background-color: #5bc0de;
          color: #ffffff!important;
      }
      .top-button{
        // border-radius: 0;border: 1px solid transparent;
      }
      .text-info{
          color:#000000!important;
      }
      .input-index{
        z-index:1;
      }
    </style>
  <div class='title'>
          <span [ngStyle]="style" [class]="styleClass" [ngClass]="'ui-calendar input-group input-index'" (click)="ShowConter()">
            <input type="text" [attr.placeholder]="placeholder" [ngStyle]="inputStyle"
            [class]="inputStyleClass"
            value="{{title}}-{{activemonths}}"

            [ngClass]="{'ui-inputtext ui-widget form-control ui-state-default fontStyle': true,
                        'ui-corner-all': !showIcon, 'ui-corner-left': showIcon,
                        'ui-state-hover':hovered,'ui-state-focus':focused,'ui-state-disabled':disabled}">
            <span  [class]="iconStyleClass"
                [ngClass]="{'ui-datepicker-trigger ui-datepicker-button input-group-addon ui-datepicker-del fontStyle': true,
                'ui-datepicker-singleDel': !showIcon}">
                <i [class]="iconDel"></i>
            </span>
            <span  [class]="iconStyleClass"
                [ngClass]="'ui-datepicker-trigger ui-datepicker-button input-group-addon fontStyle'">
                <i class="fa fa-calendar"></i>
            </span>
        </span>
  </div>
<div class="conter ui-corner-all">
<table [hidden]="!(datePicker.datepickerMode==='month' && isShowConter)" role="grid" style=" background-color: #ffffff !important;
border-radius: 5px;border: 1px solid #DADADA;z-index: 1;" >
  <thead>
    <tr>
      <th style="width: 60px;">
        <button type="button" class="pull-left"
                (click)="datePicker.move(-1)" tabindex="-1" style="padding: 5px 10px;">
          <i class="glyphicon glyphicon-chevron-left"></i>
        </button>
      </th>
      <th style="width: 60px;" [attr.colspan]="((datePicker.monthColLimit - 2) <= 0)
       ? 1 : datePicker.monthColLimit - 2" class="ui-datepicker-prev ui-corner-all">
        <button [id]="datePicker.uniqueId + '-title'"
                type="button"
                (click)="datePicker.toggleMode()"
                [disabled]="datePicker.datepickerMode === maxMode"
                [ngClass]="{disabled: datePicker.datepickerMode === maxMode}" tabindex="-1"
                 style="width: 60px;border: 0;background-color: #ffffff;padding: 5px 0;
    margin: 0px auto;">
          <strong>{{title}}</strong>
        </button>
      </th>
      <th style="width: 60px;">
        <button type="button" class="pull-right"
                (click)="datePicker.move(1)" tabindex="-1" style="padding: 5px 10px;">
          <i class="glyphicon glyphicon-chevron-right"></i>
        </button>
      </th>
    </tr>
  </thead>
  <tbody class="ui-datepicker-calendar">
    <tr *ngFor="let rowz of rows" class="onter-row">
      <td *ngFor="let dtz of rowz" class="text-center conter-li  ui-datepicker-week-end " role="gridcell" id="{{dtz.uid}}" >
        <button type="button"  class="month-button" style="width: 60px;    border: 1px solid #DADADA !important;border-radius: 5px;"
                [ngClass]="{'btn-link': isBs4 && !dtz.selected && !datePicker.isActive(dtz),
                'btn-info': dtz.selected || (isBs4 && !dtz.selected && datePicker.isActive(dtz)),
                 disabled: dtz.disabled, active: !isBs4 && datePicker.isActive(dtz)}"
                [disabled]="dtz.disabled"
                (click)="setDay(dtz.date)" tabindex="-1">
          <span [ngClass]="{'text-success': isBs4 && dtz.current, 'text-info': !isBs4 && dtz.current}">{{dtz.label}}</span>
        </button>
      </td>
    </tr>
  </tbody>
</table>
</div>
  `
})
export class MonthPickerComponent implements OnInit {
  public title: string;
  public rows: any[] = [];

  public datePicker: DatePickerInnerComponent;
  public maxMode: string;
  activemonth: number;
  activemonths: string;
  isShowConter: boolean = false;

  public constructor(datePicker: DatePickerInnerComponent, private zone: NgZone) {
    this.datePicker = datePicker;
  }

  public get isBs4(): boolean {
    return !isBs3();
  }

  public ngOnInit(): void {
    const self = this;

    this.datePicker.stepMonth = { years: 1 };

    this.datePicker.setRefreshViewHandler(function (): void {
      const months: any[] = new Array(12);
      const year: number = this.activeDate.getFullYear();
      let date: Date;

      for (let i = 0; i < 12; i++) {
        date = new Date(year, i, 1);
        date = this.fixTimeZone(date);
        months[i] = this.createDateObject(date, this.formatMonth);
        months[i].uid = this.uniqueId + '-' + i;
      }

      self.title = this.dateFilter(this.activeDate, this.formatMonthTitle);

      // if(this.nullDate){

      //   self.title = self.activemonth = null;
      // }
      self.rows = this.split(months, self.datePicker.monthColLimit);
      self.activemonth = this.activeDate.getMonth() + 1;
      if (self.activemonth < 10) {
        self.activemonths = '0' + self.activemonth;
      } else {
        self.activemonths = self.activemonth.toString();
      }
    }, 'month');

    this.datePicker.setCompareHandler(function (date1: Date, date2: Date): number {
      const d1 = new Date(date1.getFullYear(), date1.getMonth());
      const d2 = new Date(date2.getFullYear(), date2.getMonth());
      return d1.getTime() - d2.getTime();
    }, 'month');

    this.datePicker.refreshView();
  }

  setDay(date) {
    this.datePicker.select(date);
    this.ShowConter();
  }

  ShowConter(): void {
    this.isShowConter = !this.isShowConter;
  }
  documents() {
    jQuery(document).on('click', () => {
      this.zone.run(() => {
        const doms = jQuery('monthpicker')[0];
        if (doms) {
          const dpContainsTarget = doms.contains(event.target);
          if (!dpContainsTarget) {
            this.isShowConter = false;
          }
        }

      });
    });

  }

}
