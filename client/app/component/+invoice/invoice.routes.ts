/**
 * Created by Jamie Gao on 2017/4/24.
 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
	InvoiceComponent, InputInvoiceComponent, OutputInvoiceComponent, InvoiceIndexComponent, NewOutputInvoiceComponent,
	EditOutputInvoiceComponent, NewInputInvoiceComponent, EditInputInvoiceComponent, TabComponent,
	ImportOutputInvoiceComponent, DeductionComponent
} from './';
import { ImportDeduComponent } from './deduction/import-dedu/import-dedu.component';

import { IsInvoice } from './isInvoice';
const routes: Routes = [


	{
		path: '',
		component: InvoiceComponent,
		canActivate: [IsInvoice],
		canActivateChild: [IsInvoice],

		children: [
			{
				path: 'import-output-invoice',
				component: ImportOutputInvoiceComponent,
			}
		]
	},
	{
		path: 'index',
		component: InvoiceIndexComponent,
		canActivate: [IsInvoice],

	},
	{
		path: 'deduction',
		component: DeductionComponent,
		canActivate: [IsInvoice],

	}, {
		path: 'import-dedu',
		component: ImportDeduComponent,
		canActivate: [IsInvoice],

	},
	{
		path: 'input-invoice',
		component: InputInvoiceComponent,
		canActivate: [IsInvoice],


	},
	{
		path: 'output-invoice',
		component: OutputInvoiceComponent,
		canActivate: [IsInvoice],


	},
	{
		path: 'tab',
		component: TabComponent,
		canActivate: [IsInvoice],
		canActivateChild: [IsInvoice],

		children: [
			{
				path: '',
				redirectTo: 'new-input-invoice',
				pathMatch: 'full'
			},
			{
				path: 'new-input-invoice',
				component: NewInputInvoiceComponent
			},
			{
				path: 'new-output-invoice',
				component: NewOutputInvoiceComponent
			},
			{
				path: 'edit-input-invoice',
				component: EditInputInvoiceComponent,
			},
			{
				path: 'edit-output-invoice',
				component: EditOutputInvoiceComponent,
			},
		]
	},
];


@NgModule({
	imports: [
		RouterModule.forChild(routes)
	],
	exports: [
		RouterModule
	]
})
export class InvoiceRoutingModule { }
