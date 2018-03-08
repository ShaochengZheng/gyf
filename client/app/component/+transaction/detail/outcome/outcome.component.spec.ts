import { TestBed, inject } from '@angular/core/testing';

import { OutcomeComponent } from './outcome.component';

describe('a outcome component', () => {
	let component: OutcomeComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				OutcomeComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([OutcomeComponent], (OutcomeComponent) => {
		component = OutcomeComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});