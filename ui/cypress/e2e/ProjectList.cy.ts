/* global describe, it, beforeEach, cy */

describe('Project List Tests', () => {
    beforeEach(() => {
      cy.visit('http://localhost:3000');
    });
  
    it('Test loading projects', () => {
      // GIVEN
      // page loads

      // WHEN
      const projects = cy.get('[data-cy="project_list"]').children();

      // THEN
      projects.should('have.length', 3);
      
      projects.first().should('have.text', 'default');
      projects.next().should('have.text', 'empty');
      projects.next().should('have.text', 'invalid_password');
    });

    it('Test selecting project', () => {
      // GIVEN
      cy.get('.mdl-layout__drawer-button').click();
      const projects = cy.get('[data-cy="project_list"]').children();
      
      // WHEN
      projects.first().click();

      // THEN
      cy.url().should('eq', 'http://localhost:3000/projects/default');
    });

    it('Test add project navigates back to home', () => {
      // GIVEN
      cy.get('.mdl-layout__drawer-button').click();
      const projects = cy.get('[data-cy="project_list"]').children();

      projects.first().click();
      cy.url().should('eq', 'http://localhost:3000/projects/default');

      // WHEN
      cy.get('[data-cy="add_project"]').click();

      // THEN
      cy.url().should('eq', 'http://localhost:3000/');
    });
  })