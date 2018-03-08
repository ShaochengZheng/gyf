import { TestBed, inject } from '@angular/core/testing';

import { OutputInvoiceComponent } from './output-invoice.component';

describe('a output component', () => {
	let component: OutputInvoiceComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				OutputInvoiceComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([OutputInvoiceComponent], (outputInvoiceComponent) => {
		component = outputInvoiceComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});
