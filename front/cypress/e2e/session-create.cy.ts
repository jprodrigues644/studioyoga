describe('Session Creation spec', () => {
  beforeEach(() => {
    cy.fixture('sessions').as('sessionsData');
  });

  /* =====================================================
     ADMIN USER
     ===================================================== */
  describe('As Admin User', () => {
    beforeEach(function () {
      cy.intercept('POST', '/api/auth/login', {
        body: this.sessionsData.adminUser
      }).as('login');

      cy.intercept('GET', 'api/session', {
        body: this.sessionsData.sessions
      }).as('getSessions');

      cy.intercept('GET', 'api/teacher', {
        body: this.sessionsData.teachers
      }).as('getTeachers');

      cy.visit('/login');
      cy.get('input[formControlName="email"]').type('yoga@studio.com');
      cy.get('input[formControlName="password"]').type('test!1234');
      cy.get('button[type="submit"]').click();

      cy.wait('@login');
      cy.url().should('include', '/sessions');
    });

    it('should navigate to create session page', () => {
      cy.contains('button', 'Create').click();
      cy.url().should('include', '/sessions/create');
    });

    it('should display create session form with all fields', () => {
      cy.contains('button', 'Create').click();

      cy.get('h1').should('contain', 'Create session');
      cy.get('input[formControlName="name"]').should('be.visible');
      cy.get('input[formControlName="date"]').should('be.visible');
      cy.get('mat-select[formControlName="teacher_id"]').should('be.visible');
      cy.get('textarea[formControlName="description"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible').and('contain', 'Save');
    });

    it('should have Save button disabled when form is empty', () => {
      cy.contains('button', 'Create').click();
      cy.get('button[type="submit"]').should('be.disabled');
    });

    it('should enable Save button when all required fields are filled', function () {
      const newSession = this.sessionsData.newSession;

      cy.contains('button', 'Create').click();
      cy.wait('@getTeachers');

      cy.get('input[formControlName="name"]').type(newSession.name);
      cy.get('input[formControlName="date"]').type(newSession.date);

      cy.get('mat-select[formControlName="teacher_id"]').click();
      cy.get('mat-option').first().click();

      cy.get('textarea[formControlName="description"]').type(newSession.description);
      cy.get('button[type="submit"]').should('not.be.disabled');
    });

    it('should display all teachers in the select dropdown', function () {
      cy.contains('button', 'Create').click();
      cy.wait('@getTeachers');

      cy.get('mat-select[formControlName="teacher_id"]').click();
      cy.get('mat-option')
        .should('have.length', this.sessionsData.teachers.length);

      this.sessionsData.teachers.forEach((teacher) => {
        cy.contains(
          'mat-option',
          `${teacher.firstName} ${teacher.lastName}`
        ).should('exist');
      });
    });

    it('should create a new session successfully', function () {
      const newSession = this.sessionsData.newSession;

      cy.intercept('POST', 'api/session', {
        statusCode: 200,
        body: {
          id: 4,
          ...newSession,
          users: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }).as('createSession');

      cy.contains('button', 'Create').click();
      cy.wait('@getTeachers');

      cy.get('input[formControlName="name"]').type(newSession.name);
      cy.get('input[formControlName="date"]').type(newSession.date);

      cy.get('mat-select[formControlName="teacher_id"]').click();
      cy.get('mat-option').first().click();

      cy.get('textarea[formControlName="description"]').type(newSession.description);

      cy.get('button[type="submit"]').click();
      cy.wait('@createSession');

      cy.get('.mat-mdc-snack-bar-container')
        .should('contain', 'Session created !');

      cy.url().should('include', '/sessions');
    });

    it('should validate required fields', () => {
      cy.contains('button', 'Create').click();

      cy.get('input[formControlName="name"]').focus().blur();
      cy.get('button[type="submit"]').should('be.disabled');
    });

    // ✅ CORRIGÉ
    it('should navigate back to sessions list', () => {
      cy.contains('button', 'Create').click();
      cy.get('button[mat-icon-button]').click();

      cy.url().should('include', '/sessions');
    });

    it('should display error message on API failure', function () {
      const newSession = this.sessionsData.newSession;

      cy.intercept('POST', 'api/session', {
        statusCode: 500,
        body: { message: 'Internal Server Error' }
      }).as('createSessionError');

      cy.contains('button', 'Create').click();
      cy.wait('@getTeachers');

      cy.get('input[formControlName="name"]').type(newSession.name);
      cy.get('input[formControlName="date"]').type(newSession.date);

      cy.get('mat-select[formControlName="teacher_id"]').click();
      cy.get('mat-option').first().click();

      cy.get('textarea[formControlName="description"]').type(newSession.description);

      cy.get('button[type="submit"]').click();
      cy.wait('@createSessionError');

      cy.url().should('include', '/create');
    });
  });

  /* =====================================================
     REGULAR USER
     ===================================================== */
  describe('As Regular User', () => {
    beforeEach(function () {
      cy.intercept('POST', '/api/auth/login', {
        body: this.sessionsData.regularUser
      }).as('login');

      cy.intercept('GET', 'api/session', {
        body: this.sessionsData.sessions
      }).as('getSessions');

      cy.visit('/login');
      cy.get('input[formControlName="email"]').type('user@studio.com');
      cy.get('input[formControlName="password"]').type('password123');
      cy.get('button[type="submit"]').click();

      cy.wait('@login');
      cy.url().should('include', '/sessions');
    });

    it('should not see Create button', () => {
      cy.contains('button', 'Create').should('not.exist');
    });

    
  /* =====================================================
     TEACHER SELECTION
     ===================================================== */
  describe('Teacher Selection', () => {
    beforeEach(function () {
      cy.intercept('POST', '/api/auth/login', {
        body: this.sessionsData.adminUser
      }).as('login');

      cy.intercept('GET', 'api/session', {
        body: this.sessionsData.sessions
      }).as('getSessions');

      cy.intercept('GET', 'api/teacher', {
        body: this.sessionsData.teachers
      }).as('getTeachers');

      cy.visit('/login');
      cy.get('input[formControlName="email"]').type('yoga@studio.com');
      cy.get('input[formControlName="password"]').type('test!1234');
      cy.get('button[type="submit"]').click();

      cy.wait('@login');
      cy.contains('button', 'Create').click();
      cy.wait('@getTeachers');
    });

    it('should select first teacher', function () {
      const teacher = this.sessionsData.teachers[0];

      cy.get('mat-select[formControlName="teacher_id"]').click();
      cy.get('mat-option').first().click();

      cy.get('mat-select[formControlName="teacher_id"]')
        .should('contain', teacher.firstName);
    });

    it('should select second teacher', function () {
      const teacher = this.sessionsData.teachers[1];

      cy.get('mat-select[formControlName="teacher_id"]').click();
      cy.get('mat-option').last().click();

      cy.get('mat-select[formControlName="teacher_id"]')
        .should('contain', teacher.firstName);
    });
  });
});
