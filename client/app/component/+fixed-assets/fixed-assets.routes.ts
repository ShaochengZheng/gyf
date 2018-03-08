
/**
 * Created by scleo 
 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IntangibleComponent } from './detail/intangible/intangible.component';
import { FixedComponent } from './detail/fixed/fixed.component';
import { FixedAssetsListComponent } from './assets-list/assets-list.component';
import { AssetsTabComponent } from './detail/assets-tab/assets-tab.component';
import { IntangibleListComponent } from './intangible-list/intangible-list.component';
import { EditIntangibleComponent } from './detail/edit-intangible/edit-intangible.component';
import { EditFixedComponent } from './detail/edit-fixed/edit-fixed.component';
import { IsFixedAssets } from './isFixed-assets';
const routes: Routes = [
	{
		path: '',
		component: FixedAssetsListComponent,
		pathMatch: 'full'
	},
	{
		path: 'list',
		component: FixedAssetsListComponent,
		canActivate: [IsFixedAssets],

	},
	{
		path: 'intangible-list',
		component: IntangibleListComponent,
		canActivate: [IsFixedAssets],

	},
	{
		path: 'detail',
		component: AssetsTabComponent,
		canActivate: [IsFixedAssets],
		canActivateChild: [IsFixedAssets],
		children: [
			{
				path: '',
				redirectTo: 'fixed',
				pathMatch: 'full'
			},
			{
				path: 'fixed',
				component: FixedComponent
			},
			{
				path: 'intangible',
				component: IntangibleComponent
			}
		]
	},
	{
		path: 'detail/:type',
		component: AssetsTabComponent,
		canActivate: [IsFixedAssets],
		canActivateChild: [IsFixedAssets],

		children: [
			{
				path: '',
				redirectTo: 'edit-fixed',
				pathMatch: 'full'
			},
			{
				path: 'edit-fixed',
				component: EditFixedComponent
			},
			{
				path: 'edit-intangible',
				component: EditIntangibleComponent
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
export class FixedAssetsRoutingModule {
}
