/// <reference types="cypress" />
// ./node_modules/.bin/cypress open

context("Insert and Delete text", () => {
    
    it('delete all works', () => {
        cy.visit('http://localhost:3000')
        cy
        .get("#block1")
        .click()
        .type("{selectAll}{backspace}")
        .should("have.text", "")
    })

    it('insert when empty works', () => {
        cy
        .get("#block1")
        .click()
        .type("{selectAll}{backspace}hello")
        .should("have.text", "hello")
    })

    it('insert works', () => {
        cy
        .get('#block1')
        .click()
        .type("testing")
        .should("have.text", "hellotesting")
    })

    it('insert in the middle works', () => {
        cy
        .get("#block1")
        .click()
        .type("{leftArrow}{leftArrow}x")
        .should("have.text", "hellotestixng")
    })

    it('delete works', () => {
        cy
        .get('#block1')
        .click()
        .type("{backspace}{backspace}")
        .should("have.text", "hellotestix")
    })

    it('delete in the middle works', () => {
        cy
        .get('#block1')
        .click()
        .type("{leftArrow}{leftArrow}{backspace}{backspace}")
        .should("have.text", "helloteix")
    })

    it('insert at start works', () => {
        cy
        .get('#block1')
        .click()
        .type("{home}pp")
        .should("have.text", "pphelloteix")
    })

    it('delete at start has no effect', () => {
        cy
        .get('#block1')
        .click()
        .type("{home}{backspace}")
        .should("have.text", "pphelloteix")
    })

    it('delete at start has no effect', () => {
        cy
        .get('#block1')
        .click()
        .type("{home}{backspace}")
        .should("have.text", "pphelloteix")
    })
})

context("Apply and remove style", () => {
    it('text has color', () => {
        cy
        .get("#block1")
        .should("have.css", 'color', 'rgb(222, 184, 135)')
    })

    it('apply bold', () => {
        cy
        .get("#block1")
        .type('{selectall}')
        .type('{meta+a}')
        
        cy
        .get('#h')
        .should('have.css', 'font-weight', '700')
    })

    it('delete bold', () => {
        cy
        .get("#block1")
        .type('{selectall}')
        .type('{meta+a}')
        
        cy
        .get('#h')
        .should('have.css', 'font-weight', '400')
    })

    it('apply italic', () => {
        cy
        .get("#block1")
        .type('{selectall}')
        .type('{meta+d}')
        
        cy
        .get('#h')
        .should('have.css', 'color', 'rgb(65, 105, 225)')
    })

    it('delete italic', () => {
        cy
        .get("#block1")
        .type('{selectall}')
        .type('{meta+d}')
        
        cy
        .get('#h')
        .should('have.css', 'font-style', 'normal')
    })

    it('apply code', () => {
        cy
        .get("#block1")
        .type('{selectall}')
        .type('{meta+f}')
        
        cy
        .get('#h')
        .should('have.css', 'background-color', 'rgb(87, 87, 87)')
        // .should('have.css', 'color', 'rgb(235, 87, 87)')
    })

    it('delete code', () => {
        cy
        .get("#block1")
        .type('{selectall}')
        .type('{meta+f}')
        
        cy
        .get('#h')
        .should('have.css', 'background-color', 'rgba(0, 0, 0, 0)')
    })

    it('apply underline', () => {
        cy
        .get("#block1")
        .type('{selectall}')
        .type('{meta+s}')
        
        cy
        .get('#h')
        .should('have.css', 'border-bottom', '1.59375px dotted rgb(255, 0, 0)')
    })

    it('delete underline', () => {
        cy
        .get("#block1")
        .type('{selectall}')
        .type('{meta+s}')
        
        cy
        .get('#h')
        .should('have.css', 'border-bottom', '0px none rgb(222, 184, 135)')
    })

    it('apply strikethrough', () => {
        cy
        .get("#block1")
        .type('{selectall}')
        .type('{meta+e}')
        
        cy
        .get('#h')
        .should('have.css', 'text-decoration', 'line-through solid rgb(222, 184, 135)')
    })

    it('delete strikethrough', () => {
        cy
        .get("#block1")
        .type('{selectall}')
        .type('{meta+e}')
        
        cy
        .get('#h')
        .should('have.css', 'text-decoration', 'none solid rgb(222, 184, 135)')
    })
})

context("key commands", () => {
    it('Enter has no effect', () => {
        cy
        .get("#block1")
        .click()
        .type("{enter}")
        .should("have.text", "pphelloteix" )
    })
})