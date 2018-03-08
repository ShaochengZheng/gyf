import { Injectable, PipeTransform, Pipe } from '@angular/core';

@Pipe({ name: 'companyProperty' })
@Injectable()
export class CompanyPropertyPipe implements PipeTransform {
    transform(value: any): string {
        if (value === 'SmallScale') {
            return '小规模纳税人';
        } else if (value === 'GeneralTaxpayer') {
            return '一般纳税人';
        } else {
            return '未知';
        }
    }
}
