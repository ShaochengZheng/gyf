import { TestBed, inject } from '@angular/core/testing';

import { DetailComponent } from './detail.component';

describe('a details component', () => {
	let component: DetailComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				DetailComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([DetailComponent], (DetailComponent) => {
		component = DetailComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});