import { TestBed, inject } from '@angular/core/testing';

import { TaxDeductionComponent } from './tax-deduction.component';

describe('a tax-deduction component', () => {
	let component: TaxDeductionComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				TaxDeductionComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([TaxDeductionComponent], (TaxDeductionComponent) => {
		component = TaxDeductionComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});