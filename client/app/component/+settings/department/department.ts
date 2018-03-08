import { Component, ViewChild, OnInit, ChangeDetectorRef } from '@angular/core';
import * as _ from 'lodash';
// import { DepartmentApi } from '../../../api/accounting/api/DepartmentApi';
// import { DepartmentModel } from '../../../api/accounting/model/DepartmentModel';
import { OperationModeEnum } from '../../../service/core/core';
import { ConfirmEventTypeEnum } from '../../widget/confirm/confirm';

@Component({
    selector: 'department',
    templateUrl: './department.html',
    styleUrls: ['./department.scss'],
    // providers: [DepartmentApi]
})
export class DepartmentComponent  {
    // @ViewChild('departmentDetailsModal') public departmentDetailsModal;
    // @ViewChild('confirmWidget') public confirmWidget;

    // currentDepartment: DepartmentModel;
    // pageIndex: number = 1;
    // pageSize: number = 1;
    // recordCount: number = 0;
    // maxSize: number = 10;
    // deleteMessage: string = '您确认要删除部门吗？';
    // dataList: DepartmentModel[];
    // noDataList: boolean = false;
    // alert: Object = {};

    // searchModel = {
    //     keyword: '',
    //     pageIndex: '1',
    //     pageSize: '10'
    // };

    // constructor(private departmentApi: DepartmentApi, private ref: ChangeDetectorRef) {

    // }


    // public alertSuccess(msg: string) {
    //     this.clearAlert();
    //     setTimeout(() => { this.alert = { type: 'success', msg: msg }; }, 0);
    // }

    // public alertDanger(msg: string) {
    //     this.clearAlert();
    //     setTimeout(() => { this.alert = { type: 'danger', msg: msg }; }, 0);
    // }

    // public addAlert(alert: Object): void {
    //     this.clearAlert();
    //     setTimeout(() => { this.alert = alert; }, 0);
    // }

    // public clearAlert(): void {
    //     this.alert = {};
    // }

    // newDepartment() {
    //     this.departmentDetailsModal.operation = OperationModeEnum.New;
    //     this.departmentDetailsModal.show();
    // }

    // editDepartment(item) {
    //     let tempItem = _.cloneDeep(item);
    //     this.departmentDetailsModal.operation = OperationModeEnum.Update;
    //     this.departmentDetailsModal.show(tempItem);
    // }

    // ngOnInit(): void {
    //     this.clearAlert();
    //     this.search();
    // }


    // search() {
    //     this.departmentApi.departmentSearch(this.searchModel.keyword,
    //       this.searchModel.pageIndex, this.searchModel.pageSize)
    //         .subscribe(
    //         (data) => {
    //             this.pageIndex = data.pageIndex;
    //             this.recordCount = data.recordCount;
    //             this.pageSize = data.pageSize;
    //             this.dataList = data.list;
    //             if (this.dataList === null || this.dataList.length === 0) {
    //                 this.noDataList = true;
    //             }else {
    //                 this.noDataList = false;
    //             }
    //             this.ref.detectChanges();
    //         },
    //         (error) => {

    //         }
    //         );
    // }

    // openDeleteModal(item) {
    //     this.confirmWidget.show();
    //     this.currentDepartment = item;
    // }

    // delete(event) {
    //     if (event === ConfirmEventTypeEnum.Confirm) {
    //         this.departmentApi.departmentDelete(this.currentDepartment.id)
    //             .subscribe(
    //             (data) => {
    //                 this.search();
    //                 this.alertSuccess('删除成功！');
    //             },
    //             (error) => {
    //                 ;
    //                 this.alertDanger(error);
    //             }
    //             );
    //     };
    // }

    // result(resultObj) {
    //     this.search();
    //     console.log('result', resultObj);
    //     this.addAlert(resultObj);
    // }
    // public pageChanged(event: any): void {
    //     this.searchModel.pageIndex = event.page;
    //     this.search();
    // };

}
