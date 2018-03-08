import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class PubSubService {
    pub = new Subject<Event>();
    pub$ = this.pub.asObservable();

    constructor() { }

    publish(event: Event) {
        this.pub.next(event);
    }
}

export class Event {
    type: EventType;
    data: any;
}
/**
 * todo清理下无用的
 *
 * @export
 * @enum {number}
 */
export enum EventType {
    SwitchBeginningPeriod,
    SwitchHomePageAssist,
    SwitchHomePageAccount,
    SwitchCompanyBilling,
    SwitchAccount,
    CurrentAccountUpdate,
    CurrentCompanyUpdate,
    AttachmentUpdate,
    isNewmessage,
    CurrentSession,
    matchSession,
    hideChild,
    Rollback // 反过账
}
