describe('frontend-e2e', () => {
  beforeEach(() => {
    const deleteCommand =
      Cypress.platform === 'win32'
        ? 'del /f apps\\backend\\config\\app-config.json'
        : 'rm -f apps/backend/config/app-config.json';

    // Execute the deletion command
    cy.exec(deleteCommand);

    cy.visit('/');
  });

  it('should display "Views" on the index page', () => {
    // Check for a span element containing the text "Views"
    cy.get('span').contains('Views');
  });
});
