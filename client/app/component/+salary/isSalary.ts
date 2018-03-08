import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthorizationService } from '../../service/core/authorization';

@Injectable()
export class IsSalary implements CanActivate {
	constructor(private router: Router,
		private authorizationService: AuthorizationService) {
	}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
		console.log('salray canActive', this.authorizationService);
		console.log('salray canActive', this.authorizationService.getpermission('salary'));
		// 这里可以调用服务进行验证
		if (this.authorizationService.getpermission('salary')) {
			return false;
		} else {
			return true;
		}
	}
}
