import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearAlbumComponent } from './crear-album.component';

describe('CrearAlbumComponent', () => {
  let component: CrearAlbumComponent;
  let fixture: ComponentFixture<CrearAlbumComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrearAlbumComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearAlbumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
