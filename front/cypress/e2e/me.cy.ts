describe('Me (User Profile) spec', () => {
  const interceptUser = (id: number, body: any, alias = 'getUserProfile') => {
    cy.intercept('GET', `**/api/user/${id}`, { statusCode: 200, body }).as(alias);
  };

  const interceptUserError = (id: number, statusCode: number, body: any, alias: string) => {
    cy.intercept('GET', `**/api/user/${id}`, { statusCode, body }).as(alias);
  };

  const interceptDeleteUser = (id: number, statusCode = 200, body: any = {}, alias = 'deleteUser') => {
    cy.intercept('DELETE', `**/api/user/${id}`, { statusCode, body }).as(alias);
  };

  const interceptSessions = (sessions: any[] = [], alias = 'getSessions') => {
    cy.intercept('GET', `**/api/session`, { statusCode: 200, body: sessions }).as(alias);
  };

  const loginUI = (email: string, password: string, loginBody: any) => {
    cy.intercept('POST', '/api/auth/login', { statusCode: 200, body: loginBody }).as('login');

    interceptSessions([]);

    cy.visit('/login');
    cy.get('input[formControlName="email"]').type(email);
    cy.get('input[formControlName="password"]').type(password);
    cy.get('button[type="submit"]').click();

    cy.wait('@login');
    cy.url().should('include', '/sessions');
  };

  const openMeFromAccount = (aliasToWait = '@getUserProfile') => {
    cy.get('span.link').contains('Account').click();
    cy.wait(aliasToWait);
    cy.url().should('include', '/me');
  };

  /* =====================================================
     REGULAR USER
     ===================================================== */
  describe('As Regular User', () => {
    const userId = 2;

    beforeEach(() => {
      const regularLogin = {
        token: 'jwt-token-user',
        type: 'Bearer',
        id: userId,
        username: 'john@doe.com',
        firstName: 'John',
        lastName: 'Doe',
        admin: false
      };

      loginUI('john@doe.com', 'test!1234', regularLogin);
    });

    it('should display user information correctly', () => {
      const userProfile = {
        id: userId,
        email: 'john@doe.com',
        firstName: 'John',
        lastName: 'Doe',
        admin: false,
        createdAt: '2024-01-15T10:00:00.000Z',
        updatedAt: '2024-01-20T15:30:00.000Z'
      };

      interceptUser(userId, userProfile);

      openMeFromAccount('@getUserProfile');

      cy.get('h1').should('contain', 'User information');
      cy.get('mat-card-content').should('contain', 'Name: John DOE');
      cy.get('mat-card-content').should('contain', 'Email: john@doe.com');
      cy.get('mat-card-content').should('contain', 'Create at:');
      cy.get('mat-card-content').should('contain', 'Last update:');
    });

    it('should display delete account button for regular user', () => {
      const userProfile = {
        id: userId,
        email: 'john@doe.com',
        firstName: 'John',
        lastName: 'Doe',
        admin: false,
        createdAt: '2024-01-15T10:00:00.000Z',
        updatedAt: '2024-01-20T15:30:00.000Z'
      };

      interceptUser(userId, userProfile);

      openMeFromAccount('@getUserProfile');

      cy.contains('Delete my account:').should('be.visible');
      cy.contains('button', 'Detail').should('be.visible');
    });

    it('should delete account successfully', () => {
      const userProfile = {
        id: userId,
        email: 'john@doe.com',
        firstName: 'John',
        lastName: 'Doe',
        admin: false,
        createdAt: '2024-01-15T10:00:00.000Z',
        updatedAt: '2024-01-20T15:30:00.000Z'
      };

      interceptUser(userId, userProfile);
      interceptDeleteUser(userId, 200, {});

      openMeFromAccount('@getUserProfile');

      cy.contains('button', 'Detail').click();
      cy.wait('@deleteUser');

      cy.get('.mat-mdc-snack-bar-container')
        .should('contain', 'Your account has been deleted !');

      cy.url().should('include', '/login'); 
    });

    it('should stay on /me if delete API fails', () => {
      const userProfile = {
        id: userId,
        email: 'john@doe.com',
        firstName: 'John',
        lastName: 'Doe',
        admin: false,
        createdAt: '2024-01-15T10:00:00.000Z',
        updatedAt: '2024-01-20T15:30:00.000Z'
      };

      interceptUser(userId, userProfile);
      interceptDeleteUser(userId, 500, { message: 'Internal Server Error' }, 'deleteUserError');

      openMeFromAccount('@getUserProfile');

      cy.contains('button', 'Detail').click();
      cy.wait('@deleteUserError');

      cy.location('pathname').should('eq', '/me');
    });

    it('should navigate back using back button (history)', () => {
      const userProfile = {
        id: userId,
        email: 'john@doe.com',
        firstName: 'John',
        lastName: 'Doe',
        admin: false,
        createdAt: '2024-01-15T10:00:00.000Z',
        updatedAt: '2024-01-20T15:30:00.000Z'
      };

      interceptUser(userId, userProfile);

      // go to /me via UI to ensure history is /sessions -> /me
      openMeFromAccount('@getUserProfile');

      cy.get('button[mat-icon-button]').click();
      cy.location('pathname').should('eq', '/sessions');
    });
  });

  /* =====================================================
     ADMIN USER
     ===================================================== */
  describe('As Admin User', () => {
    const adminId = 1;

    beforeEach(() => {
      const adminLogin = {
        token: 'jwt-token-admin',
        type: 'Bearer',
        id: adminId,
        username: 'admin@admin.com',
        firstName: 'Super',
        lastName: 'Admin',
        admin: true
      };

      loginUI('admin@admin.com', 'admin123', adminLogin);
    });

    it('should display admin message and hide delete section', () => {
      const adminProfile = {
        id: adminId,
        email: 'admin@admin.com',
        firstName: 'Super',
        lastName: 'Admin',
        admin: true,
        createdAt: '2024-01-01T10:00:00.000Z',
        updatedAt: '2024-01-10T15:30:00.000Z'
      };

      interceptUser(adminId, adminProfile, 'getAdminProfile');

      openMeFromAccount('@getAdminProfile');

      cy.contains('You are admin').should('be.visible');
      cy.contains('Delete my account:').should('not.exist');
      cy.contains('button', 'Detail').should('not.exist');
    });
  });

  /* =====================================================
     ERROR HANDLING
     ===================================================== */
  describe('Error Handling', () => {
    const userId = 2;

    beforeEach(() => {
      const regularLogin = {
        token: 'jwt-token-user',
        type: 'Bearer',
        id: userId,
        username: 'john@doe.com',
        firstName: 'John',
        lastName: 'Doe',
        admin: false
      };

      loginUI('john@doe.com', 'test!1234', regularLogin);
    });

    it('should handle user not found error (404)', () => {
      interceptUserError(userId, 404, { message: 'User not found' }, 'getUserError');

      openMeFromAccount('@getUserError');

      cy.location('pathname').should('eq', '/me');
    });

    it('should handle server error when fetching profile (500)', () => {
      interceptUserError(userId, 500, { message: 'Internal Server Error' }, 'getUserServerError');

      openMeFromAccount('@getUserServerError');

      cy.location('pathname').should('eq', '/me');
    });

    it('should handle unauthorized access (401)', () => {
      interceptUserError(userId, 401, { message: 'Unauthorized' }, 'getUserUnauthorized');

      openMeFromAccount('@getUserUnauthorized');

      cy.location('pathname').should('eq', '/me');
    });
  });
});
