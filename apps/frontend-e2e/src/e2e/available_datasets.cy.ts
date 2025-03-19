describe('dataset', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
    
  });

  it('loads', () => {

    //Factory Reset before the test to avoid issue with popup not appearing after initial load
    cy.get("[data-testid=reset-dropdown-button]").click()
    cy.contains('button', "Factory Reset").click()
    cy.contains('button', 'Yes', {timeout:1000}).click()
    cy.wait(2000);  //Wait for the endpoint url to pop up

    //Retrieve input the collections url into the input field and click on save
    cy.get("#swal2-input").as("url_input");
    cy.get('@url_input').clear().type(Cypress.env("collections_url"));
    cy.contains('button', 'Save').click()

    //Make sure notfication of success appears
    cy.contains("div", "Collections fetched and saved successfully", {timeout: 7000}).should("be.visible")
    cy.wait(2000)

    //Assert that there are more than 0 datasets
    cy.get("[data-testid=buttons-container]").find('button').should('not.be.empty')
  });

  it('collapses', () => {
    // // Click on button to collapse available dataset
    // cy.get('.collapse-button').click({ force: true });
    //
    // // Get Collapsed Container
    // cy.get('.datasets-container', { timeout: 5000 })
    //   .should('have.class', 'datasets-container')
    //   .should('have.class', 'collapsed');
    //
    // // Click on the button to expand available dataset
    // cy.get('.collapse-button')
    //   .should('have.class', 'collapse-button')
    //   .should('have.class', 'collapsed')
    //   .click();
  });
});
