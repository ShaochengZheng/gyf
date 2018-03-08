
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FinanceService } from './../../shared/finance.service';

@Component({
  selector: 'app-carry-voucher-list',
  templateUrl: './cv-list.component.html',
  styleUrls: ['./cv-list.component.scss']
})
/**
 * @author scleo
 * 结转以后生成凭证 列表
 */
export class CarryVoucherListComponent implements OnInit {

  alert: any = {};
  btnStatus: string = '再次结转';
  searchModel: any = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    keyword: '',
    pageIndex: '1',
    pageSize: '10',
    type: 'CarryForward'
  };
  voucherList: any = [];
  noData: boolean = false;
  status: string;
  constructor(private actRouter: ActivatedRoute, private router: Router, private financeService: FinanceService) { }

  ngOnInit() {
    if (this.actRouter.snapshot.params['year']) {
      this.searchModel.year = this.actRouter.snapshot.params['year'];
    }
    if (this.actRouter.snapshot.params['month']) {
      this.searchModel.month = this.actRouter.snapshot.params['month'];
    }
    this.status = this.actRouter.snapshot.params['status'];
    this.searchVoucher(this.searchModel);
  }

  /**
   * 
   */
  searchVoucher(model) {
    this.financeService.getVoucher(model)
      .then(data => {
        if (data.list && data.list.length > 0) {
          this.voucherList = data.list;
          this.noData = false;
        } else {
          this.noData = true;
          this.voucherList = [];
        }
      })
      .catch(error => {
        this.noData = true;
      });
  }

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

  /**
   * 再次结转
   */
  postingCarryForward() {
    this.financeService.carryForwardAccount()
      .then(data => {
        this.alertSuccess('结转成功');
        this.ngOnInit();
      })
      .catch(error => {
        this.alertDanger(error);
      });
  }

  
}
