import { PayrollModel } from './../../../api/accounting/model/PayrollModel';

export interface SalaryModel extends PayrollModel {
    /**
     * 基本工资总和
     */
    sumBasicSalary?: number;
    /**
     * 岗位工资总和
     */
    sumPosiSalary?: number;
    /**
     * 餐补总和
     */
    sumFoodSubsidy?: number;
    /**
     * 交通补助总和
     */
    sumTransSubsidy?: number;
    /**
     * 其他补助总和
     */
    sumOtherSubsidy?: number;
    /**
     * 奖金总和
     */
    sumBonus?: number;
    /**
     * 绩效总和
     */
    sumPerformance: number;
    /**
     * 调整工资总和
     */
    sumChangeSalary?: number;
    /**
     * 合计工资总和
     */
    sumTotalSalary?: number;
    /**
     * 个人社保总和
     */
    sumPSocialSecurity?: number; // 废弃替换成3个，个人社保
    /**
     * 个人医疗总和
     */
    sumPMedical?: number;
    /**
     * 个人养老总和
     */
    sumPOldage?: number;
    /**
     * 个人失业总和
     */
    sumPUnemployment?: number;
    /**
     * 个人公积金总和
     */
    sumPProvidenetFund?: number;
    /**
     * 个税总和
     */
    sumPTax?: number;
    /**
     * 实发总和
     */
    sumPSalary?: number;
    /**
     * 公司社保总和
     */
    sumCSocialSecurity?: number; // 废弃
    /**
     * 公司医疗总和
     */
    sumCMedical?: number;
    /**
     * 公司养老总和
     */
    sumCOldage?: number;
    /**
     * 公司失业总和
     */
    sumCUnemployment?: number;
    /**
     *  生育总和
     */
    sumCMaternity?: number;
    /**
     * 工伤社保总和
     */
    sumCWorkInjury?: number;
    /**
     * 公司公积金总和
     */
    sumCProvidentFund?: number;
    /**
     * 人力成本总和
     */
    sumHumanCost?: number;
}

export interface LabourModel extends PayrollModel {
    /**
     * 劳务总和
     */
    sumLaborCost?: number;
    /**
     * 个税总和
     */
    sumPTax?: number;

    /**
     * 实发劳务总和
     */
    sumRealLaborCost?: number;
}
