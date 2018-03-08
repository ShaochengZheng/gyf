import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { IndustryApi } from '../../../../api/accounting/api/IndustryApi';


import { CreateCompany } from './create-company.model';

@Injectable()
export class CreateCompanyService {

    constructor(private http: Http, private industryApi: IndustryApi) { }

    getList(): Observable<CreateCompany[]> {
        return this.http.get('/api/list').map(res => res.json() as CreateCompany[]);
    }

    getIndustryList() {
        this.industryApi.industryGet()
            .subscribe(
            data => {
                let i = 0;
                let temp = [];
                let dataTemp: any = data;
                for (i = 0; i < dataTemp.length; i++) {
                    temp[i] = ({ id: dataTemp[i].code, text: data[i].name });
                }
                // this.industryList = temp;
                // return temp;
            },
            error => {
                console.log('error', error);
                // return error;
            }
            );
    }


    
}