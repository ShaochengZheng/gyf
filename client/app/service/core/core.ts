import { OpaqueToken } from '@angular/core';

export const MOBILE_WEB_URL = new OpaqueToken('mobileWebUrl');

export enum OperationModeEnum {
    View = 1,
    New = 2,
    Update = 3,
    Delete = 4
}

// tslint:disable-next-line:variable-name
export const DatePickerZHCN = {
    closeText: '关闭',
    prevText: '&#x3C;',
    nextText: '&#x3E;',
    currentText: '今天',
    monthNames: ['一月', '二月', '三月', '四月', '五月', '六月',
        '七月', '八月', '九月', '十月', '十一月', '十二月'],
    monthNamesShort: ['一月', '二月', '三月', '四月', '五月', '六月',
        '七月', '八月', '九月', '十月', '十一月', '十二月'],
    dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
    dayNamesShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
    dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
    weekHeader: '周',
    dateFormat: 'yy-mm-dd',
    firstDay: 1,
    isRTL: false,
    showMonthAfterYear: true,
    yearSuffix: '年',
    yearRange:'1950:2018'
};
