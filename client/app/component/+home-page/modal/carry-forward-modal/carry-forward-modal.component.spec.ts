import { TestBed, inject } from '@angular/core/testing';

import { CarryForwardModalComponent } from './carry-forward-modal.component';

describe('a carry-forward-modal component', () => {
	let component: CarryForwardModalComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				CarryForwardModalComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([CarryForwardModalComponent], (CarryForwardModalComponent) => {
		component = CarryForwardModalComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});