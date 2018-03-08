import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import * as _ from 'lodash';

import { AccountApi } from '../../../api/accounting/api/AccountApi';
import { AccountBookSettingApi } from '../../../api/accounting/api/AccountBookSettingApi';
import { TaxApi } from '../../../api/accounting/api/TaxApi';
import { InvoiceApi } from '../../../api/accounting/api/InvoiceApi';
import { InvoiceItemApi } from '../../../api/accounting/api/InvoiceItemApi';
import { ContactApi } from '../../../api/accounting/api/ContactApi';
import { ContactModel } from '../../../api/accounting/model/ContactModel';
import { BusinessCategoryApi } from '../../../api/accounting/api/BusinessCategoryApi';
import { TagApi } from '../../../api/accounting/api/TagApi';

@Injectable()
export class InvoiceService {

	constructor(private invoiceApi: InvoiceApi, private invoiceItemApi: InvoiceItemApi,
		private contactApi: ContactApi, private businessCategoryApi: BusinessCategoryApi
		, private tagApi: TagApi, private accountApi: AccountApi, private taxApi: TaxApi,
		private accountBookSettingApi: AccountBookSettingApi) { }
	// 当前账套状态 
	accountBookSettingGet(): Promise<any> {
		return new Promise((resolve, reject) => {
			this.accountBookSettingApi.accountBookSettingGet().toPromise().then(
				data => {
						resolve(data);
				}, error => {
					reject(error);
				});
		});
	}

	/**
	 * 导出 各种抵扣
	 */
	invoiceDeductExport(modal): Promise<any> {
		return new Promise((resolve, reject) => {
			this.invoiceApi.invoiceDeductExport(modal.invoiceDeductStatus, modal.keyword, modal.startDate, modal.endDate,
				modal.invoinvoiceNumber, modal.pageIndex, modal.pageSize).toPromise().then(
				data => {
					resolve(data);
				},
				error => {
					reject(error);
					console.error(error);
				});
		});
	}
	/**
	 * 根据 导入抵扣id 获取导入认证对账单情况
	 */
	invoiceImportCertificationHistory(id): Promise<any> {
		return new Promise((resolve, reject) => {
			this.invoiceApi.invoiceImportCertificationHistory(id).toPromise().then(
				data => {
					resolve(data);
				}, error => {
					reject(error);
				});
		});
	}
	/**
	 * 获取 待抵扣清单-认证清单-待抵扣转出清单 三个模块的 统计数据
	 */
	invoiceStatistics(modal): Promise<any> {
		return new Promise((resolve, reject) => {
			this.invoiceApi.invoiceStatistics(modal.invoiceDeductStatus, modal.keyword, modal.startDate, modal.endDate,
				modal.invoinvoiceNumber, modal.pageIndex, modal.pageSize).toPromise().then(
				data => {
					resolve(data);
				},
				error => {
					reject(error);
					console.error(error);
				});
		});
	}
	/**
	 * 获取 待抵扣清单-认证清单-待抵扣转出清单 列表
	 */
	invoiceSearch(modal): Promise<any> {
		return new Promise((resolve, reject) => {
			this.invoiceApi.invoiceDeductSearch(modal.invoiceDeductStatus, modal.keyword, modal.startDate, modal.endDate,
				modal.invoinvoiceNumber, modal.pageIndex, modal.pageSize).toPromise().then(
				data => {
					// _.forEach(data.list => item )
					resolve(data);
				},
				error => {
					reject(error);
					console.error(error);
				});
		});
	}
	/**
	 *  待抵扣清单-认证清单-待抵扣转出清单 
	 *  三者互转，转到哪个列表，deductStatus 是谁，转到谁
	 * 	deductStatus -> stringEnum:"Deducting", "Certification", "Rollout"
	 * 	invoiceIds -> Array[string]
	 */
	invoiceDeduct(modal): Promise<any> {
		return new Promise((resolve, reject) => {
			this.invoiceApi.invoiceDeduct(modal).toPromise().then(
				data => {
					resolve(data);
				}, error => {
					reject(error);
				});
		});
	}
	// 新增发票
	newInvoice(model): Promise<any> {
		return new Promise((resolve, reject) => {
			this.invoiceApi.invoicePost(model).toPromise().then(
				invoiceModel => {
					resolve(invoiceModel);
				},
				error => {
					reject(error);
					console.error(error);
				}
			);
		});
	}
	// 删除发票
	deleteInvocie(id): Promise<any> {
		return new Promise((resolve, reject) => {
			this.invoiceApi.invoiceDelete(id).toPromise().then(
				invoiceModel => {
					resolve(invoiceModel);
				},
				error => {
					reject(error);
					console.error(error);
				}
			);
		});
	}
	// 修改发票
	modifyInvoice(model): Promise<any> {
		return new Promise((resolve, reject) => {
			this.invoiceApi.invoicePut(model).toPromise().then(
				invoiceModel => {
					resolve(invoiceModel);
				},
				error => {
					reject(error);
					console.error(error);
				}
			);
		});
	}
	// 查询发票
	getInvoice(id): Promise<any> {
		return new Promise((resolve, reject) => {
			this.invoiceApi.invoiceGet(id).toPromise().then(
				invoiceModel => {
					resolve(invoiceModel);
				},
				error => {
					reject(error);
					console.error(error);
				}
			);
		});
	}
	// 获取所有的联系人
	getAllContacts(): Promise<ContactModel[]> {
		return new Promise((resolve, reject) => {
			this.contactApi.contactGetAll().toPromise().then(
				contactModel => {
					let dataPush = [];
					dataPush.push({ id: 'contact', text: '+新增对方信息' });
					_.forEach(contactModel, item => dataPush.push({ id: item.id, text: item.name }));
					resolve(dataPush);
				},
				error => {
					reject(error);
					console.error(error);
				}
			);
		});
	}
	// 获取所有类别
	getAllBusiness(type): Promise<any> {
		return new Promise((resolve, reject) => {
			this.businessCategoryApi.businessCategoryGetAll(type).toPromise().then(
				businessCategorytModel => {
					let list: any = businessCategorytModel;
					let dataPush = [];
					let children = [];
					_.forEach(list, item => {
						if (item.level === 1) {
							dataPush.push({
								id: item.id,
								text: item.name,
								children: []
							});
						} else {
							children.push(item);
						}
					});
					_.forEach(children, item => {
						let index;
						index = _.findIndex(dataPush, o => o.id === item.parentBusinessCategory.id);
						if (index !== -1) {
							if (item.name !== '固定资产' && item.name !== '无形资产') {
								dataPush[index].children.push({ id: item.id, text: item.name, disabled: false });
							}
						}
					});

					resolve(dataPush);
				},
				error => {
					reject(error);
					console.error(error);
				}
			);
		});
	}
	// 获取所有开票列表
	getAllInvoice(model): Promise<any> {
		return new Promise((resolve, reject) => {
			this.invoiceApi.invoiceSearch(model.entityType, model.invoiceType,
				model.invoiceStatus, model.keyword, model.startDate, model.endDate,
				model.pageIndex, model.pageSize).toPromise().then(
				invoiceModel => {
					resolve(invoiceModel);
				},
				error => {
					reject(error);
					console.error(error);
				}
				);
		});
	}
	// 获取所有开票列表子项
	getAllItem(model): Promise<any> {
		return new Promise((resolve, reject) => {
			this.invoiceItemApi.invoiceItemSearch(model.tagIds, model.entityType,
				model.invoiceType, model.invoiceStatus, model.invoiceNumber, model.taxRate, model.keyword, model.startDate,
				model.endDate, model.pageIndex, model.pageSize).toPromise().then(
				invoiceItemModel => {
					let data: any = invoiceItemModel;
					for (let i = 0; i < data.list.length; i++) {
						data.list[i].taxRate = data.list[i].taxRate * 100 + '%';
					}
					console.log(data);
					resolve(data);
				},
				error => {
					reject(error);
					console.error(error);
				}
				);
		});
	}
	// 根据ID删除票据
	deleteInvoice(id): Promise<any> {
		return new Promise((resolve, reject) => {
			this.invoiceApi.invoiceDelete(id).toPromise().then(
				invoiceModel => {
					resolve(invoiceModel);
				},
				error => {
					reject(error);
					console.error(error);
				}
			);
		});
	}
	// 根据ID删除票据
	deleteInvoiceItem(invoiceId, id): Promise<any> {
		return new Promise((resolve, reject) => {
			this.invoiceItemApi.invoiceItemDelete(invoiceId, id).toPromise().then(
				invoiceModel => {
					resolve(invoiceModel);
				},
				error => {
					reject(error);
					console.error(error);
				}
			);
		});
	}
	// 根据ID获取票据
	getInvoiceById(id): Promise<any> {
		return new Promise((resolve, reject) => {
			this.invoiceApi.invoiceGet(id).toPromise().then(
				invoiceModel => {
					let tempData: any = invoiceModel;
					const data: any = tempData.invoiceItemModels;
					for (let i = 0; i < data.length; i++) {
						data[i].businessCategory = [{ id: data[i].businessCategory.id, text: data[i].businessCategory.name }];
						data[i].departmentType = [{ id: data[i].departmentType.value, text: data[i].departmentType.name }];
						if (tempData.invoiceType.value.toString() === 'Professional' && tempData.recordType.value.toString() === 'InputInvoice') {
							data[i].inputTaxCategory = [{ id: data[i].inputTaxCategory.id, text: data[i].inputTaxCategory.name }];
						};
						data[i].taxRatePercent = [{ id: data[i].taxRate, text: data[i].taxRate * 100 + '%' }];
						data[i].taxAmount = Number(((data[i].amount - data[i].amount / (1 + data[i].taxRate))).toFixed(2));
						data[i].amountWithoutTax = Number((data[i].amount - data[i].taxAmount).toFixed(2));
						data[i].needBusinessCategory = false;
						data[i].needDepartmentType = false;
						data[i].needtaxRate = false;
						data[i].taxCategory = [];
					};
					tempData.recordDate = tempData.recordDate.substr(0, 10);
					resolve(tempData);
				},
				error => {
					reject(error);
					console.error(error);
				}
			);
		});
	}
	// 获取标签
	getTags(): Promise<any> {
		return new Promise((resolve, reject) => {
			this.tagApi.tagSearch().toPromise().then(
				tagModel => {
					resolve(tagModel);
				},
				error => {
					reject(error);
					console.error(error);
				}
			);
		});
	}
	// 替换URL
	replaceTheURL(data) {
		let temp: Array<any> = data;
		// 匹配最后一个小数点后面的内容 加上—_s 再去替换
		let re = /\.[^\.]+\s*?$/i;
		for (let i = 0; temp.length > i; i++) {

			const e = temp[i].url.match(re);
			const f = '_s' + e[0];
			// let b = this.cacheImage[0].url.replace(re, f);
			temp[i].surl = temp[i].url.replace(re, f);

		}
		// 替换URL
		return temp;

	}
	getAllTags(): Promise<any[]> {
		return new Promise((resolve, reject) => {
			this.tagApi.tagSearch(0, 10, true).subscribe(
				data => {
					resolve(data);
				}, error => {
					reject(error);
				});
		});
	}
	// 获取账期
	getAccountPeriod() {
		return new Promise((resolve, reject) => {
			this.accountApi.accountAccountPeriod().toPromise().then(
				accountPeriodModel => {
					console.log('accountPeriodModel:' + JSON.stringify(accountPeriodModel));
					resolve(accountPeriodModel);
				},
				error => {
					reject(error);
					console.error(error);
				}
			);
		});
	}
	// 获取账期
	getTaxRate() {
		return new Promise((resolve, reject) => {
			this.taxApi.taxGet().toPromise().then(
				taxModel => {
					console.log('taxModel:' + JSON.stringify(taxModel));
					resolve(taxModel);
				},
				error => {
					reject(error);
					console.error(error);
				}
			);
		});
	}
	// 获取账期
	getInvoiceSum(model) {
		return new Promise((resolve, reject) => {
			this.invoiceItemApi.invoiceItemInvoiceSum(model.tagIds, model.entityType,
				model.invoiceType, model.invoiceStatus, model.invoiceNumber, model.taxRate, model.keyword,
				model.startDate, model.endDate).toPromise().then(
				sumModel => {
					console.log('sumModel:' + JSON.stringify(sumModel));
					resolve(sumModel);
				},
				error => {
					reject(error);
					console.error(error);
				}
				);
		});
	}
	// 获取进项税类别
	getBusinessTax(type): Promise<any[]> {
		return new Promise((resolve, reject) => {
			this.taxApi.taxGetBusinessTaxWithCategory(type).toPromise().then(
				sumModel => {
					console.log('sumModel:' + JSON.stringify(sumModel));
					resolve(sumModel);
				},
				error => {
					reject(error);
					console.error(error);
				}
			);
		});
	}
	// 导出收开票
	exportData(model) {
		return new Promise((resolve, reject) => {
			this.invoiceItemApi.invoiceItemInvoiceExport(model.tagIds, model.entityType,
				model.invoiceType, model.invoiceStatus, model.invoiceNumber, model.taxRate, model.keyword, model.startDate,
				model.endDate, model.pageIndex, model.pageSize).toPromise().then(
				invoiceItemModel => {
					const elemIF = document.createElement('iframe');
					elemIF.src = invoiceItemModel;
					elemIF.style.display = 'none';
					document.body.appendChild(elemIF);
				},
				error => {
					reject(error);
					console.error(error);
				}
				);
		});
	}
	filterBusiness(list, type): Promise<any[]> {
		return new Promise((resolve, reject) => {
			for (let i = 0; i < list.length; i++) {
				for (let x = 0; x < list[i].children.length; x++) {
					if (type === true) {
						if (list[i].children[x].text === '劳务费' ||
							list[i].children[x].text === '行政罚款' ||
							list[i].children[x].text === '税务滞纳金' ||
							list[i].children[x].text === '印花税' ||
							list[i].children[x].text === '残保金' ||
							list[i].children[x].text === '减免税款') {
							list[i].children.splice(x, 1);
						}
						if (list[i].text === '其他收支' || list[i].text === '税费') {
							list.splice(i, 1);
						}
					} else {
						list[i].children[x].disabled = false;
					}
				}
			}
			resolve(list);
		});
	}
}
