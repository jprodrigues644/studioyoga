describe('Session Update spec', () => {
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
      cy.get('input[formControlName="email"]').type('admin@yoga.com');
      cy.get('input[formControlName="password"]').type('test!1234');
      cy.get('button[type="submit"]').click();

      cy.wait('@login');
      cy.url().should('include', '/sessions');
    });

    it('should navigate to update session page from Edit button', function () {
      const sessionId = this.sessionsData.sessions[0].id;

      cy.intercept('GET', `api/session/${sessionId}`, {
        body: this.sessionsData.sessions[0]
      }).as('getSession');

      cy.get('.item').first().within(() => {
        cy.contains('button', 'Edit').click();
      });

      cy.wait('@getSession');
      cy.wait('@getTeachers');

      cy.url().should('include', `/sessions/update/${sessionId}`);
    });

    it('should display update session form with pre-filled data', function () {
      const session = this.sessionsData.sessions[0];

      cy.intercept('GET', `api/session/${session.id}`, {
        body: session
      }).as('getSession');

      cy.get('.item').first().within(() => {
        cy.contains('button', 'Edit').click();
      });

      cy.wait('@getSession');
      cy.wait('@getTeachers');

      cy.get('h1').should('contain', 'Update session');
      cy.get('input[formControlName="name"]').should('have.value', session.name);
      cy.get('textarea[formControlName="description"]').should(
        'have.value',
        session.description
      );

      const expectedDate = new Date(session.date).toISOString().split('T')[0];
      cy.get('input[formControlName="date"]').should('have.value', expectedDate);

      cy.get('mat-select[formControlName="teacher_id"]')
        .should('contain', 'Margot');
    });

    it('should update session successfully', function () {
      const session = this.sessionsData.sessions[0];
      const updatedData = this.sessionsData.updatedSession;

      cy.intercept('GET', `api/session/${session.id}`, {
        body: session
      }).as('getSession');

      cy.intercept('PUT', `api/session/${session.id}`, {
        statusCode: 200,
        body: {
          ...session,
          ...updatedData
        }
      }).as('updateSession');

      cy.get('.item').first().within(() => {
        cy.contains('button', 'Edit').click();
      });

      cy.wait('@getSession');
      cy.wait('@getTeachers');

      cy.get('input[formControlName="name"]').clear().type(updatedData.name);
      cy.get('input[formControlName="date"]').clear().type(updatedData.date);

      cy.get('mat-select[formControlName="teacher_id"]').click();
      cy.get('mat-option').contains('Silvia').click();

      cy.get('textarea[formControlName="description"]')
        .clear()
        .type(updatedData.description);

      cy.get('button[type="submit"]').click();
      cy.wait('@updateSession');

      cy.get('.mat-mdc-snack-bar-container')
        .should('contain', 'Session updated !');

      cy.url().should('include', '/sessions');
      cy.url().should('not.include', '/update');
    });

    it('should validate required fields during update', function () {
      const session = this.sessionsData.sessions[0];

      cy.intercept('GET', `api/session/${session.id}`, {
        body: session
      }).as('getSession');

      cy.get('.item').first().within(() => {
        cy.contains('button', 'Edit').click();
      });

      cy.wait('@getSession');
      cy.wait('@getTeachers');

      cy.get('input[formControlName="name"]').clear();
      cy.get('textarea[formControlName="description"]').clear();

      cy.get('button[type="submit"]').should('be.disabled');
    });

    it('should handle API error during update', function () {
      const session = this.sessionsData.sessions[0];

      cy.intercept('GET', `api/session/${session.id}`, {
        body: session
      }).as('getSession');

      cy.intercept('PUT', `api/session/${session.id}`, {
        statusCode: 500,
        body: { message: 'Internal Server Error' }
      }).as('updateError');

      cy.get('.item').first().within(() => {
        cy.contains('button', 'Edit').click();
      });

      cy.wait('@getSession');
      cy.wait('@getTeachers');

      cy.get('input[formControlName="name"]').clear().type('Updated Name');
      cy.get('button[type="submit"]').click();

      cy.wait('@updateError');
      cy.url().should('include', '/update');
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
      cy.get('input[formControlName="email"]').type('user@yoga.com');
      cy.get('input[formControlName="password"]').type('password123');
      cy.get('button[type="submit"]').click();

      cy.wait('@login');
      cy.url().should('include', '/sessions');
    });

    it('should not see Edit button', () => {
      cy.get('.item').each(($item) => {
        cy.wrap($item).within(() => {
          cy.contains('button', 'Edit').should('not.exist');
        });
      });
    });

        it('should redirect to login when accessing update page directly', function () {
            const sessionId = this.sessionsData.sessions[0].id;

        cy.visit(`/sessions/update/${sessionId}`);

            cy.url().should('include', '/login');
    });
  });
});
