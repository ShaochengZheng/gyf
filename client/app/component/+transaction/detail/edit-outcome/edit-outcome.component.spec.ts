import { TestBed, inject } from '@angular/core/testing';

import { EditOutcomeComponent } from './edit-outcome.component';

describe('a edit-outcome component', () => {
	let component: EditOutcomeComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				EditOutcomeComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([EditOutcomeComponent], (EditOutcomeComponent) => {
		component = EditOutcomeComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});