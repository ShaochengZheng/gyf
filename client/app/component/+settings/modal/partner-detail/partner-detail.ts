import {
  Component, ViewChild, Output, EventEmitter, Input,
  ViewChildren, ChangeDetectorRef, ChangeDetectionStrategy
} from '@angular/core';
import { FormBuilder, FormGroup, AbstractControl, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { OperationModeEnum } from '../../../../service/core/core';
import { FormValidator } from '../../../../service/validators';
import { UtilityService } from '../../../../service/core/utility';
import { ShareholderApi } from '../../../../api/accounting/api/ShareholderApi';

@Component({
  selector: 'gpw-partner-detail-modal',
  templateUrl: './partner-detail.html',
  styleUrls: ['./partner-detail.scss'],
  providers: [ShareholderApi],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PartnerDetailModal {

  @Input() operation: OperationModeEnum = OperationModeEnum.New;
  @Input() shareCountAll: number = 0;
  @ViewChild('modal') public modal;
  @ViewChildren('input') public input;
  @Output() success = new EventEmitter();
  @Output() result = new EventEmitter();
  // Define the value of the dropdown

  partnerEmpty = {
    id: '',
    name: '',
    amount: null,
    shareProportion: null,
    account: {
      id: '',
      name: ''
    }
  };
  partnerModel = _.cloneDeep(this.partnerEmpty);
  partnerTypes: Array<Object> = [{ id: 'Sales', text: 'zhangsan' },
  { id: 'Management', text: 'lisi' }];
  shareProp: number;

  currentpartnerType = [];

  partnerForm: FormGroup;
  partnerName: AbstractControl;
  partnerAmount: AbstractControl;
  // partnerShare: AbstractControl;
  submitAttempt = false;
  clearHint = false;
  wrongShare = false;

  public alerts: any = [];
  public alertSuccess(msg: string) {
    this.clearAlert();
    this.alerts = [{ type: 'success', msg: msg }];
    this.alerts = this.alerts.map((alert: any) => Object.assign({}, alert));
    this.ref.detectChanges();
    // setTimeout(() => { this.alert = { type: 'success', msg: msg }; }, 0);
  }
  public alertDanger(msg: string) {
    this.clearAlert();
    this.alerts = [{ type: 'danger', msg: msg }];
    this.alerts = this.alerts.map((alert: any) => Object.assign({}, alert));
    // setTimeout(() => { this.alert = { type: 'danger', msg: msg };}, 0 );
    this.ref.detectChanges();
  }
  public addAlert(alert: Object): void {
    this.clearAlert();
    this.alerts = [alert];
  }
  public clearAlert(): void {
    this.alerts = [];
  }

  onShown() {
    this.input.first.nativeElement.focus();
    // console.log(this.partner.partnerType);
  }

  constructor(fb: FormBuilder, private shareholderApi: ShareholderApi, private ref: ChangeDetectorRef,
    private utilityService: UtilityService) {
    this.partnerForm = fb.group({
      'partnerName': ['', Validators.required],
      'partnerAmount': ['', Validators.required],
      // 'partnerShare': ['', Validators.required]
    });
    this.partnerName = this.partnerForm.controls['partnerName'];
    this.partnerAmount = this.partnerForm.controls['partnerAmount'];
    // this.partnerShare = this.partnerForm.controls['partnerShare'];
  }

  public show(partnerModel?: any) {
    this.clearAlert();
    this.clearHint = false;
    console.log('<---show--->', this.shareCountAll);
    if (this.operation === OperationModeEnum.Update) {
      this.partnerModel = _.cloneDeep(partnerModel);
      this.partnerModel.amount = this.partnerModel.amount * 10000;
      this.shareProp = this.partnerModel.shareProportion * 100;
      const num = this.shareProp.toFixed(2);
      this.shareCountAll = this.shareCountAll - this.partnerModel.shareProportion;
      this.shareProp = Number(num);
    } else {
      // this.shareProp = 0;
      this.clearData();
    }

    this.modal.show();

  }

  close() {
    this.modal.hide();
    this.clearAlert();
  }

  save() {
    this.clearHint = true;
    this.submitAttempt = true;
    this.shareProp = 0.0;
    this.partnerModel.shareProportion = this.shareProp / 100;
    this.partnerModel.amount = this.utilityService.reverseFormat(this.partnerModel.amount);
    console.log('<---partner-save--->', this.partnerModel.amount,
      this.partnerModel.name, this.partnerModel.shareProportion, this.shareProp);
    if ((this.partnerModel.shareProportion + this.shareCountAll) > 1) {
      this.wrongShare = true;
      return;
    } else {
      this.wrongShare = false;
    }
    if (!this.partnerForm.valid || this.wrongShare || this.partnerModel.amount <= 0 || this.shareProp < 0) {
      return;
    }
    this.partnerModel.shareProportion = this.partnerModel.shareProportion.toFixed(4);
    if (this.partnerModel.id) {
      this.updatePartner();
    } else {
      this.savePartner();
    }

  }
  // 编辑股东
  updatePartner() {
    // this.partnerModel.shareProportion = this.shareProp / 100;
    console.log('<---savePartner---->', JSON.stringify(this.partnerModel));
    // this.partnerModel.amount = this.partnerModel.amount * 10000;
    this.shareholderApi.shareholderUpdate(this.partnerModel)
      .subscribe(
      (data) => {
        console.log('<---savePartner---->data', JSON.stringify(data));

        const resultObj = {
          type: 'success',
          msg: '编辑股东成功！'
        };
        this.result.emit(resultObj);
        this.close();
      }, (error) => {
        this.showError(error);
        setTimeout(() => this.ref.markForCheck(), 10);
      });
  }
  // 新增股东
  savePartner() {
    console.log('<---savePartner---->', JSON.stringify(this.partnerModel));
    this.shareholderApi.shareholderPost(this.partnerModel)
      .subscribe(
      (data) => {
        console.log('<---savePartner---->data', JSON.stringify(data));

        const resultObj = {
          type: 'success',
          msg: '新增股东成功！'
        };
        this.result.emit(resultObj);
        this.close();
      }, (error) => {
        console.log('<---savePartner---->error', JSON.stringify(error));
        this.showError(error);
      });

  }
  showError(error) {
    this.alertDanger(error);
    setTimeout(() => this.ref.markForCheck(), 10);
  }
  clearData() {
    this.partnerModel = _.cloneDeep(this.partnerEmpty);
    this.wrongShare = false;
    this.shareProp = null;
  }
  keyPressHandler(event, type) {
    console.log('<\\\\\keyPressHandler\\\\\\>', event, this.partnerModel.shareProportion > 10, type);
    if (type === '') {
      if (event.charCode === 13) {
        this.save();
      }
    } else if (type === 'amount') {
      if (event.charCode === 13) {
        this.save();
      }
    } else if (type === 'share') {
      if (event.charCode === 13) {
        this.save();
      }
    }


  }
  // 判断税率
  shareCheck() {
    this.wrongShare = (this.shareProp / 100 + this.shareCountAll) > 1 ? true : false;
    console.log('--shareCheck---', this.wrongShare);
  }

}
