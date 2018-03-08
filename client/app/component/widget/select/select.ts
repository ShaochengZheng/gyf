import {
    Component, Input, Output, EventEmitter, ElementRef,
    OnInit, AfterViewInit, forwardRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { Subject } from 'rxjs/Subject';
import { SelectItem } from './select-item';
import { stripTags } from './select-pipes';
import { OptionsBehavior } from './select-interfaces';
import { escapeRegexp } from './common';

const NG2SELECT_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SelectComponent),
    multi: true
};


const styles = `
.ui-select-container{
    width: 100%;
}
.ui-select-toggle {
  position: relative;

  /* hardcoded, should use variable from bootstrap */
  padding: 0.375rem 0.75rem;
}

/* Fix Bootstrap dropdown position when inside a input-group */
.input-group > .dropdown {
  /* Instead of relative */
  position: static;
}

.ui-select-match > .btn {
  /* Instead of center because of .btn */
  text-align: left !important;
  line-height: 1.55;
}

.ui-select-match-text {
  width: 70%;
}

.ui-select-match > .caret {
  position: absolute;
  top: 45%;
  right: 15px;
}

li{
    line-height: 1.8;
}

li :hover a{
    color:#fff;
}

.ui-disabled {
  background-color: #eceeef;
  border-radius: 4px;
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 5;
  opacity: 0.6;
  top: 0;
  left: 0;
  cursor: not-allowed;
}

.ui-select-choices {
  width: 100%;
  height: auto;
  max-height: 300px;
  overflow-x: hidden;
  margin-top: 0;
}

.ui-select-multiple .ui-select-choices {
  margin-top: 1px;
}

.ui-select-multiple {
  height: auto;
  padding: 3px 3px 0 3px;
}

.ui-select-multiple input.ui-select-search {
  background-color: transparent !important; /* To prevent double background when disabled */
  border: none;
  outline: none;
  height: 1.9em;
  margin-bottom: 3px;

  /* hardcoded, should use variable from bootstrap, but must be adjusted because... reasons */
  padding: 0.375rem 0.55rem;
}

.ui-select-multiple .ui-select-match-item {
  outline: 0;
  margin: 0 3px 3px 0;
}

.children-float{
    height: auto;
    max-height: 300px;
    position: absolute;
    left: 100%;
    top: 0px;
    width: 100%;
    background-color: #fff;
    overflow: auto;
    z-index: 12;
    border: solid 1px #eceeef;
    box-shadow: 3px 4px 1px #eceeef;
}

.ui-select-floatMode-choices {
  display: block;
  width: 100%;
  height: auto;
  max-height: 300px;
  margin-top: 0;
  overflow: auto;
}

.option-active{
    background-color: #1ccfc9;
}
.option-divider{
    height: 1px;
    background-color: #e5e5e5;
}
.parent-options{
    display: block;
    padding: 8px 10px 2px;
    font-size: 0.8rem;
    line-height: 1.5;
    white-space: nowrap;
    cursor:pointer;
}
.children-options{
    display: block;
    padding: 0px;
    font-size: 0.875rem;
    line-height: 1.5;
    white-space: nowrap;
}
.floatModeContainer{
    position: relative;
}
.option-text{
    display: inline-block;
    width: 140px;
    overflow-x: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.dropdown-item{
    padding: 7px 20px 0px;
}
.optionDisabled{
    color: gray;
    cursor:not-allowed !important;
    pointer-events: none;
}
`;

const optionsTemplate = `
    <ul *ngIf="optionsOpened && options && options.length > 0 && !firstItemHasChildren"
        class="ui-select-choices dropdown-menu" role="menu">
      <li *ngFor="let o of options" role="menuitem">
        <div *ngIf="!o.disabled" class="ui-select-choices-row"
             [class.active]="isActive(o)"
             [class.optionDisabled]="o.disabled"
             (mouseenter)="selectActive(o)"
             (click)="selectMatch(o, $event)">
          <a class="dropdown-item">
            <div [hidden]="!isSubject"  [ngStyle]="{'text-indent.px': (o.id.length-4)*5}" [innerHtml]="o.text | highlight:inputValue"></div>
            <div [hidden]="isSubject"   [innerHtml]="o.text | highlight:inputValue"></div>
          </a>
        </div>
        <div *ngIf="o.disabled" class="ui-select-choices-row"
             [class.optionDisabled]="o.disabled">
          <a class="dropdown-item">
            <div [hidden]="!isSubject"  [ngStyle]="{'text-indent.px': (o.id.length-4)*5}" [innerHtml]="o.text"></div>
            <div [hidden]="isSubject"   [innerHtml]="o.text"></div>
          </a>
        </div>
      </li>
    </ul>
    <ul *ngIf="optionsOpened && options && options.length > 0 && firstItemHasChildren && !floatMode"
        class="ui-select-choices dropdown-menu" role="menu">
      <li *ngFor="let c of options; let index=index" role="menuitem">
        <div class="divider dropdown-divider" *ngIf="index > 0"></div>
        <div class="dropdown-header">{{c.text}}</div>
        <div *ngFor="let o of c.children"
             class="ui-select-choices-row"
             [class.active]="isActive(o)"
             (mouseenter)="selectActive(o)"
             (click)="selectMatch(o, $event)"
             [ngClass]="{'active': isActive(o)}">
          <a class="dropdown-item">
            <div [innerHtml]="o.text | highlight:inputValue"></div>
          </a>
        </div>
      </li>
    </ul>

    <div class="floatModeContainer" *ngIf="optionsOpened && options && options.length > 0 && firstItemHasChildren && floatMode">
        <ul class="ui-select-floatMode-choices dropdown-menu" role="menu">
            <li *ngFor="let c of options; let i=index" role="menuitem" [class.option-active]="isParentActive(c)"
                    (click)="selectParentActive(c)">
                <div class="option-divider" *ngIf="i > 0"></div>
                <div class="parent-options" *ngIf="c &&  c.children && c.children.length>0 && c.children[0].text">
                    <div class="option-text">{{c.text}} </div>
                    <div class="pull-right">></div>
                </div>
            </li>
        </ul>

        <div class="children-float" *ngIf="childrenOptions.length>0 && childrenOptions[0].text">
                <div *ngFor="let o of childrenOptions; let childIndex = index"
                    class="ui-select-choices-row" [class.option-active]="isActive(o)"
                    (mouseenter)="selectActive(o)" (click)="selectMatch(o, $event)">
                    <div class="option-divider" *ngIf="childIndex > 0"></div>
                    <div class="children-options">
                        <button class="dropdown-item"   [disabled]="o.disabled">
                            <div class="option-text " [innerHtml]="o.text | highlight:inputValue"></div>
                        </button>
                    </div>
                </div>
        </div>
    </div>

`;

@Component({
    selector: 'ng-select',
    providers: [NG2SELECT_CONTROL_VALUE_ACCESSOR],
    styles: [styles],
    template: `
    <div tabindex="0"
       *ngIf="multiple === false"
       (keyup)="mainClick($event)"
       [offClick]="clickedOutside"
       class="ui-select-container dropdown open">
      <div [ngClass]="{'ui-disabled': disabled}"></div>
      <div class="ui-select-match"
           *ngIf="!inputMode">
        <span tabindex="-1"
            class="btn btn-default btn-secondary form-control ui-select-toggle"
            (keydown)="inputEvent($event)"
            (keyup)="inputEvent($event, true)"
            (click)="matchClick($event)"
            style="outline: 0; width: 100%">
          <span *ngIf="active.length <= 0" class="ui-select-placeholder pull-left text-muted">{{placeholder}}</span>
          <span *ngIf="active.length > 0" class="ui-select-match-text pull-left text-truncate"
                [ngClass]="{'ui-select-allow-clear': allowClear && active.length > 0}"
                [innerHTML]="active[0].text"></span>
          <i class="dropdown-toggle pull-right"></i>
          <i class="caret pull-right"></i>
          <a *ngIf="allowClear && active.length>0"
            (click)="remove(activeOption)" class="close pull-right">
            &times;
          </a>
        </span>
      </div>
      <input type="text" autocomplete="off" tabindex="-1"
             (keydown)="inputEvent($event)"
             (keyup)="inputEvent($event, true)"
             [disabled]="disabled"
             class="form-control ui-select-search"
             *ngIf="inputMode"
             style="outline: 0; width: 100%"
             placeholder="{{active.length <= 0 ? placeholder : ''}}">
      ${optionsTemplate}
    </div>

    <div tabindex="0"
       *ngIf="multiple === true"
       (keyup)="mainClick($event)"
       (focus)="focusToInput('')"
       class="ui-select-container ui-select-multiple dropdown form-control open">
      <div [ngClass]="{'ui-disabled': disabled}"></div>
      <span class="ui-select-match">
          <span *ngFor="let a of active">
              <span class="ui-select-match-item btn btn-default btn-secondary btn-sm"
                    tabindex="-1"
                    type="button"
                    [ngClass]="{'btn-default': true}">
                 <a class="close"
                    style="margin-left: 10px; padding: 0;"
                    (click)="remove(a)">&times;</a>
                 <span>{{a.text}}</span>
             </span>
          </span>
      </span>
      <input type="text"
             (keydown)="inputEvent($event)"
             (keyup)="inputEvent($event, true)"
             (click)="matchClick($event)"
             [disabled]="disabled"
             autocomplete="off"
             autocorrect="off"
             autocapitalize="off"
             spellcheck="false"
             class="form-control ui-select-search"
             placeholder="{{active.length <= 0 ? placeholder : ''}}"
             role="combobox">
      ${optionsTemplate}
    </div>
    `
})
export class SelectComponent implements OnInit, AfterViewInit, ControlValueAccessor {
    sub = new Subject<any>();
    @Input() isMatchUnit: boolean = true;
    @Input() public allowClear: boolean = false;
    @Input() public placeholder: string = '';
    @Input() public idField: string = 'id';
    @Input() public isSubject: boolean = false;
    @Input() public textField: string = 'text';
    // 是否多选
    @Input() public multiple: boolean = false;
    // 自动完成
    @Input() public autocomplete: boolean = true;
    @Input() public hasChildren: boolean = false;
    @Input()
    public set items(value: Array<any>) {
        console.log(value);
        this._items = value || [];
        this.itemObjects = this._items.map((item: any) => (typeof item === 'string' || (item.children && item.children.length > 0) ?
            new SelectItem(item) :
            item.disabled ? new SelectItem({ id: item[this.idField], text: item[this.textField], disabled: item.disabled }) :
                new SelectItem({ id: item[this.idField], text: item[this.textField] })));
        this.refreshOptions();
        this.sub.next('items');
    }

    @Input()
    public set disabled(value: boolean) {
        this._disabled = value;
        if (this._disabled === true) {
            this.hideOptions();
        }
    }
    public get disabled(): boolean {
        return this._disabled;
    }

    @Input()
    public set active(selectedItems: Array<any>) {
        if (!selectedItems || selectedItems.length === 0) {
            this._active = [];
        } else {
            const areItemsStrings = typeof selectedItems[0] === 'string';

            if (selectedItems.map) {
                this._active = selectedItems.map((item: any) => {
                    const data = areItemsStrings
                        ? item
                        : { id: item[this.idField], text: item[this.textField] };

                    return new SelectItem(data);
                });
            }
        }
        this.sub.next('active');
    }

    @Output() public data: EventEmitter<any> = new EventEmitter();
    @Output() public selected: EventEmitter<any> = new EventEmitter();
    @Output() public removed: EventEmitter<any> = new EventEmitter();
    @Output() public typed: EventEmitter<any> = new EventEmitter();

    public childrenOptions: Array<SelectItem> = [];
    public options: Array<SelectItem> = [];
    public itemObjects: Array<SelectItem> = [];
    public activeOption: SelectItem;
    public activeParentOption: SelectItem;
    public element: ElementRef;
    public floatMode: boolean;

    public get active(): Array<any> {
        return this._active;
    }

    private inputMode: boolean = false;
    private optionsOpened: boolean = false;
    private behavior: OptionsBehavior;
    private inputValue: string = '';
    private _items: Array<any> = [];
    private _disabled: boolean = false;
    private _active: Array<SelectItem> = [];
    private searchText: string = '';
    private searchTimeout: any = 0;

    public constructor(element: ElementRef) {
        this.element = element;
        this.clickedOutside = this.clickedOutside.bind(this);
    }

    /**
     * Implements ControlValueAccessor
     */
    writeValue(value: any) {
        this.active = value;
    }
    registerOnChange(fn: any) {
        this._onChangeCallback = fn;
    }
    registerOnTouched(fn: any) {
        this._onTouchedCallback = fn;
    }
    _onChangeCallback(_: any) { }
    _onTouchedCallback() { }

    public inputEvent(e: any, isUpMode: boolean = false): void {
        // tab
        if (e.keyCode === 9) {
            if (this.optionsOpened) {
                this.inputMode = false;
                this.optionsOpened = false;
            }
            return;
        }
        if (isUpMode && (e.keyCode === 37 || e.keyCode === 39 || e.keyCode === 38 ||
            e.keyCode === 40 || e.keyCode === 13)) {
            e.preventDefault();
            return;
        }
        // backspace
        if (!isUpMode && e.keyCode === 8) {
            const el: any = this.element.nativeElement
                .querySelector('div.ui-select-container > input');
            if (!el.value || el.value.length <= 0) {
                if (this.active.length > 0) {
                    this.remove(this.active[this.active.length - 1]);
                }
                e.preventDefault();
            }
        }
        // esc
        if (!isUpMode && e.keyCode === 27) {
            this.hideOptions();
            this.element.nativeElement.children[0].focus();
            e.preventDefault();
            return;
        }
        // del
        if (!isUpMode && e.keyCode === 46) {
            if (this.active.length > 0) {
                this.remove(this.active[this.active.length - 1]);
            }
            e.preventDefault();
        }
        // left
        if (!isUpMode && e.keyCode === 37 && this._items.length > 0) {
            this.behavior.first();
            e.preventDefault();
            return;
        }
        // right
        if (!isUpMode && e.keyCode === 39 && this._items.length > 0) {
            this.behavior.last();
            e.preventDefault();
            return;
        }
        // up
        if (!isUpMode && e.keyCode === 38) {
            this.behavior.prev();
            e.preventDefault();
            return;
        }
        // down
        if (!isUpMode && e.keyCode === 40) {
            this.behavior.next();
            e.preventDefault();
            return;
        }
        // enter
        if (!isUpMode && e.keyCode === 13) {
            this.selectActiveMatch();
            this.behavior.next();
            e.preventDefault();
            return;
        }
        const target = e.target || e.srcElement;
        setTimeout(() => {
            if (e.srcElement && e.srcElement.value) {
                this.inputValue = target.value;
                this.behavior.filter(new RegExp(escapeRegexp(this.inputValue), 'ig'));
                this.doEvent('typed', this.inputValue);
            } else {
                this.open();
            }
        }, 0);
        if (window.screen.width > 768 && isUpMode) {
            const el: any = this.element.nativeElement
                .querySelector('div.ui-select-container > input');
            this.floatMode = el.value.length ? false : true;
        }
    }

    public ngOnInit(): any {
        this.behavior = (this.hasChildren) ?
            new ChildrenBehavior(this) : new GenericBehavior(this);
            this.setActive();
    }

    public ngAfterViewInit(): any {
        if (window.screen.width > 768) {
            this.floatMode = true;
        }
    }

    public remove(item: SelectItem): void {
        if (item === this.activeOption && window.screen.width > 768) {
            this.floatMode = true;
        }
        if (this._disabled === true) {
            return;
        }
        if (this.multiple === true && this.active) {
            const index = this.active.indexOf(item);
            this.active.splice(index, 1);
            this.data.next(this.active);
            this.doEvent('removed', item);
        }
        if (this.multiple === false) {
            this.active = [];
            this.inputValue = '';
            this.data.next(this.active);
            this.doEvent('removed', item);
        }
    }

    public doEvent(type: string, value: any): void {
        if ((this as any)[type] && (this as any)[type].next && value) {
            (this as any)[type].next(value);
        }

        if (type === 'selected' || type === 'removed') {
            this._onTouchedCallback();
            this._onChangeCallback(this.active);
        }
    }

    public clickedOutside(): void {
        this.inputMode = false;
        this.optionsOpened = false;
        if (window.screen.width > 768) {
            this.floatMode = true;
        }
    }

    public get firstItemHasChildren(): boolean {
        return this.itemObjects[0] && this.itemObjects[0].hasChildren();
    }

    protected matchClick(e: any): void {
        if (this._disabled === true) {
            return;
        }
        if (this.autocomplete === true) {
            this.inputMode = !this.inputMode;
            if (this.inputMode === true && ((this.multiple === true && e) || this.multiple === false)) {
                this.focusToInput();
                this.open();
            }
        } else {
            if ((this.multiple === true && e) || this.multiple === false) {
            }
            this.focusToInput();
            this.open();
        }
    }

    protected mainClick(event: any): void {
        if (this.inputMode === true || this._disabled === true) {
            return;
        }
        if (event.keyCode === 46) {
            event.preventDefault();
            this.inputEvent(event);
            return;
        }
        if (event.keyCode === 8) {
            event.preventDefault();
            this.inputEvent(event, true);
            return;
        }
        if (event.keyCode === 13 ||
            event.keyCode === 27 || (event.keyCode >= 37 && event.keyCode <= 40)) {
            event.preventDefault();
            return;
        }
        this.multiple ? this.inputMode = true : this.inputMode = this.autocomplete;
        if (this.autocomplete === false && this.multiple === false) {
            const keyCode = event.keyCode;
            if ((keyCode >= 65 && keyCode <= 90) || (keyCode >= 97 && keyCode <= 122)) {
                clearTimeout(this.searchTimeout);
                this.searchText += event.key;
                const opt = this.options.find(el => {
                    const text = el.text.toLowerCase();
                    return text.startsWith(this.searchText.toLowerCase());
                });
                if (opt) {
                    this.activeOption = opt;
                    this.behavior.updateHighlighted();
                }
                this.searchTimeout = setTimeout(() => {
                    this.searchText = '';
                }, 1000);
            }
            return;
        }
        let value = String
            .fromCharCode(96 <= event.keyCode && event.keyCode <= 105 ? event.keyCode - 48 : event.keyCode)
            .toLowerCase();
        if (event.keyCode === 9) {
            value = '';
        }
        this.focusToInput(value);
        this.open();
        const target = event.target || event.srcElement;
        target.value = value;
        if (event.keyCode !== 9) {
            this.inputEvent(event);
        }
    }

    protected selectActive(value: SelectItem): void {
        this.activeOption = value;
    }

    protected isActive(value: SelectItem): boolean {
        return this.activeOption.text === value.text;
    }
    /**
     * 添加二级下拉的内容
     *
     * @protected
     * @param {SelectItem} value
     * @memberof SelectComponent
     */
    protected selectParentActive(value: SelectItem): void {
        this.activeParentOption = value;
        if (value.children.length > 0) {
            this.childrenOptions = value.children;
        } else {
            this.childrenOptions = [];
        }
    }

    protected isParentActive(value: SelectItem): boolean {
        if (this.activeParentOption && this.activeParentOption.text) {
            return this.activeParentOption.text === value.text;
        } else {
            return false;
        }
    }


    private focusToInput(value: string = ''): void {
        setTimeout(() => {
            const el = this.element.nativeElement.querySelector('div.ui-select-container > input');
            if (el) {
                el.focus();
                el.value = value;
            }
        }, 0);
    }

    private open(): void {
        this.refreshOptions();
        this.optionsOpened = true;
    }

    private refreshOptions(): void {
        this.options = this.itemObjects
            .filter((option: SelectItem) => (this.multiple === false ||
                this.multiple === true &&
                !this.active.find((o: SelectItem) => option.text === o.text)));

        if (this.options.length > 0 && this.behavior) {
            this.behavior.first();
        }
    }

    private hideOptions(): void {
        this.inputMode = false;
        this.optionsOpened = false;
    }

    private selectActiveMatch(): void {
        this.selectMatch(this.activeOption);
    }

    /**
     * 点击选择后
     *
     * @private
     * @param {SelectItem} value
     * @param {Event} [e=void 0]
     * @returns {void}
     * @memberof SelectComponent
     */
    private selectMatch(value: SelectItem, e: Event = void 0): void {
        console.log(value);
        // disabled 就直接return
        if (value && value.disabled && value.disabled === true) {
            console.log(value.disabled);
            return;
        }
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        if (this.options.length <= 0) {
            return;
        }
        if (this.multiple === true) {
            this.active.push(value);
            this.data.next(this.active);
        }
        if (this.multiple === false) {
            if (this.hasChildren) {
                value.parent = this.activeParentOption;
            }
            this.active[0] = value;
            this.inputValue = value.text;
            this.data.next(this.active[0]);
        }
        this.doEvent('selected', value);
        this.hideOptions();
        if (this.multiple === true) {
            this.focusToInput('');
        } else {
            this.focusToInput(stripTags(value.text));
            this.element.nativeElement.querySelector('.ui-select-container').focus();
        }
    }
    setActive() {
        if (this.isMatchUnit) {
            this.sub.debounceTime(80).subscribe((x) => {
                if (this.itemObjects && this.itemObjects.length > 0 && this.active && this.active.length > 0) {
                    console.log(this.itemObjects);
                    console.log(this.active);
                    this.itemObjects.forEach((item, index) => {
                        if (item.id === this.active[0].id) {
                            this.active[0].text = item.text;
                        }
                    });

                }
                if (this.active && this.active.length > 0 && this.active[0].text) {
                    this.focusToInput(this.active[0].text);

                }
            });
        } else {

        }

    }


}

export class Behavior {
    public optionsMap: Map<string, number> = new Map<string, number>();

    public actor: SelectComponent;
    public constructor(actor: SelectComponent) {
        this.actor = actor;
    }

    public fillOptionsMap(): void {
        this.optionsMap.clear();
        let startPos = 0;
        this.actor.itemObjects
            .map((item: SelectItem) => {
                startPos = item.fillChildrenHash(this.optionsMap, startPos);
            });
    }

    public ensureHighlightVisible(optionsMap: Map<string, number> = void 0): void {
        const container = this.actor.element.nativeElement.querySelector('.ui-select-choices');
        // let container = this.actor.element.nativeElement.querySelector('.ui-select-choices-content');
        if (!container) {
            return;
        }
        const choices = container.querySelectorAll('.ui-select-choices-row');
        if (choices.length < 1) {
            return;
        }
        const activeIndex = this.getActiveIndex(optionsMap);
        if (activeIndex < 0) {
            return;
        }
        const highlighted: any = choices[activeIndex];
        if (!highlighted) {
            return;
        }
        const posY: number = highlighted.offsetTop + highlighted.clientHeight - container.scrollTop;
        const height: number = container.offsetHeight;
        if (posY > height) {
            container.scrollTop += posY - height;
        } else if (posY < highlighted.clientHeight) {
            container.scrollTop -= highlighted.clientHeight - posY;
        }
    }

    private getActiveIndex(optionsMap: Map<string, number> = void 0): number {
        let ai = this.actor.options.indexOf(this.actor.activeOption);
        if (ai < 0 && optionsMap !== void 0) {
            ai = optionsMap.get(this.actor.activeOption.id);
        }
        return ai;
    }
}

export class GenericBehavior extends Behavior implements OptionsBehavior {
    public constructor(actor: SelectComponent) {
        super(actor);
    }

    public first(): void {
        this.actor.activeOption = this.actor.options[0];
        super.ensureHighlightVisible();
    }

    public last(): void {
        this.actor.activeOption = this.actor.options[this.actor.options.length - 1];
        super.ensureHighlightVisible();
    }

    public prev(): void {
        const index = this.actor.options.indexOf(this.actor.activeOption);
        this.actor.activeOption = this.actor
            .options[index - 1 < 0 ? this.actor.options.length - 1 : index - 1];
        super.ensureHighlightVisible();
    }

    public next(): void {
        const index = this.actor.options.indexOf(this.actor.activeOption);
        this.actor.activeOption = this.actor
            .options[index + 1 > this.actor.options.length - 1 ? 0 : index + 1];
        super.ensureHighlightVisible();
    }

    public updateHighlighted(): void {
        super.ensureHighlightVisible();
    }

    public filter(query: RegExp): void {
        const options = this.actor.itemObjects
            .filter((option: SelectItem) => {
                return stripTags(option.text).match(query) &&
                    (this.actor.multiple === false ||
                        (this.actor.multiple === true && this.actor.active.map((item: SelectItem) => item.id).indexOf(option.id) < 0));
            });
        this.actor.options = options;
        if (this.actor.options.length > 0) {
            this.actor.activeOption = this.actor.options[0];
            super.ensureHighlightVisible();
        }
    }
}

export class ChildrenBehavior extends Behavior implements OptionsBehavior {
    public constructor(actor: SelectComponent) {
        super(actor);
    }

    public first(): void {
        this.actor.activeOption = this.actor.options[0].children[0];
        this.fillOptionsMap();
        this.ensureHighlightVisible(this.optionsMap);
    }

    public last(): void {
        this.actor.activeOption =
            this.actor
                .options[this.actor.options.length - 1]
                .children[this.actor.options[this.actor.options.length - 1].children.length - 1];
        this.fillOptionsMap();
        this.ensureHighlightVisible(this.optionsMap);
    }

    public prev(): void {
        const indexParent = this.actor.options
            .findIndex((option: SelectItem) => this.actor.activeOption.parent && this.actor.activeOption.parent.id === option.id);
        const index = this.actor.options[indexParent].children
            .findIndex((option: SelectItem) => this.actor.activeOption && this.actor.activeOption.id === option.id);
        this.actor.activeOption = this.actor.options[indexParent].children[index - 1];
        if (!this.actor.activeOption) {
            if (this.actor.options[indexParent - 1]) {
                this.actor.activeOption = this.actor
                    .options[indexParent - 1]
                    .children[this.actor.options[indexParent - 1].children.length - 1];
            }
        }
        if (!this.actor.activeOption) {
            this.last();
        }
        this.fillOptionsMap();
        this.ensureHighlightVisible(this.optionsMap);
    }

    public next(): void {
        const indexParent = this.actor.options
            .findIndex((option: SelectItem) => this.actor.activeOption.parent && this.actor.activeOption.parent.id === option.id);
        const index = this.actor.options[indexParent].children
            .findIndex((option: SelectItem) => this.actor.activeOption && this.actor.activeOption.id === option.id);
        this.actor.activeOption = this.actor.options[indexParent].children[index + 1];
        if (!this.actor.activeOption) {
            if (this.actor.options[indexParent + 1]) {
                this.actor.activeOption = this.actor.options[indexParent + 1].children[0];
            }
        }
        if (!this.actor.activeOption) {
            this.first();
        }
        this.fillOptionsMap();
        this.ensureHighlightVisible(this.optionsMap);
    }

    public updateHighlighted(): void {
        super.ensureHighlightVisible();
    }

    public filter(query: RegExp): void {
        const options: Array<SelectItem> = [];
        const optionsMap: Map<string, number> = new Map<string, number>();
        let startPos = 0;
        for (const si of this.actor.itemObjects) {
            let children: Array<SelectItem> = [];
            if (si.children && si.children.length > 0) {
                children = si.children.filter((option: SelectItem) => query.test(option.text));
            }
            startPos = si.fillChildrenHash(optionsMap, startPos);
            if (children.length > 0) {
                const newSi = si.getSimilar();
                newSi.children = children;
                options.push(newSi);
            }
        }
        this.actor.options = options;
        if (this.actor.options.length > 0) {
            this.actor.activeOption = this.actor.options[0].children[0];
            super.ensureHighlightVisible(optionsMap);
        }
    }


    //     <div *ngIf="isParentActive(c)" class="children-float">
    //     <div *ngFor="let o of c.children; let childIndex = index"
    //      class="ui-select-choices-row"
    //      [class.option-active]="isActive(o)"
    //      (mouseenter)="selectActive(o)"
    //      (click)="selectMatch(o, $event)"
    //      [ngClass]="{'active': isActive(o)}">
    //         <div class="option-divider" *ngIf="childIndex > 0"></div>
    //         <div class="children-options">
    //             <a class="dropdown-item">
    //                 <div [innerHtml]="o.text | highlight:inputValue"></div>
    //             </a>
    //         </div>
    //     </div>
    // </div>


}
