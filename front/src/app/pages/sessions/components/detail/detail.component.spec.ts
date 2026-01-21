/// <reference types="jest" />

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetailComponent } from './detail.component';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs';

import { SessionService } from '../../../../core/service/session.service';
import { SessionApiService } from '../../../../core/service/session-api.service';
import { TeacherService } from '../../../../core/service/teacher.service';
import { expect } from '@jest/globals';
/* =======================
   MOCK DATA
======================= */

const mockSession = {
  id: 1,
  name: 'Angular Session',
  date: '2024-01-01',
  teacher_id: 10,
  users: [1]
};

const mockTeacher = {
  id: 10,
  firstName: 'John',
  lastName: 'Doe'
};

const mockSessionService = {
  sessionInformation: {
    admin: true,
    id: 1
  }
};

const sessionApiServiceMock = {
  detail: jest.fn().mockReturnValue(of(mockSession)),
  delete: jest.fn().mockReturnValue(of(void 0)),
  participate: jest.fn().mockReturnValue(of(void 0)),
  unParticipate: jest.fn().mockReturnValue(of(void 0)),
};

const teacherServiceMock = {
  detail: jest.fn().mockReturnValue(of(mockTeacher))
};

const activatedRouteMock = {
  snapshot: {
    paramMap: {
      get: jest.fn().mockReturnValue('1')
    }
  }
};

describe('DetailComponent', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DetailComponent,  // Move here from declarations
        RouterTestingModule,
        HttpClientModule,
        MatSnackBarModule
      ],
      providers: [
        { provide: SessionService, useValue: mockSessionService },
        { provide: SessionApiService, useValue: sessionApiServiceMock },
        { provide: TeacherService, useValue: teacherServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /* =======================
     UNIT TESTS
  ======================= */

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
  it('should load session details on init', () => {
    expect(sessionApiServiceMock.detail).toHaveBeenCalledWith('1');
    expect(component.session).toEqual(mockSession);
  });
  
   it('should load teacher details after session load', () => {
    expect(teacherServiceMock.detail).toHaveBeenCalledWith('10');
    expect(component.teacher).toEqual(mockTeacher);
  });
  it('should set isParticipate to true if user is in session', () => {
    expect(component.isParticipate).toBe(true);
  });

  it('should detect admin user', () => {
    expect(component.isAdmin).toBe(true);
  });

  
  /* =======================
     UNIT TESTS FOR METHODS
  ======================= */

  /* =======================
  Integration Tests
======================= */
 it('should display delete button if user is admin', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Delete');
  });

   it('should call participate and reload session', () => {
    component.participate();

    expect(sessionApiServiceMock.participate)
      .toHaveBeenCalledWith('1', '1');
  });

  it('should call unParticipate and reload session', () => {
    component.unParticipate();

    expect(sessionApiServiceMock.unParticipate)
      .toHaveBeenCalledWith('1', '1');
  });
  it('should delete session and navigate to sessions', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = jest.spyOn(router, 'navigate');

    component.delete();

    expect(sessionApiServiceMock.delete).toHaveBeenCalledWith('1');
    expect(navigateSpy).toHaveBeenCalledWith(['sessions']);
  });


});