/* global describe, it, beforeEach, cy */

describe('Project Details Tests', () => {
    beforeEach(() => {
      cy.visit('http://localhost:3000');
    });
  
    it('Test delete project', () => {
      // GIVEN
      cy.get('[data-cy="project_name"]').type('test');
      cy.get('[data-cy="create_project"]').click();

      cy.get('.mdl-layout__drawer-button').click();
      let projects = cy.get('[data-cy="project_list"]').children();
      projects.should('have.length', 2);
      const newProject = projects.next();
      newProject.should('have.text', 'test');

      newProject.click();
      cy.get('.mdl-layout__obfuscator').click();

      cy.url().should('eq', 'http://localhost:3000/projects/test');
      cy.get('[data-cy="review"]').click();
      cy.url().should('eq', 'http://localhost:3000/projects/test/details');

      // WHEN
      cy.get('[data-cy="delete"]').click();
      cy.get('[data-cy="delete_project"]').click();

      // THEN
      cy.url().should('eq', 'http://localhost:3000/');
      projects = cy.get('[data-cy="project_list"]').children();
      projects.should('have.length', 1);
    });
});