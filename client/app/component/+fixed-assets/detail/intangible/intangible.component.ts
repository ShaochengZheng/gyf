
import { Component, OnInit, AfterViewInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

import { FixedAssetService } from './../../shared/fixed-asset.service';
import { OperationModeEnum } from '../../../../service/core/core';
import { ShareService } from './../../../../service/core/share';
import { MFixedAssetModel } from './../../shared/fixed-asset.model';
import { InvoiceTypeEnumModel, AssetTypeEnumModel, DepartmentTypeEnumModel } from '../../../../api/accounting/index';
import { UtilityService } from '../../../../service/core/utility';

import * as _ from 'lodash';
@Component({
  selector: 'app-intangible',
  templateUrl: './intangible.component.html',
  styleUrls: ['./intangible.component.scss', '../../shared/fixed-asset.component.scss']
})
export class IntangibleComponent implements OnInit, AfterViewInit {

  @ViewChild('contactDetailsModal') public contactDetailsModal;
  @ViewChild('picturePreviewModal') public picturePreviewModal;
  @ViewChild('tag') public tag;

  alert: Object = { type: '', msg: '' };

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

  residuals: any; // 残值率
  depreciatePeriod: any; // 折旧期
  monthDepreciate: any; // 月折旧额
  newerTemplate = {};
  minDate: any = '';
  maxDate: any = '';

  hidden: boolean = true;
  dataModel: MFixedAssetModel = {
    currentContact: [{ id: '', text: '' }],
    currentDepartment: [{ id: DepartmentTypeEnumModel.ValueEnum.Management, text: '管理部门' }],
    currentInvoiceType: [{ id: InvoiceTypeEnumModel.ValueEnum.General, text: '普票' }],
    fixedAsset: {
      assetType: { value: AssetTypeEnumModel.ValueEnum.IntangibleAssets, name: '无形资产' },
      purchasingDate: this.faService.getDefaultDate(),
      name: null,
      contact: { id: '', name: '' },
      departmentType: { value: DepartmentTypeEnumModel.ValueEnum.Management, name: '管理部门' },
      depreciationCategory: null,
      qty: 1,
      description: '',
      originalPrice: 0.00,
      residualRate: 0,
      lifespan: 0
    }
  };

  validator = this.faService.getFormValid(null);

  constructor(private changRef: ChangeDetectorRef, private router: Router, private faService: FixedAssetService
    , private shareService: ShareService, private utilityService: UtilityService) {
    this.newerTemplate = _.cloneDeep(this.dataModel);
  }

  ngOnInit() {
    this.depreciatePeriod = 10;
    this.getContactList();
    this.getBusinessTax();
    this.getFixedCategory();
    this.shareService.accountAccountPeriod().then(data => {
      this.minDate = this.faService.getPeroidDateArea(data.currentYear, data.currentMonth).minDate;
      this.maxDate = this.faService.getPeroidDateArea(data.currentYear, data.currentMonth).maxDate;
      this.dataModel.fixedAsset.purchasingDate = this.maxDate;
    }).catch(error => {

    });
    console.log(this.faService.getDefaultDate());
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
      this.defaultProInvoice();
    }
  }
  /**
   * 专票默认税率，类别
   */
  defaultProInvoice() {
    if (!this.dataModel.currentTax) {
      const temp = _.find(this.taxList, (item) => {
        return item.id === 0.17;
      });
      this.taxChange({ id: temp.id, text: temp.id * 100 + '%' });
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
      this.dataModel.currentContact = [e];
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
    if (!this.hidden) {
      this.caculateTaxAmount(amount);
    }
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
      // this.getItemObj(data);
      const temp = _.find(data, (item) => {
        return item.name === '软件';
      });
      if (temp) {
        this.dataModel.fixedAsset.lifespan = temp.lifespan;
        this.dataModel.currentCatory = [{ id: temp.id, text: temp.name }];
      }

      this.categoryList = data;
    });
  }
  /**
   * 获取联系人
   */
  getContactList(isAdd = false) {
    this.faService.getContactList().then(data => {
      console.log(data);
      this.contactList = data;
      if (isAdd) {

      } else {
        this.dataModel.currentContact = this.faService.getDefaultContact(this.contactList);
      }
    });
  }
  /**
   *
   * @param contact 新增返回联系人
   */
  newContactSuccess(contact) {
    this.dataModel.currentContact = [{ id: contact.id, name: contact.name, text: contact.name }];
    this.changRef.detectChanges();
    this.getContactList(true);
  }
  /**
   * 结果
   * @param e
   */
  result(e) {
    console.log(e);
  }
  /**
   * 新增联系人弹窗
   */
  showAddContact() {
    this.contactDetailsModal.operation = OperationModeEnum.New;
    this.contactDetailsModal.show();
  }

  // 保存
  save(isJustSave = true) {
    const model = this.preData();
    if (!model) { return; }
    this.faService.saveFixed(model)
      .then(data => {
        this.alertSuccess('保存成功');
        if (isJustSave) { // 仅仅新增
          this.back();
        } else {// 保存并新增
          this.initNewer();
        }
      })
      .catch(err => {
        console.log(err);
        this.alertDanger(err);
      });
  }

  /**
   * 初始化新增保存model
   */
  initNewer() {
    const temp = _.cloneDeep(this.dataModel);
    const lastDate = temp.fixedAsset.purchasingDate; // 保留日期
    const lastContact = temp.currentContact;
    this.dataModel = _.cloneDeep(this.newerTemplate);
    if (temp.currentInvoiceType[0].id === InvoiceTypeEnumModel.ValueEnum.General) {
      this.hidden = true;
    } else {
      this.hidden = false;
      this.dataModel.currentInvoiceType = [this.invoiceTypeList[1]];
      this.defaultProInvoice();
    }
    this.dataModel.fixedAsset.purchasingDate = lastDate;
    if (lastContact) {
      this.dataModel.currentContact = [{ id: lastContact[0].id, name: lastContact[0].text, text: lastContact[0].text }];
    }
    this.dataModel.currentCatory = temp.currentCatory;
    this.dataModel.addTagList = [];
    this.dataModel.attachmentList = [];
    this.monthDepreciate = null;
    this.depreciatePeriod = 10;
    this.tag.isSaveNew();
  }

  /**
   * 准备数据
   */
  preData() {
    this.validInput();
    // let valid = this.faService.getFormValid(this.dataModel);
    if (this.validator.valid) {
      return null;
    }
    return this.faService.getAssetModel(this.dataModel);
  }

  /**
   * 必填字段验证
   */
  validInput() {
    this.validator = this.faService.getFormValid(this.dataModel);
  }

  // 返回
  back() {
    this.router.navigate(['/app/fixed-assets/intangible-list']);
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
