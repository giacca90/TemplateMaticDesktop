import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuiaComponent } from './guia.component';

describe('GuiaComponent', () => {
  let component: GuiaComponent;
  let fixture: ComponentFixture<GuiaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuiaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GuiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
