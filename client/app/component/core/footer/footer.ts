import { Component } from '@angular/core';
import { AuthorizationService } from '../../../service/core';
import { Router } from '@angular/router';
@Component({
    selector: 'footer',
    styleUrls: ['./footer.scss'],
    templateUrl: './footer.html'
})
export class Footer {
    config: any;
    hiednav: boolean = false;
    browserUserAgent: any;
    isShow: boolean = false;
    constructor(private authorizationService: AuthorizationService, private router: Router) {
        this.config = authorizationService.Config;
        this.router = router;
        // router.events.subscribe(() => this.HiedUrl());
    }
    ngOnInit() {
        this.browserUserAgent = this.authorizationService.DetectionUA();
        if (this.browserUserAgent === 'chrome' || this.browserUserAgent === 'safari' || this.browserUserAgent === 'firefox' ) {
            this.isShow = false;
        } else {
            this.isShow = true;
        }
    }

}
