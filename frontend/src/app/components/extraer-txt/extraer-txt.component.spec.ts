import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtraerTxtComponent } from './extraer-txt.component';

describe('ExtraerTxtComponent', () => {
  let component: ExtraerTxtComponent;
  let fixture: ComponentFixture<ExtraerTxtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExtraerTxtComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtraerTxtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
