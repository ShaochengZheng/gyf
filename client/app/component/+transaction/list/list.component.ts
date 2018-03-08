import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { TagApi } from '../../../api/accounting/api/TagApi';
import { AccountTransLineItemApi } from '../../../api/accounting/api/AccountTransLineItemApi';
import { AccountTransLineItemModel } from '../../../api/accounting/model/AccountTransLineItemModel';
import { AccountTransactionApi } from '../../../api/accounting/api/AccountTransactionApi';

import { ShareService } from '../../../service/core/share';
import { ConfirmWidget } from '../../widget/confirm/confirm';

import * as _ from 'lodash';

@Component({
    selector: 'list',
    templateUrl: 'list.component.html',
    styleUrls: ['./list.component.scss'],
    providers: [AccountTransLineItemApi, TagApi],

})

export class ListComponent implements OnInit {
    @ViewChild('confirmWidget') public confirmWidget: ConfirmWidget;
    // 分页总数
    recordCount = '1';
    maxSize: number = 5;
    // 当前页
    pageCount = '1';
    // 是否显示搜索
    isSearch: boolean = true;
    // 标签临时储存
    tagTemp = [];
    // 搜索modal
    bankaccountid: string = '';
    // '交易类型：0、全部；1、收入；2、支出'
    accountTransactionType: string = '';
    keyword: string = '';
    startDate: string;
    endDate: string;
    tagIds = '';
    pageIndex: number = 1;
    pageSize = '10';
    carryForwardStatus: string = '';
    // 标签列表
    recommendTagList: any;
    tagList = [{ id: '1', value: '11', checked: false }];
    tagLists = [{ id: '1', value: '11', checked: false }];
    displayTags = true;
    // 是否隐藏列表
    isData: boolean = false;
    // delete
    delaccountTransId: any;
    delId: any;


    // 收支子项列表
    accountTransLineItemModel: Array<AccountTransLineItemModel>;
    alert = {};

    // 账户列表
    accountList: any;

    // 非现金账户列表
    noCashList: any = [];
    // 收支总金额
    balanceOfTotalAmount: {};

    /**
     *
     *
     * @param {string} msg
     *
     */
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

    constructor(private shareService: ShareService, private accountTransLineItemApi: AccountTransLineItemApi, private router: Router,
        private accountTransactionApi: AccountTransactionApi, private tagApi: TagApi) {
    }

    ngOnInit() {
        this.searchBlur();
        this.getBankList();
        this.getNoCashBank();
        this.getAllTags();
    }

    showSearch() {
        this.isSearch = !this.isSearch;
    }

    /**
     * 分页获取交易记录
     *
     * @param bankaccountid 银行账户Id
     * @param accountTransactionType 交易类型：0、全部；1、收入；2、支出
     * @param keyword 关键字
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @param tagIds 标签id,以逗号分隔
     * @param pageIndex 页数索引
     * @param pageSize 页数大小
     * @param carryForwardStatus 结转状态：0、全部或者空；1、未结转；2、已结转
     */
    accountTransLineItemSearch(bankaccountid = this.bankaccountid, accountTransactionType = this.accountTransactionType,
        keyword = this.keyword, startDate = this.startDate,
        endDate = this.endDate, tagIds = this.tagIds, pageIndex = this.pageIndex.toString()
        , pageSize = this.pageSize, carryForwardStatus = this.carryForwardStatus) {

        this.accountTransLineItemApi.accountTransLineItemSearch(bankaccountid,
            accountTransactionType, keyword, startDate, endDate, tagIds, pageIndex, pageSize, carryForwardStatus).subscribe(
            pagedResultAccountTransactionModel => {
                if (pagedResultAccountTransactionModel.list) {
                    this.isData = false;
                    this.accountTransLineItemModel = pagedResultAccountTransactionModel.list;
                    this.recordCount = pagedResultAccountTransactionModel.recordCount.toString();
                    this.pageCount = pagedResultAccountTransactionModel.pageCount.toString();
                    this.pageIndex = pagedResultAccountTransactionModel.pageIndex;
                    this.pageSize = pagedResultAccountTransactionModel.pageSize.toString();
                } else {
                    this.isData = true;
                    // this.alertDanger('数据为空');
                }

                console.log(pagedResultAccountTransactionModel);
            },
            error => {
                console.error(error);
            }
            );
    }
    /**
     * 获取收入或支持的总计
     * 返回的list数组中，第一个为收入总额，第二个为支出总额
     * @param bankaccountid 银行账户Id
     * @param accountTransactionType 交易类型：0、全部；1、收入；2、支出
     * @param keyword 关键字
     * @param startDate 开始时间
     * @param endDate 结束时间
     * @param tagIds 标签id,以逗号分隔
     * @param carryForwardStatus 结转状态：0、全部或者空；1、未结转；2、已结转
     */
    accountTransLineItemTransactionSum(bankaccountid = this.bankaccountid, accountTransactionType = this.accountTransactionType,
        keyword = this.keyword, startDate = this.startDate,
        endDate = this.endDate, tagIds = this.tagIds, pageIndex = this.pageIndex.toString()
        , pageSize = this.pageSize, carryForwardStatus = this.carryForwardStatus.toString()) {

        this.accountTransLineItemApi.accountTransLineItemTransactionSum(bankaccountid,
            accountTransactionType, keyword, startDate, endDate, tagIds, carryForwardStatus).subscribe(
            idNameModel => {
                this.balanceOfTotalAmount = idNameModel;
                console.log(idNameModel);
            },
            error => {
                console.error(error);
            }
            );
    }

    getBankList() {
        this.shareService.getBankList().then(
            data => {
                this.accountList = data;
                console.log('this.accountList', this.accountList);
            },
            error => {

            }
        );
    }

    getNoCashBank() {
        this.shareService.getNoCashBank().then(
            data => {
                this.noCashList = data;
                console.log('this.noCashList', this.noCashList);
            },
            error => {

            }
        );

    }

    // 删除某一个

    /**
     *
     *
     * @param {any} accountTransId
     * @param {any} id
     *
     * @memberof ListComponent
     */
    delete() {
        this.accountTransLineItemApi.accountTransLineItemDelete(this.delaccountTransId, this.delId).subscribe(
            l => {
                if (l) {
                    console.log(l);
                    for (let i = 0; i < this.accountTransLineItemModel.length; i++) {
                        if (this.delId === this.accountTransLineItemModel[i].id) {
                            this.accountTransLineItemModel.splice(i, 1);
                        }
                    }
                    this.alertSuccess('删除成功');
                    this.searchBlur();
                } else {
                    this.alertDanger('删除失败');

                }

            },
            error => {
                console.error(error);
                this.alertDanger(error);

            }
        );
    }

    // 确认删除
    showConfirmWidget(accountTransId, id) {
        this.delaccountTransId = accountTransId;
        this.delId = id;
        const deleteMessage = '您确定要删除该收支吗？';
        this.confirmWidget.message = deleteMessage;
        this.confirmWidget.show();
    }

    // 去编辑

    /**
     *
     *
     * @param {any} type
     * @param {any} id
     *
     * @memberof ListComponent
     */
    toEdit(type, id, sourceId) {
        console.log(id);
        console.log(type);
        console.log(sourceId);
        // 如果有sourceId 就是互转的
        if (sourceId) {
            this.router.navigate(['/app/transaction/detail/editaccountTransfers', { id: id }]);

        } else {
            if (type === 'Outcome') {
                console.log('tiao');
                this.router.navigate(['/app/transaction/detail/editOutcome', { id: id }]);
            } else if (type === 'Income') {
                this.router.navigate(['/app/transaction/detail/editIncome', { id: id }]);
            } else {
            }

        }

    }


    /**
     * 重置tags选中状态
     */
    resetTags() {
        if (this.tagList) {
            const templist = [];
            this.tagList.forEach(item => {
                item.checked = false;
                templist.push(item);
            });
            this.tagList = templist;
        }
    }

    // 获取所有标签
    getAllTags() {
        this.tagApi.tagSearch().subscribe(
            tagModel => {
                if (tagModel) {

                } else {
                    tagModel = [];

                }
                const temp: any = tagModel;
                this.tagLists = _.cloneDeep(temp);
                this.tagLists.forEach(item => {
                    item.checked = false;
                });
                if (this.tagLists) {
                    this.tagList = this.tagLists.slice(0, 10);
                }
                console.log(this.tagLists);
            },
            error => {

            }
        );
    }

    search_tagToggle(flag: boolean) {
        if (flag) {
            this.tagList = this.tagLists;
        } else {
            if (this.tagLists) {
                this.tagList = this.tagLists.slice(0, 10);
            }
        }
        this.displayTags = !this.displayTags;
    }

    // 标签
    search_tagSearch(item, index) {
        console.log('<--->', item, index);
        if (this.tagList[index].checked) {
            this.tagList[index].checked = false;
            this.tagLists[index].checked = false;
        } else if (!this.tagList[index].checked) {
            this.tagList[index].checked = true;
            this.tagLists[index].checked = true;
        }
        this.setTagsID();
    }

    setTagsID() {
        let ids = '';
        this.tagLists.forEach(item => {
            if (item.checked) {
                ids = ids + item.id + ',';
            }
        });
        if (ids) {
            const count = String(ids).length - 1;
            ids = String(ids).substring(0, count);
            this.tagIds = ids;
            console.log('<--setTagsID-->', ids);
        } else {
            this.tagIds = '';
        }
        this.searchBlur();
    }

    // 获取当前日期
    public getTodayDate() {
        const date = new Date();
        const seperator = '-';
        const year = date.getFullYear();
        const month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
        const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
        const currentdate: any = year + seperator + month + seperator + day;
        return currentdate;
    }

    // 分页
    pageChanged(e) {
        console.log(e);
        this.pageIndex = e.page;
        this.searchBlur(true);
    }

    // 搜索
    searchBlur(ispage?: boolean) {
        if (ispage) {

        } else {
            this.pageIndex = 1;
        }
        this.accountTransLineItemSearch();
        this.accountTransLineItemTransactionSum();
    }

    // 标签添加

    /**
     *
     *
     * @param {any} item
     *
     * @memberof ListComponent
     */
    tagPush(item) {
        console.log(item);
        for (let i = 0; i < this.recommendTagList.length; i++) {
            if (item.id.includes(this.recommendTagList[i].id)) {
                console.log(item);
                this.tagTemp.push(item.id);
            } else {
                this.tagTemp.splice(i, 1);
            }
        }
        this.tagIds = this.tagTemp.join(',');
        this.searchBlur();
    }

    // 设置账户
    setUpTheAccount(e) {
        console.log(e);
        this.bankaccountid = e.id;
        this.searchBlur();
    }

    // 清空搜索
    clearnSearchForm() {
        this.bankaccountid = '';
        this.accountTransactionType = '';
        this.keyword = '';
        this.startDate = '';
        this.endDate = '';
        this.tagIds = '';
        this.pageIndex = 1;
        this.pageSize = '10';
        this.searchBlur();
        this.resetTags();
    }
}
