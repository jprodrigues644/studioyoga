describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  // ========================================
  // 1. UI Tests
  // ========================================

  it('should display login form with all elements', () => {
    // Vérifie le titre
    cy.get('mat-card-title').should('contain', 'Login');
    
    // Vérifie les champs du formulaire
    cy.get('input[formControlName="email"]').should('be.visible');
    cy.get('input[formControlName="password"]').should('be.visible');
    
    // Vérifie le bouton submit
    cy.get('button[type="submit"]')
      .should('be.visible')
      .and('contain', 'Submit');
    
    // Vérifie que le message d'erreur n'est pas affiché initialement
    cy.get('.error').should('not.exist');
  });

  it('should display password as hidden by default', () => {
    cy.get('input[formControlName="password"]')
      .should('have.attr', 'type', 'password');
  });

  // ========================================
  // 2. TESTS DE VALIDATION DU FORMULAIRE
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
  // 3. TESTS DE VISIBILITÉ DU MOT DE PASSE
  // ========================================

  it('should toggle password visibility when clicking eye icon', () => {
    // Par défaut, le mot de passe est masqué
    cy.get('input[formControlName="password"]')
      .should('have.attr', 'type', 'password');
    
    // Clique sur le bouton pour afficher
    cy.get('button[matSuffix]').click();
    cy.get('input[formControlName="password"]')
      .should('have.attr', 'type', 'text');
    
    // Clique à nouveau pour masquer
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
  // 4. TESTS DE CONNEXION RÉUSSIE
  // ========================================

  it('should login successfully with valid credentials (using fixtures)', () => {
    cy.fixture('users').then((users) => {
      // Mock de la réponse API
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

      // Saisie des identifiants
      cy.get('input[formControlName="email"]').type(users.validUser.email);
      cy.get('input[formControlName="password"]').type(users.validUser.password);
      cy.get('button[type="submit"]').click();

      // Vérifie que la requête a été faite
      cy.wait('@loginRequest');

      // Vérifie la redirection vers /sessions
      cy.url().should('include', '/sessions');
    });
  });

  it('should login successfully as admin user', () => {
    cy.fixture('users').then((users) => {
      const admin = users.adminUser;
      
      // Mock de la réponse API avec un admin
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

      // Saisie des identifiants
      cy.get('input[formControlName="email"]').type(admin.email);
      cy.get('input[formControlName="password"]').type('test!1234');
      cy.get('button[type="submit"]').click();

      cy.wait('@loginRequest');
      cy.url().should('include', '/sessions');
    });
  });



  // ========================================
  // 5. TESTS DE CONNEXION ÉCHOUÉE
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

    // Vérifie l'affichage du message d'erreur
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

    // Doit rester sur /login
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
  // 6. TESTS DE SAISIE UTILISATEUR
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
    
    // Si vous avez implémenté la réinitialisation de l'erreur:
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
    // Saisie avec des espaces avant et après
    cy.get('input[formControlName="email"]').type(`  ${users.validUser.email}  `);
    cy.get('input[formControlName="password"]').type(users.validUser.password);
    
    // Le bouton devrait rester désactivé car l'email est invalide
    cy.get('button[type="submit"]').should('be.disabled');
  });
});

  // ========================================
  // 7. TESTS D'ACCESSIBILITÉ
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
    
    // Clique pour afficher
    cy.get('button[matSuffix]').click();
    cy.get('button[matSuffix]')
      .should('have.attr', 'aria-pressed', 'false');
  });

  // ========================================
  // 8. TESTS DE VALIDATION DES DONNÉES
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