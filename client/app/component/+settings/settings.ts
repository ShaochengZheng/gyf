import {
    Component, OnInit
} from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { StorageService, AuthorizationService } from '../../service/core';

import * as _ from 'lodash';

@Component({
    selector: 'setting',
    templateUrl: './settings.html',
    styleUrls: ['./settings.scss'],
})
export class SettingComponent implements OnInit {
    urlSub: any;
    // 管理员只显示后2项
    isManager: boolean = false;
    // 会计
    isAccount: boolean = false;
    // 助理
    isAssist: boolean = false;
    constructor(private location: Location, private router: Router, private authorizationService: AuthorizationService,
        private storageService: StorageService) {

    }




    ngAfterViewInit(): void {

    }

    ngOnInit(): void {
        let token = this.authorizationService.getSession();
        let roles = _.cloneDeep(token.user.currentRole);
        if (roles) {
            roles.forEach(element => {
                if (element === 'Manager') {
                    this.isManager = true;
                } else if (element === 'Account') {
                    this.isAccount = true;
                } else if (element === 'Assistant') {
                    this.isAssist = true;
                }
            });
        }
        if (this.isManager && (!this.isAccount && !this.isAssist)) {
            this.router.navigate(['/app/setting/company-billing']);
        } else if (this.isAssist && !this.isManager) {
            this.router.navigate(['/app/setting/contact']);
        }
        console.log('<--setting-->', token);
    }
}
