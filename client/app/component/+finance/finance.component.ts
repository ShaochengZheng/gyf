import { Component, OnInit } from '@angular/core';

import { FinanceService } from './shared/finance.service';

@Component({
	selector: 'finance',
	templateUrl: 'finance.component.html',
	providers: [FinanceService]
})

export class FinanceComponent implements OnInit {

	constructor(private financeService: FinanceService) { }

	ngOnInit() {

	}
}
