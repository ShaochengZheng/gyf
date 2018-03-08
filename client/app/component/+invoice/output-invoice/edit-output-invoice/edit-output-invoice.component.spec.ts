import { TestBed, inject } from '@angular/core/testing';

import { EditOutputInvoiceComponent } from './edit-output-invoice.component';

describe('a edit-output-invoice component', () => {
	let component: EditOutputInvoiceComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				EditOutputInvoiceComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([EditOutputInvoiceComponent], (editOutputInvoiceComponent) => {
		component = editOutputInvoiceComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});