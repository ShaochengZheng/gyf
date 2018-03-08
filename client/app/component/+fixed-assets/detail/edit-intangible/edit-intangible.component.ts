import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Component, OnInit, AfterViewInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { UtilityService } from '../../../../service/core/utility';

import { MFixedAssetModel } from './../../shared/fixed-asset.model';
import { FixedAssetService } from './../../shared/fixed-asset.service';
import { OperationModeEnum } from '../../../../service/core/core';

// tslint:disable-next-line:max-line-length
import { InvoiceTypeEnumModel, DepartmentTypeEnumModel, SourceTypeEnumModel, AssetTypeEnumModel } from '../../../../api/accounting/model/models';

import * as _ from 'lodash';
import * as moment from 'moment';


@Component({
  selector: 'app-edit-intangible',
  templateUrl: './edit-intangible.component.html',
  styleUrls: ['./edit-intangible.component.scss', '../../shared/fixed-asset.component.scss']
})
export class EditIntangibleComponent implements OnInit, AfterViewInit {

  @ViewChild('contactDetailsModal') public contactDetailsModal;
  @ViewChild('picturePreviewModal') public picturePreviewModal;

  dataModel: MFixedAssetModel = {
    fixedAsset: {

    }
  };
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

  // region end

  // 折旧信息region
  depreLabel: string = '查看折旧信息';
  isShowDepreInfo = false;
  depreMonthed: number; // 已折旧月
  depreAmount: number; // 已折旧金额
  residueDepreMonth: number; // 剩余折旧月
  residueDepreAmount: number; // 剩余折旧金额
  endDate: any; // 结束日期

  depreciatePeriod; // 折旧期
  monthDepreciate; // 月折旧额

  minDate: any;
  maxDate: any;
  hidden: boolean = true;
  validator: any = this.faService.getFormValid(null);
  isFromBeginPeroid = false;
  isDisabled = false;
  constructor(private fBuilder: FormBuilder, private actRouter: ActivatedRoute, private location: Location, private router: Router,
    private utilityService: UtilityService,
    private faService: FixedAssetService, private changRef: ChangeDetectorRef) {

  }

  ngOnInit() {
    this.getContactList();
    this.getFixedCategory();
    this.getBusinessTax();
    console.log(this.faService.getDefaultDate());
    const id = this.actRouter.snapshot.params['id'];
    if (id) {
      this.getDateArea(id);
    }
  }
  /**
   * 根据ID 获取数据
   * @param id 数据id
   */
  getDataById(id) {
    this.faService.getFixedDetailById(id).then(data => {
      console.log('edit-intangible=>', data);
      this.dataModel = _.cloneDeep(data);
      // this.dataMode l = _.clone(data.fixedAsset);
      if (data.fixedAsset.sourceType.value !== SourceTypeEnumModel.ValueEnum.Manual) {
        this.isFromBeginPeroid = true;
      }
      if (data.currentInvoiceType && data.currentInvoiceType[0].id === InvoiceTypeEnumModel.ValueEnum.General) {
        this.hidden = true;
      } else {
        this.hidden = false;
      }
      this.isDisabled = data.fixedAsset.lock || this.isFromBeginPeroid;
      this.dataModel.addTagList = this.dataModel.fixedAsset.tags;
      this.dataModel.attachmentList = this.faService.formatAttachmentURL(this.dataModel.fixedAsset.accountAttachmentModels);
      this.depreInfo();
    });
  }

  /**
   * 获取会计区间最大 最小日期
   */
  getDateArea(id) {
    this.faService.requestPeroidDate().then(data => {
      this.minDate = data.minDate;
      this.maxDate = data.maxDate;
      this.getDataById(id);
    }).catch(error => {
      console.log('getDateArea', error);
    });
  }

  /**
   * 折旧信息
   */
  depreInfo() {
    const data = this.dataModel;
    this.monthDepreciate = this.faService.caculateMonthAmount_1(data.fixedAsset.originalPrice,
      data.fixedAsset.residualRate, data.fixedAsset.lifespan, '');

    this.depreciatePeriod = (data.fixedAsset.lifespan / 12).toFixed(0);
    // 结束日期
    this.endDate = this.faService.getEndDate(data.fixedAsset.startDepreciationDate, data.fixedAsset.lifespan);

    // 已折旧月
    if (moment(localStorage.getItem('currentPeriod')).isAfter(this.endDate)) {
      this.depreMonthed = data.fixedAsset.lifespan;
    } else {
      this.depreMonthed = this.faService.calculateDepredMonth(data.fixedAsset.startDepreciationDate);
    }
    // 与固定资产一样
    if (data.fixedAsset.lifespan === this.depreMonthed) {
      this.depreAmount = data.fixedAsset.originalPrice;
    } else {
      // 已折旧金额
      this.depreAmount = this.monthDepreciate * this.depreMonthed;
    }

    // 剩余折旧月
    this.residueDepreMonth = data.fixedAsset.lifespan - this.depreMonthed;
    // 剩余折旧金额
    this.residueDepreAmount = data.fixedAsset.originalPrice - this.depreAmount;
  }

  ngAfterViewInit() {

  }

  /**
   * 获取税率列表
   */
  getBusinessTax() {
    this.faService.getBusinessTax(AssetTypeEnumModel.ValueEnum.IntangibleAssets)
      .then(data => {
        this.taxList = data;
      }).catch(error => {

      });
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
    this.dataModel.currentCatory = [{ id: e.id, text: e.text }];
    this.dataModel.fixedAsset.residualRate = category.residualRate;
    this.dataModel.fixedAsset.lifespan = category.lifespan;
    this.depreciatePeriod = (category.lifespan / 12).toFixed(0);
    // this.handleAmountEvent();
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
    this.dataModel.currentTax = [{ id: eve.id, text: eve.text }];
    this.taxCategoryList = this.faService.getTaxCategoryByTax(eve.id);
    this.dataModel.currentTaxCategory = [this.taxCategoryList[0]];
    this.caculateTaxAmount(this.dataModel.fixedAsset.originalPrice);
  }

  /**
   * 进销税类别改变
   * @param eve 进销税类别
   */
  taxCategoryChange(e) {
    this.dataModel.currentTaxCategory = [{ id: e.id, text: e.text }];
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
      const month = this.depreciatePeriod * 12;
      this.monthDepreciate = this.faService.caculateMonthAmount_1(this.dataModel.fixedAsset.originalPrice, 0, month, '');
    }
  }

  /**
  * 摊销年验证
  */
  validtorYear() {
    const positiveRegEx = new RegExp('^[0-9]+$');
    if (Number(this.depreciatePeriod) === 0 || !positiveRegEx.test(this.depreciatePeriod)) {
      this.depreciatePeriod = 1;
      this.dataModel.fixedAsset.lifespan = 12;
    } else {
      this.dataModel.fixedAsset.lifespan = Number((Number(this.depreciatePeriod) * 12).toFixed(0));
    }
    this.calculateAmortizeAmount(this.dataModel.fixedAsset.originalPrice);
  }

  /**
   * 获取资产分类
   */
  getFixedCategory() {
    this.faService.getAssetCategory(AssetTypeEnumModel.ValueEnum.IntangibleAssets).then(data => {
      console.log(data);
      this.categoryList = data;
    });
  }
  /**
   * 获取联系人
   */
  getContactList() {
    this.faService.getContactList().then(data => {
      console.log(data);
      this.contactList = data;
    }).catch(err => {
      console.log(err);
    });
  }

  // 保存
  save() {
    const model = this.preData();
    if (model === null || model === undefined) {
      return;
    }
    this.faService.updateAsser(model).then(data => {
      this.location.back();
    }).catch(error => {
      this.alertDanger(error);
    });
  }

  /**
   * 整理数据
   */
  preData() {
    // this.validInput();
    this.validator = this.faService.getFormValid(this.dataModel);
    if (this.validator.valid) {
      return null;
    }
    // 🤢结束
    return this.faService.getAssetModel(this.dataModel);
  }

  // 保存并新增
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

  // 返回
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
    if (!id) { return; }
    return _.find(targets, (item) => { console.log('itemm=>', JSON.stringify(item)); return item.id === id; });
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
  *
  * @param contact 新增返回联系人
  */
  newContactSuccess(contact) {
    this.getContactList();
    this.dataModel.currentContact = [{ id: contact.id, name: contact.name, text: contact.name }];
    this.changRef.detectChanges();
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
   * 附件预览
   * @param e
   */
  picturePreview(e) {
    console.log(e);
    this.picturePreviewModal.show(this.dataModel.attachmentList, e, '', false);
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
