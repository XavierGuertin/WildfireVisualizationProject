describe('metadata', () => {
  beforeEach(() => {
    const deleteCommand =
      Cypress.platform === 'win32'
        ? 'del /f ..\\..\\..\\backend\\config\\app-config.json'
        : 'rm -f ../../../backend/config/app-config.json';

    const checkFileCommand =
      Cypress.platform === 'win32'
        ? 'if exist ..\\..\\..\\backend\\config\\app-config.json (echo exists) else (echo not exists)'
        : 'if [ -f ../../../backend/config/app-config.json ]; then echo exists; else echo not exists; fi';

    cy.exec(checkFileCommand).its('stdout').should('contain', 'exists');

    // Execute the deletion command
    cy.exec(deleteCommand);

    cy.visit('http://localhost:3000');

    // Input text into the prompt
    cy.get('#swal2-input').type(
      'https://hirondelle.crim.ca/stac/collections',
    );
    // Click the save button
    cy.get('.swal2-confirm').click();

    const dataset = cy
      .get('[data-testid=dataset-button-1]', { timeout: 5000 })
      .first();
    dataset.click();
    cy.get('.metadata-container', { timeout: 10000 });
  });
  it('loads', () => {
    cy.get('.metadata-container').should('have.length', 1);
    cy.get('.metadata-container').first().should('be.visible');
  });
  it('collapses', () => {
    cy.get('.metadata-container').first().should('be.visible');

    //Click on the expanded box
    cy.get('[data-testid=name-div]').click();

    cy.get('[data-testid=collapsedMetaData]').should('be.visible');

    //Click on collapsed box
    cy.get('[data-testid=collapsedMetaData]').click();

    cy.get('.metadata-container').first().should('be.visible');
  });
});
