import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';
import { AuthService } from './auth.service';
import { LoginRequest } from '../models/loginRequest.interface';
import { RegisterRequest } from '../models/registerRequest.interface';
import { SessionInformation } from 'src/app/core/models/sessionInformation.interface';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('register', () => {
    it('should call POST /api/auth/register with register data', () => {
      const registerRequest: RegisterRequest = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123'
      };

      service.register(registerRequest).subscribe();

      const req = httpMock.expectOne('/api/auth/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(registerRequest);
      
      req.flush(null);
    });

    it('should return Observable<void> on successful registration', () => {
      const registerRequest: RegisterRequest = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123'
      };

      service.register(registerRequest).subscribe({
        next: (response) => {
          expect(response).toBeUndefined();
        }
      });

      const req = httpMock.expectOne('/api/auth/register');
      req.flush(null);
    });

    it('should handle registration error', () => {
      const registerRequest: RegisterRequest = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123'
      };
      const errorMessage = 'Email already exists';

      service.register(registerRequest).subscribe({
        next: () => fail('should have failed with 400 error'),
        error: (error) => {
          expect(error.status).toBe(400);
          expect(error.error).toBe(errorMessage);
        }
      });

      const req = httpMock.expectOne('/api/auth/register');
      req.flush(errorMessage, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('login', () => {
    it('should call POST /api/auth/login with login credentials', () => {
      const loginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockResponse: SessionInformation = {
        token: 'mock-jwt-token',
        type: 'Bearer',
        id: 1,
        username: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        admin: false
      };

      service.login(loginRequest).subscribe();

      const req = httpMock.expectOne('/api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(loginRequest);
      
      req.flush(mockResponse);
    });

    it('should return SessionInformation on successful login', () => {
      const loginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockResponse: SessionInformation = {
        token: 'mock-jwt-token',
        type: 'Bearer',
        id: 1,
        username: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        admin: false
      };

      service.login(loginRequest).subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
          expect(response.token).toBe('mock-jwt-token');
          expect(response.username).toBe('test@example.com');
          expect(response.admin).toBe(false);
        }
      });

      const req = httpMock.expectOne('/api/auth/login');
      req.flush(mockResponse);
    });

    it('should return SessionInformation with admin=true for admin user', () => {
      const loginRequest: LoginRequest = {
        email: 'admin@example.com',
        password: 'admin123'
      };

      const mockResponse: SessionInformation = {
        token: 'admin-jwt-token',
        type: 'Bearer',
        id: 1,
        username: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        admin: true
      };

      service.login(loginRequest).subscribe({
        next: (response) => {
          expect(response.admin).toBe(true);
        }
      });

      const req = httpMock.expectOne('/api/auth/login');
      req.flush(mockResponse);
    });

    it('should handle login error for invalid credentials', () => {
      const loginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };
      const errorMessage = 'Invalid credentials';

      service.login(loginRequest).subscribe({
        next: () => fail('should have failed with 401 error'),
        error: (error) => {
          expect(error.status).toBe(401);
          expect(error.error).toBe(errorMessage);
        }
      });

      const req = httpMock.expectOne('/api/auth/login');
      req.flush(errorMessage, { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle server error during login', () => {
      const loginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'password123'
      };

      service.login(loginRequest).subscribe({
        next: () => fail('should have failed with 500 error'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne('/api/auth/login');
      req.flush('Internal Server Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('pathService', () => {
    it('should use correct API path for register', () => {
      const registerRequest: RegisterRequest = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123'
      };

      service.register(registerRequest).subscribe();

      const req = httpMock.expectOne((request) => {
        return request.url === '/api/auth/register';
      });
      expect(req.request.url).toBe('/api/auth/register');
      req.flush(null);
    });

    it('should use correct API path for login', () => {
      const loginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockResponse: SessionInformation = {
        token: 'mock-jwt-token',
        type: 'Bearer',
        id: 1,
        username: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        admin: false
      };

      service.login(loginRequest).subscribe();

      const req = httpMock.expectOne((request) => {
        return request.url === '/api/auth/login';
      });
      expect(req.request.url).toBe('/api/auth/login');
      req.flush(mockResponse);
    });
  });
});