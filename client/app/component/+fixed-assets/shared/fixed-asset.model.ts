import { DepreciationCategoryModel } from './../../../api/accounting/model/DepreciationCategoryModel';
import { FixedAssetModel } from './../../../api/accounting/model/FixedAssetModel';


export interface MFixedAssetModel {
    /**
     * 标签
     */
    addTagList?: Array<any>;
    /**
     * 附件数据
     */
    attachmentList?: Array<any>;

    /**
     * 部门选择框绑定
     */
    currentDepartment?: Array<any>;

    /**
     * 分类选择框绑定
     */
    currentCatory?: Array<any>;

    /**
     * 往来选择绑定
     */
    currentContact?: Array<any>;
    /**
     * 税率选择绑定
     */
    currentTax?: Array<any>;
    /**
     * 进销税类别选择绑定
     */
    currentTaxCategory?: Array<any>;
    /**
     * 发票选择绑定
     */
    currentInvoiceType?: Array<any>;
    /**
     * 资产model
     */
    fixedAsset?: FixedAssetModel;
    /**
     * 是否来源起初
     */
    isFromBeginPeroid?: boolean;
    /**
     * 是否可编辑
     */
    isEditable?: boolean;
}

/**
 *  资产类别model
 */
export interface AssetCategoryModel extends DepreciationCategoryModel {
    text?: string;
}

export interface ValidateModel {
    /**
     * 日期验证
     */
    dateValid: boolean;
    /**
     * 对方信息
     */
    contactValid: boolean;
    /**
     * 记账日
     */
    bookDateValid: boolean;
    /**
     * 部门性质
     */
    departmentValid: boolean;
    /**
     * 姓名
     */
    nameValid: boolean;
    /**
     * 分类
     */
    categoryValid: boolean;
    /**
     * 数量
     */
    qulityValid: boolean;
    /**
     * 金额
     */
    amountValid: boolean;
    /**
     * 税率验证
     */
    taxValid: boolean;
    /**
     * 进销税类别
     */
    taxCategoryValid: boolean;
    /**
     * 发票类型
     */
    invoiceTypeValid: boolean;
    /**
     * 发票号
     */
    invoiceNumberValid: boolean;
    /**
     * 是否可用
     */
    valid: boolean;
}
