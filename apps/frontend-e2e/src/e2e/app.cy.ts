describe('frontend-e2e', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display "Views" on the index page', () => {
    // Check for a span element containing the text "Views"
    cy.get('span').contains('Views');
  });
});
