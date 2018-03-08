import { Component, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
	selector: 'carry-forward-modal',
	templateUrl: 'carry-forward-modal.component.html',
	styleUrls: ['./carry-forward-modal.component.scss'],

})

export class CarryForwardModalComponent implements OnInit {
	@ViewChild('modal') public modal;
	constructor(private router: Router) {

	}
	ngOnInit() { }
	public show() {
		this.modal.show();
	}

	public close() {
		this.modal.hide();
	}
	save() {
		this.close();
		this.router.navigate(['/app/finance/account-balance']);
	}
}
