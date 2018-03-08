import { TestBed, inject } from '@angular/core/testing';

import { ImportOutputInvoiceComponent } from './import-output-invoice.component';

describe('a import-output-invoice component', () => {
	let component: ImportOutputInvoiceComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				ImportOutputInvoiceComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([ImportOutputInvoiceComponent], (importOutputInvoiceComponent) => {
		component = importOutputInvoiceComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});