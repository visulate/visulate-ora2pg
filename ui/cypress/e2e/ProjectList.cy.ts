/* global describe, it, beforeEach, cy, before, after */

describe('Project List Tests', () => {
    before(() => {
      cy.visit('http://localhost:3000');
      cy.get('[data-cy="project_name"]').type('test');
      cy.get('[data-cy="create_project"]').click();
    });

    after(() => {
      cy.visit('http://localhost:3000');
      let projects = cy.get('[data-cy="project_list"]').children();
      projects.last().click({force: true});
      cy.url().should('eq', 'http://localhost:3000/projects/test');
      cy.get('[data-cy="review"]').click();
      cy.url().should('eq', 'http://localhost:3000/projects/test/details');
      cy.get('[data-cy="delete"]').click();
      cy.get('[data-cy="delete_project"]').click();
      cy.url().should('eq', 'http://localhost:3000/');
      projects = cy.get('[data-cy="project_list"]').children();
      projects.should('have.length', 1);
    });

    beforeEach(() => {
      cy.visit('http://localhost:3000');
    });

    it('Test loading projects', () => {
      // GIVEN
      // page loads

      // WHEN
      const projects = cy.get('[data-cy="project_list"]').children();

      // THEN
      projects.should('have.length', 2);
      
      projects.first().should('have.text', 'default');
      projects.next().should('have.text', 'test');
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