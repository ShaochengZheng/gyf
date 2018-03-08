import { TestBed, inject } from '@angular/core/testing';

import { ListComponent } from './list.component';

describe('a list component', () => {
	let component: ListComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				ListComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([ListComponent], (ListComponent) => {
		component = ListComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});