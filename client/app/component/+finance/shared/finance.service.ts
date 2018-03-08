import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import * as _ from 'lodash';

import { AccountApi } from '../../../api/accounting/api/AccountApi';
import { AccountModels, Total } from '../shared/finance.model';
import { ContactApi } from '../../../api/accounting/api/ContactApi';
import { ContactModel } from '../../../api/accounting/model/ContactModel';
import { JournalEntryApi } from '../../../api/accounting/api/JournalEntryApi';
import { AccountBookSettingApi } from './../../../api/accounting/api/AccountBookSettingApi';
import { PostingApi } from './../../../api/accounting/api/PostingApi';
import { AccountBookSettingStatusEnumModel } from './../../../api/accounting/model/AccountBookSettingStatusEnumModel';
import { AccountBookForCarryModel } from './finance.model';
import { CustomerApi } from '../../../api/identity/api/CustomerApi';
import { WeChatApi } from '../../../api/wechat/api/send';
import { AccountTypeEnumModel } from '../../../api/accounting/model/AccountTypeEnumModel';


@Injectable()
export class FinanceService {

	constructor(private accountApi: AccountApi, private contactApi: ContactApi, private journalEntryApi: JournalEntryApi,
		private accountSettingApi: AccountBookSettingApi, private postingApi: PostingApi, private customerApi: CustomerApi
		, private weChatApi: WeChatApi) {
	}

	//
	/**
	 * 明细账总账的导出
	 * isDetail 是总账还是明细账 Boolean
	 */
	accountExportAccount(model, isDetail): Promise<any> {
		return new Promise((resolve, reject) => {
			this.accountApi.accountExportAccount(model.year, model.month, model.isCurrentPeriod, isDetail)
				.toPromise().then(
				data => {
					resolve(data);
				},
				error => {
					reject(error);
				}
				);
		});
	}

	// 发送微信消息给外部联系人
	getWeChatOpenId(accountBookId): Promise<any> {
		return new Promise((resolve, reject) => {
			this.customerApi.customerGetOpenId(accountBookId).toPromise().then(
				model => {
					resolve(model);
				},
				error => {
					reject(error);
					console.error(error);
				}
			);
		});
	}

	// 发送微信消息给外部联系人
	sendMessage(model): Promise<any> {
		return new Promise((resolve, reject) => {
			this.weChatApi.sent(model).subscribe(
				// tslint:disable-next-line:no-shadowed-variable
				model => {
					resolve(model);
				},
				error => {
					reject(error);
					console.error(error);
				}
			);
		});
	}

	// 查询科目余额表
	accountGet(year, month, periodType): Promise<any> {
		return new Promise((resolve, reject) => {
			this.accountApi.accountGet(year, month, periodType).toPromise().then(
				accountModel => {
					// tslint:disable-next-line:no-console
					console.time('科目余额表运算时间');
					if (accountModel === null) {
						resolve(null);
						return;
					}

					let accountModels: AccountModels[];
					const totaltemp = {
						name: '',
						value: '',
						money: {
							credit: 0,
							debit: 0,
							periodEndCredit: 0,
							periodEndDebit: 0,
							periodInitialCredit: 0,
							periodInitialDebit: 0
						},
						whetherTo0: true

					};
					const total: Total[] = [_.cloneDeep(totaltemp), _.cloneDeep(totaltemp), _.cloneDeep(totaltemp),
					_.cloneDeep(totaltemp), _.cloneDeep(totaltemp), _.cloneDeep(totaltemp), _.cloneDeep(totaltemp)];
					accountModels = accountModel;
					// 添加是否展开的属性 默认全部展开
					// 添加箭头方向的属性 默认全部向下
					// 添加合计金额
					total[0].name = '总计';
					total[0].value = 'None';
					for (let i = 0; i < accountModels.length; i++) {
						// 全部合计
						total[0] = this.totalmoney(total[0], accountModels[i]);
						total[0] = this.whetherTo0(total[0]);
						// 是否都是0
						if (accountModels[i].credit + accountModels[i].debit === 0 &&
							accountModels[i].periodEndCredit === 0 && accountModels[i].periodEndDebit
							=== 0 && accountModels[i].periodInitialCredit === 0 &&
							accountModels[i].periodInitialDebit === 0) {
							accountModels[i].whetherTo0 = true;
						}
						accountModels[i].isExpansion = false;
						accountModels[i].directionOfArrow = false;
						accountModels[i].totalAmount = accountModels[i].credit + accountModels[i].debit +
							accountModels[i].periodEndCredit + accountModels[i].periodEndDebit + accountModels[i].periodInitialCredit +
							accountModels[i].periodInitialDebit;

						//
						if (accountModels[i].accountType.value === AccountTypeEnumModel.ValueEnum.None) {
							// 无类型
						} else if (accountModels[i].accountType.value === AccountTypeEnumModel.ValueEnum.Assets) {
							// 第一大类
							// 添加资产 资产总额＝1类总额
							total[1].name = '资产合计';
							total[1].value = 'Assets';
							total[1] = this.totalmoney(total[1], accountModels[i]);
							total[1] = this.whetherTo0(total[1]);

						} else if (accountModels[i].accountType.value === AccountTypeEnumModel.ValueEnum.Liability) {
							// 第二大类

							total[2].name = '负债合计';
							total[2].value = 'Liability';
							total[2] = this.totalmoney(total[2], accountModels[i]);
							total[2] = this.whetherTo0(total[2]);

						} else if (accountModels[i].accountType.value === AccountTypeEnumModel.ValueEnum.OwnersEquity) {
							// 第三大类
							// 添加权益
							total[3].name = '所有者权益合计';
							total[3].value = 'OwnersEquity';
							total[3] = this.totalmoney(total[3], accountModels[i]);
							total[3] = this.whetherTo0(total[3]);

						} else if (accountModels[i].accountType.value === AccountTypeEnumModel.ValueEnum.Cost) {
							// 第四大类
							// 添加成本=4类总额
							total[4].name = '成本合计';
							total[4].value = 'Cost';
							total[4] = this.totalmoney(total[4], accountModels[i]);
							total[4] = this.whetherTo0(total[4]);
						} else if (accountModels[i].accountType.value === AccountTypeEnumModel.ValueEnum.ProfitAndLoss) {
							// 第五大类
							// 添加权益
							total[5].name = '损益合计';
							total[5].value = 'ProfitAndLoss';
							total[5] = this.totalmoney(total[5], accountModels[i]);
							total[5] = this.whetherTo0(total[5]);
						} else {
							console.error('给个类型呗');
						}
						//
					}
					const temps = {
						accountModels: accountModels,
						total: total
					};
					resolve(temps);
					// tslint:disable-next-line:no-console
					console.timeEnd('科目余额表运算时间');

				},
				error => {
					reject(error);
					console.error(error);
				}
			);
		});
	}
	totalmoney(total, accountModels) {
		if (accountModels.level === '1') {
			total.money.credit += accountModels.credit;
			total.money.debit += accountModels.debit;
			total.money.periodEndCredit += accountModels.periodEndCredit;
			total.money.periodEndDebit += accountModels.periodEndDebit;
			total.money.periodInitialCredit += accountModels.periodInitialCredit;
			total.money.periodInitialDebit += accountModels.periodInitialDebit;
		} else {

		}



		return total;

	}
	whetherTo0(total) {
		if (total.money.credit + total.money.debit === 0 &&
			total.money.periodEndCredit === 0 && total.money.periodEndDebit ===
			0 && total.money.periodInitialCredit === 0 &&
			total.money.periodInitialDebit === 0) {
			total.whetherTo0 = true;
		} else {
			// 有一个不是0就得显示
			total.whetherTo0 = false;
		}
		return total;



	}


	// 根据ID获取科目
	getSubject(model) {
		return new Promise((resolve, reject) => {
			this.accountApi.accountGet_1(model.year, model.month, model.id).toPromise().then(
				subjectModel => {
					resolve(subjectModel);
				},
				error => {
					reject(error);
					console.error(error);
				}
			);
		});
	}

	// 获取所有科目
	getAllSubjects(): Promise<AccountModels[]> {
		return new Promise((resolve, reject) => {
			this.accountApi.accountGetAll().toPromise().then(
				accountModel => {
					const list: any = accountModel;
					const dataPush = [];
					// dataPush.push({
					// 	id: '0000',
					// 	text: '+新增会计科目',
					// 	disabled: false
					// });
					_.forEach(list, item => {
						dataPush.push({
							id: item.code,
							text: item.code + '—' + item.name,
							disabled: item.hasChildren,
							originId: item.id
						});

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

	// 获取所有科目 为明细账增加 与上返回值不同
	getAllSubjectsForDetail(isAll): Promise<any> {
		return new Promise((resolve, reject) => {
			this.accountApi.accountGetAll(isAll).toPromise().then(
				accountModel => {
					const list: any = accountModel;
					const dataPush = [];
					_.forEach(list, item => {
						if (item.hasChildren) {
							dataPush.push({
								id: item.id,
								text: item.code + item.name,
							});
						} else {
							dataPush.push({
								id: item.id,
								text: '—' + item.code + item.name,
							});
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

	// 获取所有的联系人
	getAllContacts(): Promise<ContactModel[]> {
		return new Promise((resolve, reject) => {
			this.contactApi.contactGetAll().toPromise().then(
				contactModel => {
					const dataPush = [];
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

	// 获取凭证编号
	getVoucherNumber(year, month): Promise<any> {
		return new Promise((resolve, reject) => {
			this.journalEntryApi.journalEntryGetMaxNumber(year, month).toPromise().then(
				journalEntryModel => {
					resolve(journalEntryModel);
				},
				error => {
					reject(error);
					console.error(error);
				}
			);
		});

	}

	// 新增凭证
	addNewVoucher(model): Promise<any> {
		return new Promise((resolve, reject) => {
			this.journalEntryApi.journalEntryPost(model).toPromise().then(
				journalEntryModel => {
					resolve('新增凭证成功');
				},
				error => {
					reject(error);
					console.error(error);
				}
			);
		});
	}

	// 获取凭证
	getVoucher(model): Promise<any> {
		return new Promise((resolve, reject) => {
			this.journalEntryApi.journalEntrySearch(model.year, model.month, model.keyword, model.pageIndex,
				model.pageSize, model.type).toPromise().then(
				voucherModel => {
					resolve(voucherModel);
				},
				error => {
					reject(error);
					console.error(error);
				}
				);
		});
	}

	// 根据ID删除凭证
	deleteVoucher(id): Promise<any> {
		return new Promise((resolve, reject) => {
			this.journalEntryApi.journalEntryDelete(id).toPromise().then(
				voucherModel => {
					resolve(voucherModel);
				},
				error => {
					reject(error);
					console.error(error);
				}
			);
		});
	}

	// 根据ID获取凭证
	getVoucherById(id): Promise<any> {
		return new Promise((resolve, reject) => {
			this.journalEntryApi.journalEntryGet(id).toPromise().then(
				voucherModel => {
					resolve(voucherModel);
				},
				error => {
					reject(error);
					console.error(error);
				}
			);
		});
	}

	// 整理编号
	journalEntryOrder(year, month) {
		return new Promise((resolve, reject) => {
			this.journalEntryApi.journalEntryOrder(year, month).toPromise().then(
				voucherModel => {
					// console.log('4884848484484848488' + JSON.stringify (voucherModel));
					resolve(voucherModel);
				},
				error => {
					reject(error);
					console.error(error);
				}
			);
		});
	}

	// 修改凭证
	journalEntryModify(model) {
		return new Promise((resolve, reject) => {
			this.journalEntryApi.journalEntryPut(model).toPromise().then(
				voucherModel => {
					resolve(voucherModel);
				},
				error => {
					reject(error);
					console.error(error);
				}
			);
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

	// 替换URL
	replaceTheURL(data) {
		const temp: Array<any> = data;
		// 匹配最后一个小数点后面的内容 加上—_s 再去替换
		const re = /\.[^\.]+\s*?$/i;
		for (let i = 0; temp.length > i; i++) {

			const e = temp[i].url.match(re);
			const f = '_s' + e[0];
			// let b = this.cacheImage[0].url.replace(re, f);
			temp[i].surl = temp[i].url.replace(re, f);

		}
		// 替换URL
		return temp;

	}

    /**
     * 获取明细账
     *
     * @param accountCategoryId
     * @param year
     * @param month
     * @param isCurrentPeriod
     */
	getDetailAccount(model): Promise<any> {
		return new Promise((resolve, reject) => {
			this.accountApi.accountGetDetailAccount(model.accountCategoryId,
				model.year, model.month, model.isCurrentPeriod).subscribe(
				data => {
					resolve(data);
				}, error => {
					reject(error);
				});
		});
	}

    /**
     * 总账
     * @param accountCategoryId
     * @param year
     */
	getGeneralLedger(model): Promise<any> {
		return new Promise((resolve, reject) => {
			this.accountApi.accountTotalAccount(model.accountCategoryId, model.year).subscribe(
				data => {
					resolve(data);
				}, error => {
					reject(error);
				}
			);
		});
	}

    /**
     * 获取结转列表
     * @param year 年
     */
	getCarryForwardList(year): Promise<AccountBookForCarryModel[]> {
		return new Promise((resolve, reject) => {
			this.accountSettingApi.accountBookSettingGets(year).subscribe(
				data => {
					let templist: AccountBookForCarryModel[] = [];
					templist = data;
					for (let i = 0; i < templist.length; i++) {
						// /// 期初设置
						// BeginningInit = 0,
						// /// 进行中
						// InProgress = 1,
						// /// 待结转
						// CarryForward = 2,
						// /// 待过账
						// Posting = 3,
						// /// 完成
						// Done = 4
						switch (templist[i].status.value) {
							case AccountBookSettingStatusEnumModel.ValueEnum.BeginningInit: // 期初
							case AccountBookSettingStatusEnumModel.ValueEnum.InProgress: // 进行中
								templist[i].btnStatus = '一键结转';
								templist[i].strStatus = '未结转';
								templist[i].isClickable = true;
								break;
							case AccountBookSettingStatusEnumModel.ValueEnum.CarryForward: // 待过帐
							case AccountBookSettingStatusEnumModel.ValueEnum.Posting: // 完成
								templist[i].btnStatus = '再次结转';
								templist[i].strStatus = '已结转';
								templist[i].isClickable = true;
								break;
							case AccountBookSettingStatusEnumModel.ValueEnum.Done: // 结转完成
								templist[i].btnStatus = '已结转';
								templist[i].strStatus = '已过帐';
								templist[i].isClickable = false;
								break;
							default:
								break;
						}
					}
					console.log(templist);
					resolve(templist);
				}, error => {
					console.log(error);
					reject(error);
				}
			);
		});
	}

    /**
     * 结转当前账套
     */
	carryForwardAccount() {
		return this.postingApi.postingCarryForward().toPromise();
	}
	/**
	 * 获取起初分配往来信息
	 * @param contactFlag 分配往来的类型
	 */
	getDistContact(contactFlag) {
		return new Promise((resolve, reject) => {
			this.contactApi.contactGet(contactFlag).subscribe(data => {
				console.log('DistContact', data);
				resolve(data);
			}, error => {
				console.log('DistContact', error);
				reject(error);
			});
		});
	}


	/**
	 * 凭证导出
	 */
	exportVoucher(model) {
		return new Promise((resolve, reject) => {
			this.journalEntryApi.journalEntryExport(model.year, model.month, model.keyword, model.pageIndex, model.pageSize)
				.subscribe(data => {
					resolve(data);
				}, error => {
					reject(error);
				});
		});
	}

}
