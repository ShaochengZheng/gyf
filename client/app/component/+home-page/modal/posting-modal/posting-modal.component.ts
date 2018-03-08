import { Component, ViewChild, OnInit, Output, EventEmitter } from '@angular/core';
import { HomePageService } from '../../shared/home-page.service';

@Component({
	selector: 'posting-modal',
	templateUrl: 'posting-modal.component.html',
	styleUrls: ['./posting-modal.component.scss'],

})

export class PostingModalComponent implements OnInit {
	@ViewChild('modal') public modal;
	@Output() success = new EventEmitter();
	bankAccountdate: Array<any>;
	constructor(private homePageService: HomePageService) {

	}
	ngOnInit() {
		this.getBankAccount();
	}
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
	getBankAccount() {
		this.homePageService.bankAccountGetAll()
			.then(
			bankAccountdate => {
				this.bankAccountdate = bankAccountdate;
				console.log(bankAccountdate);

			}
			)
			.catch(
			error => {
				console.error(error);
			}
			);
	}
}

