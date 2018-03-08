
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

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
import { IndividualTaxComponent } from './individual-tax/individual-tax.component';
import { CityBuildingComponent } from './city-building/city-building.component';
import { VatPaymentComponent } from './vat-payment/vat-payment.component';
import { TaxDeductionComponent } from './tax-deduction/tax-deduction.component';


const routes: Routes = [
  {
    path: '',
    component: ReportComponent,
    children: [
      {
        path: '',
        component: ReportIndexComponent
      },
      {
        path: 'contacts-detail',
        component: ContactsDetailComponent,
      },
      {
        path: 'contacts-detail/view-detail',
        component: ViewDetailComponent
      },
      {
        path: 'balance-sheet',
        component: BalanceSheetComponent,
      },
      {
        path: 'income-statement',
        component: IncomeStatementComponent,
      },
      {
        path: 'cashFlows-statement',
        component: CashFlowsStatementComponent,
      },
      {
        path: 'value-added',
        component: ValueAddedReportComponent,
      },
      {
        path: 'city-building',
        component: CityBuildingComponent
      },
      {
        path: 'individual-tax',
        component: IndividualTaxComponent
      },
      {
        path: 'value-general',
        component: ValueAddedGeneralComponent,
      },
      {
        path: 'fixed-asset',
        component: FixedAssetReport,
      },
      {
        path: 'sale-detail',
        component: SaleDetailComponent,
      },
      {
        path: 'tax-deduction',
        component: TaxDeductionComponent
      },
      {
        path: 'vat-payment',
        component: VatPaymentComponent
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
export class ReportRoutingModule { }

