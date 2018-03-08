/**
 * Created by zishaofei on 2017/3/3.
 */
import { Injectable } from '@angular/core';

import { BankAccountApi } from '../../../api/accounting/api/BankAccountApi';
import { ContactApi } from '../../../api/accounting/api/ContactApi';
import { BusinessCategoryApi } from '../../../api/accounting/api/BusinessCategoryApi';
// import { DepartmentApi } from '../../../api/accounting/api/DepartmentApi';
import { TagApi } from '../../../api/accounting/api/TagApi';
import { AccountBookSettingApi } from '../../../api/accounting/api/AccountBookSettingApi';
import * as _ from 'lodash';
import * as moment from 'moment';
@Injectable()
export class DetailService {


	constructor(private bankAccountApi: BankAccountApi, private contactApi: ContactApi,
		private businessCategoryApi: BusinessCategoryApi, private accountBookSettingApi: AccountBookSettingApi,
		private tagApi: TagApi) {

	}

    /**
     * 获取全部账户列表
     *
     */
	public getAccount(): Promise<any> {
		return new Promise((resolve, reject) => {
			this.bankAccountApi.bankAccountGetAll().subscribe(
				bankAccountModel => {
					const dataPush = [];
					_.forEach(bankAccountModel, item => dataPush.push({
						id: item.id,
						name: item.accountName,
						beginDate: item.beginDate
					}));
					dataPush.unshift({ id: 'account', name: '+新增账户' });
					resolve(dataPush);
				},
				error => {
					reject(error);
				}
			);
		});

	}

    /**
     * 获取全部联系人列表
     *
     */
	public getContact(): Promise<any> {
		return new Promise((resolve, reject) => {
			this.contactApi.contactGetAll().subscribe(
				contactModel => {
					const dataPush = [];
					_.forEach(contactModel, item => {
						dataPush.push({ id: item.id, name: item.name });
					});
					dataPush.unshift({ id: 'contact', name: '+新增往来单位/个人' });
					resolve(dataPush);
				},
				error => {
					reject(error);
				}
			);
		});

	}

    /**
     * 获取类别
     *
     * @param {string} [type]  需要获取的类别
     * @returns {Promise<any>}
     *
     * @memberof DetailService
     */
	public getBussinessCategory(type?: string): Promise<any> {
		return this.businessCategoryApi.businessCategoryGetAll(type)
			.toPromise().then(
			data => {
				console.log(data);
				let list: any = data;
				const dataPush = [];
				const children = [];
				const tempList = [];

				_.forEach(list, item => {
					tempList.push(item);
				});
				list = tempList;
				_.forEach(list, item => {
					if (item.level === 1) {
						dataPush.push({
							id: item.id,
							text: item.name,
							children: [{ id: 'businessCategory', text: '+新增类别' }]
						});
					} else {
						children.push(item);
					}
				});
				_.forEach(children, item => {
					let index;
					index = _.findIndex(dataPush, o => o.id === item.parentBusinessCategoryModelId);
					if (index !== -1) {
						dataPush[index].children.push({ id: item.id, text: item.name });
					}
				});
				return dataPush.slice(0, 3);


			},
			error => {
				console.log('error', error);
			}
			);
	}

	// 获取账期
	// As of version 2.1.0, this was changed to be clamped to the end of the target month.

	AcquisitionPeriod(): Promise<any> {
		return new Promise((resolve, reject) => {
			this.accountBookSettingApi.accountBookSettingGet().subscribe(
				accountBookSettingModel => {
					const period: any = this.getPeroidDateArea(accountBookSettingModel.accountPeriodYear, accountBookSettingModel.accountPeriodMonth);
					resolve(period);
				},
				error => {
					reject(error);
				}
			);
		});

	}

    /**
     * 获取会计区间可选日期
     * @param currentPeroid 当前会计区间
     */
	getPeroidDateArea(year, month) {
		const date = moment(new Date()).year(year).month(month - 1);
		console.log('getPeroidDateArea', date.daysInMonth());
		const minDate = moment(date).date(1).format('YYYY-MM-DD');
		const maxDate = moment(date).date(date.daysInMonth()).format('YYYY-MM-DD');
		console.log('minDate', minDate, maxDate);
		return { minDate: minDate, maxDate: maxDate };
	}


}
