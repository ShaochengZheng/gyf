import { TestBed, inject } from '@angular/core/testing';

import { EditIncomeComponent } from './edit-income.component';

describe('a edit-income component', () => {
	let component: EditIncomeComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				EditIncomeComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([EditIncomeComponent], (EditIncomeComponent) => {
		component = EditIncomeComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});