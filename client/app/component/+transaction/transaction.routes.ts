import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ListComponent } from './list/list.component';
import { DetailComponent } from './detail/tab-details/detail.component';

import { OutcomeComponent } from './detail/outcome/outcome.component';
import { IncomeComponent } from './detail/income/income.component';
import { EditIncomeComponent } from './detail/edit-income/edit-income.component';
import { EditOutcomeComponent } from './detail/edit-outcome/edit-outcome.component';
import { AccountTransfersComponent } from './detail/accountTransfers/accountTransfers.component';
import { EditAccountTransfersComponent } from './detail/edit-accountTransfers/edit-accountTransfers.component';

import { IsTransaction } from './isTransaction';
const routes: Routes = [
	{
		path: '',
		redirectTo: 'list',
		pathMatch: 'full'
	},
	{
		path: 'list',
		component: ListComponent,
		canActivate: [IsTransaction],

	},
	{
		path: 'detail',
		component: DetailComponent,
		canActivate: [IsTransaction],
		children: [
			{
				path: '',
				redirectTo: 'Income',
				pathMatch: 'full'
			},
			{
				path: 'Outcome',
				component: OutcomeComponent
			},
			{
				path: 'Income',
				component: IncomeComponent
			},
			{
				path: 'editIncome',
				component: EditIncomeComponent
			},
			{
				path: 'editOutcome',
				component: EditOutcomeComponent
			},
			{
				path: 'accountTransfers',
				component: AccountTransfersComponent
			},
			{
				path: 'editaccountTransfers',
				component: EditAccountTransfersComponent
			}

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
export class TransactionRoutingModule {
}
