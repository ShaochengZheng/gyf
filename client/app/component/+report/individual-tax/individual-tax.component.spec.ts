import { TestBed, inject } from '@angular/core/testing';

import { IndividualTaxComponent } from './individual-tax.component';

describe('a individual-tax component', () => {
	let component: IndividualTaxComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				IndividualTaxComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([IndividualTaxComponent], (IndividualTaxComponent) => {
		component = IndividualTaxComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});