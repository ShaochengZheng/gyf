import { Component, ViewChild, OnInit, Output, EventEmitter } from '@angular/core';


@Component({
	selector: 'posting-cancel-provision-modal',
	templateUrl: 'posting-cancel-provision-modal.component.html',
	styleUrls: ['./posting-cancel-provision-modal.component.scss'],

})

export class PostingCancelProvisionModalComponent implements OnInit {

	@ViewChild('modal') public modal;
	@Output() success = new EventEmitter();

	ngOnInit() { }
	public show() {
		this.modal.show();
	}

	public close() {
		this.modal.hide();
	}
	save() {
		this.success.emit('');
		this.close();
	}
}
