import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

import { UserService } from './user.service';
import { Teacher } from '../models/teacher.interface';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { User } from '../models/user.interface';

/*----Mocks----*/
const mockUser: User = {
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@Doe.com',
  admin: false,
  password: 'password123',
  createdAt: new Date(),
  updatedAt: new Date()
};  

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getById', () => {
    it('should call GET /api/user/{id} and return a user', () => {
      service.getById('1').subscribe((user) => {
        expect(user).toEqual(mockUser);
      });

      const req = httpMock.expectOne('api/user/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });
  });

  describe('delete', () => {
    it('should call DELETE /api/user/{id}', () => {
      service.delete('1').subscribe((response) => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne('api/user/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('pathService', () => {
    it('should use correct API path for all methods', () => {
      // Test for the getById() method
      const userId = '1';
      service.getById(userId).subscribe();
      const reqGetById = httpMock.expectOne(`${service['pathService']}/${userId}`);
      expect(reqGetById.request.url).toBe(`${service['pathService']}/${userId}`);
      reqGetById.flush(mockUser);

      // Testfor
      // delete()
      service.delete(userId).subscribe();
      const reqDelete = httpMock.expectOne(`${service['pathService']}/${userId}`);
      expect(reqDelete.request.url).toBe(`${service['pathService']}/${userId}`);
      reqDelete.flush(null);
    });
  });




});