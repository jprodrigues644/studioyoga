import { Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionInformation } from 'src/app/core/models/sessionInformation.interface';
import { SessionService } from 'src/app/core/service/session.service';
import { LoginRequest } from '../../core/models/loginRequest.interface';
import { AuthService } from '../../core/service/auth.service';
import {MaterialModule} from "../../shared/material.module";
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [CommonModule, MaterialModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
//Addition of OnDestroy to implement ngOnDestroy
export class LoginComponent  implements OnDestroy{
  
  ngOnDestroy(): void {
     this.destroy$.next();
    this.destroy$.complete();
  }
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private sessionService = inject(SessionService);
  private readonly destroy$ = new Subject<void>();

  public hide = true;
  public onError = false;

  //Addition of FormGroup for the login form
  public form: FormGroup = this.fb.group({
    email: [
      '',
      [
        Validators.required,
        Validators.email
      ]
    ],
    password: [
      '',
      [
        Validators.required,
        Validators.min(3)
      ]
    ]
  });

  public submit(): void {
    //Addition takeUntil to avoid memory leaks
    const loginRequest = this.form.value as LoginRequest;
    this.authService.login(loginRequest).
     pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: SessionInformation) => {
        this.sessionService.logIn(response);
        this.router.navigate(['/sessions']);
      },
       error: () => this.onError = true,
    });
  }
}
