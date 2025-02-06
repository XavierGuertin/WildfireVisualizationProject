describe('frontend-e2e', () => {
  beforeEach(() => {
    const deleteCommand =
      Cypress.platform === 'win32'
        ? 'del /f ..\\backend\\config\\app-config.json'
        : 'rm -f ../backend/config/app-config.json';

    const checkFileCommand =
      Cypress.platform === 'win32'
        ? 'if exist ..\\backend\\config\\app-config.json (echo exists) else (echo not exists)'
        : 'if [ -f ../backend/config/app-config.json ]; then echo exists; else echo not exists; fi';

    cy.exec(checkFileCommand).its('stdout').should('contain', 'exists');

    // Execute the deletion command
    cy.exec(deleteCommand);

    cy.visit('/');
  });

  it('should display "Views" on the index page', () => {
    // Check for a span element containing the text "Views"
    cy.get('span').contains('Views');
  });
});
