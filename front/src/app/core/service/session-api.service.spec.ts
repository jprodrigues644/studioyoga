import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

import { SessionApiService } from './session-api.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Session } from '../models/session.interface';

describe('SessionApiService', () => {
  let service: SessionApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SessionApiService]
    });
    service = TestBed.inject(SessionApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
 describe('all', () => {
    it('should call GET /api/session and return an array of sessions', () => {
     const mockSessions: Session[] = [
        {
      id: 1,
      name: 'Session 1',
      description: 'Description 1',
      date: new Date(),
      teacher_id: 10,
      users: []
    },
    {
      id: 2,
      name: 'Session 2',
      description: 'Description 2',
      date: new Date(),
      teacher_id: 11,
      users: []
    }
  ];
      

      service.all().subscribe((sessions) => {
        expect(sessions).toEqual(mockSessions);
      });

      const req = httpMock.expectOne('api/session');
      expect(req.request.method).toBe('GET');
      req.flush(mockSessions);
    });
  });

  describe('detail', () => {
    
    it('should call GET /api/session/:id and return a session', () => {
      const mockSession: Session = {
        id: 1,
        name: 'Session 1',
        description: 'Description 1',
        date: new Date(),
        teacher_id: 1,
        users: []
      };

      service.detail('1').subscribe((session) => {
        expect(session).toEqual(mockSession);
      });

      const req = httpMock.expectOne('api/session/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockSession);
    });
  });

   describe('delete', () => {
    it('should call DELETE /api/session/:id', () => {
      service.delete('1').subscribe();

      const req = httpMock.expectOne('api/session/1')
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

   describe('create', () => {
    it('should call POST /api/session with session data', () => {
      const newSession: Session = {   id: 1,
        name: 'Session 1',
        description: 'Description 1',
        date: new Date(),
        teacher_id: 1,
        users: []
      };

      service.create(newSession).subscribe();
      const req = httpMock.expectOne('api/session');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newSession);
      req.flush(newSession);
    });
  });


    describe('update', () => {      
    it('should call PUT /api/session/:id with session data', () => {
      const updatedSession: Session = {   id: 1,
        name: 'Updated Session',
        description: 'Updated Description',
        date: new Date(),
        teacher_id: 1,
        users: []
      };

      service.update('1', updatedSession).subscribe();
      const req = httpMock.expectOne('api/session/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedSession);
      req.flush(updatedSession);
    });
  });

  describe('participate', () => {
    it('should call POST /api/session/:id/participate/:userId', () => {
      service.participate('1', '100').subscribe();

      const req = httpMock.expectOne('api/session/1/participate/100');
      expect(req.request.method).toBe('POST');
      req.flush(null);
    });
  });

  describe('unParticipate', () => {
    it('should call DELETE /api/session/:id/participate/:userId', () => {
      service.unParticipate('1', '100').subscribe();

      const req = httpMock.expectOne('api/session/1/participate/100');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });




});