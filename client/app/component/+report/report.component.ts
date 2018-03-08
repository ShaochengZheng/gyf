import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'report',
    templateUrl: './report.component.html',
    styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {
    ngOnInit() {
		console.log('ReportComponent');
	}
}
