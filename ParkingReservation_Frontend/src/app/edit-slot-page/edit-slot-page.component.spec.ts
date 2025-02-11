import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSlotPageComponent } from './edit-slot-page.component';

describe('EditSlotPageComponent', () => {
  let component: EditSlotPageComponent;
  let fixture: ComponentFixture<EditSlotPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditSlotPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditSlotPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
