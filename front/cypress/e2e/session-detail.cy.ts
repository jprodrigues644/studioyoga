describe('Session Detail and Participation spec', () => {
  beforeEach(() => {
    cy.fixture('sessions').as('sessionsData');
  });

  // Helper: open detail from the list without reloading the app
  function openDetailFromList(sessionIndex: number) {
    cy.get('.item').eq(sessionIndex).within(() => {
      cy.contains('button', 'Detail').click();
    });
  }

  describe('Session Detail Display', () => {
    describe('As Admin User', () => {
      beforeEach(function () {
        cy.intercept('POST', '/api/auth/login', {
          body: this.sessionsData.adminUser
        }).as('login');

        cy.intercept('GET', '/api/session', {
          body: this.sessionsData.sessions
        }).as('getSessions');

        cy.visit('/login');
        cy.get('input[formControlName="email"]').type('admin@yoga.com');
        cy.get('input[formControlName="password"]').type('test!1234');
        cy.get('button[type="submit"]').click();

        cy.wait('@login');
        cy.url().should('include', '/sessions');
      });

      it('should navigate to session detail page', function () {
        const session = this.sessionsData.sessions[0];
        const teacher =
          this.sessionsData.teachers.find((t) => t.id === session.teacher_id) ??
          this.sessionsData.teachers[0];

        cy.intercept('GET', `/api/session/${session.id}`, { body: session }).as('getSession');
        cy.intercept('GET', `/api/teacher/${session.teacher_id}`, { body: teacher }).as('getTeacher');

        openDetailFromList(0);

        cy.wait('@getSession');
        cy.wait('@getTeacher');
        cy.url().should('include', `/sessions/detail/${session.id}`);
      });

      it('should display all session information correctly', function () {
        const session = this.sessionsData.sessions[0];
        const teacher =
          this.sessionsData.teachers.find((t) => t.id === session.teacher_id) ??
          this.sessionsData.teachers[0];

        cy.intercept('GET', `/api/session/${session.id}`, { body: session }).as('getSession');
        cy.intercept('GET', `/api/teacher/${session.teacher_id}`, { body: teacher }).as('getTeacher');

        openDetailFromList(0);

        cy.wait('@getSession');
        cy.wait('@getTeacher');

        cy.get('h1').should('contain', session.name);

        // subtitle uses uppercase pipe for lastName (template: {{ lastName | uppercase }})
        cy.get('mat-card-subtitle').should('contain', teacher.firstName);
        cy.get('mat-card-subtitle').should('contain', teacher.lastName.toUpperCase());

        cy.get('mat-card-content').should('contain', `${session.users.length} attendees`);

        const expectedDate = new Date(session.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        cy.get('mat-card-content').should('contain', expectedDate);

        cy.get('.description').should('contain', session.description);
        cy.get('.created').should('exist');
        cy.get('.updated').should('exist');
      });

      it('should display Delete button for admin', function () {
        const session = this.sessionsData.sessions[0];
        const teacher =
          this.sessionsData.teachers.find((t) => t.id === session.teacher_id) ??
          this.sessionsData.teachers[0];

        cy.intercept('GET', `/api/session/${session.id}`, { body: session }).as('getSession');
        cy.intercept('GET', `/api/teacher/${session.teacher_id}`, { body: teacher }).as('getTeacher');

        openDetailFromList(0);

        cy.wait('@getSession');
        cy.wait('@getTeacher');

        cy.contains('button', 'Delete').should('be.visible');
      });

      it('should not display participation buttons for admin', function () {
        const session = this.sessionsData.sessions[0];
        const teacher =
          this.sessionsData.teachers.find((t) => t.id === session.teacher_id) ??
          this.sessionsData.teachers[0];

        cy.intercept('GET', `/api/session/${session.id}`, { body: session }).as('getSession');
        cy.intercept('GET', `/api/teacher/${session.teacher_id}`, { body: teacher }).as('getTeacher');

        openDetailFromList(0);

        cy.wait('@getSession');
        cy.wait('@getTeacher');

        cy.contains('button', 'Participate').should('not.exist');
        cy.contains('button', 'Do not participate').should('not.exist');
      });

      it('should delete session successfully', function () {
        const session = this.sessionsData.sessions[0];
        const teacher =
          this.sessionsData.teachers.find((t) => t.id === session.teacher_id) ??
          this.sessionsData.teachers[0];

        cy.intercept('GET', `/api/session/${session.id}`, { body: session }).as('getSession');
        cy.intercept('GET', `/api/teacher/${session.teacher_id}`, { body: teacher }).as('getTeacher');

        cy.intercept('DELETE', `/api/session/${session.id}`, { statusCode: 200 }).as('deleteSession');

        cy.intercept('GET', '/api/session', {
          body: this.sessionsData.sessions.filter((s) => s.id !== session.id)
        }).as('getSessionsAfterDelete');

        openDetailFromList(0);

        cy.wait('@getSession');
        cy.wait('@getTeacher');

        cy.contains('button', 'Delete').click();
        cy.wait('@deleteSession');

        cy.get('.mat-mdc-snack-bar-container').should('contain', 'Session deleted !');

        cy.url().should('include', '/sessions');
        cy.url().should('not.include', '/detail');
      });

      it('should navigate back using back button', function () {
        const session = this.sessionsData.sessions[0];
        const teacher =
          this.sessionsData.teachers.find((t) => t.id === session.teacher_id) ??
          this.sessionsData.teachers[0];

        cy.intercept('GET', `/api/session/${session.id}`, { body: session }).as('getSession');
        cy.intercept('GET', `/api/teacher/${session.teacher_id}`, { body: teacher }).as('getTeacher');

        openDetailFromList(0);

        cy.wait('@getSession');
        cy.wait('@getTeacher');

        cy.get('button[mat-icon-button]').click();

        cy.url().should('include', '/sessions');
        cy.url().should('not.include', '/detail');
      });
    });

    describe('As Regular User', () => {
      beforeEach(function () {
        cy.intercept('POST', '/api/auth/login', {
          body: this.sessionsData.regularUser
        }).as('login');

        cy.intercept('GET', '/api/session', {
          body: this.sessionsData.sessions
        }).as('getSessions');

        cy.visit('/login');
        cy.get('input[formControlName="email"]').type('user@yoga.com');
        cy.get('input[formControlName="password"]').type('password123');
        cy.get('button[type="submit"]').click();

        cy.wait('@login');
        cy.url().should('include', '/sessions');
      });

      it('should not display Delete button for regular user', function () {
        const session = this.sessionsData.sessions[0];
        const teacher =
          this.sessionsData.teachers.find((t) => t.id === session.teacher_id) ??
          this.sessionsData.teachers[0];

        cy.intercept('GET', `/api/session/${session.id}`, { body: session }).as('getSession');
        cy.intercept('GET', `/api/teacher/${session.teacher_id}`, { body: teacher }).as('getTeacher');

        openDetailFromList(0);

        cy.wait('@getSession');
        cy.wait('@getTeacher');

        cy.contains('button', 'Delete').should('not.exist');
      });

      it('should display Participate button when user is not participating', function () {
        // JSON: regularUser.id = 2
        // sessions[2].users = [1] => user 2 NOT participating
        const session = this.sessionsData.sessions[2];
        const teacher =
          this.sessionsData.teachers.find((t) => t.id === session.teacher_id) ??
          this.sessionsData.teachers[0];

        cy.intercept('GET', `/api/session/${session.id}`, { body: session }).as('getSession');
        cy.intercept('GET', `/api/teacher/${session.teacher_id}`, { body: teacher }).as('getTeacher');

        openDetailFromList(2);

        cy.wait('@getSession');
        cy.wait('@getTeacher');

        cy.contains('button', 'Participate').should('be.visible');
        cy.contains('button', 'Do not participate').should('not.exist');
      });

      it('should display "Do not participate" button when user is already participating', function () {
        // sessions[0].users includes 2 => participating
        const session = this.sessionsData.sessions[0];
        const teacher =
          this.sessionsData.teachers.find((t) => t.id === session.teacher_id) ??
          this.sessionsData.teachers[0];

        cy.intercept('GET', `/api/session/${session.id}`, { body: session }).as('getSession');
        cy.intercept('GET', `/api/teacher/${session.teacher_id}`, { body: teacher }).as('getTeacher');

        openDetailFromList(0);

        cy.wait('@getSession');
        cy.wait('@getTeacher');

        cy.contains('button', 'Do not participate').should('be.visible');
        cy.contains('button', 'Participate').should('not.exist');
      });
    });
  });

  describe('Participation Management', () => {
    beforeEach(function () {
      cy.intercept('POST', '/api/auth/login', {
        body: this.sessionsData.regularUser
      }).as('login');

      cy.intercept('GET', '/api/session', {
        body: this.sessionsData.sessions
      }).as('getSessions');

      cy.visit('/login');
      cy.get('input[formControlName="email"]').type('user@yoga.com');
      cy.get('input[formControlName="password"]').type('password123');
      cy.get('button[type="submit"]').click();

      cy.wait('@login');
      cy.url().should('include', '/sessions');
    });

    it('should participate in a session successfully', function () {
      const session = this.sessionsData.sessions[2]; // user 2 not participating
      const userId = this.sessionsData.regularUser.id; // 2
      const teacher =
        this.sessionsData.teachers.find((t) => t.id === session.teacher_id) ??
        this.sessionsData.teachers[0];

      let calls = 0;
      cy.intercept('GET', `/api/session/${session.id}`, (req) => {
        calls += 1;
        if (calls === 1) req.reply({ body: session });
        else req.reply({ body: { ...session, users: [...session.users, userId] } });
      }).as('getSession');

      cy.intercept('GET', `/api/teacher/${session.teacher_id}`, { body: teacher }).as('getTeacher');

      cy.intercept('POST', `/api/session/${session.id}/participate/${userId}`, {
        statusCode: 200
      }).as('participate');

      // go detail via UI (no reload)
      openDetailFromList(2);

      cy.wait('@getSession');
      cy.wait('@getTeacher');

      cy.contains('button', 'Participate').should('be.visible').click();
      cy.wait('@participate');
      cy.wait('@getSession'); // fetchSession() reloads detail

      cy.contains('button', 'Do not participate').should('be.visible');
      cy.contains('button', 'Participate').should('not.exist');
    });

    it('should unparticipate from a session successfully', function () {
      const session = this.sessionsData.sessions[0]; // user 2 participating
      const userId = this.sessionsData.regularUser.id; // 2
      const teacher =
        this.sessionsData.teachers.find((t) => t.id === session.teacher_id) ??
        this.sessionsData.teachers[0];

      let calls = 0;
      cy.intercept('GET', `/api/session/${session.id}`, (req) => {
        calls += 1;
        if (calls === 1) req.reply({ body: session });
        else req.reply({ body: { ...session, users: session.users.filter((id) => id !== userId) } });
      }).as('getSession');

      cy.intercept('GET', `/api/teacher/${session.teacher_id}`, { body: teacher }).as('getTeacher');

      cy.intercept('DELETE', `/api/session/${session.id}/participate/${userId}`, {
        statusCode: 200
      }).as('unparticipate');

      openDetailFromList(0);

      cy.wait('@getSession');
      cy.wait('@getTeacher');

      cy.contains('button', 'Do not participate').should('be.visible').click();
      cy.wait('@unparticipate');
      cy.wait('@getSession'); // fetchSession() reloads detail

      cy.contains('button', 'Participate').should('be.visible');
      cy.contains('button', 'Do not participate').should('not.exist');
    });

    it('should update attendee count after participation', function () {
      const session = this.sessionsData.sessions[2];
      const userId = this.sessionsData.regularUser.id;
      const teacher =
        this.sessionsData.teachers.find((t) => t.id === session.teacher_id) ??
        this.sessionsData.teachers[0];
      const initialCount = session.users.length;

      let calls = 0;
      cy.intercept('GET', `/api/session/${session.id}`, (req) => {
        calls += 1;
        if (calls === 1) req.reply({ body: session });
        else req.reply({ body: { ...session, users: [...session.users, userId] } });
      }).as('getSession');

      cy.intercept('GET', `/api/teacher/${session.teacher_id}`, { body: teacher }).as('getTeacher');

      cy.intercept('POST', `/api/session/${session.id}/participate/${userId}`, {
        statusCode: 200
      }).as('participate');

      openDetailFromList(2);

      cy.wait('@getSession');
      cy.wait('@getTeacher');

      cy.get('mat-card-content').should('contain', `${initialCount} attendees`);

      cy.contains('button', 'Participate').click();
      cy.wait('@participate');
      cy.wait('@getSession');

      cy.get('mat-card-content').should('contain', `${initialCount + 1} attendees`);
    });

    it('should update attendee count after unparticipation', function () {
      const session = this.sessionsData.sessions[0];
      const userId = this.sessionsData.regularUser.id;
      const teacher =
        this.sessionsData.teachers.find((t) => t.id === session.teacher_id) ??
        this.sessionsData.teachers[0];
      const initialCount = session.users.length;

      let calls = 0;
      cy.intercept('GET', `/api/session/${session.id}`, (req) => {
        calls += 1;
        if (calls === 1) req.reply({ body: session });
        else req.reply({ body: { ...session, users: session.users.filter((id) => id !== userId) } });
      }).as('getSession');

      cy.intercept('GET', `/api/teacher/${session.teacher_id}`, { body: teacher }).as('getTeacher');

      cy.intercept('DELETE', `/api/session/${session.id}/participate/${userId}`, {
        statusCode: 200
      }).as('unparticipate');

      openDetailFromList(0);

      cy.wait('@getSession');
      cy.wait('@getTeacher');

      cy.get('mat-card-content').should('contain', `${initialCount} attendees`);

      cy.contains('button', 'Do not participate').click();
      cy.wait('@unparticipate');
      cy.wait('@getSession');

      cy.get('mat-card-content').should('contain', `${initialCount - 1} attendees`);
    });

    it('should handle participation API error gracefully', function () {
      const session = this.sessionsData.sessions[2];
      const userId = this.sessionsData.regularUser.id;
      const teacher =
        this.sessionsData.teachers.find((t) => t.id === session.teacher_id) ??
        this.sessionsData.teachers[0];

      cy.intercept('GET', `/api/session/${session.id}`, { body: session }).as('getSession');
      cy.intercept('GET', `/api/teacher/${session.teacher_id}`, { body: teacher }).as('getTeacher');

      cy.intercept('POST', `/api/session/${session.id}/participate/${userId}`, {
        statusCode: 500,
        body: { message: 'Internal Server Error' }
      }).as('participateError');

      openDetailFromList(2);

      cy.wait('@getSession');
      cy.wait('@getTeacher');

      cy.contains('button', 'Participate').click();
      cy.wait('@participateError');

      cy.contains('button', 'Participate').should('be.visible');
    });

    it('should handle unparticipation API error gracefully', function () {
      const session = this.sessionsData.sessions[0];
      const userId = this.sessionsData.regularUser.id;
      const teacher =
        this.sessionsData.teachers.find((t) => t.id === session.teacher_id) ??
        this.sessionsData.teachers[0];

      cy.intercept('GET', `/api/session/${session.id}`, { body: session }).as('getSession');
      cy.intercept('GET', `/api/teacher/${session.teacher_id}`, { body: teacher }).as('getTeacher');

      cy.intercept('DELETE', `/api/session/${session.id}/participate/${userId}`, {
        statusCode: 500,
        body: { message: 'Internal Server Error' }
      }).as('unparticipateError');

      openDetailFromList(0);

      cy.wait('@getSession');
      cy.wait('@getTeacher');

      cy.contains('button', 'Do not participate').click();
      cy.wait('@unparticipateError');

      cy.contains('button', 'Do not participate').should('be.visible');
    });
  });

  describe('Error Handling', () => {
    beforeEach(function () {
      cy.intercept('POST', '/api/auth/login', {
        body: this.sessionsData.regularUser
      }).as('login');

      cy.intercept('GET', '/api/session', {
        body: this.sessionsData.sessions
      }).as('getSessions');

      cy.visit('/login');
      cy.get('input[formControlName="email"]').type('user@yoga.com');
      cy.get('input[formControlName="password"]').type('password123');
      cy.get('button[type="submit"]').click();

      cy.wait('@login');
      cy.url().should('include', '/sessions');
    });

    it('should handle session not found error (simulate 404 on existing route)', function () {
      // We simulate a 404 using a REAL id, so we can navigate via UI (no reload)
      const session = this.sessionsData.sessions[0];

      cy.intercept('GET', `/api/session/${session.id}`, {
        statusCode: 404,
        body: { message: 'Session not found' }
      }).as('getSessionError');

      openDetailFromList(0);
      cy.wait('@getSessionError');

      // App behavior may vary: keep url on detail, show nothing, or redirect
      // We'll only assert we did not crash and we are still in the app
      cy.url().should('match', /\/sessions(\/detail\/\d+)?$/);
    });

    it('should handle teacher not found error', function () {
      const session = this.sessionsData.sessions[0];

      cy.intercept('GET', `/api/session/${session.id}`, {
        body: session
      }).as('getSession');

      cy.intercept('GET', `/api/teacher/${session.teacher_id}`, {
        statusCode: 404,
        body: { message: 'Teacher not found' }
      }).as('getTeacherError');

      openDetailFromList(0);
      cy.wait('@getSession');
      cy.wait('@getTeacherError');

      // Even if teacher fails, title should still show session name
      cy.get('h1').should('contain', session.name);
    });
  });
});
