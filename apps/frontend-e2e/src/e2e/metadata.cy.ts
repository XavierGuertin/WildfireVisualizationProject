describe('metadata', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');

    // const dataset = cy
    //   .get('[data-testid=dataset-button-1]', { timeout: 5000 })
    //   .first();
    // dataset.click();
    // cy.get('.metadata-container', { timeout: 10000 });
  });
  it('loads', () => {
    // cy.get('.metadata-container').should('have.length', 1);
    // cy.get('.metadata-container').first().should('be.visible');
  });
  it('collapses', () => {
    // cy.get('.metadata-container').first().should('be.visible');
    //
    // //Click on the expanded box
    // cy.get('[data-testid=name-div]').click();
    //
    // cy.get('[data-testid=collapsedMetaData]').should('be.visible');
    //
    // //Click on collapsed box
    // cy.get('[data-testid=collapsedMetaData]').click();
    //
    // cy.get('.metadata-container').first().should('be.visible');
  });
});
