/// <reference types="cypress" />

context("Insert and Delete text", () => {
    
    it('delete all works', () => {
        cy.visit('http://localhost:3000')
        cy
        .get("#1")
        .click()
        .type("{selectAll}{backspace}")
        .should("have.text", "")
    })

    it('insert when empty works', () => {
        cy
        .get("#1")
        .click()
        .type("{selectAll}{backspace}hello")
        .should("have.text", "hello")
    })

    it('insert works', () => {
        cy
        .get('#1')
        .click()
        .type("testing")
        .should("have.text", "hellotesting")
    })

    it('delete works', () => {
        cy
        .get('#1')
        .click()
        .type("{backspace}{backspace}")
        .should("have.text", "hellotesti")
    })
})

context("Apply and remove style", () => {
    it('apply bold', () => {
        cy
        .get("#1")
        .type('{selectall}')
        .type('{meta}b', { release: false })
        
        cy
        .get('#h')
        .should('have.css', 'font-weight', '600')
    })

    it('delete bold', () => {
        cy
        .get("#1")
        .type('{selectall}')
        .type('{meta}b', { release: false })
        
        cy
        .get('#h')
        .should('have.css', 'font-weight', '400')
    })

    it('apply italic', () => {
        cy
        .get("#1")
        .type('{selectall}')
        .type('{meta}i', { release: false })
        
        cy
        .get('#h')
        .should('have.css', 'font-style', 'italic')
    })

    it('delete italic', () => {
        cy
        .get("#1")
        .type('{selectall}')
        .type('{meta}i', { release: false })
        
        cy
        .get('#h')
        .should('have.css', 'font-style', 'normal')
    })

    it('apply code', () => {
        cy
        .get("#1")
        .type('{selectall}')
        .type('{meta}e', { release: false })
        
        cy
        .get('#h')
        .should('have.css', 'background-color', 'rgba(135, 131, 120, 0.15)')
        .should('have.css', 'color', 'rgb(235, 87, 87)')
    })

    it('delete code', () => {
        cy
        .get("#1")
        .type('{selectall}')
        .type('{meta}e', { release: false })
        
        cy
        .get('#h')
        .should('have.css', 'background-color', 'rgba(0, 0, 0, 0)')
    })

    it('apply underline', () => {
        cy
        .get("#1")
        .type('{selectall}')
        .type('{meta}u', { release: false })
        
        cy
        .get('#h')
        .should('have.css', 'border-bottom', '1px solid rgb(0, 0, 0)')
    })

    it('delete underline', () => {
        cy
        .get("#1")
        .type('{selectall}')
        .type('{meta}u', { release: false })
        
        cy
        .get('#h')
        .should('have.css', 'border-bottom', '0px none rgb(0, 0, 0)')
    })
})