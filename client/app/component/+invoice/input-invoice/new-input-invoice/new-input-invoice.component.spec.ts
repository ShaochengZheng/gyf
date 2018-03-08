import { TestBed, inject } from '@angular/core/testing';

import { NewInputInvoiceComponent } from './new-input-invoice.component';

describe('a new-input-invoice component', () => {
	let component: NewInputInvoiceComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				NewInputInvoiceComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([NewInputInvoiceComponent], (newInputInvoiceComponent) => {
		component = newInputInvoiceComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});