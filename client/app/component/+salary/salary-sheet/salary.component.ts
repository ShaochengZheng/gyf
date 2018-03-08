import { Component, OnInit, AfterViewInit } from '@angular/core';


@Component({
  selector: 'salary',
  templateUrl: 'salary.component.html',
})

export class SalaryComponent implements OnInit, AfterViewInit {

  navTitle: string = '工资表';
  ngOnInit() {

  }

  ngAfterViewInit() {

  }
  /**
   * 切换
   */
  change(type) {
    console.log('change', type);
    if (type === 'L') {
      this.navTitle = '劳务表';
    } else {
      this.navTitle = '工资表';
    }
  }

}
