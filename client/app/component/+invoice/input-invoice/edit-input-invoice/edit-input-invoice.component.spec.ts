import { TestBed, inject } from '@angular/core/testing';

import { EditInputInvoiceComponent } from './edit-input-invoice.component';

describe('a edit-input-invoice component', () => {
	let component: EditInputInvoiceComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				EditInputInvoiceComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([EditInputInvoiceComponent], (editInputInvoiceComponent) => {
		component = editInputInvoiceComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});