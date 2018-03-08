import { TestBed, inject } from '@angular/core/testing';

import { BeginningPeriodComponent } from './beginning-period.component';

describe('a beginning of the period component', () => {
    let component = BeginningPeriodComponent;

    // register all needed dependencies
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [BeginningPeriodComponent]
        });
    });

    // instantiation through framework injection
    beforeEach(inject([BeginningPeriodComponent], (BeginningPeriodComponent) => {
        component = BeginningPeriodComponent;
    }));

    it('should have an instance', () => {
        expect(component).toBeDefined();
    });

});