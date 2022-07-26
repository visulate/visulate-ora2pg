/* global describe, it, beforeEach, cy, expect */

describe('Ora2Pg Config Tests', () => {
    beforeEach(() => {
      cy.visit('http://localhost:3000');
    });
  
    it('Test run Ora2Pg', () => {
      // GIVEN
      cy.get('[data-cy="run_page"]').should('not.exist');
    
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

      // Enter credentials
      cy.get('[data-cy="auth_oracle_user"]').type('system');
      cy.get('[data-cy="auth_oracle_pwd"]').type('oracle');
      cy.get('[data-cy="submit_auth"]').click();

      cy.intercept('/ora2pg/project/default/exec*').as('runOra2Pg');

      // WHEN
      cy.get('[data-cy="run_ora2pg"]').click();

      // THEN
      cy.get('[data-cy="run_page"]').should('be.visible');
      cy.wait('@runOra2Pg', {timeout: 300000}).then(interception => {
        expect(interception.response).not.to.be.undefined;
        expect(interception.response.body).to.contain('Created config file');
        expect(interception.response.body).to.contain('Starting ora2pg');
        expect(interception.response.body).to.contain('ora2pg complete');
        expect(interception.response.body).to.contain('Removing config file');
        expect(interception.response.body).to.contain('Creating compressed file default.tar.gz');
        expect(interception.response.body).to.contain('created file default.tar.gz');
      });

      // WHEN run it again to ensure we don't get a 409 response on save
      cy.get('[data-cy="close_run"').click();
      cy.get('[data-cy="run_ora2pg"]').click();

      // THEN
      cy.get('[data-cy="run_page"]').should('be.visible');
      cy.wait('@runOra2Pg', {timeout: 300000}).then(interception => {
        expect(interception.response).not.to.be.undefined;
        expect(interception.response.body).to.contain('Created config file');
        expect(interception.response.body).to.contain('Starting ora2pg');
        expect(interception.response.body).to.contain('ora2pg complete');
        expect(interception.response.body).to.contain('Removing config file');
        expect(interception.response.body).to.contain('Creating compressed file default.tar.gz');
        expect(interception.response.body).to.contain('created file default.tar.gz');
      });

      // CLEANUP
      sessionStorage.setItem('dbi:Oracle:host=testdb;sid=XE;port=1521', '');
    });
});