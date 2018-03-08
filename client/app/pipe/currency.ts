import { Injectable, PipeTransform, Pipe } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Pipe({ name: 'currency' })
@Injectable()
export class CustomCurrencyPipe extends CurrencyPipe implements PipeTransform {

    /**
     *
     *
     * @param {*} value 传入的值
     * @param {string} [currencyCode]  金额转换类型  人民币为  CNY
     * @param {boolean} [symbolDisplay]  使用货币符号或者文字  默认false   true：$   false ：USD
     * @param {string} [digits]
     * @param {boolean} [conversion=false]   错误或者为0时候 返回 ‘-’ 或者 ‘0.00’  默认false 返回 ‘-’
     * @returns {string}
     *
     * @memberof CustomCurrencyPipe
     */
    transform(value: any, currencyCode?: string, symbolDisplay?: boolean,
        digits?: string, conversion: boolean = false): string {
        if (value === null || value === undefined || isNaN(value) || value === 0) {
            if (conversion) {
                return '-';
            } else {
                return '-';
            }
        } else if (value === '') {
            return '';
        } else {
            const num: number = Number(value);
            let currencyFormat = super.transform(num, currencyCode, symbolDisplay, digits);
            currencyFormat = currencyFormat.replace(/CN/g, '');
            currencyFormat = currencyFormat.replace(/￥/g, '');
            currencyFormat = currencyFormat.replace(/¥/g, '');
            return currencyFormat;
        }

    }
}
