import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

import { TaxApi } from './../../../api/accounting/api/TaxApi';
import { TaxRateEnumModel } from './../../../api/accounting/model/TaxRateEnumModel';
import { AuthorizationService } from '../../../service/core/authorization';

import * as _ from 'lodash';

@Component({
  selector: 'app-tax-rate',
  templateUrl: './tax-rate.html',
  styleUrls: ['./tax-rate.scss'],
  providers: [TaxApi]
})
export class TaxRateComponent implements OnInit {




  placeList = [
    { name: '增值税', taxType: TaxRateEnumModel.TaxTypeEnum.ValueAddedTax, value: 0 },
    { name: '城建税', taxType: TaxRateEnumModel.TaxTypeEnum.BuildingTax, value: 0 },
    { name: '教育附加税', taxType: TaxRateEnumModel.TaxTypeEnum.EducationSurtax, value: 0 },
    { name: '地方教育附加税', taxType: TaxRateEnumModel.TaxTypeEnum.LocalEducationSurtax, value: 0 }];
  dataList = [];
  originData;
  isEdit: boolean = false;
  place = 20;

  Monthly: boolean;
  Quarterly: boolean;
  MonthlyIn: boolean;
  QuarterlyIn: boolean;
  MonthlyIncome;
  QuarterlyIncome;

  // 一般纳税人
  isGeneralTaxpayer: boolean = false;


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


  constructor(private taxApi: TaxApi, private ref: ChangeDetectorRef, private authorizationService: AuthorizationService) { }

  ngOnInit() {
    let session = this.authorizationService.getSession();
    // 是一般纳税人
    if (session.currentAccount.companyProperty === "GeneralTaxpayer") {
      this.isGeneralTaxpayer = true;
    }
    this.getAllTaxRate();
    // console.log('authorizationService', this.authorizationService.getSession());
  }
  getAllTaxRate() {
    this.taxApi.taxGet().subscribe(
      data => {
        let tempList = _.cloneDeep(data);
        if (tempList !== null) {
          this.dealWithTheData(data);
          this.originData = _.cloneDeep(tempList);
          setTimeout(() => this.ref.markForCheck(), 10);
        }
        console.log('<--->getAllTaxRate', data);
      }, error => {

      });
  }
  // 处理数据
  dealWithTheData(list) {
    this.dataList = _.cloneDeep(this.placeList);
    list.forEach(item => {
      switch (item.taxType) {
        case 'ValueAddedTax':

          item.value = item.value * 100;
          item.value = Number(item.value).toFixed(2);
          // item.valide = true;
          this.dataList[0].value = item.value;
          this.dataList[0].valide = true;
          break;
        case 'BuildingTax':

          item.value = item.value * 100;
          item.value = Number(item.value).toFixed(2);
          this.dataList[1].value = item.value;
          this.dataList[1].valide = true;
          break;
        case 'EducationSurtax':
          item.value = item.value * 100;
          item.value = Number(item.value).toFixed(2);
          this.dataList[2].value = item.value;
          this.dataList[2].valide = true;
          break;
        case 'LocalEducationSurtax':
          item.value = item.value * 100;
          item.value = Number(item.value).toFixed(2);
          this.dataList[3].value = item.value;
          this.dataList[3].valide = true;
          break;
        case 'MonthlyIncome'://月收入免附加税
          this.MonthlyIn = item.isEnable === 'N' ? false : true;
          this.MonthlyIncome = item.value;
          break;
        case 'QuarterlyIncome'://季度收入免附加税
          this.QuarterlyIn = item.isEnable === 'Y' ? true : false;
          this.QuarterlyIncome = item.value;
          break;
        case 'Monthly'://月度
          if (this.isGeneralTaxpayer) {
            this.Monthly = this.isGeneralTaxpayer;
          } else {
            this.Monthly = item.isEnable === 'Y' ? true : false;
          }
          break;
        case 'Quarterly'://季度
          // this.Quarterly = item.isEnable === 'N' ? false : true;
          break;
        default:
          break;
      }
    });
    console.log('<--this.dataList-->', this.dataList, this.Monthly, this.MonthlyIn, this.QuarterlyIn);
  }
  /**
   * 报税频率单选 
   * @param index 
   */
  selectRateType(index) {
    console.log('<--selectRateType-->', index);
    if (index === 1 || index === 2) {
      this.Monthly = index === 1 ? false : true;
    } else if (index === 3) {
      this.QuarterlyIn = !this.QuarterlyIn;
      // this.MonthlyIn = false;
    } else if (index === 4) {
      this.MonthlyIn = !this.MonthlyIn;
      // this.QuarterlyIn = false;
    }
  }
  // 编辑
  editCompany() {
    this.isEdit = true;
  }
  //修改税率
  taxRateChange(args, index) {
    if (Number(args) > 100 || Number(args) < 0) {
      this.dataList[index].valide = false;
    } else {
      this.dataList[index].valide = true;
    }
  }
  // 保存
  saveTaxRate() {
    let tempList = _.cloneDeep(this.dataList);
    let canSave = true;

    console.log('<,,,>ok', tempList);
    tempList.forEach(element => {
      if (element.taxType === TaxRateEnumModel.TaxTypeEnum.ValueAddedTax && element.value < 3) {
        canSave = false;
      }
      if (element.valide === false || element.value === null) {
        canSave = false;
      } else {
        element.value = element.value / 100;
      }
    });
    if (this.Monthly) {
      tempList.push({ isEnable: 'Y', name: '月度', taxType: 'Monthly', value: 0 });
      tempList.push({ isEnable: 'N', name: '季度', taxType: 'Quarterly', value: 0 });
      if (this.MonthlyIn) {
        if (this.MonthlyIncome === undefined) {
          return;
        }
        tempList.push({ isEnable: 'Y', name: '月收入免附加税', taxType: 'MonthlyIncome', value: this.MonthlyIncome });
      } else {
        tempList.push({ isEnable: 'N', name: '月收入免附加税', taxType: 'MonthlyIncome', value: this.MonthlyIncome });
      }
      tempList.push({ isEnable: 'N', name: '季度收入免附加税', taxType: 'QuarterlyIncome', value: this.QuarterlyIncome });
    } else {
      tempList.push({ isEnable: 'N', name: '月度', taxType: 'Monthly', value: 0 });
      tempList.push({ isEnable: 'Y', name: '季度', taxType: 'Quarterly', value: 0 });
      if (this.QuarterlyIn) {
        if (this.QuarterlyIncome === undefined) {
          return;
        }
        tempList.push({ isEnable: 'Y', name: '季度收入免附加税', taxType: 'QuarterlyIncome', value: this.QuarterlyIncome });
      } else {
        tempList.push({ isEnable: 'N', name: '季度收入免附加税', taxType: 'QuarterlyIncome', value: this.QuarterlyIncome });
      }
      tempList.push({ isEnable: 'N', name: '月收入免附加税', taxType: 'MonthlyIncome', value: this.MonthlyIncome });
    }


    if (canSave) {
      this.taxApi.taxPut(tempList).subscribe(
        data => {
          this.isEdit = false;
          this.alertSuccess('修改成功');
          console.log('<---->', this.isEdit, data);
          this.getAllTaxRate();
          setTimeout(() => this.ref.markForCheck(), 10);
        }, error => {
          this.alertDanger('修改失败');
        }
      );
    }

  }
  cancel() {
    let tempList = _.cloneDeep(this.originData);
    this.dealWithTheData(tempList);
    this.clearAlert();
    this.isEdit = false;
  }
}