/**
 * Created by wzm on 2017/7/13.
 */
import { Component, OnInit} from '@angular/core';
import * as _ from 'lodash';
import { AuthorizationService } from '../../../service/core';
import { ChartService } from '../shared/chart.service';
import { AccountApi } from '../../../api/accounting/api/AccountApi';
import { ChartApi } from './../../../api/accounting/api/ChartApi';
import { GeneralChartSettingModel } from './../../../api/accounting/model/GeneralChartSettingModel';


@Component({
    selector: 'valueAdded-general',
    templateUrl: './valueAdded-general.component.html',
    styleUrls: ['valueAdded-general.component.scss', '../sharedStyle.component.scss'],
    providers: [ChartService],
})
export class ValueAddedGeneralComponent implements OnInit {
    // 搜索条件
    searchObject: any = {
        year: '',
        month: 0,
    };
    session:any;
    dataList: any = {};
    taxDate: string;
    monthList = [
        { month: '1月', number: 1, isExist: false },
        { month: '2月', number: 2, isExist: false },
        { month: '3月', number: 3, isExist: false },
        { month: '4月', number: 4, isExist: false },
        { month: '5月', number: 5, isExist: false },
        { month: '6月', number: 6, isExist: false },
        { month: '7月', number: 7, isExist: false },
        { month: '8月', number: 8, isExist: false },
        { month: '9月', number: 9, isExist: false },
        { month: '10月', number: 10, isExist: false },
        { month: '11月', number: 11, isExist: false },
        { month: '12月', number: 12, isExist: false }
    ];

    isChecked: any; // 点击月份样式效果

    searchModel = _.cloneDeep(this.searchObject);
    getAccountPeriod() {
        this.accountApi.accountAccountPeriod()
            .subscribe(
                accountPeriodModel => {
                    if (accountPeriodModel) {
                        this.searchModel.year = accountPeriodModel.currentYear;
                        this.searchModel.month = accountPeriodModel.currentMonth;
                        this.search();
                        let tempYearList = _.find(accountPeriodModel.accountHistoryPeriods,(item)=>{
                            return item.year === accountPeriodModel.currentYear;
                        });
                        if (tempYearList && tempYearList.months && tempYearList.months.length > 0) {
                            _.forEach(tempYearList.months, item => {
                                let index = this.monthList.findIndex((value) => value.number === item);
                                this.monthList[index].isExist = true;
                            });
                            if (this.searchModel.month > 0) {
                                let initIndex = this.monthList.findIndex((value) => value.number === this.searchModel.month);
                                this.isChecked = initIndex;
                            }
                        }
                    } else {
                    }
                },

                (error) => {
                    console.log(error);
                });
    }

    constructor(private chartService: ChartService, private accountApi: AccountApi,private authorizationService:AuthorizationService ,private chartApi:ChartApi) {
    }

    ngOnInit() {
        this.getAccountPeriod();
        console.log('ContactsDetailComponent');
        this.session=this.authorizationService.getSession();
    }
    // 列表搜索
    search() {
        console.log(this.searchModel);
        this.chartService.getGeneraVat(this.searchModel.year, this.searchModel.month)
            .then(
                assetsChartModel => {
                    this.dataList = assetsChartModel;
                    let day = new Date(this.dataList.year, this.dataList.month, 0);
                    this.taxDate = this.dataList.year + '-' + this.dataList.month + '-' + day.getDate();
                    console.log('列表搜索===》》》', this.taxDate);
                },
                error => {
                    console.log(error);
                }
            );
    }
    monthSearch(item, index) {
        console.log('monthSearch', item, index);
        this.isChecked = index;
        this.searchModel.month = item.number;
        this.search();
        console.log('月份搜索！！！');
    }
    updateChart(item){
        console.log('updateChart', item);
        // 准备model
        let model: GeneralChartSettingModel = {
            chartName: GeneralChartSettingModel.ChartNameEnum.GeneralValueAddedTaxChart,
            order: item.order,
            value: item.genaralCurrentMonthAmount,
            accountPeriodYear: this.searchModel.year,
            accountPeriodMonth: this.searchModel.month
        };
        this.chartService.postVatGenerate(model).then(data => {
            console.log(data);
            //更新成功，刷新数据
            if (data) {
                this.search();
            }
        }).catch(error => {
            console.log(error);
        });

    }
}
