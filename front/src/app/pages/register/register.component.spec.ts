import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { expect } from '@jest/globals';

import { RegisterComponent } from './register.component';
import { AuthService } from 'src/app/core/service/auth.service';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

const authServiceMock = {
  register: jest.fn()
};

const routerMock = {
  navigate: jest.fn()
};

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let fb: FormBuilder;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RegisterComponent,
        HttpClientTestingModule,
        ReactiveFormsModule,
        RouterTestingModule,
        BrowserAnimationsModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        FormBuilder
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /*==== Unit tests ====*/
  it('should initialize the form with empty values and required validators', () => {
    const firstNameControl = component.form.get('firstName');
    const lastNameControl = component.form.get('lastName');
    const emailControl = component.form.get('email');
    const passwordControl = component.form.get('password');

    expect(firstNameControl?.value).toBe('');
    expect(firstNameControl?.validator).toBeDefined();
    expect(lastNameControl?.value).toBe('');
    expect(lastNameControl?.validator).toBeDefined();
    expect(emailControl?.value).toBe('');
    expect(emailControl?.validator).toBeDefined();
    expect(passwordControl?.value).toBe('');
    expect(passwordControl?.validator).toBeDefined();
  });

  it('should disable the submit button when the form is invalid', () => {
    component.form.setValue({
      firstName: '',
      lastName: '',
      email: '',
      password: ''
    });
    fixture.detectChanges();
    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(submitButton.disabled).toBe(true);
  });

  it('should enable the submit button when the form is valid', () => {
    component.form.setValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123'
    });
    fixture.detectChanges();
    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(submitButton.disabled).toBe(false);
  });

  it('should call ngOnDestroy and complete the destroy$ subject', () => {
    const nextSpy = jest.spyOn(component['destroy$'], 'next');
    const completeSpy = jest.spyOn(component['destroy$'], 'complete');
    component.ngOnDestroy();
    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });

  /*==== Integration tests ====*/
  it('should call AuthService.register on successful form submission', () => {
    authServiceMock.register.mockReturnValue(of({}));
    component.form.setValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123'
    });
    component.submit();
    expect(authServiceMock.register).toHaveBeenCalledWith({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123'
    });
  });

  it('should navigate to login page after successful registration', () => {
    authServiceMock.register.mockReturnValue(of({}));
    component.form.setValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123'
    });
    component.submit();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should set onError to true when registration fails', () => {
    authServiceMock.register.mockReturnValue(throwError(() => new Error('Registration failed')));
    component.form.setValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123'
    });
    component.submit();
    expect(component.onError).toBe(true);
  });

  it('should display an error message when onError is true', () => {
    component.onError = true;
    fixture.detectChanges();
    const errorMessage = fixture.nativeElement.querySelector('.error');
    expect(errorMessage).toBeTruthy();
    expect(errorMessage.textContent).toContain('An error occurred');
  });

});