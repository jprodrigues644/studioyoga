import { ComponentFixture, TestBed } from '@angular/core/testing';
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
  open: jest.fn()
};

describe('MeComponent', () => {
  let component: MeComponent;
  let fixture: ComponentFixture<MeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MeComponent],
      imports: [
        MatSnackBarModule,
        MatCardModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule
      ],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: MatSnackBar, useValue: snackBarMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /* ---------- EXAMPLE TEST ---------- */
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
  
});