// cypress/e2e/not-found.cy.ts

describe('Not Found spec', () => {
  /**
   * Helpers inspired by your Me spec
   */
  const interceptSessions = (sessions: any[] = [], alias = 'getSessions') => {
    cy.intercept('GET', `**/api/session`, { statusCode: 200, body: sessions }).as(alias);
  };

  const loginUI = (email: string, password: string, loginBody: any) => {
    cy.intercept('POST', '/api/auth/login', { statusCode: 200, body: loginBody }).as('login');

    // your app calls /api/session after login
    interceptSessions([]);

    cy.visit('/login');
    cy.get('input[formControlName="email"]').type(email);
    cy.get('input[formControlName="password"]').type(password);
    cy.get('button[type="submit"]').click();

    cy.wait('@login');
    cy.url().should('include', '/sessions');
  };

  const assertNotFoundPage = () => {
    cy.location('pathname').should('eq', '/404'); // adjust if your route is different
    cy.get('h1').should('contain', 'Page not found !');
  };

  /**
   * IMPORTANT:
   * Depending on your routing config, unknown URLs may:
   *  - render NotFoundComponent at the same URL (ex: /whatever)
   *  - OR redirect to /404
   *
   * If your app DOES NOT redirect to /404 and keeps the original URL,
   * replace assertNotFoundPage() with:
   *   cy.get('h1').should('contain', 'Page not found !');
   *   cy.location('pathname').should('include', '/some-unknown');
   */

  describe('Direct access', () => {
    it('should display not found page for unknown route', () => {
      // no need to be logged in for a 404 page
      cy.visit('/this-route-does-not-exist', { failOnStatusCode: false });

      // ✅ robust assertion: at least check the content
      cy.get('h1').should('contain', 'Page not found !');
    });

    it('should display not found page when visiting /404 directly (if route exists)', () => {
      cy.visit('/404', { failOnStatusCode: false });
      cy.get('h1').should('contain', 'Page not found !');
    });
  });

  describe('While authenticated', () => {
    beforeEach(() => {
      const regularLogin = {
        token: 'jwt-token-user',
        type: 'Bearer',
        id: 2,
        username: 'john@doe.com',
        firstName: 'John',
        lastName: 'Doe',
        admin: false
      };

      loginUI('john@doe.com', 'test!1234', regularLogin);
    });

    it('should display not found page for unknown route even when logged in', () => {
      cy.visit('/unknown-after-login', { failOnStatusCode: false });

      cy.get('h1').should('contain', 'Page not found !');
    });

    
  });
});
