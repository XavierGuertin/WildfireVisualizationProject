describe('simulation', () => {
    beforeEach(() => {
      cy.visit('http://localhost:3000');
  
      //Factory Reset before the test to avoid issue with popup not appearing after initial load
      cy.get("[data-testid=reset-dropdown-button]").click()
      cy.contains('button', "Factory Reset").click({force: true})
      cy.contains('button', 'Yes', {timeout:1000}).click()
      cy.wait(2000);  //Wait for the endpoint url to pop up
  
      //Retrieve input the collections url into the input field and click on save
      cy.get("#swal2-input").as("url_input");
      cy.get('@url_input').clear().type(Cypress.env("collections_url"));
      cy.contains('button', 'Save').click()
  
      //Make sure notfication of success appears
      cy.contains("div", "Collections fetched and saved successfully", {timeout: 7000}).should("be.visible")
      cy.wait(2000)

      //Load montreal_2023 dataset
      cy.get('[data-testid=dataset-button-montreal_2023]').click()
      cy.get('[data-testid=load-dataset-button]').click()
      cy.get('button').contains('Yes').click()
    });

    it('runs properly', () => {

    })

    it('runs properly when sped up', () => {

    })

    it('runs properly when slowed down', () => {

    })

    it('displays weather assets properly', () => {
      
    })

  });
  