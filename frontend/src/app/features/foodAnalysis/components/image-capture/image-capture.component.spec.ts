import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageCaptureComponent } from './image-capture.component';

describe('ImageCaptureComponent', () => {
  let component: ImageCaptureComponent;
  let fixture: ComponentFixture<ImageCaptureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageCaptureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageCaptureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
