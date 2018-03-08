import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { AuthorizationService } from './authorization';

@Injectable()
export class ExpireGuard implements CanActivate {
    session: any;

    constructor(private router: Router, private authorizationService: AuthorizationService) {
        this.session = this.authorizationService.Session;
    }

    canActivate() {
        // if (!this.Session || !this.Session.user || !this.Session.user.role.name) {
        //     this.router.navigate(['/login']);
        //     return false;
        // }
        // 加上isAccountingFirm 判断用户来源 
        // if (this.Session && this.Session.user && !this.Session.user.isAccountingFirm
        //     && this.Session.user.currentCompany && (this.Session.user.currentCompany.status === 'Creating'
        //         || this.Session.user.currentCompany.status === 'Provisioned')) {
        //     this.router.navigate(['/app/complete-info', { status: 'back' }]);
        //     return false;
        // }

        if (this.session && this.session.user && this.session.user.currentCompany && this.session.user.currentCompany.isExpired) {
            return false;
        }

        return true;
    }
}
