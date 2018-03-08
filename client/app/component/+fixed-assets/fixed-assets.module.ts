import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AlertModule } from 'ngx-bootstrap/alert';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { SelectModule } from '../widget/select';
import { WidgetModule } from '../widget/widget.module';
import { ModalDialogModule } from '../modal/modal.module';
import { FixedAssetsRoutingModule } from './fixed-assets.routes';
import { DatepickerModule } from '../widget/datepicker/datepicker.module';
import { IntangibleComponent } from './detail/intangible/intangible.component';
import { FixedComponent } from './detail/fixed/fixed.component';
import { EditIntangibleComponent } from './detail/edit-intangible/edit-intangible.component';
import { EditFixedComponent } from './detail/edit-fixed/edit-fixed.component';
import { FixedAssetsListComponent } from './assets-list/assets-list.component';
import { AssetsTabComponent } from './detail/assets-tab/assets-tab.component';
import { IntangibleListComponent } from './intangible-list/intangible-list.component';
import { FixedAssetService } from './shared/fixed-asset.service';

import { DepreciationCategoryApi, FixedAssetApi, ContactApi, TagApi, AccountApi, TaxApi, AccountBookSettingApi }
    from './../../api/accounting/api/api';

import { IsFixedAssets } from './isFixed-assets';
import { ShareService } from './../../service/core/share';
import { PipeModule } from './../../pipe/pipe.module';
import { DirectiveModule } from './../../directive/directive.module';
import { TagModule } from '../widget/tag/tag.module';
import { DecimalInputModule } from '../widget/decimal/decimal-input.moudle';
import { ConfirmWidgetModule } from '../widget/confirm/confirm.moudle';
import { BpInputModule } from '../widget/bp-input/bp-input.module';
import { UploadAttachmentsMoudule } from '../widget/upload-attachments/upload-attachments.module';



@NgModule({
    imports: [CommonModule, ReactiveFormsModule, FormsModule, DatepickerModule.forRoot(), SelectModule, ModalDialogModule, WidgetModule, TagModule, ConfirmWidgetModule, BpInputModule,
        FixedAssetsRoutingModule, AlertModule.forRoot(), ModalModule, PaginationModule, TooltipModule.forRoot(), PipeModule, DirectiveModule, DecimalInputModule, UploadAttachmentsMoudule],
    declarations: [IntangibleComponent, FixedComponent, FixedAssetsListComponent, AssetsTabComponent, IntangibleListComponent,
        EditIntangibleComponent, EditFixedComponent],
    exports: [IntangibleComponent, FixedComponent, FixedAssetsListComponent, AssetsTabComponent, IntangibleListComponent,
        EditIntangibleComponent, EditFixedComponent],
    providers: [FixedAssetService, FixedAssetApi, DepreciationCategoryApi, ContactApi, TagApi, IsFixedAssets, ShareService, AccountApi,
        , TaxApi, AccountBookSettingApi]
})
export class FixedAssetsModule {
}
