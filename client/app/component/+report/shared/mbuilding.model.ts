import { BuildingTaxModel } from '../../../api/accounting/model/BuildingTaxModel';

export interface MbuildingModel extends BuildingTaxModel {
    /**
     * 一般增值税 ,
     */
    sumGeneralVAT?: number;
    /**
     * 一般增值税 ,
     */
    sumExpessVAT?: number;
    /**
     * 消费税 ,
     */
    sumCoumptionTax?: number;
    /**
     * 营业税 ,
     */
    sumBusinessTax?: number;
    /**
     * 合计 ,
     */
    sumSum?: number;
    /**
     * 税率 ,
     */
    sumTaxRate?: number;
    /**
     * 本期应纳税额 ,
     */
    sumDutiableTax?: number;
    /**
     * 减免性质代码 ,
     */
    sumReductionCode?: number;
    /**
     * 减免额 ,
     */
    sumIncomeRelief?: number;
    /**
     * 本期已缴税（费）额  ,
     */
    sumPaidTax?: number;
    /**
     *  本期应补（退）税（费）额 ,
     */
    sumAmountOfDuePaid?: number;
}
