import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, AfterViewInit, ChangeDetectorRef, ViewChild } from '@angular/core';


import { FixedAssetService } from './../../shared/fixed-asset.service';
import { MFixedAssetModel } from './../../shared/fixed-asset.model';
import { OperationModeEnum } from '../../../../service/core/core';
import { ShareService } from './../../../../service/core/share';
import { UtilityService } from '../../../../service/core/utility';

// tslint:disable-next-line:max-line-length
import { SourceTypeEnumModel, InvoiceTypeEnumModel, DepartmentTypeEnumModel, AssetTypeEnumModel } from './../../../../api/accounting/model/models';

import * as _ from 'lodash';
import * as moment from 'moment';

@Component({
  selector: 'app-edit-fixed',
  templateUrl: './edit-fixed.component.html',
  styleUrls: ['./edit-fixed.component.scss', '../../shared/fixed-asset.component.scss']
})
export class EditFixedComponent implements OnInit, AfterViewInit {

  @ViewChild('contactDetailsModal') public contactDetailsModal;
  @ViewChild('picturePreviewModal') public picturePreviewModal;
  recommendList = [];
  addTagList = [];
  attachmentList = [];
  dataModel: MFixedAssetModel = {
    fixedAsset: {

    }
  };
  // 折旧信息region
  depreLabel: string = '查看折旧信息';
  isShowDepreInfo = false;
  depreMonthed: number; // 已折旧月
  depreAmount: number; // 折旧金额
  residueDepreMonth: number; // 剩余折旧月
  residueDepreAmount: number; // 剩余折旧金额
  residualValue: number; // 残值
  endDate: any; // 结束日期
  // end region
  // 部门性质数据
  departmentList: Array<Object> = [
    { id: DepartmentTypeEnumModel.ValueEnum.Sales, text: '销售部门' },
    { id: DepartmentTypeEnumModel.ValueEnum.Management, text: '管理部门' }];
  // 发票类型列表
  invoiceTypeList = [
    { id: InvoiceTypeEnumModel.ValueEnum.General, text: '普票' },
    { id: InvoiceTypeEnumModel.ValueEnum.Professional, text: '专票' }];
  // 往来／对方信息 数据
  contactList: Array<any> = [];
  // 固定资产类别
  categoryList: Array<any> = [];
  // 税率类别
  taxList: Array<any> = [];
  // 进销税类别
  taxCategoryList: Array<any> = [];

  alert: Object = { type: '', msg: '' };

  minDate: any;
  maxDate: any;

  validator: any = this.faService.getFormValid(null);
  hidden: boolean = true;
  isFromBeginPeroid = false;
  isDisabled: boolean = false;
  depreciatePeriod; // 折旧期
  monthDepreciate; // 月折旧额
  constructor(private location: Location, private actRouter: ActivatedRoute, private faService: FixedAssetService,
    private utilityService: UtilityService,
    private changRef: ChangeDetectorRef, private router: Router, private shareService: ShareService) { }

  ngOnInit() {
    const id = this.actRouter.snapshot.params['id'];
    if (id) {
      this.getDateArea(id);
    }
  }

  getDataByID(id) {
    this.faService.getFixedDetailById(id).then(data => {
      console.log('edit-fixed=>', data);
      this.dataModel = _.cloneDeep(data);
      if (data.fixedAsset.sourceType.value !== SourceTypeEnumModel.ValueEnum.Manual) {
        this.isFromBeginPeroid = true;
      }
      if (data.currentInvoiceType && data.currentInvoiceType[0].id === InvoiceTypeEnumModel.ValueEnum.General) {
        this.hidden = true;
      } else {
        this.hidden = false;
      }
      this.isDisabled = data.fixedAsset.lock || this.isFromBeginPeroid;
      // this.isDisabled = data.fixedAsset.;
      this.addTagList = this.dataModel.fixedAsset.tags;
      this.attachmentList = this.faService.formatAttachmentURL(this.dataModel.fixedAsset.accountAttachmentModels);
      this.depreInfo();
    });
  }
  /**
   * 获取会计区间最大 最小日期
   */
  getDateArea(id) {
    this.getContactList();
    this.getCategoryList();
    this.getBusinessTax();
    this.faService.requestPeroidDate().then(data => {
      this.minDate = data.minDate;
      this.maxDate = data.maxDate;
      this.getDataByID(id);
    }).catch(error => {
      console.log('getDateArea', error);
    });
  }

  depreInfo() {
    const data = this.dataModel;
    this.monthDepreciate = this.faService.caculateMonthAmount_1(data.fixedAsset.originalPrice,
      data.fixedAsset.residualRate, data.fixedAsset.lifespan, 'Fixed');
    this.depreciatePeriod = (data.fixedAsset.lifespan / 12).toFixed(0);
    // 结束日期
    this.endDate = this.faService.getEndDate(data.fixedAsset.startDepreciationDate, data.fixedAsset.lifespan);
    // 已折旧月
    if (moment(localStorage.getItem('currentPeriod')).isAfter(this.endDate)) {
      this.depreMonthed = data.fixedAsset.lifespan;
    } else {
      this.depreMonthed = this.faService.calculateDepredMonth(data.fixedAsset.startDepreciationDate);
    }
    // 预防 除不尽的数 ，算出来跟原值不对
    // 比如 原值200  折旧月份12个月 月折旧额就= 200/12 =16.66666666 ～= 16.67
    // 已折旧金额 = 月折旧额 * 折旧月份  = 16.67*12 = 200.04 结果就会错误
    // 若折旧完了 直接等于原值就可以
    if (this.depreMonthed === data.fixedAsset.lifespan) {
      this.depreAmount = data.fixedAsset.originalPrice;
    } else {
      // 已折旧金额
      this.depreAmount = this.monthDepreciate * this.depreMonthed;
    }
    // 剩余折旧月
    this.residueDepreMonth = data.fixedAsset.lifespan - this.depreMonthed;
    // 剩余折旧金额
    this.residueDepreAmount = data.fixedAsset.originalPrice - this.depreAmount;
    // 残值
    this.residualValue = data.fixedAsset.originalPrice * data.fixedAsset.residualRate;

  }

  ngAfterViewInit() {

  }

  /**
   * 获取税率列表
   */
  getBusinessTax() {
    this.faService.getBusinessTax(AssetTypeEnumModel.ValueEnum.FixedAssets)
      .then(data => {
        this.taxList = data;
      }).catch(error => {

      });
  }
  /**
   * 获取固定资产分类列表
   */
  getCategoryList() {
    this.faService.getAssetCategory(AssetTypeEnumModel.ValueEnum.FixedAssets)
      .then(data => {
        console.log(data);
        this.categoryList = data;
      })
      .catch(err => {
        console.log(err);
      });
  }
  /**
   * 对方信息列表
   * @param isAdd 是否新增
   */
  getContactList() {
    this.faService.getContactList()
      .then(data => {
        this.contactList = data;
      })
      .catch(err => {
        console.log(err);
      });
  }

  /**
   * 新增联系人返回结果
   * @param value
   */
  result(value) {
    console.log(value);
  }

  /**
   * 新增联系人弹窗
   */
  showAddContact() {
    this.contactDetailsModal.operation = OperationModeEnum.New;
    this.contactDetailsModal.show();
  }

  /**
   * 发票类型 改变时事件
   * @param e 发票类型
   */
  invoiceTypeChange(e) {
    if (e.id === InvoiceTypeEnumModel.ValueEnum.General) {
      this.hidden = true;
    } else {
      this.hidden = false;
      if (!this.dataModel.currentTax) {
        const temp = _.find(this.taxList, (item) => {
          return item.id === 0.17;
        });
        this.taxChange({ id: temp.id, text: temp.id * 100 + '%' });
      }
    }
  }

  /**
   * 固定资产分类
   * @param eve 分类
   */
  categoryChange(e) {
    /// this.currentCate = this.getItemObj(this.categoryList, e.id);
    const category = this.getItemObj(this.categoryList, e.id);
    this.dataModel.currentCatory = [e];
    this.dataModel.fixedAsset.residualRate = category.residualRate;
    this.dataModel.fixedAsset.lifespan = category.lifespan;
    this.depreciatePeriod = (category.lifespan / 12).toFixed(0);
    this.calculateAmortizeAmount(this.dataModel.fixedAsset.originalPrice);
  }
  /**
   * 联系人改变事件
   * @param eve 联系人
   */
  contactChange(e) {
    if (e.id === '0') {
      this.dataModel.currentContact = null;
      this.changRef.detectChanges();
      this.showAddContact();
    } else {
      this.dataModel.currentContact = [{ id: e.id, text: e.text }];
    }
  }

  /**
   * 部门改变事件
   * @param eve 部门
   */
  deartmentChange(e) {
    this.dataModel.fixedAsset.departmentType = { value: e.id, name: e.text };
    console.log('deartmentChange', this.dataModel.currentDepartment);
  }

  /**
   * 税率改变事件
   * @param eve 税率
   */
  taxChange(eve) {
    this.dataModel.fixedAsset.taxRate = Number(eve.id);
    this.dataModel.currentTax = [eve];
    this.taxCategoryList = this.faService.getTaxCategoryByTax(eve.id);
    this.dataModel.currentTaxCategory = [this.taxCategoryList[0]];
    this.caculateTaxAmount(this.dataModel.fixedAsset.originalPrice);
  }

  /**
   * 进销税类别改变
   * @param eve 进销税类别
   */
  taxCategoryChange(e) {
    this.dataModel.currentTaxCategory = [e];
  }

  /**
   * 金额焦点失去事件
   */
  handleAmountBlur(eve) {
    const amount = eve.target.value;
    console.log('amount', amount);
    this.dataModel.fixedAsset.originalPrice = this.utilityService.reverseFormat(this.dataModel.fixedAsset.originalPrice);
    this.calculateAmortizeAmount(amount);
    this.caculateTaxAmount(amount);
  }

  /**
   * 计算税额&不含税金额
   * @param amount 总额
   */
  caculateTaxAmount(amount) {
    if (this.dataModel.currentTax) {
      const tax = this.dataModel.currentTax[0].id;
      const exclusiveOfTax = this.faService.caculateExclTax(amount, tax);
      this.dataModel.fixedAsset.exclusiveOfTax = exclusiveOfTax;
      this.dataModel.fixedAsset.tax = this.faService.caculateTax(exclusiveOfTax, tax);
    }
  }
  /**
   * 计算月折旧额
   * @param amount 总额
   */
  calculateAmortizeAmount(amount) {
    if (this.dataModel.currentCatory) {
      // let accountCate = this.dataModel.currentCatory;
      this.monthDepreciate = this.faService.caculateMonthAmount_1(amount, this.dataModel.fixedAsset.residualRate
        , this.dataModel.fixedAsset.lifespan, 'Fixed');
    }
  }

  back() {
    this.location.back();
  }

  /**
   * 获取集合中的
   * @param targets 目标集合
   * @param id ID
   */
  getItemObj(targets: Array<any>, id) {
    console.log('id=>', id);
    if (!id) {
      return;
    }
    return _.find(targets, (item) => { console.log('itemm=>', JSON.stringify(item)); return item.id === id; });
  }

  /**
   * 计算月折旧额
   */
  caculateMonthAmount() {
    const fixed = this.dataModel.fixedAsset;
    this.monthDepreciate = this.faService.caculateMonthAmount_1(fixed.originalPrice, fixed.residualRate, fixed.lifespan, 'Fixed');
    this.depreInfo();
  }

  /**
   * 保存并新增
   */
  saveAndAdd() {
    const model = this.preData();
    if (model === null || model === undefined) {
      return;
    }
    this.faService.updateAsser(model).then(data => {
      this.alertSuccess('保存成功！');
      this.router.navigate(['/app/fixed-assets/detail']);
    }).catch(error => {
      this.alertDanger(error);
    });
  }

  /**
   * 保存
   */
  save() {
    const model = this.preData();
    if (model === null || model === undefined) {
      return;
    }
    this.faService.updateAsser(model).then(data => {
      this.alertSuccess('保存成功！');
      this.location.back();
    }).catch(error => {
      this.alertDanger(error);
    });
  }
  /**
   * 整理数据
   */
  preData() {
    this.validator = this.faService.getFormValid(this.dataModel);
    if (this.validator.valid) {
      return null;
    }
    return this.faService.getAssetModel(this.dataModel);
  }


  /**
   *
   * @param contact 新增返回联系人
   */
  newContactSuccess(contact) {

    this.getContactList();
    this.dataModel.currentContact = [{ id: contact.id, text: contact.name }];
    this.changRef.detectChanges();
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
    console.log(msg);
    setTimeout(() => {
      this.alert = { msg: msg, type: 'danger' };
    }, 0);
  }

  clearAlert() {
    this.alert = {};
  }
  /**
   * 显示隐藏折旧信息
   */
  changDepreInfo() {
    this.isShowDepreInfo = !this.isShowDepreInfo;
    if (this.isShowDepreInfo) {
      this.depreLabel = '收起折旧信息';
    } else {
      this.depreLabel = '查看折旧信息';
    }
  }
  /**
   * 附件预览
   * @param e
   */
  picturePreview(e) {
    console.log(e);
    this.picturePreviewModal.show(this.attachmentList, e, '', false);
  }

  /**
   * 附件上传成功
   * @param e
   */
  attchmentSuccess(e) {
    console.log('attchmentSuccess', e);
    if (!this.dataModel.attachmentList) {
      this.dataModel.attachmentList = e;
    } else {
      this.dataModel.attachmentList.concat(e);
    }
  }

  /**
   * 附件提示信息
   */
  attchmentResult(e) {
    this.alert = e;
  }

  /**
   * 返回标签集合
   * @param obj 标签
   */
  tagResult(obj) {
    console.log(obj);
    this.dataModel.addTagList = obj;
  }
}
