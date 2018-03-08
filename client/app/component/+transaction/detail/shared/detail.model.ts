export class AccountTransactionModels {

    /**
     * id
     */
	id?: string = '';

    /**
     * 编码
     */
	number?: string = '';

    /**
     * 交易日期
     */
	accountTransDate?: string = '';

    /**
     * 源id
     */
	sourceId?: string;

    /**
     * 联系人
     */
	contact?: {
		id: '',
		name: ''
	};

    /**
     * 银行账户
     */
	bankAccount: {
		id: '',
		name: ''
	};

    /**
     * 交易类型
     */
	entityType?: {
		value: '',
		name: ''
	};

    /**
     * 实体类型
     */
	sourceEntityType?: {
		value: '',
		name: ''
	};

    /**
     * 交易总金额
     */
	totalAmount?: number = 0;

    /**
     * 结余
     */
	cashSurplus?: number = 0;

    /**
     * 是否是期初记录
     */
	isOpeningRecord?: boolean = false;

    /**
     * 对账状态
     */
	statementStatus?: {
		value: '',
		name: ''
	};

	accountTransLineItemModels?: [{
		id: 0,
		amount: null,
		department: null,
		businessCategory: null,
		description: '',
		accountTransactionModel: {},
		order: 0,
		needBusinessCategory: false,
		needDepartment: false,
		needAmount: false
	}];

    /**
     * 标签
     */
	tags?: [{
		id: '',
		value: '',
		isDefault: null
	}];

    /**
     * 流水帐附件
     */
	accountAttachmentModels?: [{
		id: '',
		value: '',
		isDefault: null
	}];
}

