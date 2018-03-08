
import { Component, OnInit, ViewChild } from '@angular/core';
import { SalaryService } from './../shared/salary.service';

@Component({
    selector: 'stuff-list',
    templateUrl: 'stuff-list.component.html',
    styleUrls: ['./stuff-list.component.scss', './../shared/salary.component.scss'],
    providers: [SalaryService]
})

export class StuffListComponent implements OnInit {

    @ViewChild('confirmWidget') public confirmWidget;

    pageIndex: number = 1;
    pageSize: number = 10;
    recordCount: number = 0;
    maxSize: number = 5;
    stuffList: Array<any> = [];
    searchModel = {
        keyword: '',
        pageIndex: '1',
        pageSize: '10',
    };
    noData: boolean = false;
    alert = {};
    stuff: any;
    exportUrl: string;
    constructor(private salaryService: SalaryService) {
    }

    ngOnInit() {
        this.exportUrl = '/api/v1/employee/export';
        this.searchStuff();
    }

    searchStuff() {
        this.salaryService.getAllEmployee(this.searchModel).then(data => {
            this.noData = false;
            this.stuffList = data.list;
            this.recordCount = data.recordCount;
            if (this.recordCount === 0) {
                this.noData = true;
            }
            console.log('stuff =>', JSON.stringify(data));
        }).catch(error => {
            this.stuffList = [];
            this.noData = true;
            console.log('stuff error=>', JSON.stringify(error));
        });
    }


    pageChanged(event: any) {
        this.searchModel.pageIndex = event.page;
        this.searchStuff();
    }
    /**
     * 编辑员工
     * @param item 员工信息
     */
    editStuff(item) {
        console.log('edit', JSON.stringify(item));
    }
    /**
     * 弹出确认框
     * @param item 员工信息
     */
    openConfirmModal(item) {
        console.log('open', JSON.stringify(item));
        this.confirmWidget.show();
        this.stuff = item;
    }

    delete() {
        this.salaryService.deleteEmployee(this.stuff.id)
            .then(data => {
                this.searchStuff();
                this.alertSuccess('删除成功!');
            })
            .catch(err => {
                this.alertDanger(err);
            });
    }

    addAlert(alert) {
        this.clearAlert();
        this.alert = alert;
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
        setTimeout(() => {
            this.alert = { msg: msg, type: 'danger' };
        }, 0);
    }

    clearAlert() {
        this.alert = {};
    }
}

