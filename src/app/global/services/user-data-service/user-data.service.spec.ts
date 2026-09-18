import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { UserDataService } from './user-data.service';

describe('UserDataService', () => {
  let service: UserDataService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(UserDataService);
    for (const req of httpMock.match(() => true)) {
      req.flush(JSON.stringify({ userName: null }));
    }
  });

  afterEach(() => {
    httpMock.match(() => true).forEach((req) => req.flush(JSON.stringify({ userName: null })));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
