import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { WidgetModule } from '../widget/widget.module';
import { ChartModule } from 'primeng/components/chart/chart';
import { DatepickerModule } from '../widget/datepicker/datepicker.module';
import { SelectModule } from '../widget/select';
import { PipeModule } from '../../pipe/pipe.module';
import { DirectiveModule } from '../../directive/directive.module';
import { ReportRoutingModule } from './report.routes';

import { ReportComponent } from './report.component';
import { ContactsDetailComponent } from './contacts-detail/contacts-detail.component';
import { ReportIndexComponent } from './report-index/report-index.component';
import { ViewDetailComponent } from './contacts-detail/view-detail/view-detail.component';
import { BalanceSheetComponent } from './balance-sheet/balance-sheet.component';
import { IncomeStatementComponent } from './income-statement/income-statement.component';
import { CashFlowsStatementComponent } from './cashFlows-statement/cashFlows-statement.component';
import { ValueAddedReportComponent } from './valueAdded-report/valueAdded-report.component';
import { ValueAddedGeneralComponent } from './valueAdded-general/valueAdded-general.component';
import { SaleDetailComponent } from './sale-detail/sale-detail.component';
import { FixedAssetReport } from './fixed-asset-report/fixed-asset-report.component';
import { CityBuildingComponent } from './city-building/city-building.component';
import { IndividualTaxComponent } from './individual-tax/individual-tax.component';
import { TaxDeductionComponent } from './tax-deduction/tax-deduction.component';
import { ChartService } from './shared/chart.service';
import { ChartApi } from './../../api/accounting/api/ChartApi';
import { AccountApi } from '../../api/accounting/api/AccountApi';
import { DownloadModule } from '../widget/download/download.moudle';
import { VatPaymentComponent } from './vat-payment/vat-payment.component';
import { DecimalInputModule } from './../widget/decimal/decimal-input.moudle';
import { AuthorizationService } from './../../service/core/authorization';

@NgModule({
    imports: [PaginationModule.forRoot(), CommonModule, FormsModule, ReactiveFormsModule, WidgetModule, DownloadModule,
        ChartModule, DatepickerModule.forRoot(), SelectModule, PipeModule, DirectiveModule, ReportRoutingModule,DecimalInputModule],
    declarations: [ReportComponent, ContactsDetailComponent, ReportIndexComponent, ViewDetailComponent, BalanceSheetComponent,
        IncomeStatementComponent, CashFlowsStatementComponent, ValueAddedReportComponent, ValueAddedGeneralComponent,
        CityBuildingComponent, IndividualTaxComponent, SaleDetailComponent, FixedAssetReport, TaxDeductionComponent,
        VatPaymentComponent
    ],
    exports: [ReportComponent, ContactsDetailComponent, ReportIndexComponent, ViewDetailComponent, BalanceSheetComponent,
        IncomeStatementComponent, CashFlowsStatementComponent, ValueAddedReportComponent, ValueAddedGeneralComponent, CityBuildingComponent,
        IndividualTaxComponent, SaleDetailComponent, FixedAssetReport, VatPaymentComponent, TaxDeductionComponent,
        IncomeStatementComponent, CashFlowsStatementComponent, ValueAddedReportComponent,
        CityBuildingComponent, IndividualTaxComponent, TaxDeductionComponent,
        VatPaymentComponent],
    providers: [ChartService, AuthorizationService, ChartApi, AccountApi]
})
export class ReportModule {
}
