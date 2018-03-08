import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthorizationService } from '../../service/core/authorization';

@Injectable()
export class IsSetting implements CanActivate {
	constructor(private router: Router,
		private authorizationService: AuthorizationService) {
	}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
		// 这里可以调用服务进行验证
		// if (this.authorizationService.Session && this.authorizationService.Session.user.role.name === '外部顾问') {
		// 	return false;
		// } else {
			return true;
		// }
	}
}
