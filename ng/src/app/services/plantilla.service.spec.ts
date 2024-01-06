import { TestBed } from '@angular/core/testing';

import { PlantillaService } from './plantilla.service';

describe('PlantillaService', () => {
  let service: PlantillaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlantillaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
