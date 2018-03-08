import { TestBed, inject } from '@angular/core/testing';

import { TagComponent } from './tag.component';

describe('a tag component', () => {
	let component: TagComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				TagComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([TagComponent], (TagComponent) => {
		component = TagComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});