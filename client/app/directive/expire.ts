import { Directive, ElementRef, Renderer } from '@angular/core';
import { AuthorizationService } from '../service/core';

@Directive({ selector: '[expire]' })
export class ExpireDirective {
    constructor(el: ElementRef, renderer: Renderer, private authorizationService: AuthorizationService) {
        if (this.authorizationService.Session) {
            if (this.authorizationService.Session.user.currentCompany.isExpired) {
                renderer.setElementAttribute(el.nativeElement, 'disabled', 'disabled');
            }
        }
    }
}



@Directive({ selector: '[expireThreeMonth]' })
export class ExpireThreeMonthDirective {
    constructor(el: ElementRef, renderer: Renderer, private authorizationService: AuthorizationService) {
        if (this.authorizationService.Session && this.authorizationService.Session.user.currentCompany.leftDays < -90) {
            renderer.setElementAttribute(el.nativeElement, 'disabled', 'disabled');
        }
    }
}


