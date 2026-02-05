// cypress/e2e/register.cy.ts

describe('Register spec', () => {
  const interceptRegister = (statusCode: number, body: any = {}, alias = 'register') => {
    // match absolute or relative
    cy.intercept('POST', '**/api/auth/register', { statusCode, body }).as(alias);
  };

  beforeEach(() => {
    cy.visit('/register');
  });

  it('should display the register page', () => {
    cy.get('mat-card-title').should('contain', 'Register');
  });

  it('should have all form fields', () => {
    cy.get('input[formControlName="firstName"]').should('be.visible');
    cy.get('input[formControlName="lastName"]').should('be.visible');
    cy.get('input[formControlName="email"]').should('be.visible');
    cy.get('input[formControlName="password"]').should('be.visible');
  });

  it('should disable submit button when form is empty', () => {
    cy.get('button[type="submit"]').should('be.disabled');
  });

  it('should enable submit button when form is valid', () => {
    cy.get('input[formControlName="firstName"]').type('John');
    cy.get('input[formControlName="lastName"]').type('Doe');
    cy.get('input[formControlName="email"]').type('john.doe@example.com');
    cy.get('input[formControlName="password"]').type('password123');

    cy.get('button[type="submit"]').should('not.be.disabled');
  });

  it('should validate email format (keep submit disabled)', () => {
    cy.get('input[formControlName="firstName"]').type('John');
    cy.get('input[formControlName="lastName"]').type('Doe');
    cy.get('input[formControlName="email"]').type('invalid-email');
    cy.get('input[formControlName="password"]').type('password123');

    cy.get('button[type="submit"]').should('be.disabled');
  });

  it('should successfully register a new user and redirect to login', () => {
    interceptRegister(200, {}, 'registerRequest');

    cy.get('input[formControlName="firstName"]').type('John');
    cy.get('input[formControlName="lastName"]').type('Doe');
    cy.get('input[formControlName="email"]').type('john.doe@example.com');
    cy.get('input[formControlName="password"]').type('password123');

    cy.get('button[type="submit"]').click();

    cy.wait('@registerRequest')
      .its('request.body')
      .should('deep.equal', {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123'
      });

    cy.location('pathname').should('eq', '/login');
  });

  it('should display error message when registration fails (400)', () => {
    interceptRegister(400, { message: 'Email already exists' }, 'registerRequest');

    cy.get('input[formControlName="firstName"]').type('John');
    cy.get('input[formControlName="lastName"]').type('Doe');
    cy.get('input[formControlName="email"]').type('existing@example.com');
    cy.get('input[formControlName="password"]').type('password123');

    cy.get('button[type="submit"]').click();

    cy.wait('@registerRequest');

    cy.get('.error')
      .should('be.visible')
      .and('contain', 'An error occurred');

    // stays on register
    cy.location('pathname').should('eq', '/register');
  });

  it('should allow retry after a failed registration (error disappears on reload)', () => {
    // 1) fail
    interceptRegister(400, { message: 'Registration failed' }, 'registerFail');

    cy.get('input[formControlName="firstName"]').type('John');
    cy.get('input[formControlName="lastName"]').type('Doe');
    cy.get('input[formControlName="email"]').type('test@example.com');
    cy.get('input[formControlName="password"]').type('password123');

    cy.get('button[type="submit"]').click();
    cy.wait('@registerFail');

    cy.get('.error').should('be.visible');

    // 2) retry success (submit again)
    interceptRegister(200, {}, 'registerSuccess');

    // small change to re-submit (optional)
    cy.get('input[formControlName="email"]').clear().type('newemail@example.com');

    cy.get('button[type="submit"]').click();
    cy.wait('@registerSuccess');

    cy.location('pathname').should('eq', '/login');
  });
});
