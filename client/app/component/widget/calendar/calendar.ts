import {
    NgModule, Component, ElementRef, AfterViewInit, OnDestroy, OnChanges,
    Input, Output, SimpleChange, EventEmitter, forwardRef, NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, NG_VALIDATORS } from '@angular/forms';
import { DatePickerZHCN } from '../../../service/core/core';

import * as moment from 'moment';
declare var jQuery: any;

const CALENDAR_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => Calendar),
    multi: true
};
export const CALENDAR_VALIDATOR: any = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => Calendar),
    multi: true
};
@Component({
    selector: 'p-calendar',
    templateUrl: './calendar.component.html',
    styleUrls: ['./calendar.component.scss'],

    providers: [CALENDAR_VALUE_ACCESSOR]
})
export class Calendar implements AfterViewInit, OnChanges, OnDestroy, ControlValueAccessor {

    @Input() readonlyInput: boolean;

    @Input() style: any;

    @Input() styleClass: string;

    @Input() inputStyle: any;

    @Input() inputStyleClass: string;

    @Input() placeholder: string;

    @Input() inline: boolean = false;

    @Input() showAnim: string;

    @Input() dateFormat: string;

    @Input() showButtonPanel: boolean;

    @Input() monthNavigator: boolean;

    @Input() yearNavigator: boolean;

    @Input() numberOfMonths: number;

    @Input() showWeek: boolean;

    @Input() showOtherMonths: boolean;

    @Input() selectOtherMonths: boolean;

    @Input() defaultDate: any;

    @Input() minDate: any;

    @Input() maxDate: any;

    @Input() disabled: any;

    @Input() showIcon: boolean;

    @Input() showDelIcon: boolean = true;

    @Input() timeFormat: string;

    @Input() timeOnly: boolean;

    @Input() stepHour: number = 1;

    @Input() stepMinute: number = 1;

    @Input() stepSecond: number = 1;

    @Input() hourMin: number = 0;

    @Input() hourMax: number = 23;

    @Input() minuteMin: number = 0;

    @Input() minuteMax: number = 59;

    @Input() secondMin: number = 0;

    @Input() secondMax: number = 59;

    @Input() hourGrid: number = 0;

    @Input() minuteGrid: number = 0;

    @Input() secondGrid: number = 0;

    @Input() timeControlType: string;

    @Input() horizontalTimeControls: boolean;

    @Input() minTime: string;

    @Input() maxTime: string;

    @Input() timezoneList: string[];

    @Input() locale: any = DatePickerZHCN;

    @Input() icon: string = 'fa fa-calendar';

    @Input() iconDel: string = 'fa fa-remove';

    @Input() iconStyleClass: string;

    @Output() onBlur: EventEmitter<any> = new EventEmitter();

    @Output() onSelect: EventEmitter<any> = new EventEmitter();
    hovered: boolean;
    value: string;
    focused: boolean;
    initialized: boolean;
    calendarElement: any;
    onModelChange: Function = () => { };
    onModelTouched: Function = () => { };

    constructor(private el: ElementRef, private zone: NgZone) {
        this.initialized = false;
    }

    ngAfterViewInit() {
        this.calendarElement = this.inline ? jQuery(this.el.nativeElement.children[0]) :
            jQuery(this.el.nativeElement.children[0].children[0]);
        let options = {
            showAnim: this.showAnim,
            dateFormat: this.dateFormat,
            showButtonPanel: this.showButtonPanel,
            changeMonth: this.monthNavigator,
            changeYear: this.yearNavigator,
            numberOfMonths: this.numberOfMonths,
            showWeek: this.showWeek,
            showOtherMonths: this.showOtherMonths,
            selectOtherMonths: this.selectOtherMonths,
            defaultDate: this.defaultDate,
            minDate: this.minDate,
            maxDate: this.maxDate,
            onSelect: (dateText: string) => {
                this.zone.run(() => {
                    this.value = dateText;
                    this.onModelChange(this.value);
                    this.onSelect.emit(this.value);
                });
            }
        };

        if (this.locale) {
            for (let prop in this.locale) {
                if (this.locale.hasOwnProperty(prop)) {
                    options[prop] = this.locale[prop];
                }
            }
        }

        if (this.timeFormat || this.timeOnly) {
            options['timeFormat'] = this.timeFormat;
            options['timeOnly'] = this.timeOnly;
            options['stepHour'] = this.stepHour;
            options['stepMinute'] = this.stepMinute;
            options['stepSecond'] = this.stepSecond;
            options['hourMin'] = this.hourMin;
            options['hourMax'] = this.hourMax;
            options['minuteMin'] = this.minuteMin;
            options['minuteMax'] = this.minuteMax;
            options['secondMin'] = this.secondMin;
            options['secondMax'] = this.secondMax;
            options['hourGrid'] = this.hourGrid;
            options['minuteGrid'] = this.minuteGrid;
            options['secondGrid'] = this.secondGrid;
            options['controlType'] = this.timeControlType;
            options['oneLine'] = this.horizontalTimeControls;
            options['minTime'] = this.minTime;
            options['maxTime'] = this.maxTime;
            options['timezoneList'] = this.timezoneList;
            this.calendarElement.datetimepicker(options);
        } else {
            this.calendarElement.datepicker(options);
        }

        this.initialized = true;
    }

    onInput(event) {
        // if()
        if (event && event.target) {
            event = this.formatDateTime(event);
            this.onModelChange(event.target.value);
        }
    }

    handleBlur(event) {
        event = this.formatDateTime(event);
        if (event && event.target !== undefined) {
            this.value = event.target.value;
            this.onModelTouched();
            this.focused = false;
            this.onBlur.emit(event);
        }
    }
    formatDateTime(event) {
        let val: any;
        if (event.target && event.target.value !== undefined && event.target.value !== 'undefined') { // 解决非法输入 默认当天
            val = moment(event.target.value).format('YYYY-MM-DD');
            if (moment(val).invalidAt() !== -1) {
                val = moment(new Date()).format('YYYY-MM-DD');
            }
            event.target.value = val;
            return event;
        }
    }

    writeValue(value: any): void {
        this.value = value;
    }

    registerOnChange(fn: Function): void {
        this.onModelChange = fn;
    }

    registerOnTouched(fn: Function): void {
        this.onModelTouched = fn;
    }

    ngOnChanges(changes: { [key: string]: SimpleChange }) {
        if (this.initialized) {
            for (let key in changes) {
                if (changes.hasOwnProperty(key)) {
                    this.calendarElement.datepicker('option', key, changes[key].currentValue);
                }
            }
        }
    }

    ngOnDestroy() {
        this.calendarElement.datepicker('destroy');
        this.calendarElement = null;
        this.initialized = false;
    }

    onButtonClick(event, input) {
        input.focus();
    }

    onButtonClickDel(event, input) {
        input.value = '';
        this.zone.run(() => {
            this.value = event.target.value;
            this.onModelChange(this.value);
            this.onSelect.emit(this.value);
        });
    }

    focus() {
        this.calendarElement.focus();
    }
}

@NgModule({
    imports: [CommonModule],
    exports: [Calendar],
    declarations: [Calendar]
})
export class CalendarModule { }
