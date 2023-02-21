import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarAlbumsComponent } from './editar-albums.component';

describe('EditarAlbumsComponent', () => {
  let component: EditarAlbumsComponent;
  let fixture: ComponentFixture<EditarAlbumsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarAlbumsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarAlbumsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
