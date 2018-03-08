import { RouterModule, Routes } from '@angular/router';
import { coreRoutes } from './app/component/core/core.routes';
import {
    LoginComponent, RegisterComponent, RetrievePasswordComponent, InvalidLinkComponent,
    LinkSetPasswordComponent, CreateCompanyComponent,
} from './app/component/external';
import { CreateWaysComponent } from './app/component/external/create-ways/create-ways.component';

import { ActivateLinkComponent } from './app/component/external/multi-entry/link/activate-link';

export const routes: Routes = [
    ...coreRoutes,
    { path: 'login', component: LoginComponent },
    { path: 'create-company', component: CreateCompanyComponent },
    { path: 'create-ways', component: CreateWaysComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'retrieve-password', component: RetrievePasswordComponent },
    { path: 'invalid-link', component: InvalidLinkComponent },
    { path: 'link-setpw', component: LinkSetPasswordComponent },
    { path: 'activate-link', component: ActivateLinkComponent },
    { path: '**', component: LoginComponent }
];

export const routing = RouterModule.forRoot(routes);
