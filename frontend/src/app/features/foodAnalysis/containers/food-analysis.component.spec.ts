import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FoodAnalysisComponent } from './food-analysis.component';

describe('FoodAnalysisComponent', () => {
  let component: FoodAnalysisComponent;
  let fixture: ComponentFixture<FoodAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FoodAnalysisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FoodAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
