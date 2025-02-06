describe('dataset', () => {
  beforeEach(() => {

    it('debug where we are running from', () => {
      cy.exec('pwd').then((result) => {
        cy.log('Current working dir: ' + result.stdout);
      });
      cy.exec('ls -la').then((result) => {
        cy.log('Contents: ' + result.stdout);
      });
    });


    const deleteCommand =
      Cypress.platform === 'win32'
        ? 'del /f ..\\..\\backend\\config\\app-config.json'
        : 'rm -f ../../backend/config/app-config.json';

    const checkFileCommand =
      Cypress.platform === 'win32'
        ? 'if exist ..\\..\\backend\\config\\app-config.json (echo exists) else (echo not exists)'
        : 'if [ -f ../../backend/config/app-config.json ]; then echo exists; else echo not exists; fi';

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
  });

  it('loads', () => {

    it('debug where we are running from', () => {
      // Print the working directory from within Cypress
      cy.exec('pwd').then((result) => {
        cy.log('PWD: ' + result.stdout);
      });

      // List files to see what’s in that directory
      cy.exec('ls -la').then((result) => {
        cy.log('Directory listing:\n' + result.stdout);
      });
    });

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
