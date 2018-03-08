import { Component, OnInit } from '@angular/core';

import { isBs3 } from 'ngx-bootstrap/utils/ng2-bootstrap-config';
import { DatePickerInnerComponent } from './datepicker-inner.component';

@Component({
  selector: 'yearpicker',
  template: `
      <style>
      .title {
        display: inline-block;
        // position: absolute;
        width: 100%;
        
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
    </style>
<table *ngIf="datePicker.datepickerMode==='year'" role="grid" style=" background-color: #ffffff !important;
border-radius: 5px;border: 1px solid #DADADA;position: absolute;z-index: 2;" >
  <thead>
    <tr>
      <th>
        <button type="button" class="pull-left" style="padding: 5px 10px"
                (click)="datePicker.move(-1)" tabindex="-1">
          <i class="glyphicon glyphicon-chevron-left"></i>
        </button>
      </th>
      <th [attr.colspan]="((datePicker.yearColLimit - 2) <= 0) ? 1 : datePicker.yearColLimit - 2">
        <button [id]="datePicker.uniqueId + '-title'" role="heading"
                type="button" 
                (click)="datePicker.toggleMode()"
                [disabled]="datePicker.datepickerMode === datePicker.maxMode"
                [ngClass]="{disabled: datePicker.datepickerMode === datePicker.maxMode}" tabindex="-1" style="width:100%;background-color: #ffffff;border: 0;color: #000000;">
          <strong>{{title}}</strong>
        </button>
      </th>
      <th>
        <button type="button" class="pull-right" style="padding: 5px 10px"
                (click)="datePicker.move(1)" tabindex="-1">
          <i class="glyphicon glyphicon-chevron-right"></i>
        </button>
      </th>
    </tr>
  </thead>
  <tbody class="ui-datepicker-calendar">
    <tr *ngFor="let rowz of rows" class="onter-row">
      <td *ngFor="let dtz of rowz" class="text-center conter-li  ui-datepicker-week-end " role="gridcell">
        <button type="button" style="min-width:100%;" class="month-button" style="width: 60px;    border: 1px solid #DADADA !important;border-radius: 5px;"
                [ngClass]="{'btn-link': isBs4 && !dtz.selected && !datePicker.isActive(dtz), 'btn-info': 
                dtz.selected || (isBs4 && !dtz.selected && datePicker.isActive(dtz)), disabled: dtz.disabled, 
                active: !isBs4 && datePicker.isActive(dtz)}"
                [disabled]="dtz.disabled"
                (click)="datePicker.select(dtz.date)" tabindex="-1">
          <span [ngClass]="{'text-success': isBs4 && dtz.current, 'text-info': !isBs4 && dtz.current}">{{dtz.label}}</span>
        </button>
      </td>
    </tr>
  </tbody>
</table>
  `
})
export class YearPickerComponent implements OnInit {
  public datePicker: DatePickerInnerComponent;
  public title: string;
  public rows: any[] = [];

  public constructor(datePicker: DatePickerInnerComponent) {
    this.datePicker = datePicker;
  }

  public get isBs4(): boolean {
    return !isBs3();
  }

  public ngOnInit(): void {
    let self = this;

    this.datePicker.stepYear = { years: this.datePicker.yearRange };

    this.datePicker.setRefreshViewHandler(function (): void {
      let years: any[] = new Array(this.yearRange);
      let date: Date;
      let start = self.getStartingYear(this.activeDate.getFullYear());

      for (let i = 0; i < this.yearRange; i++) {
        date = new Date(start + i, 0, 1);
        date = this.fixTimeZone(date);
        years[i] = this.createDateObject(date, this.formatYear);
        years[i].uid = this.uniqueId + '-' + i;
      }

      self.title = [years[0].label,
      years[this.yearRange - 1].label].join(' - ');
      self.rows = this.split(years, self.datePicker.yearColLimit);
    }, 'year');

    this.datePicker.setCompareHandler(function (date1: Date, date2: Date): number {
      return date1.getFullYear() - date2.getFullYear();
    }, 'year');

    this.datePicker.refreshView();
  }

  protected getStartingYear(year: number): number {
    // todo: parseInt
    return ((year - 1) / this.datePicker.yearRange) * this.datePicker.yearRange + 1;
  }
}
