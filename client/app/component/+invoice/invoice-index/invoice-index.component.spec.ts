import { TestBed, inject } from '@angular/core/testing';
import 'rxjs/Rx';

import { InvoiceIndexComponent } from './invoice-index.component';

describe('a invoice-index component', () => {
	let component: InvoiceIndexComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				InvoiceIndexComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([InvoiceIndexComponent], (invoiceIndexComponent) => {
		component = invoiceIndexComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});