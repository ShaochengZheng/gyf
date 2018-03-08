import { Component, ViewChild, ChangeDetectorRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { FormValidator } from '../../../service/validators';
import { OperationModeEnum } from '../../../service/core/core';
import { ConfirmEventTypeEnum } from '../../widget/confirm/confirm';
import { FixedAssetService } from '../shared/fixed-asset.service';
import { AssetTypeEnumModel } from './../../../api/accounting/model/AssetTypeEnumModel';

import * as _ from 'lodash';
import * as moment from 'moment';


@Component({
  selector: 'app-assets-list',
  templateUrl: './assets-list.component.html',
  styleUrls: ['./assets-list.component.scss', '../shared/fixed-asset.component.scss'],
  providers: [FixedAssetService]
})
export class FixedAssetsListComponent implements OnInit {

  @ViewChild('contactDetailsModal') public contactDetailsModal;
  @ViewChild('confirmWidget') public confirmModal;
  @ViewChild('picturePreviewModal') public picturePreviewModal;
  @ViewChild('radioStaus') public radioStaus;

  searchForm: FormGroup;
  pageIndex: number = 1;
  pageSize: number = 10;
  recordCount: number = 0;
  maxSize: number = 5;
  dataList = [];
  mSum: number = 0;
  model = {
    assetTypeEnum: AssetTypeEnumModel.ValueEnum.FixedAssets,
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    depreciationCategoryId: '',
    keyword: '',
    qty: '',
    status: 'None',
    tagIds: '',
    pageIndex: '1',
    pageSize: '10'
  };
  searchModel = _.cloneDeep(this.model);
  transactionOpeningBalanceModels = [];
  alert: Object = {};
  isScreenShow: boolean = false;
  noData: boolean = false;

  selectStatus: string = 'None';
  currentItem: any;

  typeList = [{}];
  type;
  startDate = moment(new Date()).format('YYYY-MM-DD');
  endDate = moment(new Date()).format('YYYY-MM-DD');
  SEARCH_TAGLIST: any = [{}];
  SEARCH_TAGLISTS: any = [{}];
  SEARCH_DISPLAYTAG = true;

  constructor(private fb: FormBuilder, private ref: ChangeDetectorRef, private mFAService: FixedAssetService, private router: Router) {
    this.searchForm = fb.group({
      'startDate': ['', Validators.compose([Validators.required,
      FormValidator.invalidDateFormat])],
      'endDate': ['', Validators.compose([Validators.required,
      FormValidator.invalidDateFormat])]
    });
  }


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
    this.clearAlert();
    this.getAllTags();
    this.search();
    this.getAllType();
  }
  /**
   * 获取合计
   */
  getSum() {
    this.mFAService.getAssetsSum(this.searchModel)
      .then(data => {
        this.mSum = data;
      }).catch(error => {
        this.mSum = 0;
      });
  }
  // 获取所有标签
  getAllTags() {
    this.mFAService.getAllTags()
      .then(data => {
        if (data === null || data === undefined) {
          return;
        }
        console.log('get all tags --->', data);
        this.SEARCH_TAGLISTS = _.cloneDeep(data);
        this.SEARCH_TAGLISTS.forEach(item => {
          item.checked = false;
        });
        if (this.SEARCH_TAGLISTS) {
          this.SEARCH_TAGLIST = this.SEARCH_TAGLISTS.slice(0, 10);
        }
        console.log(this.SEARCH_TAGLISTS);
      })
      .catch(error => {

        // this.showError(error);
      });
  }
  // 获取所有类型
  getAllType() {
    this.mFAService.getAssetCategory(AssetTypeEnumModel.ValueEnum.FixedAssets)
      .then(
      (data) => {
        console.log('<---searchAFList-->data', data);
        let tempName = [];
        _.forEach(data, (item) => {
          tempName.push({ id: item.id, text: item.name });
        });
        this.typeList = tempName;
      }, (error) => {
        console.log('<---searchAFList-->error', error);

      });
  }

  search() {
    this.getSum();
    this.mFAService.searchFixedAssets(this.searchModel)
      .then(
      (data) => {
        console.log('<---searchAFList-->data', data);
        this.dealWithSearchData(data);

      }, (error) => {
        console.log('<---searchAFList-->error', error);
        this.noData = true;
        this.alertDanger(error);
      });
  }

  dealWithSearchData(data) {
    this.pageIndex = data.pageIndex;
    this.recordCount = data.recordCount;
    if (!data.list || data.list.length === 0) {
      this.noData = true;
    } else {
      this.noData = false;
    }
    this.dataList = data.list;
    this.ref.detectChanges();
  }

  // 筛选板是否展示
  showScreenBoard() {
    this.isScreenShow = !this.isScreenShow;
  }
  // 选择 分类
  selectType(args) {
    console.log('<selectType----->', args, this.type);
    this.searchModel.depreciationCategoryId = args.id;
    this.searchFilter();

  }
  /**
   * 金额搜索
   */
  amountSearch() {
    console.log(this.searchModel);
    let maxAmount = parseFloat(this.searchModel.maxAmount);
    let minAmount = parseFloat(this.searchModel.minAmount);
    if (maxAmount > minAmount) {
      this.searchFilter();
    }
  }

  // 选择状态
  statusSelect(args) {
    this.selectStatus = args;
    this.searchModel.status = args;
    
    this.searchFilter();
  }

  // 关键字
  blurkeyWordQUantity(isKeyWord: boolean) {
    console.log('<selectType----->', isKeyWord);
    
    this.searchFilter();
  }

  // 标签
  search_tagSearch(item, index) {
    console.log('<--->', item, index);
    if (this.SEARCH_TAGLIST[index].checked) {
      this.SEARCH_TAGLIST[index].checked = false;
      this.SEARCH_TAGLISTS[index].checked = false;
    } else if (!this.SEARCH_TAGLIST[index].checked) {
      this.SEARCH_TAGLIST[index].checked = true;
      this.SEARCH_TAGLISTS[index].checked = true;
    }
    this.setTagsID();
  }

  setTagsID() {
    let ids = '';
    this.SEARCH_TAGLISTS.forEach(item => {
      if (item.checked) {
        ids = ids + item.id + ',';
      }
    });
    if (ids) {
      let count = String(ids).length - 1;
      ids = String(ids).substring(0, count);
      this.searchModel.tagIds = ids;
      console.log('<--setTagsID-->', ids);
    } else {
      this.searchModel.tagIds = '';
    }
    
    this.searchFilter();
  }

  search_tagToggle(flag: boolean) {
    if (flag) {
      this.SEARCH_TAGLIST = this.SEARCH_TAGLISTS;
    } else {
      if (this.SEARCH_TAGLISTS) {
        this.SEARCH_TAGLIST = this.SEARCH_TAGLISTS.slice(0, 10);
      }
    }
    this.SEARCH_DISPLAYTAG = !this.SEARCH_DISPLAYTAG;
  }

  // 清除
  clearSearchModel() {
    this.type = [{ id: '', text: '请选择分类' }];
    this.selectStatus = 'None';
    console.log('<--clearSearchModel--->', this.searchModel);
    this.radioStaus.nativeElement.checked = true;
    this.searchModel = _.cloneDeep(this.model);
    this.resetTags();
    this.search();
    this.ref.detectChanges();
  }

  /**
   * 重置tags选中状态
   */
  resetTags() {
    if (this.SEARCH_TAGLIST) {
      let templist = [];
      this.SEARCH_TAGLIST.forEach(item => {
        item.checked = false;
        templist.push(item);
      });
      this.SEARCH_TAGLIST = templist;
    }
  }

  /**
   * 通过日期搜索
   */
  searchBlur() {

    if (this.searchModel.startDate > this.searchModel.endDate) {
      this.searchModel.endDate = this.searchModel.startDate;
    }
    setTimeout(() => {
      this.searchFilter();
    }, 150);
  }
  /**
   * 
   */
  keyPressHandler(event, type) {
    console.log('<\\\\\keyPressHandler\\\\\\>', event, type, this.searchModel);
    if (event.charCode === 13) {
      this.searchFilter();
    }
  }

  // 翻页待处理
  public pageChanged(event: any): void {
    this.searchModel.pageIndex = event.page;
    this.search();
  };
  /**
   * 搜索筛选
   */
  searchFilter(){
      this.searchModel.pageIndex = '1';
      this.search();
  }

  // 展示附件
  previewAttachment(item) {
    if (!item) return;
    this.picturePreviewModal.show(item.accountAttachmentModels, item.accountAttachmentModels[0].id, '', true);
  }
  /**
   *
   */
  newContact() {
    this.contactDetailsModal.operation = OperationModeEnum.New;
    this.contactDetailsModal.show();
  }

  // 跳编辑页
  editItem(item) {
    // let tempItem = _.cloneDeep(item);
    // this.contactDetailsModal.operation = OperationModeEnum.View;
    // this.contactDetailsModal.show(tempItem);
    this.router.navigate(['/app/fixed-assets/detail/EditFixed/edit-fixed', { id: item.id, type: 'EditFixed' }]);
  }

  openConfirmModal(item) {
    this.confirmModal.message = '确认删除此条固定资产记录吗？';
    this.confirmModal.show();
    this.currentItem = item;
  }

  // 删除
  delete(event) {
    if (event === ConfirmEventTypeEnum.Confirm) {
      this.mFAService.deletFiedAssetsById(this.currentItem.id)
        .then(
        (data) => {
          this.alertSuccess('删除成功');
          this.searchFilter();
        }, (error) => {
          this.alertDanger(error);
        });
    }
  }

  result(resultObj) {
    this.addAlert(resultObj);
  }
}
