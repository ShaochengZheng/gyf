import { EmployeeStatusEnumModel } from './../../../api/accounting/model/EmployeeStatusEnumModel';
import { PersonalAccountTypeEnumModel } from './../../../api/accounting/model/PersonalAccountTypeEnumModel';
import { GenderEnumModel } from './../../../api/accounting/model/GenderEnumModel';
import { DepartmentTypeEnumModel } from './../../../api/accounting/model/DepartmentTypeEnumModel';


/**
 * 员工信息
 */
export class StuffModel {

    /**
     * id
     */
    id?: string = '';

    /**
     * 编号
     */
    number?: string = '';

    /**
     * 名
     */
    name?: string = '';

    /**
     * 职位
     */
    position?: string = '';

    /**
     * 身份证号
     */
    idNo?: string = '';

    /**
     * 年龄
     */
    birthDate?: Date = new Date();

    /**
     * 入职时间
     */
    joinedDate?: Date = new Date();

    /**
     * 国籍 id为code name为名
     */
    national = { id: 'CN', text: '中国' };

    /**
     * 部门类型 0 无 1 销售 2 管理
     */
    departmentType?= { id: DepartmentTypeEnumModel.ValueEnum.None, text: '' };

    /**
     * 社会保险
     */
    hasSocialSecurity?: boolean = false;

    /**
     * 性别 无0 男1 女2
     */
    gender = { id: GenderEnumModel.ValueEnum.Male, text: '男' };

    /**
     * 股权 个人股本（投资）额？
     */
    shareCapital?: number = 0;

    /**
     * 工作单位
     */
    companyName?: string = '';

    /**
     * 户口性质 - 农业1 非农业2
     */
    accountNature = { id: PersonalAccountTypeEnumModel.ValueEnum.Agricultural, text: '农业' };

    /**
     * 
     */
    phoneNumber?: string = '';

    /**
     * 
     */
    email?: string = '';

    /**
     * 是否为孤老
     */
    remainsElderly?: string = '';

    /**
     * 住房公积金
     */
    hasHousingFund?: boolean = false;

    /**
     * 状态 正常0 离职1
     */
    status = { id: EmployeeStatusEnumModel.ValueEnum.Normal, text: '正常' };

    /**
     * 合同类型-是否为雇员
     */
    contractType?: string = '';

    /**
     * 地址
     */
    address?: string = '';

    /**
     * 基本工资
     */
    baseSalary?: number = 0;

    /**
     * 岗位工资
     */
    positionSalary?: number = 0;

    /**
     * 开户银行
     */
    bankType?: string = '';

    /**
     * 银行账号
     */
    bankAccount?: string = '';

    /**
     * 医疗保险基数
     */
    medicalInsuranceBase?: number = 0;

    /**
     * 养老保险基数
     */
    oldAgeInsuranceBase?: number = 0;

    /**
     * 公积金基数
     */
    providentFundBase?: number = 0;

    /**
     * 个人医疗保险
     */
    pEdicalCare?: number = 0;

    /**
     * 个人养老保险
     */
    pPension?: number = 0;

    /**
     * 个人失业保险
     */
    pUnemployment?: number = 0;

    /**
     * 个人公积金
     */
    pProvidentFund?: number = 0;

    /**
     * 公司医疗保险
     */
    cEdicalCare?: number = 0;

    /**
     * 公司养老保险
     */
    cPension?: number = 0;

    /**
     * 公司失业保险
     */
    cUnemployment?: number = 0;

    /**
     * 公司公积金
     */
    cProvidentFund?: number = 0;

    /**
     * 公司生育
     */
    cFertility?: number = 0;

    /**
     * 公司工伤
     */
    cWorkInjury?: number = 0;
}
