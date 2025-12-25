import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Teacher } from '../../../../core/models/teacher.interface';
import { SessionService } from '../../../../core/service/session.service';
import { TeacherService } from '../../../../core/service/teacher.service';
import { Session } from '../../../../core/models/session.interface';
import { SessionApiService } from '../../../../core/service/session-api.service';
import { MaterialModule } from "../../../../shared/material.module";
import { CommonModule } from "@angular/common";
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-detail',
  imports: [CommonModule, MaterialModule],
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit, OnDestroy {
  public session: Session | undefined;
  public teacher: Teacher | undefined;
  public isParticipate = false;
  public isAdmin = false;
  public sessionId: string;
  public userId: string;

  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private sessionService = inject(SessionService);
  private sessionApiService = inject(SessionApiService);
  private teacherService = inject(TeacherService);
  private matSnackBar = inject(MatSnackBar);
  private router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  constructor() {
    this.sessionId = this.route.snapshot.paramMap.get('id')!;
    this.isAdmin = this.sessionService.sessionInformation!.admin;
    this.userId = this.sessionService.sessionInformation!.id.toString();
  }
 public ngOnDestroy(): void {
    throw new Error('Method not implemented.');
  }

  ngOnInit(): void {
    this.fetchSession();
  }
 // Added explicit return types
  public back(): void   {
    window.history.back();
  }

   //Additon of takeUntil to avoid memory leaks
  public delete(): void {
    this.sessionApiService
      .delete(this.sessionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
          this.matSnackBar.open('Session deleted !', 'Close', { duration: 3000 });
          this.router.navigate(['sessions']);
        }
      );
  }

  //Addition of takeUntil to avoid memory leaks
  public participate(): void {
    this.sessionApiService
    .participate(this.sessionId, this.userId)
    .pipe(takeUntil(this.destroy$))
    .subscribe(_ => this.fetchSession());
  }

  //Addition of takeUntil to avoid memory leaks and removed unused parameter to avoid linting issue implicits any
  public unParticipate(): void {
    this.sessionApiService
    .unParticipate(this.sessionId, this.userId)
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => this.fetchSession());
  }

  //Addition of takeUntil to avoid memory leaks
  private fetchSession(): void {
    this.sessionApiService
      .detail(this.sessionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((session: Session) => {
        this.session = session;
        this.isParticipate = session.users.some(u => u === this.sessionService.sessionInformation!.id);
        this.teacherService
          .detail(session.teacher_id.toString())
          .pipe(takeUntil(this.destroy$))
          .subscribe((teacher: Teacher) => this.teacher = teacher);
      });
  }

}
