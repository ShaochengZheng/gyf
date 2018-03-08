import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from "lodash";
import * as moment from 'moment';

import { InvoiceService } from './../shared/invoice.service';
import { StorageService, AuthorizationService } from '../../../service/core';
import { ShareService } from '../../../service/core/share';


@Component({
    selector: 's-deduction',
    templateUrl: './deduction.component.html',
    styleUrls: ['../shared/invoice.scss']
})
export class DeductionComponent implements OnInit, OnDestroy {
    @ViewChild('addRollOutAlert') public addRollOutAlert;
    @ViewChild('addDeductingConfirm') public addToConfirm;
    @ViewChild('deleteConfirm') public deleteConfirm;
    @ViewChild('certiMoveOut') public certiMoveOut;
    // 选项卡状态
    waitForDeduction: boolean = true;
    certificate: boolean = false;
    moveOut: boolean = false;
    // 弹出提示框
    alert = {};
    // 分页组件
    pageIndex: number = 1;
    pageSize: number = 10;
    recordCount: number = 0;
    maxSize: number = 0;

    // 'Deducting'待抵扣清单, 'Certification'认证清单, 'DeductingRollout'待抵扣转出清单 ‘CertificationRollout’认证转出
    modal = {
        invoiceDeductStatus: 'Deducting',
        keyword: '',
        startDate: '',
        endDate: '',
        invoiceNumber: '',
        pageIndex: '1',
        pageSize: '10'
    };
    headerList = [{}, {}, {}];
    deduList = [];
    deduStorage = [];

    addToFlag: boolean;

    // 待抵扣清单 有选中的项目
    deduSelect: boolean = false;
    seleItem;

    // 当前筛选总金额
    currentCount = 0;
    currentTaxC = 0;
    currentExpTax = 0;
    // 当前账期
    currentPeriod = ''; // localStorage.getItem('currentPeriod').substr(0, 7);
    lock: boolean = false;
    // 是否展示 日期选择
    isDate: boolean = false;
    yearList = [];
    monthList = [];
    defaultYear = [];
    defaultMonth1 = [];
    defaultMonth2 = [];

    constructor(private invoiceService: InvoiceService, private router: Router, private route: ActivatedRoute,
        private storageService: StorageService, private authorizationService: AuthorizationService,
        private shareService: ShareService) {

    }

    ngOnInit() {
        this.accountAccountPeriod();
        console.log('------account time', this.currentPeriod);
        // this.accountStatus();
    }
    // 获取对账区间
    accountAccountPeriod() {
        this.shareService.accountAccountPeriod(false).then(
            accountPeriodModel => {
                if (accountPeriodModel) {
                    this.yearList = accountPeriodModel.YearList;
                    this.monthList = accountPeriodModel.MonthsToList;
                    let currentYear = accountPeriodModel.currentYear;
                    let currentMonth = Number(accountPeriodModel.currentMonth);
                    let month = currentMonth < 10 ? '0' + currentMonth : currentMonth;
                    this.currentPeriod = currentYear + '-' + month;
                    this.defaultYear = [{ id: 'year', text: currentYear }];

                    let type = this.route.snapshot.params['type'];
                    if (type) {
                        this.choose(type);
                        return;
                    }
                    this.searchDebuction();
                }
                console.log('<--accountPeriodModel--->', accountPeriodModel);
            },
            error => {
                console.log(error);
            }
        );
    }
    // 获取 顶部数据
    invoiceStatistics() {
        this.invoiceService.invoiceStatistics(this.modal).then(
            data => {
                let dataList = data.statisticmodels;
                this.currentTaxC = data.searchTaxAmount;
                this.currentExpTax = data.searchExcludingTax;
                this.currentCount = data.searchTotalAmount;
                _.forEach(dataList, item => {
                    if (item.deductType === 'Deducting') {
                        this.headerList[0] = item;
                    } else if (item.deductType === 'Certification') {
                        this.headerList[1] = item;
                    } else {
                        this.headerList[2] = item;
                    }
                });
                console.log('invoiceStatistics', data);
            }).catch(
            error => {
                this.alertDanger(error);
            });
    }
    /**
     * 获取 待抵扣清单-认证清单-待抵扣转出清单 列表
     * @param invoiceDeductStatus 
     * @param keyword 
     * @param startDate 
     * @param endDate 
     * @param invoiceNumber 
     * @param pageIndex 
     * @param pageSize 
     */
    searchDebuction() {
        this.invoiceStatistics();
        this.invoiceService.invoiceSearch(this.modal).then(
            data => {
                if (this.modal.invoiceDeductStatus === 'Deducting') {
                    _.forEach(data.list, item => {
                        item.isCheck = false;
                    });
                }
                this.manageTheData(data);
            }).catch(
            error => {
                this.alertDanger(error);
            });
    }
    // 便利一遍数据 对有子项的数据 进行关键数据拼接
    manageTheData(data) {
        _.forEach(data.list, item => {
            // 处理认证期间 进项税转出 和 删除的操作
            if (this.modal.invoiceDeductStatus === 'Certification') {
                // 账套期间内 可删除 ,早于账套期间 可以进项税转出 晚于账套 啥都不能干
                // 是否可以操作
                item.isDis  = false;
                if (moment(item.deductTime).isSame(this.currentPeriod)) {
                    item.isDele = true;
                    item.isTran = false;
                } else if (moment(item.deductTime).isBefore(this.currentPeriod)) {
                    item.isDele = false;
                    item.isTran = true;
                } else {
                    item.isDele = true;
                    item.isTran = false;
                    item.isDis  = true;
                }
                // 判断 已转出的 认证清单  是否处于当前账期 如果不是 不可以取消转出
                let deductedTime = moment(item.deductedTime).format('YYYY-MM');
                if (moment(deductedTime).isSame(this.currentPeriod)){
                    item.isRevoked = true;
                }else {
                    item.isRevoked = false;
                }
            }
            let taxStr = '';
            let taxMStr = '';
            let expMStr = '';
            let cage = '';
            _.forEach(item.invoiceItemModels, modal => {
                let total = modal.amount;
                let tax = modal.taxRate;
                // let name = modal.businessCategory.name;
                let taxM = total / (1 + tax) * tax;
                let expM = total / (1 + tax);

                taxStr = taxStr + tax * 100 + '%,';
                taxMStr = taxMStr + taxM.toFixed(2) + ',';
                expMStr = expMStr + expM.toFixed(2) + ',';
                // cage = cage + name + ',';
            });
            // item.cage = this.csubStr(cage);
            item.taxS = this.csubStr(taxStr);
            item.taxMString = this.csubStr(taxMStr);
            item.expMString = this.csubStr(expMStr);
        });
        this.deduList = data.list;
        this.pageIndex = data.pageIndex;
        this.maxSize = data.pageCount;
        this.recordCount = data.recordCount;
        console.log('searchDebuctio', this.deduList);
    }
    // 截取字符串
    csubStr(str): String {
        let len = str.length - 1;
        return str.substr(0, len);
    }
    // 进项税转出
    deduMoveOut(item) {
        this.certiMoveOut.title = '转出确认';
        this.certiMoveOut.message = '确认对本条认证进行进项税转出？';
        this.certiMoveOut.show();
        this.seleItem = item;
    }
    // 撤销 进项税转出
    revokeDeduMoveOut(item) {
        this.certiMoveOut.title = '转出确认';
        this.certiMoveOut.message = '确认撤销进项税转出？';
        this.certiMoveOut.show();
        this.seleItem = item;
    }
    // 进项税转出 或撤销进项税转出
    certiMoveO(args) {
        let modal = {
            deductStatus: '',
            invoiceIds: [this.seleItem.id]
        };
        if (this.seleItem.deductstatus === 'Certification') {
            modal.deductStatus = 'CertificationRollout';
        } else if (this.seleItem.deductstatus === 'CertificationRollout') {
            modal.deductStatus = 'Certification';
        }

        this.invoiceDeductDeleteByService(modal);
    }

    // 删除认证清单
    deduDelete(item, type) {
        this.seleItem = item;
        this.deleteConfirm.title = '确认删除';
        this.deleteConfirm.confirmText = '确定';
        if (type === 'Certification') {
            this.deleteConfirm.message = '确认对本条认证从认证清单中移除？';
        } else {
            this.deleteConfirm.message = '确认对本条认证从待抵扣转出清单中移除？';
        }

        this.deleteConfirm.show();

    }
    // 确认删除
    deleteCon(args) {
        let modal = {
            deductStatus: 'Deducting',
            invoiceIds: [this.seleItem.id]
        };
        this.invoiceDeductDeleteByService(modal);
    }
    // 删除认证清单 或者转出认证清单请求接口
    invoiceDeductDeleteByService(modal) {
        console.log('invoiceDeductDeleteByService', modal.invoiceIds);
        this.invoiceService.invoiceDeduct(modal).then(
            data => {
                console.log('');
                this.searchDebuction();
            })
            .catch(error => {
                this.alertDanger(error);
            });
    }

    // 待抵扣清单选择
    selectTarget(item, index) {
        console.log('selectTarget', item, index);
        item.isCheck = !item.isCheck;

        let arrIDS = this.filterListByCheck();
        let num = arrIDS.length;
        if (num <= 0) {
            this.deduSelect = false;
        } else {
            this.deduSelect = true;
        }
    }
    /**
     *  单页筛选 选中的清单
     */
    filterListByCheck(): Array<any> {
        let checkList = [];
        _.forEach(this.deduList, item => {
            if (item.isCheck) {
                checkList.push(item.id);
            }
        });
        return checkList;
    }
    /**
     * 抵扣清单的操作请求
     * 加入XX,删除等等
     */
    invoiceDeductByService(modal) {
        this.deduSelect = false;
        console.log('invoiceDeductByService', modal.invoiceIds);
        this.invoiceService.invoiceDeduct(modal).then(
            data => {
                console.log('');
                this.addToConfirm.show();
                this.searchDebuction();
            })
            .catch(error => {
                this.deduSelect = true;
                this.alertDanger(error);
            });
    }
    /**
     * 加入待抵扣转出清单
     * 和弹窗提示
     */
    addToRollout() {
        this.addRollOutAlert.title = '加入确认';
        this.addRollOutAlert.message = '若加入此清单，跨月仅能通过反结转移除！确认对所选业务单进行待抵扣转出？';
        this.addRollOutAlert.show();
    }
    addRollOutA(event) {
        this.addToFlag = false;
        let arrIDS = this.filterListByCheck();
        let num = arrIDS.length;
        if (num <= 0) {
            return;
        }
        let rolloutModal = {
            deductStatus: 'DeductingRollout',
            invoiceIds: arrIDS
        };
        this.addToConfirm.title = '加入成功';
        this.addToConfirm.message = '恭喜您，' + num + '张发票成功加入待抵扣转出清单';
        this.addToConfirm.confirmText = '查看此清单';
        this.addToConfirm.cancelText = '继续加入';
        this.invoiceDeductByService(rolloutModal);
    }
    /**
     * 加入认证清单
     */
    addToCertification() {
        this.addToFlag = true;
        let arrIDS = this.filterListByCheck();
        let num = arrIDS.length;
        if (num <= 0) {
            return;
        }
        let certificationModal = {
            deductStatus: 'Certification',
            invoiceIds: arrIDS
        };

        this.addToConfirm.title = '加入成功';
        this.addToConfirm.message = '恭喜您，' + num + '张发票成功加入认证清单';
        this.addToConfirm.confirmText = '查看此清单';
        this.addToConfirm.cancelText = '继续加入';
        this.invoiceDeductByService(certificationModal);
    }
    // 确认加入后跳转
    addDeductingC(event) {
        if (this.addToFlag) {
            this.choose('Certification');
        } else {
            this.choose('DeductingRollout');
        }
    }
    /**
     * 导入认证清单
     */
    importRollout() {
        this.router.navigate(['/app/invoice/import-dedu']);
    }
    // 选项卡选择
    // 'Deducting'待抵扣清单, 'Certification'认证清单, 'DeductingRollout'待抵扣转出清单
    choose(type) {
        if (type === 'Deducting') {
            this.waitForDeduction = true;
            this.certificate = false;
            this.moveOut = false;
        };
        if (type === 'Certification') {
            this.waitForDeduction = false;
            this.certificate = true;
            this.moveOut = false;
        };
        if (type === 'DeductingRollout') {
            this.waitForDeduction = false;
            this.certificate = false;
            this.moveOut = true;
        };
        this.clearSearchModal();
        this.modal.invoiceDeductStatus = type;
        this.modal.pageIndex = '1';
        this.deduList = [];
        this.searchDebuction();
    }
    // 分页操作
    pageChanged(args) {
        console.log('pageChanged',args);
        this.modal.pageIndex = String(args.page);
        this.searchDebuction();
    }

    ngOnDestroy() { }
    showDate() {
        this.isDate = !this.isDate;
        // if (this.isDate) {
        //     this.accountAccountPeriod();
        // }
    }
    // 筛选年月
    selected(args, type) {
        console.log('selected', args, type, this.defaultMonth1);
        if (type === 'year') {
            // if(args.text !== this.defaultYear[0].text){
            //     this.defaultMonth1 = this.defaultMonth2 = [];
            // }
        }
        if (type === 'month1' || type === 'month2') {
            if (this.defaultMonth1.length === 0 || this.defaultMonth2.length === 0) {
                this.defaultMonth2 = this.defaultMonth1 = [args];
            }
            if (args.text > this.defaultMonth2[0].text && type === 'month1') {
                this.defaultMonth2 = this.defaultMonth1 = [args];
            }
            if (this.defaultMonth1[0].text > args.text && type === 'month2') {
                this.defaultMonth1 = this.defaultMonth2 = [args];
            }
            this.filterTDate();
        }
    }
    // 拼接数据
    filterTDate() {
        let m1 = Number(this.defaultMonth1[0].text);
        let m2 = Number(this.defaultMonth2[0].text);
        let month1 = m1 < 10 ? '0' + m1 : m1;
        let month2 = m2 < 10 ? '0' + m2 : m2;
        let start = this.defaultYear[0].text + '-' + month1;
        let end = this.defaultYear[0].text + '-' + month2;
        console.log('filterTDate', start, end);
        this.modal.startDate = start;
        this.modal.endDate = end;
        this.modal.pageIndex = '1';
        this.searchDebuction();
    }

    // 清空搜索Modal
    clearSearchModal() {
        this.isDate = false;
        this.modal.endDate = '';
        this.modal.startDate = '';
        this.modal.keyword = '';
        this.defaultMonth1 = [];
        this.defaultMonth2 = [];
    }
    // 清空筛选条件
    clearSearch() {
        this.clearSearchModal();
        this.searchDebuction();
    }
    // 搜索
    blurkeyWord(args) {
        this.modal.pageIndex = '1';
        this.searchDebuction();
    }
    keyPressHandler(event) {
        if (event.charCode === 13) {
            this.searchDebuction();
        }
    }
    // 各种导出
    exportDeduction() {
        this.invoiceService.invoiceDeductExport(this.modal).then(
            data => {
                console.log('');
                this.alertSuccess('导出成功');

                let elemIF = document.createElement('iframe');
                elemIF.src = data;
                elemIF.style.display = 'none';
                document.body.appendChild(elemIF);
                // this.formData = new FormData();
            })
            .catch(error => {
                this.alertDanger(error);
            });
    }
    // 账套状态
    accountStatus() {
        this.invoiceService.accountBookSettingGet().then(
            data => {
                console.log('accountStatus', data);
                if (data.status.value === 'InProgress'){
                    this.lock = false;
                }else {
                    this.lock = true;
                }
            })
            .catch(error => {

            });
    }

    // 弹窗
    public alertSuccess(msg: string) {
        this.clearAlert();
        setTimeout(() => {
            this.alert = { type: 'success', msg: msg };
        }, 0);
    }

    public alertDanger(msg: string) {
        this.clearAlert();
        setTimeout(() => {
            this.alert = { type: 'danger', msg: msg };
        }, 0);
    }

    public addAlert(alert: Object): void {
        this.clearAlert();
        this.alert = alert;
    }

    public clearAlert(): void {
        this.alert = {};
    }
}
