describe('dataset', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('loads', () => {
    // Find and click the dataset button
    const dataset = cy
      .get('[data-testid=dataset-button-1]', { timeout: 5000 })
      .first();
    dataset.click();
    cy.get('.metadata-container', { timeout: 10000 });
  });

  it('collapses', () => {
    // Click on button to collapse available dataset
    cy.get('.collapse-button').click({ force: true });

    // Get Collapsed Container
    cy.get('.datasets-container', { timeout: 5000 })
      .should('have.class', 'datasets-container')
      .should('have.class', 'collapsed');

    // Click on the button to expand available dataset
    cy.get('.collapse-button')
      .should('have.class', 'collapse-button')
      .should('have.class', 'collapsed')
      .click();
  });
});
