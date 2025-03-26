//Avoid failing the test when config saving doesn't work on E2E pipeline
Cypress.on('uncaught:exception', (err, runnable) => {
  console.error('Uncaught Exception:', err);
  return false;
});

describe('metadata', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
    cy.viewport(1920, 1080);

    //Factory Reset before the test to avoid issue with popup not appearing after initial load
    cy.get("[data-testid=reset-dropdown-button]").click({force: true})
    cy.contains('button', "Factory Reset").click({force: true})
    cy.contains('button', 'Yes', {timeout: 20000}).should('exist').should('be.visible').click({force: true})
    cy.wait(2000);  //Wait for the endpoint url to pop up

    //Retrieve input the collections url into the input field and click on save
    cy.get("#swal2-input").as("url_input");
    cy.get('@url_input').clear().type(Cypress.env("collections_url"));
    cy.contains('button', 'Save').should('exist').click({force: true})

    //Make sure notfication of success appears
    cy.contains("div", "Collections fetched and saved successfully", {timeout: 7000}).should("be.visible")
    cy.wait(2000)
  });
  it('loads', () => {

    //Select a dataset
    cy.get('.dataset-button').first().click()

    //Check to make sure all metadata exists
    cy.get('[data-testid=dataset-description]').invoke('text').should('not.be.empty');
    cy.get('[data-testid=dataset-format]').invoke('text').should('not.be.empty');
    cy.get('[data-testid=dataset-processes]').invoke('text').should('not.be.empty');
    cy.get('[data-testid=dataset-datasource]').invoke('text').should('not.be.empty');

  });
  it('collapses', () => {

    //Select a dataset
    cy.get('.dataset-button').first().click()

    //Check if metadata container is not collapsed and click it
    cy.get('.metadata-container').should('exist')
    cy.get('[data-testid=name-div]').click()

    //Check if metadata container is collapsed and click it
    cy.get('[data-testid=collapsedMetaData]').should('exist')
    cy.get('[data-testid=collapsedMetaData]').click()

    //Check if metadata container is not collapsed
    cy.get('.metadata-container').should('exist')
  });
});
