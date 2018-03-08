import { Component, ViewChild, OnInit } from '@angular/core';
import { LoginModel } from '../../../api/identity/model/LoginModel';
import { AuthorizationService } from '../../../service/core';
import { Router } from '@angular/router';
import { StorageService } from '../../../../app/service/core/storage';


declare var $: any;
@Component({
	selector: 'idle-Popover',
	templateUrl: './idle-Popover.component.html',
	styleUrls: ['./idle-Popover.component.scss']
})

export class IdlePopoverComponent implements OnInit {
	password: any;
	username: any;
	bakSession: any;
	isname: boolean = false;
	errorMessage: any = '错了';
	expiredtitle: boolean = false;
	emptyPassword: boolean = false;
	errormsg: string = '';
	alert: Object = {};
	loginModel: LoginModel = {
		userName: '',
		password: '',
	};
	isshow: boolean = false;
	constructor(private authorizationService: AuthorizationService, private router: Router, private storageService: StorageService) {

	}

	public show() {
		console.error('好事modal');
		const name = JSON.parse(localStorage.getItem('name'));
		if (this.authorizationService.Session.user.phoneNumberComfirmed) {
			this.username = this.authorizationService.Session.user.phoneNumber;
			this.isname = false;
		} else if (this.authorizationService.Session.user.email) {
			this.username = this.authorizationService.Session.user.email;
			this.isname = false;
		} else if (name) {
			this.username = name;
			this.isname = false;
		} else {
			this.isname = true;
			console.error('未能获取到用户名');
		}
		console.error('超时退出');
		this.bakSession = this.authorizationService.getSession();
		if (this.bakSession) {

		} else {
			console.error(this.bakSession);
			console.log('bakSession');
		}
		this.authorizationService.idleOut();
		this.modalshow();
		const session = this.authorizationService.getSession();
		if (session) {
			session.user.isDisplayDemo = 'N';
			this.authorizationService.setSession(session);
		}

		this.expiredtitle = false;
	}

	public alertDanger(msg: string) {
		this.alert = { type: 'danger', msg: msg };
		setTimeout(() => {
			this.alert = {};
		}, 5000);
	}

	close() {
		this.modalhide();
	}

	ngOnInit() {

	}

	onSubmit() {
		this.expiredtitle = false;
		this.emptyPassword = false;
		if (!this.password) {
			this.emptyPassword = true;
			return;
		}
		if (!this.username) {
			this.isname = true;
			return;
		}
		this.loginModel.userName = this.username;
		this.loginModel.password = this.password;
		// Oauth
		this.authorizationService.login(this.loginModel)
			.then(
			l => {
				this.expiredtitle = false;
				const session = this.storageService.getToken();
				session.role = this.bakSession.role;
				session.user.currentRole = this.bakSession.user.currentRole;
				session.user.currentCompany = this.bakSession.user.currentCompany;
				session.currentAccount = this.bakSession.currentAccount;
				this.password = '';
				this.authorizationService.setSession(session);
				this.modalhide();
			}
			)
			.catch(error => {
				console.error(error);
				this.errormsg = error;
				this.expiredtitle = true;
			});


	}

	cancel() {
		this.modalhide();
		this.router.navigate(['/login']);
	}
	modalshow() {
		this.isshow = true;
	}
	modalhide() {
		this.isshow = false;

	}

}
