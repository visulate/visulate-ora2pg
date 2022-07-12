/* global describe, it, beforeEach, cy, expect */

describe('Ora2Pg Config Tests', () => {
    beforeEach(() => {
      cy.visit('http://localhost:3000');
    });
  
    it('Test run Ora2Pg', () => {
      // GIVEN
      cy.get('[data-cy="run_page"]').should('not.exist');
    
      cy.get('.mdl-layout__drawer-button').click();
      cy.get('[data-cy="project_list"]').children().first().click();
      cy.get('.mdl-layout__obfuscator').click();

      cy.get('[data-cy="dsn_enabled_ORACLE_DSN"]').check();

      cy.get('[data-cy="dsn_ORACLE_DSN"]').clear();
      cy.get('[data-cy="dsn_ORACLE_DSN"]').type('dbi:Oracle:host=testdb;sid=XE;port=1521');
      cy.get('body').click();

      cy.get('[data-cy="auth_oracle_user"]').type('system');
      cy.get('[data-cy="auth_oracle_pwd"]').type('oracle');
      cy.get('[data-cy="submit_auth"]').click();

      // WHEN
      cy.get('[data-cy="run_ora2pg"]').click();

      // THEN
      cy.get('[data-cy="run_page"]').should('be.visible');

      // CLEANUP
      sessionStorage.setItem('dbi:Oracle:host=testdb;sid=XE;port=1521', '');
    });
});