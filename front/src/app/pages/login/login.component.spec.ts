import { HttpClientTestingModule, HttpTestingController } 
  from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { expect } from '@jest/globals';
import { SessionService } from 'src/app/core/service/session.service';

import { LoginComponent } from './login.component';
import { SessionInformation } from 'src/app/core/models/sessionInformation.interface';
import { AuthService } from 'src/app/core/service/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

 const mockSessionInformation: SessionInformation = {
    id: 1,
    token: 'mock-token',
    type: 'Bearer',
    username: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    admin: false
  };

  const authServiceMock = {
    login: jest.fn()
  };

  const sessionServiceMock = {
    logIn: jest.fn()
  };

  const routerMock = {
    navigate: jest.fn()
  };

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let fb: FormBuilder;

  beforeEach(async () => {
   
    await TestBed.configureTestingModule({
    
      imports: [
        LoginComponent,
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
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: Router, useValue: routerMock },
        FormBuilder
      ]
    }).compileComponents();
     fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
     //httpMock = TestBed.inject(HttpTestingController);
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
      const emailControl = component.form.get('email');
      const passwordControl = component.form.get('password');

      expect(emailControl?.value).toBe('');
      expect(emailControl?.validator).toBeDefined();
      expect(passwordControl?.value).toBe('');
      expect(passwordControl?.validator).toBeDefined();
    });

    it('should disable the submit button when the form is invalid', () => {
      component.form.setValue({ email: '', password: '' });
      fixture.detectChanges();
      const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(submitButton.disabled).toBe(true);
    });

    it('should enable the submit button when the form is valid', () => {
      component.form.setValue({ email: 'test@example.com', password: '123456' });
      fixture.detectChanges();
      const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(submitButton.disabled).toBe(false);
    });

       it('should toggle password visibility when clicking the eye icon', () => {
      const eyeIcon = fixture.nativeElement.querySelector('button[mat-icon-button]');
      expect(component.hide).toBe(true);
      eyeIcon.click();
      expect(component.hide).toBe(false);
      eyeIcon.click();
      expect(component.hide).toBe(true);
    });

     it('should call ngOnDestroy and complete the destroy$ subject', () => {
      const nextSpy = jest.spyOn(component['destroy$'], 'next');
      const completeSpy = jest.spyOn(component['destroy$'], 'complete');
      component.ngOnDestroy();
      expect(nextSpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });


    //*==== Integration tests ====*//

     it('should call AuthService.login and SessionService.logIn on successful form submission', () => {
      authServiceMock.login.mockReturnValue(of(mockSessionInformation));
      component.form.setValue({ email: 'test@example.com', password: '123456' });
      component.submit();
      expect(authServiceMock.login).toHaveBeenCalledWith({ email: 'test@example.com', password: '123456' });
      expect(sessionServiceMock.logIn).toHaveBeenCalledWith(mockSessionInformation);
      expect(routerMock.navigate).toHaveBeenCalledWith(['/sessions']);
    });

    it('should set onError to true when login fails', () => {
      authServiceMock.login.mockReturnValue(throwError(() => new Error('Login failed')));
      component.form.setValue({ email: 'test@example.com', password: '123456' });
      component.submit();
      expect(component.onError).toBe(true);
      expect(sessionServiceMock.logIn).not.toHaveBeenCalled();
      expect(routerMock.navigate).not.toHaveBeenCalled();
    });

    it('should display an error message when onError is true', () => {
      component.onError = true;
      fixture.detectChanges();
      const errorMessage = fixture.nativeElement.querySelector('.error');
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.textContent).toContain('An error occurred');
    });
    
});



  


