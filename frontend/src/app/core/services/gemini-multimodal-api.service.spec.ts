import { TestBed } from '@angular/core/testing';

import { GeminiMultimodalApiService } from './gemini-multimodal-api.service';

describe('GeminiMultimodalApiService', () => {
  let service: GeminiMultimodalApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeminiMultimodalApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
