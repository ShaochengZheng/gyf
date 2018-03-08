import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'salary-router-record',
    templateUrl: 'record.component.html'
})

export class SalaryRouterRecordComponent implements OnInit {

    navTitle: string = '工资记录';
    ngOnInit() { }

    /**
     * tab 切换
     */
    change(type) {
        console.log('change', type);
        if (type === 'L') {
            this.navTitle = '劳务记录';
        } else {
            this.navTitle = '工资记录';
        }
    }
}
