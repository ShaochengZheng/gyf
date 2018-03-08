import { TestBed, inject } from '@angular/core/testing';

import { ValueAddedReportComponent } from './valueAdded-report.component';

describe('a valueAdded-report component', () => {
	let component: ValueAddedReportComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				ValueAddedReportComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([ValueAddedReportComponent], (ValueAddedReportComponent) => {
		component = ValueAddedReportComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});