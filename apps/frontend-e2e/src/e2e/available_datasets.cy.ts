//Avoid failing the test when config saving doesn't work on E2E pipeline
Cypress.on('uncaught:exception', (err, runnable) => {
  console.error('Uncaught Exception:', err);
  return false;
});

describe('dataset', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
    cy.viewport(1920, 1080);

    //Factory Reset before the test to avoid issue with popup not appearing after initial load
    cy.get("[data-testid=reset-dropdown-button]").should('exist').click({force: true})
    cy.contains('button', "Factory Reset").should('exist').click({force: true})
    cy.wait(5000);
    cy.get('button.swal2-confirm').should('exist').click()
    cy.wait(2000);  //Wait for the endpoint url to pop up
  });

  it('loads', () => {

    //Retrieve input the collections url into the input field and click on save
    cy.get("#swal2-input").as("url_input");
    cy.get('@url_input').clear().type(Cypress.env("COLLECTIONS_URL"));
    cy.get('button.swal2-confirm').should('exist').click()

    //Make sure notfication of success appears
    cy.contains("div", "Collections fetched and saved successfully", {timeout: 7000}).should("be.visible")
    cy.wait(2000)

    //Assert that there are more than 0 datasets
    cy.get("[data-testid=buttons-container]").find('button').should('not.be.empty')
  });

  it('collapses', () => {

    //Retrieve input the collections url into the input field and click on save
    cy.get("#swal2-input").as("url_input");
    cy.get('@url_input').clear().type(Cypress.env("COLLECTIONS_URL"));
    cy.contains('button', 'Save').click()

    //Make sure notfication of success appears
    cy.contains("div", "Collections fetched and saved successfully", {timeout: 7000}).should("be.visible")
    cy.wait(2000)

    //Click on the collapse button and assert that it collapses
    cy.get('[data-testid=collapse-button]').should('exist').click({force: true})
    cy.get(".datasets-container").should('have.class', 'collapsed')

    //Click on the collapse button and assert that it uncollapses
    cy.get('[data-testid=collapse-button]').should('exist').click({force: true})
    cy.get(".datasets-container").should('not.have.class', 'collapsed')
  });

  it('filters by name ascending', () => {

  })

  it('filters by name descending', () => {
    
  })

  it('filters by date ascending', () => {

  })
  
  it('filters by date descending', () => {
    
  })
});
