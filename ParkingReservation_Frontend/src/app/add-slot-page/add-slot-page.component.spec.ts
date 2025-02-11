import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSlotPageComponent } from './add-slot-page.component';

describe('AddSlotPageComponent', () => {
  let component: AddSlotPageComponent;
  let fixture: ComponentFixture<AddSlotPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddSlotPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddSlotPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
