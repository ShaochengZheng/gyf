import { Component, ViewChild, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
@Component({
	selector: 'again-carry-forward-modal',
	templateUrl: 'again-carry-forward-modal.component.html',
	styleUrls: ['./again-carry-forward-modal.component.scss'],

})

export class AgainCarryForwardModalComponent implements OnInit {



	@ViewChild('modal') public modal;
	@Output() againCarryForward = new EventEmitter();
	@Output() carryForwards = new EventEmitter();
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
		this.againCarryForward.emit('');
		this.close();
	}
	carryForward() {
		this.carryForwards.emit('');
		this.close();
	}
}
