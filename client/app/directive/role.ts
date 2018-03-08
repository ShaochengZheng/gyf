/**
 * Created by zishaofei on 2017/3/14.
 * 根据角色隐藏或者显示对应的DOM
 *
 */
import { Directive, ElementRef, Renderer } from '@angular/core';
import { AuthorizationService } from '../service/core';



@Directive({ selector: '[manager]' })
export class AdimDirective {
    constructor(el: ElementRef, renderer: Renderer, private authorizationService: AuthorizationService) {
        // 如果是外部顾问 隐藏
        if (this.authorizationService.Session && this.authorizationService.Session.role === 'Manager') {
            renderer.setElementAttribute(el.nativeElement, 'style', 'display: none!important');
        }
    }
}

@Directive({ selector: '[acounting]' })
export class CountingDirective {
    constructor(el: ElementRef, renderer: Renderer, private authorizationService: AuthorizationService) {
        // 如果是外部顾问 隐藏
        if (this.authorizationService.Session && this.authorizationService.Session.user.role.name === 'Accounting') {
            renderer.setElementAttribute(el.nativeElement, 'style', 'display: none!important');
        }
    }
}

@Directive({ selector: '[assitant]' })
export class AssitantDirective {
    constructor(el: ElementRef, renderer: Renderer, private authorizationService: AuthorizationService) {
        // 如果是外部顾问 隐藏
        if (this.authorizationService.Session && this.authorizationService.Session.user.role.name === '外部顾问') {
            renderer.setElementAttribute(el.nativeElement, 'style', 'display: none!important');
        }
    }
}
