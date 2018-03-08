import { Component, ViewChild, Input, Output, EventEmitter, forwardRef, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import * as _ from 'lodash';

export const INPUT_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => BpInputComponent),
    multi: true
};

const noop = () => {
};

const style = `
    .inputStyle{
        border-radius: 0px;
    }
    .noBorder1{
        border: 0;
    }
    .radius{
        border-radius: 0.25rem;
    }
`;

@Component({
    styles: [style],
    template: `
            <input [ngClass]="{'form-control inputStyle radius': true }"
            [class]='class' [type]="type" (ngModelChange)="moneyChange($event)"
                (blur)="handleBlurEvent($event)" onfocus="this.select()" (focus)="handleFocus($event)"
                 [(ngModel)]="value" [disabled]="!isEditable" >

    `,
    selector: 'bp-input',
    encapsulation: ViewEncapsulation.None,
    providers: [INPUT_CONTROL_VALUE_ACCESSOR]
})

export class BpInputComponent implements ControlValueAccessor {

    @Input() name: string = null;
    @Input() type: string = '';
    @Input() placeHolder: string = '';
    @Input() decimal: number = 2;

    // 焦点失去事件
    @Output() blur: EventEmitter<any> = new EventEmitter();
    // 焦点事件
    @Output() focus: EventEmitter<any> = new EventEmitter();
    @Output() moneyModule: EventEmitter<any> = new EventEmitter();
    private _value: any = 0;
    private originValue: any = '';
    private _class: any = '';

    private _isEditable: boolean = true;

    private onChangeCallback: (_: any) => void = noop;
    private onTouchedCallback: () => void = noop;



    constructor() { }

    ngOnInit() {
        this.format(0);
    }

    /**
     * 处理失去焦点事件，将值格式化为小数点两位，并加上千分位
     * @param e 焦点事件
     */
    handleBlurEvent(e) {
        const val = this._value;
        this._value = this.format(val);
        this.onChangeCallback(this._value);
        this.onTouchedCallback();
        this.blur.emit(e);
    }

    /**
     * 获得焦点
     *
     * @param {any} e
     * @memberof BpInputComponent
     */
    handleFocus(e) {
        this._value = this.reverseFormat(this._value);
        const val = this._value;
        this.focus.emit(val);
    }

    get class() {
        return this._class;
    }

    @Input() set class(cls) {
        this._class = cls;
    }

    get value() {
        return this._value;
    }
    /**
     * 设置文本值
     */
    @Input() set value(val: any) {
        this.originValue = val;
        if (val !== this._value) {
            this._value = val;
            this.onChangeCallback(val);
        }
    }

    @Input() get isEditable() {
        return this._isEditable;
    }

    set isEditable(value) {
        this._isEditable = this.convertBooleanProperty(value);
        const clz: string = this._class;
        if (this._isEditable === false) {// 不可编辑改变样式
            this._class = clz + ' no-border';
        } else {
            if (clz.indexOf(' no-border') > 0) {
                this._class = clz.substring(0, clz.indexOf(' no-border'));
            }
        }
    }

    /**
     *
     * @param value
     */
    convertBooleanProperty(value) {
        return value !== null && `${value}` !== 'false';
    }

    /**
     *格式化
     *
     * @param {any} val
     * @returns {*}
     * @memberof BpInputComponent
     */
    format(val): any {
        let n: number = Number(this.decimal);
        val = val.toString();
        if (isNaN(val)) {
            return '-';
        }
        if (/[^0-9\.]/.test(val)) {
            return '-';
        }
        if (val === 0 || val === '0' || val === '0.00' || val === '-') {
            return '-';
        }
        // 做个保险
        n = n > 0 && n <= 20 ? n : 2;
        val = parseFloat((val + '').replace(/[^\d\.-]/g, '')).toFixed(n) + '';
        const l = val.split('.')[0].split('').reverse(),
            r = val.split('.')[1];
        let t = '';
        for (let i = 0; i < l.length; i++) {
            t += l[i] + ((i + 1) % 3 === 0 && (i + 1) !== l.length ? ',' : '');
        }
        return t.split('').reverse().join('') + '.' + r;
    }
    /**
     * 反格式化
     *
     * @param {any} val
     * @returns
     * @memberof BpI nputComponent
     */
    reverseFormat(val) {
        val = val.toString();
        console.warn(val);
        if (val === 0 || val === '0' || val === '0.00' || val === '-') {
            return '0.00';
        }
        val = parseFloat(val.replace(/[^\d\.-]/g, ''));
        return val;
    }

    /**
     * Write a new value to the element.
     */
    writeValue(value: any) {
        if (value) {
            this._value = this.format(value);
        } else {
            // this._value = value;
            const zero = 0;
            this._value = zero.toFixed(2);
        }
    }

    /**
     * Set the function to be called when the control receives a change event.
     */
    registerOnChange(fn: any) {
        this.onChangeCallback = fn;
    }

    /**
     * Set the function to be called when the control receives a touch event.
     */
    registerOnTouched(fn: any) {
        this.onTouchedCallback = fn;
    }
    moneyChange(val) {
        val = val.replace(/^(\d*)$/, '$1.');
        val = (val + '00').replace(/(\d*\.\d\d)\d*/, '$1');
        const re = /(\d)(\d{3},)/;
        while (re.test(val)) {
            val = val.replace(re, '$1,$2');
        }
        val = val.replace(/,(\d\d)$/, '.$1');
        val = Number(val);
        if (isNaN(val)) {
            this.moneyModule.emit('0');
        } else {
            this.moneyModule.emit(val);
        }
    }
}
