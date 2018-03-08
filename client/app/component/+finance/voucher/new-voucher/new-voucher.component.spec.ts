import { TestBed, inject } from '@angular/core/testing';

import { NewVoucherComponent } from './new-voucher.component';

describe('a new-voucher component', () => {
	let component: NewVoucherComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				NewVoucherComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([NewVoucherComponent], (newVoucherComponent) => {
		component = newVoucherComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});