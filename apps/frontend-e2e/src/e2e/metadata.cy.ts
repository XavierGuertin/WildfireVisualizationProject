describe('metadata', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000')
        const datasetName = "Dataset A"
        const dataset = cy.get('.dataset-button').contains(datasetName).first()
        dataset.click()
    })
    it('loads', () => {
        cy.get(".metadata-container").should('have.length', 1)
        cy.get(".metadata-container").first().should("be.visible")
    })
    it('collapses', () => {
        cy.get(".metadata-container").first().should('be.visible')

        //Click on the expanded box
        cy.get("[data-testid=city-div]").click()

        cy.get("[data-testid=collapsedMetaData]").should("be.visible")

        //Click on collapsed box
        cy.get("[data-testid=collapsedMetaData]").click()


    })
})