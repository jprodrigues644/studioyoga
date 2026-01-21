import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';
import { expect } from '@jest/globals';

import { FormComponent } from './form.component';
import { SessionService } from '../../../../core/service/session.service';
import { SessionApiService } from '../../../../core/service/session-api.service';
import { TeacherService } from '../../../../core/service/teacher.service';

/* ---------- MOCK DATA ---------- */
const normalUser = {
  id: 2,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@doe.com',
  admin: false
};

const adminUser = {
  id: 1,
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@user.com',
  admin: true
};

const mockTeachers = [
  { id: 1, firstName: 'Teacher', lastName: 'Jane' },
  { id: 2, firstName: 'Teacher', lastName: 'Thom' }
];

const mockSession = {
  id: 1,
  name: 'Yoga Basics',
  description: 'Basic yoga session',
  date: '2026-01-15',
  teacher_id: 1,
  users: []
};

/* ---------- MOCKS ---------- */
const sessionServiceMock = {
  sessionInformation: adminUser
};

const sessionApiServiceMock = {
  detail: jest.fn(),
  create: jest.fn(),
  update: jest.fn()
};

const teacherServiceMock = {
  all: jest.fn().mockReturnValue(of(mockTeachers))
};

const matSnackBarMock = {
  open: jest.fn()
};

const activatedRouteMock = {
  snapshot: {
    paramMap: {
      get: jest.fn()
    }
  }
};

const routerMock = {
  navigate: jest.fn(),
  url: '/create'
};

describe('FormComponent', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        HttpClientTestingModule
      ],
      providers: [
        FormBuilder,
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: SessionApiService, useValue: sessionApiServiceMock },
        { provide: TeacherService, useValue: teacherServiceMock },
        { provide: MatSnackBar, useValue: matSnackBarMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /* =========================
     UNIT TESTS
     ========================= */

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form in create mode', () => {
    routerMock.url = '/create';

    fixture.detectChanges();

    expect(component.onUpdate).toBe(false);
    expect(component.sessionForm).toBeDefined();
    expect(component.sessionForm?.get('name')?.value).toBe('');
  });

  it('should initialize form in update mode', fakeAsync(() => {
    routerMock.url = '/update/1';
    activatedRouteMock.snapshot.paramMap.get.mockReturnValue('1');
    sessionApiServiceMock.detail.mockReturnValue(of(mockSession));

    fixture.detectChanges();
    tick();

    expect(component.onUpdate).toBe(true);
    expect(sessionApiServiceMock.detail).toHaveBeenCalledWith('1');
    expect(component.sessionForm?.get('name')?.value).toBe('Yoga Basics');
  }));

  it('should redirect non-admin users to sessions list', () => {
    sessionServiceMock.sessionInformation = normalUser;

    fixture.detectChanges();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/sessions']);
  });

  it('should load teachers on init', () => {
    sessionServiceMock.sessionInformation = adminUser;
    routerMock.url = '/create';

    fixture.detectChanges();

    expect(teacherServiceMock.all).toHaveBeenCalled();
  });

  it('should have required validators on all fields', () => {
    routerMock.url = '/create';

    fixture.detectChanges();

    expect(component.sessionForm?.get('name')?.hasError('required')).toBe(true);
    expect(component.sessionForm?.get('date')?.hasError('required')).toBe(true);
    expect(component.sessionForm?.get('teacher_id')?.hasError('required')).toBe(true);
    expect(component.sessionForm?.get('description')?.hasError('required')).toBe(true);
  });

  /* =========================
     INTEGRATION TESTS
     ========================= */

  it('should create session when form is valid in create mode', fakeAsync(() => {
    sessionServiceMock.sessionInformation = adminUser;
    routerMock.url = '/create';
    sessionApiServiceMock.create.mockReturnValue(of(mockSession));

    fixture.detectChanges();

    component.sessionForm?.patchValue({
      name: 'New Session',
      date: '2026-02-01',
      teacher_id: 1,
      description: 'Test description'
    });

    component.submit();
    tick();

    expect(sessionApiServiceMock.create).toHaveBeenCalledWith({
      name: 'New Session',
      date: '2026-02-01',
      teacher_id: 1,
      description: 'Test description'
    });

    expect(matSnackBarMock.open).toHaveBeenCalledWith(
      'Session created !',
      'Close',
      { duration: 3000 }
    );

    expect(routerMock.navigate).toHaveBeenCalledWith(['sessions']);
  }));

  it('should update session when form is valid in update mode', fakeAsync(() => {
    sessionServiceMock.sessionInformation = adminUser;
    routerMock.url = '/update/1';
    activatedRouteMock.snapshot.paramMap.get.mockReturnValue('1');
    sessionApiServiceMock.detail.mockReturnValue(of(mockSession));
    sessionApiServiceMock.update.mockReturnValue(of(mockSession));

    fixture.detectChanges();
    tick();

    component.sessionForm?.patchValue({
      name: 'Updated Session',
      date: '2026-02-01',
      teacher_id: 1,
      description: 'Updated description'
    });

    component.submit();
    tick();

    expect(sessionApiServiceMock.update).toHaveBeenCalledWith('1', {
      name: 'Updated Session',
      date: '2026-02-01',
      teacher_id: 1,
      description: 'Updated description'
    });

    expect(matSnackBarMock.open).toHaveBeenCalledWith(
      'Session updated !',
      'Close',
      { duration: 3000 }
    );

    expect(routerMock.navigate).toHaveBeenCalledWith(['sessions']);
  }));

  it('should call ngOnDestroy and complete destroy$', () => {
    const nextSpy = jest.spyOn(component['destroy$'], 'next');
    const completeSpy = jest.spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });
});
