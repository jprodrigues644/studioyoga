import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

import { SessionService } from './session.service';

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SessionInformation } from '../models/sessionInformation.interface';


/*----Mocks----*/
const mockSession: SessionInformation  = 
  {
    id: 1,
    token: 'mockToken',
    type: 'Bearer',
    username: 'john@Doe.com',
    firstName: 'John',
    lastName: 'Doe',
    admin: false
  }




describe('SessionService', () => {
  let service: SessionService;
  let httpMock: HttpTestingController;



  beforeEach(() => {
    
   TestBed.configureTestingModule({
    imports: [HttpClientTestingModule],
  });
    service = TestBed.inject(SessionService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    httpMock.verify();
      jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

 describe('Initial State', () => {
    it('should have isLogged set to false by default', () => {
      expect(service.isLogged).toBe(false);
    });

    it('should have sessionInformation set to undefined by default', () => {
      expect(service.sessionInformation).toBeUndefined();
    });
  });

  describe('$isLogged', () => {
    it('should emit the current isLogged value', (done) => {
      service.$isLogged().subscribe((isLogged) => {
        expect(isLogged).toBe(false);
        done();
      });
    });
  });

   describe('logIn', () => {
    it('should set isLogged to true', () => {
      service.logIn(mockSession);
      expect(service.isLogged).toBe(true);
    });

    it('should set sessionInformation to the provided user', () => {
      service.logIn(mockSession);
      expect(service.sessionInformation).toEqual(mockSession);
    });

    it('should emit the new isLogged value', (done) => {
      service.$isLogged().subscribe((isLogged) => {
        if (isLogged) {
          expect(isLogged).toBe(true);
          done();
        }
      });
      service.logIn(mockSession);
    });
  });

  describe('logOut', () => {
    it('should set isLogged to false', () => {
      service.logIn(mockSession);
      service.logOut();
      expect(service.isLogged).toBe(false);
    });

    it('should set sessionInformation to undefined', () => {
      service.logIn(mockSession);
      service.logOut();
      expect(service.sessionInformation).toBeUndefined();
    });

    it('should emit the new isLogged value', (done) => {
      service.logIn(mockSession);
      service.$isLogged().subscribe((isLogged) => {
        if (!isLogged) {
          expect(isLogged).toBe(false);
          done();
        }
      });
      service.logOut();
    });
  });

   describe('Admin User', () => {
    it('should correctly set admin user information', () => {
      const adminSessionInformation: SessionInformation = {
        id: 2,
        token: 'admin-token',
        type: 'Bearer',
        username: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        admin: true
      };

      service.logIn(adminSessionInformation);
      expect(service.sessionInformation).toEqual(adminSessionInformation);
      expect(service.sessionInformation?.admin).toBe(true);
    });
  });

  describe('Next Method', () => {
    it('should update the isLoggedSubject with the current isLogged value', (done) => {
      service.$isLogged().subscribe((isLogged) => {
        expect(isLogged).toBe(true);
        done();
      });
      service.logIn(mockSession);
    });
  });



});
