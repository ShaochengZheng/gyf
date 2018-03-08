import { TestBed, inject } from '@angular/core/testing';

import { IncomeComponent } from './income.component';

describe('a income component', () => {
	let component: IncomeComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				IncomeComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([IncomeComponent], (IncomeComponent) => {
		component = IncomeComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});