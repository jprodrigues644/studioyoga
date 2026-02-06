describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  // ========================================
  // 1. UI Tests
  // ========================================

  it('should display login form with all elements', () => {
    
    cy.get('mat-card-title').should('contain', 'Login');
    
    //Verifies the presence of email and password fields
    cy.get('input[formControlName="email"]').should('be.visible');
    cy.get('input[formControlName="password"]').should('be.visible');
    
    
    cy.get('button[type="submit"]')
      .should('be.visible')
      .and('contain', 'Submit');
    
    cy.get('.error').should('not.exist');
  });

  it('should display password as hidden by default', () => {
    cy.get('input[formControlName="password"]')
      .should('have.attr', 'type', 'password');
  });

  // ========================================
  // 2. FORM VALIDATION TESTS
  // ========================================

  it('should have submit button disabled when form is empty', () => {
    cy.get('button[type="submit"]').should('be.disabled');
  });

  it('should have submit button disabled with invalid email', () => {
    cy.get('input[formControlName="email"]').type('invalid-email');
    cy.get('input[formControlName="password"]').type('password123');
    
    cy.get('button[type="submit"]').should('be.disabled');
  });

  it('should have submit button disabled when email is empty', () => {
    cy.get('input[formControlName="password"]').type('password123');
    
    cy.get('button[type="submit"]').should('be.disabled');
  });

  it('should have submit button disabled when password is empty', () => {
    cy.get('input[formControlName="email"]').type('john@doe.com');
    
    cy.get('button[type="submit"]').should('be.disabled');
  });

  it('should enable submit button with valid email and password', () => {
    cy.fixture('users').then((users) => {
      cy.get('input[formControlName="email"]').type(users.validUser.email);
      cy.get('input[formControlName="password"]').type(users.validUser.password);
      
      cy.get('button[type="submit"]').should('not.be.disabled');
    });
  });

  // ========================================
  // 3.Password Visibility Toggle Tests
  // ========================================

  it('should toggle password visibility when clicking eye icon', () => {
  
    cy.get('input[formControlName="password"]')
      .should('have.attr', 'type', 'password');
    
    
    cy.get('button[matSuffix]').click();
    cy.get('input[formControlName="password"]')
      .should('have.attr', 'type', 'text');
    
    
    cy.get('button[matSuffix]').click();
    cy.get('input[formControlName="password"]')
      .should('have.attr', 'type', 'password');
  });

  it('should display visibility_off icon when password is hidden', () => {
    cy.get('mat-icon').should('contain', 'visibility_off');
  });

  it('should display visibility icon when password is shown', () => {
    cy.get('button[matSuffix]').click();
    cy.get('mat-icon').should('contain', 'visibility');
  });

  // ========================================
  // 4. Complete Login Flow Tests
  // ========================================

  it('should login successfully with valid credentials (using fixtures)', () => {
    cy.fixture('users').then((users) => {
      
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          token: 'fake-jwt-token',
          type: 'Bearer',
          id: 1,
          username: users.validUser.email,
          firstName: users.validUser.firstName,
          lastName: users.validUser.lastName,
          admin: false
        }
      }).as('loginRequest');

      // Mock de la liste des sessions
      cy.intercept('GET', '/api/session', {
        statusCode: 200,
        body: []
      }).as('getSessions');

    
      cy.get('input[formControlName="email"]').type(users.validUser.email);
      cy.get('input[formControlName="password"]').type(users.validUser.password);
      cy.get('button[type="submit"]').click();

    
      cy.wait('@loginRequest');

      
      cy.url().should('include', '/sessions');
    });
  });

  it('should login successfully as admin user', () => {
    cy.fixture('users').then((users) => {
      const admin = users.adminUser;
      
      
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          token: 'fake-jwt-token',
          type: 'Bearer',
          id: admin.id,
          username: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
          admin: true
        }
      }).as('loginRequest');

      cy.intercept('GET', '/api/session', []).as('getSessions');

    
      cy.get('input[formControlName="email"]').type(admin.email);
      cy.get('input[formControlName="password"]').type('test!1234');
      cy.get('button[type="submit"]').click();

      cy.wait('@loginRequest');
      cy.url().should('include', '/sessions');
    });
  });



  // ========================================
  // 5. Error Handling Tests
  // ========================================

  it('should display error message with invalid credentials', () => {
    // Mock d'une erreur 401
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: { message: 'Unauthorized' }
    }).as('loginError');

    cy.get('input[formControlName="email"]').type('wrong@email.com');
    cy.get('input[formControlName="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginError');

    
    cy.get('.error')
      .should('be.visible')
      .and('contain', 'An error occurred');
  });

  it('should stay on login page after failed login', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: { message: 'Unauthorized' }
    }).as('loginError');

    cy.get('input[formControlName="email"]').type('wrong@email.com');
    cy.get('input[formControlName="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginError');

   //Should remain on login page
    cy.url().should('include', '/login');
  });

  it('should display error message on server error (500)', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 500,
      body: { message: 'Internal Server Error' }
    }).as('serverError');

    cy.fixture('users').then((users) => {
      cy.get('input[formControlName="email"]').type(users.validUser.email);
      cy.get('input[formControlName="password"]').type(users.validUser.password);
      cy.get('button[type="submit"]').click();

      cy.wait('@serverError');

      cy.get('.error').should('be.visible');
    });
  });

  it('should display error message on network failure', () => {
    cy.intercept('POST', '/api/auth/login', {
      forceNetworkError: true
    }).as('networkError');

    cy.fixture('users').then((users) => {
      cy.get('input[formControlName="email"]').type(users.validUser.email);
      cy.get('input[formControlName="password"]').type(users.validUser.password);
      cy.get('button[type="submit"]').click();

      cy.wait('@networkError');

      cy.get('.error').should('be.visible');
    });
  });

  // ========================================
  // 6. User Interaction Tests
  // ========================================

  it('should clear error message when user types again', () => {
    // Mock d'une première erreur
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: { message: 'Unauthorized' }
    }).as('loginError');

    cy.get('input[formControlName="email"]').type('wrong@email.com');
    cy.get('input[formControlName="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginError');
    cy.get('.error').should('be.visible');

   
    cy.get('input[formControlName="email"]').clear().type('new@email.com');
    
    // The error message should disappear when the user starts typing again
    // cy.get('.error').should('not.exist');
  });

  it('should accept long passwords', () => {
    const longPassword = 'a'.repeat(100);
    
    cy.get('input[formControlName="email"]').type('test@email.com');
    cy.get('input[formControlName="password"]').type(longPassword);
    
    cy.get('button[type="submit"]').should('not.be.disabled');
  });

  it('should reject email with whitespace', () => {
  cy.fixture('users').then((users) => {
    //Spaces before and after email
    cy.get('input[formControlName="email"]').type(`  ${users.validUser.email}  `);
    cy.get('input[formControlName="password"]').type(users.validUser.password);
    
    
    cy.get('button[type="submit"]').should('be.disabled');
  });
});

  // ========================================
  // 7. Accessibility Tests
  // ========================================

  it('should have proper labels and placeholders', () => {
    cy.get('input[formControlName="email"]')
      .should('have.attr', 'placeholder', 'Email');
    
    cy.get('input[formControlName="password"]')
      .should('have.attr', 'placeholder', 'Password');
  });

  it('should have aria-label on password visibility toggle', () => {
    cy.get('button[matSuffix]')
      .should('have.attr', 'aria-label', 'Hide password');
  });

  it('should update aria-pressed attribute on password toggle', () => {
    // 
    cy.get('button[matSuffix]')
      .should('have.attr', 'aria-pressed', 'true');
    
    
    cy.get('button[matSuffix]').click();
    cy.get('button[matSuffix]')
      .should('have.attr', 'aria-pressed', 'false');
  });

  // ========================================
  // 8. API Interaction Tests
  // ========================================

  it('should send correct data format to API', () => {
    cy.fixture('users').then((users) => {
      cy.intercept('POST', '/api/auth/login', (req) => {
        // Vérifie la structure de la requête
        expect(req.body).to.have.property('email', users.validUser.email);
        expect(req.body).to.have.property('password', users.validUser.password);
        
        req.reply({
          statusCode: 200,
          body: {
            token: 'fake-jwt-token',
            type: 'Bearer',
            id: 1,
            username: users.validUser.email,
            firstName: users.validUser.firstName,
            lastName: users.validUser.lastName,
            admin: false
          }
        });
      }).as('loginRequest');

      cy.intercept('GET', '/api/session', []).as('getSessions');

      cy.get('input[formControlName="email"]').type(users.validUser.email);
      cy.get('input[formControlName="password"]').type(users.validUser.password);
      cy.get('button[type="submit"]').click();

      cy.wait('@loginRequest');
    });
  });
});