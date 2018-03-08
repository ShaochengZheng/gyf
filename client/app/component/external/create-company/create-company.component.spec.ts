import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';

import { CreateCompanyComponent } from './create-company.component';
import { CreateCompanyService } from './shared/create-company.service';
import { CreateCompany } from './shared/create-company.model';

describe('a create-company component', () => {
    let component: CreateCompanyComponent;

    // register all needed dependencies
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpModule],
            providers: [
                { provide: CreateCompanyService, useClass: MockCreateCompanyService },
                CreateCompanyComponent
            ]
        });
    });

    // instantiation through framework injection
    beforeEach(inject([CreateCompanyComponent], (CreateCompanyComponent) => {
        component = CreateCompanyComponent;
    }));

    it('should have an instance', () => {
        expect(component).toBeDefined();
    });
});

// Mock of the original create-company service
class MockCreateCompanyService extends CreateCompanyService {
    getList(): Observable<any> {
        return Observable.from([ { id: 1, name: 'One'}, { id: 2, name: 'Two'} ]);
    }
}
