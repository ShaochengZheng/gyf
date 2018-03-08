import { TestBed, inject } from '@angular/core/testing';

import { ModifyStockCashBalanceModalComponent } from './modify-stock-cash-balance-modal.component';

describe('a modify-stock-cash-balance-modal component', () => {
	let component: ModifyStockCashBalanceModalComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				ModifyStockCashBalanceModalComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([ModifyStockCashBalanceModalComponent], (ModifyStockCashBalanceModalComponent) => {
		component = ModifyStockCashBalanceModalComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});