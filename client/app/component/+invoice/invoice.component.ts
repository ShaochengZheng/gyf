import { Component, OnInit } from '@angular/core';

import { InvoiceService } from './shared/invoice.service';

@Component({
	selector: 'invoice',
	templateUrl: 'invoice.component.html',
	providers: [InvoiceService]
})

export class InvoiceComponent implements OnInit {

	constructor(private invoiceService: InvoiceService) { }

	ngOnInit() {
	}
}