import { InvoiceItemModel } from '../../../api/accounting/model/InvoiceItemModel';
export interface InvoiceItemModels extends InvoiceItemModel {
    /**
     * 税额
     */
    taxAmount?: number;
    /**
     * 不含税金额
     */
    amountWithoutTax?: number;
}