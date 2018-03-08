/**
 * Created by zishaofei on 2017/4/18.
 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AccountingHomePageComponent } from './accounting-home-page/accounting-home-page.component';
import { AssistHomePageComponent } from './assist-home-page/assist-home-page.component';


const routes: Routes = [


	{
		path: '',
		redirectTo: 'accounting',
		pathMatch: 'full'
	},
	{
		path: 'accounting',
		component: AccountingHomePageComponent,
	},
	{
		path: 'assist',
		component: AssistHomePageComponent,
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
export class HomePageRoutingModule {
}
