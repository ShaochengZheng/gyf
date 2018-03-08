import { TestBed, inject } from '@angular/core/testing';

import { InputInvoiceComponent } from './input-invoice.component';

describe('a input component', () => {
	let component: InputInvoiceComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				InputInvoiceComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([InputInvoiceComponent], (inputInvoiceComponent) => {
		component = inputInvoiceComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
// tslint:disable-next-line:eofline
});