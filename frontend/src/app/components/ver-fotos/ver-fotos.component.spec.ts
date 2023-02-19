import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerFotosComponent } from './ver-fotos.component';

describe('VerFotosComponent', () => {
  let component: VerFotosComponent;
  let fixture: ComponentFixture<VerFotosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerFotosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerFotosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
