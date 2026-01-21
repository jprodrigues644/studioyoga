import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

import { TeacherService } from './teacher.service';
import { Teacher } from '../models/teacher.interface';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

/*----Mocks----*/
const mockTeachers: Teacher[] = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 2,
    firstName: 'Jane',
    lastName: 'Doe',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

 const mockTeacher: Teacher = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date(),
        updatedAt: new Date()
      };

describe('TeacherService', () => {
  let service: TeacherService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:[
      HttpClientTestingModule
      ],
      providers: [TeacherService]
    });
    service = TestBed.inject(TeacherService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    httpMock.verify();
      jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('all', () => {
    it('should call GET /api/teacher and return an array of teachers', () => {

      service.all().subscribe((teachers) => {
        expect(teachers).toEqual(mockTeachers);
      });

      const req = httpMock.expectOne('api/teacher');
      expect(req.request.method).toBe('GET');
      req.flush(mockTeachers);
    });
  });

  describe('detail', () => {
    it('should call GET /api/teacher/:id and return a teacher', () => {
      service.detail('1').subscribe((teacher) => {
        expect(teacher).toEqual(mockTeacher);
      });

      const req = httpMock.expectOne('api/teacher/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockTeacher);
    }
  );
  });
   describe('pathService', () => {
    it('should use correct API path for all methods', () => {
    // Test for the method all()
      service.all().subscribe();
      const reqAll = httpMock.expectOne('api/teacher');
      expect(reqAll.request.url).toBe('api/teacher');
      reqAll.flush([]);

      // Test for the method detail()
      const teacherId = '1';
      service.detail(teacherId).subscribe();
      const reqDetail = httpMock.expectOne(`api/teacher/${teacherId}`);
      expect(reqDetail.request.url).toBe(`api/teacher/${teacherId}`);
      reqDetail.flush({});
    });
  });
     

});
