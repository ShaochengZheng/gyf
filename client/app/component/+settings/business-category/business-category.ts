import { Component, ViewChild } from '@angular/core';
import { BusinessCategoryApi } from '../../../api/accounting/api/BusinessCategoryApi';
import { BusinessCategoryModel } from '../../../api/accounting/model/BusinessCategoryModel';
import { ConfirmEventTypeEnum } from '../../widget/confirm/confirm';
import * as _ from 'lodash';

@Component({
    selector: 'business-category',
    styleUrls: ['./business-category.scss'],
    templateUrl: './business-category.html',
    providers: [BusinessCategoryApi]
})
export class BusinessCategoryComponent {
    // @ViewChild('confirmWidget') public confirmWidget;

    // initBusinessCategoryModal: BusinessCategoryModel = {
    //     id: '0',
    //     name: null,
    //     level: null,
    //     businessCategoryType: null,
    //     parentBusinessCategoryModelId: null,
    // };
    // incomeCategoryList: any;
    // outcomeCategoryList: any;
    // currentItem: any;
    // tempName = null;
    // alert: Object = {};
    // newItem = {
    //     id: null,
    //     name: null,
    //     businessCategoryType: null,
    //     level: null,
    //     order: 0,
    //     parentBusinessCategoryModelId: null,
    //     show: false,
    //     isInit: false
    // };
    // currentBusinessCategory: any = _.clone(this.newItem);
    // newItemList = [];
    // constructor(private businessCategoryApi: BusinessCategoryApi) { }
    // ngOnInit() {
    //     this.getBusinessCategory('Income');
    //     this.getBusinessCategory('Outcome');
    // }
    // public alertSuccess(msg: string) {
    //     this.clearAlert();
    //     setTimeout(() => { this.alert = { type: 'success', msg: msg }; }, 0);
    // }

    // public alertDanger(msg: string) {
    //     this.clearAlert();
    //     setTimeout(() => { this.alert = { type: 'danger', msg: msg }; }, 0);
    // }
    // public clearAlert(): void {
    //     this.alert = {};
    // }
    // save(item) {
    //     this.currentItem = item;
    //     item.id ? this.modifyBusinessCategory(item) : this.addBusinessCategory(item);
    // }

    // openDeleteModal(item) {
    //     this.confirmWidget.show();
    //     this.currentBusinessCategory = item;
    // }
    // /* incomeCategory */
    // getBusinessCategory(type: string) {
    //     this.businessCategoryApi.businessCategoryGetAll(type)
    //         .subscribe(data => {
    //             console.log(data);
    //             let num = 0;
    //             let dataList = [];
    //             let parent = _.filter(data, function(item) { let temp: any = item;
    //               return temp.level === 1; });
    //             let children = _.filter(data, function(item) { let temp: any = item;
    //               return temp.level === 2; });
    //             _.forEach(parent, function(item, index) {
    //                 let temp: any = item;
    //                 dataList.push(item);
    //                 _.forEach(children, function(itemChild, indexChild) {
    //                     if (itemChild.parentBusinessCategoryModelId === item.id) {
    //                         num++;
    //                         dataList.push(itemChild);
    //                     }
    //                 });
    //                 temp.number = num;
    //                 num = 0;
    //             });
    //             for (let i = 0; i < dataList.length; i++) {
    //                 dataList[i].show = false;
    //                 dataList[i].order = -1;
    //                 if (dataList[i].level === 2) dataList[i].canDeleted = true;
    //             };
    //             if (type === 'Income') { this.incomeCategoryList = dataList; } else {
    //                 this.outcomeCategoryList = dataList;
    //             }
    //         }, error => {
    //             ;
    //             this.alertDanger(error);
    //             console.log(error);
    //         });
    // }
    // addBusinessCategory(businessCategoryModel) {
    //     this.businessCategoryApi.businessCategoryPost(businessCategoryModel)
    //         .subscribe(data => {
    //             this.currentItem.id = data.id;
    //             this.currentItem.show = true;
    //             this.currentItem.order = -1;
    //             this.currentItem.businessCategoryType = data.businessCategoryType;
    //             let dataList = (this.currentItem.businessCategoryType.value === 'Income' ?
    //                 this.incomeCategoryList : this.outcomeCategoryList);
    //             _.forEach(dataList, item => {
    //                 let temp: any = item;
    //                 if (this.currentItem.parentBusinessCategoryModelId === temp.id) temp.number++;
    //             });
    //             this.alertSuccess('添加成功！');
    //         }, error => {
    //             ;
    //             this.alertDanger(error);
    //         });
    // }
    // modifyBusinessCategory(businessCategoryModel: any) {
    //     this.businessCategoryApi.businessCategoryPut(businessCategoryModel)
    //         .subscribe(data => {
    //             this.currentItem.id = data.id;
    //             this.currentItem.show = true;
    //             this.currentItem.order = -1;
    //             this.currentItem.businessCategoryType = data.businessCategoryType;
    //             this.alertSuccess('修改成功！');
    //             console.log(data);
    //         }, error => {
    //             this.currentItem.name = this.tempName;
    //             ;
    //             this.alertDanger(error);
    //         });
    // }

    // delete(event) {
    //     if (event === ConfirmEventTypeEnum.Confirm) {
    //         this.businessCategoryApi.businessCategoryDelete(this.currentBusinessCategory.id)
    //             .subscribe(data => {
    //                 let dataList = (
    //                   this.currentBusinessCategory.businessCategoryType.value === 'Income' ?
    //                   this.incomeCategoryList : this.outcomeCategoryList);
    //                 _.remove(dataList, item => {
    //                     let temp: any = item;
    //                     if (this.currentBusinessCategory.parentBusinessCategoryModelId === temp.id)
    //                       temp.number--;
    //                     return this.currentBusinessCategory.id === temp.id;
    //                 });
    //                 _.remove(this.newItemList, item => {
    //                     let temp: any = item;
    //                     return this.currentBusinessCategory.order === temp.order;
    //                 });

    //                 this.alertSuccess('删除成功！');
    //                 console.log(data);
    //             }, error => {
    //                 console.log(error);
    //                 ;
    //                 this.alertDanger(error);
    //             });
    //     }
    // }
    // toggle(value, option) {
    //     value.show = !value.show;
    //     let num = 0;
    //     let dataList = this.incomeCategoryList.concat(this.outcomeCategoryList);
    //     _.forEach(dataList, function(item, index) {
    //         if (item.level === 2 && item.parentBusinessCategoryModelId === value.id) {
    //             num++;
    //             if (option === 'showInput') { item.show = true; } else {
    //                 item.show = !item.show;
    //             }
    //         }
    //     });
    //     dataList = null;
    // }

    // newCategory() {
    //     let list = this.newItemList;
    //     let length = list.length;
    //     let orderTmp: number = 0;
    //     let item = _.clone(this.newItem);
    //     if (length > 0) {
    //         if (list[length - 1].order > 0) {
    //             orderTmp = list[length - 1].order + 1;
    //         } else {
    //             orderTmp = 1;
    //         }
    //     } else {
    //         orderTmp = 1;
    //     }
    //     item.order = orderTmp;
    //     item.level = 2;
    //     item.show = true;
    //     list.push(item);
    //     return item;
    // };
    // showInput(value, type) {
    //     if (value.show === false) {
    //         this.toggle(value, 'showInput');
    //     };
    //     let num = 0;
    //     let childrenNum = 0;
    //     let dataList = (type === 0 ? this.incomeCategoryList : this.outcomeCategoryList);
    //     let newItem = this.newCategory();
    //     newItem.parentBusinessCategoryModelId = value.id;
    //     _.forEach(dataList, function(item, index) {
    //         if (item.level === 1 && value.id === item.id) {
    //             childrenNum = item.number;
    //             if (childrenNum === 0) dataList.splice(index + 1, 0, newItem);
    //         }
    //         if (item.level === 2 && item.parentBusinessCategoryModelId === value.id && item.order === -1) {
    //             num++;
    //             if (childrenNum === num) {
    //                 dataList.splice(index + 1, 0, newItem);
    //             }
    //         }
    //     });
    // }
    // quit(value, type, option) {
    //     if (option === 'modify' && value.id) {
    //         value.order = -1;
    //         return;
    //     }
    //     let dataList = (type === 0 ? this.incomeCategoryList : this.outcomeCategoryList);
    //     _.remove(dataList, item => {
    //         let temp: any = item;
    //         return value.order === temp.order;
    //     });
    //     _.remove(this.newItemList, item => {
    //         let temp: any = item;
    //         return value.order === temp.order;
    //     });
    // }

}
