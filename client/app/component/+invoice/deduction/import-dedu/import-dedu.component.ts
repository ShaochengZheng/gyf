import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import * as _ from "lodash";
import { InvoiceService } from './../../shared/invoice.service';
import { ImportApi } from '../../../../api/accounting/api/ImportApi';

@Component({
  selector: 'import-dedu',
  templateUrl: './import-dedu.component.html',
  styleUrls: ['./import-dedu.component.scss'],
  providers: [InvoiceService, ImportApi]
})
export class ImportDeduComponent implements OnInit {

  @ViewChild('importDeduC') public importDeduC;
  uploadExcel: string = '/api/v1/import/Import_Certification';
  type: string = 'file';
  labelText: string = '上传文件';
  alert: Object = {};
  showDetail: boolean = false;
  constructor(private route: ActivatedRoute, private router: Router, private invoiceService: InvoiceService,
    private importApi: ImportApi) {

  }

  ngOnInit() {
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

  successExcel(id) {
    console.log('data4:00excel', id);
    this.checkOutTheResultOfFile(id);
  }
  // 查看上传情况
  checkOutTheResultOfFile(id) {
    this.importDeduC.title = '导入提示';
    this.importDeduC.htmlMessage = ''; // '1.有x条数据的数额与系统不匹配 /n 2.有y条不存在于系统中';
    this.importDeduC.confirmText = '查看认证清单';
    this.importDeduC.cancelText = '继续导入';
    this.invoiceService.invoiceImportCertificationHistory(id).then(
      data => {
        let noFindInvoiceNumber = data.noFindInvoiceNumberList;
        let noCheckTax = data.noCheckTaxList;
        let successNumberList = data.successNumberList;

        console.log('invoiceImportCertificationHistory', data);
        let noFind = this.checkOutCount(noFindInvoiceNumber);
        let nocheck = this.checkOutCount(noCheckTax);
        let succ = this.checkOutCount(successNumberList);
        let message = '';
        let message1 = '';
        let message2 = '';
        let i = 1;
        if (noFind > 0) {
          message = '<div>' + i + '.您导入的认证清单中有' + noFind + '条数据不存在于系统中</div>';
          i += 1;
        }
        if (nocheck > 0) {
          message1 = '<div>' + i + '.您导入的认证清单中有' + nocheck + '条数据的数额与系统不匹配</div>';
          i += 1;
        }
        // 下载错误文件
        if (noFind > 0 || nocheck > 0) {
          this.openError(id);
        }
        if (succ > 0) {
          message2 = '<div>' + i + '.您导入的认证清单中有' + succ + '条导入成功</div>';
        }
        if (message !== '' || message1 !== '' || message2 !== '') {
          this.importDeduC.htmlMessage = message + message1 + message2 ;
        }
        if (noFind === 0 && nocheck === 0 && succ === 0) {
          this.alertDanger('上传失败');
        } else {
          this.importDeduC.show();
        }
      }).catch(
      error => {
        console.log('error', error);
      });
  }
  // undefined 修正
  checkOutCount(list): Number {
    if (list === undefined) {
      return 0;
    } else {
      return list.length;
    }
  }
  importDeduConfirm(event) {
    this.router.navigate(['/app/invoice/deduction', { type: 'Certification' }]);
  }

  resultExcel(resultObj) {
    console.log('error', resultObj);
    if (resultObj.id !== undefined && resultObj.id !== null) {
      this.checkOutTheResultOfFile(resultObj.id);
    }
    this.addAlert(resultObj);
  }


  clickCancel() {
    
    this.router.navigate(['/app/invoice/deduction']);
  }

  // 在新窗口中打开错误表格
  openError(sid) {
    this.importApi.importExport(sid).subscribe(
      data => {
        let resultObj = {
          type: 'danger',
          msg: '请从表格查看错误原因',
          id: sid
        };
        // 
        console.log('import-dedu',data);
        this.alertDanger('请从表格查看错误原因');
        let elemIF = document.createElement('iframe');
        elemIF.src = data;
        elemIF.style.display = 'none';
        document.body.appendChild(elemIF);
      },
      error => {
        this.alertDanger(error);

      }
    );
  }

}