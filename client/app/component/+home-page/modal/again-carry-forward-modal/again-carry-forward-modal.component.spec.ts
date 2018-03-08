import { TestBed, inject } from '@angular/core/testing';

import { AgainCarryForwardModalComponent } from './again-carry-forward-modal.component';

describe('a again-carry-forward-modal component', () => {
	let component: AgainCarryForwardModalComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				AgainCarryForwardModalComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([AgainCarryForwardModalComponent], (AgainCarryForwardModalComponent) => {
		component = AgainCarryForwardModalComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});