/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { InterchangeModal } from './interchange-modal';

describe('InterchangeModal', () => {
  let component: InterchangeModal;
  let fixture: ComponentFixture<InterchangeModal>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InterchangeModal ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InterchangeModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
