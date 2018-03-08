import * as moment from 'moment';
import 'moment/locale/zh-cn';

export class DateFormatter {
    public format(date: Date, format: string): string {
        moment.locale('zh-cn');
        return moment(date.getTime()).format(format);
    }
}
