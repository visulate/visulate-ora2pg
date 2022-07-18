/* global describe, it, cy, beforeEach, afterEach */

describe('Auth Dialog Tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  afterEach(() => {
    sessionStorage.setItem('dbi:Oracle:host=testdb;sid=XE;port=1521', '');
  });

  it('Test checking credentials - success', () => {
    // GIVEN
    // Navigate to default project
    cy.get('.mdl-layout__drawer-button').click();
    cy.get('[data-cy="project_list"]').children().first().click();
    cy.get('.mdl-layout__obfuscator').click();

    // Enable dsn
    cy.get('[data-cy="dsn_enabled_ORACLE_DSN"]').check();

    // Enter dsn
    cy.get('[data-cy="dsn_ORACLE_DSN"]').clear();
    cy.get('[data-cy="dsn_ORACLE_DSN"]').type('dbi:Oracle:host=testdb;sid=XE;port=1521');
    // Click away to make the auth dialog appear
    cy.get('body').click();
    cy.get('[data-cy="auth_dialog"]').should('be.visible');

    // Enter credentials
    cy.get('[data-cy="auth_oracle_user"]').type('system');
    cy.get('[data-cy="auth_oracle_pwd"]').type('oracle');

    // WHEN submit
    cy.get('[data-cy="submit_auth"]').click();

    // THEN
    cy.get('[data-cy="auth_dialog"]').should('not.exist');
  });

  it('Test checking credentials - wrong password', () => {
    // GIVEN
    // Navigate to default project
    cy.get('.mdl-layout__drawer-button').click();
    cy.get('[data-cy="project_list"]').children().first().click();
    cy.get('.mdl-layout__obfuscator').click();

    // Enable dsn
    cy.get('[data-cy="dsn_enabled_ORACLE_DSN"]').check();

    // Enter dsn
    cy.get('[data-cy="dsn_ORACLE_DSN"]').clear();
    cy.get('[data-cy="dsn_ORACLE_DSN"]').type('dbi:Oracle:host=testdb;sid=XE;port=1521');
    // Click away to make the auth dialog appear
    cy.get('body').click();
    cy.get('[data-cy="auth_dialog"]').should('be.visible');

    // Enter credentials
    cy.get('[data-cy="auth_oracle_user"]').type('system');
    cy.get('[data-cy="auth_oracle_pwd"]').type('wrongpw');

    // WHEN submit
    cy.get('[data-cy="submit_auth"]').click();

    // THEN
    cy.get('[data-cy="auth_dialog"]').should('be.visible');
    cy.get('[data-cy="oracle_credentials_error"]').should('be.visible');
    cy.get('[data-cy="oracle_credentials_error"]').should('have.text',
      'ORA-01017: invalid username/password; logon denied (DBD ERROR: OCISessionBegin)');
  });

  it('Test checking credentials - invalid dsn', () => {
    // GIVEN
    // Navigate to default project
    cy.get('.mdl-layout__drawer-button').click();
    cy.get('[data-cy="project_list"]').children().first().click();
    cy.get('.mdl-layout__obfuscator').click();

    // Enable dsn
    cy.get('[data-cy="dsn_enabled_ORACLE_DSN"]').check();

    // Enter dsn
    cy.get('[data-cy="dsn_ORACLE_DSN"]').clear();
    cy.get('[data-cy="dsn_ORACLE_DSN"]').type('dbi:oracle:host=testdb;sid=XE;port=1521');
    // Click away to make the auth dialog appear
    cy.get('body').click();
    cy.get('[data-cy="auth_dialog"]').should('be.visible');

    // Enter credentials
    cy.get('[data-cy="auth_oracle_user"]').type('system');
    cy.get('[data-cy="auth_oracle_pwd"]').type('pass');

    // WHEN submit
    cy.get('[data-cy="submit_auth"]').click();

    // THEN
    cy.get('[data-cy="auth_dialog"]').should('be.visible');
    cy.get('[data-cy="oracle_credentials_error"]').should('be.visible');
    cy.get('[data-cy="oracle_credentials_error"]').should('have.text',
      'Can\'t locate DBD/oracle.pm in @INC (you may need to install the DBD::oracle modu...');
  });
  
  it('Test form validation', () => {
    // GIVEN
    // Navigate to default project
    cy.get('.mdl-layout__drawer-button').click();
    cy.get('[data-cy="project_list"]').children().first().click();
    cy.get('.mdl-layout__obfuscator').click();

    // Enable dsn
    cy.get('[data-cy="dsn_enabled_ORACLE_DSN"]').check();

    // Enter dsn
    cy.get('[data-cy="dsn_ORACLE_DSN"]').clear();
    cy.get('[data-cy="dsn_ORACLE_DSN"]').type('dbi:oracle:host=testdb;sid=XE;port=1521');
    // Click away to make the auth dialog appear
    cy.get('body').click();
    cy.get('[data-cy="auth_dialog"]').should('be.visible');

    // WHEN submit
    cy.get('[data-cy="submit_auth"]').click();

    // THEN
    cy.get('[data-cy="auth_dialog"]').should('be.visible');
    const errors = cy.get('[data-cy="auth_validation_error"]');
    errors.should('have.length', 2)
    errors.first().should('have.text', 'ORACLE_USER is required.');
    errors.next().should('have.text', 'ORACLE_PWD is required.');
  });
});