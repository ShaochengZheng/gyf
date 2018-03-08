import { Injectable } from '@angular/core';

import { Angulartics2 } from 'angulartics2';

declare var hmt: any;
declare var window: any;

@Injectable()
export class Angulartics2BaiduAnalytics {

    constructor(
        private angulartics2: Angulartics2
    ) {
        if (typeof (hmt) === 'undefined') {
            window.hmt = [];
        } else {
            hmt.push(['_ setAutoPageview', false]);
        }

        this.angulartics2.pageTrack.share().subscribe((x: any) => this.pageTrack(x.path, x.location));

        this.angulartics2.eventTrack.share().subscribe((x: any) => this.eventTrack(x.action, x.properties));

        this.angulartics2.setUsername.share().subscribe((x: string) => this.setUsername(x));

        this.angulartics2.setUserProperties.share().subscribe((x: any) => this.setUserProperties(x));
    }

    pageTrack(path: string, location: any) {
        hmt.push(['_trackPageview', path]);
    }

    eventTrack(action: string, properties: any) {
        hmt.push(['_trackEvent', action, properties]);
    }

    setUsername(userId: string) {
        hmt.push(['identify', userId]);
    }

    setUserProperties(properties: any) {
        hmt.push(['set', properties]);
    }
}
