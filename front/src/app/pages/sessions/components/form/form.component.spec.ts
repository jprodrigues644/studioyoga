import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar'; 
import { NoopAnimationsModule } from '@angular/platform-browser/animations'; 
import { ActivatedRoute, Router } from '@angular/router';
import { expect } from '@jest/globals';
import { SessionService } from 'src/app/core/service/session.service';
import { SessionApiService } from '../../../../core/service/session-api.service';
import { TeacherService } from '../../../../core/service/teacher.service';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';

import { FormComponent } from './form.component';

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

const mockSessions = {
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
  all: jest.fn().mockReturnValue(of(mockSessions)),
  detail: jest.fn().mockReturnValue(of(mockSessions)),
  create: jest.fn().mockReturnValue(of(mockSessions)),
  update: jest.fn().mockReturnValue(of(mockSessions))
};

const teacherServiceMock = {
  all: jest.fn().mockReturnValue(of(mockTeachers))
};

const matSnackBarMock = {
  open: jest.fn()
};

describe('FormComponent', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormComponent,
        HttpClientModule,
        MatCardModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatSelectModule,
        NoopAnimationsModule // Correction : Utilisation de Noop pour éviter les crashs CSS
      ],
      providers: [
        provideRouter([
          { path: 'sessions', component: FormComponent },
          { path: 'create', component: FormComponent },
          { path: 'update/:id', component: FormComponent }
        ]),
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: SessionApiService, useValue: sessionApiServiceMock },
        { provide: TeacherService, useValue: teacherServiceMock },
        { provide: MatSnackBar, useValue: matSnackBarMock } // Le mock remplace le vrai service
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
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
    // ARRANGE
    jest.spyOn(router, 'url', 'get').mockReturnValue('/create');

    // ACT
    fixture.detectChanges();

    // ASSERT
    expect(component.onUpdate).toBe(false);
    expect(component.sessionForm).toBeDefined();
    expect(component.sessionForm?.get('name')?.value).toBe('');
  });

  it('should initialize form in update mode', () => {
    // ARRANGE
    const route = TestBed.inject(ActivatedRoute);
    // Correction : Mock du paramMap pour éviter le "null"
    jest.spyOn(route.snapshot.paramMap, 'get').mockReturnValue('1');
    jest.spyOn(router, 'url', 'get').mockReturnValue('/update/1');
    
    sessionApiServiceMock.detail.mockReturnValue(of(mockSessions));

    // ACT
    fixture.detectChanges();

    // ASSERT
    expect(component.onUpdate).toBe(true);
    expect(sessionApiServiceMock.detail).toHaveBeenCalledWith('1');
    expect(component.sessionForm?.get('name')?.value).toBe('Yoga Basics');
  });

  it('should redirect non-admin users to sessions list', () => {
    // ARRANGE
    sessionServiceMock.sessionInformation = normalUser;
    const navigateSpy = jest.spyOn(router, 'navigate');

    // ACT
    fixture.detectChanges();

    // ASSERT
    expect(navigateSpy).toHaveBeenCalledWith(['/sessions']);
  });

  it('should load teachers on init', () => {
    // ARRANGE
    sessionServiceMock.sessionInformation = adminUser;
    jest.spyOn(router, 'url', 'get').mockReturnValue('/create');

    // ACT
    fixture.detectChanges();

    // ASSERT
    expect(teacherServiceMock.all).toHaveBeenCalled();
  });

  it('should have required validators on all fields', () => {
    // ARRANGE
    jest.spyOn(router, 'url', 'get').mockReturnValue('/create');

    // ACT
    fixture.detectChanges();

    // ASSERT
    expect(component.sessionForm?.get('name')?.hasError('required')).toBe(true);
    expect(component.sessionForm?.get('date')?.hasError('required')).toBe(true);
    expect(component.sessionForm?.get('teacher_id')?.hasError('required')).toBe(true);
    expect(component.sessionForm?.get('description')?.hasError('required')).toBe(true);
  });
  
  /* it('should create session when form is valid in create mode', () => {
    // ARRANGE
    sessionServiceMock.sessionInformation = adminUser; 
    jest.spyOn(router, 'url', 'get').mockReturnValue('/create');
    const navigateSpy = jest.spyOn(router, 'navigate');
    
    sessionApiServiceMock.create.mockReturnValue(of(mockSessions));
    fixture.detectChanges(); 

    component.sessionForm?.patchValue({
      name: 'New Session',
      date: '2026-02-01',
      teacher_id: 1,
      description: 'Test description'
    });

    // ACT
    component.submit();

    // ASSERT
    expect(sessionApiServiceMock.create).toHaveBeenCalled();
    expect(matSnackBarMock.open).toHaveBeenCalledWith('Session created !', 'Close', { duration: 3000 });
    expect(navigateSpy).toHaveBeenCalledWith(['sessions']);
  }); */
});