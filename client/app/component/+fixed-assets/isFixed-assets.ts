import { Injectable } from '@angular/core';
import { CanActivateChild, CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthorizationService } from '../../service/core/authorization';

@Injectable()
export class IsFixedAssets implements CanActivate, CanActivateChild {
	constructor(private router: Router,
		private authorizationService: AuthorizationService) {
	}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
		// 这里可以调用服务进行验证
		if (this.authorizationService.getpermission('fixed-assets')) {
			return false;
		} else {
			return true;
		}
	}
	canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		return this.canActivate(route, state);
	}
}
