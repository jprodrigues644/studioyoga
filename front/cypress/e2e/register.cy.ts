describe('Register spec', () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  it('should display the register page', () => {
    cy.get('mat-card-title').should('contain', 'Register');
  });

  it('should have all form fields', () => {
    cy.get('input[formControlName="firstName"]').should('exist');
    cy.get('input[formControlName="lastName"]').should('exist');
    cy.get('input[formControlName="email"]').should('exist');
    cy.get('input[formControlName="password"]').should('exist');
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

  it('should successfully register a new user', () => {
    // Intercepter la requête API
    cy.intercept('POST', '/api/auth/register', {
      statusCode: 200,
      body: {}
    }).as('registerRequest');

    // Remplir le formulaire
    cy.get('input[formControlName="firstName"]').type('John');
    cy.get('input[formControlName="lastName"]').type('Doe');
    cy.get('input[formControlName="email"]').type('john.doe@example.com');
    cy.get('input[formControlName="password"]').type('password123');

    // Soumettre le formulaire
    cy.get('button[type="submit"]').click();

    // Vérifier que la requête a été envoyée
    cy.wait('@registerRequest').its('request.body').should('deep.equal', {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123'
    });

    // Vérifier la redirection vers la page de login
    cy.url().should('include', '/login');
  });

  it('should display error message when registration fails', () => {
    // Intercepter la requête API avec une erreur
    cy.intercept('POST', '/api/auth/register', {
      statusCode: 400,
      body: { error: 'Email already exists' }
    }).as('registerRequest');

    // Remplir le formulaire
    cy.get('input[formControlName="firstName"]').type('John');
    cy.get('input[formControlName="lastName"]').type('Doe');
    cy.get('input[formControlName="email"]').type('existing@example.com');
    cy.get('input[formControlName="password"]').type('password123');

    // Soumettre le formulaire
    cy.get('button[type="submit"]').click();

    // Vérifier que le message d'erreur s'affiche
    cy.wait('@registerRequest');
    cy.get('.error').should('be.visible').and('contain', 'An error occurred');
  });

  it('should validate email format', () => {
    cy.get('input[formControlName="firstName"]').type('John');
    cy.get('input[formControlName="lastName"]').type('Doe');
    cy.get('input[formControlName="email"]').type('invalid-email');
    cy.get('input[formControlName="password"]').type('password123');

    // Le bouton devrait rester désactivé si l'email n'est pas valide (selon vos validateurs)
    cy.get('button[type="submit"]').should('be.disabled');
  });

  it('should clear form after failed registration when user updates fields', () => {
    // Simuler une erreur
    cy.intercept('POST', '/api/auth/register', {
      statusCode: 400,
      body: { error: 'Registration failed' }
    }).as('registerRequest');

    cy.get('input[formControlName="firstName"]').type('John');
    cy.get('input[formControlName="lastName"]').type('Doe');
    cy.get('input[formControlName="email"]').type('test@example.com');
    cy.get('input[formControlName="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    cy.wait('@registerRequest');
    cy.get('.error').should('be.visible');

    // Modifier un champ devrait 
    cy.get('input[formControlName="email"]').clear().type('newemail@example.com');
    cy.get('button[type="submit"]').should('not.be.disabled');
  });

});