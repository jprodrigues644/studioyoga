// ***********************************************
// This example namespace declaration will help
// with Intellisense and code completion in your
// IDE or Text Editor.
// ***********************************************
// declare namespace Cypress {
//   interface Chainable<Subject = any> {
//     customCommand(param: any): typeof customCommand;
//   }
// }
//
// function customCommand(param: any): void {
//   console.warn(param);
// }
//
// NOTE: You can use it like so:
// Cypress.Commands.add('customCommand', customCommand);
//
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
/**
 * Custom Cypress Commands for Authentication and Session Management
 */

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Login as admin user
       * @example cy.loginAsAdmin()
       */
      loginAsAdmin(): Chainable<void>;

      /**
       * Login as regular user
       * @example cy.loginAsRegularUser()
       */
      loginAsRegularUser(): Chainable<void>;

      /**
       * Login with custom credentials
       * @param email - User email
       * @param password - User password
       * @param userResponse - Mock user response data
       * @example cy.loginWith('user@test.com', 'password', mockUser)
       */
      loginWith(email: string, password: string, userResponse: any): Chainable<void>;

      /**
       * Setup authenticated session without UI interaction
       * @param userType - 'admin' or 'user'
       * @example cy.setupAuthSession('admin')
       */
      setupAuthSession(userType: 'admin' | 'user'): Chainable<void>;

      /**
       * Logout from the application
       * @example cy.logout()
       */
      logout(): Chainable<void>;
    }
  }
}

/**
 * Login as admin user via UI
 */
Cypress.Commands.add('loginAsAdmin', () => {
  cy.fixture('users').then((users) => {
    const admin = users.adminUser;

    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        token: 'fake-admin-jwt-token',
        type: 'Bearer',
        id: admin.id,
        username: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        admin: true
      }
    }).as('loginRequest');

    cy.intercept('GET', '/api/session', []).as('getSessions');

    cy.visit('/login');
    cy.get('input[formControlName="email"]').type(admin.email);
    cy.get('input[formControlName="password"]').type('test!1234');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest');
    cy.url().should('include', '/sessions');
  });
});

/**
 * Login as regular user via UI
 */
Cypress.Commands.add('loginAsRegularUser', () => {
  cy.fixture('users').then((users) => {
    const user = users.validUser;

    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        token: 'fake-user-jwt-token',
        type: 'Bearer',
        id: user.id,
        username: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        admin: false
      }
    }).as('loginRequest');

    cy.intercept('GET', '/api/session', []).as('getSessions');

    cy.visit('/login');
    cy.get('input[formControlName="email"]').type(user.email);
    cy.get('input[formControlName="password"]').type(user.password);
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest');
    cy.url().should('include', '/sessions');
  });
});

/**
 * Login with custom credentials
 */
Cypress.Commands.add('loginWith', (email: string, password: string, userResponse: any) => {
  cy.intercept('POST', '/api/auth/login', {
    statusCode: 200,
    body: userResponse
  }).as('loginRequest');

  cy.intercept('GET', '/api/session', []).as('getSessions');

  cy.visit('/login');
  cy.get('input[formControlName="email"]').type(email);
  cy.get('input[formControlName="password"]').type(password);
  cy.get('button[type="submit"]').click();

  cy.wait('@loginRequest');
});

/**
 * Setup authenticated session programmatically (skip UI)
 * This is more efficient for tests that don't need to test the login flow
 */
Cypress.Commands.add('setupAuthSession', (userType: 'admin' | 'user') => {
  cy.fixture('users').then((users) => {
    const userData = userType === 'admin' ? users.adminUser : users.validUser;
    
    const sessionInfo = {
      token: `fake-${userType}-jwt-token`,
      type: 'Bearer',
      id: userData.id,
      username: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      admin: userType === 'admin'
    };

    // Store session info in sessionStorage (matching your app's behavior)
    cy.window().then((win) => {
      win.sessionStorage.setItem('sessionInformation', JSON.stringify(sessionInfo));
    });

    // Mock the API endpoints
    cy.intercept('GET', '/api/session', []).as('getSessions');
  });
});

/**
 * Logout from the application
 */
Cypress.Commands.add('logout', () => {
  cy.get('span.link').contains('Logout').click();
  cy.url().should('include', '/');
});

export {};