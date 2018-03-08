import { TestBed, inject } from '@angular/core/testing';

import { UploadAttachmentsComponent } from './upload-attachments.component';

describe('a upload-attachments component', () => {
	let component: UploadAttachmentsComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				UploadAttachmentsComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([UploadAttachmentsComponent], (UploadAttachmentsComponent) => {
		component = UploadAttachmentsComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});