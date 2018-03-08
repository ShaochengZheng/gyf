import { Component, OnInit } from '@angular/core';

import { StorageService } from '../../../service/core/storage';
import { AuthorizationService } from '../../../service/core';

import * as _ from 'lodash';
declare var $: any;


@Component({
    selector: 'report-index',
    templateUrl: './report-index.component.html',
    styleUrls: ['./report-index.component.scss']
})
export class ReportIndexComponent implements OnInit {

    token: any;
    isAccount: boolean = false;
    isAssistant: boolean = false;
    isManager: boolean = true;

    constructor(private storageService: StorageService, private authorizationService: AuthorizationService) {
        this.token = this.authorizationService.getSession();
        if (this.token) {
            console.log('报表====》》》》', this.token.user.currentRole);
            if (_.includes(this.token.user.currentRole, 'Manager')) {
                this.isManager = false;
                console.log('Manager');
            }
            if (_.includes(this.token.user.currentRole, 'Account')) {
                this.isAccount = true;
                this.isManager = true;
                console.log('Account');
            }
            if (_.includes(this.token.user.currentRole, 'Assistant')) {
                this.isAssistant = true;
                this.isManager = true;
                console.log('Assistant');
            }
        }
    }

    ngOnInit() {
        console.log('reportIndexComponent');
    }

}
