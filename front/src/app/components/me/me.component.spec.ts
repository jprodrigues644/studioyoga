/// <reference types="jest" />

import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { MeComponent } from './me.component';
import { UserService } from '../../core/service/user.service';
import { SessionService } from '../../core/service/session.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { of } from 'rxjs';

/* ---------- USERS ---------- */
const normalUser = {
  id: 2,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@doe.com',
  admin: false,
  createdAt: new Date(),
  updatedAt: new Date()
};

const adminUser = {
  id: 1,
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@user.com',
  admin: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

/* ---------- MOCKS ---------- */
const userServiceMock = {
  getById: jest.fn(),
  delete: jest.fn()
};

const sessionServiceMock = {
  sessionInformation: {
    id: 1,
    admin: true
  },
  logOut: jest.fn()
};

const routerMock = {
  navigate: jest.fn()
};

const snackBarMock = {
  open: jest.fn().mockReturnValue({
    onAction: () => of({}),
    afterDismissed: () => of({})
  })
};

describe('MeComponent', () => {
  let component: MeComponent;
  let fixture: ComponentFixture<MeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MeComponent,
        MatSnackBarModule,
        MatCardModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: MatSnackBar, useValue: snackBarMock }
      ]
    }).compileComponents();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test to verify component creation
  it('should create', () => {
    // ARRANGE
    userServiceMock.getById.mockReturnValue(of(adminUser));
    
    // ACT
    fixture = TestBed.createComponent(MeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    
    // ASSERT
    expect(component).toBeTruthy();
  });

  it('should load and display user information', () => {
    // ARRANGE
    userServiceMock.getById.mockReturnValue(of(normalUser));
    
    // ACT
    fixture = TestBed.createComponent(MeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // déclenche ngOnInit

    // ASSERT
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('John');
    expect(compiled.textContent).toContain('DOE');
    expect(compiled.textContent).toContain('john@doe.com');
  });

  it('should display admin message when user is admin', () => {
    // ARRANGE
    userServiceMock.getById.mockReturnValue(of(adminUser));
    
    // ACT
    fixture = TestBed.createComponent(MeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // ASSERT
    expect(fixture.nativeElement.textContent).toContain('You are admin');
  });
  

  it('should go back when back() is called', () => {
    // ARRANGE
    userServiceMock.getById.mockReturnValue(of(adminUser));
    fixture = TestBed.createComponent(MeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    
    const spy = jest.spyOn(window.history, 'back');

    // ACT
    component.back();

    // ASSERT
    expect(spy).toHaveBeenCalled();
  });

  /* =========================
     TEST D'INTÉGRATION
     ========================= */

  it('should delete account, logout user and redirect', fakeAsync(() => {
  // ARRANGE
  userServiceMock.getById.mockReturnValue(of(normalUser));
  userServiceMock.delete.mockReturnValue(of(null));

  fixture = TestBed.createComponent(MeComponent);
  component = fixture.componentInstance;
  
  // Spy on the component's injected services before detectChanges
  const matSnackBarSpy = jest.spyOn(component['matSnackBar'], 'open');
  const sessionServiceSpy = jest.spyOn(component['sessionService'], 'logOut');
  const routerSpy = jest.spyOn(component['router'], 'navigate');
  
  fixture.detectChanges();

  // ACT
  component.delete();
  tick();
  flush();

  // ASSERT
  expect(userServiceMock.delete).toHaveBeenCalledWith('1');
  expect(matSnackBarSpy).toHaveBeenCalledWith(
    "Your account has been deleted !",
    'Close',
    { duration: 3000 }
  );
  expect(sessionServiceSpy).toHaveBeenCalled();
  expect(routerSpy).toHaveBeenCalledWith(['/']);
}));

});