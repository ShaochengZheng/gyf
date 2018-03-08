import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateChild } from '@angular/router';
import { AuthorizationService } from '../../service/core/authorization';

@Injectable()
export class IsFinance implements CanActivate, CanActivateChild {
	constructor(private router: Router,
		private authorizationService: AuthorizationService) {
	}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
		// 这里可以调用服务进行验证
		if (this.authorizationService.getpermission('finance')) {
			return false;
		} else {
			return true;
		}
	};
	canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		return this.canActivate(route, state);
	}
}
