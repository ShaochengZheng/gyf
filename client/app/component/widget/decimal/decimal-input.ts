import { Component, Input, Output, EventEmitter, forwardRef, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import * as _ from 'lodash';

// 要实现双向数据绑定，这个不可少
export const INPUT_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DecimalInputComponent),
    multi: true
};

const noop = () => {
};

let styleDecimal = `
    .inputStyle{
        border-radius: 0px;
        min-width:120px;
    }
    .noBorder1{
        border: 0;
    }
    .radius{
        border-radius: 0.25rem;
    }
`;

@Component({
    template: `
            <input 
                    [ngClass]="{'form-control inputStyle': true, 'noBorder1': !isEditable, 'radius': isEditable}" 
                    [placeholder]="placeholder" 
                    onfocus="this.select()"
                   [class]="decimalStyle"
                   [type]="type" 
                   [(ngModel)]="value" 
                   [disabled]="!isEditable"
                   (blur)="handleBlurEvent($event)">
    `,
    selector: 'decimal-input',
    styleUrls: ['./decimal-input.scss', styleDecimal],
    encapsulation: ViewEncapsulation.None,
    providers: [INPUT_CONTROL_VALUE_ACCESSOR]
})
/**
 * @author Scleo
 * @desciption 自定义金额输入框
 */
export class DecimalInputComponent implements ControlValueAccessor {

    @Input() name: string = null;
    @Input() type: string = '';
    @Input() placeholder: string = '';


    // 焦点失去事件
    @Output() blur: EventEmitter<any> = new EventEmitter();
    // currencyPipe:CurrencyPipe = new CurrencyPipe();
    private _value: any = 0;
    private originValue: any = '';
    private _class: any = 'min-input-width';

    private _isEditable: boolean;

    private onChangeCallback: (_: any) => void = noop;
    private onTouchedCallback: () => void = noop;



    constructor() {
    }

    ngOnInit() {

    }

    /**
     * 处理失去焦点事件，将值格式化为小数点两位，并加上千分位
     * @param e 焦点事件
     */
    handleBlurEvent(e) {
        let val = this._value;
        this._value = Number(this.format(val)).toFixed(2);
        this.onChangeCallback(this._value);
        this.onTouchedCallback();
        this.blur.emit(e);
    }

    get decimalStyle() {
        //console.log('decimal-input.ts get class=>', this._class);
        return this._class;
    }

    @Input() set decimalStyle(cls) {
        this._class = cls;
        // console.log('decimal-input.ts set class=>', this._class);
    }

    get value() {
        return this._value;
    }
    /**
     * 设置文本值
     */
    @Input() set value(val: any) {
        // console.log('writeValue value=>', val);
        if (val && val < 0) {
            val = 0;
        }
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
        let clz: string = this._class;
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
     * 转换整数
     * @param val
     */
    format(val): number {
        if (_.endsWith(val, '.')) {
            return 0;
        }
        let f = parseFloat(val);
        if (isNaN(val)) {
            return 0;
        }
        f = Math.round(val * 100) / 100;
        let s = f.toString();
        let re = /^(([0-9]+)|([0-9]+\.[0-9]{1,2}))$/;
        let isRe = re.test(s);
        if (isRe) {
            return f;
        } else {
            // let splits = s.split('.');
            // let int = splits[0];
            // let dec = splits[1];
            // if (dec.length > 2) {//
            //     dec = dec.substring(0, 1);
            // }
            // return parseFloat(int + '.' + dec);
            return Number(f.toFixed(2));
        }
    }

    /**
     * 转换格式
     * 废弃 还没想好！！！！
     * @param val input value
     */
    convertInputValue(val) {

        // let currency = this.currencyPipe.transform(val, 'CNY', false, '1.2-2');
        return '';
    }

    /**
     * Write a new value to the element.
     */
    writeValue(value: any) {
        // console.log('writeValue', value);
        if (value) {
            this._value = this.format(value).toFixed(2);
            //  console.log('writeValue true=>', this._value);
        } else {
            let zero = 0;
            this._value = zero.toFixed(2);
            //  console.log('writeValue false=>', this._value);
        }
    }

    /**
     * Set the function to be called when the control receives a change event.
     */
    registerOnChange(fn: any) {
        this.onChangeCallback = fn;
    };

    /**
     * Set the function to be called when the control receives a touch event.
     */
    registerOnTouched(fn: any) {
        this.onTouchedCallback = fn;
    }
}
