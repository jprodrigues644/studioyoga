import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { expect } from '@jest/globals';
import { SessionService } from 'src/app/core/service/session.service';
import { SessionApiService } from 'src/app/core/service/session-api.service';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router'; // ✅ ADDED

import { ListComponent } from './list.component';

/* ---------- USERS ---------- */
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

/* ---------- MOCK DATA ---------- */
const mockSessions = [
  {
    id: 1,
    name: 'Yoga Basics',
    date: '2026-01-01'
  }
];

/* ---------- MOCKS ---------- */
const sessionApiServiceMock = {
  all: jest.fn().mockReturnValue(of(mockSessions))
};

const sessionServiceMock = {
  sessionInformation: adminUser
};

describe('ListComponent', () => {
  let component: ListComponent;
  let fixture: ComponentFixture<ListComponent>;

  afterEach(() => {
    jest.clearAllMocks();
  });

  /* =========================
     UNIT TESTS
     ========================= */

  it('should create component as admin user', () => {
    // ARRANGE
    sessionServiceMock.sessionInformation = adminUser;

    TestBed.configureTestingModule({
      imports: [
        ListComponent,
        HttpClientModule
      ],
      providers: [
        provideRouter([]), // ✅ ADDED - Provides router dependencies
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: SessionApiService, useValue: sessionApiServiceMock }
      ]
    }).compileComponents();

    // ACT
    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // ASSERT
    expect(component).toBeTruthy();
  });

  it('should expose admin user information', () => {
    // ARRANGE
    sessionServiceMock.sessionInformation = adminUser;

    TestBed.configureTestingModule({
      imports: [ListComponent, HttpClientModule],
      providers: [
        provideRouter([]), // ✅ ADDED - Provides router dependencies
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: SessionApiService, useValue: sessionApiServiceMock }
      ]
    }).compileComponents();

    // ACT
    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // ASSERT
    expect(component.user?.admin).toBe(true);
  });

   it('should expose normal user information', () => {
    // ARRANGE
    sessionServiceMock.sessionInformation = normalUser;

    TestBed.configureTestingModule({
      imports: [ListComponent, HttpClientModule],
      providers: [
        provideRouter([]), 
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: SessionApiService, useValue: sessionApiServiceMock }
      ]
    }).compileComponents();

    // ACT
    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // ASSERT
    expect(component.user?.admin).toBe(false);
  });


  /* =========================
      INTEGRATION TESTS
      ========================= */  
    it('should display admin actions for admin user', () => {
    // ARRANGE
    sessionServiceMock.sessionInformation = adminUser;

    TestBed.configureTestingModule({
      imports: [ListComponent, HttpClientModule],
      providers: [
        provideRouter([]), 
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: SessionApiService, useValue: sessionApiServiceMock }
      ]
    }).compileComponents();

    // ACT
    fixture = TestBed.createComponent(ListComponent);
    fixture.detectChanges();

    // ASSERT
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Create');
  });

  it('should not display admin actions for normal user', () => {
    // ARRANGE
    sessionServiceMock.sessionInformation = normalUser;

    TestBed.configureTestingModule({
      imports: [ListComponent, HttpClientModule],
      providers: [
        provideRouter([]), 
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: SessionApiService, useValue: sessionApiServiceMock }
      ]
    }).compileComponents();

    // ACT
    fixture = TestBed.createComponent(ListComponent);
    fixture.detectChanges();

    // ASSERT
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).not.toContain('Create');
  });

  it('should load sessions from API', (done) => {
    // ARRANGE
    sessionServiceMock.sessionInformation = adminUser;

    TestBed.configureTestingModule({
      imports: [ListComponent, HttpClientModule],
      providers: [
        provideRouter([]), 
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: SessionApiService, useValue: sessionApiServiceMock }
      ]
    }).compileComponents();

    // ACT
    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // ASSERT
    component.sessions$.subscribe((sessions) => {
      expect(sessions).toEqual(mockSessions);
      expect(sessionApiServiceMock.all).toHaveBeenCalled();
      done();
    });
  });

});