/* global describe, it, beforeEach, cy */

describe('Home Tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('Test create project', () => {
    // GIVEN
    let projects = cy.get('[data-cy="project_list"]').children();
    projects.should('have.length', 1);
    
    projects.first().should('have.text', 'default');

    // WHEN
    cy.get('[data-cy="project_name"]').type('test');
    cy.get('[data-cy="create_project"]').click();

    // THEN
    projects = cy.get('[data-cy="project_list"]').children();
    projects.should('have.length', 2);
    projects.first().should('have.text', 'default');
    const newProject = projects.next();
    newProject.should('have.text', 'test');

    // CLEANUP
    newProject.click({force: true});
    cy.url().should('eq', 'http://localhost:3000/projects/test');
    cy.get('[data-cy="review"]').click();
    cy.url().should('eq', 'http://localhost:3000/projects/test/details');
    cy.get('[data-cy="delete"]').click();
    cy.get('[data-cy="delete_project"]').click();
    cy.url().should('eq', 'http://localhost:3000/');
    projects = cy.get('[data-cy="project_list"]').children();
    projects.should('have.length', 1);
  });

  it('Test cancel create project', () => {
    // GIVEN
    const input = cy.get('[data-cy="project_name"]');
    input.type('test');
    input.should('have.value', 'test');

    // WHEN
    cy.get('[data-cy="cancel_create"]').click();

    // THEN
    input.should('have.value', '');
  });
})