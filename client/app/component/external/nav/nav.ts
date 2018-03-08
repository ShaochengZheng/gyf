import { Component } from '@angular/core';
import { AuthorizationService } from '../../../service/core';

@Component({
    selector: 'external-nav',
    templateUrl: './nav.html',
    styleUrls: ['./nav.scss']
})
export class ExternalNavComponent {
    config: any;

    constructor(private authorizationService: AuthorizationService) {
        this.config = authorizationService.Config;
    }
}
