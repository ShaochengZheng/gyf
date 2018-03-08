import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
	selector: 'tab',
	templateUrl: 'tab.component.html'
})

export class TabComponent implements OnInit {
	editInput: boolean = false;
	editOutput: boolean = false;
	new: boolean = false;
	constructor(private activatedRoute: ActivatedRoute, private router: Router) {
		this.router = router;
		if (router.events.subscribe) {
			router.events.debounceTime(500).distinctUntilChanged().subscribe(() => (this.setTBAPage()));
			// router.events.subscribe(() => (this.setTBAPage()));
		}
	}
	ngOnInit() {
		this.setTBAPage();
	}
    /**
     * 
     * 设置TAB页
     * 
     * @memberof DetailComponent
     */
	setTBAPage() {
		console.log('更新tab');

		let pathname = location.pathname.split('/');
		if (pathname[4] === 'new-output-invoice' || pathname[4] === 'new-input-invoice') {
			this.new = true;
		}
		if (pathname[4] === undefined) {
			return;
		} else {
			let paths = pathname[4].split(';');
			if (paths[0] === 'edit-output-invoice') {
				this.editOutput = true;
			}
			if (paths[0] === 'edit-input-invoice') {
				this.editInput = true;
			}
		}
	}
}