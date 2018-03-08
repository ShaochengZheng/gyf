
/**
 * Created by zishaofei on 2017/4/5.
 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountBalanceComponent } from './account-balance/account-balance.component';
import { BeginningPeriodComponent } from './beginning-period/beginning-period.component';
import { FinanceComponent } from './finance.component';
import { VoucherComponent } from './voucher/voucher.component';
import { NewVoucherComponent } from './voucher/new-voucher/new-voucher.component';
import { EditVoucherComponent } from './voucher/edit-voucher/edit-voucher.component';
import { AccountDetailComponent } from './account-detail/account-detail.component';
import { GeneralLedgerComponent } from './general-ledger/general-ledger.component';
import { CarryForwardComponent } from './carry-forward/carry-forward.component';
import { CarryVoucherListComponent } from './carry-forward/list/cv-list.component';
import { ImportComponent } from './import/import';
import { IsFinance } from './isFinance';


const routes: Routes = [


	{
		path: '',
		component: FinanceComponent,
		canActivate: [IsFinance],
		canActivateChild: [IsFinance],
		children: [
			{
				path: 'account-balance',
				component: AccountBalanceComponent,
			},
			{
				path: 'voucher',
				component: VoucherComponent,
			},
			{
				path: 'import',
				component: ImportComponent,
			},
			{
				path: 'newvoucher',
				component: NewVoucherComponent,
			},
			{
				path: 'editvoucher',
				component: EditVoucherComponent,
			},
			{
				path: 'beginningPeriod',
				component: BeginningPeriodComponent,
			}, {
				path: 'account-detail',
				component: AccountDetailComponent,
			}, {
				path: 'general-ledger',
				component: GeneralLedgerComponent,
			}, {
				path: 'carry-forward',
				component: CarryForwardComponent
			}, {
				path: 'carry-forward/list',
				component: CarryVoucherListComponent
			}
		]
	}
];


@NgModule({
	imports: [
		RouterModule.forChild(routes)
	],
	exports: [
		RouterModule
	]
})
export class FinanceRoutingModule {
}
