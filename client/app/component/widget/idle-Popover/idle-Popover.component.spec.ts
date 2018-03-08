import { TestBed, inject } from '@angular/core/testing';

import { IdlePopoverComponent } from './idle-Popover.component';

describe('a idle-Popover component', () => {
	let component: IdlePopoverComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				IdlePopoverComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([IdlePopoverComponent], (IdlePopoverComponent) => {
		component = IdlePopoverComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});