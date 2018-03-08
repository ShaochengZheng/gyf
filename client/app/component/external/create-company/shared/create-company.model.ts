import { AccountBookModel } from '../../../../api/accounting/model/AccountBookModel';


export interface CreateCompany extends AccountBookModel{
  needName: boolean;
  needlegalPersonName: boolean;
  needRegisteredCapital:boolean;
  needProvince: boolean;
  needCity: boolean;
  needArea: boolean;
  needCompanyProperty:boolean;
  needBusinessEndDate:boolean;
  needTaxNumber:boolean;
  needIndustry:boolean;
  // id: string;
  // companyName: string;
  // legalPersonName: string;
  // registeredCapital: number;
  // address: string;
  // businessEndDate: Date;
  // taxNumber: string;
  // companyProperty: string;
  // industry: {
  //   id: string;
  //   name: string
  // };
}
