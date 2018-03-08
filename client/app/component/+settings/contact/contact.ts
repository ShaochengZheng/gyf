import { Component, ViewChild, ChangeDetectorRef, OnInit } from '@angular/core';

import { OperationModeEnum } from '../../../service/core/core';
import { ConfirmEventTypeEnum } from '../../widget/confirm/confirm';


import { ContactApi } from '../../../api/accounting/api/ContactApi';
import { ContactModel } from '../../../api/accounting/model/ContactModel';
import { ContactTypeEnumModel } from '../../../api/accounting/model/ContactTypeEnumModel';

import * as _ from 'lodash';

@Component({
    selector: 'contact',
    templateUrl: './contact.html',
    styleUrls: ['./contact.scss'],
    providers: [ContactApi]
})
export class ContactComponent implements OnInit {
    @ViewChild('contactDetailsModal') public contactDetailsModal;
    @ViewChild('confirmWidget') public confirmModal;
    currentContact: ContactModel;

    pageIndex: number = 1;
    pageSize: number = 1;
    recordCount: number = 0;
    maxSize: number = 10;
    dataList: ContactModel[];
    searchModel = {
        keyword: '',
        pageIndex: '1',
        pageSize: '10'
    };
    transactionOpeningBalanceModels = [];

    constructor(private contactApi: ContactApi, private ref: ChangeDetectorRef) {

    }

    public alerts: any = [];
    public alertSuccess(msg: string) {
        this.clearAlert();
        this.alerts = [{ type: 'success', msg: msg }];
        this.alerts = this.alerts.map((alert: any) => Object.assign({}, alert));
        this.ref.detectChanges();
        // setTimeout(() => { this.alert = { type: 'success', msg: msg }; }, 0);
    }
    public alertDanger(msg: string) {
        this.clearAlert();
        this.alerts = [{ type: 'danger', msg: msg }];
        this.alerts = this.alerts.map((alert: any) => Object.assign({}, alert));
        // setTimeout(() => { this.alert = { type: 'danger', msg: msg };}, 0 );
        this.ref.detectChanges();
    }
    public addAlert(alert: Object): void {
        this.clearAlert();
        this.alerts = [alert];
    }
    public clearAlert(): void {
        this.alerts = [];
    }
    //新建
    newContact() {
        this.contactDetailsModal.operation = OperationModeEnum.New;
        this.contactDetailsModal.show();
    }
    //编辑
    editContact(item) {
        let tempItem = _.cloneDeep(item);
        this.contactDetailsModal.operation = OperationModeEnum.View;
        this.contactDetailsModal.show(tempItem);
    }

    ngOnInit(): void {
        this.clearAlert();
        this.search();
    }

    ////获取列表
    search() {
        this.contactApi.contactSearch(this.searchModel.keyword, this.searchModel.pageIndex,
            this.searchModel.pageSize)
            .subscribe(
            (data) => {
                this.pageIndex = data.pageIndex;
                this.pageSize = data.pageSize;
                this.recordCount = data.recordCount;
                // 如果搜索不到 直接清掉 訾绍飞2017年03月28日修改
                if (data.list === null) {
                    this.dataList = [];
                } else {
                    this.dataList = data.list;
                    console.log('<contact--------->', JSON.stringify(this.dataList));
                    this.dataList.forEach(element => {
                        if (element.contactType.value === ContactTypeEnumModel.ValueEnum.Company) {
                            element.contactType.name = '单位';
                            // this.dataList.splice(this.dataList.indexOf(element), 1);
                            // this.dataList.unshift(element);
                        } else {
                            element.contactType.name = '个人';
                        }
                    });
                }
                setTimeout(() => this.ref.markForCheck(), 10);
            },
            (error) => {
            });
    }

    openConfirmModal(contact) {
        this.confirmModal.show();
        this.currentContact = contact;
    }

    delete(event) {
        if (event === ConfirmEventTypeEnum.Confirm) {
            this.contactApi.contactDelete(this.currentContact.id)
                .subscribe(
                (data) => {
                    this.search();
                    this.alertSuccess('删除成功！');
                },
                (error) => {
                    this.alertDanger(error);
                }
                );
        };
    }

    result(resultObj) {
        this.search();
        this.addAlert(resultObj);
    }

    public pageChanged(event: any): void {
        this.searchModel.pageIndex = event.page;
        this.search();
    };

}
