// // import { TestBed, inject } from '@angular/core/testing';
// //
// // import { PostingModalComponent } from './posting-modal.component';
//
// describe('a posting-modal component', () => {
// 	let component: PostingModalComponent;
//
// 	// register all needed dependencies
// 	beforeEach(() => {
// 		TestBed.configureTestingModule({
// 			providers: [
// 				PostingModalComponent
// 			]
// 		});
// 	});
//
// 	// instantiation through framework injection
// 	beforeEach(inject([PostingModalComponent], (PostingModalComponent) => {
// 		component = PostingModalComponent;
// 	}));
//
// 	it('should have an instance', () => {
// 		expect(component).toBeDefined();
// 	});
// });

describe("第一个测试", function() {
	var foo;

	beforeEach(function() {
		foo = 0;
		foo += 1;
	});

	afterEach(function() {
		foo = 0;
	});

	it("1号测试", function() {
		expect(foo).toEqual(1);
	});

	it("2号测试", function() {
		expect(foo).toEqual(1);
		expect(true).toEqual(true);
	});

	describe("2号测试的1号", function() {
		var bar;

		beforeEach(function() {
			bar = 1;
		});

		it("2号测试的2号", function() {
			expect(foo).toEqual(bar);
		});
	});
});