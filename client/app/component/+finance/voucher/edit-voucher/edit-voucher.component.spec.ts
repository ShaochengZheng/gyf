import { TestBed, inject } from '@angular/core/testing';

import { EditVoucherComponent } from './edit-voucher.component';

describe('a edit-voucher component', () => {
	let component: EditVoucherComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				EditVoucherComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([EditVoucherComponent], (editVoucherComponent) => {
		component = editVoucherComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});