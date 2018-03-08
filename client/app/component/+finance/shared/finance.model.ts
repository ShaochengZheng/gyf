import { AccountBookSettingModel } from './../../../api/accounting/model/AccountBookSettingModel';
import { AccountModel } from '../../../api/accounting/model/AccountModel';
import { JournalEntryLineItemModel } from '../../../api/accounting/model/JournalEntryLineItemModel';
/**
 * 科目列表
 */
export interface AccountModels extends AccountModel {
    /**
     * 是否显示
     */
    isExpansion?: boolean;
    /**
     * 箭头方向
     */
    directionOfArrow?: boolean;
    /**
     * 合计金额
     */
    totalAmount?: number;
    /**
     *
     *
     * 是否为0
     */
    whetherTo0?: boolean;

}
/**
 * 合计
 */
export interface Total {
    name?: string;
    value?: string;
    money?: any;
    whetherTo0?: boolean;
}



export interface JournalEntryLineItemModels extends JournalEntryLineItemModel {
    /**
     * 借金额
     */
    debitAmount?: boolean;
    /**
     * 贷金额
     */
    creditAmount?: boolean;
    /**
     * 借金额字符拆分数组
     */
    debitAmountList?: Array<any>;
    /**
     * 贷金额字符拆分数组
     */
    creditAmountList?: Array<any>;
    /**
     * 借金额显示状态
     */
    debitstatus?: boolean;
    /**
     * 贷金额显示状态
     */
    creditstatus?: boolean;
    /**
     * 需要科目
     */
    needAccountCode?: boolean;
    /**
     * 需要摘要
     */
    needSummary?: boolean;
}

export interface AccountBookForCarryModel extends AccountBookSettingModel {

    /**
     * 状态
     */
    strStatus?: string;
    /**
     * 是否可点击
     */
    isClickable?: boolean;
    /**
     * 按钮文字
     */
    btnStatus?: string;
}


