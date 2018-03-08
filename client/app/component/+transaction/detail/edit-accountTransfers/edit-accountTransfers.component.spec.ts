import { TestBed, inject } from '@angular/core/testing';

import { EditAccountTransfersComponent } from './edit-accountTransfers.component';

describe('a edit-accountTransfers component', () => {
	let component: EditAccountTransfersComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				EditAccountTransfersComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([EditAccountTransfersComponent], (EditAccountTransfersComponent) => {
		component = EditAccountTransfersComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});