import { TestBed, inject } from '@angular/core/testing';

import { NewOutputInvoiceComponent } from './new-output-invoice.component';

describe('a new-output-invoice component', () => {
	let component: NewOutputInvoiceComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				NewOutputInvoiceComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([NewOutputInvoiceComponent], (NewOutputInvoiceComponent) => {
		component = NewOutputInvoiceComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});