import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleFotoComponent } from './detalle-foto.component';

describe('DetalleFotoComponent', () => {
  let component: DetalleFotoComponent;
  let fixture: ComponentFixture<DetalleFotoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetalleFotoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalleFotoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
