import { Component } from '@angular/core';
import { AuthorizationService } from '../../../service/core';

@Component({
    selector: 'footer-external',
    templateUrl: './footer.html',
    styleUrls: ['./footer.scss']
})
export class ExternalFooterComponent {
    config: any;
    browserUserAgent: any;
    isShow: boolean = false;

    constructor(private authorizationService: AuthorizationService) {
        this.config = authorizationService.Config;
        this.browserUserAgent = this.authorizationService.DetectionUA();
        if (this.browserUserAgent === 'chrome' || this.browserUserAgent === 'safari' || this.browserUserAgent === 'firefox') {
            this.isShow = false;
        } else {
            this.isShow = true;
        }
        console.log(this.browserUserAgent);
    }
}
