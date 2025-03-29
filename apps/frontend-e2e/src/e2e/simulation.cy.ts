//Avoid failing the test when config saving doesn't work on E2E pipeline
Cypress.on('uncaught:exception', (err, runnable) => {
  console.error('Uncaught Exception:', err);
  return false;
});

describe('simulation', () => {
    beforeEach(() => {
      cy.visit('http://localhost:3000');
      cy.viewport(1920, 1080);
  
      //Factory Reset before the test to avoid issue with popup not appearing after initial load
      cy.get("[data-testid=reset-dropdown-button]").click({force: true})
      cy.contains('button', "Factory Reset").click({force: true})
      cy.wait(5000);
      cy.get('button.swal2-confirm').should('exist').click()
      cy.wait(2000);  //Wait for the endpoint url to pop up
  
      //Retrieve input the collections url into the input field and click on save
      cy.get("#swal2-input").as("url_input");
      cy.get('@url_input').clear().type(Cypress.env("COLLECTIONS_URL"));
      cy.get('button.swal2-confirm').should('exist').click()
  
      //Make sure notfication of success appears
      cy.contains("div", "Collections fetched and saved successfully", {timeout: 7000}).should("be.visible")
      cy.wait(2000)

      //Load montreal_2023 dataset
      cy.get('[data-testid=dataset-button-newyork_2024]').should('exist').click({force: true})
      cy.get('[data-testid=load-dataset-button]').should('exist').click({force: true})
      cy.get('button').contains('Yes').should('exist').click({force: true})
      
      cy.contains('div', 'Collection\'s items have been fetched successfully', {timeout:20000}).should('be.visible')
    });

    it('runs properly', () => {
      cy.get('div.timeMarkerThumb').then(($element) => {
        const initialPosition = $element[0].getBoundingClientRect();

        cy.get('[data-testid="play-pause-button"]').click()

        cy.wait(8000)
        
        cy.get('[data-testid="play-pause-button"]').click()

        cy.get('div.timeMarkerThumb').then(($currentElement) => {

          const currentPosition = $currentElement[0].getBoundingClientRect()

          expect(currentPosition.left).to.be.greaterThan(initialPosition.left)
        })
      })
    })

    it('runs properly when sped up', () => {
      cy.get('div.timeMarkerThumb').then(($element) => {
        const initialPosition = $element[0].getBoundingClientRect();

        cy.get('[data-testid="speed-point-1.5"]').click()

        cy.get('[data-testid="play-pause-button"]').click()

        cy.wait(8000)
        
        cy.get('[data-testid="play-pause-button"]').click()

        cy.get('div.timeMarkerThumb').then(($currentElement) => {

          const currentPosition = $currentElement[0].getBoundingClientRect()

          expect(currentPosition.left).to.be.greaterThan(initialPosition.left)
        })
      })
    })

    it('runs properly when slowed down', () => {
      cy.get('div.timeMarkerThumb').then(($element) => {
        const initialPosition = $element[0].getBoundingClientRect();

        cy.get('[data-testid="speed-point-0.5"]').click()

        cy.get('[data-testid="play-pause-button"]').click()

        cy.wait(16000)
        
        cy.get('[data-testid="play-pause-button"]').click()

        cy.get('div.timeMarkerThumb').then(($currentElement) => {

          const currentPosition = $currentElement[0].getBoundingClientRect()

          expect(currentPosition.left).to.be.greaterThan(initialPosition.left)
        })
      })
    })

    it('weather assets load properly', () => {
      cy.contains('div', 'Collection\'s assets have been fetched successfully', {timeout:60000})

      cy.get('div.weather-dropdown').should('exist')
    })

  });
  