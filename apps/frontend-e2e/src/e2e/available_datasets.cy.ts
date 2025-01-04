describe('dataset', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000')
  })
  it('loads', () => {
    const datasetName = "Dataset A"
    const dataset = cy.get('.dataset-button').contains(datasetName).first()
    dataset.click()
    cy.get('.metadata-container', { timeout: 10000 })
    cy.get('[data-testid=dataset-name]').contains(datasetName)
  })
  it('collapses', () => {

    //Click on button to collapse available dataset
    cy.get('.collapse-button').click()

    //Get Collapsed Container
    cy.get('.datasets-container', { timeout: 5000 })
      .should('have.class', 'datasets-container')
      .should('have.class', 'collapsed')

    //Click on the button to expand available dataset
    cy.get('.collapse-button')
      .should('have.class', 'collapse-button')
      .should('have.class', 'collapsed')
      .click()

  })
})