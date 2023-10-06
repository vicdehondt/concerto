describe('Connect test', () => {
  it('Connects to server', () => {
    cy.visit('http://localhost:3000')
  })
})
describe('My First Test', () => {
  it('Visits the Kitchen Sink', () => {
    cy.visit('https://example.cypress.io')
  })
})