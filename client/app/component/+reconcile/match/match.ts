import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { StatementAttachmentApi } from '../../../api/accounting/api/StatementAttachmentApi';
import { StatementColumnMappingModel }
    from '../../../api/accounting/model/StatementColumnMappingModel';
import { Location } from '@angular/common';

import { StorageService } from '../../../service/core';
import { PubSubService, EventType } from '../../../service/pubsub.service';
import { BankAccountApi } from '../../../api/accounting/api/BankAccountApi';
import * as _ from 'lodash';

@Component({
    selector: 'reconcile-match',
    templateUrl: './match.html',
    styleUrls: ['./match.scss'],
    providers: [StatementAttachmentApi],
})
export class ReconcileMatchComponent implements OnInit, OnDestroy {
    @ViewChild('modal') public modal;
    account = { id: '', name: '' };
    dataSave: StatementColumnMappingModel;
    dataList: any;
    columnsList = [];
    datetimeList = [];
    alert: Object = {};
    countDate: number = 0;
    statementAttachmentId: string = '';
    queryParameters: string = '';
    downloadFileName: string = 'attachment.xls';
    listener: any;
    savename: string;
    // 是否可以保存
    issave: boolean = false;
    count: number = 0;

    constructor(private location: Location, private router: Router,
        private statementAttachmentApi: StatementAttachmentApi,
        private bankAccountApi: BankAccountApi, private pubSubService: PubSubService,
        private route: ActivatedRoute, private storageService: StorageService) { }

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

    ngOnInit(): void {
        if (this.route.snapshot.params['id']) {
            this.account.id = this.route.snapshot.params['id'];

        } else {
            this.account.id = this.location.path().split(';')[1].split('=')[1];
        }
        this.getReconItem();
    }

    getReconItem() {
        let dataSave = localStorage.getItem('importedReconcileData');
        if (dataSave) {
            this.dataSave = JSON.parse(dataSave);
            this.statementAttachmentId = this.dataSave.statementAttachmentId;
            _.forEach(this.dataSave.bankStatementColumn, (item) => {
                if (item.displayName) {
                    this.columnsList.push({
                        id: item.designName,
                        text: item.displayName,
                        disabled: false
                    });
                }
            });
            let dataList: any = _.cloneDeep(this.dataSave.columnsMapping);
            _.forEach(dataList, (item) => {
                if (item.mappingColumnName) {
                    _.forEach(this.dataSave.bankStatementColumn, (item2) => {
                        if (item2.designName === item.mappingColumnName) {
                            item.mappingColumnName = [{
                                id: item.mappingColumnName,
                                text: item2.displayName
                            }];
                        }
                    });
                }
            });
            this.dataList = _.cloneDeep(dataList);
        } else {
            this.alertDanger('导入数据为空！');
        }
    }

    save() {
        this.clearAlert();
        let columns = this.dataList;
        let selectedItems: any = [];
        selectedItems.includes = function (item) {
            return this.indexOf(item) === -1 ? false : true;
        };
        // format ng-select data for Api
        _.forEach(columns, (item) => {
            if (item.mappingColumnName && !item.mappingColumnName[0]) {
                item.mappingColumnName = null;
            }
            if (item.mappingColumnName && item.mappingColumnName[0] &&
                item.mappingColumnName[0].text) {
                _.forEach(this.dataSave.bankStatementColumn, (item2) => {
                    if (item2.displayName && item2.displayName === item.mappingColumnName[0].text) {
                        item.mappingColumnName = item2.designName;
                    }
                });
            }
        });
        let dataSave = _.clone(this.dataSave);
        dataSave.columnsMapping = columns;
        dataSave.bankAccountId = this.account.id;
        dataSave.datetimeStrings = null;
        _.forEach(columns, (item) => {
            if (item.mappingColumnName) {
                selectedItems.push(item.mappingColumnName);
            }
        });

        let repeatFlag: boolean = false;
        let repeatList: Array<string> = [];
        selectedItems = selectedItems.sort();
        _.forEach(selectedItems, (item, index) => {
            if (selectedItems[index] === selectedItems[index + 1]) {
                _.forEach(this.columnsList, (item1) => {
                    if (item1.id === item) {
                        repeatList.push(item1.text + '只能选择一次！');
                    }
                });
                repeatFlag = true;
            }
        });
        // Removes an array of duplicate elements
        let set = new Set(repeatList);
        repeatList = Array.from(set);


        if (!(selectedItems.includes('Debit') &&
            selectedItems.includes('Credit') && selectedItems.includes('AccountTransDate')
            || selectedItems.includes('TradeBalance') &&
            selectedItems.includes('AccountTransDate'))) {
            this.alertDanger('必须选择(日期和交易金额)或者(日期和收入和支出)');
            return;
        } else if (repeatFlag) {
            let repeatErrMsg = repeatList.join('') === undefined ? '' : repeatList.join('');
            console.log('<--repeatErrMsg-->', repeatErrMsg, repeatList);
            this.alertDanger(repeatErrMsg);
            return;
        } else if ((selectedItems.includes('Debit') ||
            selectedItems.includes('Credit')) && selectedItems.includes('TradeBalance')) {
            this.alertDanger('（收入和支出),(交易金额)不能同时选择');
        } else {
            this.savename = '匹配中...... ';
            this.issave = true;
            this.statementAttachmentApi.statementAttachmentSave(dataSave)
                .subscribe(
                data => {
                    if (data.value) {
                        this.count = 0;
                        this.matching();
                    }
                },
                error => {
                    this.issave = false;
                    this.savename = '';
                    this.alertDanger('哎呀，好像出错了，再试试吧');
                    console.log('error', error);
                }
                );
        }
    }
    matching() {
        this.count++;
        this.statementAttachmentApi.
            statementAttachmentGetStatus(this.dataSave.statementAttachmentId)
            .subscribe(
            data1 => {
                if (data1.parseStatus === 'completed') {
                    this.alertSuccess('保存成功！');
                    this.count = 0;
                    // 更新银行对账余额
                    this.pubSubService.publish({
                        type: EventType.matchSession,
                        data: 'currentBankStatementBalance'
                    });
                    this.router.navigate
                        (['/app/reconcile/multi-sync', { id: this.account.id, isReconcile: true }]);
                } else if (data1.parseStatus === 'error') {
                    this.modal.show();
                    this.savename = '';
                    this.issave = false;
                } else if (data1.parseStatus === 'uploading') {
                    if (this.count > 7) {
                        this.alertDanger('超时啦！请重新试试');
                        this.count = 0;
                        this.savename = '';
                        this.issave = false;
                    } else {
                        setTimeout(() => {
                            this.matching();
                        }, 2000);
                    }
                } else {
                    if (this.count > 7) {
                        this.alertDanger('超时啦！请重新试试');
                        this.count = 0;
                        this.savename = '';
                        this.issave = false;
                    }
                }

            },
            error => {
                this.count = 0;
                this.issave = false;
                this.savename = '';
                 this.alertDanger(error);
                console.log('error', error);
            }
            );

    }
    public show() {
        this.modal.show();
    }
    public hide() {
        this.modal.hide();
    }
    reImport() {
        this.modal.hide();
        this.router.navigate(['/app/reconcile/import', { id: this.account.id }]);
    }
    import() {
        // this.router.navigate(['/app/reconcile/import', { id: this.account.id }]);
        this.location.back();
    }

    ngOnDestroy() {
        if (this.listener) {
            clearInterval(this.listener);
        }
    }
}




