import { Component, OnInit, forwardRef, Input, ElementRef, ViewChild, Renderer, EventEmitter, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import './string.extensions';

@Component({
  selector: 'ng2-numeric-input',
  template: `
<div class="numeric-input">
<div class="inputs">
   <input #formattedView type="text" (click)="_startEditing()" (focus)="_startEditing()"  [hidden]="_editing"
      value="{{_formattedNumber}}" [class]="clsStyle" />
   <input #numberInput (change)="_valueChanged($event.target.value)" type="text" [pattern]="_pattern"
      (blur)="_stopEditing()" [class]="clsStyle" [hidden]="!_editing" onfocus="this.select()" />
</div>
<div class="messages">
   {{_errMsg}}
</div>
</div>
   `,
  styles: [
    `
    .small-width{
      width:120px;
    }
      `
  ],
  providers: [
    { /* idk why or what this will do exactly.. but it works! ;) */
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NumericInputComponent),
      multi: true
    }
  ],
})
export class NumericInputComponent implements OnInit, ControlValueAccessor {

  public static DECIMAL_CHARACTER = '.';
  public static THOUSAND_CHARACTER = ',';

  private _formattedNumber: string = '';
  private _errMsg: string;
  private _editing = false;
  private _pattern = '';

  // 焦点失去事件
  @Output() blur: EventEmitter<any> = new EventEmitter();
  @Input() public isSmall = false;
  // tslint:disable-next-line:no-input-rename
  @Input('class') public clsStyle = 'form-control text-right';
  @ViewChild('numberInput') private _numberInputField: ElementRef;
  // tslint:disable-next-line:no-input-rename
  @Input('value') private _no: number;

  // tslint:disable-next-line:no-input-rename
  @Input('decimal-character') decimalCharacter: string = NumericInputComponent.DECIMAL_CHARACTER;
  // tslint:disable-next-line:no-input-rename
  @Input('thousand-character') thousandCharacter: string = NumericInputComponent.THOUSAND_CHARACTER;
  // tslint:disable-next-line:no-input-rename
  @Input('decimal-length') decimalLength: number = 2;
  @Input() currency: string = '';

  public constructor(private _renderer: Renderer) {
  }

  public ngOnInit() {
    if (this.decimalCharacter === this.thousandCharacter) {
      throw new Error('decimal-character and thousand-character are the same! Thats not allowed!');
    }
    console.log('numeric', this.clsStyle);
    this._no = this._parseInput(this._no);

    this._updateNumber();
    this._updateNumericString();

    this._pattern = '[ ]*[+-]{0,1}\\d*' + this.decimalCharacter + '{0,1}\\d*[ ]*';
    console.log('numeric small', this.isSmall);
    if (this.isSmall) {
      this.clsStyle = 'form-control text-right small-width';
    } else {
      this.clsStyle = 'form-control text-right';
    }
  }

  private _normalizeNumberToString(val: any, decimalChar: string, thousandChar: string): string {
    if (isNaN(val)) { return ''; }

    let tmp = Number(val).toFixed(2);

    tmp = tmp.replaceAll(',', 't');
    tmp = tmp.replaceAll('.', 'd');

    tmp = tmp.replaceAll('d', decimalChar);
    tmp = tmp.replaceAll('t', thousandChar);

    return tmp;
  }

  private _normalizeNumber(val: any, decimalChar: string, thousandChar: string): number {
    if (typeof (val) === 'number') { return parseFloat(val.toFixed(2)); }
    if (!val) { return 0; }

    let tmp = Number(val).toFixed(2).toString().trim();

    tmp = tmp.replaceAll(thousandChar, 't');
    tmp = tmp.replaceAll(decimalChar, 'd');

    tmp = tmp.replaceAll('t', '');
    tmp = tmp.replaceAll('d', '.');

    return isNaN(Number(tmp)) ? 0 : parseFloat(tmp);
  }

  private _updateNumericString() {
    if (this._errMsg !== '' || isNaN(this._no)) {
      this._formattedNumber = '0.00';
      this._no = 0.00;
      return;
    }

    let tmp = this._normalizeNumberToString(this._no, this.decimalCharacter, this.thousandCharacter);

    if (tmp.indexOf(this.decimalCharacter) >= 0) {
      const fullnumber = tmp.split(this.decimalCharacter)[0];
      let decimal = tmp.split(this.decimalCharacter)[1];

      if (decimal.length > this.decimalLength) {
        decimal = decimal.substring(0, this.decimalLength);
      }

      tmp = (fullnumber.replace(/\B(?=(\d{3})+(?!\d))/g, this.thousandCharacter) + this.decimalCharacter + decimal);
    } else {
      tmp = tmp.replace(/\B(?=(\d{3})+(?!\d))/g, this.thousandCharacter);
    }

    this._formattedNumber = tmp + this.currency;
  }

  private _updateNumber() {
    if (isNaN(this._no)) {
      return;
    }

    const tmp = this._normalizeNumberToString(this._no, this.decimalCharacter, '');
    this._numberInputField.nativeElement.value = tmp;
  }

  private _parseInput(val: any): number {
    return this._normalizeNumber(val, this.decimalCharacter, this.thousandCharacter);
  }

  private _checkValidState(val: any) {
    this._errMsg = '';

    if (typeof (val) === 'number') {
      val = this._normalizeNumberToString(val, this.decimalCharacter, '');
    }

    const regex = new RegExp(this._numberInputField.nativeElement.pattern);
    const matches = regex.exec(val);

    // if (!matches || !matches.length || matches[0] !== val) {
    //   this._errMsg = 'PATTERN DOES NOT MATCH!';
    // }
  }

  private _startEditing() {
    this._editing = true;

    setTimeout(() => {
      this._updateNumber();
      this._renderer.invokeElementMethod(this._numberInputField.nativeElement, 'focus', []);
    }, 1);
  }

  private _stopEditing() {
    this._checkValidState(this._numberInputField.nativeElement.value);
    this._updateNumericString();
    this.blur.emit(this._no);
    this._editing = false;
  }

  private _valueChanged(val: any) {
    this._no = this._parseInput(val);
    this._checkValidState(val);

    if (this._onTouched) { this._onTouched(); }
    if (this._onChange) { this._onChange(this._no); }

    this._updateNumericString();
  }

  // ControlValueAccessor implementation
  // ====================================

  private _onChange = (_: any) => { };
  private _onTouched = () => { };

  public writeValue(val: any) {
    this._no = this._parseInput(val);
    this._checkValidState(val);

    this._updateNumber();
    this._updateNumericString();
  }

  public registerOnChange(fn: (_: any) => void): void { this._onChange = fn; }
  public registerOnTouched(fn: () => void): void { this._onTouched = fn; }

}
