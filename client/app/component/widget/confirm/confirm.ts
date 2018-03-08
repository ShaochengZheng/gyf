import { Component, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs/Subject';

export enum ConfirmTypeEnum {
    Delete = 1
}
export enum ConfirmEventTypeEnum {
    Confirm = 1,
    Cancel = 2,
    Other = 3,
}
export enum ConfirmEventCheckTypeEnum {
    True = 1,
    False = 2,
}

@Component({
    templateUrl: './confirm.html',
    selector: 'confirm-widget'
})
export class ConfirmWidget {
    @Input() message: string;
    @Input() title: string;
    @Input() confirmText: string = '确定';
    @Input() cancelText: string = '取消';
    @Input() otherText: string = '';
    @Input() default: boolean = true;
    @Input() orderNumber: boolean = false; // 整理凭证编号
    @Input() isSingle: boolean = true;
    @Input() confirmType: ConfirmTypeEnum = ConfirmTypeEnum.Delete;
    // 处理特殊需求的 文本显示
    @Input() htmlMessage = '<div></div>';

    @Output() confirmEvent = new EventEmitter<ConfirmEventTypeEnum>();
    @Output() confirmEventCheck = new EventEmitter<ConfirmEventCheckTypeEnum>();
    @Output() customEvent = new Subject<any>();

    @ViewChild('modal') public modal;
    isChecked = false;
    tempArg: any = {};
    public show(item?) {
        if (this.confirmType === ConfirmTypeEnum.Delete) {
            this.setDeleteText();
        }
        this.modal.show();
        this.tempArg.val = item;
        return this.customEvent;
    }

    setDeleteText() {
        if (!this.title) {
            this.title = '确认删除';
        }
    }

    save() {
        this.confirmEvent.emit(ConfirmEventTypeEnum.Confirm);
        this.modal.hide();
        this.tempArg.status = 1;
        this.customEvent.next(this.tempArg);
    }

    /**
     *  取消没有用到
     */
    cancel() {
        this.confirmEvent.emit(ConfirmEventTypeEnum.Cancel);
        this.modal.hide();
        this.tempArg.status = 2;
        this.customEvent.next(this.tempArg);
    }
    /**
     * 适配三个按钮，
     * otherText 传值的时候才会显示三个按钮！
     */
    otherClick() {
        this.confirmEvent.emit(ConfirmEventTypeEnum.Other);
        this.modal.hide();
        this.tempArg.status = 3;
        this.customEvent.next(this.tempArg);
    }
    action(e) {
        this.isChecked = !this.isChecked;
        console.log(this.isChecked);
        if (this.isChecked === true) {
             this.confirmEventCheck.emit(ConfirmEventCheckTypeEnum.True);
        }else {
            this.confirmEventCheck.emit(ConfirmEventCheckTypeEnum.False);
        }
    }
}
