/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ImportDeduComponent } from './import-dedu.component';

describe('ImportDeduComponent', () => {
  let component: ImportDeduComponent;
  let fixture: ComponentFixture<ImportDeduComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportDeduComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportDeduComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});