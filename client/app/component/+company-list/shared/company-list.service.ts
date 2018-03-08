import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { AccountBookApi } from '../../../api/accounting/api/AccountBookApi';
import { CompanyList } from './company-list.model';
import * as _ from 'lodash';
import * as moment from 'moment';
@Injectable()
export class CompanyListService {

    constructor(private accountBookApi: AccountBookApi) { }
    //   pageIndex?: string,
    //   pageSize?: string,
    //   year?: number,
    //   month?: number,
    //   keyword?: string,
    accountBookGet(pageIndex?, pageSize?, year?, month?, keyword?, status?, assignStatus?): Promise<CompanyList[]> {
        console.count('获取帐套：');
        return new Promise((resolve, reject) => {
            this.accountBookApi.accountBookGet(pageIndex, pageSize, year, month, keyword, status, assignStatus).subscribe(
                companyList => {
                    let companiesList;
                    if (companyList === null || companyList === undefined) {
                        companiesList = [];
                    } else {
                        companiesList = companyList.list;
                        console.log('companiesList', companiesList, typeof companiesList);
                        _.forEach(companiesList, (item) => {
                            item.currentDate = moment(item.currentDate).format('YYYY-MM-DD');
                            // item.currentDate = temp.substring(0, 10) ;
                        });

                    }
                    resolve(companiesList);

                },
                error => {
                    reject(error);
                    console.error(error);
                    console.error('公司列表的');
                }
            );
        });
    }


}
