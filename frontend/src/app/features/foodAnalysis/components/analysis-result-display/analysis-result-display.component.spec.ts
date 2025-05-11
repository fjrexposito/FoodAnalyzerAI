import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalysisResultDisplayComponent } from './analysis-result-display.component';

describe('AnalysisResultDisplayComponent', () => {
  let component: AnalysisResultDisplayComponent;
  let fixture: ComponentFixture<AnalysisResultDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalysisResultDisplayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalysisResultDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
