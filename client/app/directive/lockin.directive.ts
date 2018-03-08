import { GLOBAL_KEY } from './../component/+company-list/shared/company-key';

import { Directive, ElementRef, Renderer } from '@angular/core';
import { AuthorizationService } from './../service/core/authorization';

@Directive({
  selector: '[lockIn]'
})
export class LockinDirective {

  constructor(private authService: AuthorizationService, private eleRef: ElementRef, private renderer: Renderer) {
    const subject = this.authService.getSessionSubject();
    subject.subscribe({
      next: (v) => {
        if (v && v.currentAccount && v.currentAccount.status !== 'InProgress') {
          renderer.setElementAttribute(eleRef.nativeElement, 'disabled', 'disabled');
        }
      }
    });
  }
}

@Directive({
  selector: '[lockTax]'
})
export class LockTaxDirective {
  constructor(private eleRef: ElementRef, private renderer: Renderer) {
    const data = localStorage.getItem(GLOBAL_KEY.COMPANYTYPE);
    const currentCompany = data ? JSON.parse(data) : '';
    if (currentCompany && currentCompany.companyProperty !== 'GeneralTaxpayer') {
      renderer.setElementAttribute(eleRef.nativeElement, 'style', 'display: none!important');
    }
  }
}
