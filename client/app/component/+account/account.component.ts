import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';

import * as _ from 'lodash';

import { ConfirmEventTypeEnum } from '../widget/confirm/confirm';
import { BankAccountApi } from '../../api/accounting/api/BankAccountApi';
import { BankAccountModel } from '../../api/accounting/model/BankAccountModel';
import { AccountService } from './share/account.service';

@Component({
    selector: 'account',
    templateUrl: './account.component.html',
    styleUrls: ['./account.component.scss']
})
export class AccountComponent {
    @ViewChild('accountDetailsModal') public accountDetailsModal;
    @ViewChild('confirmWidget') public confirmWidget;
    currentAccount: BankAccountModel;
    dataList: BankAccountModel[] = [];
    noDataList: boolean = false;
    searchModel = {
        pageIndex: '1',
        pageSize: '100000'
    };

    alert: Object = {};
    public alertSuccess(msg: string) {
        this.clearAlert();
        setTimeout(() => { this.alert = { type: 'success', msg: msg }; }, 0);
    }

    public alertDanger(msg: string) {
        this.clearAlert();
        setTimeout(() => { this.alert = { type: 'danger', msg: msg }; }, 0);
    }

    public addAlert(alert: Object): void {
        this.clearAlert();
        setTimeout(() => { this.alert = alert; }, 0);
    }

    public clearAlert(): void {
        this.alert = {};
    }

    constructor(private bankAccountApi: BankAccountApi, private CDRef: ChangeDetectorRef, private accountService:AccountService) { }

    search() {
        this.bankAccountApi.bankAccountGetAll()
            .subscribe(
            (data) => {
                console.log('<--account-search->', data);
                // let total = data.length;
                // let temp = data.slice(1, 3);
                let tempData: any = _.groupBy(data, function (o) {
                    if (o.bankAccountType.value !== null) {
                        return o.bankAccountType.value;
                    }
                });
                
                let tempList = [];
                if (tempData.Bank && tempData.Bank.length) {
                    tempList = tempList.concat(tempData.Bank);
                }
                if (tempData.Cash && tempData.Cash.length) {
                    tempList = tempList.concat(tempData.Cash);
                }
                if (tempData.WeChat && tempData.WeChat.length) {
                    tempList = tempList.concat(tempData.WeChat);
                }
                if (tempData.Alipay && tempData.Alipay.length) {
                    tempList = tempList.concat(tempData.Alipay);
                }
                this.dataList = tempList;
                if (this.dataList === null || this.dataList.length === 0) {
                    this.noDataList = true;
                } else {
                    this.noDataList = false;
                }
                this.CDRef.detectChanges();
            },
            (error) => {
                console.warn('account.component');
                console.error(error);
                // ;
                this.alertDanger(error);
            }
            );
    }

    ngOnInit(): void {
        this.search();
        // this.accountService.getAccountAll().then(
        //     data => {
        //         console.log('<--getAccountAll---->',data);
        //     },error => {
        //         console.log('<--getAccountAll---->',error);
        //     }
        // );
    }

    newAccount() {
        this.accountDetailsModal.show();
    }

    /**
     *  account 不为空，系期初添加 不可删除，且余额和日期不能编辑
     *  account 为空，系账户添加，可删除，初始余额日期必须在会计区间
     */
    editAccount(item) {
        console.log('account<--editAccount-->', item.account);
        let tempItem = _.cloneDeep(item);
        this.accountDetailsModal.show(tempItem);
    }

    openDeleteModal(item) {
        if (item.account === null) {
            this.confirmWidget.show();
            this.currentAccount = item;
        }else {
            console.log('<给我弹个窗>');
        }
    }

    delete(event) {
        if (event === ConfirmEventTypeEnum.Confirm) {
            this.bankAccountApi.bankAccountDelete(this.currentAccount.id)
                .subscribe(
                (data) => {
                    this.search();
                    this.alertSuccess('删除成功！');
                },
                (error) => {
                    // ;
                    this.alertDanger(error);
                }
                );
        };
    }

    result(resultObj) {
        this.search();
        this.addAlert(resultObj);
    }

}
