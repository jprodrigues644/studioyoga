describe('Sessions List spec', () => {
  beforeEach(() => {
    cy.fixture('sessions').as('sessionsData');
  });

  /**
 * Login as admin user via UI
 */
Cypress.Commands.add('loginAsAdmin', () => {
  describe('As Admin', () => {
    beforeEach(function() {
      // Simuler la session admin
      cy.intercept('POST', '/api/auth/login', {
        body: this.sessionsData.adminUser
      });
      
      cy.intercept('GET', 'api/session', {
        body: this.sessionsData.sessions
      }).as('getSessions');

      cy.visit('/login');
      cy.get('input[formControlName="email"]').type('admin@yoga.com');
      cy.get('input[formControlName="password"]').type('password123');
      cy.get('button[type="submit"]').click();
      
      cy.url().should('include', '/sessions');
      cy.wait('@getSessions');
    });

    it('should display all sessions', function() {
      cy.get('.item').should('have.length', this.sessionsData.sessions.length);
    });

    it('should display session details correctly', function() {
      const session = this.sessionsData.sessions[0];
      cy.get('.item').first().within(() => {
        cy.get('mat-card-title').should('contain', session.name);
        cy.get('mat-card-subtitle').should('contain', 'February 15, 2026');
        cy.get('mat-card-content p').should('contain', session.description);
      });
    });

    it('should show Create button for admin', () => {
      cy.contains('button', 'Create').should('be.visible');
    });

    it('should show Edit button on each session for admin', () => {
      cy.get('.item').each(($item) => {
        cy.wrap($item).within(() => {
          cy.contains('button', 'Edit').should('be.visible');
        });
      });
    });

    it('should navigate to create session page', () => {
      cy.contains('button', 'Create').click();
      cy.url().should('include', '/sessions/create');
    });

    it('should navigate to session detail page', function() {
      const sessionId = this.sessionsData.sessions[0].id;
      
      cy.intercept('GET', `api/session/${sessionId}`, {
        body: this.sessionsData.sessions[0]
      });
      
      cy.intercept('GET', `api/teacher/1`, {
        body: this.sessionsData.teachers[0]
      });

      cy.get('.item').first().within(() => {
        cy.contains('button', 'Detail').click();
      });
      
      cy.url().should('include', `/sessions/detail/${sessionId}`);
    });

    it('should navigate to edit session page', function() {
      const sessionId = this.sessionsData.sessions[0].id;
      
      cy.intercept('GET', `api/session/${sessionId}`, {
        body: this.sessionsData.sessions[0]
      });
      
      cy.intercept('GET', 'api/teacher', {
        body: this.sessionsData.teachers
      });

      cy.get('.item').first().within(() => {
        cy.contains('button', 'Edit').click();
      });
      
      cy.url().should('include', `/sessions/update/${sessionId}`);
    });
  });

  describe('As Regular User', () => {
    beforeEach(function() {
      cy.intercept('POST', '/api/auth/login', {
        body: this.sessionsData.regularUser
      });
      
      cy.intercept('GET', 'api/session', {
        body: this.sessionsData.sessions
      }).as('getSessions');

      cy.visit('/login');
      cy.get('input[formControlName="email"]').type('user@yoga.com');
      cy.get('input[formControlName="password"]').type('password123');
      cy.get('button[type="submit"]').click();
      
      cy.url().should('include', '/sessions');
      cy.wait('@getSessions');
    });

    it('should not show Create button for regular user', () => {
      cy.contains('button', 'Create').should('not.exist');
    });

    it('should not show Edit button for regular user', () => {
      cy.contains('button', 'Edit').should('not.exist');
    });

    it('should only show Detail button for regular user', () => {
      cy.get('.item').each(($item) => {
        cy.wrap($item).within(() => {
          cy.contains('button', 'Detail').should('be.visible');
          cy.contains('button', 'Edit').should('not.exist');
        });
      });
    });
  });
});