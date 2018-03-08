import { RoleModel } from '../../api/accounting/model/RoleModel';
import { AccountPeriodModel } from '../../api/accounting/model/AccountPeriodModel';


/**
 * 角色
 */
export interface RoleModels extends RoleModel {
    /**
     * 是否默认选中
     */
    isisDefault?: boolean;
}
/**
 * 科目表时间
 */
export interface AccountPeriodModels extends AccountPeriodModel {
    /**
     * 年列表
     */
    YearList?: Array<Select>;
    /**
     * 月列表
     */
    MonthsToList?: Array<Select>;

}

export interface Select {
    id?: string;
    text?: string;
}
