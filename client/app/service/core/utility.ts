import { Injectable } from '@angular/core';
import * as _ from 'lodash';

@Injectable()
export class UtilityService {

    tempValue: Object = {};

    // get selected item
    getSelectedItem(list, attr?) {
        if (!attr) {
            attr = 'selected';
        }
        return _.filter(list, function (item) {
            return item[attr] === true;
        });
    }

    // get selected item
    getSelectedIds(list) {
        const ids = [];
        _.forEach(this.getSelectedItem(list), function (item: any) {
            ids.push(item.id);
        });
        return ids;
    }

    // trigger selected status
    triggerSelect(list, item?, attr?) {
        if (!attr) {
            attr = 'selected';
        }
        if (list) {
            const selectedItems = this.getSelectedItem(list, attr);
            if (selectedItems.length < list.length) {
                if (item) {
                    list[attr] = false;
                } else {
                    // tslint:disable-next-line:no-shadowed-variable
                    _.forEach(list, function (item) {
                        item[attr] = true;
                    });
                }
            } else {
                if (item) {
                    list[attr] = true;
                } else {
                    // tslint:disable-next-line:no-shadowed-variable
                    _.forEach(list, function (item) {
                        item[attr] = false;
                    });
                }
            }
        }
    }

    toDecimal(num) {
        return Math.round(num * 100) / 100;
    }

    // add float num, fix js float num precision bug
    floatNumAdd() {
        let result = arguments[0];
        const len = arguments.length;
        let i;
        for (i = 1; i < len; i++) {
            result = ((parseFloat(result) || 0) * 100 + (parseFloat(arguments[i]) || 0) * 100) / 100;
        }
        return Math.round(result * 100) / 100;
    }

    // subtract float num, fix js float num precision bug
    floatNumSubtract() {
        let result = arguments[0];
        const len = arguments.length;
        let i;
        for (i = 1; i < len; i++) {
            result = ((parseFloat(result) || 0) * 100 - (parseFloat(arguments[i]) || 0) * 100) / 100;
        }
        return Math.round(result * 100) / 100;
    }

    floatNumDivide(dividend, divisor, precision) {
        precision = precision || 2;
        dividend = parseFloat(dividend) * 100 || 0;
        divisor = parseFloat(divisor) * 100;
        if (divisor === 0) {
            return 0;
        }
        return Number((dividend / divisor).toFixed(precision));
    }

    floatNumMultiply(num1, num2, precision) {
        precision = precision || 2;
        num1 = parseFloat(num1) || 0;
        num2 = parseFloat(num2) || 0;
        return Number(num1 * num2).toFixed(precision);
    }

    floatNumFixed(num, precision) {
        if (precision === 'undefined') {
            precision = 2;
        }
        return parseFloat(num).toFixed(precision);
    }

    setTempValue(key, value) {
        this.tempValue[key] = value;
    }
    getTempValue(key) {
        return this.tempValue[key];
    }
    clearTempValue(key) {
        delete this.tempValue[key];
    }
    /**
     * 金额反格式化
     *
     * @param {any} val
     * @returns
     * @memberof OutcomeComponent
     */
    reverseFormat(val: any): number {
        val = val.toString();
        console.warn(val);
        if (val === 0 || val === '0' || val === '0.00' || val === '-') {
            return 0.00;
        }
        val = parseFloat(val.replace(/[^\d\.-]/g, ''));
        return val;
    }

}
